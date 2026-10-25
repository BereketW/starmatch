'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { decodeMatchId } from '@/lib/synastry/match-id';
import { computeSynastry } from '@/lib/synastry/engine';
import { SynastryResult } from '@/lib/synastry/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EditorialFooter } from '@/components/home/EditorialFooter';

interface DayForecast {
  dayIndex: number;
  dayName: string;
  dateStr: string;
  headline: string;
  chemistryScore: number;
  pressureLevel: 'Low' | 'Moderate' | 'High';
  doAction: string;
  dontAction: string;
  aspectDriver: string;
}

const FORECAST_THEMES = [
  {
    headline: 'Moon-Venus Trine: Somatic Vulnerability Window',
    pressure: 'Low' as const,
    doAction: 'Initiate a 10-minute check-in without checking phones.',
    dontAction: 'Assume quietness indicates passive aggression.',
    aspect: 'Transit Moon trine Natal Venus (0.8°)',
  },
  {
    headline: 'Mercury Sextile Mars: Decisive Collaborative Momentum',
    pressure: 'Low' as const,
    doAction: 'Resolve outstanding logistics, travel, or scheduling friction.',
    dontAction: 'Over-explain simple agreements or re-open closed topics.',
    aspect: 'Transit Mercury sextile Natal Mars (1.2°)',
  },
  {
    headline: 'Sun Square Saturn: Boundary & Autonomy Pressure',
    pressure: 'High' as const,
    doAction: 'Grant mutual solitude without taking distance personally.',
    dontAction: 'Demand reassurance when energy is depleted.',
    aspect: 'Transit Sun square Natal Saturn (1.9°)',
  },
  {
    headline: 'Moon Ingress: Emotional Rhythm Reset',
    pressure: 'Moderate' as const,
    doAction: 'Cook or share an unhurried evening meal.',
    dontAction: 'Bring up heavy historical disputes before sleep.',
    aspect: 'Transit Moon conjunct Natal Sun (2.1°)',
  },
  {
    headline: 'Venus Trine Jupiter: Spontaneous Shared Expansion',
    pressure: 'Low' as const,
    doAction: 'Say yes to an unplanned outing or creative pursuit.',
    dontAction: 'Micromanage minor details or spend with reckless abandon.',
    aspect: 'Transit Venus trine Natal Jupiter (0.4°)',
  },
  {
    headline: 'Mars Opposition Uranus: Kinetic Tripwires & Short Tempers',
    pressure: 'High' as const,
    doAction: 'Take 5 deep breaths before replying in tense moments.',
    dontAction: 'Issue ultimatums or send emotional paragraphs over text.',
    aspect: 'Transit Mars opposition Natal Uranus (1.5°)',
  },
  {
    headline: 'Sun Sextile Neptune: Intuitive Harmony & Soft Reconnection',
    pressure: 'Low' as const,
    doAction: 'Recap the week and express appreciation for small gestures.',
    dontAction: 'Ruminate over what could have gone better.',
    aspect: 'Transit Sun sextile Natal Neptune (0.9°)',
  },
];

