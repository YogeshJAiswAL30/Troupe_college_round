import {
  ActivityEvent,
  Agreement,
  Delivery,
  Dispute,
  FileReference,
  Milestone,
  PaymentRecord,
  Project,
  Review,
  ReviewDecision,
  SettlementProposal,
  UserProfile,
} from '../types/fairwork';
import { computeDeliveryHash } from './crypto';
import { DomainError, transitionMilestone, TransitionContext } from './stateTransitions';

/**
 * Creates an activity audit event.
 */
export function createActivityEvent(params: {
  actor: UserProfile;
  eventType: ActivityEvent['eventType'];
  projectId: string;
  milestoneId?: string;
  details: string;
  metadata?: Record<string, unknown>;
  transactionReference?: string;
  isSimulated?: boolean;
  isOnChain?: boolean;
}): ActivityEvent {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    actorId: params.actor.id,
    actorRole: params.actor.role,
    eventType: params.eventType,
    projectId: params.projectId,
    milestoneId: params.milestoneId,
    details: params.details,
    metadata: params.metadata,
    transactionReference: params.transactionReference,
    isSimulated: params.isSimulated ?? true,
    isOnChain: params.isOnChain ?? false,
  };
}

/**
 * Freelancer submits a deliverable for a milestone.
 */
export async function submitMilestoneDelivery(params: {
  milestone: Milestone;
  project: Project;
  freelancer: UserProfile;
  notes: string;
  files: FileReference[];
  externalUrl?: string;
  existingDeliveries: Delivery[];
  activeAgreement?: Agreement;
}): Promise<{
  updatedMilestone: Milestone;
  delivery: Delivery;
  event: ActivityEvent;
}> {
  if (params.freelancer.id !== params.project.freelancerId) {
    throw new DomainError('Only the assigned freelancer can submit deliverables.', 'UNAUTHORIZED_FREELANCER');
  }

  const validStatuses: Milestone['status'][] = ['FUNDED', 'IN_PROGRESS', 'REVISION_REQUESTED'];
  if (!validStatuses.includes(params.milestone.status)) {
    throw new DomainError(
      `Cannot submit deliverable when milestone is in ${params.milestone.status} state. Milestone must be FUNDED or IN_PROGRESS.`,
      'INVALID_STATUS_FOR_SUBMISSION'
    );
  }

  const revisionNumber = (params.milestone.currentRevisionCount || 0) + 1;
  const hash = await computeDeliveryHash(params.notes, params.files, params.externalUrl);

  const delivery: Delivery = {
    id: `del_${params.milestone.id}_r${revisionNumber}`,
    milestoneId: params.milestone.id,
    revisionNumber,
    submittedBy: params.freelancer.id,
    notes: params.notes,
    files: params.files,
    externalUrl: params.externalUrl,
    timestamp: new Date().toISOString(),
    deliveryHash: hash,
  };

  const allDeliveries = [...params.existingDeliveries, delivery];

  const context: TransitionContext = {
    actorId: params.freelancer.id,
    actorRole: params.freelancer.role,
    clientId: params.project.clientId,
    freelancerId: params.project.freelancerId,
    project: params.project,
    deliveries: allDeliveries,
    activeAgreement: params.activeAgreement,
  };

  const updatedMilestone = transitionMilestone(params.milestone, 'SUBMITTED', context);

  const eventType: ActivityEvent['eventType'] =
    revisionNumber > 1 ? 'REVISED_DELIVERY_SUBMITTED' : 'DELIVERY_SUBMITTED';

  const event = createActivityEvent({
    actor: params.freelancer,
    eventType,
    projectId: params.project.id,
    milestoneId: params.milestone.id,
    details: `Deliverable revision #${revisionNumber} submitted with ${params.files.length} files. Hash: ${hash.slice(0, 16)}...`,
    metadata: { deliveryId: delivery.id, revisionNumber, deliveryHash: hash },
  });

  return { updatedMilestone, delivery, event };
}

/**
 * Client reviews a deliverable (APPROVE, REQUEST REVISION, or DISPUTE).
 */
