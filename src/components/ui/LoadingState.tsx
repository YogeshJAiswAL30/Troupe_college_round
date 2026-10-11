import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading verified records...',
  className = '',
}) => {
  return (
    <div
      className={`p-10 rounded-2xl bg-white border border-[#E5DFD5] flex flex-col items-center justify-center text-center ${className}`}
    >
      <Loader2 className="w-6 h-6 animate-spin text-[#264235] mb-2.5" />
      <p className="text-xs font-medium text-[#605A53] tracking-tight">{message}</p>
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Data',
  message = 'An unexpected error occurred while fetching project records.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`p-8 rounded-2xl bg-[#FEE2E2]/30 border border-[#FECACA] flex flex-col items-center justify-center text-center ${className}`}
    >
      <div className="w-10 h-10 rounded-xl bg-white border border-[#FECACA] flex items-center justify-center text-[#991B1B] shadow-xs mb-3">
        <AlertCircle className="w-5 h-5 text-[#991B1B]" />
      </div>
      <h3 className="text-sm font-semibold text-[#1C1917] tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-xs text-[#605A53] max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
