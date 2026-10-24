import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'surface' | 'interactive' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'rounded-none transition-colors border text-[#141414]';

    const variantClasses = {
      default: 'bg-white border-[#D6D6D6]',
      surface: 'bg-[#FBFBFB] border-[#D6D6D6]',
      interactive:
        'bg-white border-[#D6D6D6] hover:border-[#141414] cursor-pointer',
      ghost: 'bg-transparent border-[#D6D6D6]',
    }[variant];

    const paddingClasses = {
      none: 'p-0',
      sm: 'p-3 sm:p-4',
      md: 'p-5 sm:p-6',
      lg: 'p-6 sm:p-8',
    }[padding];

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${paddingClasses} ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
