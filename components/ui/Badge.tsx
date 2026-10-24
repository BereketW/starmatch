import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'power' | 'pressure' | 'warning' | 'outline' | 'neutral';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center gap-1.5 font-mono uppercase rounded-none border transition-colors select-none font-medium tracking-[0.06em]';

  const variantClasses = {
    default: 'bg-[#F4F4F2] text-[#141414] border-[#D6D6D6]',
    power: 'bg-[rgba(144,202,243,0.3)] text-[#141414] border-[#575657]/40',
    pressure: 'bg-[rgba(243,144,144,0.3)] text-[#141414] border-[#575657]/40',
    warning: 'bg-[#FEF3C7]/60 text-[#141414] border-[#D97706]/40',
    outline: 'bg-transparent text-[#575657] border-[#D6D6D6]',
    neutral: 'bg-[#E8E8E8]/70 text-[#575657] border-[#D6D6D6]',
  }[variant];

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 leading-tight',
    md: 'text-xs px-2.5 py-1 leading-normal',
  }[size];

  return (
    <span
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
};
