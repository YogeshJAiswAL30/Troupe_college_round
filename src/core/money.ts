import { Currency, Milestone, Project } from '../types/fairwork';

/**
 * Money calculations using integer minor units (e.g. cents for USD/EUR, 100 minor = 1.00 major unit).
 * Avoids IEEE 754 floating point rounding inaccuracies.
 */

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  USDC: 'USDC ',
  INR: '₹',
};

export const CURRENCY_DECIMALS: Record<Currency, number> = {
  USD: 2,
  EUR: 2,
  GBP: 2,
  USDC: 2, // Standardizing to 2 minor units for prototype
  INR: 2,
};

/**
 * Formats integer minor units to human-readable currency string.
 * Example: 250000 -> "$2,500.00"
 */
export function formatMoney(amountMinor: number, currency: Currency = 'USD'): string {
  const decimals = CURRENCY_DECIMALS[currency] ?? 2;
  const major = amountMinor / Math.pow(10, decimals);
  const symbol = CURRENCY_SYMBOLS[currency] ?? '$';

  return `${symbol}${major.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Converts decimal input (e.g. 250.50) into integer minor units (25050).
 */
export function toMinorUnits(decimalAmount: number | string, currency: Currency = 'USD'): number {
  const numeric = typeof decimalAmount === 'string' ? parseFloat(decimalAmount) : decimalAmount;
  if (isNaN(numeric) || numeric < 0) return 0;
  const decimals = CURRENCY_DECIMALS[currency] ?? 2;
  return Math.round(numeric * Math.pow(10, decimals));
}

/**
 * Rule 1 Check: Milestone amounts must add up exactly to the project budget.
 */
export interface BudgetValidationResult {
  isValid: boolean;
  totalBudgetMinor: number;
  allocatedMinor: number;
  differenceMinor: number;
  message: string;
}

export function validateProjectBudget(
  projectBudgetMinor: number,
  milestones: Milestone[]
): BudgetValidationResult {
  const allocatedMinor = milestones.reduce((sum, m) => sum + m.amountMinor, 0);
  const differenceMinor = projectBudgetMinor - allocatedMinor;

  if (differenceMinor === 0) {
    return {
      isValid: true,
      totalBudgetMinor: projectBudgetMinor,
      allocatedMinor,
      differenceMinor: 0,
      message: 'Milestone allocations match total project budget perfectly.',
    };
  }

  if (differenceMinor > 0) {
    return {
      isValid: false,
      totalBudgetMinor: projectBudgetMinor,
      allocatedMinor,
      differenceMinor,
      message: `Underallocated: ${formatMoney(differenceMinor)} of project budget remains unassigned.`,
    };
  }

  return {
    isValid: false,
    totalBudgetMinor: projectBudgetMinor,
    allocatedMinor,
    differenceMinor,
    message: `Overallocated: Milestones exceed project budget by ${formatMoney(Math.abs(differenceMinor))}.`,
  };
}

/**
 * Rule 9: Derive totals from a single source of truth rather than maintaining contradictory state.
 */
export interface DerivedProjectFinancials {
  totalBudgetMinor: number;
  allocatedMinor: number;
  unallocatedMinor: number;
  fundedInEscrowMinor: number; // In FUNDED, IN_PROGRESS, SUBMITTED, UNDER_REVIEW, REVISION_REQUESTED, APPROVED
  releasedMinor: number;       // In RELEASED
  disputedMinor: number;       // In DISPUTED
  resolvedMinor: number;       // In RESOLVED
  isBudgetBalanced: boolean;
}

export function deriveProjectFinancials(
  project: Project,
  milestones: Milestone[]
): DerivedProjectFinancials {
  const totalBudgetMinor = project.totalBudgetMinor;
  let allocatedMinor = 0;
  let fundedInEscrowMinor = 0;
  let releasedMinor = 0;
  let disputedMinor = 0;
  let resolvedMinor = 0;

  for (const m of milestones) {
    allocatedMinor += m.amountMinor;

    switch (m.status) {
      case 'FUNDED':
      case 'IN_PROGRESS':
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
      case 'REVISION_REQUESTED':
      case 'APPROVED':
        fundedInEscrowMinor += m.amountMinor;
        break;
      case 'RELEASED':
        releasedMinor += m.amountMinor;
        break;
      case 'DISPUTED':
        disputedMinor += m.amountMinor;
        break;
      case 'RESOLVED':
        resolvedMinor += m.amountMinor;
        break;
      case 'DRAFT':
      case 'AGREED':
      case 'AWAITING_FUNDING':
      case 'CANCELLED':
      default:
        break;
    }
  }

  const unallocatedMinor = Math.max(0, totalBudgetMinor - allocatedMinor);

  return {
    totalBudgetMinor,
    allocatedMinor,
    unallocatedMinor,
    fundedInEscrowMinor,
    releasedMinor,
    disputedMinor,
    resolvedMinor,
    isBudgetBalanced: allocatedMinor === totalBudgetMinor,
  };
}
