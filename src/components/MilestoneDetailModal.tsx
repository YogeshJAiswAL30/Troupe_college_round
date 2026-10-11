import React from 'react';
import {
  X,
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  Upload,
  Eye,
  CreditCard,
  Scale,
  ShieldCheck,
  AlertTriangle,
  History,
  Fingerprint,
} from 'lucide-react';
import {
  Milestone,
  Project,
  Delivery,
  Review,
  PaymentRecord,
  Agreement,
  UserProfile,
  ActivityEvent,
} from '../types/fairwork';
import { formatMoney } from '../core/money';
import { StatusBadge } from './ui/StatusBadge';
import { Button } from './ui/Button';

interface MilestoneDetailModalProps {
  milestone: Milestone;
  project: Project;
  agreement: Agreement;
  currentUser: UserProfile;
  deliveries: Delivery[];
  reviews: Review[];
  payments: PaymentRecord[];
  events: ActivityEvent[];
  isOpen: boolean;
  onClose: () => void;
  onFundEscrow: (m: Milestone) => void;
  onSubmitDeliverable: (m: Milestone) => void;
  onReviewDeliverable: (m: Milestone, d: Delivery) => void;
  onReleasePayment: (m: Milestone) => void;
  onOpenDispute: (m: Milestone) => void;
}

