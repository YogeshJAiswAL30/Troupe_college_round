import React, { useState } from 'react';
import {
  Upload,
  X,
  FileText,
  Fingerprint,
  Link,
  ShieldCheck,
  CheckSquare,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { FileReference, Milestone } from '../types/fairwork';
import { sha256 } from '../core/crypto';
import { Button } from './ui/Button';

interface DeliverableModalProps {
  milestone: Milestone;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (notes: string, files: FileReference[], externalUrl?: string) => Promise<void>;
}

export const DeliverableModal: React.FC<DeliverableModalProps> = ({
  milestone,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [notes, setNotes] = useState('');
  const [externalUrl, setExternalUrl] = useState('https://github.com/fairwork-demo/repo');
  const [fileName, setFileName] = useState(`${milestone.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_deliverable_v${(milestone.currentRevisionCount || 0) + 1}.zip`);
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(3450000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewedCriteria, setReviewedCriteria] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    milestone.acceptanceCriteria.forEach((c) => {
      initial[c] = false;
    });
    return initial;
  });

  if (!isOpen) return null;

  const allCriteriaChecked = milestone.acceptanceCriteria.every((c) => reviewedCriteria[c]);

  const toggleCriterion = (criterion: string) => {
    setReviewedCriteria((prev) => ({
      ...prev,
      [criterion]: !prev[criterion],
    }));
  };

  const handleSelectAllCriteria = () => {
    const updated: Record<string, boolean> = {};
    milestone.acceptanceCriteria.forEach((c) => {
      updated[c] = true;
    });
    setReviewedCriteria(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    setIsSubmitting(true);
    try {
      // Compute cryptographic SHA-256 fingerprint in the browser
      const mockFileHash = await sha256(`FILE_CONTENT_${fileName}_${Date.now()}_${notes}`);
      const simulatedFile: FileReference = {
        name: fileName,
        url: `https://storage.fairwork.sim/${milestone.id}/${fileName}`,
        sizeBytes: fileSizeBytes,
        mimeType: fileName.endsWith('.zip') ? 'application/zip' : 'application/octet-stream',
        sha256Hash: mockFileHash,
        isSimulated: true,
      };

      await onSubmit(notes, [simulatedFile], externalUrl);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1917]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-[#E5DFD5] shadow-xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#EFECE6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EBF4EE] text-[#285C42] flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1C1917]">
                Submit Milestone Deliverable
              </h3>
              <p className="text-xs text-[#605A53]">
                {milestone.title} &bull; Revision #{(milestone.currentRevisionCount || 0) + 1}
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
          {/* Acceptance Criteria Pre-Submission Checklist */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-[#264235]" />
                Self-Review Against Acceptance Criteria
              </span>
              <button
                type="button"
                onClick={handleSelectAllCriteria}
                className="text-[11px] font-semibold text-[#264235] hover:underline cursor-pointer"
              >
                Mark All Verified
              </button>
            </div>
            <p className="text-[11px] text-[#605A53]">
              Verify each criterion agreed in the contract before submitting for client sign-off.
            </p>

            <div className="space-y-1.5 pt-1">
              {milestone.acceptanceCriteria.map((criterion, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-[#E5DFD5] hover:bg-[#FAF7F2] cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(reviewedCriteria[criterion])}
                    onChange={() => toggleCriterion(criterion)}
                    className="mt-0.5 rounded text-[#264235] focus:ring-[#264235]"
                  />
                  <span className="text-[#1C1917] leading-snug">{criterion}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submission Notes */}
          <div>
            <label className="text-xs font-bold text-[#1C1917] block mb-1">
              Submission Notes &amp; Verification Evidence *
            </label>
            <textarea
              required
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain how the deliverables fulfill the criteria, including reproduction steps, deployment links, and testing vectors..."
              className="w-full text-xs p-3 rounded-xl border border-[#E5DFD5] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#264235]"
            />
          </div>

          {/* Repository or Preview URL */}
          <div>
            <label className="text-xs font-bold text-[#1C1917] block mb-1">
              Repository URL, Preview Staging, or Pull Request Link
            </label>
            <div className="relative">
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://github.com/org/repo/pull/12"
                className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#E5DFD5] bg-white text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#264235]"
              />
              <Link className="w-3.5 h-3.5 text-[#8A837A] absolute left-3 top-3" />
            </div>
          </div>

          {/* File Attachment & Hash Transparency */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1C1917] block">
              Deliverable File (Simulated Storage)
            </label>
            <div className="p-3.5 rounded-xl border border-dashed border-[#C2DEC9] bg-[#EBF4EE]/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-[#285C42] shrink-0" />
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="text-xs font-mono font-medium text-[#1C1917] bg-transparent border-none focus:outline-none truncate w-full"
                />
              </div>
              <span className="text-[11px] text-[#285C42] font-mono shrink-0 ml-2">
                {(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>

            {/* SHA-256 Explanation & Disclosure */}
            <div className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] text-[11px] text-[#605A53] flex items-start gap-2">
              <Fingerprint className="w-4 h-4 text-[#264235] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#1C1917]">Cryptographic Fingerprint:</strong> A browser SHA-256 hash will be computed upon submission.
                <span className="block text-[10px] text-[#8A837A] mt-0.5">
                  Notice: A file hash proves file integrity and detects tampering; it does not independently prove quality or correctness.
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
              disabled={isSubmitting || !notes.trim()}
              leftIcon={<Upload className="w-3.5 h-3.5" />}
            >
              {isSubmitting ? 'Computing Hash & Submitting...' : 'Sign & Submit Deliverable'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
