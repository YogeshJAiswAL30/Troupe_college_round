import React, { useState } from 'react';
import {
  Scale,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
  MessageSquare,
  Paperclip,
  DollarSign,
  Send,
  Plus,
  Lock,
  ExternalLink,
  ChevronRight,
  X,
  FileCheck,
  User,
} from 'lucide-react';
import { useFairwork } from '../../context/FairworkContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatMoney } from '../../core/money';
import { SettlementProposal, Dispute, Milestone } from '../../types/fairwork';

export const DisputesPage: React.FC = () => {
  const {
    disputes,
    milestones,
    projects,
    activeProject,
    agreements,
    deliveries,
    reviews,
    currentUser,
    allUsers,
    handleAddDisputeMessage,
    handleAddEvidence,
    handleProposeSettlement,
    handleRespondSettlement,
    handleExecuteSettlement,
  } = useFairwork();

  // Filter disputes according to RLS participant visibility (clients & freelancers only view their disputes; arbitrators view all)
  const accessibleDisputes = Object.values(disputes).filter((d) => {
    if (currentUser.role === 'ARBITRATOR' || currentUser.role === 'ADMIN') return true;
    const proj = projects.find((p) => p.id === d.projectId);
    if (!proj) return false;
    return proj.clientId === currentUser.id || proj.freelancerId === currentUser.id;
  });

  const [selectedDisputeId, setSelectedDisputeId] = useState<string>(
    accessibleDisputes[0]?.id || ''
  );

  // Active dispute
  const selectedDispute: Dispute | undefined =
    accessibleDisputes.find((d) => d.id === selectedDisputeId) || accessibleDisputes[0];

  const selectedMilestone = selectedDispute
    ? milestones.find((m) => m.id === selectedDispute.milestoneId)
    : undefined;

  const selectedProject = selectedDispute
    ? projects.find((p) => p.id === selectedDispute.projectId)
    : undefined;

  const selectedAgreement = selectedProject
    ? agreements.find((a) => a.projectId === selectedProject.id)
    : undefined;

  const milestoneDeliveries = selectedMilestone
    ? deliveries.filter((d) => d.milestoneId === selectedMilestone.id)
    : [];

  const milestoneReviews = selectedMilestone
    ? reviews.filter((r) => r.milestoneId === selectedMilestone.id)
    : [];

  // Interaction inputs
  const [responseMessage, setResponseMessage] = useState('');
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [isProposingSettlement, setIsProposingSettlement] = useState(false);

  // Settlement proposal form state
  const milestoneAmountDollars = selectedMilestone
    ? selectedMilestone.amountMinor / 100
    : 1000;
  const [freelancerDollars, setFreelancerDollars] = useState(
    Math.round(milestoneAmountDollars * 0.7)
  );
  const [clientRefundDollars, setClientRefundDollars] = useState(
    Math.round(milestoneAmountDollars * 0.3)
  );
  const [proposalNotes, setProposalNotes] = useState(
    'Mutual resolution proposal based on verified deliverables provided to date.'
  );

  const proposalSumMatches =
    Math.round((freelancerDollars + clientRefundDollars) * 100) ===
    (selectedMilestone?.amountMinor || 0);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone || !responseMessage.trim()) return;
    handleAddDisputeMessage(selectedMilestone.id, responseMessage.trim());
    setResponseMessage('');
  };

  const handleAttachEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone || !evidenceTitle.trim() || !evidenceUrl.trim()) return;
    handleAddEvidence(selectedMilestone.id, evidenceTitle.trim(), evidenceUrl.trim());
    setEvidenceTitle('');
    setEvidenceUrl('');
  };

  const handlePublishProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone || !proposalSumMatches) return;

    const isClient = currentUser.id === selectedProject?.clientId;
    const proposal: SettlementProposal = {
      proposedBy: currentUser.id,
      freelancerAmountMinor: Math.round(freelancerDollars * 100),
      clientRefundMinor: Math.round(clientRefundDollars * 100),
      proposalNotes,
      acceptedByClient: isClient,
      acceptedByFreelancer: !isClient,
    };

    handleProposeSettlement(selectedMilestone.id, proposal);
    setIsProposingSettlement(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5DFD5]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-[#1C1917]">
              Dispute Resolution Center
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">
              Rule 4 Active: Ordinary Release Locked
            </span>
          </div>
          <p className="text-xs text-[#605A53]">
            Structured, transparent dispute resolution without arbitrary third-party overrides. Mutual settlement requires explicit dual consent.
          </p>
        </div>

        <div className="text-xs text-[#605A53] font-medium">
          Active Disputes: <strong className="text-[#991B1B]">{accessibleDisputes.length}</strong>
        </div>
      </div>

      {accessibleDisputes.length === 0 ? (
        <Card className="p-12 text-center bg-white">
          <div className="w-12 h-12 rounded-xl bg-[#EBF4EE] text-[#285C42] flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#1C1917] mb-1">
            Zero Active Disputes
          </h3>
          <p className="text-xs text-[#605A53] max-w-md mx-auto mb-4 leading-relaxed">
            All project agreements and milestones are operating in good standing. When a party raises a dispute, it freezes ordinary payouts and opens a collaborative settlement dialogue.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Dispute List Navigator (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-[11px] font-bold text-[#8A837A] uppercase tracking-wider block">
              Active Case Files ({accessibleDisputes.length})
            </span>

            <div className="space-y-2">
              {accessibleDisputes.map((dsp) => {
                const ms = milestones.find((m) => m.id === dsp.milestoneId);
                const proj = projects.find((p) => p.id === dsp.projectId);
                const initiator = allUsers[dsp.initiatorId];
                const isSelected = selectedDispute?.id === dsp.id;

                return (
                  <div
                    key={dsp.id}
                    onClick={() => setSelectedDisputeId(dsp.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#264235] shadow-xs ring-2 ring-[#264235]/10'
                        : 'bg-white border-[#E5DFD5] hover:border-[#D8D0C3]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-[#FAF7F2] text-[#8A837A] border border-[#E5DFD5]">
                        {dsp.id}
                      </span>
                      <StatusBadge status={dsp.status} size="sm" />
                    </div>

                    <h4 className="text-xs font-bold text-[#1C1917] truncate mb-0.5">
                      {ms?.title || `Milestone ${dsp.milestoneId}`}
                    </h4>
                    <p className="text-[11px] text-[#605A53] truncate">
                      {proj?.title} &bull; {ms ? formatMoney(ms.amountMinor, proj?.currency || 'USD') : '$0'}
                    </p>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#EFECE6] text-[10px] text-[#8A837A]">
                      <span>Initiated by: {initiator?.displayName}</span>
                      <span>{new Date(dsp.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Comprehensive Dispute Detail & Resolution Workspace (8 cols) */}
          {selectedDispute && selectedMilestone && (
            <div className="lg:col-span-8 space-y-5">
              {/* Case Summary Card */}
              <Card className="p-6 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EFECE6] pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={selectedDispute.status} size="sm" />
                      <span className="text-xs text-[#991B1B] font-bold font-mono">
                        ORDINARY RELEASE LOCKED
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-[#1C1917]">
                      Dispute Case: {selectedMilestone.title}
                    </h2>
                    <p className="text-xs text-[#605A53] mt-0.5">
                      Project: {selectedProject?.title} &bull; Disputed Escrow: {formatMoney(selectedMilestone.amountMinor, selectedProject?.currency || 'USD')}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[#1C1917] block">
                      Case #{selectedDispute.id}
                    </span>
                    <span className="text-[10px] text-[#8A837A]">
                      Opened {new Date(selectedDispute.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Stated Grounds for Dispute */}
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#8A837A] block">
                    Stated Ground for Dispute (by {allUsers[selectedDispute.initiatorId]?.displayName}):
                  </span>
                  <p className="text-[#1C1917] font-medium leading-relaxed italic bg-white p-2.5 rounded-lg border border-[#E5DFD5]">
                    &ldquo;{selectedDispute.reason}&rdquo;
                  </p>
                </div>

                {/* Acceptance Criteria Checklist Inspection */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase text-[#8A837A] block">
                    Governing Acceptance Criteria ({selectedMilestone.acceptanceCriteria.length})
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {selectedMilestone.acceptanceCriteria.map((crit, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-2 rounded-lg bg-white border border-[#E5DFD5] flex items-center gap-2 text-xs text-[#1C1917]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#264235] shrink-0" />
                        <span>{crit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Settlement Proposal & Negotiation Workspace */}
              <Card className="border-[#FDE68A] bg-[#FEF3C7]/20 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#FDE68A] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#92400E] flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#D97706]" />
                      Mutual Settlement Proposal
                    </h3>
                    <p className="text-xs text-[#605A53] mt-0.5">
                      Both parties must accept terms before split payouts are processed to the ledger.
                    </p>
                  </div>

                  {!isProposingSettlement && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsProposingSettlement(true)}
                    >
                      Draft New Proposal
                    </Button>
                  )}
                </div>

                {/* New Proposal Draft Form */}
                {isProposingSettlement ? (
                  <form onSubmit={handlePublishProposal} className="space-y-4 p-4 rounded-xl bg-white border border-[#FDE68A]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1C1917]">
                        Propose Escrow Split (Total: {formatMoney(selectedMilestone.amountMinor, selectedProject?.currency || 'USD')})
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsProposingSettlement(false)}
                        className="text-xs text-[#8A837A] hover:text-[#1C1917]"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] font-bold text-[#8A837A] block mb-1">
                          Freelancer Payout ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={freelancerDollars}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setFreelancerDollars(val);
                            setClientRefundDollars(Math.max(0, milestoneAmountDollars - val));
                          }}
                          className="w-full text-xs p-2.5 rounded-lg border border-[#E5DFD5] bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-[#8A837A] block mb-1">
                          Client Refund ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={clientRefundDollars}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setClientRefundDollars(val);
                            setFreelancerDollars(Math.max(0, milestoneAmountDollars - val));
                          }}
                          className="w-full text-xs p-2.5 rounded-lg border border-[#E5DFD5] bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#8A837A] block mb-1">
                        Settlement Notes &amp; Mutual Release Conditions
                      </label>
                      <textarea
                        rows={2}
                        value={proposalNotes}
                        onChange={(e) => setProposalNotes(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-[#E5DFD5] bg-white"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#EFECE6]">
                      <span className="text-[11px] font-bold text-[#285C42]">
                        Sum: ${(freelancerDollars + clientRefundDollars).toLocaleString()} / ${milestoneAmountDollars.toLocaleString()}
                      </span>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={!proposalSumMatches}
                      >
                        Publish Formal Proposal
                      </Button>
                    </div>
                  </form>
                ) : selectedDispute.settlementProposal ? (
                  /* Active Proposal Review */
                  <div className="p-4 rounded-xl bg-white border border-[#FDE68A] space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1C1917]">
                        Proposed by {allUsers[selectedDispute.settlementProposal.proposedBy]?.displayName}:
                      </span>
                      <span className="text-[10px] font-mono text-[#8A837A]">
                        Split Agreement
                      </span>
                    </div>

                    <p className="text-[#605A53] italic">
                      &ldquo;{selectedDispute.settlementProposal.proposalNotes}&rdquo;
                    </p>

                    <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5]">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#8A837A] block">
                          Freelancer Share:
                        </span>
                        <span className="font-mono font-bold text-sm text-[#285C42]">
                          {formatMoney(
                            selectedDispute.settlementProposal.freelancerAmountMinor,
                            selectedProject?.currency || 'USD'
                          )}
                        </span>
                        <span className="block text-[10px] text-[#605A53] mt-0.5">
                          Status: {selectedDispute.settlementProposal.acceptedByFreelancer ? '✓ Accepted' : 'Pending Acceptance'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#8A837A] block">
                          Client Refund:
                        </span>
                        <span className="font-mono font-bold text-sm text-[#1E429F]">
                          {formatMoney(
                            selectedDispute.settlementProposal.clientRefundMinor,
                            selectedProject?.currency || 'USD'
                          )}
                        </span>
                        <span className="block text-[10px] text-[#605A53] mt-0.5">
                          Status: {selectedDispute.settlementProposal.acceptedByClient ? '✓ Accepted' : 'Pending Acceptance'}
                        </span>
                      </div>
                    </div>

                    {/* Settlement Actions */}
                    {selectedDispute.status !== 'RESOLVED_BY_MUTUAL' && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EFECE6]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRespondSettlement(selectedMilestone.id, false)}
                          className="text-[#991B1B]"
                        >
                          Reject Proposal
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleRespondSettlement(selectedMilestone.id, true)}
                        >
                          Accept Settlement Terms
                        </Button>
                      </div>
                    )}

                    {selectedDispute.status === 'RESOLVED_BY_MUTUAL' && (
                      <div className="p-3 rounded-lg bg-[#EBF4EE] text-[#285C42] font-semibold text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>This dispute has been mutually resolved and split payouts executed to the ledger.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[#8A837A] py-2">
                    No active settlement proposal yet. Click "Draft New Proposal" to propose mutual escrow distribution.
                  </p>
                )}
              </Card>

              {/* Dialogue History & Evidence Attachments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dialogue Responses */}
                <Card className="p-4 space-y-3 text-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="font-bold text-[#1C1917] flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#264235]" />
                      Participant Dialogue ({selectedDispute.responses.length})
                    </span>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {selectedDispute.responses.length === 0 ? (
                        <p className="text-[#8A837A] py-2">No messages posted yet.</p>
                      ) : (
                        selectedDispute.responses.map((msg) => {
                          const author = allUsers[msg.authorId];
                          return (
                            <div key={msg.id} className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] space-y-1">
                              <div className="flex justify-between text-[10px] text-[#8A837A]">
                                <span className="font-semibold text-[#1C1917]">
                                  {author?.displayName} ({author?.role})
                                </span>
                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-[#1C1917]">{msg.message}</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-[#EFECE6]">
                    <input
                      type="text"
                      placeholder="Post formal response..."
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-[#E5DFD5] focus:outline-none focus:ring-1 focus:ring-[#264235]"
                    />
                    <Button type="submit" variant="primary" size="sm" disabled={!responseMessage.trim()}>
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </form>
                </Card>

                {/* Evidence Attachments */}
                <Card className="p-4 space-y-3 text-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="font-bold text-[#1C1917] flex items-center gap-1.5">
                      <Paperclip className="w-4 h-4 text-[#264235]" />
                      Attached Case Evidence ({selectedDispute.evidenceReferences.length})
                    </span>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {selectedDispute.evidenceReferences.length === 0 ? (
                        <p className="text-[#8A837A] py-2">No evidence attached yet.</p>
                      ) : (
                        selectedDispute.evidenceReferences.map((ev) => (
                          <div key={ev.id} className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-[#1C1917] truncate">{ev.title}</span>
                              <code className="text-[10px] font-mono text-[#8A837A]">
                                {ev.sha256Hash?.slice(0, 12)}...
                              </code>
                            </div>
                            <a
                              href={ev.urlOrContent}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-[#264235] hover:underline flex items-center gap-1 truncate"
                            >
                              Inspect Evidence File <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleAttachEvidence} className="space-y-2 pt-2 border-t border-[#EFECE6]">
                    <input
                      type="text"
                      placeholder="Evidence Title (e.g. Browser Benchmark Log)"
                      value={evidenceTitle}
                      onChange={(e) => setEvidenceTitle(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[#E5DFD5]"
                    />
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Secure URL / Evidence Link"
                        value={evidenceUrl}
                        onChange={(e) => setEvidenceUrl(e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-[#E5DFD5]"
                      />
                      <Button type="submit" variant="secondary" size="sm" disabled={!evidenceTitle.trim() || !evidenceUrl.trim()}>
                        Add
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
