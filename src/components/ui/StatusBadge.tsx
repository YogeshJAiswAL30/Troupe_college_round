import React from 'react';
import {
  CheckCircle2,
  Clock,
  Lock,
  Upload,
  Eye,
  RotateCcw,
  Scale,
  AlertTriangle,
} from 'lucide-react';
import { MilestoneStatus, ProjectStatus, PaymentStatus, DisputeStatus } from '../../types/fairwork';

export type BadgeVariant = 'success' | 'pending' | 'danger' | 'neutral' | 'info';

export interface StatusBadgeProps {
  status?: MilestoneStatus | ProjectStatus | PaymentStatus | DisputeStatus | string;
  variant?: BadgeVariant;
  label?: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  label,
  size = 'sm',
  showIcon = true,
  className = '',
}) => {
  // Determine variant and display text if status is passed
  let resolvedVariant: BadgeVariant = variant || 'neutral';
  let resolvedLabel = label || status || 'Unknown';
  let icon: React.ReactNode = null;

  if (status) {
    switch (status) {
      // Milestone states
      case 'DRAFT':
        resolvedVariant = 'neutral';
        resolvedLabel = 'Draft';
        icon = <Clock className="w-3 h-3 text-[#78716C]" />;
        break;
      case 'AGREED':
        resolvedVariant = 'info';
        resolvedLabel = 'Agreed';
        icon = <CheckCircle2 className="w-3 h-3 text-[#1E429F]" />;
        break;
      case 'AWAITING_FUNDING':
        resolvedVariant = 'pending';
        resolvedLabel = 'Awaiting Escrow Deposit';
        icon = <Lock className="w-3 h-3 text-[#B45309]" />;
        break;
      case 'FUNDED':
        resolvedVariant = 'info';
        resolvedLabel = 'Escrow Funded';
        icon = <Lock className="w-3 h-3 text-[#1E429F]" />;
        break;
      case 'IN_PROGRESS':
        resolvedVariant = 'info';
        resolvedLabel = 'In Progress';
        icon = <Clock className="w-3 h-3 text-[#1E429F]" />;
        break;
      case 'SUBMITTED':
        resolvedVariant = 'pending';
        resolvedLabel = 'Submitted';
        icon = <Upload className="w-3 h-3 text-[#B45309]" />;
        break;
      case 'UNDER_REVIEW':
        resolvedVariant = 'pending';
        resolvedLabel = 'Under Review';
        icon = <Eye className="w-3 h-3 text-[#B45309]" />;
        break;
      case 'REVISION_REQUESTED':
        resolvedVariant = 'pending';
        resolvedLabel = 'Revision Requested';
        icon = <RotateCcw className="w-3 h-3 text-[#B45309]" />;
        break;
      case 'APPROVED':
        resolvedVariant = 'success';
        resolvedLabel = 'Approved';
        icon = <CheckCircle2 className="w-3 h-3 text-[#285C42]" />;
        break;
      case 'RELEASED':
        resolvedVariant = 'success';
        resolvedLabel = 'Released';
        icon = <CheckCircle2 className="w-3 h-3 text-[#285C42]" />;
        break;
      case 'DISPUTED':
        resolvedVariant = 'danger';
        resolvedLabel = 'Disputed';
        icon = <Scale className="w-3 h-3 text-[#991B1B]" />;
        break;
      case 'RESOLVED':
        resolvedVariant = 'success';
        resolvedLabel = 'Resolved';
        icon = <CheckCircle2 className="w-3 h-3 text-[#285C42]" />;
        break;
      case 'CANCELLED':
        resolvedVariant = 'neutral';
        resolvedLabel = 'Cancelled';
        icon = <AlertTriangle className="w-3 h-3 text-[#78716C]" />;
        break;

      // Payment & Project
      case 'ACTIVE':
      case 'COMPLETED':
        resolvedVariant = 'success';
        resolvedLabel = status === 'ACTIVE' ? 'Active' : 'Completed';
        icon = <CheckCircle2 className="w-3 h-3 text-[#285C42]" />;
        break;
      case 'PENDING':
        resolvedVariant = 'pending';
        resolvedLabel = 'Pending';
        icon = <Clock className="w-3 h-3 text-[#B45309]" />;
        break;
      case 'FAILED':
        resolvedVariant = 'danger';
        resolvedLabel = 'Failed';
        icon = <AlertTriangle className="w-3 h-3 text-[#991B1B]" />;
        break;

      default:
        break;
    }
  }

  const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-[#EBF4EE] text-[#285C42] border-[#C2DEC9]',
    pending: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
    danger: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
    neutral: 'bg-[#F3EFE6] text-[#57534E] border-[#E5DFD5]',
    info: 'bg-[#E8F0FE] text-[#1E429F] border-[#D0E1FD]',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border tracking-tight ${
        variantStyles[resolvedVariant]
      } ${sizeStyles[size]} ${className}`}
    >
      {showIcon && icon}
      <span>{resolvedLabel}</span>
    </span>
  );
};
