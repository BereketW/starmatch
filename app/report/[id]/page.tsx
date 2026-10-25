import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { decodeMatchId } from '@/lib/synastry/match-id';
import { computeSynastry } from '@/lib/synastry/engine';
import { composeFullReport } from '@/lib/report/composer';
import { FullReportView } from '@/components/report/FullReportView';
import { EditorialFooter } from '@/components/home/EditorialFooter';
import { Button } from '@/components/ui/Button';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ unlocked?: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params;
  const decoded = decodeMatchId(id);

  if (!decoded) {
    return {
      title: 'Report Not Found — StarMatch',
      description: 'The requested astrological match report is invalid.',
    };
  }

  const nameA = decoded.personA.name || 'You';
  const nameB = decoded.personB.name || 'Them';

  return {
    title: `${nameA} & ${nameB} — Full Deep Synastry Report | StarMatch`,
    description: `Complete 7-chapter synastry report for ${nameA} and ${nameB}. Astronomical calculations with unsparing psychological synthesis.`,
    openGraph: {
      title: `${nameA} & ${nameB} — Deep Synastry Analysis`,
      description: `Comprehensive 7-dimension compatibility report for ${nameA} and ${nameB}.`,
      type: 'article',
    },
  };
}

async function ReportContent({ params }: { params: Promise<{ id: string }> }) {
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
            Invalid Report Identifier
          </h1>
          <p className="text-xs text-[#575657] leading-relaxed font-mono">
            The report link cannot be decoded. Please recalculate your match from the home screen.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/">
            <Button variant="primary" size="md" className="w-full">
              Return to Home →
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const synastry = computeSynastry(payload.personA, payload.personB, {
    relationshipType: payload.relationshipType,
  });

  const fullReport = composeFullReport(synastry);

  return <FullReportView synastry={synastry} report={fullReport} matchId={id} />;
}

function ReportFallback() {
  return (
    <div className="max-w-4xl w-full mx-auto p-8 animate-pulse space-y-6">
      <div className="h-48 bg-[#F4F4F2] border border-[#D6D6D6]" />
      <div className="h-64 bg-[#F4F4F2] border border-[#D6D6D6]" />
    </div>
  );
}

export default function ReportPage(props: PageProps) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FBFBFB] text-[#141414]">
      {/* Editorial Navigation Header */}
      <header className="border-b border-[#D6D6D6] bg-[#F7F7F7]/95 sticky top-0 z-30 backdrop-blur-sm print:hidden">
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
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#141414] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#141414]" />
              Full Report Unlocked
            </span>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs font-mono">
                New Comparison +
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Full Report Canvas */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Suspense fallback={<ReportFallback />}>
          <ReportContent params={props.params} />
        </Suspense>
      </main>

      <EditorialFooter />
    </div>
  );
}