export function reviewMilestoneDelivery(params: {
  milestone: Milestone;
  delivery: Delivery;
  project: Project;
  client: UserProfile;
  decision: ReviewDecision;
  feedback: string;
  criteriaChecklist: Array<{ criteria: string; satisfied: boolean }>;
  deliveries: Delivery[];
  activeAgreement?: Agreement;
}): {
  updatedMilestone: Milestone;
  review: Review;
  event: ActivityEvent;
} {
  if (params.client.id !== params.project.clientId) {
    throw new DomainError('Only the project client can review deliverables.', 'UNAUTHORIZED_CLIENT');
  }

  if (params.milestone.status !== 'SUBMITTED' && params.milestone.status !== 'UNDER_REVIEW') {
    throw new DomainError(
      `Cannot review milestone currently in ${params.milestone.status} state.`,
      'INVALID_STATUS_FOR_REVIEW'
    );
  }

  const review: Review = {
    id: `rev_${params.delivery.id}_${Date.now()}`,
    deliveryId: params.delivery.id,
    milestoneId: params.milestone.id,
    reviewer: params.client.id,
    decision: params.decision,
    feedback: params.feedback,
    criteriaChecklist: params.criteriaChecklist,
    timestamp: new Date().toISOString(),
  };

  const context: TransitionContext = {
    actorId: params.client.id,
    actorRole: params.client.role,
    clientId: params.project.clientId,
    freelancerId: params.project.freelancerId,
    project: params.project,
    deliveries: params.deliveries,
    activeAgreement: params.activeAgreement,
  };

  let targetStatus: Milestone['status'];
  if (params.decision === 'APPROVED') {
    targetStatus = 'APPROVED';
  } else if (params.decision === 'REVISION_REQUESTED') {
    targetStatus = 'REVISION_REQUESTED';
  } else {
    targetStatus = 'DISPUTED';
  }

  const updatedMilestone = transitionMilestone(params.milestone, targetStatus, context);

  let eventType: ActivityEvent['eventType'] = 'REVIEW_SUBMITTED';
  if (params.decision === 'APPROVED') {
    eventType = 'MILESTONE_APPROVED';
  } else if (params.decision === 'REVISION_REQUESTED') {
    eventType = 'REVISION_REQUESTED';
  } else if (params.decision === 'DISPUTED') {
    eventType = 'DISPUTE_OPENED';
  }

  const event = createActivityEvent({
    actor: params.client,
    eventType,
    projectId: params.project.id,
    milestoneId: params.milestone.id,
    details: `Client decision: ${params.decision}. Feedback: "${params.feedback.slice(0, 60)}..."`,
    metadata: { reviewId: review.id, decision: params.decision },
  });

  return { updatedMilestone, review, event };
}

/**
 * Client releases funds from escrow to freelancer.
 * Rule 3: Cannot release twice.
 * Rule 4: Cannot ordinary-release a disputed milestone.
 */
