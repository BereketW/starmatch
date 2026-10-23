'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeroHeader, type InputMode } from './HeroHeader';
import { PersonInputCard, type PersonFormData } from './PersonInputCard';
import { QuickSignSelector } from './QuickSignSelector';
import { RelationshipTypeSelector } from './RelationshipTypeSelector';
import { LiveCelestialBiWheel, synthesizeQuickPlanets } from './LiveCelestialBiWheel';
import { encodeMatchId, saveRecentPair } from '@/lib/synastry/match-id';
import { computeSynastry } from '@/lib/synastry/engine';
import { computeNatalChart } from '@/lib/astro/ephemeris';
import { getOneSharpTruth } from '@/lib/report/composer';
import type { NatalPlanet, RelationshipType, ZodiacSign } from '@/lib/astro/types';

function buildQuickSyntheticPlanets(sign: ZodiacSign): NatalPlanet[] {
  return synthesizeQuickPlanets(sign);
}

interface ArchetypePreset {
  id: string;
  label: string;
  tag: string;
  relationshipType: RelationshipType;
  personA: PersonFormData;
  personB: PersonFormData;
  signA: ZodiacSign;
  signB: ZodiacSign;
}

const ARCHETYPE_PRESETS: ArchetypePreset[] = [
  {
    id: 'scorpio-leo',
    label: 'Scorpio × Leo',
    tag: 'MAGNETIC FRICTION',
    relationshipType: 'romantic',
    signA: 'Scorpio',
    signB: 'Leo',
    personA: {
      name: 'Elena',
      birthDate: '1994-11-08',
      birthTime: '21:15',
      city: 'New York, United States',
      latitude: 40.7128,
      longitude: -74.006,
    },
    personB: {
      name: 'Julian',
      birthDate: '1992-08-14',
      birthTime: '14:30',
      city: 'London, United Kingdom',
      latitude: 51.5074,
      longitude: -0.1278,
    },
  },
  {
    id: 'aries-libra',
    label: 'Aries × Libra',
    tag: 'OPPOSITION AXIS',
    relationshipType: 'crush',
    signA: 'Aries',
    signB: 'Libra',
    personA: {
      name: 'Sora',
      birthDate: '1996-04-04',
      birthTime: '08:45',
      city: 'Tokyo, Japan',
      latitude: 35.6762,
      longitude: 139.6503,
    },
    personB: {
      name: 'Claire',
      birthDate: '1995-10-12',
      birthTime: '19:20',
      city: 'Paris, France',
      latitude: 48.8566,
      longitude: 2.3522,
    },
  },
  {
    id: 'pisces-capricorn',
    label: 'Pisces × Capricorn',
    tag: 'ARCHITECT & MYSTIC',
    relationshipType: 'romantic',
    signA: 'Pisces',
    signB: 'Capricorn',
    personA: {
      name: 'Maya',
      birthDate: '1993-03-09',
      birthTime: '04:10',
      city: 'Los Angeles, United States',
      latitude: 34.0522,
      longitude: -118.2437,
    },
    personB: {
      name: 'Marcus',
      birthDate: '1991-01-06',
      birthTime: '11:00',
      city: 'Berlin, Germany',
      latitude: 52.52,
      longitude: 13.405,
    },
  },
  {
    id: 'gemini-aquarius',
    label: 'Gemini × Aquarius',
    tag: 'CEREBRAL TRINE',
    relationshipType: 'coworker',
    signA: 'Gemini',
    signB: 'Aquarius',
    personA: {
      name: 'Devon',
      birthDate: '1990-06-02',
      birthTime: '16:05',
      city: 'New York, United States',
      latitude: 40.7128,
      longitude: -74.006,
    },
    personB: {
      name: 'Noa',
      birthDate: '1994-02-08',
      birthTime: '10:30',
      city: 'Sydney, Australia',
      latitude: -33.8688,
      longitude: 151.2093,
    },
  },
];

