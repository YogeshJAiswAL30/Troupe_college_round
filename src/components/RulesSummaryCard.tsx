import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export const RulesSummaryCard: React.FC = () => {
  const rules = [
    {
      id: 'Rule 1',
      title: 'Budget Exact Allocation',
      desc: 'Milestone amounts must add up exactly to total project budget. Validated on contract lock.',
    },
    {
      id: 'Rule 2',
      title: 'No Approval Without Delivery',
      desc: 'A milestone cannot be approved before a verifiable deliverable is submitted.',
    },
    {
      id: 'Rule 3',
      title: 'No Double-Release',
      desc: 'A released milestone cannot be released twice. Payout state is terminal.',
    },
    {
      id: 'Rule 4',
      title: 'Dispute Locks Ordinary Release',
      desc: 'A disputed milestone cannot use ordinary release; structured settlement or arbitration required.',
    },
    {
      id: 'Rule 5',
      title: 'Strict Participant Authorization',
      desc: 'Only client can fund/release/review. Only freelancer can submit. Cross-role tampering is rejected.',
    },
    {
      id: 'Rule 6',
      title: 'Dual-Party Agreement Activation',
      desc: 'Agreement becomes legally active only after both client and freelancer accept.',
    },
    {
      id: 'Rule 7',
      title: 'Versioned Amendments & Consent Renewal',
      desc: 'Modifying accepted terms creates an incremented version and resets counterparty acceptance.',
    },
    {
      id: 'Rule 8',
      title: 'Integer Minor Units Money Math',
      desc: 'Calculations use integer minor units (cents) to avoid IEEE 754 floating-point inaccuracies.',
    },
    {
      id: 'Rule 9',
      title: 'Single Source of Truth',
      desc: 'Financial and escrow balances are derived dynamically rather than maintaining duplicate contradictory values.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-500" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Architecture Rules &amp; Invariants Enforced
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>17/17 Automated Tests Passing</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">
                {rule.id}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="font-semibold text-slate-900 dark:text-white mb-0.5">
              {rule.title}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              {rule.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
