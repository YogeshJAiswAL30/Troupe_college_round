import React from 'react';
import { Check } from 'lucide-react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  className?: string;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className = '',
  color = 'bg-[#264235]',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full bg-[#E5DFD5] rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-300 ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export interface StepItem {
  id: string;
  title: string;
  description?: string;
}

export interface StepProgressProps {
  steps: StepItem[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStepIndex,
  onStepClick,
  className = '',
}) => {
  return (
    <nav aria-label="Progress" className={`w-full ${className}`}>
      <ol className="flex items-center justify-between w-full relative">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isUpcoming = idx > currentStepIndex;

          return (
            <li
              key={step.id}
              className={`relative flex flex-col items-center flex-1 ${
                onStepClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onStepClick && onStepClick(idx)}
            >
              {/* Connector line between steps */}
              {idx !== 0 && (
                <div
                  className={`absolute top-3.5 right-1/2 left-[-50%] h-[2px] -z-0 transition-colors ${
                    isCompleted ? 'bg-[#264235]' : 'bg-[#E5DFD5]'
                  }`}
                />
              )}

              {/* Step indicator circle */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold z-10 transition-all ${
                  isCompleted
                    ? 'bg-[#264235] text-white shadow-xs'
                    : isCurrent
                    ? 'bg-white border-2 border-[#264235] text-[#264235] shadow-xs ring-4 ring-[#264235]/10'
                    : 'bg-[#FAF7F2] border border-[#E5DFD5] text-[#8A837A]'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : idx + 1}
              </div>

              {/* Label */}
              <div className="mt-2 text-center px-1">
                <span
                  className={`block text-[11px] font-semibold tracking-tight ${
                    isCurrent
                      ? 'text-[#264235]'
                      : isCompleted
                      ? 'text-[#1C1917]'
                      : 'text-[#8A837A]'
                  }`}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span className="hidden sm:block text-[10px] text-[#8A837A] mt-0.5 max-w-[100px] leading-tight">
                    {step.description}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
