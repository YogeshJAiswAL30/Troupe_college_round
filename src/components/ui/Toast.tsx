import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastProps {
  id?: string;
  type?: ToastType;
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
}) => {
  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-4 h-4 text-[#285C42] shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-4 h-4 text-[#991B1B] shrink-0 mt-0.5" />,
    info: <Info className="w-4 h-4 text-[#1E429F] shrink-0 mt-0.5" />,
  };

  const borderStyles: Record<ToastType, string> = {
    success: 'bg-[#EBF4EE] border-[#C2DEC9] text-[#1C1917]',
    warning: 'bg-[#FEF3C7] border-[#FDE68A] text-[#1C1917]',
    error: 'bg-[#FEE2E2] border-[#FECACA] text-[#1C1917]',
    info: 'bg-[#E8F0FE] border-[#D0E1FD] text-[#1C1917]',
  };

  return (
    <div
      className={`rounded-xl border p-3.5 shadow-md flex items-start gap-3 transition-all ${
        borderStyles[type]
      } ${className}`}
      role="alert"
    >
      {icons[type]}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-xs font-semibold text-[#1C1917] mb-0.5">{title}</h4>
        )}
        <p className="text-xs text-[#292524] leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-[#8A837A] hover:text-[#1C1917] p-0.5 rounded cursor-pointer transition"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
