import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // 44x44px minimum touch target standard (WCAG AA / AAA) - Co-Star architectural button
    const baseClasses =
      'inline-flex items-center justify-center font-mono uppercase transition-colors select-none rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141414] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-40 disabled:pointer-events-none min-h-[44px] min-w-[44px] cursor-pointer disabled:cursor-not-allowed';

    const variantClasses = {
      primary:
        'bg-[#141414] text-[#FBFBFB] border border-[#141414] hover:bg-white hover:text-[#141414] active:bg-[#F4F4F2] font-medium',
      secondary:
        'bg-[#F4F4F2] text-[#141414] border border-[#D6D6D6] hover:bg-[#141414] hover:text-[#FBFBFB] hover:border-[#141414]',
      outline:
        'bg-transparent text-[#141414] border border-[#575657] hover:border-[#141414] hover:bg-[#141414] hover:text-[#FBFBFB]',
      ghost:
        'bg-transparent text-[#575657] hover:text-[#141414] hover:bg-[#F4F4F2] border border-transparent',
      danger:
        'bg-[rgba(243,144,144,0.2)] text-[#991b1b] border border-[#ef4444]/60 hover:bg-[rgba(243,144,144,0.35)] hover:border-[#991b1b]',
    }[variant];

    const sizeClasses = {
      sm: 'text-[11px] px-3 py-2 tracking-[0.06em] font-mono uppercase',
      md: 'text-xs px-5 py-2.5 tracking-[0.06em] font-mono uppercase',
      lg: 'text-xs px-6 py-3.5 tracking-[0.08em] font-mono uppercase font-semibold',
    }[size];

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${className}`.trim()}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
