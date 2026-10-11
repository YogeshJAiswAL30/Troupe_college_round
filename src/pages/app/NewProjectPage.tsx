import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileText,
  DollarSign,
  Calendar,
  Layers,
  Scale,
  Lock,
} from 'lucide-react';
import { useFairwork } from '../../context/FairworkContext';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { StepProgress, StepItem } from '../../components/ui/Progress';
import { formatMoney } from '../../core/money';

export type PaymentReleaseRule = 'CLIENT_APPROVAL_REQUIRED' | 'AUTO_RELEASE_ON_EXPIRY' | 'MUTUAL_APPROVAL';
export type DisputeResolutionMethod = 'MUTUAL_SETTLEMENT_THEN_ARBITRATION' | 'ARBITRATION_ONLY';
export type ScopeChangePolicy = 'EXPLICIT_VERSIONED_AMENDMENT_REQUIRED' | 'FLEXIBLE_MINOR_ADJUSTMENTS';

interface MilestoneDraft {
  title: string;
  description: string;
  amountDollars: number;
  deadline: string;
  acceptanceCriteria: string[];
  reviewPeriodDays: number;
  maxRevisions: number;
}

export const NewProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { allUsers, handleCreateProject, currentUser } = useFairwork();

  const [currentStep, setCurrentStep] = useState<number>(0);

  // Step 1: Project Details State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Full-Stack Web3 Engineering');
  const [budgetDollars, setBudgetDollars] = useState<number>(5000);
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'USDC'>('USD');
  const [freelancerId, setFreelancerId] = useState('freelancer_01');
  const [startDate, setStartDate] = useState('2026-03-01');
  const [targetCompletionDate, setTargetCompletionDate] = useState('2026-04-30');

  // Step 2: Milestones State
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([
    {
      title: 'Milestone 1: Architectural Foundation & Invariant Engine',
      description: 'Core state machine implementation, invariant rules, and unit test coverage.',
      amountDollars: 2500,
      deadline: '2026-03-20',
      acceptanceCriteria: [
        'State transition tests pass 100%',
        'Zero minor units floating-point math rounding errors',
      ],
      reviewPeriodDays: 5,
      maxRevisions: 2,
    },
    {
      title: 'Milestone 2: Production UI & Cryptographic Evidence Engine',
      description: 'Interactive dashboard, file SHA-256 fingerprinting, and escrow release ledger.',
      amountDollars: 2500,
      deadline: '2026-04-30',
      acceptanceCriteria: [
        'Client and Freelancer responsive dashboards complete',
        'End-to-end acceptance and simulated release verified',
      ],
      reviewPeriodDays: 5,
      maxRevisions: 2,
    },
  ]);

  // Step 3: Agreement Structured Terms State
  const [paymentReleaseRule, setPaymentReleaseRule] = useState<PaymentReleaseRule>(
    'CLIENT_APPROVAL_REQUIRED'
  );
  const [reviewWindowDays, setReviewWindowDays] = useState<number>(5);
  const [maxRevisions, setMaxRevisions] = useState<number>(2);
  const [disputeMethod, setDisputeMethod] = useState<DisputeResolutionMethod>(
    'MUTUAL_SETTLEMENT_THEN_ARBITRATION'
  );
  const [escalationTimeoutDays, setEscalationTimeoutDays] = useState<number>(7);
  const [autoApproveAfterReviewDays, setAutoApproveAfterReviewDays] = useState<boolean>(true);
  const [scopeChangePolicy, setScopeChangePolicy] = useState<ScopeChangePolicy>(
    'EXPLICIT_VERSIONED_AMENDMENT_REQUIRED'
  );

  // Step definitions for wizard
  const steps: StepItem[] = [
    { id: 'step_details', title: 'Project Details', description: 'Scope & budget' },
    { id: 'step_milestones', title: 'Milestones', description: 'Criteria & amounts' },
    { id: 'step_terms', title: 'Agreement Terms', description: 'Policies & rules' },
    { id: 'step_review', title: 'Review & Confirm', description: 'Dual sign preview' },
  ];

  // Live Rule 1 validation calculation
  const totalAllocatedDollars = milestones.reduce((sum, m) => sum + (Number(m.amountDollars) || 0), 0);
  const differenceDollars = budgetDollars - totalAllocatedDollars;
  const isBudgetBalanced = differenceDollars === 0;

  // Milestone actions
  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: `Milestone ${milestones.length + 1}`,
        description: 'Detail clear deliverable and verification expectations.',
        amountDollars: Math.max(0, differenceDollars),
        deadline: '2026-05-15',
        acceptanceCriteria: ['Verifiable proof of work provided'],
        reviewPeriodDays: reviewWindowDays,
        maxRevisions: maxRevisions,
      },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, idx) => idx !== index));
  };

  const handleUpdateMilestone = (index: number, field: keyof MilestoneDraft, value: unknown) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleAddCriterion = (milestoneIndex: number) => {
    const updated = [...milestones];
    updated[milestoneIndex].acceptanceCriteria.push('New acceptance criterion');
    setMilestones(updated);
  };

  const handleRemoveCriterion = (milestoneIndex: number, criterionIndex: number) => {
    const updated = [...milestones];
    if (updated[milestoneIndex].acceptanceCriteria.length <= 1) return;
    updated[milestoneIndex].acceptanceCriteria = updated[milestoneIndex].acceptanceCriteria.filter(
      (_, idx) => idx !== criterionIndex
    );
    setMilestones(updated);
  };

  const handleUpdateCriterion = (
    milestoneIndex: number,
    criterionIndex: number,
    text: string
  ) => {
    const updated = [...milestones];
    updated[milestoneIndex].acceptanceCriteria[criterionIndex] = text;
    setMilestones(updated);
  };

  const canProceedFromStep1 = title.trim().length > 3 && description.trim().length > 10 && budgetDollars > 0;
  const canProceedFromStep2 = isBudgetBalanced && milestones.every((m) => m.title.trim() && m.amountDollars > 0);
  const canProceedFromStep3 = reviewWindowDays >= 1 && maxRevisions >= 0;

  const handleFinalSubmit = () => {
    if (!isBudgetBalanced || !title.trim()) return;

    const newId = handleCreateProject({
      title,
      description,
      budgetDollars,
      currency,
      freelancerId,
      milestones: milestones.map((m) => ({
        title: m.title,
        description: m.description,
        amountDollars: m.amountDollars,
        deadline: m.deadline,
        acceptanceCriteria: m.acceptanceCriteria,
      })),
    });

    navigate(`/app/projects/${newId}`);
  };

  const freelancerOptions = Object.values(allUsers)
    .filter((u) => u.role === 'FREELANCER')
    .map((u) => ({ value: u.id, label: `${u.displayName} (${u.email})` }));

  const assignedFreelancer = allUsers[freelancerId];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5DFD5]">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            onClick={() => navigate('/app/projects')}
          >
            Cancel
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1C1917]">
              Create Verifiable Project Agreement
            </h1>
            <p className="text-xs text-[#605A53]">
              Configure verifiable milestones, budget allocation, and dispute terms
            </p>
          </div>
        </div>
      </div>

      {/* 4-Step Progress Indicator */}
      <Card className="p-4 bg-white">
        <StepProgress
          steps={steps}
          currentStepIndex={currentStep}
          onStepClick={(stepIdx) => {
            // Allow clicking back to earlier steps or to next step if valid
            if (stepIdx < currentStep) {
              setCurrentStep(stepIdx);
            } else if (stepIdx === 1 && canProceedFromStep1) {
              setCurrentStep(1);
            } else if (stepIdx === 2 && canProceedFromStep1 && canProceedFromStep2) {
              setCurrentStep(2);
            } else if (stepIdx === 3 && canProceedFromStep1 && canProceedFromStep2 && canProceedFromStep3) {
              setCurrentStep(3);
            }
          }}
        />
      </Card>

      {/* STEP 1: PROJECT DETAILS */}
      {currentStep === 0 && (
        <Card className="p-6 space-y-5">
          <div className="border-b border-[#EFECE6] pb-3">
            <h2 className="text-base font-bold text-[#1C1917]">
              Step 1: Project Scope &amp; Target Budget
            </h2>
            <p className="text-xs text-[#605A53] mt-0.5">
              Specify the overarching project deliverable, assigned talent, and contract timeframe.
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Project Title *"
              required
              placeholder="e.g. Next.js SaaS Platform & Payment Integration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              helperText="Give your project a clear, recognizable name."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Domain Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: 'Full-Stack Web3 Engineering', label: 'Full-Stack Web3 Engineering' },
                  { value: 'Smart Contract Audit & Security', label: 'Smart Contract Audit & Security' },
                  { value: 'AI Agent & LLM Workflow System', label: 'AI Agent & LLM Workflow System' },
                  { value: 'Fintech UI/UX & Design System', label: 'Fintech UI/UX & Design System' },
                ]}
              />

              <Select
                label="Assigned Freelancer *"
                value={freelancerId}
                onChange={(e) => setFreelancerId(e.target.value)}
                options={freelancerOptions}
                helperText="Both parties must digitally sign before work commences."
              />
            </div>

            <Textarea
              label="Scope Overview & Deliverable Summary *"
              required
              rows={4}
              placeholder="Detail the overall objective, expected output, and high-level requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              helperText="This description forms the preamble of the cryptographically hashed agreement."
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <Input
                label="Total Contract Budget *"
                type="number"
                min="1"
                required
                value={budgetDollars}
                onChange={(e) => setBudgetDollars(Number(e.target.value) || 0)}
                helperText="Sum of all milestones must match this exactly (Rule 1)."
              />

              <Select
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as typeof currency)}
                options={[
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'GBP', label: 'GBP (£)' },
                  { value: 'USDC', label: 'USDC (Stablecoin)' },
                ]}
              />

              <Input
                label="Target Completion Date"
                type="date"
                value={targetCompletionDate}
                onChange={(e) => setTargetCompletionDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#EFECE6]">
            <span className="text-xs text-[#8A837A]">
              Next: Define verifiable milestones and criteria
            </span>
            <Button
              variant="primary"
              disabled={!canProceedFromStep1}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => setCurrentStep(1)}
            >
              Continue to Milestones
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: MILESTONES & ACCEPTANCE CRITERIA */}
      {currentStep === 1 && (
        <Card className="p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFECE6] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#1C1917]">
                Step 2: Milestones &amp; Acceptance Criteria
              </h2>
              <p className="text-xs text-[#605A53] mt-0.5">
                Every milestone requires explicit verification criteria. Milestone budgets must match total contract budget (Rule 1).
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleAddMilestone}
            >
              Add Milestone
            </Button>
          </div>

          {/* Rule 1 Live Budget Calculator */}
          <div
            className={`p-4 rounded-xl border text-xs flex items-center justify-between shadow-xs ${
              isBudgetBalanced
                ? 'bg-[#EBF4EE] border-[#C2DEC9] text-[#285C42]'
                : 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]'
            }`}
          >
            <div className="flex items-center gap-2">
              {isBudgetBalanced ? (
                <CheckCircle2 className="w-5 h-5 text-[#285C42] shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[#92400E] shrink-0" />
              )}
              <div>
                <span className="font-bold block">
                  Rule 1 Invariant: Contract Total ${budgetDollars.toLocaleString()} &bull; Milestone Sum ${totalAllocatedDollars.toLocaleString()}
                </span>
                <span className="text-[11px] opacity-90">
                  {isBudgetBalanced
                    ? 'All milestone allocations reconcile exactly with total contract budget.'
                    : differenceDollars > 0
                    ? `Allocate the remaining $${differenceDollars.toLocaleString()} across your milestones.`
                    : `Reduce milestone amounts by $${Math.abs(differenceDollars).toLocaleString()} to balance.`}
                </span>
              </div>
            </div>

            <span className="font-mono font-bold text-sm">
              {isBudgetBalanced ? 'BALANCED' : `$${differenceDollars.toLocaleString()}`}
            </span>
          </div>

          {/* Milestones List */}
          <div className="space-y-4">
            {milestones.map((milestone, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2]/50 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#264235] text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-[#1C1917] uppercase tracking-wide">
                      Milestone #{idx + 1}
                    </span>
                  </div>

                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="text-[#991B1B] hover:text-[#7F1D1D] p-1 cursor-pointer text-xs flex items-center gap-1 font-medium"
                      title="Remove milestone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Input
                      label="Milestone Title *"
                      required
                      value={milestone.title}
                      onChange={(e) => handleUpdateMilestone(idx, 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      label="Amount ($) *"
                      type="number"
                      min="1"
                      required
                      value={milestone.amountDollars}
                      onChange={(e) =>
                        handleUpdateMilestone(idx, 'amountDollars', Number(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Input
                      label="Description & Deliverable"
                      value={milestone.description}
                      onChange={(e) => handleUpdateMilestone(idx, 'description', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      label="Target Deadline"
                      type="date"
                      value={milestone.deadline}
                      onChange={(e) => handleUpdateMilestone(idx, 'deadline', e.target.value)}
                    />
                  </div>
                </div>

                {/* Acceptance Criteria Checklist Editor */}
                <div className="space-y-2 pt-2 border-t border-[#EFECE6]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1C1917]">
                      Acceptance Criteria (Checklist for Review)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddCriterion(idx)}
                      className="text-xs text-[#264235] font-semibold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Criterion
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {milestone.acceptanceCriteria.map((crit, cIdx) => (
                      <div key={cIdx} className="flex items-center gap-2">
                        <span className="text-[11px] text-[#8A837A] font-mono w-4">
                          {cIdx + 1}.
                        </span>
                        <input
                          type="text"
                          value={crit}
                          onChange={(e) => handleUpdateCriterion(idx, cIdx, e.target.value)}
                          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-[#E5DFD5] bg-white focus:outline-none focus:ring-1 focus:ring-[#264235]"
                          placeholder="Specific verifiable acceptance condition..."
                        />
                        {milestone.acceptanceCriteria.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCriterion(idx, cIdx)}
                            className="text-[#8A837A] hover:text-[#991B1B] p-1 cursor-pointer"
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#EFECE6]">
            <Button
              variant="secondary"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => setCurrentStep(0)}
            >
              Back to Details
            </Button>
            <Button
              variant="primary"
              disabled={!canProceedFromStep2}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => setCurrentStep(2)}
            >
              Continue to Agreement Terms
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: AGREEMENT TERMS & POLICIES */}
      {currentStep === 2 && (
        <Card className="p-6 space-y-5">
          <div className="border-b border-[#EFECE6] pb-3">
            <h2 className="text-base font-bold text-[#1C1917]">
              Step 3: Verifiable Agreement Terms &amp; Policies
            </h2>
            <p className="text-xs text-[#605A53] mt-0.5">
              Set transparent, rules-based terms for review periods, revisions, timeouts, and dispute escalations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2]/50 space-y-3">
              <span className="text-xs font-bold text-[#264235] block">
                Escrow Payout Release Rule
              </span>
              <Select
                value={paymentReleaseRule}
                onChange={(e) => setPaymentReleaseRule(e.target.value as PaymentReleaseRule)}
                options={[
                  { value: 'CLIENT_APPROVAL_REQUIRED', label: 'Client Explicit Sign-off Required' },
                  { value: 'AUTO_RELEASE_ON_EXPIRY', label: 'Auto-Release if Review Window Expires' },
                  { value: 'MUTUAL_APPROVAL', label: 'Dual Confirmation Required' },
                ]}
              />
              <p className="text-[11px] text-[#605A53]">
                Payment is locked until the milestone deliverable has been reviewed or timeout elapses.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2]/50 space-y-3">
              <span className="text-xs font-bold text-[#264235] block">
                Review Window &amp; Timeout
              </span>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={reviewWindowDays}
                  onChange={(e) => setReviewWindowDays(Number(e.target.value) || 5)}
                />
                <span className="text-xs text-[#605A53] shrink-0">Days allowed for client review</span>
              </div>
              <p className="text-[11px] text-[#605A53]">
                Protects freelancers from indefinite review delays. Auto-approves after window.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2]/50 space-y-3">
              <span className="text-xs font-bold text-[#264235] block">
                Revision Policy
              </span>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={maxRevisions}
                  onChange={(e) => setMaxRevisions(Number(e.target.value) || 2)}
                />
                <span className="text-xs text-[#605A53] shrink-0">Maximum revisions permitted</span>
              </div>
              <p className="text-[11px] text-[#605A53]">
                Limits scope creep. Additional revisions require an explicit agreement amendment (Rule 7).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2]/50 space-y-3">
              <span className="text-xs font-bold text-[#264235] block">
                Dispute Escalation Framework
              </span>
              <Select
                value={disputeMethod}
                onChange={(e) => setDisputeMethod(e.target.value as DisputeResolutionMethod)}
                options={[
                  {
                    value: 'MUTUAL_SETTLEMENT_THEN_ARBITRATION',
                    label: 'Mutual Negotiation then Neutral Arbitration',
                  },
                  {
                    value: 'ARBITRATION_ONLY',
                    label: 'Direct Third-Party Neutral Arbitration',
                  },
                ]}
              />
              <p className="text-[11px] text-[#605A53]">
                Locks ordinary release and allows mutual split offers or verified mediator resolution.
              </p>
            </div>
          </div>

          {/* Plain Language Legal Disclaimer */}
          <div className="p-4 rounded-xl bg-white border border-[#E5DFD5] text-xs space-y-2">
            <span className="font-bold text-[#1C1917] flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#264235]" />
              Plain-Language Legal &amp; Escrow Clause
            </span>
            <p className="text-[#605A53] leading-relaxed">
              This digital agreement binds Nexus Ventures and {assignedFreelancer?.displayName || 'the assigned freelancer'} to work under the Fairwork verifiable protocol. Funds deposited into simulated escrow remain locked until milestones are approved or a dispute is settled. Material term changes bump the agreement version and require renewed mutual consent (Rule 7).
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#EFECE6]">
            <Button
              variant="secondary"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => setCurrentStep(1)}
            >
              Back to Milestones
            </Button>
            <Button
              variant="primary"
              disabled={!canProceedFromStep3}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => setCurrentStep(3)}
            >
              Proceed to Review &amp; Sign
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: REVIEW & CONFIRM */}
      {currentStep === 3 && (
        <Card className="p-6 space-y-5">
          <div className="border-b border-[#EFECE6] pb-3">
            <h2 className="text-base font-bold text-[#1C1917]">
              Step 4: Final Contract Review &amp; Client Signature
            </h2>
            <p className="text-xs text-[#605A53] mt-0.5">
              Inspect the finalized contract terms before initial digital signature. The agreement becomes active once the freelancer countersigns.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5]">
              <span className="text-[10px] uppercase font-bold text-[#8A837A] block">
                Total Contract Budget
              </span>
              <span className="text-lg font-mono font-bold text-[#1C1917]">
                ${budgetDollars.toLocaleString()} {currency}
              </span>
              <span className="text-[11px] text-[#285C42] block mt-0.5">
                Exact 100% allocation verified
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5]">
              <span className="text-[10px] uppercase font-bold text-[#8A837A] block">
                Milestones Count
              </span>
              <span className="text-lg font-bold text-[#1C1917]">
                {milestones.length} Milestones
              </span>
              <span className="text-[11px] text-[#605A53] block mt-0.5">
                Target: {targetCompletionDate}
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5]">
              <span className="text-[10px] uppercase font-bold text-[#8A837A] block">
                Participants
              </span>
              <span className="font-bold text-[#1C1917] block truncate">
                Client: {currentUser.displayName}
              </span>
              <span className="text-[#605A53] block truncate">
                Freelancer: {assignedFreelancer?.displayName}
              </span>
            </div>
          </div>

          {/* Milestone Breakdown */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wide">
              Contract Milestones &amp; Verification Breakdown
            </h3>
            <div className="border border-[#E5DFD5] rounded-xl divide-y divide-[#EFECE6] overflow-hidden text-xs">
              {milestones.map((m, idx) => (
                <div key={idx} className="p-3.5 bg-white flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1C1917]">
                        #{idx + 1} {m.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FAF7F2] border border-[#E5DFD5] text-[#8A837A]">
                        Due {m.deadline}
                      </span>
                    </div>
                    <p className="text-[#605A53] text-[11px] mt-0.5">
                      {m.description} &bull; {m.acceptanceCriteria.length} acceptance criteria checklist
                    </p>
                  </div>
                  <span className="font-mono font-bold text-[#1C1917] shrink-0 text-sm">
                    ${m.amountDollars.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Agreement Dual Signature Notice */}
          <div className="p-4 rounded-xl border border-[#C2DEC9] bg-[#EBF4EE]/40 text-xs space-y-1.5">
            <div className="font-bold text-[#285C42] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#285C42]" />
              Digital Agreement v1 Ready for Signature
            </div>
            <p className="text-[#264235] leading-relaxed">
              By confirming, this project is created in <strong>DRAFT / AWAITING COUNTERSIGNATURE</strong> state. Your digital signature as Client will be recorded with an immutable SHA-256 agreement fingerprint. The agreement becomes active and binding once {assignedFreelancer?.displayName || 'the freelancer'} counter-signs.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#EFECE6]">
            <Button
              variant="secondary"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => setCurrentStep(2)}
            >
              Back to Terms
            </Button>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<ShieldCheck className="w-4 h-4" />}
              onClick={handleFinalSubmit}
            >
              Sign &amp; Create Agreement v1
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
