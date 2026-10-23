'use client';

import React from 'react';
import type { ZodiacSign } from '@/lib/astro/types';

export interface SignMeta {
  sign: ZodiacSign;
  symbol: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  dates: string;
}

export const ZODIAC_SIGNS: SignMeta[] = [
  { sign: 'Aries', symbol: '♈', element: 'fire', dates: 'Mar 21 – Apr 19' },
  { sign: 'Taurus', symbol: '♉', element: 'earth', dates: 'Apr 20 – May 20' },
  { sign: 'Gemini', symbol: '♊', element: 'air', dates: 'May 21 – Jun 20' },
  { sign: 'Cancer', symbol: '♋', element: 'water', dates: 'Jun 21 – Jul 22' },
  { sign: 'Leo', symbol: '♌', element: 'fire', dates: 'Jul 23 – Aug 22' },
  { sign: 'Virgo', symbol: '♍', element: 'earth', dates: 'Aug 23 – Sep 22' },
  { sign: 'Libra', symbol: '♎', element: 'air', dates: 'Sep 23 – Oct 22' },
  { sign: 'Scorpio', symbol: '♏', element: 'water', dates: 'Oct 23 – Nov 21' },
  { sign: 'Sagittarius', symbol: '♐', element: 'fire', dates: 'Nov 22 – Dec 21' },
  { sign: 'Capricorn', symbol: '♑', element: 'earth', dates: 'Dec 22 – Jan 19' },
  { sign: 'Aquarius', symbol: '♒', element: 'air', dates: 'Jan 20 – Feb 18' },
  { sign: 'Pisces', symbol: '♓', element: 'water', dates: 'Feb 19 – Mar 20' },
];

const ELEMENT_LABELS: Record<SignMeta['element'], string> = {
  fire: 'FIRE',
  earth: 'EARTH',
  air: 'AIR',
  water: 'WATER',
};

interface QuickSignSelectorProps {
  label: string;
  selectedSign?: ZodiacSign | null;
  onSelect: (sign: ZodiacSign) => void;
  className?: string;
}

export function QuickSignSelector({
  label,
  selectedSign,
  onSelect,
  className = '',
}: QuickSignSelectorProps) {
  return (
    <div className={`rounded-3xl border border-black/[0.07] bg-white p-5 sm:p-6 shadow-[0_2px_20px_rgba(0,0,0,0.02)] space-y-4 ${className}`}>
      <div className="flex items-center justify-between px-1">
        <label className="text-sm font-semibold text-[#0A0A0A]">
          {label}
        </label>
        {selectedSign ? (
          <span className="text-xs font-mono text-emerald-700">
            LOCKED: <span className="font-semibold text-[#0A0A0A] uppercase">{selectedSign}</span>
          </span>
        ) : (
          <span className="text-xs text-[#71717a]">Choose solar sign</span>
        )}
      </div>

      <div
        role="radiogroup"
        aria-label={label}
        className="grid grid-cols-3 sm:grid-cols-4 gap-2"
      >
        {ZODIAC_SIGNS.map((item) => {
          const isSelected = selectedSign === item.sign;
          return (
            <button
              key={item.sign}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(item.sign)}
              className={`
                min-h-[64px] min-w-[44px] p-3 rounded-2xl text-left transition-all cursor-pointer
                flex flex-col justify-between border
                focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]
                ${
                  isSelected
                    ? 'bg-[#F4F4F2] border-[#0A0A0A] text-[#0A0A0A] shadow-2xs'
                    : 'bg-white border-black/[0.06] text-[#0A0A0A] hover:bg-[#FAFAFA] hover:border-black/20'
                }
              `}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-lg leading-none">{item.symbol}</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#71717a]">
                  {ELEMENT_LABELS[item.element]}
                </span>
              </div>
              <div className="mt-2">
                <div className="font-sans font-medium text-sm leading-tight tracking-tight truncate text-[#0A0A0A]">
                  {item.sign}
                </div>
                <div className="text-[9px] text-[#71717a] truncate mt-0.5">
                  {item.dates}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
