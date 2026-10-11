import {
  Agreement,
  AgreementStructuredTerms,
  Delivery,
  Milestone,
  MilestoneStatus,
  Project,
  UserRole,
} from '../types/fairwork';
import { computeAgreementHash } from './crypto';

export class DomainError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}

/**
 * Valid allowed transitions mapping for Milestone lifecycle.
 */
export const ALLOWED_MILESTONE_TRANSITIONS: Record<MilestoneStatus, MilestoneStatus[]> = {
  DRAFT: ['AGREED', 'CANCELLED'],
  AGREED: ['AWAITING_FUNDING', 'CANCELLED'],
  AWAITING_FUNDING: ['FUNDED', 'CANCELLED'],
  FUNDED: ['IN_PROGRESS', 'SUBMITTED', 'DISPUTED', 'CANCELLED'],
  IN_PROGRESS: ['SUBMITTED', 'DISPUTED'],
  SUBMITTED: ['UNDER_REVIEW', 'APPROVED', 'REVISION_REQUESTED', 'DISPUTED'],
  UNDER_REVIEW: ['APPROVED', 'REVISION_REQUESTED', 'DISPUTED'],
  REVISION_REQUESTED: ['IN_PROGRESS', 'SUBMITTED', 'DISPUTED'],
  APPROVED: ['RELEASED', 'DISPUTED'], // Ready for payment release
  RELEASED: [], // Terminal success: Released escrow cannot transition further
  DISPUTED: ['RESOLVED'], // Must go through dispute resolution, ordinary release is blocked
  RESOLVED: [], // Terminal resolved: Final settlement executed
  CANCELLED: [], // Terminal cancelled
};

/**
 * Context required to validate milestone state changes.
 */
export interface TransitionContext {
  actorId: string;
  actorRole: UserRole;
  clientId: string;
  freelancerId: string;
  project: Project;
  deliveries: Delivery[];
  activeAgreement?: Agreement;
}

/**
 * Validates whether a requested transition is allowed and enforces participant permissions.
 */
export function validateMilestoneTransition(
  milestone: Milestone,
  targetStatus: MilestoneStatus,
  context: TransitionContext
): { allowed: boolean; reason?: string } {
  const currentStatus = milestone.status;

  // Rule 2: A milestone cannot be approved before a delivery is submitted
  if (targetStatus === 'APPROVED') {
    const milestoneDeliveries = context.deliveries.filter(d => d.milestoneId === milestone.id);
    if (milestoneDeliveries.length === 0) {
      return {
        allowed: false,
        reason: 'A milestone cannot be approved before a deliverable is submitted.',
      };
    }
  }

  // Rule 3: A released milestone cannot be released twice
  if (currentStatus === 'RELEASED') {
    return {
      allowed: false,
      reason: 'A released milestone cannot be released twice. Payout has already concluded.',
    };
  }

  // Rule 4: A disputed milestone cannot use ordinary release
  if (currentStatus === 'DISPUTED' && targetStatus === 'RELEASED') {
    return {
      allowed: false,
      reason: 'A disputed milestone cannot use ordinary release. It must be settled via the dispute resolution process.',
    };
  }

  // General state machine matrix check
  const allowedNext = ALLOWED_MILESTONE_TRANSITIONS[currentStatus] ?? [];
  if (!allowedNext.includes(targetStatus)) {
    return {
      allowed: false,
      reason: `Illegal state transition from ${currentStatus} to ${targetStatus}.`,
    };
  }

  // Rule 5: Only the correct participant can perform each action
  const { actorId, clientId, freelancerId } = context;

  switch (targetStatus) {
    case 'AGREED':
      // Agreement must be active before locking milestone into agreed
      if (!context.activeAgreement?.isActive) {
        return {
          allowed: false,
          reason: 'Agreement must be accepted by both client and freelancer before milestone can be AGREED.',
        };
      }
      break;

    case 'FUNDED':
      if (actorId !== clientId) {
        return {
          allowed: false,
          reason: 'Only the client can deposit escrow funds for this milestone.',
        };
      }
      break;

    case 'IN_PROGRESS':
      if (actorId !== freelancerId && currentStatus !== 'FUNDED') {
        return {
          allowed: false,
          reason: 'Only the freelancer can start progress on this milestone.',
        };
      }
      break;

    case 'SUBMITTED':
      if (actorId !== freelancerId) {
        return {
          allowed: false,
          reason: 'Only the assigned freelancer can submit deliverables for this milestone.',
        };
      }
      break;

    case 'UNDER_REVIEW':
    case 'REVISION_REQUESTED':
      if (actorId !== clientId) {
        return {
          allowed: false,
          reason: 'Only the client can review deliverables or request revisions.',
        };
      }
      break;

    case 'APPROVED':
      // Rule 5: Only client can approve
      if (actorId !== clientId) {
        return {
          allowed: false,
          reason: 'Only the client can approve milestone deliverables.',
        };
      }
      // Rule 2: A milestone cannot be approved before a delivery is submitted
      const milestoneDeliveries = context.deliveries.filter(d => d.milestoneId === milestone.id);
      if (milestoneDeliveries.length === 0) {
        return {
          allowed: false,
          reason: 'A milestone cannot be approved before a deliverable is submitted.',
        };
      }
      break;

    case 'RELEASED':
      // Ordinary release can only be triggered by the client
      if (actorId !== clientId) {
        return {
          allowed: false,
          reason: 'Only the client can release escrow payment upon milestone completion.',
        };
      }
      // Must be approved first
      if (currentStatus !== 'APPROVED') {
        return {
          allowed: false,
          reason: 'Milestone must be APPROVED before escrow funds can be released.',
        };
      }
      break;

    case 'DISPUTED':
      // Either participant can initiate a dispute
      if (actorId !== clientId && actorId !== freelancerId) {
        return {
          allowed: false,
          reason: 'Only the direct project participants (client or freelancer) can raise a dispute.',
        };
      }
      break;

    default:
      break;
  }

  return { allowed: true };
}

