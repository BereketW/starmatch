import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { decodeMatchId } from '@/lib/synastry/match-id';
import { computeSynastry } from '@/lib/synastry/engine';
import { MatchTeaserView } from '@/components/match/MatchTeaserView';
import { EditorialFooter } from '@/components/home/EditorialFooter';
import { Button } from '@/components/ui/Button';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params;
  const decoded = decodeMatchId(id);

  if (!decoded) {
    return {
      title: 'Match Profile Not Found — StarMatch',
      description: 'The requested astrological match URL is invalid or malformed.',
    };
  }

  const nameA = decoded.personA.name || 'You';
  const nameB = decoded.personB.name || 'Them';

  return {
    title: `${nameA} & ${nameB} — StarMatch Synastry`,
    description: `Instant synastry compatibility report between ${nameA} and ${nameB}. Calculated with 0.1° astronomical ephemeris precision.`,
    openGraph: {
      title: `${nameA} & ${nameB} — Synastry Compatibility | StarMatch`,
      description: `Instant astrological synastry report for ${nameA} and ${nameB}.`,
      type: 'website',
    },
  };
}

async function MatchContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = decodeMatchId(id);

  if (!payload) {
    return (
      <div className="max-w-md mx-auto my-auto p-6 sm:p-8 text-center space-y-6 border border-[#D6D6D6] bg-white">
        <div className="w-12 h-12 bg-[rgba(243,144,144,0.25)] border border-[#575657] mx-auto flex items-center justify-center text-[#141414] text-xl font-mono">
          !
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-normal text-[#141414]">
            Invalid Match Identifier
          </h1>
          <p className="text-xs text-[#575657] leading-relaxed font-mono">
            The link appears to be malformed or corrupted. StarMatch encodes all natal chart parameters
            directly in stateless URLs.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/">
            <Button variant="primary" size="md" className="w-full">
              Create New Match →
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const synastry = computeSynastry(payload.personA, payload.personB, {
    relationshipType: payload.relationshipType,
  });

  return <MatchTeaserView synastry={synastry} matchId={id} />;
}

function MatchFallback() {
  return (
    <div className="max-w-4xl w-full mx-auto p-8 animate-pulse space-y-6">
      <div className="h-48 bg-[#F4F4F2] border border-[#D6D6D6]" />
      <div className="h-64 bg-[#F4F4F2] border border-[#D6D6D6]" />
    </div>
  );
}

export default function MatchPage(props: PageProps) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FBFBFB] text-[#141414]">
      {/* Editorial Navigation Bar */}
      <header className="border-b border-[#D6D6D6] bg-[#F7F7F7]/95 sticky top-0 z-30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-sans text-base tracking-[-0.03em] font-semibold text-[#141414] hover:opacity-75 transition-opacity"
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
          </Link>
          <div className="flex items-center gap-4">
            <nav aria-label="Secondary navigation" className="hidden md:flex items-center gap-5 text-xs font-mono uppercase tracking-[0.06em] text-[#575657]">
              <Link href="/chart" className="hover:text-[#141414] transition-colors">Chart</Link>
              <Link href="/forecast" className="hover:text-[#141414] transition-colors">Transits</Link>
              <Link href="/compatibility" className="hover:text-[#141414] transition-colors">Directory</Link>
              <Link href="/invite" className="hover:text-[#141414] transition-colors">Cross Stars</Link>
            </nav>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs font-mono">
                New Comparison +
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Teaser Canvas */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Suspense fallback={<MatchFallback />}>
          <MatchContent params={props.params} />
        </Suspense>
      </main>

      <EditorialFooter />
    </div>
  );
}
