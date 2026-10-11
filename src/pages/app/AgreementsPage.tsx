import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Fingerprint,
  Edit3,
  Copy,
  Check,
  History,
  GitCompare,
  ArrowRight,
  ShieldAlert,
  Info,
  KeyRound,
  FileCheck,
  Coins,
  ChevronRight,
} from 'lucide-react';
import { useFairwork } from '../../context/FairworkContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { AmendmentModal } from '../../components/AmendmentModal';
import { Agreement } from '../../types/fairwork';

export const AgreementsPage: React.FC = () => {
  const {
    agreements,
    agreement: activeAgreement,
    activeProject,
    currentUser,
    allUsers,
    handleAcceptAgreement,
    handleProposeAmendment,
  } = useFairwork();

  const [isAmendmentOpen, setIsAmendmentOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'document' | 'diff' | 'cryptography'>('document');

  // Filter versions belonging to current active project, sorted descending by version number
  const projectAgreements = agreements
    .filter((a) => a.projectId === activeProject.id)
    .sort((a, b) => b.versionNumber - a.versionNumber);

  // The displayed agreement is either user's selected version from history, or default active agreement
  const displayedAgreement: Agreement =
    projectAgreements.find((a) => a.id === selectedVersionId) || activeAgreement;

  // Comparison baseline: either selected baseline or immediately preceding version (if available)
  const comparisonAgreement: Agreement | null =
    projectAgreements.find((a) => a.id === compareVersionId) ||
    projectAgreements.find((a) => a.versionNumber === displayedAgreement.versionNumber - 1) ||
    (projectAgreements.length > 1 && projectAgreements[1].id !== displayedAgreement.id
      ? projectAgreements[1]
      : null);

  const clientUser = allUsers[activeProject.clientId];
  const freelancerUser = allUsers[activeProject.freelancerId];

  const clientAccepted = Boolean(displayedAgreement.acceptedBy[activeProject.clientId]);
  const freelancerAccepted = Boolean(displayedAgreement.acceptedBy[activeProject.freelancerId]);
  const userHasAccepted = Boolean(displayedAgreement.acceptedBy[currentUser.id]);
  const isParticipant =
    currentUser.id === activeProject.clientId || currentUser.id === activeProject.freelancerId;

  const handleCopy = (hashText?: string) => {
    if (hashText) {
      navigator.clipboard.writeText(hashText);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Banner / Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5DFD5]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-[#1C1917]">
              Project Agreement &amp; Version History
            </h1>
            <span
              className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                displayedAgreement.isActive
                  ? 'bg-[#EBF4EE] border-[#C2DEC9] text-[#285C42]'
                  : 'bg-[#FEF3C7]/60 border-[#FDE68A] text-[#92400E]'
              }`}
            >
              v{displayedAgreement.versionNumber} {displayedAgreement.isActive ? '(Active)' : '(Superseded/Pending)'}
            </span>
          </div>
          <p className="text-xs text-[#605A53] mt-1">
            Core Invariant #1: Canonical specification, deterministic SHA-256 integrity hash, multi-party consent, and immutable amendment log.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isParticipant && !userHasAccepted && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
              onClick={() => handleAcceptAgreement(activeAgreement.id, activeProject.id)}
            >
              Sign v{activeAgreement.versionNumber}
            </Button>
          )}

          {isParticipant && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              onClick={() => setIsAmendmentOpen(true)}
            >
              Propose Amendment (Rule 7)
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5DFD5] pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('document')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'document'
              ? 'bg-[#264235] text-white shadow-xs'
              : 'text-[#605A53] hover:text-[#1C1917] hover:bg-[#EFECE6]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Agreement Document</span>
        </button>

        <button
          onClick={() => setActiveTab('diff')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'diff'
              ? 'bg-[#264235] text-white shadow-xs'
              : 'text-[#605A53] hover:text-[#1C1917] hover:bg-[#EFECE6]'
          }`}
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>Version Comparison &amp; Diff</span>
          {projectAgreements.length > 1 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {projectAgreements.length} versions
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('cryptography')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'cryptography'
              ? 'bg-[#264235] text-white shadow-xs'
              : 'text-[#605A53] hover:text-[#1C1917] hover:bg-[#EFECE6]'
          }`}
        >
          <Fingerprint className="w-3.5 h-3.5" />
          <span>Cryptographic Distinction (Hash vs Signature)</span>
        </button>
      </div>

      {/* Version Selector Carousel / Pill Bar */}
      <div className="p-3 rounded-xl bg-white border border-[#E5DFD5] flex items-center justify-between gap-3 overflow-x-auto text-xs shadow-xs">
        <div className="flex items-center gap-2 shrink-0">
          <History className="w-4 h-4 text-[#264235]" />
          <span className="font-bold text-[#1C1917]">Version Timeline:</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          {projectAgreements.map((ver) => {
            const isSelected =
              (selectedVersionId === null && ver.id === activeAgreement.id) ||
              selectedVersionId === ver.id;
            const isLatest = ver.versionNumber === Math.max(...projectAgreements.map((a) => a.versionNumber));

            return (
              <button
                key={ver.id}
                onClick={() => setSelectedVersionId(ver.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FAF7F2] border-[#264235] text-[#264235] font-bold shadow-xs'
                    : 'bg-white border-[#E5DFD5] text-[#605A53] hover:border-[#8A837A]'
                }`}
              >
                <span>Version {ver.versionNumber}</span>
                {ver.isActive && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EBF4EE] text-[#285C42] font-semibold">
                    Active
                  </span>
                )}
                {!ver.isActive && isLatest && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FEF3C7] text-[#92400E] font-semibold">
                    Pending
                  </span>
                )}
                {!ver.isActive && !isLatest && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F5F2EB] text-[#8A837A]">
                    Archived
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: AGREEMENT DOCUMENT VIEW */}
      {activeTab === 'document' && (
        <div className="space-y-6">
          {/* Dual Signature Consent Cards (Rule 6) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client Sign Box */}
            <div
              className={`p-4 rounded-xl border text-xs ${
                clientAccepted
                  ? 'bg-[#EBF4EE]/50 border-[#C2DEC9]'
                  : 'bg-[#FEF3C7]/40 border-[#FDE68A]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[#1C1917]">
                  Client: {clientUser?.displayName || 'Alice'}
                </span>
                {clientAccepted ? (
                  <span className="text-[#285C42] font-semibold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Digitally Signed
                  </span>
                ) : (
                  <span className="text-[#92400E] font-semibold flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5" /> Awaiting Signature
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#605A53] font-mono leading-relaxed break-all">
                {clientAccepted ? (
                  <>
                    <span className="text-[#8A837A] font-sans">Timestamp: </span>
                    {new Date(
                      displayedAgreement.acceptedBy[activeProject.clientId].acceptedAt
                    ).toLocaleString()}{' '}
                    <br />
                    <span className="text-[#8A837A] font-sans">Signature Digest: </span>
                    {displayedAgreement.acceptedBy[activeProject.clientId].signatureHash}
                  </>
                ) : (
                  'Client has not signed this agreement version yet.'
                )}
              </div>
            </div>

            {/* Freelancer Sign Box */}
            <div
              className={`p-4 rounded-xl border text-xs ${
                freelancerAccepted
                  ? 'bg-[#EBF4EE]/50 border-[#C2DEC9]'
                  : 'bg-[#FEF3C7]/40 border-[#FDE68A]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[#1C1917]">
                  Freelancer: {freelancerUser?.displayName || 'Bob'}
                </span>
                {freelancerAccepted ? (
                  <span className="text-[#285C42] font-semibold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Digitally Signed
                  </span>
                ) : (
                  <span className="text-[#92400E] font-semibold flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5" /> Awaiting Signature
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#605A53] font-mono leading-relaxed break-all">
                {freelancerAccepted ? (
                  <>
                    <span className="text-[#8A837A] font-sans">Timestamp: </span>
                    {new Date(
                      displayedAgreement.acceptedBy[activeProject.freelancerId].acceptedAt
                    ).toLocaleString()}{' '}
                    <br />
                    <span className="text-[#8A837A] font-sans">Signature Digest: </span>
                    {displayedAgreement.acceptedBy[activeProject.freelancerId].signatureHash}
                  </>
                ) : (
                  'Freelancer has not signed this agreement version yet.'
                )}
              </div>
            </div>
          </div>

          {/* SHA-256 Fingerprint Callout */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E5DFD5] flex items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <Fingerprint className="w-4 h-4 text-[#264235] shrink-0" />
              <span className="font-bold text-[#1C1917] shrink-0">
                Canonical SHA-256 Fingerprint (v{displayedAgreement.versionNumber}):
              </span>
              <code className="text-[11px] font-mono text-[#605A53] truncate">
                {displayedAgreement.agreementHash}
              </code>
            </div>
            <button
              onClick={() => handleCopy(displayedAgreement.agreementHash)}
              className="px-2.5 py-1 rounded-md bg-[#FAF7F2] hover:bg-[#EFECE6] border border-[#E5DFD5] text-[#1C1917] text-[11px] font-medium flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {copiedHash ? <Check className="w-3 h-3 text-[#285C42]" /> : <Copy className="w-3 h-3" />}
              {copiedHash ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Structured Terms Document */}
          <Card className="p-6 space-y-5 bg-white border-[#E5DFD5]">
            <div>
              <span className="text-[11px] font-bold text-[#8A837A] uppercase tracking-wider block mb-1">
                Section 1: Scope of Work
              </span>
              <p className="text-xs text-[#1C1917] leading-relaxed bg-[#FAF7F2] p-3.5 rounded-lg border border-[#EFECE6]">
                {displayedAgreement.structuredTerms.scopeSummary}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#8A837A] uppercase tracking-wider block mb-1">
                Section 2: Deliverables Specification
              </span>
              <p className="text-xs text-[#1C1917] leading-relaxed bg-[#FAF7F2] p-3.5 rounded-lg border border-[#EFECE6]">
                {displayedAgreement.structuredTerms.deliverablesSummary}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#EFECE6] text-xs">
              <div>
                <span className="text-[11px] font-semibold text-[#8A837A] block">
                  IP Transfer Clause
                </span>
                <span className="font-bold text-[#1C1917]">
                  {displayedAgreement.structuredTerms.intellectualPropertyClause === 'ON_PAYMENT'
                    ? 'Transfers Upon Escrow Release'
                    : displayedAgreement.structuredTerms.intellectualPropertyClause}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#8A837A] block">
                  Confidentiality
                </span>
                <span className="font-bold text-[#1C1917]">
                  {displayedAgreement.structuredTerms.confidentiality ? 'Standard NDA Active' : 'Public'}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#8A837A] block">
                  Governing Law
                </span>
                <span className="font-bold text-[#1C1917]">
                  {displayedAgreement.structuredTerms.governingLaw}
                </span>
              </div>
            </div>

            {displayedAgreement.structuredTerms.customClauses && (
              <div className="pt-2 border-t border-[#EFECE6] space-y-2.5">
                <span className="text-[11px] font-bold text-[#8A837A] uppercase tracking-wider block">
                  Custom &amp; Operational Clauses
                </span>
                <div className="grid grid-cols-1 gap-2.5">
                  {displayedAgreement.structuredTerms.customClauses.map((c, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#EFECE6] text-xs">
                      <span className="font-bold text-[#1C1917] block mb-1">{c.title}</span>
                      <p className="text-[#605A53] leading-relaxed">{c.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: VERSION COMPARISON & DIFF */}
      {activeTab === 'diff' && (
        <div className="space-y-6">
          {/* Comparison Selector Bar */}
          <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-[#264235]" />
              <span className="font-bold text-[#1C1917]">Visual Amendment Diff Inspector</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#605A53] font-medium">Compare:</span>
              <select
                value={comparisonAgreement?.id || ''}
                onChange={(e) => setCompareVersionId(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-[#E5DFD5] bg-[#FAF7F2] text-[#1C1917] font-semibold text-xs focus:outline-none cursor-pointer"
              >
                {projectAgreements
                  .filter((a) => a.id !== displayedAgreement.id)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      Version {a.versionNumber} ({new Date(a.createdAt).toLocaleDateString()})
                    </option>
                  ))}
              </select>

              <ArrowRight className="w-3.5 h-3.5 text-[#8A837A]" />

              <span className="px-2.5 py-1.5 rounded-lg border border-[#C2DEC9] bg-[#EBF4EE] text-[#285C42] font-bold text-xs">
                Version {displayedAgreement.versionNumber} (Current Viewing)
              </span>
            </div>
          </div>

          {comparisonAgreement ? (
            <div className="space-y-5">
              {/* Diff Metric Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] text-xs">
                  <span className="text-[11px] font-bold text-[#8A837A] uppercase tracking-wider block mb-1">
                    Baseline: Version {comparisonAgreement.versionNumber}
                  </span>
                  <div className="text-[11px] font-mono text-[#605A53] truncate mb-2">
                    Hash: {comparisonAgreement.agreementHash ? `${comparisonAgreement.agreementHash.slice(0, 24)}...` : 'Computing...'}
                  </div>
                  <div className="text-[11px] text-[#605A53]">
                    Published by {allUsers[comparisonAgreement.proposedBy]?.displayName || comparisonAgreement.proposedBy} on{' '}
                    {new Date(comparisonAgreement.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#264235]/30 text-xs">
                  <span className="text-[11px] font-bold text-[#264235] uppercase tracking-wider block mb-1">
                    Target: Version {displayedAgreement.versionNumber}
                  </span>
                  <div className="text-[11px] font-mono text-[#264235] truncate mb-2">
                    Hash: {displayedAgreement.agreementHash ? `${displayedAgreement.agreementHash.slice(0, 24)}...` : 'Computing...'}
                  </div>
                  <div className="text-[11px] text-[#605A53]">
                    Published by {allUsers[displayedAgreement.proposedBy]?.displayName || displayedAgreement.proposedBy} on{' '}
                    {new Date(displayedAgreement.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Side-by-side Clause Diffs */}
              <Card className="p-6 space-y-6 bg-white border-[#E5DFD5]">
                {/* 1. Scope Diff */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#1C1917]">Section 1: Scope of Work</span>
                    {comparisonAgreement.structuredTerms.scopeSummary === displayedAgreement.structuredTerms.scopeSummary ? (
                      <span className="text-[11px] text-[#285C42] font-semibold bg-[#EBF4EE] px-2 py-0.5 rounded">Unchanged</span>
                    ) : (
                      <span className="text-[11px] text-[#92400E] font-semibold bg-[#FEF3C7] px-2 py-0.5 rounded">Modified</span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#F5F2EB]/60 border border-[#E5DFD5] text-[#605A53] leading-relaxed">
                      <span className="text-[10px] font-bold text-[#8A837A] uppercase block mb-1">v{comparisonAgreement.versionNumber} Text:</span>
                      {comparisonAgreement.structuredTerms.scopeSummary}
                    </div>
                    <div className={`p-3 rounded-lg leading-relaxed ${
                      comparisonAgreement.structuredTerms.scopeSummary === displayedAgreement.structuredTerms.scopeSummary
                        ? 'bg-[#F5F2EB]/60 border border-[#E5DFD5] text-[#605A53]'
                        : 'bg-[#EBF4EE]/60 border border-[#C2DEC9] text-[#1C1917]'
                    }`}>
                      <span className="text-[10px] font-bold text-[#264235] uppercase block mb-1">v{displayedAgreement.versionNumber} Text:</span>
                      {displayedAgreement.structuredTerms.scopeSummary}
                    </div>
                  </div>
                </div>

                {/* 2. Deliverables Diff */}
                <div className="pt-4 border-t border-[#EFECE6]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#1C1917]">Section 2: Deliverables Specification</span>
                    {comparisonAgreement.structuredTerms.deliverablesSummary === displayedAgreement.structuredTerms.deliverablesSummary ? (
                      <span className="text-[11px] text-[#285C42] font-semibold bg-[#EBF4EE] px-2 py-0.5 rounded">Unchanged</span>
                    ) : (
                      <span className="text-[11px] text-[#92400E] font-semibold bg-[#FEF3C7] px-2 py-0.5 rounded">Modified</span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#F5F2EB]/60 border border-[#E5DFD5] text-[#605A53] leading-relaxed">
                      <span className="text-[10px] font-bold text-[#8A837A] uppercase block mb-1">v{comparisonAgreement.versionNumber} Text:</span>
                      {comparisonAgreement.structuredTerms.deliverablesSummary}
                    </div>
                    <div className={`p-3 rounded-lg leading-relaxed ${
                      comparisonAgreement.structuredTerms.deliverablesSummary === displayedAgreement.structuredTerms.deliverablesSummary
                        ? 'bg-[#F5F2EB]/60 border border-[#E5DFD5] text-[#605A53]'
                        : 'bg-[#EBF4EE]/60 border border-[#C2DEC9] text-[#1C1917]'
                    }`}>
                      <span className="text-[10px] font-bold text-[#264235] uppercase block mb-1">v{displayedAgreement.versionNumber} Text:</span>
                      {displayedAgreement.structuredTerms.deliverablesSummary}
                    </div>
                  </div>
                </div>

                {/* 3. Operational Custom Clauses Diff */}
                <div className="pt-4 border-t border-[#EFECE6]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#1C1917]">Operational &amp; Custom Clauses</span>
                    <span className="text-[11px] text-[#605A53] font-medium">
                      {comparisonAgreement.structuredTerms.customClauses?.length || 0} clauses &rarr; {displayedAgreement.structuredTerms.customClauses?.length || 0} clauses
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[#8A837A] uppercase block">v{comparisonAgreement.versionNumber} Clauses:</span>
                      {comparisonAgreement.structuredTerms.customClauses?.map((c, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-[#F5F2EB]/60 border border-[#E5DFD5]">
                          <span className="font-bold text-[#1C1917] block text-[11px]">{c.title}</span>
                          <p className="text-[11px] text-[#605A53] mt-0.5">{c.content}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[#264235] uppercase block">v{displayedAgreement.versionNumber} Clauses:</span>
                      {displayedAgreement.structuredTerms.customClauses?.map((c, i) => {
                        const existsInOld = comparisonAgreement.structuredTerms.customClauses?.some(
                          (oc) => oc.title === c.title && oc.content === c.content
                        );
                        return (
                          <div
                            key={i}
                            className={`p-2.5 rounded-lg border ${
                              existsInOld
                                ? 'bg-[#F5F2EB]/60 border-[#E5DFD5]'
                                : 'bg-[#EBF4EE]/70 border-[#C2DEC9]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#1C1917] text-[11px]">{c.title}</span>
                              {!existsInOld && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#264235] text-white">
                                  NEW / AMENDED
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#605A53] mt-0.5">{c.content}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-[#E5DFD5] text-[#605A53] text-xs">
              Only one version currently exists for this project. Use &ldquo;Propose Amendment&rdquo; to publish an amended version and see real-time diffs.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CRYPTOGRAPHIC DISTINCTIONS & AUDIT LOG */}
      {activeTab === 'cryptography' && (
        <div className="space-y-6">
          {/* Key Architectural Principle Callout */}
          <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4 text-[#264235]" />
              </div>
              <div className="space-y-1 text-xs">
                <h3 className="font-bold text-[#1C1917]">
                  Cryptographic Consent vs Blockchain Execution
                </h3>
                <p className="text-[#605A53] leading-relaxed">
                  In Fairwork, an SHA-256 fingerprint guarantees <strong>tamper-evidence</strong>, not consent. A cryptographic hash proves what the agreement says, but only counterparty digital signatures prove who agreed to it.
                </p>
              </div>
            </div>
          </div>

          {/* 4 Pillar Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] space-y-2 text-xs shadow-xs">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#264235]" />
                <span className="font-bold text-[#1C1917]">1. Canonical Agreement Text</span>
              </div>
              <p className="text-[#605A53] leading-relaxed">
                Deterministic JSON string serialization of scope, deliverables, and clauses. Keys are sorted lexicographically before hashing to guarantee that identical terms always yield the exact same bitwise output.
              </p>
              <div className="pt-2 font-mono text-[10px] text-[#8A837A] bg-[#FAF7F2] p-2 rounded border border-[#EFECE6]">
                canonicalizeAgreement(terms, versionNumber) &rarr; Deterministic String
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] space-y-2 text-xs shadow-xs">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-[#264235]" />
                <span className="font-bold text-[#1C1917]">2. SHA-256 Content Hash</span>
              </div>
              <p className="text-[#605A53] leading-relaxed">
                A 256-bit cryptographic digest calculated over the canonical agreement text. Any modification of a single character instantly changes the resulting hash, making unauthorized edits immediately detectable.
              </p>
              <div className="pt-2 font-mono text-[10px] text-[#285C42] bg-[#FAF7F2] p-2 rounded border border-[#EFECE6] truncate">
                {displayedAgreement.agreementHash}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] space-y-2 text-xs shadow-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#264235]" />
                <span className="font-bold text-[#1C1917]">3. Counterparty Signatures (Consent)</span>
              </div>
              <p className="text-[#605A53] leading-relaxed">
                A hash alone does not prove agreement. Fairwork records independent signature hashes and ISO timestamps for both Client and Freelancer. Rule 7 dictates that any amendment resets counterparty consent.
              </p>
              <div className="pt-2 font-mono text-[10px] text-[#605A53] bg-[#FAF7F2] p-2 rounded border border-[#EFECE6]">
                Both Client &amp; Freelancer must sign before agreement.isActive = true
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] space-y-2 text-xs shadow-xs">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#264235]" />
                <span className="font-bold text-[#1C1917]">4. Escrow &amp; Payment Settlements</span>
              </div>
              <p className="text-[#605A53] leading-relaxed">
                Escrow balances lock actual funds (simulated in demo mode, fiat gateway or on-chain vault in production). Financial transactions cite the agreement hash as their binding legal predicate.
              </p>
              <div className="pt-2 font-mono text-[10px] text-[#605A53] bg-[#FAF7F2] p-2 rounded border border-[#EFECE6]">
                Escrow release strictly contingent on verified acceptance criteria &amp; active agreement
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Amendment Modal */}
      <AmendmentModal
        currentAgreement={displayedAgreement}
        isOpen={isAmendmentOpen}
        onClose={() => setIsAmendmentOpen(false)}
        onProposeAmendment={handleProposeAmendment}
      />
    </div>
  );
};
