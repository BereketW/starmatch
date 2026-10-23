'use client';

import React, { useMemo, useState } from 'react';
import type { NatalPlanet, SynastryAspect } from '@/lib/astro/types';
import { longitudeToZodiac, zodiacToLongitude, type ZodiacSign } from '@/lib/astro/zodiac';
import { computeAspects } from '@/lib/synastry/aspects';

export interface LiveCelestialBiWheelProps {
  personAName?: string;
  personBName?: string;
  planetsA?: NatalPlanet[];
  planetsB?: NatalPlanet[];
  aspects?: SynastryAspect[];
  signA?: ZodiacSign | string | null;
  signB?: ZodiacSign | string | null;
  isQuickMode?: boolean;
  className?: string;
  size?: number;
}

export const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  'North Node': '☊',
  'South Node': '☋',
  NorthNode: '☊',
  Ascendant: 'ASC',
  Midheaven: 'MC',
  ASC: 'ASC',
  MC: 'MC',
};

export const ZODIAC_SECTORS: Array<{
  name: string;
  glyph: string;
  startDeg: number;
}> = [
  { name: 'Aries', glyph: '♈', startDeg: 0 },
  { name: 'Taurus', glyph: '♉', startDeg: 30 },
  { name: 'Gemini', glyph: '♊', startDeg: 60 },
  { name: 'Cancer', glyph: '♋', startDeg: 90 },
  { name: 'Leo', glyph: '♌', startDeg: 120 },
  { name: 'Virgo', glyph: '♍', startDeg: 150 },
  { name: 'Libra', glyph: '♎', startDeg: 180 },
  { name: 'Scorpio', glyph: '♏', startDeg: 210 },
  { name: 'Sagittarius', glyph: '♐', startDeg: 240 },
  { name: 'Capricorn', glyph: '♑', startDeg: 270 },
  { name: 'Aquarius', glyph: '♒', startDeg: 300 },
  { name: 'Pisces', glyph: '♓', startDeg: 330 },
];

export const ASPECT_HARMONIC_COLORS: Record<
  SynastryAspect['type'],
  {
    stroke: string;
    label: string;
    category: 'harmonious' | 'friction' | 'fusion';
    badgeClass: string;
  }
> = {
  trine: {
    stroke: '#10b981', // Emerald green
    label: 'TRINE (120°)',
    category: 'harmonious',
    badgeClass: 'text-emerald-700 border-emerald-300 bg-emerald-50',
  },
  sextile: {
    stroke: '#059669', // Mint / soft emerald
    label: 'SEXTILE (60°)',
    category: 'harmonious',
    badgeClass: 'text-emerald-700 border-emerald-300 bg-emerald-50',
  },
  square: {
    stroke: '#ef4444', // Crimson red
    label: 'SQUARE (90°)',
    category: 'friction',
    badgeClass: 'text-red-700 border-red-300 bg-red-50',
  },
  opposition: {
    stroke: '#f97316', // Amber / orange
    label: 'OPPOSITION (180°)',
    category: 'friction',
    badgeClass: 'text-orange-700 border-orange-300 bg-orange-50',
  },
  conjunction: {
    stroke: '#0284c7', // Cyan / sky
    label: 'CONJUNCTION (0°)',
    category: 'fusion',
    badgeClass: 'text-sky-700 border-sky-300 bg-sky-50',
  },
};

/**
 * Synthesizes planetary coordinates for Quick Mode based on zodiac sign midpoints:
 * (baseLongitude + index * 12) % 360
 * Ensures the bi-wheel always displays rich geometric aspect chords.
 */
export function synthesizeQuickPlanets(signInput: string): NatalPlanet[] {
  const norm = signInput.trim();
  const capSign = (norm.charAt(0).toUpperCase() + norm.slice(1).toLowerCase()) as ZodiacSign;
  let baseLon = 15;
  try {
    baseLon = zodiacToLongitude(capSign, 15);
  } catch {
    baseLon = 15;
  }

  const celestialBodies = [
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto',
    'Ascendant',
    'Midheaven',
  ];

  return celestialBodies.map((name, index) => {
    const longitude = (baseLon + index * 12) % 360;
    const { sign, degree } = longitudeToZodiac(longitude);
    return {
      name,
      sign,
      degree,
      longitude,
    };
  });
}

