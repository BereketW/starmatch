import { NatalChart, NatalPlanet } from './types';
import { calculateNatalPlanets } from './ephemeris';

export type AspectType = 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';

export interface TransitAspect {
  transitPlanet: string;
  targetPerson: 'personA' | 'personB';
  targetPlanet: string;
  aspectType: AspectType;
  angle: number;
  orb: number;
  nature: 'harmonious' | 'frictional' | 'neutral';
  significance: number;
}

const ASPECT_ANGLES: Record<AspectType, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

const TRANSIT_ORB_LIMITS: Record<string, number> = {
  Sun: 4.0,
  Moon: 3.5,
  Mercury: 3.5,
  Venus: 3.5,
  Mars: 3.2,
  Jupiter: 3.0,
  Saturn: 2.8,
  Uranus: 2.5,
  Neptune: 2.5,
  Pluto: 2.5,
};

const PLANET_WEIGHTS: Record<string, number> = {
  Sun: 1.0,
  Moon: 1.0,
  Venus: 1.0,
  Mars: 0.9,
  Mercury: 0.85,
  Jupiter: 0.8,
  Saturn: 0.85,
  Uranus: 0.6,
  Neptune: 0.6,
  Pluto: 0.7,
  Ascendant: 0.85,
};

function normalizeAngle(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, 360 - diff);
}

function determineAspectNature(
  aspectType: AspectType,
  transitPlanet: string,
  targetPlanet: string
): 'harmonious' | 'frictional' | 'neutral' {
  if (aspectType === 'trine' || aspectType === 'sextile') return 'harmonious';
  if (aspectType === 'square' || aspectType === 'opposition') return 'frictional';
  
  // Conjunction handling:
  if (['Venus', 'Jupiter'].includes(transitPlanet) || ['Venus', 'Jupiter'].includes(targetPlanet)) {
    return 'harmonious';
  }
  if (['Saturn', 'Mars', 'Pluto', 'Uranus'].includes(transitPlanet)) {
    return 'frictional';
  }
  return 'neutral';
}

/**
 * Computes current transit positions for a given UTC date.
 * Normalizes time to 00:00:00Z for daily stability unless an ISO string with time is supplied.
 */
export function getTransitPlanets(targetDate?: Date | string): NatalPlanet[] {
  let dateObj: Date;
  if (!targetDate) {
    dateObj = new Date();
  } else if (typeof targetDate === 'string') {
    dateObj = new Date(targetDate);
  } else {
    dateObj = targetDate;
  }

  return calculateNatalPlanets(dateObj);
}

/**
 * Computes all transit aspects formed by the current sky against both natal charts.
 */
export function computePairTransits(
  chartA: NatalChart,
  chartB: NatalChart,
  options?: { targetDate?: Date | string; maxOrbMultiplier?: number }
): TransitAspect[] {
  const transitPlanets = getTransitPlanets(options?.targetDate);
  const orbMultiplier = options?.maxOrbMultiplier ?? 1.0;
  const results: TransitAspect[] = [];

  const evaluateTransits = (chart: NatalChart, personTag: 'personA' | 'personB') => {
    for (const tPlanet of transitPlanets) {
      const maxOrb = (TRANSIT_ORB_LIMITS[tPlanet.name] ?? 3.0) * orbMultiplier;

      // Check against natal planets
      const targets = [...chart.planets];
      if (chart.ascendant && !chart.lowConfidence) {
        targets.push(chart.ascendant);
      }

      for (const nPlanet of targets) {
        const angle = normalizeAngle(tPlanet.longitude, nPlanet.longitude);

        for (const [aspType, exactAngle] of Object.entries(ASPECT_ANGLES) as [AspectType, number][]) {
          const orb = Math.abs(angle - exactAngle);
          if (orb <= maxOrb) {
            const nature = determineAspectNature(aspType, tPlanet.name, nPlanet.name);
            const wT = PLANET_WEIGHTS[tPlanet.name] ?? 0.5;
            const wN = PLANET_WEIGHTS[nPlanet.name] ?? 0.5;
            const tightness = Math.max(0, 1.0 - Math.pow(orb / maxOrb, 1.2));
            const significance = Math.round(wT * wN * tightness * 100) / 100;

            results.push({
              transitPlanet: tPlanet.name,
              targetPerson: personTag,
              targetPlanet: nPlanet.name,
              aspectType: aspType,
              angle: Math.round(angle * 100) / 100,
              orb: Math.round(orb * 100) / 100,
              nature,
              significance,
            });
          }
        }
      }
    }
  };

  evaluateTransits(chartA, 'personA');
  evaluateTransits(chartB, 'personB');

  // Sort by significance descending
  return results.sort((a, b) => b.significance - a.significance);
}