/**
 * Transitions milestone to new status after checking all domain rules.
 */
export function transitionMilestone(
  milestone: Milestone,
  targetStatus: MilestoneStatus,
  context: TransitionContext
): Milestone {
  const check = validateMilestoneTransition(milestone, targetStatus, context);
  if (!check.allowed) {
    throw new DomainError(check.reason ?? 'Transition not allowed', 'INVALID_TRANSITION');
  }

  const now = new Date().toISOString();
  const updated: Milestone = {
    ...milestone,
    status: targetStatus,
    updatedAt: now,
  };

  if (targetStatus === 'FUNDED') updated.fundedAt = now;
  if (targetStatus === 'SUBMITTED') updated.submittedAt = now;
  if (targetStatus === 'APPROVED') updated.approvedAt = now;
  if (targetStatus === 'RELEASED') updated.releasedAt = now;
  if (targetStatus === 'REVISION_REQUESTED') {
    updated.currentRevisionCount = (milestone.currentRevisionCount || 0) + 1;
  }

  return updated;
}

/**
 * Rule 6: Agreement becomes active only after required parties accept it.
 */
export function checkAgreementIsActive(
  agreement: Agreement,
  clientId: string,
  freelancerId: string
): boolean {
  const clientAccepted = Boolean(agreement.acceptedBy[clientId]);
  const freelancerAccepted = Boolean(agreement.acceptedBy[freelancerId]);
  return clientAccepted && freelancerAccepted;
}

/**
 * Accepts an agreement on behalf of a participant.
 */
export function acceptAgreement(
  agreement: Agreement,
  userId: string,
  clientId: string,
  freelancerId: string,
  signatureHash?: string
): Agreement {
  if (userId !== clientId && userId !== freelancerId) {
    throw new DomainError('Only the assigned client or freelancer can accept this agreement.', 'UNAUTHORIZED_SIGNER');
  }

  const updatedAcceptedBy = {
    ...agreement.acceptedBy,
    [userId]: {
      acceptedAt: new Date().toISOString(),
      signatureHash: signatureHash ?? `sig_${userId.slice(0, 8)}_${Date.now()}`,
    },
  };

  const isActive = Boolean(updatedAcceptedBy[clientId]) && Boolean(updatedAcceptedBy[freelancerId]);

  return {
    ...agreement,
    acceptedBy: updatedAcceptedBy,
    isActive,
  };
}

/**
 * Rule 7: Changes to important accepted terms create a new version and require renewed acceptance.
 */
export async function createAgreementRevision(
  currentAgreement: Agreement,
  newTerms: AgreementStructuredTerms,
  proposingUserId: string
): Promise<Agreement> {
  const newVersion = currentAgreement.versionNumber + 1;
  const hash = await computeAgreementHash(newTerms, newVersion);
  const now = new Date().toISOString();

  // The proposing party automatically accepts the version they created;
  // counter-party acceptance is cleared and must be renewed!
  return {
    id: `agr_${currentAgreement.projectId}_v${newVersion}`,
    projectId: currentAgreement.projectId,
    versionNumber: newVersion,
    structuredTerms: newTerms,
    proposedBy: proposingUserId,
    acceptedBy: {
      [proposingUserId]: {
        acceptedAt: now,
        signatureHash: `sig_${proposingUserId.slice(0, 8)}_${Date.now()}`,
      },
    },
    isActive: false, // Inactive until the other party accepts renewed terms
    agreementHash: hash,
    createdAt: now,
  };
}