// Convert 0-360° longitude into radians for SVG circle.
// Longitude 0° (0° Aries) starts at 12 o'clock (-90° / -π/2) and moves clockwise.
function lonToRad(deg: number): number {
  return ((deg - 90) * Math.PI) / 180;
}

export function LiveCelestialBiWheel({
  personAName = 'You',
  personBName = 'Them',
  planetsA,
  planetsB,
  aspects,
  signA,
  signB,
  isQuickMode = false,
  className = '',
}: LiveCelestialBiWheelProps) {
  // Resolve effective planets for Person A & B
  const effectivePlanetsA = useMemo(() => {
    if (planetsA && planetsA.length > 0) return planetsA;
    if (signA) return synthesizeQuickPlanets(signA);
    // Deterministic calibration default: Scorpio archetypal cluster
    return synthesizeQuickPlanets('Scorpio');
  }, [planetsA, signA]);

  const effectivePlanetsB = useMemo(() => {
    if (planetsB && planetsB.length > 0) return planetsB;
    if (signB) return synthesizeQuickPlanets(signB);
    // Deterministic calibration default: Leo archetypal cluster
    return synthesizeQuickPlanets('Leo');
  }, [planetsB, signB]);

  // Resolve effective pairwise aspect chords
  const effectiveAspects = useMemo(() => {
    if (aspects && aspects.length > 0) return aspects;
    // Compute pairwise geometric synastry aspects
    const computed = computeAspects(effectivePlanetsA, effectivePlanetsB);
    return computed.aspects;
  }, [aspects, effectivePlanetsA, effectivePlanetsB]);

  // Interactive Hover / Inspection State
  const [hoveredAspect, setHoveredAspect] = useState<SynastryAspect | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{
    owner: 'A' | 'B';
    planet: NatalPlanet;
  } | null>(null);

  // Geometry Constants (viewBox 440 x 440, center 220, 220)
  const CX = 220;
  const CY = 220;
  const R_OUTER_RIM = 208;
  const R_ZODIAC_DIV = 182;
  const R_ZODIAC_GLYPH = 195;
  const R_ORBIT_A = 152; // Person A Outer Ring
  const R_ORBIT_SEP = 126; // Dashed intermediate divider
  const R_ORBIT_B = 100; // Person B Inner Ring
  const R_CORE = 24;

  const activeAspect = hoveredAspect;
  const activeNode = hoveredNode;

  return (
    <div
      role="region"
      aria-label="Celestial Synastry Bi-Wheel"
      className={`relative flex flex-col items-center bg-[var(--color-surface-card,#ffffff)] border border-[var(--color-border-card,#eaeaea)] text-[var(--color-text-base,#0a0a0a)] p-4 sm:p-6 transition-colors ${className}`}
    >
      {/* Top Telemetry Header Bar */}
      <div className="w-full flex items-center justify-between border-b border-[var(--color-border-card,#eaeaea)] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-semibold text-[var(--color-text-base,#0a0a0a)]">
            CELESTIAL BI-WHEEL // GEOMETRIC INTERFERENCE
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-[var(--color-text-muted,#71717a)]">
          <span className="px-1.5 py-0.5 border border-[var(--color-border-card,#eaeaea)] bg-[var(--color-bg-base,#ffffff)]">
            {isQuickMode ? 'QUICK MODE SYNTHESIS' : 'TRUE VSOP87 POSITIONS'}
          </span>
          <span className="text-emerald-600 font-semibold">
            {effectiveAspects.length} CHORDS
          </span>
        </div>
      </div>

      {/* SVG Dual-Ring Celestial Bi-Wheel */}
      <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center select-none">
        <svg
          viewBox="0 0 440 440"
          className="w-full h-full overflow-visible transform-gpu"
          aria-label="Dual-Ring Celestial Bi-Wheel SVG"
        >
          <defs>
            {/* Subtle glow filter for highlighted chords */}
            <filter id="chord-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Structural Circles */}
          {/* Outer Zodiac Rim */}
          <circle
            cx={CX}
            cy={CY}
            r={R_OUTER_RIM}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
          {/* Inner Zodiac Rim */}
          <circle
            cx={CX}
            cy={CY}
            r={R_ZODIAC_DIV}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.18"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          {/* Person A Orbit Track (Outer) */}
          <circle
            cx={CX}
            cy={CY}
            r={R_ORBIT_A}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.16"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          {/* Orbit Separator */}
          <circle
            cx={CX}
            cy={CY}
            r={R_ORBIT_SEP}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.14"
            strokeDasharray="2 3"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          {/* Person B Orbit Track (Inner) */}
          <circle
            cx={CX}
            cy={CY}
            r={R_ORBIT_B}
            fill="none"
            stroke="#10b981"
            strokeOpacity="0.18"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          {/* Central Core Circle */}
          <circle
            cx={CX}
            cy={CY}
            r={R_CORE}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          {/* Center Crosshairs */}
          <line
            x1={CX - 8}
            y1={CY}
            x2={CX + 8}
            y2={CY}
            stroke="currentColor"
            strokeOpacity="0.3"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1={CX}
            y1={CY - 8}
            x2={CX}
            y2={CY + 8}
            stroke="currentColor"
            strokeOpacity="0.3"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />

          {/* 2. 12 Zodiac Sign Degree Sectors & Ticks */}
          {ZODIAC_SECTORS.map((sector) => {
            const boundaryRad = lonToRad(sector.startDeg);
            const glyphRad = lonToRad(sector.startDeg + 15);

            const bx1 = CX + R_ZODIAC_DIV * Math.cos(boundaryRad);
            const by1 = CY + R_ZODIAC_DIV * Math.sin(boundaryRad);
            const bx2 = CX + R_OUTER_RIM * Math.cos(boundaryRad);
            const by2 = CY + R_OUTER_RIM * Math.sin(boundaryRad);

            const gx = CX + R_ZODIAC_GLYPH * Math.cos(glyphRad);
            const gy = CY + R_ZODIAC_GLYPH * Math.sin(glyphRad);

            // 10° Sub-ticks inside each 30° sector
            const ticks = [10, 20].map((degOffset) => {
              const tickRad = lonToRad(sector.startDeg + degOffset);
              const tx1 = CX + R_ZODIAC_DIV * Math.cos(tickRad);
              const ty1 = CY + R_ZODIAC_DIV * Math.sin(tickRad);
              const tx2 = CX + (R_ZODIAC_DIV + 6) * Math.cos(tickRad);
              const ty2 = CY + (R_ZODIAC_DIV + 6) * Math.sin(tickRad);
              return { key: degOffset, tx1, ty1, tx2, ty2 };
            });

            return (
              <g key={sector.name}>
                {/* 30° Sector Boundary Line */}
                <line
                  x1={bx1}
                  y1={by1}
                  x2={bx2}
                  y2={by2}
                  stroke="currentColor"
                  strokeOpacity="0.25"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
                {/* 10° Intermediate Sub-ticks */}
                {ticks.map((t) => (
                  <line
                    key={t.key}
                    x1={t.tx1}
                    y1={t.ty1}
                    x2={t.tx2}
                    y2={t.ty2}
                    stroke="currentColor"
                    strokeOpacity="0.18"
                    strokeWidth="0.75"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {/* Zodiac Sign Glyph */}
                <text
                  x={gx}
                  y={gy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="currentColor"
                  fillOpacity="0.75"
                  fontSize="12"
                  className="font-mono select-none"
                >
                  {sector.glyph}
                </text>
              </g>
            );
          })}

          {/* 3. Aspect Chord Lines (Outer Person A -> Inner Person B) */}
          {effectiveAspects.map((asp, idx) => {
            const pA = effectivePlanetsA.find((p) => p.name === asp.planetA);
            const pB = effectivePlanetsB.find((p) => p.name === asp.planetB);
            if (!pA || !pB) return null;

            const radA = lonToRad(pA.longitude);
            const radB = lonToRad(pB.longitude);

            const x1 = CX + R_ORBIT_A * Math.cos(radA);
            const y1 = CY + R_ORBIT_A * Math.sin(radA);
            const x2 = CX + R_ORBIT_B * Math.cos(radB);
            const y2 = CY + R_ORBIT_B * Math.sin(radB);

            const isHovered =
              hoveredAspect === asp ||
              (hoveredNode?.owner === 'A' && hoveredNode.planet.name === asp.planetA) ||
              (hoveredNode?.owner === 'B' && hoveredNode.planet.name === asp.planetB);

            const config = ASPECT_HARMONIC_COLORS[asp.type] ?? ASPECT_HARMONIC_COLORS.trine;
            const isFriction = asp.type === 'square' || asp.type === 'opposition';

            // Base opacity scaled by tightness of orb
            const orbTightness = Math.max(0.35, 1 - asp.orb / 8);
            const strokeOpacity = isHovered ? 1.0 : (hoveredAspect ? 0.12 : orbTightness * 0.55);
            const strokeWidth = isHovered ? 2.5 : 1.0;

            return (
              <g key={`aspect-${asp.planetA}-${asp.type}-${asp.planetB}-${idx}`}>
                {/* Visible Aspect Line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={config.stroke}
                  strokeOpacity={strokeOpacity}
                  strokeWidth={strokeWidth}
                  strokeDasharray={isFriction ? '3 3' : undefined}
                  vectorEffect="non-scaling-stroke"
                  filter={isHovered ? 'url(#chord-glow)' : undefined}
                  className="transition-all duration-150"
                />
                {/* Transparent Hit-Target Line for Easy Hovering / Tap */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="transparent"
                  strokeWidth="14"
                  className="cursor-pointer"
                  pointerEvents="stroke"
                  onMouseEnter={() => setHoveredAspect(asp)}
                  onMouseLeave={() => setHoveredAspect((prev) => (prev === asp ? null : prev))}
                  onClick={() => setHoveredAspect((prev) => (prev === asp ? null : asp))}
                />
              </g>
            );
          })}

          {/* 4. Person B Planetary Nodes (Inner Ring, R_ORBIT_B) */}
          {effectivePlanetsB.map((planet) => {
            const rad = lonToRad(planet.longitude);
            const px = CX + R_ORBIT_B * Math.cos(rad);
            const py = CY + R_ORBIT_B * Math.sin(rad);

            const isHighlighted =
              (hoveredNode?.owner === 'B' && hoveredNode.planet.name === planet.name) ||
              (hoveredAspect && hoveredAspect.planetB === planet.name);

            const glyph = PLANET_GLYPHS[planet.name] || '•';

            return (
              <g
                key={`planet-b-${planet.name}`}
                className="cursor-pointer transition-transform duration-150"
                onMouseEnter={() => setHoveredNode({ owner: 'B', planet })}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() =>
                  setHoveredNode((prev) =>
                    prev?.planet.name === planet.name && prev.owner === 'B' ? null : { owner: 'B', planet }
                  )
                }
              >
                {/* Halo when active */}
                {isHighlighted && (
                  <circle
                    cx={px}
                    cy={py}
                    r="12"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeOpacity="0.75"
                    className="animate-ping"
                  />
                )}
                {/* Node Base Circle */}
                <circle
                  cx={px}
                  cy={py}
                  r="7.5"
                  fill="#ffffff"
                  stroke="#0a0a0a"
                  strokeWidth={isHighlighted ? '2' : '1.2'}
                  vectorEffect="non-scaling-stroke"
                />
                {/* Glyph Icon */}
                <text
                  x={px}
                  y={py}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#0a0a0a"
                  fontSize="8.5"
                  fontWeight="bold"
                  className="font-mono select-none pointer-events-none"
                >
                  {glyph}
                </text>
              </g>
            );
          })}

          {/* 5. Person A Planetary Nodes (Outer Ring, R_ORBIT_A) */}
          {effectivePlanetsA.map((planet) => {
            const rad = lonToRad(planet.longitude);
            const px = CX + R_ORBIT_A * Math.cos(rad);
            const py = CY + R_ORBIT_A * Math.sin(rad);

            const isHighlighted =
              (hoveredNode?.owner === 'A' && hoveredNode.planet.name === planet.name) ||
              (hoveredAspect && hoveredAspect.planetA === planet.name);

            const glyph = PLANET_GLYPHS[planet.name] || '•';

            return (
              <g
                key={`planet-a-${planet.name}`}
                className="cursor-pointer transition-transform duration-150"
                onMouseEnter={() => setHoveredNode({ owner: 'A', planet })}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() =>
                  setHoveredNode((prev) =>
                    prev?.planet.name === planet.name && prev.owner === 'A' ? null : { owner: 'A', planet }
                  )
                }
              >
                {/* Halo when active */}
                {isHighlighted && (
                  <circle
                    cx={px}
                    cy={py}
                    r="13"
                    fill="none"
                    stroke="#0a0a0a"
                    strokeWidth="1.5"
                    strokeOpacity="0.75"
                    className="animate-ping"
                  />
                )}
                {/* Node Base Circle */}
                <circle
                  cx={px}
                  cy={py}
                  r="8.5"
                  fill="#ffffff"
                  stroke="#0a0a0a"
                  strokeWidth={isHighlighted ? '2.2' : '1.2'}
                  vectorEffect="non-scaling-stroke"
                />
                {/* Glyph Icon */}
                <text
                  x={px}
                  y={py}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#0a0a0a"
                  fontSize="9.5"
                  fontWeight="bold"
                  className="font-mono select-none pointer-events-none"
                >
                  {glyph}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Orbit Ring Labels */}
      <div className="w-full flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted,#71717a)] mt-3 pt-3 border-t border-[var(--color-border-card,#eaeaea)]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full border border-[#0a0a0a] bg-[#ffffff]" />
          <span>OUTER: {personAName.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full border border-emerald-600 bg-emerald-50" />
          <span>INNER: {personBName.toUpperCase()}</span>
        </div>
      </div>

      {/* Interactive Aspect / Node Telemetry Inspector */}
      <div className="w-full mt-3 p-3 bg-[var(--color-bg-base,#fafafa)] border border-[var(--color-border-card,#eaeaea)] min-h-[58px] flex items-center justify-between gap-3 text-xs font-mono">
        {activeAspect ? (
          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`px-1.5 py-0.5 text-[9px] border font-bold uppercase ${
                  ASPECT_HARMONIC_COLORS[activeAspect.type]?.badgeClass ?? ''
                }`}
              >
                {activeAspect.type.toUpperCase()}
              </span>
              <span className="font-semibold text-[var(--color-text-base,#0a0a0a)]">
                {PLANET_GLYPHS[activeAspect.planetA] || ''} {activeAspect.planetA}
                {' ⇋ '}
                {PLANET_GLYPHS[activeAspect.planetB] || ''} {activeAspect.planetB}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-muted,#71717a)]">
              <span>ORB: {activeAspect.orb.toFixed(1)}°</span>
              <span>ANGLE: {activeAspect.angle.toFixed(1)}°</span>
              <span className="text-emerald-600 font-semibold">WEIGHT: {(activeAspect.weight * 100).toFixed(0)}%</span>
            </div>
          </div>
        ) : activeNode ? (
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 text-[9px] border border-[#eaeaea] bg-[#ffffff] text-[var(--color-text-base,#0a0a0a)]">
                {activeNode.owner === 'A' ? personAName : personBName}
              </span>
              <span className="text-[var(--color-text-base,#0a0a0a)] font-semibold">
                {PLANET_GLYPHS[activeNode.planet.name] || '•'} {activeNode.planet.name}
              </span>
              <span className="text-[#71717a]">
                in {activeNode.planet.sign} {activeNode.planet.degree.toFixed(1)}°
              </span>
            </div>
            <div className="font-mono text-[10px] text-[var(--color-text-muted,#71717a)]">
              LONGITUDE: {activeNode.planet.longitude.toFixed(1)}°
            </div>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between text-[11px] text-[var(--color-text-muted,#71717a)]">
            <span>Hover or tap chords or glyphs to inspect geometrical aspect harmonics</span>
            <span className="text-[9px] uppercase tracking-widest text-zinc-500">[INTERACTIVE 60FPS]</span>
          </div>
        )}
      </div>

      {/* Harmonic Aspect Legend */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-[var(--color-border-card,#eaeaea)] text-[9px] font-mono text-[var(--color-text-muted,#71717a)]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-0.5 bg-emerald-500" />
          <span>TRINE / SEXTILE (HARMONIOUS)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-0.5 bg-red-500 border-dashed" />
          <span>SQUARE / OPPOSITION (FRICTION)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-0.5 bg-sky-400" />
          <span>CONJUNCTION (FUSION)</span>
        </div>
      </div>
    </div>
  );
}
