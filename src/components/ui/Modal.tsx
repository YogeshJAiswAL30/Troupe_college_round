import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Subtle backdrop */}
      <div
        className="fixed inset-0 bg-[#1C1917]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Body */}
      <div
        className={`relative w-full ${maxWidthClass} rounded-2xl bg-white border border-[#E5DFD5] shadow-xl overflow-hidden transition-all duration-200 z-10 max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3 border-b border-[#EFECE6] bg-[#FAF7F2]">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-[#1C1917] tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-[#605A53] mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8A837A] hover:text-[#1C1917] hover:bg-[#EFECE6] transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
