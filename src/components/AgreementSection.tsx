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
} from 'lucide-react';
import { Agreement, UserProfile } from '../types/fairwork';

interface AgreementSectionProps {
  agreement: Agreement;
  currentUser: UserProfile;
  clientUser: UserProfile;
  freelancerUser: UserProfile;
  onAcceptAgreement: () => void;
  onOpenAmendmentModal: () => void;
}

export const AgreementSection: React.FC<AgreementSectionProps> = ({
  agreement,
  currentUser,
  clientUser,
  freelancerUser,
  onAcceptAgreement,
  onOpenAmendmentModal,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);

  const clientAccepted = Boolean(agreement.acceptedBy[clientUser.id]);
  const freelancerAccepted = Boolean(agreement.acceptedBy[freelancerUser.id]);
  const userHasAccepted = Boolean(agreement.acceptedBy[currentUser.id]);
  const isParticipant =
    currentUser.id === clientUser.id || currentUser.id === freelancerUser.id;

  const handleCopyHash = () => {
    if (agreement.agreementHash) {
      navigator.clipboard.writeText(agreement.agreementHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Verifiable Project Agreement
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                v{agreement.versionNumber}
              </span>
              {agreement.isActive ? (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active &amp; Binding
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Awaiting Counterparty Signature
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Relationship #1: The accepted agreement and its immutable version terms
            </p>
          </div>
        </div>

        {/* Action Buttons: Amendment or Sign */}
        <div className="flex items-center gap-2">
          {isParticipant && !userHasAccepted && (
            <button
              onClick={onAcceptAgreement}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition"
            >
              <ShieldCheck className="w-4 h-4" />
              Sign &amp; Accept v{agreement.versionNumber}
            </button>
          )}

          {isParticipant && (
            <button
              onClick={onOpenAmendmentModal}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition border border-slate-200 dark:border-slate-700"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Propose Amendment (Rule 7)
            </button>
          )}
        </div>
      </div>

      {/* Dual Signature Consent Tracker (Rule 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Client Acceptance Box */}
        <div
          className={`p-3.5 rounded-xl border ${
            clientAccepted
              ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40'
              : 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/40'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Client Consent: {clientUser.displayName}
            </span>
            {clientAccepted ? (
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Signed
              </span>
            ) : (
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Pending Signature
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {clientAccepted
              ? `Accepted at: ${new Date(
                  agreement.acceptedBy[clientUser.id].acceptedAt
                ).toLocaleDateString()} | ${
                  agreement.acceptedBy[clientUser.id].signatureHash ?? 'Signed'
                }`
              : 'Action required: Client must sign this version.'}
          </div>
        </div>

        {/* Freelancer Acceptance Box */}
        <div
          className={`p-3.5 rounded-xl border ${
            freelancerAccepted
              ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40'
              : 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/40'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Freelancer Consent: {freelancerUser.displayName}
            </span>
            {freelancerAccepted ? (
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Signed
              </span>
            ) : (
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Pending Signature
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {freelancerAccepted
              ? `Accepted at: ${new Date(
                  agreement.acceptedBy[freelancerUser.id].acceptedAt
                ).toLocaleDateString()} | ${
                  agreement.acceptedBy[freelancerUser.id].signatureHash ?? 'Signed'
                }`
              : 'Action required: Freelancer must sign this version.'}
          </div>
        </div>
      </div>

      {/* Structured Terms */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3 mb-4">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
            Scope Summary
          </span>
          <p className="text-xs text-slate-800 dark:text-slate-200">
            {agreement.structuredTerms.scopeSummary}
          </p>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
            Deliverables Specification
          </span>
          <p className="text-xs text-slate-800 dark:text-slate-200">
            {agreement.structuredTerms.deliverablesSummary}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">IP Transfer Clause</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {agreement.structuredTerms.intellectualPropertyClause === 'ON_PAYMENT'
                ? 'Transfers upon Escrow Release'
                : agreement.structuredTerms.intellectualPropertyClause}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Confidentiality</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {agreement.structuredTerms.confidentiality ? 'Standard NDA Active' : 'Public'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Jurisdiction &amp; Dispute</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {agreement.structuredTerms.governingLaw ?? 'Arbitration'}
            </span>
          </div>
        </div>
      </div>

      {/* SHA-256 Fingerprint */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <Fingerprint className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="font-medium text-indigo-900 dark:text-indigo-300 shrink-0">
            SHA-256 Agreement Fingerprint:
          </span>
          <code className="text-[11px] text-indigo-700 dark:text-indigo-400 font-mono truncate">
            {agreement.agreementHash ?? 'Computing fingerprint...'}
          </code>
        </div>
        <button
          onClick={handleCopyHash}
          className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium flex items-center gap-1 shrink-0 transition"
        >
          {copiedHash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copiedHash ? 'Copied' : 'Copy Hash'}
        </button>
      </div>
    </div>
  );
};
