'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { SynastryResult } from '@/lib/synastry/types';
import type { FullDeepReport } from '@/lib/report/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getTierInfo } from '@/components/match/ScoreGauge';
import { CategoryBars } from '@/components/match/CategoryBars';
import { CoStarBuckets } from '@/components/match/CoStarBuckets';
import { DoDontCard } from '@/components/match/DoDontCard';
import { PowerPressure } from '@/components/match/PowerPressure';
import { AspectDirectory } from './AspectDirectory';

export interface FullReportViewProps {
  synastry: SynastryResult;
  report: FullDeepReport;
  matchId: string;
}

export function FullReportView({ synastry, report, matchId }: FullReportViewProps) {
  const [copied, setCopied] = useState(false);

  const nameA = report.personA?.name || report.pair?.personA?.name || 'You';
  const nameB = report.personB?.name || report.pair?.personB?.name || 'Them';
  const relationshipType = report.relationshipType || report.pair?.relationshipType || 'romantic';
  const tierInfo = getTierInfo(report.overallScore);

  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // fallback
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <article className="space-y-12 print:space-y-8 text-[#141414]">
      {/* Top Navigation & Action Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D6D6D6] print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href={`/match/${matchId}`}
            className="text-xs font-mono uppercase tracking-[0.08em] text-[#575657] hover:text-[#141414] transition-colors flex items-center gap-1.5 min-h-[44px] px-2"
          >
            <span>← Back to Teaser</span>
          </Link>
          <span className="text-[#D6D6D6]">/</span>
          <Badge variant="power" className="text-[10px]">
            UNLOCKED DEEP REPORT
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="min-h-[44px]"
          >
            {copied ? '✓ Link Copied' : 'Share Report'}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="min-h-[44px]"
          >
            Export / Print PDF
          </Button>
        </div>
      </header>

      {/* Hero Header */}
      <section className="text-center space-y-4 pt-2 border-b border-[#D6D6D6] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#D6D6D6] bg-[#FBFBFB] font-mono text-xs text-[#575657]">
          <span>{relationshipType.toUpperCase()} SYNASTRY PROFILE</span>
          <span>•</span>
          <span className="text-[#141414] font-semibold">100% UNLOCKED</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#141414]">
          {nameA} &amp; {nameB}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[#575657]">
          <span>
            Composite Score: <strong className="text-[#141414] font-mono text-sm">{Math.round(report.overallScore)}/100</strong>
          </span>
          <span>•</span>
          <span>
            Tier: <strong className="text-[#141414] uppercase">{tierInfo.tier}</strong>
          </span>
          <span>•</span>
          <span>Generated: {new Date(report.generatedAt).toLocaleDateString()}</span>
        </div>
      </section>

      {/* One Sharp Truth Banner */}
      {report.oneSharpTruth && (
        <section className="p-6 sm:p-8 border border-[#141414] bg-white text-center space-y-3">
          <span className="font-mono text-[11px] tracking-[0.14em] text-[#575657] uppercase font-semibold">
            THE ONE SHARP TRUTH
          </span>
          <blockquote className="font-serif text-xl sm:text-2xl text-[#141414] italic max-w-2xl mx-auto leading-relaxed">
            &ldquo;{report.oneSharpTruth.headline}&rdquo;
          </blockquote>
          <p className="text-xs sm:text-sm text-[#575657] max-w-xl mx-auto font-sans leading-relaxed">
            {report.oneSharpTruth.elaboration || report.oneSharpTruth.quote}
          </p>
        </section>
      )}

      {/* Executive Overview Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-label="Synthesis Metrics">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#141414]" />
            <h2 className="font-mono text-xs uppercase tracking-[0.1em] text-[#575657]">
              5 Synastry Dimensions (SRS)
            </h2>
          </div>
          <CategoryBars categories={synastry.categories} />
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#141414]" />
            <h2 className="font-mono text-xs uppercase tracking-[0.1em] text-[#575657]">
              Co-Star 7 Dimension Profile
            </h2>
          </div>
          <CoStarBuckets buckets={synastry.coStarBuckets} />
        </Card>
      </section>

      {/* Daily Dynamics & Transits */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-label="Behavioral Protocols">
        <DoDontCard data={synastry.dailyDoDont} />
        <PowerPressure transits={synastry.transits} />
      </section>

      {/* Jump Navigation Index */}
      <nav
        aria-label="Report Chapters"
        className="p-4 border border-[#D6D6D6] bg-white print:hidden"
      >
        <div className="text-[11px] font-mono uppercase tracking-[0.12em] text-[#575657] mb-2">
          Report Chapters
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {report.sections.map((sec, i) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className="px-2.5 py-1.5 border border-[#D6D6D6] bg-[#FBFBFB] text-[#141414] hover:bg-[#141414] hover:text-[#FBFBFB] hover:border-[#141414] transition-colors"
            >
              0{i + 1}. {sec.title}
            </a>
          ))}
          <a
            href="#aspect-directory"
            className="px-2.5 py-1.5 border border-[#D6D6D6] bg-[#FBFBFB] text-[#141414] hover:bg-[#141414] hover:text-[#FBFBFB] hover:border-[#141414] transition-colors"
          >
            08. Aspect Directory
          </a>
        </div>
      </nav>

      {/* The 7 Deep Narrative Sections (Co-Star .analysis-block style) */}
      <section className="space-y-8" aria-label="Deep Synastry Analysis">
        <div className="border-b border-[#D6D6D6] pb-2">
          <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-[#575657]">
            Comprehensive Analysis • 7 Deep Dimensions
          </h2>
        </div>

        {report.sections.map((section, index) => {
          const proseText = section.narrative || section.prose || '';
          return (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-8 p-6 sm:p-8 border border-[#D6D6D6] bg-white space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#D6D6D6] pb-4">
                <div className="space-y-1">
                  <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#575657]">
                    SECTION 0{index + 1}
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl text-[#141414] font-normal">
                    {section.title}
                  </h3>
                </div>
                <span className="font-mono text-xs text-[#575657] italic">
                  {section.subtitle}
                </span>
              </div>

              {/* Narrative Prose */}
              <div className="max-w-none text-[#575757] text-sm sm:text-base leading-relaxed space-y-4 font-sans">
                {proseText.split('\n\n').map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>

              {/* Key Planetary Aspects Governing This Section */}
              {section.aspects && section.aspects.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-mono uppercase tracking-[0.12em] text-[#575657]">
                    Primary Aspect Drivers
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {section.aspects.map((asp, aIdx) => (
                      <Badge key={aIdx} variant="default" className="text-xs">
                        {asp.planetA} {asp.type} {asp.planetB} ({asp.orb.toFixed(1)}°)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Structured Insights (Strengths, Friction, Practical Takeaways) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#D6D6D6]">
                {section.strengths && section.strengths.length > 0 && (
                  <div className="p-4 border border-[#575657]/50 bg-[rgba(144,202,243,0.18)] space-y-2">
                    <div className="text-xs font-mono uppercase tracking-[0.08em] text-[#141414] flex items-center gap-1.5 font-semibold">
                      <span>✦</span>
                      <span>Pair Strengths</span>
                    </div>
                    <ul className="text-xs text-[#575657] space-y-1 list-disc list-inside font-sans">
                      {section.strengths.map((str, sIdx) => (
                        <li key={sIdx}>{str}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {section.frictionPoints && section.frictionPoints.length > 0 && (
                  <div className="p-4 border border-[#575657]/50 bg-[rgba(243,144,144,0.18)] space-y-2">
                    <div className="text-xs font-mono uppercase tracking-[0.08em] text-[#141414] flex items-center gap-1.5 font-semibold">
                      <span>⚠</span>
                      <span>Friction Points</span>
                    </div>
                    <ul className="text-xs text-[#575657] space-y-1 list-disc list-inside font-sans">
                      {section.frictionPoints.map((frc, fIdx) => (
                        <li key={fIdx}>{frc}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {section.actionableGuidance && (
                <div className="p-4 border border-[#D6D6D6] bg-[#FBFBFB] text-xs text-[#575657] font-sans">
                  <span className="font-mono text-[#141414] uppercase tracking-[0.08em] font-semibold mr-2">
                    Strategic Directive:
                  </span>
                  <span>{section.actionableGuidance}</span>
                </div>
              )}
            </section>
          );
        })}
      </section>

      {/* Full Aspect Directory Section */}
      <section id="aspect-directory" className="scroll-mt-8 pt-4">
        <AspectDirectory
          aspects={synastry.aspects}
          personAName={nameA}
          personBName={nameB}
        />
      </section>

      {/* Report Footer / Certificate */}
      <footer className="p-6 border border-[#D6D6D6] bg-white text-center space-y-3">
        <div className="font-mono text-xs uppercase tracking-[0.12em] text-[#141414] font-semibold">
          StarMatch Verifiable Synastry Attestation
        </div>
        <p className="text-xs text-[#575657] max-w-md mx-auto font-sans">
          Calculated deterministically using VSOP87 planetary ephemerides with zero synthetic or
          randomized weighting.
        </p>
        <div className="font-mono text-[11px] text-[#575657]">
          Match ID: {matchId}
        </div>
      </footer>
    </article>
  );
}
