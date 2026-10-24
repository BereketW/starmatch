'use client';

import React, { useEffect, useRef } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  className = '',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key and trap focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Prevent background scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[maxWidth];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#141414]/60 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog surface */}
      <div
        ref={dialogRef}
        className={`relative w-full ${maxWidthClasses} bg-[#FBFBFB] border border-[#141414] rounded-none shadow-[0_24px_64px_rgba(20,20,20,0.18)] p-6 sm:p-8 text-[#141414] z-10 my-auto ${className}`.trim()}
      >
        {/* Close Button (min 44x44px touch target) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 h-11 w-11 flex items-center justify-center text-[#575657] hover:text-[#141414] border border-transparent hover:border-[#D6D6D6] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141414] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {title && (
          <h2
            id="modal-title"
            className="text-lg font-bold tracking-tight mb-4 pr-10 uppercase font-sans"
          >
            {title}
          </h2>
        )}

        {children}
      </div>
    </div>
  );
};
