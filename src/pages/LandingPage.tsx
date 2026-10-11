import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  FileText,
  Lock,
  Upload,
  Eye,
  CreditCard,
  Scale,
  CheckCircle2,
  Clock,
  Fingerprint,
  ChevronRight,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useFairwork } from '../context/FairworkContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { allUsers, setCurrentUser } = useFairwork();
  const [activeStep, setActiveStep] = useState<number>(0);

  const workflowSteps = [
    {
      id: 'agree',
      label: '1. AGREE',
      title: 'Mutual Agreement & Version Lock',
      actor: 'Both Parties',
      desc: 'Define scope, concrete acceptance criteria, and revision policies. Both client and freelancer digitally sign the terms to generate an immutable SHA-256 fingerprint.',
      details: 'Rule 6: Becomes binding only upon dual signatures. Rule 7: Amendments reset consent.',
    },
    {
      id: 'fund',
      label: '2. FUND',
      title: 'Client Deposits Milestone Escrow',
      actor: 'Client Only',
      desc: 'Client deposits the exact milestone amount into escrow before work begins. Freelancers never begin without verifiable funding in place.',
      details: 'Rule 1: Allocations match total budget. Rule 8: Decimal-safe integer cents.',
    },
    {
      id: 'deliver',
      label: '3. DELIVER',
      title: 'Freelancer Submits Proof & Files',
      actor: 'Freelancer Only',
      desc: 'Freelancer submits deliverables with release notes and file attachments. Each file receives a SHA-256 integrity hash guaranteeing content immutability.',
      details: 'Rule 5: Only assigned freelancer can submit. Captures timestamped revision #.',
    },
    {
      id: 'review',
      label: '4. REVIEW',
      title: 'Structured Inspection & Decision',
      actor: 'Client Only',
      desc: 'Client verifies the deliverable against the original checklist. The client can approve, request revisions within the agreed policy, or escalate to dispute.',
      details: 'Rule 2: Cannot approve without a submitted deliverable. Prevents premature sign-offs.',
    },
    {
      id: 'release',
      label: '5. RELEASE',
      title: 'Verified Escrow Payout',
      actor: 'Client / Contract',
      desc: 'Upon approval, client releases funds directly to the freelancer. Payment record is finalized with immutable transaction reference.',
      details: 'Rule 3: Released milestones cannot be released twice. Terminal payout.',
    },
  ];

  const handleDemoLogin = (role: 'CLIENT' | 'FREELANCER' | 'ARBITRATOR') => {
    const user = Object.values(allUsers).find((u) => u.role === role);
    if (user) {
      setCurrentUser(user);
    }
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] text-[#1C1917] selection:bg-[#264235] selection:text-white">
      {/* Top Banner Notice */}
      <div className="bg-[#FAF7F2] border-b border-[#E5DFD5] px-4 py-2 text-center text-xs text-[#605A53] flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#264235]" />
        <span>
          <strong>Fairwork Hackathon Prototype:</strong> Simulated Escrow &bull; Verifiable SHA-256 Provenance &bull; No real wallet required
        </span>
      </div>

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#264235] flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-[#1C1917]">Fairwork</span>
            <span className="block text-[10px] text-[#8A837A] font-semibold tracking-wider">
              VERIFIABLE MILESTONE AGREEMENTS
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#605A53]">
          <a href="#workflow" className="hover:text-[#1C1917] transition">
            Workflow
          </a>
          <a href="#features" className="hover:text-[#1C1917] transition">
            Key Guarantees
          </a>
          <button
            onClick={() => navigate('/how-it-works')}
            className="hover:text-[#1C1917] transition cursor-pointer"
          >
            How It Works
          </button>
          <a href="#faq" className="hover:text-[#1C1917] transition">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
          <Button
            variant="primary"
            size="sm"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => navigate('/app')}
          >
            Launch Demo
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E5DFD5] text-[#264235] text-xs font-semibold tracking-tight mb-6 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#264235]" />
          <span>Trust Before Delivery. Payment After Proof.</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1C1917] leading-[1.12] mb-6">
          Your Work. Your Agreement. <br />
          <span className="text-[#264235]">Your Payment.</span>
        </h1>

        <p className="text-base sm:text-lg text-[#605A53] max-w-2xl mx-auto leading-relaxed mb-10">
          Create clear milestone agreements, verify deliverables with cryptographic hashes, and track payments through a transparent workflow designed to protect both freelancers and clients.
        </p>

        {/* Primary and Secondary CTA */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/app')}
          >
            Launch Demo
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/how-it-works')}
          >
            See How It Works
          </Button>
        </div>

        {/* Quick Demo Persona Entry Options */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5DFD5] shadow-xs max-w-xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-[#8A837A] mb-3 flex items-center justify-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#264235]" />
            Instant Sandbox Explorer (No Signup)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoLogin('CLIENT')}
              className="p-2.5 rounded-xl border border-[#E5DFD5] hover:border-[#264235] hover:bg-[#FAF7F2] transition text-left cursor-pointer group"
            >
              <span className="block text-xs font-bold text-[#1C1917] group-hover:text-[#264235]">
                As Client &rarr;
              </span>
              <span className="text-[11px] text-[#8A837A]">Fund &amp; review</span>
            </button>
            <button
              onClick={() => handleDemoLogin('FREELANCER')}
              className="p-2.5 rounded-xl border border-[#E5DFD5] hover:border-[#264235] hover:bg-[#FAF7F2] transition text-left cursor-pointer group"
            >
              <span className="block text-xs font-bold text-[#1C1917] group-hover:text-[#264235]">
                As Freelancer &rarr;
              </span>
              <span className="text-[11px] text-[#8A837A]">Submit proof</span>
            </button>
            <button
              onClick={() => handleDemoLogin('ARBITRATOR')}
              className="p-2.5 rounded-xl border border-[#E5DFD5] hover:border-[#264235] hover:bg-[#FAF7F2] transition text-left cursor-pointer group"
            >
              <span className="block text-xs font-bold text-[#1C1917] group-hover:text-[#264235]">
                As Arbitrator &rarr;
              </span>
              <span className="text-[11px] text-[#8A837A]">Settle disputes</span>
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Visual Workflow Component: AGREE -> FUND -> DELIVER -> REVIEW -> RELEASE */}
      <section id="workflow" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#E5DFD5]">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#264235] block mb-1">
            The Central Lifecycle
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917]">
            AGREEMENT &rarr; DELIVERABLE &rarr; DECISION &rarr; PAYMENT
          </h2>
          <p className="text-xs sm:text-sm text-[#605A53] mt-2 max-w-xl mx-auto">
            Click any step to inspect the cryptographic guarantees, role restrictions, and state machine invariants.
          </p>
        </div>

        {/* Step Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {workflowSteps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(idx)}
              className={`p-3 rounded-xl text-left border transition cursor-pointer ${
                activeStep === idx
                  ? 'bg-[#264235] text-white border-[#264235] shadow-xs'
                  : 'bg-white text-[#605A53] border-[#E5DFD5] hover:border-[#D8D0C3] hover:bg-[#FAF7F2]'
              }`}
            >
              <span
                className={`text-[10px] font-mono block ${
                  activeStep === idx ? 'text-white/80' : 'text-[#8A837A]'
                }`}
              >
                {step.label}
              </span>
              <span
                className={`text-xs font-bold block truncate mt-0.5 ${
                  activeStep === idx ? 'text-white' : 'text-[#1C1917]'
                }`}
              >
                {step.title.split(' ')[0]} {step.title.split(' ')[1]}
              </span>
            </button>
          ))}
        </div>

        {/* Step Inspection Card */}
        <Card className="bg-white border-[#E5DFD5] shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#EFECE6]">
              <div>
                <span className="text-xs font-mono font-bold text-[#264235] uppercase tracking-wide">
                  Lifecycle Phase {activeStep + 1} of 5
                </span>
                <h3 className="text-lg font-bold text-[#1C1917] mt-0.5">
                  {workflowSteps[activeStep].title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2.5 py-1 rounded-md bg-[#FAF7F2] border border-[#E5DFD5] text-[#605A53] font-semibold">
                  Authorized: {workflowSteps[activeStep].actor}
                </span>
              </div>
            </div>

            <p className="text-sm text-[#292524] leading-relaxed mb-4">
              {workflowSteps[activeStep].desc}
            </p>

            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-between text-xs text-[#264235] font-medium">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#264235]" />
                {workflowSteps[activeStep].details}
              </span>
              <button
                onClick={() => navigate('/app')}
                className="text-[11px] font-bold underline hover:text-[#1B3327] cursor-pointer"
              >
                Try in Sandbox &rarr;
              </button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* The 5 Key Guarantees (Differentiators) */}
      <section id="features" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#E5DFD5]">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#264235] block mb-1">
            Built for Real Trust
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917]">
            Not Another Generic Marketplace
          </h2>
          <p className="text-xs sm:text-sm text-[#605A53] mt-2 max-w-xl mx-auto">
            Traditional platforms hide terms, hold funds unpredictably, or rule arbitrarily. Fairwork grounds every dollar in verifiable agreements and delivery proof.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Clear Agreements */}
          <Card className="hover:border-[#D8D0C3] transition">
            <CardContent className="p-5">
              <div className="w-9 h-9 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-center text-[#264235] mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#1C1917] mb-1.5">
                1. Versioned Agreements
              </h3>
              <p className="text-xs text-[#605A53] leading-relaxed">
                Agreements carry canonical terms and SHA-256 fingerprints. Any modification creates a new version, automatically resetting counterparty consent (Rule 7).
              </p>
            </CardContent>
          </Card>

          {/* 2. Milestone Payment Tracking */}
          <Card className="hover:border-[#D8D0C3] transition">
            <CardContent className="p-5">
              <div className="w-9 h-9 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-center text-[#264235] mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#1C1917] mb-1.5">
                2. Strict Escrow Protection
              </h3>
              <p className="text-xs text-[#605A53] leading-relaxed">
                Milestone amounts must add up exactly to the contract budget (Rule 1). Released funds are terminal (Rule 3); escrow cannot be released twice.
              </p>
            </CardContent>
          </Card>

          {/* 3. Verifiable Deliveries */}
          <Card className="hover:border-[#D8D0C3] transition">
            <CardContent className="p-5">
              <div className="w-9 h-9 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-center text-[#264235] mb-3">
                <Fingerprint className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#1C1917] mb-1.5">
                3. Immutable Delivery Hashes
              </h3>
              <p className="text-xs text-[#605A53] leading-relaxed">
                Every delivery generates a cryptographic hash of files and notes. Milestones cannot be approved before a verifiable submission exists (Rule 2).
              </p>
            </CardContent>
          </Card>

          {/* 4. Structured Dispute Resolution */}
          <Card className="hover:border-[#D8D0C3] transition">
            <CardContent className="p-5">
              <div className="w-9 h-9 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-center text-[#264235] mb-3">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#1C1917] mb-1.5">
                4. Locked Ordinary Release
              </h3>
              <p className="text-xs text-[#605A53] leading-relaxed">
                When a dispute is raised, ordinary release is locked immediately (Rule 4). Payout requires mutual dual-signed settlement or arbitrator decision.
              </p>
            </CardContent>
          </Card>

          {/* 5. Single Source of Truth */}
          <Card className="hover:border-[#D8D0C3] transition">
            <CardContent className="p-5">
              <div className="w-9 h-9 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-center text-[#264235] mb-3">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#1C1917] mb-1.5">
                5. Single Source of Truth
              </h3>
              <p className="text-xs text-[#605A53] leading-relaxed">
                Financial balances are derived dynamically from milestone states using integer minor units (Rule 8 &amp; 9), eliminating floating-point desync.
              </p>
            </CardContent>
          </Card>

          {/* 6. Strict Role Authorization */}
          <Card className="hover:border-[#D8D0C3] transition">
            <CardContent className="p-5">
              <div className="w-9 h-9 rounded-lg bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-center text-[#264235] mb-3">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#1C1917] mb-1.5">
                6. Symmetric Participant Protection
              </h3>
              <p className="text-xs text-[#605A53] leading-relaxed">
                Only clients can fund or release. Only freelancers can submit deliverables. Neither party is assumed automatically right; all actions require verifiable proof.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it Works in 3 Simple Steps */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#E5DFD5]">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#264235] block mb-1">
            Simple 3-Step Overview
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917]">
            How Fairwork Operates
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E5DFD5] relative">
            <span className="text-3xl font-bold font-mono text-[#E5DFD5] block mb-2">01</span>
            <h3 className="text-base font-bold text-[#1C1917] mb-2">Draft &amp; Sign Agreement</h3>
            <p className="text-xs text-[#605A53] leading-relaxed">
              Define verifiable criteria checklist, payment amounts, and revision limits. Both parties review and sign digitally to lock the terms.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E5DFD5] relative">
            <span className="text-3xl font-bold font-mono text-[#E5DFD5] block mb-2">02</span>
            <h3 className="text-base font-bold text-[#1C1917] mb-2">Fund Escrow &amp; Build</h3>
            <p className="text-xs text-[#605A53] leading-relaxed">
              Client funds the upcoming milestone in escrow. Freelancer builds and uploads proof, generating an immutable content hash.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E5DFD5] relative">
            <span className="text-3xl font-bold font-mono text-[#E5DFD5] block mb-2">03</span>
            <h3 className="text-base font-bold text-[#1C1917] mb-2">Inspect &amp; Release</h3>
            <p className="text-xs text-[#605A53] leading-relaxed">
              Client verifies acceptance criteria. Client releases the escrow payout to the freelancer, concluding the transaction.
            </p>
          </div>
        </div>
      </section>

      {/* Product Live Preview Box */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#E5DFD5]">
        <div className="p-8 rounded-3xl bg-white border border-[#E5DFD5] shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#EFECE6]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#264235] block mb-0.5">
                Interactive Preview
              </span>
              <h3 className="text-xl font-bold text-[#1C1917]">
                Milestone 1: Core Architecture &amp; Data Engine
              </h3>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[#1C1917] font-mono">$2,000.00</span>
              <span className="block text-[11px] text-[#285C42] font-semibold">
                &bull; Escrow Funded (Simulated)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-6">
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5]">
              <span className="font-semibold text-[#1C1917] block mb-1">
                Verifiable Acceptance Criteria:
              </span>
              <ul className="space-y-1 text-[#605A53]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#285C42]" /> 100% automated test coverage
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#285C42]" /> Deterministic state transition engine
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#285C42]" /> SHA-256 agreement fingerprinting
                </li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5]">
              <span className="font-semibold text-[#1C1917] block mb-1">
                Cryptographic Provenance:
              </span>
              <div className="text-[11px] font-mono text-[#605A53] space-y-1">
                <div>Agr Hash: b4a1f6e2978932ca23d...</div>
                <div>Status: Dual-Signed (Alice &amp; Bob)</div>
                <div>Escrow Vault: sim_vault_9941a87b</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs text-[#8A837A]">
              Tested with 18 automated unit tests verifying all 9 rules.
            </span>
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              onClick={() => navigate('/app')}
            >
              Enter Full App &rarr;
            </Button>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1C1917] mb-4">
          Experience Fair, Verifiable Freelance Payments
        </h2>
        <p className="text-sm text-[#605A53] max-w-md mx-auto mb-8">
          Explore the working prototype today. Test contract versioning, milestone delivery verification, and structured settlement in real time.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/app')}
          >
            Launch Demo App
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/how-it-works')}
          >
            Read Technical Spec
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5DFD5] bg-white py-12 text-xs text-[#605A53]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#264235] flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-[#1C1917]">Fairwork</span>
            </div>
            <p className="text-[11px] text-[#8A837A] leading-relaxed">
              Verifiable freelance agreement and milestone-payment platform prototype for hackathon demonstration.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-[#1C1917] uppercase tracking-wider text-[11px] mb-3">
              Prototype Navigation
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button onClick={() => navigate('/app')} className="hover:text-[#1C1917] cursor-pointer">
                  Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/app/projects')} className="hover:text-[#1C1917] cursor-pointer">
                  Projects &amp; Milestones
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/app/agreements')} className="hover:text-[#1C1917] cursor-pointer">
                  Agreements &amp; Versioning
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/app/payments')} className="hover:text-[#1C1917] cursor-pointer">
                  Simulated Escrow Ledger
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#1C1917] uppercase tracking-wider text-[11px] mb-3">
              Transparency &amp; Disclaimers
            </h4>
            <ul className="space-y-1.5 text-[11px] text-[#8A837A] leading-relaxed">
              <li>&bull; All escrow balances &amp; payments are simulated.</li>
              <li>&bull; SHA-256 hashes prove file integrity, not quality.</li>
              <li>&bull; Agreement hash alone does not prove signature without consent.</li>
              <li>&bull; No real user funds or unverified mainnet contracts.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#1C1917] uppercase tracking-wider text-[11px] mb-3">
              Documentation &amp; Support
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button onClick={() => navigate('/how-it-works')} className="hover:text-[#1C1917] cursor-pointer">
                  How It Works &amp; Rule Invariants
                </button>
              </li>
              <li>
                <a href="#workflow" className="hover:text-[#1C1917]">
                  Lifecycle Architecture
                </a>
              </li>
              <li>
                <span className="text-[#8A837A]">Contact: hackathon-demo@fairwork.io</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-[#EFECE6] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8A837A]">
          <span>&copy; 2026 Fairwork Protocol Prototype. Open source MIT license.</span>
          <span>Designed with warm fintech aesthetic &bull; Accessible &amp; Calibrated</span>
        </div>
      </footer>
    </div>
  );
};
