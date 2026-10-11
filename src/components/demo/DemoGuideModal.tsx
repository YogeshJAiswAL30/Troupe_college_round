import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  UserCheck,
  ShieldCheck,
  CreditCard,
  Upload,
  Scale,
  FileText,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFairwork } from '../../context/FairworkContext';
import { Button } from '../ui/Button';

interface DemoStep {
  step: number;
  title: string;
  role: 'CLIENT' | 'FREELANCER' | 'ARBITRATOR';
  targetPath: string;
  description: string;
  actionHint: string;
}

const DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    title: 'Enter as Client & Inspect Project A',
    role: 'CLIENT',
    targetPath: '/app/projects/prj_ecom',
    description: 'Alice oversees the ₹30,000 E-commerce Website Platform with 4 milestones totaling the full budget.',
    actionHint: 'View the 4 milestones: UI/UX (Released ₹5k), Frontend (Submitted ₹12k), Backend (Funded ₹8k), Final (Awaiting ₹5k).',
  },
  {
    step: 2,
    title: 'Review Verifiable Agreement v2',
    role: 'CLIENT',
    targetPath: '/app/agreements',
    description: 'Examine the active Agreement v2 with Lighthouse >= 90 SLA and SHA-256 fingerprint.',
    actionHint: 'Compare v1 vs v2 to observe version history and cryptographic acceptance signatures.',
  },
  {
    step: 3,
    title: 'Examine Payments & Escrow Ledger',
    role: 'CLIENT',
    targetPath: '/app/payments',
    description: 'Verify the zero-sum accounting: Total ₹30k = ₹5k released + ₹20k locked in escrow + ₹5k unfunded.',
    actionHint: 'Click "Simulate Escrow Deposit" on unfunded milestone to observe balance updates.',
  },
  {
    step: 4,
    title: 'Switch Persona to Freelancer (Bob)',
    role: 'FREELANCER',
    targetPath: '/app',
    description: 'Experience symmetric protection: Bob sees clear funding warnings and delivery submission controls.',
    actionHint: 'Switch to Bob Martinez using the persona switcher or the direct button below.',
  },
  {
    step: 5,
    title: 'Submit Deliverable with SHA-256 Hash',
    role: 'FREELANCER',
    targetPath: '/app/projects/prj_ecom/milestones/ms_ecom_03',
    description: 'On Milestone 3 (Backend Integration), deliver verifiable proof with browser-calculated SHA-256 hash.',
    actionHint: 'Upload or generate simulated file hash and submit for client review.',
  },
  {
    step: 6,
    title: 'Inspect Brand Identity Revision Cycle',
    role: 'CLIENT',
    targetPath: '/app/projects/prj_brand',
    description: 'Project B showcases a live revision workflow: Bob submitted Revision #2 following Alice\'s feedback.',
    actionHint: 'Inspect Milestone 2 review history to verify structured feedback and acceptance criteria checklist.',
  },
  {
    step: 7,
    title: 'Inspect Project C Dispute & Locked Escrow',
    role: 'CLIENT',
    targetPath: '/app/disputes',
    description: 'Project C (3D Portfolio) features an active dispute over mobile Safari frame rate SLA breach.',
    actionHint: 'Verify Rule 4: Ordinary payment release is locked while dispute is open. Review the 75/25 settlement proposal.',
  },
  {
    step: 8,
    title: 'Audit Complete Verifiable Activity Trail',
    role: 'CLIENT',
    targetPath: '/app/activity',
    description: 'Audit every timestamped agreement signature, delivery hash, and settlement proposal.',
    actionHint: 'Filter by category (Agreements, Deliveries, Payments, Disputes) and search by transaction ref.',
  },
];

