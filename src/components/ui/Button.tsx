import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#264235] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-[#264235] text-white hover:bg-[#1B3327] shadow-sm active:translate-y-px',
    secondary: 'bg-white text-[#1C1917] border border-[#E5DFD5] hover:bg-[#FAF7F2] hover:border-[#D8D0C3] shadow-xs active:translate-y-px',
    outline: 'bg-transparent text-[#264235] border border-[#264235]/30 hover:bg-[#264235]/5 active:translate-y-px',
    ghost: 'bg-transparent text-[#605A53] hover:text-[#1C1917] hover:bg-[#EFECE6]/70',
    danger: 'bg-[#991B1B] text-white hover:bg-[#7F1D1D] shadow-sm active:translate-y-px',
    glass: 'glass-nav-item text-[#1C1917] hover:bg-white/90 shadow-xs hover:border-[#D8D0C3]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
