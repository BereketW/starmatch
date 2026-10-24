'use client';

import React, { useState, useMemo } from 'react';
import type { SynastryAspect } from '@/lib/astro/types';
import { Badge } from '@/components/ui/Badge';

export interface AspectDirectoryProps {
  aspects: SynastryAspect[];
  personAName: string;
  personBName: string;
}

type AspectFilter = 'all' | 'harmonic' | 'friction' | 'conjunction';

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
};

export function AspectDirectory({
  aspects,
  personAName,
  personBName,
}: AspectDirectoryProps) {
  const [filter, setFilter] = useState<AspectFilter>('all');
  const [sortBy, setSortBy] = useState<'orb' | 'weight'>('orb');

  const filteredAspects = useMemo(() => {
    let result = [...aspects];

    if (filter === 'harmonic') {
      result = result.filter(
        (a) => a.type === 'trine' || a.type === 'sextile'
      );
    } else if (filter === 'friction') {
      result = result.filter(
        (a) => a.type === 'square' || a.type === 'opposition'
      );
    } else if (filter === 'conjunction') {
      result = result.filter((a) => a.type === 'conjunction');
    }

    if (sortBy === 'orb') {
      result.sort((a, b) => a.orb - b.orb);
    } else {
      result.sort((a, b) => (b.weight ?? 1) - (a.weight ?? 1));
    }

    return result;
  }, [aspects, filter, sortBy]);

  const counts = useMemo(() => {
    return {
      all: aspects.length,
      harmonic: aspects.filter((a) => a.type === 'trine' || a.type === 'sextile').length,
      friction: aspects.filter(
        (a) => a.type === 'square' || a.type === 'opposition'
      ).length,
      conjunction: aspects.filter((a) => a.type === 'conjunction').length,
    };
  }, [aspects]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#141414]" />
            <h3 className="font-mono text-xs uppercase tracking-[0.12em] text-[#575657]">
              Complete Cross-Chart Planetary Aspects
            </h3>
          </div>
          <p className="text-xs text-[#575657] mt-1 font-sans">
            Deterministic planetary contacts sorted by geometric orb tightness and synastry weight.
          </p>
        </div>

        {/* Sort control */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#575657] shrink-0 print:hidden">
          <span>Sort:</span>
          <button
            type="button"
            onClick={() => setSortBy('orb')}
            className={`min-h-[44px] px-2.5 py-1 border transition-colors cursor-pointer ${
              sortBy === 'orb'
                ? 'bg-[#141414] text-[#FBFBFB] border-[#141414] font-semibold'
                : 'border-[#D6D6D6] bg-white hover:border-[#141414] text-[#141414]'
            }`}
          >
            Tightest Orb
          </button>
          <button
            type="button"
            onClick={() => setSortBy('weight')}
            className={`min-h-[44px] px-2.5 py-1 border transition-colors cursor-pointer ${
              sortBy === 'weight'
                ? 'bg-[#141414] text-[#FBFBFB] border-[#141414] font-semibold'
                : 'border-[#D6D6D6] bg-white hover:border-[#141414] text-[#141414]'
            }`}
          >
            Highest Weight
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        role="tablist"
        aria-label="Aspect type filters"
        className="flex flex-wrap gap-2 border-b border-[#D6D6D6] pb-3 print:hidden"
      >
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'all'}
          onClick={() => setFilter('all')}
          className={`min-h-[44px] px-3.5 py-2 border text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
            filter === 'all'
              ? 'bg-[#141414] text-[#FBFBFB] border-[#141414]'
              : 'bg-white text-[#575657] border-[#D6D6D6] hover:text-[#141414] hover:border-[#141414]'
          }`}
        >
          <span>All Aspects</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-[#F4F4F2] text-[#141414]">
            {counts.all}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={filter === 'harmonic'}
          onClick={() => setFilter('harmonic')}
          className={`min-h-[44px] px-3.5 py-2 border text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
            filter === 'harmonic'
              ? 'bg-[rgba(144,202,243,0.45)] text-[#141414] border-[#141414] font-semibold'
              : 'bg-white text-[#575657] border-[#D6D6D6] hover:text-[#141414] hover:border-[#141414]'
          }`}
        >
          <span>Harmonic (Trines / Sextiles)</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-[rgba(144,202,243,0.3)] text-[#141414]">
            {counts.harmonic}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={filter === 'friction'}
          onClick={() => setFilter('friction')}
          className={`min-h-[44px] px-3.5 py-2 border text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
            filter === 'friction'
              ? 'bg-[rgba(243,144,144,0.45)] text-[#141414] border-[#141414] font-semibold'
              : 'bg-white text-[#575657] border-[#D6D6D6] hover:text-[#141414] hover:border-[#141414]'
          }`}
        >
          <span>Friction (Squares / Oppositions)</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-[rgba(243,144,144,0.3)] text-[#141414]">
            {counts.friction}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={filter === 'conjunction'}
          onClick={() => setFilter('conjunction')}
          className={`min-h-[44px] px-3.5 py-2 border text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
            filter === 'conjunction'
              ? 'bg-[#141414] text-[#FBFBFB] border-[#141414]'
              : 'bg-white text-[#575657] border-[#D6D6D6] hover:text-[#141414] hover:border-[#141414]'
          }`}
        >
          <span>Conjunctions</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-[#F4F4F2] text-[#141414]">
            {counts.conjunction}
          </span>
        </button>
      </div>

      {/* Aspects List */}
      <div className="space-y-3">
        {filteredAspects.length === 0 ? (
          <div className="p-8 text-center border border-[#D6D6D6] bg-white text-xs font-mono text-[#575657]">
            No aspects matching current filter.
          </div>
        ) : (
          filteredAspects.map((aspect, idx) => {
            const isHarmonic = aspect.type === 'trine' || aspect.type === 'sextile';
            const isFriction = aspect.type === 'square' || aspect.type === 'opposition';
            const symbol = ASPECT_SYMBOLS[aspect.type] || '•';

            let badgeVariant: 'power' | 'pressure' | 'default' = 'default';
            if (isHarmonic) badgeVariant = 'power';
            else if (isFriction) badgeVariant = 'pressure';

            return (
              <div
                key={`${aspect.planetA}-${aspect.type}-${aspect.planetB}-${idx}`}
                className="p-4 border border-[#D6D6D6] bg-white hover:border-[#575657] transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-base font-bold text-[#141414]">
                      {aspect.planetA}
                    </span>
                    <span className="text-lg font-mono leading-none text-[#141414]">
                      {symbol}
                    </span>
                    <span className="font-mono text-base font-bold text-[#141414]">
                      {aspect.planetB}
                    </span>

                    <Badge variant={badgeVariant} className="capitalize">
                      {aspect.type}
                    </Badge>

                    {aspect.orb <= 1.0 && (
                      <span className="text-[10px] font-mono uppercase tracking-[0.08em] px-1.5 py-0.5 bg-[#F4F4F2] text-[#141414] border border-[#141414]">
                        Exact Orb
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#575657] leading-relaxed max-w-2xl font-sans">
                    {aspect.description ||
                      `${personAName}'s ${aspect.planetA} forms a ${aspect.type} with ${personBName}'s ${aspect.planetB}.`}
                  </p>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 border-t md:border-t-0 border-[#D6D6D6] pt-2 md:pt-0">
                  <div className="font-mono text-xs text-[#575657]">
                    <span className="mr-1.5">Orb:</span>
                    <span className="font-semibold text-[#141414]">{aspect.orb.toFixed(1)}°</span>
                  </div>
                  {aspect.weight !== undefined && (
                    <div className="font-mono text-[11px] text-[#575657]">
                      <span>Weight: </span>
                      <span className="text-[#141414]">{aspect.weight.toFixed(1)}x</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
