'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SynastryResult } from '@/lib/synastry/types';
import { getOneSharpTruth } from '@/lib/report/composer';
import { ScoreGauge } from './ScoreGauge';
import { CategoryBars } from './CategoryBars';
import { CoStarBuckets } from './CoStarBuckets';
import { DoDontCard } from './DoDontCard';
import { PowerPressure } from './PowerPressure';
import { PaywallModal, PricingTier } from './PaywallModal';
import { ShareCardModal } from './ShareCardModal';
import { ErosDeck } from './ErosDeck';
import { ChaosCapsule } from './ChaosCapsule';
import { MicroReactions } from './MicroReactions';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface MatchTeaserViewProps {
  synastry: SynastryResult;
  matchId: string;
}

const LOCKED_SECTIONS = [
  {
    num: 1,
    title: 'Core Archetypal Dynamic',
    domain: 'Sun, Moon & Rising Placements',
    preview:
      'The gravitational field between your luminaries reveals a fundamental dynamic of instinctual polarity, governing your baseline comfort and conscious identity alignment...',
  },
  {
    num: 2,
    title: 'Emotional Safety & Attachment',
    domain: 'Moon-Moon, Moon-Venus & Neptune',
    preview:
      'Somatic regulation and subconscious vulnerability pacing dictate whether your emotional security flourishes or triggers silent defensive withdrawal...',
  },
  {
    num: 3,
    title: 'Communication & Mental Wavelength',
    domain: 'Mercury & Mental Archetypes',
    preview:
      'Intellectual tempo and conversational cadence operate on distinct frequencies, requiring conscious translation of subtext to prevent cyclical misunderstandings...',
  },
  {
    num: 4,
    title: 'Desire, Chemistry & Attraction',
    domain: 'Venus-Mars Polarity & Pluto',
    preview:
      'Visceral magnetism and erotic charge generate high kinetic attraction, alongside distinct styles of romantic pursuit and passionate reciprocity...',
  },
  {
    num: 5,
    title: 'Friction Points & Growth Edges',
    domain: 'Saturnian Boundaries & Mars',
    preview:
      'Predictable reactive tripwires and arguments emerge around specific boundary pressures; understanding these loops allows rapid, non-destructive repair...',
  },
  {
    num: 6,
    title: 'Karmic & Evolutionary Destiny',
    domain: 'Lunar Nodes & Transpersonal Planets',
    preview:
      'The deeper evolutionary assignment of this connection challenges both partners to outgrow ancestral conditioning and cultivate conscious autonomy...',
  },
  {
    num: 7,
    title: 'The Final Verdict & Navigation Guide',
    domain: 'Strategic Relationship Protocols',
    preview:
      'Three concrete, non-negotiable rules of engagement tailored specifically to your relationship modality to ensure sustained mutual expansion...',
  },
];

