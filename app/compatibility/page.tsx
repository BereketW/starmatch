import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ALL_78_PAIRS, ZODIAC_SIGNS_ORDER, SIGN_SEO_DATA } from '@/lib/synastry/seo-pairs';
import { EditorialFooter } from '@/components/home/EditorialFooter';

export const metadata: Metadata = {
  title: 'All 78 Zodiac Compatibility Sign Pairs | StarMatch',
  description:
    'Complete directory of all 78 unique zodiac compatibility combinations. Unfiltered astrological synastry, psychological dynamics, and Co-Star dimensions.',
  alternates: {
    canonical: 'https://starmatch.app/compatibility',
  },
};

export default function CompatibilityHubPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FBFBFB] text-[#141414]">
      <header className="border-b border-[#D6D6D6] bg-[#F7F7F7]/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-sans text-base tracking-[-0.03em] text-[#141414] font-semibold hover:opacity-75 transition-opacity"
          >
            <svg width="24" height="16" viewBox="0 0 36 24" fill="none" aria-hidden="true">
              <rect x="16.5" y="1" width="3" height="2" rx="1" fill="#141414" />
              <rect x="12" y="5" width="3.5" height="2" rx="1" fill="#141414" />
              <rect x="17" y="5" width="7" height="2" rx="1" fill="#141414" />
              <rect x="9" y="9" width="8" height="2" rx="1" fill="#141414" />
              <rect x="18.5" y="9" width="8.5" height="2" rx="1" fill="#141414" />
              <rect x="6" y="13" width="13.5" height="2" rx="1" fill="#141414" />
              <rect x="21" y="13" width="9" height="2" rx="1" fill="#141414" />
              <rect x="3" y="17" width="19" height="2" rx="1" fill="#141414" />
              <rect x="23.5" y="17" width="9.5" height="2" rx="1" fill="#141414" />
              <rect x="0" y="21" width="25" height="2" rx="1" fill="#141414" />
            </svg>
            <span>StarMatch</span>
            <span className="font-mono text-xs text-[#575657] font-normal uppercase tracking-[0.06em]">/ DIRECTORY</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-mono uppercase tracking-[0.06em] text-[#141414] hover:bg-[#141414] hover:text-[#FBFBFB] border border-[#141414] px-3 py-1.5 transition-colors"
          >
            Free Calculator
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        <section className="space-y-4 border-b border-[#D6D6D6] pb-8">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[11px] font-mono tracking-[0.08em] uppercase bg-[#F4F4F2] border border-[#D6D6D6] text-[#141414]">
              Directory
            </span>
            <span className="px-2.5 py-1 text-[11px] font-mono tracking-[0.08em] uppercase bg-white border border-[#D6D6D6] text-[#575657]">
              78 Unique Combinations
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#141414]">
            Zodiac Sign Compatibility
          </h1>
          <p className="text-[#575657] text-sm sm:text-base leading-relaxed max-w-2xl font-sans">
            Every zodiac sign pair creates a distinct psychological current. Browse all 78 canonical combinations to discover your archetypal chemistry, conflict friction, and natural flow.
          </p>
        </section>

        {/* Group by Sign */}
        <section className="space-y-10">
          {ZODIAC_SIGNS_ORDER.map((sign) => {
            const signKey = sign.toLowerCase();
            const signMeta = SIGN_SEO_DATA[signKey];
            const pairsForSign = ALL_78_PAIRS.filter(
              (p) => p.signA === sign || p.signB === sign
            );

            return (
              <div key={sign} className="bg-white border border-[#D6D6D6] p-6 space-y-4">
                <div className="flex items-baseline justify-between border-b border-[#D6D6D6] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-mono text-[#141414]">{signMeta.symbol}</span>
                    <h2 className="text-xl font-serif font-normal tracking-tight text-[#141414]">
                      {sign} Compatibility
                    </h2>
                    <span className="text-xs font-mono text-[#575657] uppercase">
                      ({signMeta.element} • {signMeta.modality})
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#575657]">
                    {pairsForSign.length} pairings
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 border-t border-l border-[#D6D6D6]">
                  {pairsForSign.map((p) => {
                    const otherSign = p.signA === sign ? p.signB : p.signA;
                    return (
                      <Link
                        key={p.slug}
                        href={`/compatibility/${p.slug}`}
                        className="p-3.5 bg-[#FBFBFB] hover:bg-white border-r border-b border-[#D6D6D6] transition-colors group block"
                      >
                        <div className="text-xs font-mono text-[#141414] group-hover:underline uppercase font-semibold">
                          {sign} + {otherSign}
                        </div>
                        <div className="text-[11px] font-mono text-[#575657] mt-1">
                          Score: {p.baselineScore}%
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      </main>

      <EditorialFooter />
    </div>
  );
}
