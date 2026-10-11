/**
 * Fairwork Core Domain Models and Types
 * Verifiable freelance agreement and milestone-payment platform.
 * Workflow: AGREEMENT -> DELIVERABLE -> DECISION -> PAYMENT
 */

export type Currency = 'USD' | 'EUR' | 'GBP' | 'USDC' | 'INR';

export type UserRole = 'CLIENT' | 'FREELANCER' | 'ADMIN' | 'ARBITRATOR';

export type VerificationStatus = 
  | 'UNVERIFIED' 
  | 'EMAIL_VERIFIED' 
  | 'ID_VERIFIED' 
  | 'VERIFIED_PRO';

export interface UserProfile {
  id: string;
  displayName: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  email: string;
  bio?: string;
  skills?: string[];
  reputationScore: number; // 0 - 100
  createdAt: string;
}

export type ProjectStatus = 
  | 'DRAFT'
  | 'AGREEMENT_PENDING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'CANCELLED';

export interface Project {
  id: string;
  title: string;
  description: string;
  clientId: string;
  freelancerId: string;
  currency: Currency;
  totalBudgetMinor: number; // Stored in integer minor units (e.g. cents: 500000 = $5,000.00)
  startDate?: string;
  targetCompletionDate?: string;
  status: ProjectStatus;
  activeAgreementId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Milestone Lifecycle State Machine
 */
export type MilestoneStatus =
  | 'DRAFT'                // Initial creation, awaiting agreement lock
  | 'AGREED'               // Both parties signed agreement; milestone scope locked
  | 'AWAITING_FUNDING'     // Up next; client needs to deposit into escrow
  | 'FUNDED'               // Escrow funded by client; ready to commence
  | 'IN_PROGRESS'          // Freelancer actively working
  | 'SUBMITTED'            // Deliverable submitted by freelancer
  | 'UNDER_REVIEW'         // Client currently reviewing work
  | 'REVISION_REQUESTED'   // Client asked for revision within revision policy
  | 'APPROVED'             // Client accepted deliverable; ready for payment release
  | 'RELEASED'             // Escrow paid out to freelancer (Terminal success)
  | 'DISPUTED'             // Escalated to dispute resolution
  | 'RESOLVED'             // Dispute resolved via settlement or arbitration
  | 'CANCELLED';           // Milestone cancelled (pre-funding or mutually agreed)

export interface RevisionPolicy {
  maxRevisions: number;
  reviewPeriodDays: number;
  gracePeriodDays: number;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  amountMinor: number; // Stored in integer minor units
  deadline: string;
  acceptanceCriteria: string[]; // Verifiable criteria checklist
  reviewPeriodDays: number;
  revisionPolicy: RevisionPolicy;
  currentRevisionCount: number;
  status: MilestoneStatus;
  fundedAt?: string;
  submittedAt?: string;
  approvedAt?: string;
  releasedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgreementStructuredTerms {
  scopeSummary: string;
  deliverablesSummary: string;
  intellectualPropertyClause: 'ON_PAYMENT' | 'UPON_CREATION' | 'CUSTOM';
  confidentiality: boolean;
  governingLaw?: string;
  customClauses?: Array<{ title: string; content: string }>;
}

export interface AgreementPartyAcceptance {
  acceptedAt: string;
  signatureHash?: string;
}

export interface Agreement {
  id: string;
  projectId: string;
  versionNumber: number;
  structuredTerms: AgreementStructuredTerms;
  proposedBy: string; // userId
  acceptedBy: Record<string, AgreementPartyAcceptance>; // key: userId -> acceptance info
  isActive: boolean; // True ONLY if both client and freelancer have accepted
  agreementHash?: string; // SHA-256 fingerprint of the agreement terms
  createdAt: string;
}

export interface FileReference {
  name: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
  sha256Hash: string; // File integrity hash
  isSimulated: boolean; // Clear disclosure: true for demo uploads
}

export interface Delivery {
  id: string;
  milestoneId: string;
  revisionNumber: number;
  submittedBy: string; // userId of freelancer
  notes: string;
  files: FileReference[];
  externalUrl?: string;
  timestamp: string;
  deliveryHash?: string; // SHA-256 snapshot of notes + files + timestamp
}

export type ReviewDecision = 'APPROVED' | 'REVISION_REQUESTED' | 'DISPUTED';

export interface CriteriaChecklistItem {
  criteria: string;
  satisfied: boolean;
}

export interface Review {
  id: string;
  deliveryId: string;
  milestoneId: string;
  reviewer: string; // userId of client
  decision: ReviewDecision;
  feedback: string;
  criteriaChecklist: CriteriaChecklistItem[];
  timestamp: string;
}

export type PaymentType = 
  | 'ESCROW_DEPOSIT' 
  | 'ESCROW_RELEASE' 
  | 'REFUND' 
  | 'DISPUTE_PAYOUT';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface PaymentRecord {
  id: string;
  projectId: string;
  milestoneId?: string;
  type: PaymentType;
  amountMinor: number;
  currency: Currency;
  status: PaymentStatus;
  reference: string; // Unique transaction/reference ID
  isSimulated: boolean; // MANDATORY: Explicitly marks prototype simulated escrow transactions
  payerId: string;
  recipientId: string;
  timestamp: string;
  paymentMethod?: string; // UPI, NET_BANKING, DEBIT_CARD, CREDIT_CARD, TESTNET_WEB3
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
}

export type DisputeStatus = 
  | 'OPEN'
  | 'EVIDENCE_SUBMITTED'
  | 'SETTLEMENT_PROPOSED'
  | 'RESOLVED_BY_MUTUAL'
  | 'RESOLVED_BY_ARBITRATOR'
  | 'REJECTED';

export interface EvidenceReference {
  id: string;
  title: string;
  urlOrContent: string;
  sha256Hash?: string;
  submittedBy: string;
  timestamp: string;
}

export interface DisputeMessage {
  id: string;
  authorId: string;
  message: string;
  timestamp: string;
}

export interface SettlementProposal {
  proposedBy: string;
  freelancerAmountMinor: number;
  clientRefundMinor: number;
  proposalNotes: string;
  acceptedByClient: boolean;
  acceptedByFreelancer: boolean;
}

export interface Dispute {
  id: string;
  milestoneId: string;
  projectId: string;
  initiatorId: string; // userId
  reason: string;
  evidenceReferences: EvidenceReference[];
  responses: DisputeMessage[];
  settlementProposal?: SettlementProposal;
  status: DisputeStatus;
  resolvedAt?: string;
  resolutionSummary?: string;
  createdAt: string;
}

export type ActivityEventType =
  | 'PROJECT_CREATED'
  | 'AGREEMENT_PROPOSED'
  | 'AGREEMENT_ACCEPTED'
  | 'AGREEMENT_VERSIONED'
  | 'MILESTONE_CREATED'
  | 'MILESTONE_FUNDED'
  | 'WORK_STARTED'
  | 'DELIVERY_SUBMITTED'
  | 'REVISION_REQUESTED'
  | 'REVISED_DELIVERY_SUBMITTED'
  | 'REVIEW_SUBMITTED'
  | 'MILESTONE_APPROVED'
  | 'PAYMENT_RELEASED'
  | 'DISPUTE_OPENED'
  | 'EVIDENCE_ADDED'
  | 'SETTLEMENT_PROPOSED'
  | 'SETTLEMENT_ACCEPTED'
  | 'DISPUTE_RESOLVED';

export interface ActivityEvent {
  id: string;
  timestamp: string;
  actorId: string;
  actorRole: UserRole;
  eventType: ActivityEventType;
  projectId: string;
  milestoneId?: string;
  details: string;
  metadata?: Record<string, unknown>;
  transactionReference?: string;
  isSimulated?: boolean;
  isOnChain?: boolean;
}
