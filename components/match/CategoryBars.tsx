import React from 'react';
import { CategoryScores } from '@/lib/synastry/types';

export interface CategoryBarsProps {
  categories: CategoryScores;
  className?: string;
  showDescriptions?: boolean;
}

interface CategoryMeta {
  key: keyof CategoryScores;
  label: string;
  description: string;
}

const CATEGORY_META: CategoryMeta[] = [
  {
    key: 'chemistry',
    label: 'Chemistry',
    description: 'Physical magnetism, aesthetic resonance, and somatic spark.',
  },
  {
    key: 'communication',
    label: 'Communication',
    description: 'Intellectual cadence, mental wavelength, and clarity of intent.',
  },
  {
    key: 'emotionalBond',
    label: 'Emotional Bond',
    description: 'Instinctive vulnerability, psychological containment, and safety.',
  },
  {
    key: 'conflictStyle',
    label: 'Conflict Style',
    description: 'Tension handling, boundary friction, and resilience of repair.',
  },
  {
    key: 'longTermPotential',
    label: 'Long-Term Potential',
    description: 'Shared developmental horizon and mutual staying power.',
  },
];

export const CategoryBars: React.FC<CategoryBarsProps> = ({
  categories,
  className = '',
  showDescriptions = true,
}) => {
  return (
    <div
      className={`p-6 sm:p-8 bg-white border border-[#D6D6D6] rounded-none text-[#141414] space-y-6 ${className}`.trim()}
    >
      <div className="border-b border-[#D6D6D6] pb-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#575657]">
          Dimensional Breakdown
        </span>
        <h3 className="text-xl font-serif font-normal tracking-tight text-[#141414] mt-1">
          5 Core Compatibility Dimensions
        </h3>
      </div>

      <div className="space-y-5">
        {CATEGORY_META.map(({ key, label, description }) => {
          const rawVal = categories ? categories[key] : 50;
          const score = Math.min(100, Math.max(0, Math.round(typeof rawVal === 'number' ? rawVal : 50)));

          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono font-medium tracking-[0.06em] text-[#141414] uppercase text-xs">
                  {label}
                </span>
                <span className="font-mono text-xs font-semibold tabular-nums text-[#141414]">
                  {score}%
                </span>
              </div>

              {/* Progress Track */}
              <div
                className="w-full h-2.5 bg-[#F4F4F2] border border-[#D6D6D6] rounded-none overflow-hidden"
                role="meter"
                aria-label={label}
                aria-valuenow={score}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full bg-[#141414] transition-all duration-700 ease-out"
                  style={{ width: `${score}%` }}
                />
              </div>

              {showDescriptions && (
                <p className="text-xs text-[#575657] leading-relaxed pt-0.5 font-sans">
                  {description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