export const MatchTeaserView: React.FC<MatchTeaserViewProps> = ({
  synastry,
  matchId,
}) => {
  const router = useRouter();
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const nameA = synastry.personA?.name?.trim() || synastry.personA?.zodiacSign || 'You';
  const nameB = synastry.personB?.name?.trim() || synastry.personB?.zodiacSign || 'Them';
  const relationshipType = synastry.relationshipType || 'romantic';

  const sharpTruth = getOneSharpTruth(synastry);

  const handleCheckout = (plan: PricingTier) => {
    // In dev / test mode, immediately navigate to full report with unlocked query
    setIsPaywallOpen(false);
    router.push(`/report/${matchId}?unlocked=true&plan=${plan}`);
  };

  const handleShareLink = async () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#141414] flex flex-col items-center pb-24 sm:pb-32 selection:bg-[#141414] selection:text-white">
      {/* Top Header Bar */}
      <header className="w-full border-b border-[#D6D6D6] bg-[#F7F7F7]/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-xl mx-auto px-4 py-3.5 sm:py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-mono uppercase tracking-[0.08em] text-[#575657] hover:text-[#141414] transition-colors flex items-center gap-1.5"
          >
            <span>←</span>
            <span>New Check</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShareModalOpen(true)}
              className="text-xs font-mono tracking-[0.06em]"
            >
              Share Card
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareLink}
              className="text-xs font-mono tracking-[0.06em] text-[#575657] hover:text-[#141414]"
            >
              {copiedLink ? '✓ Copied' : 'Copy'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPaywallOpen(true)}
              className="text-xs font-mono tracking-[0.06em] font-semibold"
            >
              Unlock ($6.99)
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-xl px-4 py-8 sm:py-10 space-y-8">
        {/* Pair Hero Identity */}
        <div className="text-center space-y-3 border-b border-[#D6D6D6] pb-6">
          <div className="inline-flex items-center gap-2">
            <Badge variant="outline" size="sm">
              {relationshipType} synastry
            </Badge>
            {synastry.isQuickMode && (
              <Badge variant="warning" size="sm">
                2-SIGN QUICK MODE
              </Badge>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#141414]">
            {nameA} <span className="text-[#575657] italic font-normal">×</span> {nameB}
          </h1>

          <p className="text-[11px] font-mono text-[#575657] tracking-[0.14em] uppercase">
            Deterministic Ephemeris Calculation • 0.1° Precision
          </p>

          {/* Standout feature fast navigation */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShareModalOpen(true)}
              className="text-xs font-mono tracking-[0.06em]"
            >
              ✦ Share Card Studio
            </Button>
            <Link
              href={`/forecast?matchId=${matchId}`}
              className="text-xs font-mono uppercase tracking-[0.06em] px-3 py-2 border border-[#D6D6D6] bg-white text-[#141414] hover:border-[#141414] transition-colors"
            >
              7-Day Radar →
            </Link>
            <Link
              href="/invite"
              className="text-xs font-mono uppercase tracking-[0.06em] px-3 py-2 border border-[#D6D6D6] bg-white text-[#141414] hover:border-[#141414] transition-colors"
            >
              Cross Our Stars →
            </Link>
            <Link
              href="/chart"
              className="text-xs font-mono uppercase tracking-[0.06em] px-3 py-2 border border-[#D6D6D6] bg-white text-[#141414] hover:border-[#141414] transition-colors"
            >
              Free Natal Chart →
            </Link>
          </div>
        </div>

        {/* 1. Score Gauge */}
        <ScoreGauge
          score={synastry.overallScore}
          lowConfidence={synastry.lowConfidence}
          relationshipType={relationshipType}
        />

        {/* 2. One Sharp Truth Card (Co-Star .analysis-block style) */}
        <div className="p-6 sm:p-8 bg-white border border-[#D6D6D6] relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between border-b border-[#D6D6D6] pb-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#141414] font-semibold">
              ✦ The One Sharp Truth
            </span>
            <span className="font-mono text-[11px] text-[#575657] uppercase tracking-[0.06em]">
              {sharpTruth.orb}
            </span>
          </div>

          <div className="space-y-2.5">
            <h2 className="text-lg sm:text-xl font-serif font-normal tracking-tight text-[#141414]">
              {sharpTruth.aspectName}
            </h2>
            <blockquote className="text-sm sm:text-base text-[#141414] leading-relaxed font-serif italic border-l-2 border-[#141414] pl-4 py-1">
              &ldquo;{sharpTruth.quote}&rdquo;
            </blockquote>
          </div>

          <p className="text-[11px] font-mono text-[#575657] uppercase tracking-[0.08em] pt-1">
            {sharpTruth.headline}
          </p>

          <div className="pt-2 border-t border-[#D6D6D6]">
            <MicroReactions targetId={`sharp_truth_${matchId}`} label="Truth Impact" />
          </div>
        </div>

        {/* 3. 5 SRS Category Bars */}
        <CategoryBars categories={synastry.categories} />

        {/* 4. 7 Co-Star Psychological Buckets */}
        <CoStarBuckets buckets={synastry.coStarBuckets} />

        {/* 5. Transit Dynamics: Power vs Pressure */}
        <PowerPressure transits={synastry.transits} />

        {/* 6. Today's Pair Do & Don't Protocol */}
        <div className="space-y-3">
          <DoDontCard data={synastry.dailyDoDont} onShare={handleShareLink} />
          <div className="px-2">
            <MicroReactions targetId={`dodont_${matchId}`} label="Protocol Resonance" />
          </div>
        </div>

        {/* 6b. Standout Eros Web Relationship Deck */}
        <ErosDeck synastry={synastry} />

        {/* 6c. Standout Chaos Mode Planetary Time-Capsule */}
        <ChaosCapsule matchId={matchId} pairNames={{ personA: nameA, personB: nameB }} />

        {/* 7. Locked In-Depth Report Preview */}
        <div className="p-6 sm:p-8 bg-white border border-[#141414] space-y-6 relative overflow-hidden">
          <div className="border-b border-[#D6D6D6] pb-4 flex items-center justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#575657] font-semibold flex items-center gap-1.5">
                🔒 In-Depth Reading (7 Sections)
              </span>
              <h3 className="text-xl font-serif font-normal tracking-tight text-[#141414] mt-0.5">
                Full Psychological Synastry Report
              </h3>
            </div>
            <span className="font-mono text-sm font-bold text-[#141414] bg-[#F4F4F2] px-3 py-1.5 border border-[#D6D6D6]">
              $6.99
            </span>
          </div>

          {/* Locked Cards with Blur */}
          <div className="space-y-3">
            {LOCKED_SECTIONS.map((sec) => (
              <div
                key={sec.num}
                className="p-4 bg-[#FBFBFB] border border-[#D6D6D6] relative overflow-hidden group select-none cursor-pointer hover:border-[#141414] transition-colors"
                onClick={() => setIsPaywallOpen(true)}
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#575657] uppercase tracking-[0.08em] mb-1">
                  <span>Section 0{sec.num}</span>
                  <span className="text-[10px] text-[#575657]">{sec.domain}</span>
                </div>

                <h4 className="text-base font-serif font-normal tracking-tight text-[#141414] mb-1.5">
                  {sec.title}
                </h4>

                {/* Blurred masked prose text */}
                <p className="text-xs text-[#575657] blur-[3px] opacity-65 leading-relaxed font-sans line-clamp-2">
                  {sec.preview}
                </p>

                {/* Lock Overlay on hover */}
                <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#FBFBFB] bg-[#141414] px-3.5 py-1.5 border border-[#141414]">
                    Unlock Section →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Primary Unlock CTA Card */}
          <div className="pt-2 text-center space-y-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setIsPaywallOpen(true)}
              className="text-xs font-mono font-bold uppercase tracking-[0.1em] py-4 min-h-[52px]"
            >
              Unlock Full Synastry Report — $6.99
            </Button>
            <p className="text-[11px] font-mono text-[#575657] leading-tight">
              One-time payment • Lifetime access • 14-day money-back guarantee • For entertainment only
            </p>
          </div>
        </div>
      </main>

      {/* Sticky Mobile Unlock Dock */}
      <div className="fixed bottom-0 inset-x-0 bg-[#FBFBFB]/95 backdrop-blur-md border-t border-[#D6D6D6] p-3 sm:p-4 z-40 flex items-center justify-center">
        <div className="w-full max-w-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl sm:text-3xl font-normal text-[#141414] tabular-nums">
              {synastry.overallScore}%
            </span>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-mono font-bold text-[#141414] uppercase tracking-[0.06em]">
                {nameA} × {nameB}
              </span>
              <span className="block text-[10px] font-mono text-[#575657] uppercase tracking-[0.08em]">
                Full 7-Section Report
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsPaywallOpen(true)}
            className="text-xs font-mono font-bold uppercase tracking-[0.08em] px-5 min-h-[44px]"
          >
            Unlock Report — $6.99
          </Button>
        </div>
      </div>

      {/* Paywall Modal Dialog */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onCheckout={handleCheckout}
        pairNames={{ personA: nameA, personB: nameB }}
        matchId={matchId}
      />

      {/* Viral Share Card Studio Dialog */}
      <ShareCardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        synastry={synastry}
      />
    </div>
  );
};