export const DemoGuideModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, allUsers, setCurrentUser, handleResetDemoData, showToast } = useFairwork();
  const navigate = useNavigate();
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = DEMO_STEPS[activeStepIndex];

  const handleGoToStep = (index: number) => {
    setActiveStepIndex(index);
    const step = DEMO_STEPS[index];
    // Switch role if needed
    if (step.role === 'CLIENT' && currentUser.role !== 'CLIENT') {
      setCurrentUser(allUsers.client_01);
    } else if (step.role === 'FREELANCER' && currentUser.role !== 'FREELANCER') {
      setCurrentUser(allUsers.freelancer_01);
    } else if (step.role === 'ARBITRATOR' && currentUser.role !== 'ARBITRATOR') {
      setCurrentUser(allUsers.arbitrator_01);
    }
    navigate(step.targetPath);
    onClose();
  };

  const handleSwitchToStepRole = () => {
    if (currentStep.role === 'CLIENT') {
      setCurrentUser(allUsers.client_01);
      showToast({ type: 'info', title: 'Persona Switched', message: 'Switched to Client: Nexus Ventures (Alice)' });
    } else if (currentStep.role === 'FREELANCER') {
      setCurrentUser(allUsers.freelancer_01);
      showToast({ type: 'info', title: 'Persona Switched', message: 'Switched to Freelancer: Bob Martinez' });
    } else if (currentStep.role === 'ARBITRATOR') {
      setCurrentUser(allUsers.arbitrator_01);
      showToast({ type: 'info', title: 'Persona Switched', message: 'Switched to Arbitrator: Claire Justice' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#EFECE6] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#264235] text-white flex items-center justify-center shadow-xs">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#1C1917]">
                  Hackathon Demo Presentation Guide
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-bold">
                  &lt; 5 min Walkthrough
                </span>
              </div>
              <p className="text-xs text-[#605A53] mt-0.5">
                Structured interactive journey highlighting verifiable escrow, dispute resolution, and audit trail
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#E5DFD5] text-[#8A837A] hover:text-[#1C1917] hover:bg-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Steps Carousel / List */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Active Step Card */}
          <div className="p-5 rounded-2xl border-2 border-[#264235] bg-[#FAF7F2] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#264235] text-white text-xs font-bold flex items-center justify-center">
                  {currentStep.step}
                </span>
                <span className="font-bold text-[#1C1917] text-sm">
                  {currentStep.title}
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                currentStep.role === 'CLIENT'
                  ? 'bg-[#E8F0FE] text-[#1E429F] border-[#D0E1FD]'
                  : currentStep.role === 'FREELANCER'
                  ? 'bg-[#EBF4EE] text-[#285C42] border-[#C2DEC9]'
                  : 'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]'
              }`}>
                Recommended Persona: {currentStep.role}
              </span>
            </div>

            <p className="text-xs text-[#292524] leading-relaxed">
              {currentStep.description}
            </p>

            <div className="p-3 rounded-xl bg-white border border-[#E5DFD5] text-xs text-[#605A53] flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
              <span><strong>Action:</strong> {currentStep.actionHint}</span>
            </div>

            {/* Quick Actions for Active Step */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EFECE6]">
              {currentUser.role !== currentStep.role ? (
                <button
                  onClick={handleSwitchToStepRole}
                  className="px-3 py-1.5 rounded-lg border border-[#E5DFD5] bg-white text-xs font-semibold text-[#1C1917] hover:bg-[#FAF7F2] flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#264235]" />
                  <span>Switch to {currentStep.role} Persona</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-[#285C42] font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Active Persona Matches Step</span>
                </div>
              )}

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleGoToStep(activeStepIndex)}
                className="gap-1.5"
              >
                <span>Jump to View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Stepper Timeline List */}
          <div>
            <h4 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-2.5">
              Complete 8-Step Demo Sequence:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_STEPS.map((s, idx) => (
                <button
                  key={s.step}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between gap-2 ${
                    activeStepIndex === idx
                      ? 'border-[#264235] bg-[#FAF7F2] font-bold text-[#1C1917]'
                      : 'border-[#E5DFD5] bg-white hover:bg-[#FAF7F2] text-[#605A53]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                      activeStepIndex === idx ? 'bg-[#264235] text-white' : 'bg-[#EFECE6] text-[#605A53]'
                    }`}>
                      {s.step}
                    </span>
                    <span className="truncate">{s.title}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8A837A] shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Reset Demo State Section */}
          <div className="p-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#991B1B]">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Sandbox State</span>
              </div>
              <p className="text-[11px] text-[#7F1D1D] mt-0.5">
                Restores the 3 sample projects, milestones, payments, and disputes back to initial seed state.
              </p>
            </div>
            <button
              onClick={() => {
                handleResetDemoData();
                setActiveStepIndex(0);
              }}
              className="px-3 py-1.5 rounded-lg border border-[#FECACA] bg-white text-[#991B1B] hover:bg-[#FEE2E2] font-semibold text-xs transition cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
            >
              Reset Demo Data
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#EFECE6] bg-[#FAF7F2] flex items-center justify-between text-xs">
          <button
            onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={activeStepIndex === 0}
            className="px-3 py-1.5 rounded-lg border border-[#E5DFD5] bg-white text-[#605A53] hover:text-[#1C1917] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Previous Step
          </button>

          <span className="text-[11px] text-[#8A837A] font-mono">
            Step {activeStepIndex + 1} of {DEMO_STEPS.length}
          </span>

          <button
            onClick={() => setActiveStepIndex((prev) => Math.min(DEMO_STEPS.length - 1, prev + 1))}
            disabled={activeStepIndex === DEMO_STEPS.length - 1}
            className="px-3 py-1.5 rounded-lg border border-[#E5DFD5] bg-white text-[#605A53] hover:text-[#1C1917] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-semibold"
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  );
};