export function releaseMilestonePayment(params: {
  milestone: Milestone;
  project: Project;
  client: UserProfile;
  deliveries: Delivery[];
  activeAgreement?: Agreement;
}): {
  updatedMilestone: Milestone;
  paymentRecord: PaymentRecord;
  event: ActivityEvent;
} {
  if (params.client.id !== params.project.clientId) {
    throw new DomainError('Only the client can release escrow funds for this milestone.', 'UNAUTHORIZED_RELEASE');
  }

  const context: TransitionContext = {
    actorId: params.client.id,
    actorRole: params.client.role,
    clientId: params.project.clientId,
    freelancerId: params.project.freelancerId,
    project: params.project,
    deliveries: params.deliveries,
    activeAgreement: params.activeAgreement,
  };

  const updatedMilestone = transitionMilestone(params.milestone, 'RELEASED', context);

  const refId = `sim_tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const paymentRecord: PaymentRecord = {
    id: `pay_${params.milestone.id}_release`,
    projectId: params.project.id,
    milestoneId: params.milestone.id,
    type: 'ESCROW_RELEASE',
    amountMinor: params.milestone.amountMinor,
    currency: params.project.currency,
    status: 'COMPLETED',
    reference: refId,
    isSimulated: true, // Clearly disclosed prototype simulated payment
    payerId: params.project.clientId,
    recipientId: params.project.freelancerId,
    timestamp: new Date().toISOString(),
  };

  const event = createActivityEvent({
    actor: params.client,
    eventType: 'PAYMENT_RELEASED',
    projectId: params.project.id,
    milestoneId: params.milestone.id,
    details: `Simulated escrow payout of ${params.milestone.amountMinor / 100} ${params.project.currency} released to freelancer.`,
    transactionReference: refId,
    metadata: { isSimulated: true, paymentId: paymentRecord.id },
  });

  return { updatedMilestone, paymentRecord, event };
}

/**
 * Settles a dispute through mutual settlement or arbitration.
 */
export function executeDisputeSettlement(params: {
  dispute: Dispute;
  milestone: Milestone;
  project: Project;
  actor: UserProfile;
  proposal: SettlementProposal;
}): {
  updatedMilestone: Milestone;
  updatedDispute: Dispute;
  payments: PaymentRecord[];
  events: ActivityEvent[];
} {
  // Check proposal amounts match milestone total
  const total = proposalTotalMinor(params.proposal);
  if (total !== params.milestone.amountMinor) {
    throw new DomainError(
      `Dispute settlement amounts must sum exactly to milestone escrow amount (${params.milestone.amountMinor} minor units). Received ${total}.`,
      'INVALID_SETTLEMENT_AMOUNTS'
    );
  }

  if (!params.proposal.acceptedByClient || !params.proposal.acceptedByFreelancer) {
    throw new DomainError(
      'Mutual settlement requires acceptance from both the client and the freelancer.',
      'SETTLEMENT_NOT_MUTUALLY_ACCEPTED'
    );
  }

  const now = new Date().toISOString();
  const updatedMilestone: Milestone = {
    ...params.milestone,
    status: 'RESOLVED',
    updatedAt: now,
  };

  const updatedDispute: Dispute = {
    ...params.dispute,
    settlementProposal: params.proposal,
    status: 'RESOLVED_BY_MUTUAL',
    resolvedAt: now,
    resolutionSummary: `Mutual settlement executed: Freelancer payout ${params.proposal.freelancerAmountMinor}, Client refund ${params.proposal.clientRefundMinor}`,
  };

  const payments: PaymentRecord[] = [];
  const events: ActivityEvent[] = [];

  if (params.proposal.freelancerAmountMinor > 0) {
    const payRef = `sim_dispute_pay_${Date.now()}`;
    payments.push({
      id: `pay_${params.milestone.id}_freelancer_payout`,
      projectId: params.project.id,
      milestoneId: params.milestone.id,
      type: 'DISPUTE_PAYOUT',
      amountMinor: params.proposal.freelancerAmountMinor,
      currency: params.project.currency,
      status: 'COMPLETED',
      reference: payRef,
      isSimulated: true,
      payerId: params.project.clientId,
      recipientId: params.project.freelancerId,
      timestamp: now,
    });
  }

  if (params.proposal.clientRefundMinor > 0) {
    const refRef = `sim_dispute_ref_${Date.now()}`;
    payments.push({
      id: `pay_${params.milestone.id}_client_refund`,
      projectId: params.project.id,
      milestoneId: params.milestone.id,
      type: 'REFUND',
      amountMinor: params.proposal.clientRefundMinor,
      currency: params.project.currency,
      status: 'COMPLETED',
      reference: refRef,
      isSimulated: true,
      payerId: params.project.freelancerId,
      recipientId: params.project.clientId,
      timestamp: now,
    });
  }

  events.push(createActivityEvent({
    actor: params.actor,
    eventType: 'DISPUTE_RESOLVED',
    projectId: params.project.id,
    milestoneId: params.milestone.id,
    details: `Dispute mutually resolved. Payouts processed via simulated escrow.`,
  }));

  return { updatedMilestone, updatedDispute, payments, events };
}

function proposalTotalMinor(p: SettlementProposal): number {
  return p.freelancerAmountMinor + p.clientRefundMinor;
}
