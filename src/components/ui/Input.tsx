import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftAddon,
  rightAddon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-[#292524] uppercase tracking-wide"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftAddon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-[#8A837A]">
            {leftAddon}
          </div>
        )}

        <input
          id={inputId}
          className={`w-full rounded-lg bg-white border ${
            error
              ? 'border-[#991B1B] focus:ring-[#991B1B]'
              : 'border-[#E5DFD5] hover:border-[#D8D0C3] focus:border-[#264235] focus:ring-1 focus:ring-[#264235]'
          } text-sm text-[#1C1917] placeholder:text-[#A8A29E] px-3.5 py-2 transition duration-150 focus:outline-none shadow-xs ${
            leftAddon ? 'pl-9' : ''
          } ${rightAddon ? 'pr-9' : ''} ${className}`}
          {...props}
        />

        {rightAddon && (
          <div className="absolute right-3 flex items-center pointer-events-none text-[#8A837A]">
            {rightAddon}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-[#991B1B] font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#8A837A]">{helperText}</p>
      ) : null}
    </div>
  );
};

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-[#292524] uppercase tracking-wide"
        >
          {label}
        </label>
      )}

      <textarea
        id={inputId}
        className={`w-full rounded-lg bg-white border ${
          error
            ? 'border-[#991B1B] focus:ring-[#991B1B]'
            : 'border-[#E5DFD5] hover:border-[#D8D0C3] focus:border-[#264235] focus:ring-1 focus:ring-[#264235]'
        } text-sm text-[#1C1917] placeholder:text-[#A8A29E] px-3.5 py-2 transition duration-150 focus:outline-none shadow-xs ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-xs text-[#991B1B] font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#8A837A]">{helperText}</p>
      ) : null}
    </div>
  );
};

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-[#292524] uppercase tracking-wide"
        >
          {label}
        </label>
      )}

      <select
        id={inputId}
        className={`w-full rounded-lg bg-white border ${
          error
            ? 'border-[#991B1B] focus:ring-[#991B1B]'
            : 'border-[#E5DFD5] hover:border-[#D8D0C3] focus:border-[#264235] focus:ring-1 focus:ring-[#264235]'
        } text-sm text-[#1C1917] px-3.5 py-2 transition duration-150 focus:outline-none shadow-xs cursor-pointer ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error ? (
        <p className="text-xs text-[#991B1B] font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#8A837A]">{helperText}</p>
      ) : null}
    </div>
  );
};
