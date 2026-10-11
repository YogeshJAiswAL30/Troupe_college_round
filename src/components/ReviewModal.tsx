import React, { useState } from 'react';
import {
  Eye,
  X,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  FileText,
  Fingerprint,
  ExternalLink,
  ShieldAlert,
  CheckSquare,
} from 'lucide-react';
import { Delivery, Milestone, ReviewDecision } from '../types/fairwork';
import { Button } from './ui/Button';

interface ReviewModalProps {
  milestone: Milestone;
  delivery: Delivery;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (
    decision: ReviewDecision,
    feedback: string,
    criteriaChecklist: Array<{ criteria: string; satisfied: boolean }>
  ) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  milestone,
  delivery,
  isOpen,
  onClose,
  onSubmitReview,
}) => {
  const [decision, setDecision] = useState<ReviewDecision>('APPROVED');
  const [feedback, setFeedback] = useState('All acceptance criteria have been verified and confirmed.');
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    milestone.acceptanceCriteria.forEach((c) => {
      initial[c] = true;
    });
    return initial;
  });

  if (!isOpen) return null;

  const toggleCriteria = (criterion: string) => {
    setChecklist((prev) => ({
      ...prev,
      [criterion]: !prev[criterion],
    }));
  };

  const handleDecisionChange = (newDecision: ReviewDecision) => {
    setDecision(newDecision);
    if (newDecision === 'APPROVED') {
      setFeedback('All acceptance criteria have been verified and confirmed.');
    } else if (newDecision === 'REVISION_REQUESTED') {
      setFeedback('Please address the unchecked acceptance criteria and resubmit revision.');
    } else if (newDecision === 'DISPUTED') {
      setFeedback('Delivery does not meet fundamental contractual specifications.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const criteriaChecklist = milestone.acceptanceCriteria.map((c) => ({
      criteria: c,
      satisfied: Boolean(checklist[c]),
    }));

    onSubmitReview(decision, feedback, criteriaChecklist);
    onClose();
  };

  const satisfiedCount = milestone.acceptanceCriteria.filter((c) => checklist[c]).length;

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1917]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-[#E5DFD5] shadow-xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#EFECE6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] text-[#264235] border border-[#E5DFD5] flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1C1917]">
                Review Deliverable: {milestone.title}
              </h3>
              <p className="text-xs text-[#605A53]">
                Inspect evidence against contract criteria before taking a payment action
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8A837A] hover:text-[#1C1917] hover:bg-[#FAF7F2] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Deliverable Evidence Snapshot */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1C1917]">
                Revision #{delivery.revisionNumber} Submission Notes:
              </span>
              <span className="text-[11px] font-mono text-[#8A837A]">
                {new Date(delivery.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="text-[#605A53] italic bg-white p-2.5 rounded-lg border border-[#E5DFD5]">
              &ldquo;{delivery.notes}&rdquo;
            </p>

            {/* Attached Files & Hashes */}
            {delivery.files.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-[#8A837A] uppercase block">
                  Attached Files &amp; Integrity Hash:
                </span>
                {delivery.files.map((file, fIdx) => (
                  <div
                    key={fIdx}
                    className="p-2 rounded-lg bg-white border border-[#E5DFD5] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-[#264235]" />
                      <span className="font-medium text-[#1C1917] truncate">{file.name}</span>
                    </div>
                    <code className="text-[10px] font-mono text-[#8A837A] shrink-0 ml-2">
                      {file.sha256Hash?.slice(0, 16)}...
                    </code>
                  </div>
                ))}
              </div>
            )}

            {/* External URL */}
            {delivery.externalUrl && (
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-[#8A837A]">External Demo / Repository:</span>
                <a
                  href={delivery.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#264235] font-semibold hover:underline flex items-center gap-1"
                >
                  Inspect URL <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Criteria Verification Checklist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-[#264235]" />
                Acceptance Criteria Verification Checklist
              </span>
              <span className="text-[11px] font-semibold text-[#8A837A]">
                {satisfiedCount} of {milestone.acceptanceCriteria.length} Satisfied
              </span>
            </div>
            <div className="space-y-1.5">
              {milestone.acceptanceCriteria.map((criterion, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[#E5DFD5] bg-white hover:bg-[#FAF7F2] cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(checklist[criterion])}
                    onChange={() => toggleCriteria(criterion)}
                    className="mt-0.5 rounded text-[#264235] focus:ring-[#264235]"
                  />
                  <span className="text-[#1C1917] leading-snug">{criterion}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Decision Selector: 3 Explicit Options */}
          <div>
            <span className="text-xs font-bold text-[#1C1917] block mb-2">
              Select Client Decision:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDecisionChange('APPROVED')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition cursor-pointer ${
                  decision === 'APPROVED'
                    ? 'bg-[#EBF4EE] border-[#C2DEC9] text-[#285C42] ring-2 ring-[#285C42]/20'
                    : 'bg-white border-[#E5DFD5] text-[#605A53] hover:bg-[#FAF7F2]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#285C42]" />
                <span>Approve Milestone</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecisionChange('REVISION_REQUESTED')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition cursor-pointer ${
                  decision === 'REVISION_REQUESTED'
                    ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E] ring-2 ring-[#92400E]/20'
                    : 'bg-white border-[#E5DFD5] text-[#605A53] hover:bg-[#FAF7F2]'
                }`}
              >
                <RotateCcw className="w-4 h-4 text-[#92400E]" />
                <span>Request Revisions</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecisionChange('DISPUTED')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition cursor-pointer ${
                  decision === 'DISPUTED'
                    ? 'bg-[#FEE2E2] border-[#FECACA] text-[#991B1B] ring-2 ring-[#991B1B]/20'
                    : 'bg-white border-[#E5DFD5] text-[#605A53] hover:bg-[#FAF7F2]'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-[#991B1B]" />
                <span>Raise Dispute</span>
              </button>
            </div>
          </div>

          {/* Feedback & Instructions */}
          <div>
            <label className="text-xs font-bold text-[#1C1917] block mb-1">
              Feedback &amp; Formal Decision Notes *
            </label>
            <textarea
              required
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide clear rationale for your decision..."
              className="w-full text-xs p-3 rounded-xl border border-[#E5DFD5] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#264235]"
            />
          </div>

          {/* Decision Impact Warning */}
          {decision === 'APPROVED' && (
            <div className="p-3 rounded-xl bg-[#EBF4EE]/50 border border-[#C2DEC9] text-xs text-[#285C42] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Consequence for Payment:</strong> Approving unlocks the milestone for escrow release. Funds will be ready to release to the freelancer.
              </span>
            </div>
          )}

          {decision === 'REVISION_REQUESTED' && (
            <div className="p-3 rounded-xl bg-[#FEF3C7]/50 border border-[#FDE68A] text-xs text-[#92400E] flex items-start gap-2">
              <RotateCcw className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Consequence:</strong> The milestone status resets to Revision Requested. The freelancer can review your feedback and resubmit. All previous revisions are preserved in history.
              </span>
            </div>
          )}

          {decision === 'DISPUTED' && (
            <div className="p-3 rounded-xl bg-[#FEE2E2]/50 border border-[#FECACA] text-xs text-[#991B1B] flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Rule 4 Enforced:</strong> Marking disputed immediately locks ordinary release. Neither party can release funds until mutual settlement or arbitration is resolved.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EFECE6]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!feedback.trim()}
            >
              Submit Formal Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
