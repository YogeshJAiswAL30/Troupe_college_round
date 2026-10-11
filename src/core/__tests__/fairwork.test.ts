import { describe, it, expect } from 'vitest';
import {
  Agreement,
  AgreementStructuredTerms,
  Milestone,
  Project,
  UserProfile,
} from '../../types/fairwork';
import {
  formatMoney,
  toMinorUnits,
  validateProjectBudget,
  deriveProjectFinancials,
} from '../money';
import {
  computeAgreementHash,
  computeDeliveryHash,
} from '../crypto';
import {
  acceptAgreement,
  checkAgreementIsActive,
  createAgreementRevision,
  transitionMilestone,
  validateMilestoneTransition,
  TransitionContext,
  DomainError,
} from '../stateTransitions';
import {
  submitMilestoneDelivery,
  reviewMilestoneDelivery,
  releaseMilestonePayment,
  executeDisputeSettlement,
} from '../workflow';

// Seed Fixtures
const mockClient: UserProfile = {
  id: 'usr_client_001',
  displayName: 'Alice Client',
  role: 'CLIENT',
  verificationStatus: 'ID_VERIFIED',
  email: 'alice@client.corp',
  reputationScore: 98,
  createdAt: '2026-01-01T00:00:00Z',
};

const mockFreelancer: UserProfile = {
  id: 'usr_free_002',
  displayName: 'Bob Dev',
  role: 'FREELANCER',
  verificationStatus: 'VERIFIED_PRO',
  email: 'bob@freelancer.dev',
  reputationScore: 99,
  createdAt: '2026-01-02T00:00:00Z',
};

const mockProject: Project = {
  id: 'prj_001',
  title: 'Fairwork Protocol MVP Web App',
  description: 'Verifiable freelance milestone platform prototype',
  clientId: mockClient.id,
  freelancerId: mockFreelancer.id,
  currency: 'USD',
  totalBudgetMinor: 500000, // $5,000.00 in cents
  status: 'ACTIVE',
  createdAt: '2026-02-01T00:00:00Z',
  updatedAt: '2026-02-01T00:00:00Z',
};

const mockInitialTerms: AgreementStructuredTerms = {
  scopeSummary: 'Develop frontend, state machine, and tests for Fairwork MVP.',
  deliverablesSummary: 'Source code in GitHub, verified state transitions, test suite.',
  intellectualPropertyClause: 'ON_PAYMENT',
  confidentiality: true,
  governingLaw: 'Delaware, USA',
};

const mockAgreement: Agreement = {
  id: 'agr_prj_001_v1',
  projectId: mockProject.id,
  versionNumber: 1,
  structuredTerms: mockInitialTerms,
  proposedBy: mockClient.id,
  acceptedBy: {
    [mockClient.id]: { acceptedAt: '2026-02-01T10:00:00Z' },
    [mockFreelancer.id]: { acceptedAt: '2026-02-01T11:00:00Z' },
  },
  isActive: true,
  agreementHash: 'sha256_mock_hash_v1',
  createdAt: '2026-02-01T10:00:00Z',
};

const mockMilestone1: Milestone = {
  id: 'ms_01',
  projectId: mockProject.id,
  title: 'Architecture & Core State Machine',
  description: 'Design data models, state transitions, and tests.',
  amountMinor: 200000, // $2,000.00
  deadline: '2026-03-01T00:00:00Z',
  acceptanceCriteria: ['Pass 100% of state transition unit tests', 'Document architecture'],
  reviewPeriodDays: 5,
  revisionPolicy: { maxRevisions: 2, reviewPeriodDays: 5, gracePeriodDays: 2 },
  currentRevisionCount: 0,
  status: 'FUNDED',
  createdAt: '2026-02-01T10:00:00Z',
  updatedAt: '2026-02-01T10:00:00Z',
};

const mockMilestone2: Milestone = {
  id: 'ms_02',
  projectId: mockProject.id,
  title: 'UI Dashboard & Dispute Handling',
  description: 'Interactive dashboard with role toggle and simulated escrow.',
  amountMinor: 300000, // $3,000.00
  deadline: '2026-03-15T00:00:00Z',
  acceptanceCriteria: ['Working prototype UI', 'Clearly labeled simulated payments'],
  reviewPeriodDays: 5,
  revisionPolicy: { maxRevisions: 2, reviewPeriodDays: 5, gracePeriodDays: 2 },
  currentRevisionCount: 0,
  status: 'AWAITING_FUNDING',
  createdAt: '2026-02-01T10:00:00Z',
  updatedAt: '2026-02-01T10:00:00Z',
};

