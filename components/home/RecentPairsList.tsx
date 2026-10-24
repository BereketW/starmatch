'use client';

import React, { useSyncExternalStore, useState } from 'react';
import Link from 'next/link';
import { getRecentPairs, clearRecentPairs, type RecentPair } from '@/lib/synastry/match-id';

const emptyList: RecentPair[] = [];
let cachedRawPairs: string | null = null;
let cachedPairsSnapshot: RecentPair[] = emptyList;

function getPairsSnapshot(): RecentPair[] {
  if (typeof window === 'undefined') return emptyList;
  try {
    const raw = window.localStorage.getItem('starmatch_recent_pairs');
    if (!raw) {
      cachedRawPairs = null;
      cachedPairsSnapshot = emptyList;
      return emptyList;
    }
    if (raw === cachedRawPairs) {
      return cachedPairsSnapshot;
    }
    cachedRawPairs = raw;
    const parsed = getRecentPairs();
    cachedPairsSnapshot = parsed.length === 0 ? emptyList : parsed;
    return cachedPairsSnapshot;
  } catch {
    return emptyList;
  }
}

function getServerSnapshot(): RecentPair[] {
  return emptyList;
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('starmatch_pairs_updated', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('starmatch_pairs_updated', callback);
  };
}

export function RecentPairsList() {
  const [clientCleared, setClientCleared] = useState(false);
  const storePairs = useSyncExternalStore(
    subscribe,
    getPairsSnapshot,
    getServerSnapshot
  );
  const pairs = clientCleared ? emptyList : storePairs;

  const handleClear = () => {
    clearRecentPairs();
    setClientCleared(true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('starmatch_pairs_updated'));
    }
  };

  if (pairs.length === 0) {
    return null;
  }

  return (
    <section
      className="border border-[#D6D6D6] bg-white p-6 sm:p-8 space-y-5"
      aria-label="Recent Comparisons"
    >
      <div className="flex items-center justify-between border-b border-[#D6D6D6] pb-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xs font-mono uppercase tracking-[0.16em] text-[#141414]">
            Recent Comparisons
          </h2>
          <span className="text-xs font-mono text-[#575657]">({pairs.length})</span>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-[11px] font-mono uppercase tracking-wider text-[#575657] hover:text-[#141414] min-h-[36px] px-3 border border-transparent hover:border-[#D6D6D6] transition-colors flex items-center cursor-pointer"
        >
          Clear history
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border border-[#D6D6D6]">
        {pairs.map((pair) => (
          <Link
            key={pair.matchId}
            href={`/match/${pair.matchId}`}
            className="group block p-5 border-b sm:border-r border-[#D6D6D6] bg-[#FBFBFB] hover:bg-white transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#575657] mb-1">
                  {pair.relationshipType}
                </div>
                <div className="font-serif text-xl text-[#141414] truncate">
                  {pair.personA?.name || pair.nameA}{' '}
                  <span className="italic text-[#575657]">&amp;</span>{' '}
                  {pair.personB?.name || pair.nameB}
                </div>
                {pair.signA && pair.signB ? (
                  <div className="text-xs font-mono text-[#575657] mt-1">
                    {pair.signA} × {pair.signB}
                  </div>
                ) : pair.personA?.birthDate || pair.personB?.birthDate ? (
                  <div className="text-xs font-mono text-[#575657] mt-1">
                    {pair.personA?.birthDate || '—'} × {pair.personB?.birthDate || '—'}
                  </div>
                ) : null}
              </div>
              {pair.overallScore !== undefined && (
                <div className="text-right shrink-0 border border-[#141414] bg-white px-3 py-1.5">
                  <div className="font-serif text-2xl leading-none text-[#141414]">
                    {Math.round(pair.overallScore)}
                  </div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