export const MilestoneDetailModal: React.FC<MilestoneDetailModalProps> = ({
  milestone,
  project,
  agreement,
  currentUser,
  deliveries,
  reviews,
  payments,
  events,
  isOpen,
  onClose,
  onFundEscrow,
  onSubmitDeliverable,
  onReviewDeliverable,
  onReleasePayment,
  onOpenDispute,
}) => {
  if (!isOpen) return null;

  const isClient = currentUser.id === project.clientId;
  const isFreelancer = currentUser.id === project.freelancerId;

  const milestoneDeliveries = deliveries.filter((d) => d.milestoneId === milestone.id);
  const latestDelivery = milestoneDeliveries[milestoneDeliveries.length - 1];
  const milestoneReviews = reviews.filter((r) => r.milestoneId === milestone.id);
  const milestonePayments = payments.filter((p) => p.milestoneId === milestone.id);
  const milestoneEvents = events.filter((e) => e.milestoneId === milestone.id);

  // Disabled reasons
  const canFund = isClient && milestone.status === 'AWAITING_FUNDING';
  const fundDisabledReason = !isClient
    ? 'Only the client can deposit escrow funds'
    : milestone.status !== 'AWAITING_FUNDING'
    ? 'Escrow already funded or milestone is closed'
    : '';

  const canSubmit =
    isFreelancer &&
    (milestone.status === 'FUNDED' ||
      milestone.status === 'IN_PROGRESS' ||
      milestone.status === 'REVISION_REQUESTED');
  const submitDisabledReason = !isFreelancer
    ? 'Only the assigned freelancer can submit deliverables'
    : milestone.status === 'AWAITING_FUNDING'
    ? 'Escrow is not yet funded; do not begin work until funds are deposited'
    : milestone.status === 'SUBMITTED'
    ? 'Deliverable already submitted and awaiting client review'
    : milestone.status === 'RELEASED'
    ? 'Milestone completed and released'
    : '';

  const canReview =
    isClient &&
    (milestone.status === 'SUBMITTED' || milestone.status === 'UNDER_REVIEW') &&
    Boolean(latestDelivery);
  const reviewDisabledReason = !isClient
    ? 'Only the client can review deliverables'
    : !latestDelivery
    ? 'No deliverable has been submitted for review yet'
    : '';

  const canRelease = isClient && milestone.status === 'APPROVED';
  const releaseDisabledReason = !isClient
    ? 'Only the client can release payment from escrow'
    : milestone.status === 'RELEASED'
    ? 'Payment already released (Double release locked by Rule 3)'
    : milestone.status === 'DISPUTED'
    ? 'Dispute locks ordinary release (Rule 4)'
    : milestone.status !== 'APPROVED'
    ? 'Approval requires a submitted deliverable (Rule 2)'
    : '';

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1917]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-[#E5DFD5] shadow-xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#EFECE6]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={milestone.status} size="sm" />
              <span className="text-xs font-mono font-bold text-[#1C1917]">
                {formatMoney(milestone.amountMinor, project.currency)}
              </span>
              <span className="text-xs text-[#8A837A]">
                &bull; Due {milestone.deadline}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#1C1917] truncate">
              {milestone.title}
            </h2>
            <p className="text-xs text-[#605A53] mt-0.5">
              Project: {project.title} &bull; Agreement v{agreement.versionNumber}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8A837A] hover:text-[#1C1917] hover:bg-[#FAF7F2] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Milestone Description */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-[#8A837A] uppercase tracking-wider block">
            Milestone Scope &amp; Deliverables
          </span>
          <p className="text-xs text-[#1C1917] leading-relaxed p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5]">
            {milestone.description}
          </p>
        </div>

        {/* Acceptance Criteria Checklist (Relationship #2) */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[#8A837A] uppercase tracking-wider block">
            Verifiable Acceptance Criteria ({milestone.acceptanceCriteria.length})
          </span>
          <div className="space-y-1.5">
            {milestone.acceptanceCriteria.map((crit, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-[#E5DFD5] bg-white text-xs flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-[#FAF7F2] text-[#264235] border border-[#E5DFD5] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-[#1C1917] leading-snug">{crit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deliverable Submission History (Relationship #3) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8A837A] uppercase tracking-wider block">
              Deliverable Submissions ({milestoneDeliveries.length})
            </span>
            <span className="text-[11px] text-[#8A837A]">
              Revisions used: {milestone.currentRevisionCount ?? 0} of {milestone.revisionPolicy?.maxRevisions ?? 2}
            </span>
          </div>

          {milestoneDeliveries.length === 0 ? (
            <div className="p-3 text-center text-xs text-[#8A837A] bg-[#FAF7F2] rounded-xl border border-[#E5DFD5]">
              No deliverable submissions recorded yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {milestoneDeliveries.map((del) => (
                <div
                  key={del.id}
                  className="p-3.5 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2] text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1C1917] flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-[#264235]" />
                      Revision #{del.revisionNumber}
                    </span>
                    <span className="text-[11px] font-mono text-[#8A837A]">
                      {new Date(del.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[#605A53] italic bg-white p-2.5 rounded-lg border border-[#E5DFD5]">
                    &ldquo;{del.notes}&rdquo;
                  </p>
                  {del.files.map((f, fIdx) => (
                    <div
                      key={fIdx}
                      className="p-2 rounded-lg bg-white border border-[#E5DFD5] flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-[#264235]" />
                        <span className="font-medium text-[#1C1917] truncate">{f.name}</span>
                        <span className="text-[#8A837A] font-mono">
                          ({(f.sizeBytes / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <code className="text-[#8A837A] font-mono shrink-0 ml-2">
                        {f.sha256Hash.slice(0, 16)}...
                      </code>
                    </div>
                  ))}
                  {del.externalUrl && (
                    <div className="pt-1 text-[11px] text-[#264235]">
                      External Repository / Demo:{' '}
                      <a
                        href={del.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold underline"
                      >
                        {del.externalUrl} &rarr;
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review History (Relationship #4) */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[#8A837A] uppercase tracking-wider block">
            Client Review History ({milestoneReviews.length})
          </span>
          {milestoneReviews.length === 0 ? (
            <div className="p-3 text-center text-xs text-[#8A837A] bg-[#FAF7F2] rounded-xl border border-[#E5DFD5]">
              No reviews recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {milestoneReviews.map((rev) => (
                <div
                  key={rev.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    rev.decision === 'APPROVED'
                      ? 'bg-[#EBF4EE] border-[#C2DEC9] text-[#285C42]'
                      : 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Client Decision: {rev.decision}
                    </span>
                    <span className="text-[11px] font-mono">
                      {new Date(rev.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs">{rev.feedback}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transaction History (Relationship #5) */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[#8A837A] uppercase tracking-wider block">
            Escrow &amp; Payment Ledger Records ({milestonePayments.length})
          </span>
          {milestonePayments.length === 0 ? (
            <div className="p-3 text-center text-xs text-[#8A837A] bg-[#FAF7F2] rounded-xl border border-[#E5DFD5]">
              No transactions recorded for this milestone yet.
            </div>
          ) : (
            <div className="space-y-2">
              {milestonePayments.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-white border border-[#E5DFD5] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1C1917]">
                        {p.type === 'ESCROW_DEPOSIT' ? 'Escrow Deposit' : 'Escrow Payout Release'}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FAF7F2] border border-[#E5DFD5] text-[#8A837A]">
                        {p.status}
                      </span>
                    </div>
                    <code className="text-[10px] text-[#8A837A] font-mono block mt-0.5">
                      Ref: {p.reference}
                    </code>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-[#1C1917]">
                      {formatMoney(p.amountMinor, p.currency)}
                    </span>
                    <span className="text-[10px] text-[#8A837A] block">
                      {new Date(p.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#EFECE6]">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            {/* Dispute */}
            {['FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'APPROVED'].includes(
              milestone.status
            ) && (isClient || isFreelancer) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenDispute(milestone);
                }}
                className="text-[#991B1B] hover:text-[#7F1D1D]"
              >
                Raise Dispute
              </Button>
            )}

            {/* Fund Escrow */}
            {milestone.status === 'AWAITING_FUNDING' && (
              <div title={fundDisabledReason}>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!canFund}
                  onClick={() => {
                    onClose();
                    onFundEscrow(milestone);
                  }}
                  leftIcon={<Lock className="w-3.5 h-3.5" />}
                >
                  Deposit Escrow
                </Button>
              </div>
            )}

            {/* Submit Deliverable */}
            {(milestone.status === 'FUNDED' ||
              milestone.status === 'IN_PROGRESS' ||
              milestone.status === 'REVISION_REQUESTED') && (
              <div title={submitDisabledReason}>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!canSubmit}
                  onClick={() => {
                    onClose();
                    onSubmitDeliverable(milestone);
                  }}
                  leftIcon={<Upload className="w-3.5 h-3.5" />}
                >
                  {milestone.status === 'REVISION_REQUESTED' ? 'Submit Revision' : 'Submit Deliverable'}
                </Button>
              </div>
            )}

            {/* Review Deliverable */}
            {(milestone.status === 'SUBMITTED' || milestone.status === 'UNDER_REVIEW') && latestDelivery && (
              <div title={reviewDisabledReason}>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!canReview}
                  onClick={() => {
                    onClose();
                    onReviewDeliverable(milestone, latestDelivery);
                  }}
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                >
                  Review Deliverable
                </Button>
              </div>
            )}

            {/* Release Payment */}
            {milestone.status === 'APPROVED' && (
              <div title={releaseDisabledReason}>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!canRelease}
                  onClick={() => {
                    onClose();
                    onReleasePayment(milestone);
                  }}
                  leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                >
                  Release Payment
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