describe('Fairwork Core Architecture & Rule Verification', () => {

  // Rule 1: Milestone amounts must add up exactly to the project budget
  describe('Rule 1: Budget Exact Match', () => {
    it('validates matching budget ($5,000.00)', () => {
      const result = validateProjectBudget(mockProject.totalBudgetMinor, [mockMilestone1, mockMilestone2]);
      expect(result.isValid).toBe(true);
      expect(result.differenceMinor).toBe(0);
    });

    it('rejects underallocated milestones', () => {
      const result = validateProjectBudget(mockProject.totalBudgetMinor, [mockMilestone1]);
      expect(result.isValid).toBe(false);
      expect(result.differenceMinor).toBe(300000);
      expect(result.message).toContain('Underallocated');
    });

    it('rejects overallocated milestones', () => {
      const overMilestone: Milestone = { ...mockMilestone2, amountMinor: 400000 };
      const result = validateProjectBudget(mockProject.totalBudgetMinor, [mockMilestone1, overMilestone]);
      expect(result.isValid).toBe(false);
      expect(result.differenceMinor).toBe(-100000);
      expect(result.message).toContain('Overallocated');
    });
  });

  // Rule 2: A milestone cannot be approved before a delivery is submitted
  describe('Rule 2: Cannot Approve Before Delivery', () => {
    it('rejects approving a milestone with 0 submitted deliveries', () => {
      const context: TransitionContext = {
        actorId: mockClient.id,
        actorRole: mockClient.role,
        clientId: mockClient.id,
        freelancerId: mockFreelancer.id,
        project: mockProject,
        deliveries: [], // NO deliveries
        activeAgreement: mockAgreement,
      };

      const check = validateMilestoneTransition(mockMilestone1, 'APPROVED', context);
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain('A milestone cannot be approved before a deliverable is submitted');

      expect(() => {
        transitionMilestone(mockMilestone1, 'APPROVED', context);
      }).toThrowError(DomainError);
    });
  });

  // Rule 3: A released milestone cannot be released twice
  describe('Rule 3: Released Milestone Cannot Be Released Twice', () => {
    it('prevents double-release on a RELEASED milestone', () => {
      const releasedMilestone: Milestone = {
        ...mockMilestone1,
        status: 'RELEASED',
        releasedAt: '2026-02-15T00:00:00Z',
      };

      const context: TransitionContext = {
        actorId: mockClient.id,
        actorRole: mockClient.role,
        clientId: mockClient.id,
        freelancerId: mockFreelancer.id,
        project: mockProject,
        deliveries: [],
        activeAgreement: mockAgreement,
      };

      const check = validateMilestoneTransition(releasedMilestone, 'RELEASED', context);
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain('A released milestone cannot be released twice');

      expect(() => {
        transitionMilestone(releasedMilestone, 'RELEASED', context);
      }).toThrowError(DomainError);
    });
  });

  // Rule 4: A disputed milestone cannot use ordinary release
  describe('Rule 4: Disputed Milestone Ordinary Release Blocked', () => {
    it('blocks normal release when milestone is in DISPUTED state', () => {
      const disputedMilestone: Milestone = {
        ...mockMilestone1,
        status: 'DISPUTED',
      };

      const context: TransitionContext = {
        actorId: mockClient.id,
        actorRole: mockClient.role,
        clientId: mockClient.id,
        freelancerId: mockFreelancer.id,
        project: mockProject,
        deliveries: [],
        activeAgreement: mockAgreement,
      };

      const check = validateMilestoneTransition(disputedMilestone, 'RELEASED', context);
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain('disputed milestone cannot use ordinary release');
    });
  });

  // Rule 5: Only the correct participant can perform each action
  describe('Rule 5: Role and Participant Permissions Enforcement', () => {
    it('prevents freelancer from funding escrow', () => {
      const context: TransitionContext = {
        actorId: mockFreelancer.id, // Freelancer trying to fund
        actorRole: mockFreelancer.role,
        clientId: mockClient.id,
        freelancerId: mockFreelancer.id,
        project: mockProject,
        deliveries: [],
      };

      const check = validateMilestoneTransition(mockMilestone2, 'FUNDED', context);
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain('Only the client can deposit escrow');
    });

    it('prevents client from submitting deliverables', async () => {
      await expect(
        submitMilestoneDelivery({
          milestone: mockMilestone1,
          project: mockProject,
          freelancer: mockClient as unknown as UserProfile, // Client masquerading
          notes: 'Attempted client submission',
          files: [],
          existingDeliveries: [],
        })
      ).rejects.toThrowError('Only the assigned freelancer can submit deliverables');
    });

    it('prevents freelancer from releasing payments to themselves', () => {
      expect(() => {
        releaseMilestonePayment({
          milestone: { ...mockMilestone1, status: 'APPROVED' },
          project: mockProject,
          client: mockFreelancer as unknown as UserProfile, // Freelancer trying to release
          deliveries: [],
        });
      }).toThrowError('Only the client can release escrow funds');
    });
  });

  // Rule 6: Agreement becomes active only after required parties accept it
  describe('Rule 6: Agreement Dual-Party Acceptance', () => {
    it('is inactive if only client has accepted', () => {
      const oneSidedAgreement: Agreement = {
        ...mockAgreement,
        acceptedBy: {
          [mockClient.id]: { acceptedAt: '2026-02-01T10:00:00Z' },
        },
        isActive: false,
      };

      expect(checkAgreementIsActive(oneSidedAgreement, mockClient.id, mockFreelancer.id)).toBe(false);
    });

    it('becomes active once both parties sign', () => {
      const oneSidedAgreement: Agreement = {
        ...mockAgreement,
        acceptedBy: {
          [mockClient.id]: { acceptedAt: '2026-02-01T10:00:00Z' },
        },
        isActive: false,
      };

      const updated = acceptAgreement(
        oneSidedAgreement,
        mockFreelancer.id,
        mockClient.id,
        mockFreelancer.id
      );

      expect(updated.isActive).toBe(true);
      expect(updated.acceptedBy[mockFreelancer.id]).toBeDefined();
    });
  });

  // Rule 7: Changes to important accepted terms create a new version and require renewed acceptance
  describe('Rule 7: Agreement Versioning and Renewal of Consent', () => {
    it('creates incremented version with reset counter-party acceptance', async () => {
      const revisedTerms: AgreementStructuredTerms = {
        ...mockInitialTerms,
        scopeSummary: 'Expanded scope including automated regression tests and documentation.',
      };

      const v2 = await createAgreementRevision(mockAgreement, revisedTerms, mockClient.id);

      expect(v2.versionNumber).toBe(2);
      expect(v2.isActive).toBe(false); // False because freelancer must renew consent!
      expect(v2.acceptedBy[mockClient.id]).toBeDefined();
      expect(v2.acceptedBy[mockFreelancer.id]).toBeUndefined(); // Reset!
      expect(v2.agreementHash).toBeDefined();
    });
  });

  // Rule 8: Money calculations use integer minor units
  describe('Rule 8: Integer Minor Units & Formatting', () => {
    it('formats cents correctly to USD string', () => {
      expect(formatMoney(500000, 'USD')).toBe('$5,000.00');
      expect(formatMoney(1999, 'USD')).toBe('$19.99');
      expect(formatMoney(0, 'USD')).toBe('$0.00');
    });

    it('converts decimal safely to minor units without float roundoff errors', () => {
      expect(toMinorUnits('129.99')).toBe(12999);
      expect(toMinorUnits(500.05)).toBe(50005);
    });
  });

  // Rule 9: Derive totals from single source of truth
  describe('Rule 9: Derived Financials Source of Truth', () => {
    it('accurately derives escrow and budget breakdowns', () => {
      const milestones: Milestone[] = [
        mockMilestone1, // FUNDED: $2,000
        mockMilestone2, // AWAITING_FUNDING: $3,000
      ];

      const financials = deriveProjectFinancials(mockProject, milestones);
      expect(financials.totalBudgetMinor).toBe(500000);
      expect(financials.allocatedMinor).toBe(500000);
      expect(financials.unallocatedMinor).toBe(0);
      expect(financials.fundedInEscrowMinor).toBe(200000);
      expect(financials.releasedMinor).toBe(0);
      expect(financials.isBudgetBalanced).toBe(true);
    });
  });

  // Verifiable Cryptographic Hashing
  describe('Cryptographic Provenance & Fingerprinting', () => {
    it('produces deterministic SHA-256 agreement and deliverable hashes', async () => {
      const hash1 = await computeAgreementHash(mockInitialTerms, 1);
      const hash2 = await computeAgreementHash(mockInitialTerms, 1);
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBeGreaterThan(16);

      const delHash = await computeDeliveryHash('Completed milestone notes', [
        {
          name: 'app.ts',
          url: 'mock://app.ts',
          sizeBytes: 1024,
          mimeType: 'text/plain',
          sha256Hash: 'mock_hash',
          isSimulated: true,
        },
      ]);
      expect(delHash).toBeDefined();
    });
  });

  // End-to-End Core Workflow: Agreement -> Deliverable -> Review -> Release
  describe('Core Central Workflow Lifecycle', () => {
    it('executes full happy path cleanly', async () => {
      // 1. Deliverable submission by freelancer
      const { updatedMilestone: submittedMs, delivery } = await submitMilestoneDelivery({
        milestone: mockMilestone1,
        project: mockProject,
        freelancer: mockFreelancer,
        notes: 'Initial deliverables complete with all test files.',
        files: [
          {
            name: 'fairwork_core.ts',
            url: 'mock://files/fairwork_core.ts',
            sizeBytes: 15420,
            mimeType: 'text/typescript',
            sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            isSimulated: true,
          },
        ],
        existingDeliveries: [],
      });

      expect(submittedMs.status).toBe('SUBMITTED');
      expect(delivery.deliveryHash).toBeDefined();

      // 2. Client review and approval
      const { updatedMilestone: approvedMs, review } = reviewMilestoneDelivery({
        milestone: submittedMs,
        delivery,
        project: mockProject,
        client: mockClient,
        decision: 'APPROVED',
        feedback: 'Code passes all quality benchmarks.',
        criteriaChecklist: [
          { criteria: 'Pass 100% of state transition unit tests', satisfied: true },
          { criteria: 'Document architecture', satisfied: true },
        ],
        deliveries: [delivery],
      });

      expect(approvedMs.status).toBe('APPROVED');
      expect(review.decision).toBe('APPROVED');

      // 3. Client releases payment from escrow
      const { updatedMilestone: releasedMs, paymentRecord } = releaseMilestonePayment({
        milestone: approvedMs,
        project: mockProject,
        client: mockClient,
        deliveries: [delivery],
      });

      expect(releasedMs.status).toBe('RELEASED');
      expect(paymentRecord.isSimulated).toBe(true);
      expect(paymentRecord.type).toBe('ESCROW_RELEASE');
      expect(paymentRecord.amountMinor).toBe(mockMilestone1.amountMinor);
    });
  });

  // Dispute Settlement
  describe('Dispute Resolution Workflow', () => {
    it('executes mutual settlement with split payout', () => {
      const disputedMilestone: Milestone = {
        ...mockMilestone1,
        status: 'DISPUTED',
      };

      const proposal = {
        proposedBy: mockClient.id,
        freelancerAmountMinor: 150000, // $1,500.00
        clientRefundMinor: 50000,      // $500.00
        proposalNotes: 'Agreed partial payout for completed components.',
        acceptedByClient: true,
        acceptedByFreelancer: true,
      };

      const { updatedMilestone, payments } = executeDisputeSettlement({
        dispute: {
          id: 'dsp_001',
          milestoneId: disputedMilestone.id,
          projectId: mockProject.id,
          initiatorId: mockClient.id,
          reason: 'Timeline delay',
          evidenceReferences: [],
          responses: [],
          status: 'OPEN',
          createdAt: '2026-02-10T00:00:00Z',
        },
        milestone: disputedMilestone,
        project: mockProject,
        actor: mockClient,
        proposal,
      });

      expect(updatedMilestone.status).toBe('RESOLVED');
      expect(payments.length).toBe(2);
      expect(payments[0].amountMinor).toBe(150000);
      expect(payments[0].recipientId).toBe(mockFreelancer.id);
      expect(payments[1].amountMinor).toBe(50000);
      expect(payments[1].recipientId).toBe(mockClient.id);
    });
  });
});
