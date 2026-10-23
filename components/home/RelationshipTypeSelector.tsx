'use client';

import React from 'react';
import type { RelationshipType } from '@/lib/astro/types';

export interface RelationshipTypeOption {
  type: RelationshipType;
  label: string;
  icon: string;
  microcopy: string;
}

export const RELATIONSHIP_TYPES: RelationshipTypeOption[] = [
  {
    type: 'romantic',
    label: 'Romantic',
    icon: '✦',
    microcopy: 'Long-term intimacy, sexual voltage, emotional durability, and shared domestic destiny.',
  },
  {
    type: 'crush',
    label: 'Crush / Talking',
    icon: '✧',
    microcopy: 'Immediate spark, mutual obsession potential, unspoken tension, and initial illusion.',
  },
  {
    type: 'ex',
    label: 'Ex / Complicated',
    icon: '↺',
    microcopy: 'Karmic loop diagnosis, recurring friction triggers, closure dynamics, and relapse risks.',
  },
  {
    type: 'friend',
    label: 'Friendship',
    icon: '⌬',
    microcopy: 'Loyalty index, conversational ease, shared philosophy, and emotional safety.',
  },
  {
    type: 'coworker',
    label: 'Colleague / Co-founder',
    icon: '⊞',
    microcopy: 'Work ethic friction, authority balance, decision velocity, and conflict resolution.',
  },
  {
    type: 'family',
    label: 'Family / Bloodline',
    icon: '☍',
    microcopy: 'Ancestral patterns, generational wounds, unconditional duty, and boundary strain.',
  },
];

interface RelationshipTypeSelectorProps {
  value: RelationshipType;
  onChange: (type: RelationshipType) => void;
  className?: string;
}

export function RelationshipTypeSelector({
  value,
  onChange,
  className = '',
}: RelationshipTypeSelectorProps) {
  const currentOption =
    RELATIONSHIP_TYPES.find((opt) => opt.type === value) ?? RELATIONSHIP_TYPES[0];

  return (
    <div className={`rounded-3xl border border-black/[0.07] bg-white p-5 sm:p-6 shadow-[0_2px_20px_rgba(0,0,0,0.02)] space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <label className="text-xs font-medium text-[#0A0A0A] tracking-tight">
          Relationship Dynamic
        </label>
        <span className="text-xs text-[#71717a]">
          Active lens: <span className="font-semibold text-[#0A0A0A]">{currentOption.label}</span>
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Relationship Context"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5"
      >
        {RELATIONSHIP_TYPES.map((opt) => {
          const isSelected = value === opt.type;
          return (
            <button
              key={opt.type}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(opt.type)}
              className={`
                min-h-[56px] px-3.5 py-3 rounded-2xl text-left transition-all cursor-pointer
                flex flex-col justify-between border
                focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]
                ${
                  isSelected
                    ? 'bg-[#F4F4F2] border-[#0A0A0A] text-[#0A0A0A] shadow-2xs'
                    : 'bg-white border-black/[0.07] text-[#52525b] hover:bg-[#FAFAFA] hover:border-black/20'
                }
              `}
            >
              <div className="flex items-center justify-between w-full text-xs">
                <span className="text-[#0A0A0A]">{opt.icon}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]" />}
              </div>
              <div className="text-xs font-semibold text-[#0A0A0A] mt-1.5 truncate">
                {opt.label}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-[#71717a] px-1">
        {currentOption.microcopy}
      </p>
    </div>
  );
}
