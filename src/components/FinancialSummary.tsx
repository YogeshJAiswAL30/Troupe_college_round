import React from 'react';
import {
  Wallet,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  Scale,
} from 'lucide-react';
import { DerivedProjectFinancials, formatMoney } from '../core/money';
import { Currency } from '../types/fairwork';

interface FinancialSummaryProps {
  financials: DerivedProjectFinancials;
  currency: Currency;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  financials,
  currency,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-500" />
            Financial Health & Escrow Balance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Single source of truth derived strictly from milestone states (Integer minor units calculation)
          </p>
        </div>

        {/* Rule 1 Invariant Badge */}
        {financials.isBudgetBalanced ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Rule 1: Budget Exact Match (100%)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>Rule 1 Warning: Budget Mismatch</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Budget */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-slate-400" />
            Total Budget
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {formatMoney(financials.totalBudgetMinor, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Contract value</div>
        </div>

        {/* Allocated to Milestones */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            Allocated
          </div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {formatMoney(financials.allocatedMinor, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across all milestones</div>
        </div>

        {/* In Active Escrow */}
        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
          <div className="text-xs text-indigo-700 dark:text-indigo-300 font-medium mb-1 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-500" />
            Active Escrow <span className="text-[10px] opacity-75">(Simulated)</span>
          </div>
          <div className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
            {formatMoney(financials.fundedInEscrowMinor, currency)}
          </div>
          <div className="text-[11px] text-indigo-500/70 mt-1">Locked awaiting approval</div>
        </div>

        {/* Released to Freelancer */}
        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50">
          <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Released Payouts
          </div>
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
            {formatMoney(financials.releasedMinor, currency)}
          </div>
          <div className="text-[11px] text-emerald-600/70 mt-1">Completed &amp; paid</div>
        </div>

        {/* In Dispute */}
        <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50">
          <div className="text-xs text-rose-700 dark:text-rose-300 font-medium mb-1 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-rose-500" />
            In Dispute
          </div>
          <div className="text-xl font-bold text-rose-700 dark:text-rose-400">
            {formatMoney(financials.disputedMinor, currency)}
          </div>
          <div className="text-[11px] text-rose-600/70 mt-1">Release locked</div>
        </div>
      </div>
    </div>
  );
};
