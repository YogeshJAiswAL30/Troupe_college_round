import React from 'react';
import {
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  Lock,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useFairwork } from '../../context/FairworkContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const SettingsPage: React.FC = () => {
  const { currentUser, allUsers, setCurrentUser, handleResetDemoData, showToast } = useFairwork();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-[#E5DFD5]">
        <h1 className="text-xl font-bold tracking-tight text-[#1C1917]">
          Profile &amp; Sandbox Settings
        </h1>
        <p className="text-xs text-[#605A53] mt-0.5">
          Manage your verified persona, security preferences, and prototype environment
        </p>
      </div>

      {/* Profile Card */}
      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-bold text-[#1C1917] border-b border-[#EFECE6] pb-2 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[#264235]" />
          Active Persona Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[11px] font-semibold text-[#8A837A] block mb-0.5">
              Display Name
            </span>
            <span className="font-bold text-[#1C1917] text-sm">
              {currentUser.displayName}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[#8A837A] block mb-0.5">
              Role &amp; Permissions
            </span>
            <span className="font-mono font-bold text-[#264235]">
              {currentUser.role}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[#8A837A] block mb-0.5">
              Email Address
            </span>
            <span className="text-[#1C1917]">{currentUser.email}</span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[#8A837A] block mb-0.5">
              Verification Status
            </span>
            <span className="inline-flex items-center gap-1 text-[#285C42] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {currentUser.verificationStatus}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[#8A837A] block mb-0.5">
              Reputation Score
            </span>
            <span className="text-sm font-bold text-[#1C1917]">
              {currentUser.reputationScore} / 100
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-[#8A837A] block mb-0.5">
              Account ID
            </span>
            <code className="text-[11px] font-mono text-[#605A53]">
              {currentUser.id}
            </code>
          </div>
        </div>
      </Card>

      {/* Switch Persona Card */}
      <Card className="p-6 space-y-3">
        <h2 className="text-sm font-bold text-[#1C1917] border-b border-[#EFECE6] pb-2">
          Switch Persona for Testing
        </h2>
        <p className="text-xs text-[#605A53]">
          Easily switch between Client, Freelancer, and Arbitrator to verify permission gating and symmetric protection.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {Object.values(allUsers).map((u) => (
            <button
              key={u.id}
              onClick={() => {
                setCurrentUser(u);
                showToast({
                  type: 'info',
                  title: 'Persona Switched',
                  message: `Now acting as ${u.displayName} (${u.role}).`,
                });
              }}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                u.id === currentUser.id
                  ? 'border-[#264235] bg-[#FAF7F2] font-bold'
                  : 'border-[#E5DFD5] bg-white hover:bg-[#FAF7F2]'
              }`}
            >
              <span className="block text-xs text-[#1C1917]">{u.displayName.split(' ')[0]}</span>
              <span className="text-[10px] text-[#8A837A] font-mono">{u.role}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Demo Sandbox Data Management Card */}
      <Card className="p-6 space-y-4 border-[#FECACA] bg-[#FEF2F2]/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#991B1B] flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#991B1B]" />
              Reset Demo Sandbox State
            </h2>
            <p className="text-xs text-[#7F1D1D] mt-1">
              Restores all 3 hackathon demo projects (E-commerce ₹30k, Brand Identity ₹12k, 3D Portfolio ₹18k), milestones, review decisions, payments, and disputes back to the clean initial seed.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDemoData}
            className="border-[#FECACA] bg-white text-[#991B1B] hover:bg-[#FEE2E2] shrink-0"
          >
            Reset All Demo Data
          </Button>
        </div>
      </Card>

      {/* Prototype Disclosures & Security Policy Card */}
      <Card className="p-6 space-y-3 bg-[#FAF7F2]/60">
        <h2 className="text-sm font-bold text-[#1C1917] border-b border-[#EFECE6] pb-2 flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#264235]" />
          Security Policy &amp; Prototype Transparency
        </h2>

        <ul className="space-y-2 text-xs text-[#605A53] leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#264235] mt-1.5 shrink-0" />
            <span>
              <strong>Zero Secret Exposure:</strong> No private keys, mnemonic phrases, or payment credentials are stored in frontend code.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#264235] mt-1.5 shrink-0" />
            <span>
              <strong>Cryptographic Provenance:</strong> SHA-256 hashes generated through the browser Web Crypto API (<code className="font-mono text-[11px]">crypto.subtle</code>) guarantee agreement and deliverable immutability.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#264235] mt-1.5 shrink-0" />
            <span>
              <strong>Simulated Escrow:</strong> All funding deposits and release records in this prototype operate over simulated ledger entries.
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
};
