'use client';

import React from 'react';

export type InputMode = 'full' | 'quick';

export interface HeroHeaderProps {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({ mode, onModeChange }) => {
  return (
    <div
      role="region"
      aria-label="Synastry Studio Header"
      className="w-full bg-white pt-8 pb-4 text-center flex flex-col items-center space-y-6"
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-[#F5F5F3] border border-black/[0.06] px-3.5 py-1 text-[11px] font-medium text-[#52525b]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
        <span>0.1° VSOP87 Planetary Ephemeris</span>
      </div>

      <div className="space-y-3 max-w-2xl mx-auto px-4">
        <h2 className="font-sans font-bold tracking-[-0.04em] text-4xl sm:text-5xl md:text-6xl text-[#0A0A0A] leading-[0.96]">
          Cross Your{' '}
          <span className="font-serif italic font-normal">Charts.</span>
        </h2>
        <p className="text-sm sm:text-base text-[#666666] leading-relaxed font-sans max-w-lg mx-auto">
          Enter two birth dates for exact geocentric longitudes and house overlays, or compare solar archetypes in seconds.
        </p>
      </div>

      {/* Minimalist Pill Segmented Control */}
      <div
        className="inline-grid grid-cols-2 p-1 rounded-full bg-[#F4F4F2] border border-black/[0.06]"
        role="tablist"
        aria-label="Input mode"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'full'}
          onClick={() => onModeChange('full')}
          className={`min-h-[42px] px-6 py-2 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mode === 'full'
              ? 'bg-white text-[#0A0A0A] shadow-xs font-semibold'
              : 'text-[#666666] hover:text-[#0A0A0A]'
          }`}
        >
          <span>Exact Birthdays</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'quick'}
          onClick={() => onModeChange('quick')}
          className={`min-h-[42px] px-6 py-2 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mode === 'quick'
              ? 'bg-white text-[#0A0A0A] shadow-xs font-semibold'
              : 'text-[#666666] hover:text-[#0A0A0A]'
          }`}
        >
          <span>2-Sign Quick Mode</span>
        </button>
      </div>
    </div>
  );
};
