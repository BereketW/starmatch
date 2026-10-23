'use client';

import React, { useMemo, useState } from 'react';
import { POPULAR_CITIES, type CityLocation } from '@/lib/astro/cities';
import { computeNatalChart } from '@/lib/astro/ephemeris';

export interface PersonFormData {
  name: string;
  birthDate: string;
  birthTime: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

export interface PersonInputCardProps {
  label: string; // "Person A" | "Person B"
  defaultPlaceholderName: string; // "You" | "Them"
  data: PersonFormData;
  onChange: (data: PersonFormData) => void;
  error?: string;
}

const SIGN_GLYPHS: Record<string, string> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓',
};

const QUICK_CITY_PRESETS = ['New York', 'London', 'Los Angeles', 'Tokyo', 'Paris'];

export const PersonInputCard: React.FC<PersonInputCardProps> = ({
  label,
  defaultPlaceholderName,
  data,
  onChange,
  error,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [cityResults, setCityResults] = useState<CityLocation[]>([]);

  const handleFieldChange = (field: keyof PersonFormData, val: string | number | undefined) => {
    onChange({
      ...data,
      [field]: val,
    });
  };

  const handleCitySearch = (query: string) => {
    setCitySearch(query);
    handleFieldChange('city', query);
    if (!query.trim()) {
      setCityResults([]);
      return;
    }
    const q = query.toLowerCase();
    const matches = POPULAR_CITIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    ).slice(0, 5);
    setCityResults(matches);
  };

  const handleSelectCity = (c: CityLocation) => {
    onChange({
      ...data,
      city: `${c.name}, ${c.country}`,
      latitude: c.latitude,
      longitude: c.longitude,
    });
    setCitySearch(`${c.name}, ${c.country}`);
    setCityResults([]);
  };

  const hasTime = Boolean(data.birthTime && data.birthTime.trim());
  const hasCoords = typeof data.latitude === 'number' && typeof data.longitude === 'number';

  const liveChart = useMemo(() => {
    const rawDate = data.birthDate?.trim();
    if (!rawDate || !/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) return null;
    const [y, m, d] = rawDate.split('-').map(Number);
    if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
    const check = new Date(Date.UTC(y, m - 1, d));
    if (
      check.getUTCFullYear() !== y ||
      check.getUTCMonth() !== m - 1 ||
      check.getUTCDate() !== d
    ) {
      return null;
    }

    try {
      return computeNatalChart({
        name: data.name || defaultPlaceholderName,
        birthDate: rawDate,
        birthTime: hasTime ? data.birthTime.trim() : undefined,
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city || undefined,
      });
    } catch {
      return null;
    }
  }, [
    data.birthDate,
    data.birthTime,
    data.latitude,
    data.longitude,
    data.name,
    data.city,
    defaultPlaceholderName,
    hasTime,
  ]);

  const sun = liveChart?.planets.find((p) => p.name === 'Sun');
  const moon = liveChart?.planets.find((p) => p.name === 'Moon');
  const venus = liveChart?.planets.find((p) => p.name === 'Venus');
  const mars = liveChart?.planets.find((p) => p.name === 'Mars');
  const jupiter = liveChart?.planets.find((p) => p.name === 'Jupiter');
  const saturn = liveChart?.planets.find((p) => p.name === 'Saturn');
  const ascendant = liveChart?.ascendant;

  return (
    <div className="bg-white rounded-3xl border border-black/[0.07] text-[#0A0A0A] flex flex-col justify-between relative transition-all shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6 sm:p-7">
      <div className="space-y-5">
        {/* Clean Minimal Card Header */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-black/[0.06]">
          <div className="flex items-center gap-2">
            <span className="font-sans text-sm font-semibold text-[#0A0A0A]">
              {label}
            </span>
            <span className="font-serif italic text-sm text-[#71717a]">
              ({data.name.trim() || defaultPlaceholderName})
            </span>
          </div>

          {/* 3-Tier Confidence Pill */}
          {hasTime && hasCoords ? (
            <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 font-medium">
              ● TIER III · FULL HOUSE LOCK
            </span>
          ) : hasTime ? (
            <span className="font-mono text-[10px] uppercase tracking-wider text-sky-700 bg-sky-50 border border-sky-200 rounded-full px-2.5 py-0.5 font-medium">
              ◐ TIER II · TEMPORAL LOCK
            </span>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5 font-medium">
              ▲ TIER I · NOON EPHEMERIS
            </span>
          )}
        </div>

        {/* Name Input */}
        <div className="space-y-1.5">
          <label
            htmlFor={`${label}-name`}
            className="flex items-center justify-between text-xs font-medium text-[#52525b]"
          >
            <span>Name or Alias</span>
            <span className="text-[11px] text-[#71717a]">Optional</span>
          </label>
          <input
            id={`${label}-name`}
            type="text"
            value={data.name}
            maxLength={30}
            placeholder={defaultPlaceholderName}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className="w-full rounded-2xl bg-[#F8F8F7] border border-black/[0.07] px-4 py-3 text-sm text-[#0A0A0A] placeholder-[#71717a] focus:outline-none focus:bg-white focus:border-[#0A0A0A] transition-all font-sans"
          />
        </div>

        {/* Birth Date Input */}
        <div className="space-y-1.5">
          <label
            htmlFor={`${label}-date`}
            className="flex items-center justify-between text-xs font-medium text-[#0A0A0A]"
          >
            <span>Birth Date</span>
            <span className="font-mono text-[11px] text-[#71717a]">YYYY-MM-DD</span>
          </label>
          <input
            id={`${label}-date`}
            type="date"
            required
            min="1900-01-01"
            value={data.birthDate}
            onChange={(e) => handleFieldChange('birthDate', e.target.value)}
            className="w-full rounded-2xl bg-[#F8F8F7] border border-black/[0.07] px-4 py-3 text-sm text-[#0A0A0A] placeholder-[#71717a] focus:outline-none focus:bg-white focus:border-[#0A0A0A] transition-all font-mono"
          />
          {error && (
            <p className="text-xs text-red-600 font-mono mt-1 flex items-center gap-1.5">
              <span>[!]</span>
              <span>{error}</span>
            </p>
          )}
        </div>

        {/* Live Natal Ephemeris Readout */}
        {liveChart && sun && moon && venus && mars ? (
          <div className="rounded-2xl border border-black/[0.06] bg-[#FAFAFA] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Natal Ephemeris
              </span>
              <span className="font-mono text-[10px] text-[#71717a]">0.1° VSOP87</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl border border-black/[0.05] bg-white">
                <div className="text-[10px] text-[#71717a]">☉ Sun</div>
                <div className="text-[#0A0A0A] font-semibold mt-0.5 truncate">
                  {SIGN_GLYPHS[sun.sign]} {sun.sign} {sun.degree.toFixed(1)}°
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-black/[0.05] bg-white">
                <div className="text-[10px] text-[#71717a] flex items-center justify-between">
                  <span>☽ Moon</span>
                  {!hasTime && <span className="text-amber-700 text-[9px]">±6°</span>}
                </div>
                <div className="text-[#0A0A0A] font-semibold mt-0.5 truncate">
                  {SIGN_GLYPHS[moon.sign]} {moon.sign} {moon.degree.toFixed(1)}°
                </div>
              </div>

              <div className="p-2.5 rounded-xl border border-black/[0.05] bg-white col-span-2 sm:col-span-1">
                <div className="text-[10px] text-[#71717a]">Ascendant</div>
                {ascendant ? (
                  <div className="text-emerald-700 font-semibold mt-0.5 truncate">
                    {SIGN_GLYPHS[ascendant.sign]} {ascendant.sign} {ascendant.degree.toFixed(1)}°
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(true)}
                    className="text-[11px] text-[#71717a] hover:text-[#0A0A0A] mt-0.5 underline decoration-neutral-300 cursor-pointer"
                  >
                    + Add Time &amp; City
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-[#71717a] pt-2 border-t border-black/[0.05] gap-1.5">
              <span>
                ♀ Venus: <strong className="text-[#0A0A0A]">{SIGN_GLYPHS[venus.sign]} {venus.sign}</strong>
              </span>
              <span>•</span>
              <span>
                ♂ Mars: <strong className="text-[#0A0A0A]">{SIGN_GLYPHS[mars.sign]} {mars.sign}</strong>
              </span>
              {jupiter && saturn && (
                <>
                  <span>•</span>
                  <span className="hidden sm:inline">
                    ♃ {SIGN_GLYPHS[jupiter.sign]} {jupiter.sign.slice(0, 3)} / ♄ {SIGN_GLYPHS[saturn.sign]} {saturn.sign.slice(0, 3)}
                  </span>
                </>
              )}
            </div>
          </div>
        ) : null}

        {/* Accordion Toggle for Birth Time & City */}
        <div className="pt-1 border-t border-black/[0.06]">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            aria-expanded={showAdvanced}
            aria-controls={`${label}-advanced-fields`}
            className="w-full text-xs text-[#71717a] hover:text-[#0A0A0A] flex items-center justify-between transition-colors cursor-pointer select-none py-1.5 min-h-[40px]"
          >
            <span className="font-medium">
              {showAdvanced ? '− Hide' : '+ Add'} Birth Time &amp; City
            </span>
            <span className="text-[11px] text-[#71717a]">
              {showAdvanced ? 'Collapse' : 'Unlocks Ascendant & Houses'}
            </span>
          </button>

          {showAdvanced && (
            <div
              id={`${label}-advanced-fields`}
              className="mt-2 p-4 rounded-2xl bg-[#FAFAFA] border border-black/[0.06] space-y-4"
            >
              <div className="space-y-1.5">
                <label
                  htmlFor={`${label}-time`}
                  className="flex items-center justify-between text-xs text-[#52525b]"
                >
                  <span>Exact Birth Time</span>
                  <span className="font-mono text-[10px] text-[#71717a]">24-Hr</span>
                </label>
                <input
                  id={`${label}-time`}
                  type="time"
                  value={data.birthTime}
                  onChange={(e) => handleFieldChange('birthTime', e.target.value)}
                  className="w-full rounded-xl bg-white border border-black/[0.08] px-3.5 py-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] font-mono"
                />
              </div>

              <div className="space-y-1.5 relative">
                <label
                  htmlFor={`${label}-city`}
                  className="flex items-center justify-between text-xs text-[#52525b]"
                >
                  <span>Birth City</span>
                  {hasCoords && (
                    <span className="font-mono text-[10px] text-emerald-700">
                      {data.latitude?.toFixed(1)}°, {data.longitude?.toFixed(1)}°
                    </span>
                  )}
                </label>
                <input
                  id={`${label}-city`}
                  type="text"
                  placeholder="e.g. New York, London, Tokyo..."
                  value={citySearch || data.city}
                  onChange={(e) => handleCitySearch(e.target.value)}
                  className="w-full rounded-xl bg-white border border-black/[0.08] px-3.5 py-2.5 text-sm text-[#0A0A0A] placeholder-[#71717a] focus:outline-none focus:border-[#0A0A0A] font-sans"
                />

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {QUICK_CITY_PRESETS.map((cityName) => {
                    const found = POPULAR_CITIES.find((c) => c.name === cityName);
                    if (!found) return null;
                    return (
                      <button
                        key={cityName}
                        type="button"
                        onClick={() => handleSelectCity(found)}
                        className="rounded-full text-[11px] px-2.5 py-0.5 border border-black/[0.08] bg-white text-[#52525b] hover:text-[#0A0A0A] hover:border-[#0A0A0A] transition-colors cursor-pointer"
                      >
                        {cityName}
                      </button>
                    );
                  })}
                </div>

                {cityResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-2xl bg-white border border-black/[0.08] shadow-xl overflow-hidden">
                    {cityResults.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => handleSelectCity(c)}
                        className="w-full text-left px-3.5 py-2.5 text-xs text-[#0A0A0A] hover:bg-[#F5F5F5] flex items-center justify-between border-b border-black/[0.05] last:border-0 cursor-pointer"
                      >
                        <span>
                          {c.name}, {c.country}
                        </span>
                        <span className="font-mono text-[10px] text-[#71717a]">
                          {c.latitude.toFixed(1)}°, {c.longitude.toFixed(1)}°
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
