'use client';

import React from 'react';
import Link from 'next/link';

export function EditorialFooter() {
  return (
    <footer className="mt-20 border-t border-[#D6D6D6] bg-[#FBFBFB] py-12 text-[#575657] text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <svg
                width="28"
                height="18"
                viewBox="0 0 36 24"
                fill="none"
                className="shrink-0"
                aria-hidden="true"
              >
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
              <span className="font-sans text-base font-semibold tracking-[-0.03em] text-[#141414]">
                StarMatch
              </span>
              <span className="sr-only">STARMATCH OBSERVATORY</span>
            </Link>
            <p className="text-xs text-[#575657] max-w-md font-serif leading-relaxed">
              Deterministic astronomical synastry pairing 0.1° VSOP87 planetary ephemerides with psychological compatibility synthesis.
            </p>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-6 text-xs font-mono uppercase tracking-[0.06em] text-[#575657]">
            <Link href="/chart" className="hover:text-[#141414] transition-colors">
              Natal Chart
            </Link>
            <Link href="/forecast" className="hover:text-[#141414] transition-colors">
              7-Day Transits
            </Link>
            <Link href="/compatibility" className="hover:text-[#141414] transition-colors">
              Compatibility
            </Link>
            <Link href="/invite" className="hover:text-[#141414] transition-colors">
              Cross Stars
            </Link>
            <Link href="/account" className="hover:text-[#141414] transition-colors">
              Vault
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-[#D6D6D6] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#575657]">
          <div>
            © 2026 StarMatch Inc. 14-day statutory money-back guarantee on unlocked reports.
          </div>
          <div className="text-[11px] text-[#575657]">
            For self-reflection and introspective entertainment · 18+
          </div>
        </div>
      </div>
    </footer>
  );
}