function isValidCalendarDateString(dateStr: string): boolean {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) return false;
  const [y, m, d] = dateStr.trim().split('-').map(Number);
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return false;
  const parsed = new Date(Date.UTC(y, m - 1, d));
  return (
    parsed.getUTCFullYear() === y &&
    parsed.getUTCMonth() === m - 1 &&
    parsed.getUTCDate() === d
  );
}

export function CompatibilityForm() {
  const router = useRouter();
  const [mode, setMode] = useState<InputMode>('full');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('romantic');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [personA, setPersonA] = useState<PersonFormData>({
    name: '',
    birthDate: '',
    birthTime: '',
    city: '',
  });

  const [personB, setPersonB] = useState<PersonFormData>({
    name: '',
    birthDate: '',
    birthTime: '',
    city: '',
  });

  const [signA, setSignA] = useState<ZodiacSign | null>(null);
  const [signB, setSignB] = useState<ZodiacSign | null>(null);

  const [errors, setErrors] = useState<{
    personA?: string;
    personB?: string;
  }>({});

  const applyPreset = (preset: ArchetypePreset) => {
    setFormError(null);
    setErrors({});
    setRelationshipType(preset.relationshipType);
    if (mode === 'quick') {
      setSignA(preset.signA);
      setSignB(preset.signB);
    } else {
      setPersonA(preset.personA);
      setPersonB(preset.personB);
      setSignA(preset.signA);
      setSignB(preset.signB);
    }
  };

  const livePreview = useMemo(() => {
    try {
      if (mode === 'quick') {
        if (!signA || !signB) return null;
        const synastry = computeSynastry(
          { name: personA.name.trim() || 'You', zodiacSign: signA },
          { name: personB.name.trim() || 'Them', zodiacSign: signB },
          { relationshipType }
        );
        const sharpTruth = getOneSharpTruth(synastry);
        const planetsA = buildQuickSyntheticPlanets(signA);
        const planetsB = buildQuickSyntheticPlanets(signB);
        return { synastry, sharpTruth, planetsA, planetsB };
      }

      if (
        !isValidCalendarDateString(personA.birthDate) ||
        !isValidCalendarDateString(personB.birthDate)
      ) {
        return null;
      }

      const birthA = {
        name: personA.name.trim() || 'You',
        birthDate: personA.birthDate.trim(),
        birthTime: personA.birthTime.trim() || undefined,
        city: personA.city.trim() || undefined,
        latitude: personA.latitude,
        longitude: personA.longitude,
      };
      const birthB = {
        name: personB.name.trim() || 'Them',
        birthDate: personB.birthDate.trim(),
        birthTime: personB.birthTime.trim() || undefined,
        city: personB.city.trim() || undefined,
        latitude: personB.latitude,
        longitude: personB.longitude,
      };

      const synastry = computeSynastry(birthA, birthB, { relationshipType });
      const chartA = computeNatalChart(birthA);
      const chartB = computeNatalChart(birthB);
      const sharpTruth = getOneSharpTruth(synastry);
      return {
        synastry,
        sharpTruth,
        planetsA: chartA.planets,
        planetsB: chartB.planets,
      };
    } catch {
      return null;
    }
  }, [mode, signA, signB, personA, personB, relationshipType]);

  const validateDate = (dateStr: string): string | null => {
    if (!dateStr || !dateStr.trim()) {
      return 'Birth date is required';
    }
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) {
      return 'Date must be formatted as YYYY-MM-DD';
    }

    const parts = dateStr.split('-').map(Number);
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    if (year < 1900) {
      return 'Birth year must be 1900 or later';
    }

    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (
      parsed.getUTCFullYear() !== year ||
      parsed.getUTCMonth() !== month - 1 ||
      parsed.getUTCDate() !== day
    ) {
      return 'Invalid calendar date';
    }

    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    if (parsed > todayUTC) {
      return 'Birth date cannot be in the future';
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const effectiveNameA = personA.name.trim() || 'You';
    const effectiveNameB = personB.name.trim() || 'Them';

    const birthDateA = personA.birthDate;
    const birthDateB = personB.birthDate;

    if (mode === 'quick') {
      if (!signA || !signB) {
        setFormError('Please select zodiac signs for both people');
        return;
      }

      setErrors({});
      setLoading(true);

      try {
        const matchId = encodeMatchId({
          personA: { name: effectiveNameA, zodiacSign: signA },
          personB: { name: effectiveNameB, zodiacSign: signB },
          relationshipType,
          isQuickMode: true,
        });

        saveRecentPair({
          matchId,
          nameA: effectiveNameA,
          nameB: effectiveNameB,
          signA,
          signB,
          personA: { name: effectiveNameA },
          personB: { name: effectiveNameB },
          relationshipType,
          overallScore: livePreview?.synastry.overallScore,
          savedAt: new Date().toISOString(),
        });

        router.push(`/match/${matchId}`);
      } catch (err: unknown) {
        setLoading(false);
        const msg = err instanceof Error ? err.message : 'Failed to generate match profile';
        setFormError(msg);
      }
      return;
    }

    const errorA = validateDate(birthDateA);
    const errorB = validateDate(birthDateB);

    if (errorA || errorB) {
      setErrors({
        personA: errorA || undefined,
        personB: errorB || undefined,
      });
      setFormError('Please resolve date errors before calculating.');
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const matchId = encodeMatchId({
        personA: {
          name: effectiveNameA,
          birthDate: birthDateA,
          birthTime: personA.birthTime.trim() || undefined,
          city: personA.city.trim() || undefined,
          latitude: personA.latitude,
          longitude: personA.longitude,
        },
        personB: {
          name: effectiveNameB,
          birthDate: birthDateB,
          birthTime: personB.birthTime.trim() || undefined,
          city: personB.city.trim() || undefined,
          latitude: personB.latitude,
          longitude: personB.longitude,
        },
        relationshipType,
      });

      saveRecentPair({
        matchId,
        personA: {
          name: effectiveNameA,
          birthDate: birthDateA,
        },
        personB: {
          name: effectiveNameB,
          birthDate: birthDateB,
        },
        relationshipType,
        overallScore: livePreview?.synastry.overallScore,
        savedAt: new Date().toISOString(),
      });

      router.push(`/match/${matchId}`);
    } catch (err: unknown) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : 'Failed to generate match profile';
      setFormError(msg);
    }
  };

  return (
    <div id="synastry-studio" className="space-y-8 scroll-mt-16 bg-white">
      <HeroHeader
        mode={mode}
        onModeChange={(newMode) => {
          setMode(newMode);
          setFormError(null);
          setErrors({});
        }}
      />

      {/* Minimalist Pill Presets Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <span className="sr-only">INSTANT CALIBRATION PRESETS:</span>
        {ARCHETYPE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyPreset(preset)}
            className="px-4 py-2 rounded-full border border-black/[0.08] bg-white hover:border-[#0A0A0A] hover:bg-[#F8F8F7] text-left transition-all cursor-pointer flex items-center gap-2 group shadow-2xs"
          >
            <span className="font-serif italic text-sm text-[#0A0A0A]">
              {preset.label}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#71717a] group-hover:text-[#0A0A0A]">
              [{preset.tag}]
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        {/* Relationship Context Selector */}
        <RelationshipTypeSelector
          value={relationshipType}
          onChange={setRelationshipType}
        />

        {mode === 'quick' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickSignSelector
              label="Person A (You)"
              selectedSign={signA}
              onSelect={(sign) => setSignA(sign)}
            />
            <QuickSignSelector
              label="Person B (Them)"
              selectedSign={signB}
              onSelect={(sign) => setSignB(sign)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PersonInputCard
              label="Person A"
              defaultPlaceholderName="You"
              data={personA}
              onChange={setPersonA}
              error={errors.personA}
            />
            <PersonInputCard
              label="Person B"
              defaultPlaceholderName="Them"
              data={personB}
              onChange={setPersonB}
              error={errors.personB}
            />
          </div>
        )}

        {/* Real-Time Synastry Preview */}
        {livePreview && (
          <div
            aria-label="Live Synastry Telemetry Preview"
            className="rounded-3xl border border-black/[0.07] bg-white overflow-hidden shadow-[0_2px_24px_rgba(0,0,0,0.03)]"
          >
            <div className="flex flex-wrap items-center justify-between border-b border-black/[0.06] px-6 py-4 bg-[#FAFAFA] gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-[#0A0A0A]">
                  Live Synastry Resonance
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#71717a]">
                {livePreview.synastry.aspects.length} Cross-Chart Aspects
              </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 divide-y xl:divide-y-0 xl:divide-x divide-black/[0.06]">
              <div className="xl:col-span-6 p-6 flex flex-col items-center justify-center bg-white">
                <LiveCelestialBiWheel
                  personAName={personA.name.trim() || (mode === 'quick' ? signA ?? 'You' : 'You')}
                  personBName={personB.name.trim() || (mode === 'quick' ? signB ?? 'Them' : 'Them')}
                  planetsA={livePreview.planetsA}
                  planetsB={livePreview.planetsB}
                  aspects={livePreview.synastry.aspects}
                  signA={signA}
                  signB={signB}
                  isQuickMode={mode === 'quick'}
                  className="w-full border-0 bg-transparent p-0"
                />
              </div>

              <div className="xl:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-[#FAFAFA]">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-black/[0.06] pb-5">
                  <div className="space-y-1.5">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-[#71717a]">
                      {livePreview.sharpTruth.aspectName}
                    </div>
                    <h3 className="font-serif text-2xl sm:text-3xl text-[#0A0A0A] leading-tight">
                      {livePreview.sharpTruth.headline}
                    </h3>
                    <p className="font-serif italic text-base text-[#52525b] leading-relaxed pt-1">
                      &ldquo;{livePreview.sharpTruth.quote}&rdquo;
                    </p>
                  </div>

                  <div className="shrink-0 rounded-2xl border border-black/[0.06] bg-white px-5 py-3.5 text-right shadow-2xs">
                    <div className="text-[10px] font-medium text-[#71717a]">
                      Score
                    </div>
                    <div className="font-serif text-4xl text-[#0A0A0A] leading-none mt-1">
                      {Math.round(livePreview.synastry.overallScore)}
                      <span className="font-mono text-xs text-[#71717a]">/100</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-[11px]">
                  {[
                    { label: 'Chemistry', val: livePreview.synastry.categories.chemistry },
                    { label: 'Dialogue', val: livePreview.synastry.categories.communication },
                    { label: 'Emotional', val: livePreview.synastry.categories.emotionalBond },
                    { label: 'Friction', val: livePreview.synastry.categories.conflictStyle },
                    { label: 'Longevity', val: livePreview.synastry.categories.longTermPotential },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-black/[0.06] bg-white p-3">
                      <div className="flex items-center justify-between text-[#71717a]">
                        <span>{item.label}</span>
                        <span className="text-[#0A0A0A] font-semibold">{Math.round(item.val)}</span>
                      </div>
                      <div className="w-full h-1 bg-[#EAEAEA] mt-2 overflow-hidden rounded-full">
                        <div
                          className="h-full bg-[#0A0A0A]"
                          style={{ width: `${Math.min(100, Math.max(5, item.val))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {formError && (
          <div
            role="alert"
            className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-xs font-medium flex items-center gap-3"
          >
            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px]">!</span>
            <span>{formError}</span>
          </div>
        )}

        {/* Centered Reboot-Style Pill Submit CTA */}
        <div className="pt-2 flex flex-col items-center justify-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto min-w-[280px] min-h-[54px] px-9 py-4 rounded-full bg-[#0A0A0A] text-white hover:scale-[1.01] active:scale-[0.99] font-sans text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-3 disabled:opacity-50 shadow-sm iridescent-pill-glow"
          >
            <span>
              {loading ? 'Calculating Synastry...' : 'Calculate Synastry →'}
            </span>
          </button>
          <p className="text-xs text-[#71717a]">
            Instant calculation · No account required
          </p>
        </div>
      </form>
    </div>
  );
}
