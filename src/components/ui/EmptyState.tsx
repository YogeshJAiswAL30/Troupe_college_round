import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border border-dashed border-[#D8D0C3] bg-[#FAF7F2]/60 p-8 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-white border border-[#E5DFD5] flex items-center justify-center text-[#264235] shadow-xs mb-3">
        {icon || <Inbox className="w-6 h-6 text-[#8A837A]" />}
      </div>
      <h3 className="text-sm font-semibold text-[#1C1917] tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-xs text-[#605A53] max-w-sm leading-relaxed mb-4">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
