import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Lock,
  Upload,
  Eye,
  CreditCard,
  AlertTriangle,
  RotateCcw,
  Scale,
  FileCheck,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  FileText,
  Fingerprint,
} from 'lucide-react';
import {
  Delivery,
  Milestone,
  MilestoneStatus,
  Project,
  Review,
  UserProfile,
} from '../types/fairwork';
import { formatMoney } from '../core/money';
import { StatusBadge } from './ui/StatusBadge';
import { Button } from './ui/Button';

interface MilestoneCardProps {
  milestone: Milestone;
  project: Project;
  currentUser: UserProfile;
  deliveries: Delivery[];
  reviews: Review[];
  onFundEscrow: (milestone: Milestone) => void;
  onSubmitDeliverable: (milestone: Milestone) => void;
  onReviewDeliverable: (milestone: Milestone, delivery: Delivery) => void;
  onReleasePayment: (milestone: Milestone) => void;
  onOpenDispute: (milestone: Milestone) => void;
  onSelectMilestone?: (milestone: Milestone) => void;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  project,
  currentUser,
  deliveries,
  reviews,
  onFundEscrow,
  onSubmitDeliverable,
  onReviewDeliverable,
  onReleasePayment,
  onOpenDispute,
  onSelectMilestone,
}) => {
  const [expanded, setExpanded] = useState(false);

  const milestoneDeliveries = deliveries.filter((d) => d.milestoneId === milestone.id);
  const latestDelivery = milestoneDeliveries[milestoneDeliveries.length - 1];
  const milestoneReviews = reviews.filter((r) => r.milestoneId === milestone.id);
  const latestReview = milestoneReviews[milestoneReviews.length - 1];

  const isClient = currentUser.id === project.clientId;
  const isFreelancer = currentUser.id === project.freelancerId;

  // Determine why action buttons are disabled
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
    <div className="p-5 rounded-2xl bg-white border border-[#E5DFD5] shadow-xs transition hover:border-[#D8D0C3]">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={milestone.status} size="sm" />
            <span className="text-xs text-[#8A837A] font-medium">
              Due {milestone.deadline}
            </span>
            <span className="text-xs text-[#8A837A] font-mono">
              &bull; Rev {milestone.currentRevisionCount ?? 0}/{milestone.revisionPolicy?.maxRevisions ?? 2}
            </span>
          </div>

          <h3
            onClick={() => onSelectMilestone && onSelectMilestone(milestone)}
            className="text-base font-bold text-[#1C1917] hover:text-[#264235] cursor-pointer transition truncate"
          >
            {milestone.title}
          </h3>

          <p className="text-xs text-[#605A53] mt-0.5 line-clamp-2">
            {milestone.description}
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="text-lg font-bold font-mono text-[#1C1917]">
            {formatMoney(milestone.amountMinor, project.currency)}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-[#264235] font-semibold hover:underline flex items-center gap-1 ml-auto mt-1 cursor-pointer"
          >
            <span>{expanded ? 'Hide Details' : 'View Criteria & History'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Section: Criteria, Revision History, and Hashes */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-[#EFECE6] space-y-3.5 text-xs animate-in fade-in duration-150">
          {/* Acceptance Criteria Checklist */}
          <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5]">
            <span className="text-[11px] font-bold text-[#8A837A] uppercase tracking-wider block mb-2">
              Verifiable Acceptance Criteria Checklist ({milestone.acceptanceCriteria.length})
            </span>
            <ul className="space-y-1.5 text-xs text-[#1C1917]">
              {milestone.acceptanceCriteria.map((criterion, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#264235] shrink-0 mt-1.5" />
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Latest Deliverable & Revision History */}
          {latestDelivery && (
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1C1917] flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#264235]" />
                  Latest Submission (Revision #{latestDelivery.revisionNumber})
                </span>
                <span className="text-[11px] font-mono text-[#8A837A]">
                  {new Date(latestDelivery.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-[#605A53] italic bg-white p-2.5 rounded-lg border border-[#E5DFD5]">
                &ldquo;{latestDelivery.notes}&rdquo;
              </p>
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <code className="text-[#8A837A] font-mono">
                  SHA-256: {latestDelivery.deliveryHash?.slice(0, 24)}...
                </code>
                {latestDelivery.externalUrl && (
                  <a
                    href={latestDelivery.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#264235] font-semibold hover:underline"
                  >
                    View Repo/Preview &rarr;
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Latest Review Feedback */}
          {latestReview && (
            <div
              className={`p-3.5 rounded-xl border ${
                latestReview.decision === 'APPROVED'
                  ? 'bg-[#EBF4EE] border-[#C2DEC9] text-[#285C42]'
                  : 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Client Decision: {latestReview.decision}
                </span>
                <span className="text-[11px] font-mono">
                  {new Date(latestReview.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-xs">{latestReview.feedback}</p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons Bar with explicit role-awareness and disabled reasons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-[#EFECE6]">
        <div className="text-[11px] text-[#8A837A]">
          {isClient && <span>Viewing as <strong>Client</strong></span>}
          {isFreelancer && <span>Viewing as <strong>Freelancer</strong></span>}
          {!isClient && !isFreelancer && <span>Viewing as <strong>Observer / Arbitrator</strong></span>}
        </div>

        <div className="flex items-center gap-2">
          {/* Dispute Button */}
          {['FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'APPROVED'].includes(
            milestone.status
          ) && (isClient || isFreelancer) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenDispute(milestone)}
              className="text-[#991B1B] hover:text-[#7F1D1D] hover:bg-[#FEE2E2]"
              leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
            >
              Raise Dispute
            </Button>
          )}

          {/* 1. Client Action: Deposit Escrow */}
          {milestone.status === 'AWAITING_FUNDING' && (
            <div title={fundDisabledReason}>
              <Button
                variant="primary"
                size="sm"
                disabled={!canFund}
                onClick={() => onFundEscrow(milestone)}
                leftIcon={<Lock className="w-3.5 h-3.5" />}
              >
                Deposit Escrow ({formatMoney(milestone.amountMinor, project.currency)} [Simulated])
              </Button>
            </div>
          )}

          {/* 2. Freelancer Action: Submit Deliverable */}
          {(milestone.status === 'FUNDED' ||
            milestone.status === 'IN_PROGRESS' ||
            milestone.status === 'REVISION_REQUESTED') && (
            <div title={submitDisabledReason}>
              <Button
                variant="primary"
                size="sm"
                disabled={!canSubmit}
                onClick={() => onSubmitDeliverable(milestone)}
                leftIcon={<Upload className="w-3.5 h-3.5" />}
              >
                {milestone.status === 'REVISION_REQUESTED'
                  ? 'Submit Revision'
                  : 'Submit Deliverable'}
              </Button>
            </div>
          )}

          {/* 3. Client Action: Review Deliverable */}
          {(milestone.status === 'SUBMITTED' || milestone.status === 'UNDER_REVIEW') &&
            latestDelivery && (
              <div title={reviewDisabledReason}>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!canReview}
                  onClick={() => onReviewDeliverable(milestone, latestDelivery)}
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                >
                  Review Deliverable (Approve / Revise / Dispute)
                </Button>
              </div>
            )}

          {/* 4. Client Action: Release Escrow Payment */}
          {milestone.status === 'APPROVED' && (
            <div title={releaseDisabledReason}>
              <Button
                variant="primary"
                size="sm"
                disabled={!canRelease}
                onClick={() => onReleasePayment(milestone)}
                leftIcon={<CreditCard className="w-3.5 h-3.5" />}
              >
                Release Payment ({formatMoney(milestone.amountMinor, project.currency)} [Simulated])
              </Button>
            </div>
          )}

          {/* Terminal state indicators */}
          {milestone.status === 'RELEASED' && (
            <div className="flex items-center gap-1.5 text-xs text-[#285C42] font-semibold bg-[#EBF4EE] px-3 py-1.5 rounded-lg border border-[#C2DEC9]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Released &amp; Closed (Double Release Locked)</span>
            </div>
          )}

          {milestone.status === 'DISPUTED' && (
            <div className="flex items-center gap-1.5 text-xs text-[#991B1B] font-semibold bg-[#FEE2E2] px-3 py-1.5 rounded-lg border border-[#FECACA]">
              <Scale className="w-3.5 h-3.5" />
              <span>Ordinary Release Locked (Disputed)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
