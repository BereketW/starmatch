'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';

export interface ScoreGaugeProps {
  score: number; // 0-100
  lowConfidence?: boolean;
  relationshipType?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

export interface TierInfo {
  status: string;
  tier: string;
  subhead: string;
}

export function getTierInfo(score: number): TierInfo {
  if (score >= 85) {
    return {
      status: 'COSMIC CATALYST',
      tier: 'COSMIC CATALYST',
      subhead: 'Unusually high gravitational alignment across core luminaries.',
    };
  }
  if (score >= 70) {
    return {
      status: 'MAGNETIC DYNAMIC',
      tier: 'MAGNETIC DYNAMIC',
      subhead: 'Compelling mutual attraction with self-sustaining momentum.',
    };
  }
  if (score >= 50) {
    return {
      status: 'VOLATILE FASCINATION',
      tier: 'VOLATILE FASCINATION',
      subhead: 'High friction generating intense attraction and sharp growth edges.',
    };
  }
  return {
    status: 'FRICTIONAL FORGE',
    tier: 'FRICTIONAL FORGE',
    subhead: 'Demands deliberate conscious communication to bridge polarity.',
  };
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  lowConfidence = false,
  className = '',
  animated = true,
}) => {
  const boundedScore = Math.min(100, Math.max(0, Math.round(score)));
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!animated) {
      return;
    }

    // Ticker bounded to <= 1200ms per B12-4
    const duration = 1100;
    const startTime = performance.now();

    let animationFrameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * boundedScore));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [boundedScore, animated]);

  const displayScore = animated ? animatedScore : boundedScore;

  const tier = getTierInfo(boundedScore);

  // SVG Gauge calculations
  // Arc angle from -120 deg to +120 deg (total 240 deg)
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * displayScore) / 100;

  return (
    <div
      className={`flex flex-col items-center text-center p-6 sm:p-8 bg-white border border-[#D6D6D6] rounded-none relative overflow-hidden ${className}`.trim()}
    >
      {/* Confidence Badge */}
      <div className="mb-6 z-10">
        {lowConfidence ? (
          <Badge variant="warning" size="sm">
            ▲ DEGRADED CONFIDENCE // ESTIMATED HOUSES
          </Badge>
        ) : (
          <Badge variant="power" size="sm">
            ● EXACT CHART // 0.1° EPHEMERIS
          </Badge>
        )}
      </div>

      {/* Radial Meter */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center my-2 z-10">
        <svg
          className="w-full h-full -rotate-90 transform"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          {/* Background Track Arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#E8E8E8"
            strokeWidth="5"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="butt"
            transform="rotate(-30 100 100)"
          />
          {/* Active Progress Arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#141414"
            strokeWidth="5"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="butt"
            transform="rotate(-30 100 100)"
            className="transition-all duration-75 ease-out"
          />
        </svg>

        {/* Center Numerical Score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-serif text-5xl sm:text-6xl font-normal tracking-tight text-[#141414] tabular-nums"
            aria-label={`Overall compatibility score: ${boundedScore} out of 100`}
          >
            {displayScore}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#575657] mt-1">
            / 100 INDEX
          </span>
        </div>
      </div>

      {/* Status Tier Headline & Subhead */}
      <div className="mt-4 max-w-sm z-10 space-y-2 border-t border-[#D6D6D6] pt-4 w-full">
        <h2 className="text-xl sm:text-2xl font-serif font-normal tracking-tight text-[#141414]">
          {tier.status}
        </h2>
        <p className="text-xs sm:text-sm text-[#575657] leading-relaxed font-sans">
          {tier.subhead}
        </p>
      </div>

      {/* Degradation Explanatory Microcopy if applicable */}
      {lowConfidence && (
        <p className="mt-4 text-[11px] text-[#575657] font-mono leading-tight max-w-xs z-10 border-t border-dashed border-[#D6D6D6] pt-3">
          Birth time was omitted for one or both charts. Core planetary longitudes
          are exact, while rising sign and house cusps are estimated.
        </p>
      )}
    </div>
  );
};