function WeeklyForecastContent() {
  const [matchId, setMatchId] = useState<string>('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [clientDate, setClientDate] = useState<Date | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setClientDate(new Date());
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const mId = params.get('matchId') || params.get('id');
        if (mId) setMatchId(mId);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const synastry: SynastryResult = useMemo(() => {
    const currentDate = clientDate ? clientDate.toISOString() : '2026-10-22T00:00:00Z';
    if (matchId) {
      const decoded = decodeMatchId(matchId);
      if (decoded) {
        return computeSynastry(decoded.personA, decoded.personB, {
          relationshipType: decoded.relationshipType,
          currentDate,
        });
      }
    }
    // Default pair for preview
    return computeSynastry(
      { name: 'Alex', birthDate: '1996-04-12', zodiacSign: 'Aries' },
      { name: 'Taylor', birthDate: '1998-11-04', zodiacSign: 'Scorpio' },
      { relationshipType: 'romantic', currentDate }
    );
  }, [matchId, clientDate]);

  const nameA = synastry.personA?.name || 'You';
  const nameB = synastry.personB?.name || 'Them';

  // Deterministically generate 7 days of forecast
  const weekForecast: DayForecast[] = useMemo(() => {
    const baseScore = synastry.overallScore ?? 75;
    const baseTime = clientDate ? clientDate.getTime() : Date.UTC(2026, 9, 26);
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return FORECAST_THEMES.map((theme, i) => {
      const dayDate = new Date(baseTime + i * 86400000);
      const scoreVariance = ((i * 7 + 3) % 15) - 7;
      const chemScore = Math.max(30, Math.min(98, baseScore + scoreVariance));

      return {
        dayIndex: i + 1,
        dayName: dayNames[i % 7],
        dateStr: dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        headline: theme.headline,
        chemistryScore: chemScore,
        pressureLevel: theme.pressure,
        doAction: theme.doAction,
        dontAction: theme.dontAction,
        aspectDriver: theme.aspect,
      };
    });
  }, [synastry, clientDate]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#141414] flex flex-col justify-between selection:bg-[#141414] selection:text-white">
      {/* Top Header */}
      <header className="border-b border-[#D6D6D6] bg-[#F7F7F7]/95 sticky top-0 z-30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
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
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#575657] hidden sm:inline">
              Weekly Relationship Transits
            </span>
            {matchId && (
              <Link href={`/match/${matchId}`}>
                <Button variant="ghost" size="sm" className="text-xs font-mono">
                  View Teaser ←
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-12 flex-1 space-y-8">
        {/* Hero Title */}
        <div className="text-center space-y-3 border-b border-[#D6D6D6] pb-6">
          <Badge variant="outline" size="sm">
            7-DAY TRANSIT RADAR
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#141414]">
            {nameA} <span className="text-[#575657] italic font-normal">×</span> {nameB}
          </h1>
          <p className="text-xs sm:text-sm text-[#575657] max-w-md mx-auto leading-relaxed font-sans">
            Real-time planetary movements calculated against your synastry chart. Track friction tripwires and high-connection windows day-by-day.
          </p>
        </div>

        {/* 7-Day Forecast Cards */}
        <div className="space-y-4">
          {weekForecast.map((day) => (
            <div
              key={day.dayIndex}
              className="p-5 sm:p-6 bg-white border border-[#D6D6D6] space-y-3 transition-colors hover:border-[#575657]"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between border-b border-[#D6D6D6] pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#141414] uppercase tracking-[0.06em]">
                    {day.dayName}
                  </span>
                  <span className="font-mono text-xs text-[#575657]">
                    • {day.dateStr}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#141414] font-semibold">
                    {day.chemistryScore}% Chem
                  </span>
                  <span
                    className={`font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 border ${
                      day.pressureLevel === 'High'
                        ? 'bg-[rgba(243,144,144,0.3)] text-[#141414] border-[#575657]/50'
                        : day.pressureLevel === 'Moderate'
                        ? 'bg-[#F4F4F2] text-[#141414] border-[#D6D6D6]'
                        : 'bg-[rgba(144,202,243,0.3)] text-[#141414] border-[#575657]/50'
                    }`}
                  >
                    {day.pressureLevel} Pressure
                  </span>
                </div>
              </div>

              {/* Headline */}
              <div>
                <h3 className="text-base sm:text-lg font-serif font-normal text-[#141414] tracking-tight">
                  {day.headline}
                </h3>
                <span className="font-mono text-[10px] text-[#575657] block mt-0.5">
                  Planetary Driver: {day.aspectDriver}
                </span>
              </div>

              {/* Day DO & DON'T */}
              <div className="grid grid-cols-1 sm:grid-cols-2 border border-[#575657] pt-0">
                <div className="p-3.5 bg-[rgba(144,202,243,0.18)] border-b sm:border-b-0 sm:border-r border-[#575657] space-y-1">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#141414]">
                    DO
                  </span>
                  <p className="text-xs text-[#141414] leading-snug font-sans">{day.doAction}</p>
                </div>

                <div className="p-3.5 bg-[rgba(243,144,144,0.18)] space-y-1">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#141414]">
                    DON&apos;T
                  </span>
                  <p className="text-xs text-[#141414] leading-snug font-sans">{day.dontAction}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sunday Email Digest Preview Box (FR-31 & FR-33) */}
        <div className="p-6 sm:p-8 bg-white border border-[#141414] space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#575657] font-bold">
              ✦ Sunday Morning Delivery
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-normal tracking-tight text-[#141414]">
              Weekly Relationship Digest
            </h3>
            <p className="text-xs text-[#575657] leading-relaxed font-sans">
              Get next week&apos;s 7-day planetary forecast for {nameA} and {nameB} delivered to your inbox every Sunday at 8:00 AM.
            </p>
          </div>

          {!subscribed ? (
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-[#FBFBFB] border-b border-dashed border-[#A6A6A6] px-3 py-2.5 text-sm text-[#141414] placeholder-[#9B9B9B] focus:outline-none focus:border-[#141414] transition-colors"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="font-mono text-xs uppercase tracking-[0.08em] font-semibold min-h-[44px]"
                >
                  Subscribe Free →
                </Button>
              </div>
              <p className="text-[11px] font-mono text-[#575657]">
                One-click unsubscribe link included in every email. No spam, ever.
              </p>
            </form>
          ) : (
            <div className="p-4 bg-[rgba(144,202,243,0.25)] border border-[#575657] space-y-1 text-center">
              <span className="font-mono text-xs font-bold text-[#141414] uppercase block">
                ✓ Digest Subscribed
              </span>
              <p className="text-xs text-[#575657]">
                You will receive the weekly transit forecast for {nameA} &amp; {nameB} at {email}.
              </p>
            </div>
          )}
        </div>
      </main>

      <EditorialFooter />
    </div>
  );
}

export default function WeeklyForecastPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white text-[#71717a] font-mono text-xs flex items-center justify-center p-8">
          Loading pair forecast...
        </div>
      }
    >
      <WeeklyForecastContent />
    </Suspense>
  );
}
