'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { computeNatalChart } from '@/lib/astro/ephemeris';
import { NatalChart, BirthData } from '@/lib/astro/types';
import { PersonFormData, PersonInputCard } from '@/components/home/PersonInputCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EditorialFooter } from '@/components/home/EditorialFooter';

export default function PersonalChartPage() {
  const [formData, setFormData] = useState<PersonFormData>({
    name: 'You',
    birthDate: '1998-05-14',
    birthTime: '14:30',
    city: 'New York, USA',
    latitude: 40.7128,
    longitude: -74.006,
  });

  const birthData: BirthData = useMemo(() => ({
    name: formData.name.trim() || 'You',
    birthDate: formData.birthDate,
    birthTime: formData.birthTime || undefined,
    city: formData.city || undefined,
    latitude: formData.latitude,
    longitude: formData.longitude,
  }), [formData]);

  const chart: NatalChart | null = useMemo(() => {
    if (!formData.birthDate) return null;
    try {
      return computeNatalChart(birthData);
    } catch {
      return null;
    }
  }, [formData.birthDate, birthData]);

  const sun = chart?.planets.find((p) => p.name === 'Sun');
  const moon = chart?.planets.find((p) => p.name === 'Moon');
  const rising = chart?.ascendant;

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#141414] flex flex-col justify-between selection:bg-[#141414] selection:text-white">
      {/* Header */}
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
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#141414] hidden sm:inline">
              ● Free Personal Chart
            </span>
            <Link href="/invite">
              <Button variant="ghost" size="sm" className="text-xs font-mono">
                Cross Stars +
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-12 flex-1 space-y-8">
        {/* Title */}
        <div className="text-center space-y-3 border-b border-[#D6D6D6] pb-6">
          <Badge variant="outline" size="sm">
            THE &ldquo;YOU&rdquo; TAB • NATAL BLUEPRINT
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#141414]">
            Your Personal Birth Chart
          </h1>
          <p className="text-xs sm:text-sm text-[#575657] max-w-md mx-auto leading-relaxed font-sans">
            Deterministic 0.1° ephemeris calculations for all 10 planetary bodies, lunar nodes, and house cusps. Lead directly into two-person synastry.
          </p>
        </div>

        {/* Input Card Form */}
        <PersonInputCard
          label="Your Birth Data"
          defaultPlaceholderName="You"
          data={formData}
          onChange={setFormData}
        />

        {chart && (
          <div className="space-y-6">
            {/* The Big 3 Luminary Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-l border-[#D6D6D6]">
              {/* Sun */}
              <div className="p-4 sm:p-5 bg-white border-r border-b border-[#D6D6D6] text-center space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#575657] block">
                  Conscious Identity
                </span>
                <span className="text-xs font-mono text-[#575657] uppercase">☉ SUN SIGN</span>
                <p className="text-xl font-serif font-normal text-[#141414] tracking-wide">
                  {sun?.sign || 'Unknown'}
                </p>
                <span className="text-[11px] font-mono text-[#575657]">
                  {sun ? `${sun.degree.toFixed(1)}°` : ''}
                </span>
              </div>

              {/* Moon */}
              <div className="p-4 sm:p-5 bg-white border-r border-b border-[#D6D6D6] text-center space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#575657] block">
                  Instinct &amp; Emotion
                </span>
                <span className="text-xs font-mono text-[#575657] uppercase">☽ MOON SIGN</span>
                <p className="text-xl font-serif font-normal text-[#141414] tracking-wide">
                  {moon?.sign || 'Unknown'}
                </p>
                <span className="text-[11px] font-mono text-[#575657]">
                  {moon ? `${moon.degree.toFixed(1)}°` : ''}
                  {moon?.lowConfidence ? ' (Boundary)' : ''}
                </span>
              </div>

              {/* Rising */}
              <div className="p-4 sm:p-5 bg-white border-r border-b border-[#D6D6D6] text-center space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#575657] block">
                  Physical Persona
                </span>
                <span className="text-xs font-mono text-[#575657] uppercase">↑ RISING / ASC</span>
                <p className="text-xl font-serif font-normal text-[#141414] tracking-wide">
                  {rising?.sign || (formData.birthTime ? 'Calculating...' : 'Requires Time')}
                </p>
                <span className="text-[11px] font-mono text-[#575657]">
                  {rising ? `${rising.degree.toFixed(1)}°` : 'Enter birth time'}
                </span>
              </div>
            </div>

            {/* Placements Table (Co-Star .core-signs-section style) */}
            <div className="p-6 bg-white border border-[#D6D6D6] space-y-4">
              <div className="flex items-center justify-between border-b border-[#D6D6D6] pb-3">
                <h2 className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#141414]">
                  Full Ephemeris Placements
                </h2>
                <span className="font-mono text-[10px] text-[#575657] uppercase">
                  10 Bodies + Lunar Nodes
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[#575657] text-[#575657] uppercase text-[10px]">
                      <th className="py-2">Planet</th>
                      <th className="py-2">Sign</th>
                      <th className="py-2 text-right">Degree</th>
                      <th className="py-2 text-right">House</th>
                      <th className="py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D6D6D6]">
                    {chart.planets.map((p) => (
                      <tr key={p.name} className="hover:bg-[#FBFBFB] transition-colors">
                        <td className="py-2.5 font-bold text-[#141414]">{p.name}</td>
                        <td className="py-2.5 text-[#141414] uppercase">{p.sign}</td>
                        <td className="py-2.5 text-right text-[#575657]">{p.degree.toFixed(1)}°</td>
                        <td className="py-2.5 text-right text-[#575657]">
                          {p.house ? `H${p.house}` : '—'}
                        </td>
                        <td className="py-2.5 text-right">
                          {p.isRetrograde ? (
                            <span className="text-[#141414] font-bold">Rx</span>
                          ) : (
                            <span className="text-[#575657]">Direct</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {rising && (
                      <tr className="bg-[#F4F4F2]">
                        <td className="py-2.5 font-bold text-[#141414]">Ascendant</td>
                        <td className="py-2.5 text-[#141414] uppercase">{rising.sign}</td>
                        <td className="py-2.5 text-right text-[#575657]">{rising.degree.toFixed(1)}°</td>
                        <td className="py-2.5 text-right text-[#575657]">H1</td>
                        <td className="py-2.5 text-right text-[#141414] font-semibold">Rising</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Personal Daily Protocol */}
            <div className="p-6 bg-white border border-[#D6D6D6] space-y-4">
              <div className="flex items-center justify-between border-b border-[#D6D6D6] pb-3">
                <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#141414] font-semibold">
                  ✦ Personal Daily Focus
                </span>
                <span className="font-mono text-[10px] text-[#575657] uppercase">Today</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 border border-[#575657]">
                <div className="p-4 bg-[rgba(144,202,243,0.18)] border-b sm:border-b-0 sm:border-r border-[#575657] space-y-1">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#141414] block">
                    DO (POWER TRANSIT)
                  </span>
                  <p className="text-xs text-[#141414] font-sans">
                    Channel your {sun?.sign} solar focus into finishing high-leverage deep work before midday.
                  </p>
                </div>

                <div className="p-4 bg-[rgba(243,144,144,0.18)] space-y-1">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#141414] block">
                    DON&apos;T (PRESSURE TRANSIT)
                  </span>
                  <p className="text-xs text-[#141414] font-sans">
                    Over-interpret ambiguous messages or react impulsively to boundary negotiations.
                  </p>
                </div>
              </div>
            </div>

            {/* Viral Synastry Funnel CTA Card */}
            <div className="p-6 sm:p-8 bg-white border border-[#141414] text-center space-y-4">
              <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#575657] font-bold">
                ✦ Two-Person Synastry
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-[#141414]">
                Cross Your Stars With Someone
              </h3>
              <p className="text-xs text-[#575657] max-w-md mx-auto leading-relaxed font-sans">
                A birth chart is only half the equation. Check your chemistry, communication, and conflict style with a crush, partner, or friend in seconds.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Link href={`/?personA=${encodeURIComponent(formData.name)}&birthDateA=${formData.birthDate}`}>
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="font-mono text-xs uppercase tracking-[0.08em] min-h-[48px]"
                  >
                    Check a Match Now →
                  </Button>
                </Link>

                <Link href="/invite">
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    className="font-mono text-xs uppercase tracking-[0.08em] min-h-[48px]"
                  >
                    Send Private 2-Way Link
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <EditorialFooter />
    </div>
  );
}
