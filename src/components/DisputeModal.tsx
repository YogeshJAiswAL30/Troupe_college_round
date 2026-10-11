import React, { useState } from 'react';
import { Scale, X, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { Dispute, Milestone, SettlementProposal, UserProfile } from '../types/fairwork';
import { formatMoney } from '../core/money';

interface DisputeModalProps {
  milestone: Milestone;
  dispute?: Dispute;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onRaiseDispute: (reason: string) => void;
  onProposeSettlement: (proposal: SettlementProposal) => void;
  onExecuteSettlement: (proposal: SettlementProposal) => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  milestone,
  dispute,
  currentUser,
  isOpen,
  onClose,
  onRaiseDispute,
  onProposeSettlement,
  onExecuteSettlement,
}) => {
  const [reason, setReason] = useState('Disagreement regarding milestone deliverable scope vs agreed acceptance criteria.');
  
  // Proposal amounts in whole dollars (converted to minor cents upon submit)
  const defaultFreelancerDollars = Math.round((milestone.amountMinor * 0.7) / 100);
  const defaultClientDollars = Math.round((milestone.amountMinor * 0.3) / 100);

  const [freelancerDollars, setFreelancerDollars] = useState(defaultFreelancerDollars);
  const [clientDollars, setClientDollars] = useState(defaultClientDollars);
  const [proposalNotes, setProposalNotes] = useState('Compromise resolution: 70% payout for functional deliverables completed, 30% refund to client.');

  if (!isOpen) return null;

  const totalProposedMinor = (freelancerDollars + clientDollars) * 100;
  const isSumValid = totalProposedMinor === milestone.amountMinor;

  const handleRaiseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onRaiseDispute(reason);
  };

  const handleCreateProposal = () => {
    if (!isSumValid) return;

    const isClient = currentUser.role === 'CLIENT';
    const isFreelancer = currentUser.role === 'FREELANCER';

    const proposal: SettlementProposal = {
      proposedBy: currentUser.id,
      freelancerAmountMinor: freelancerDollars * 100,
      clientRefundMinor: clientDollars * 100,
      proposalNotes,
      acceptedByClient: isClient,
      acceptedByFreelancer: isFreelancer,
    };

    onProposeSettlement(proposal);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Structured Dispute Resolution
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If no active dispute yet, show form to raise it */}
        {!dispute || dispute.status === 'REJECTED' ? (
          <form onSubmit={handleRaiseSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300">
              <div className="font-semibold flex items-center gap-1.5 mb-1">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                Rule 4 Invariant: Ordinary Escrow Release is Locked
              </div>
              Opening a dispute prevents unilateral payment release until both parties mutually agree on a settlement or an arbitrator rules.
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Reason for Escalation *
              </label>
              <textarea
                required
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the specific conflict, missed criteria, or unaddressed revision..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition"
              >
                Initiate Dispute
              </button>
            </div>
          </form>
        ) : (
          /* Active Dispute Settlement Interface */
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-900 dark:text-rose-200">
              <div className="font-semibold mb-1 flex items-center justify-between">
                <span>Dispute Status: {dispute.status}</span>
                <span className="font-mono text-[11px]">
                  Escrow Locked: {formatMoney(milestone.amountMinor)}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 italic">
                &ldquo;{dispute.reason}&rdquo;
              </p>
            </div>

            {/* Structured Settlement Proposal Section */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Mutual Settlement Proposal
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Target: {formatMoney(milestone.amountMinor)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Freelancer Payout ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={milestone.amountMinor / 100}
                    value={freelancerDollars}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setFreelancerDollars(val);
                      setClientDollars((milestone.amountMinor / 100) - val);
                    }}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Client Refund ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={milestone.amountMinor / 100}
                    value={clientDollars}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setClientDollars(val);
                      setFreelancerDollars((milestone.amountMinor / 100) - val);
                    }}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {!isSumValid ? (
                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>
                    Sum (${freelancerDollars + clientDollars}) must equal escrow amount ($
                    {milestone.amountMinor / 100})
                  </span>
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Exact Match: $2,000.00 escrow accounted for</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Settlement Terms Note
                </label>
                <input
                  type="text"
                  value={proposalNotes}
                  onChange={(e) => setProposalNotes(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              {/* Status of Existing Proposal */}
              {dispute.settlementProposal && (
                <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs">
                  <div className="font-semibold text-indigo-900 dark:text-indigo-300 mb-1">
                    Active Proposal Consents:
                  </div>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className={dispute.settlementProposal.acceptedByClient ? 'text-emerald-600' : 'text-slate-400'}>
                      Client: {dispute.settlementProposal.acceptedByClient ? 'Accepted' : 'Pending'}
                    </span>
                    <span className={dispute.settlementProposal.acceptedByFreelancer ? 'text-emerald-600' : 'text-slate-400'}>
                      Freelancer: {dispute.settlementProposal.acceptedByFreelancer ? 'Accepted' : 'Pending'}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCreateProposal}
                  disabled={!isSumValid}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition"
                >
                  Propose / Update Terms
                </button>

                {dispute.settlementProposal && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!dispute.settlementProposal) return;
                      // Sign as current user
                      const updated: SettlementProposal = {
                        ...dispute.settlementProposal,
                        acceptedByClient:
                          currentUser.role === 'CLIENT'
                            ? true
                            : dispute.settlementProposal.acceptedByClient,
                        acceptedByFreelancer:
                          currentUser.role === 'FREELANCER'
                            ? true
                            : dispute.settlementProposal.acceptedByFreelancer,
                      };

                      if (updated.acceptedByClient && updated.acceptedByFreelancer) {
                        onExecuteSettlement(updated);
                        onClose();
                      } else {
                        onProposeSettlement(updated);
                      }
                    }}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition"
                  >
                    Accept as {currentUser.displayName.split(' ')[0]}
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
