import React, { useState } from 'react';
import { Edit3, X, AlertCircle } from 'lucide-react';
import { Agreement, AgreementStructuredTerms } from '../types/fairwork';

interface AmendmentModalProps {
  currentAgreement: Agreement;
  isOpen: boolean;
  onClose: () => void;
  onProposeAmendment: (newTerms: AgreementStructuredTerms) => Promise<void>;
}

export const AmendmentModal: React.FC<AmendmentModalProps> = ({
  currentAgreement,
  isOpen,
  onClose,
  onProposeAmendment,
}) => {
  const [scope, setScope] = useState(currentAgreement.structuredTerms.scopeSummary);
  const [deliverables, setDeliverables] = useState(
    currentAgreement.structuredTerms.deliverablesSummary
  );
  const [ipClause, setIpClause] = useState(
    currentAgreement.structuredTerms.intellectualPropertyClause
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newTerms: AgreementStructuredTerms = {
        ...currentAgreement.structuredTerms,
        scopeSummary: scope,
        deliverablesSummary: deliverables,
        intellectualPropertyClause: ipClause,
      };

      await onProposeAmendment(newTerms);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1917]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF7F2] rounded-2xl max-w-xl w-full p-6 border border-[#E5DFD5] shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5DFD5]">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-[#264235]" />
            <h3 className="text-base font-bold text-[#1C1917]">
              Propose Agreement Amendment (Rule 7)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8A837A] hover:text-[#1C1917] hover:bg-[#EFECE6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rule 7 Explanatory Callout */}
        <div className="p-3.5 rounded-xl bg-[#FEF3C7]/40 border border-[#FDE68A] text-xs text-[#92400E] mb-5 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-[#92400E]">Rule 7 Cryptographic &amp; Consent Invariant:</strong> Modifying accepted terms increments the agreement version from{' '}
            <code className="bg-[#FEF3C7] px-1.5 py-0.5 rounded font-mono font-bold text-[#78350F]">
              v{currentAgreement.versionNumber}
            </code>{' '}
            to{' '}
            <code className="bg-[#FEF3C7] px-1.5 py-0.5 rounded font-mono font-bold text-[#78350F]">
              v{currentAgreement.versionNumber + 1}
            </code>
            . The previous counterparty consent is reset, and both parties must digitally sign before the amended terms become active.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#1C1917] block mb-1">
              Amended Scope Summary *
            </label>
            <textarea
              required
              rows={3}
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-[#E5DFD5] bg-white text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#264235] focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#1C1917] block mb-1">
              Amended Deliverables Specification *
            </label>
            <textarea
              required
              rows={3}
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-[#E5DFD5] bg-white text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#264235] focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#1C1917] block mb-1">
              Intellectual Property Assignment Clause
            </label>
            <select
              value={ipClause}
              onChange={(e) => setIpClause(e.target.value as AgreementStructuredTerms['intellectualPropertyClause'])}
              className="w-full text-xs p-2.5 rounded-xl border border-[#E5DFD5] bg-white text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#264235] focus:border-transparent"
            >
              <option value="ON_PAYMENT">ON_PAYMENT (Transfers upon escrow release)</option>
              <option value="UPON_CREATION">UPON_CREATION (Immediate assignment)</option>
              <option value="CUSTOM">CUSTOM (Subject to separate agreement)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E5DFD5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#605A53] hover:bg-[#EFECE6] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#264235] hover:bg-[#1E352B] text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Computing New SHA-256 Hash...' : `Publish v${currentAgreement.versionNumber + 1} Amendment`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
