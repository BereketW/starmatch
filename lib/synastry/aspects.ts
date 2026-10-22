import { NatalChart, SynastryAspect } from './types';
export type { SynastryAspect };
import { calculateAngularDistance } from '../astro/zodiac';

export type AspectType = 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';

export interface AspectDefinition {
  type: AspectType;
  nominalAngle: number;
  luminaryOrb: number;
  majorOrb: number;
}

export const ASPECT_DEFINITIONS: AspectDefinition[] = [
  { type: 'conjunction', nominalAngle: 0, luminaryOrb: 8.0, majorOrb: 6.0 },
  { type: 'opposition', nominalAngle: 180, luminaryOrb: 8.0, majorOrb: 6.0 },
  { type: 'trine', nominalAngle: 120, luminaryOrb: 7.0, majorOrb: 5.5 },
  { type: 'square', nominalAngle: 90, luminaryOrb: 7.0, majorOrb: 5.5 },
  { type: 'sextile', nominalAngle: 60, luminaryOrb: 5.0, majorOrb: 4.0 },
];

const LUMINARIES = new Set(['Sun', 'Moon']);

const BODY_IMPORTANCE: Record<string, number> = {
  Sun: 1.5,
  Moon: 1.5,
  Venus: 1.4,
  Mars: 1.3,
  Mercury: 1.2,
  Jupiter: 1.1,
  Saturn: 1.1,
  Ascendant: 1.1,
  Uranus: 0.9,
  Neptune: 0.9,
  Pluto: 0.9,
  NorthNode: 0.8,
  'North Node': 0.8,
  'South Node': 0.8,
};

const ASPECT_WEIGHT_MULTIPLIERS: Record<AspectType, number> = {
  conjunction: 1.2,
  opposition: 1.1,
  trine: 1.1,
  square: 1.1,
  sextile: 0.9,
};

export { calculateAngularDistance };

/**
 * Computes orb tightness weight:
 * W_orb = 1.0 - (|theta - theta_0| / maxOrb)^1.2 clamped to [0, 1]
 */
export function calculateOrbWeight(orbDeviation: number, maxOrb: number): number {
  if (orbDeviation > maxOrb) return 0;
  const ratio = Math.max(0, Math.min(1, orbDeviation / maxOrb));
  const rawWeight = 1.0 - Math.pow(ratio, 1.2);
  return Number(Math.max(0, Math.min(1, rawWeight)).toFixed(4));
}

/**
 * Generates concise interpretation description for an aspect pair.
 */
export function getAspectDescription(planetA: string, type: AspectType, planetB: string): string {
  const pair = [planetA, planetB].sort().join('-');

  if (pair === 'Mars-Venus') {
    if (type === 'conjunction') return 'Magnetic physical spark and instant sexual attraction.';
    if (type === 'trine') return 'Effortless romantic flow and mutual physical desire.';
    if (type === 'sextile') return 'Playful romantic banter and cooperative physical synergy.';
    if (type === 'square') return 'Volatile sexual friction; intense passion mixed with sudden defensiveness.';
    if (type === 'opposition') return 'Intense magnetic polarity; irresistible pull with periodic standoff.';
  }
  if (pair === 'Moon-Sun') {
    if (type === 'conjunction') return 'Profound emotional kinship; intuitive understanding of each other’s core.';
    if (type === 'trine') return 'Effortless harmony between conscious identity and instinctive emotional needs.';
    if (type === 'sextile') return 'Comfortable mutual validation and cooperative domestic ease.';
    if (type === 'square') return 'Friction between ego goals and emotional security needs.';
    if (type === 'opposition') return 'Classic magnetic balance; one leads through will, the other reflects through feeling.';
  }
  if (pair === 'Mercury-Mercury') {
    if (type === 'conjunction') return 'Identical intellectual wavelength; finishing each other’s sentences.';
    if (type === 'trine') return 'Effortless mental rhythm and seamless day-to-day conversation.';
    if (type === 'square') return 'Frequent mental misfires and talking past one another.';
    if (type === 'opposition') return 'Stimulating intellectual debate, but distinct thought architectures.';
  }

  const typeLabels: Record<AspectType, string> = {
    conjunction: 'intense fusion and shared focus',
    trine: 'natural harmonic flow and ease',
    sextile: 'cooperative opportunity and dialogue',
    square: 'tension, friction, and pressure for mutual growth',
    opposition: 'magnetic polarity and dynamic tension',
  };
  return `${planetA} ${type} ${planetB}: dynamic of ${typeLabels[type]}.`;
}

export interface MinimalPlanet {
  name: string;
  longitude: number;
}

export function getStrongestAspect(aspects: SynastryAspect[]): SynastryAspect {
  const defaultStrongest: SynastryAspect = {
    planetA: 'Sun',
    planetB: 'Sun',
    type: 'conjunction',
    angle: 0,
    orb: 0,
    weight: 0.5,
    description: 'Subtle planetary alignment without tight major aspects.',
  };

  if (aspects.length === 0) {
    return defaultStrongest;
  }

  const scoredAspects = aspects.map((asp) => {
    const impA = BODY_IMPORTANCE[asp.planetA] ?? 1.0;
    const impB = BODY_IMPORTANCE[asp.planetB] ?? 1.0;
    const aspMult = ASPECT_WEIGHT_MULTIPLIERS[asp.type] ?? 1.0;
    const priority = asp.weight * impA * impB * aspMult;
    return { aspect: asp, priority };
  });

  scoredAspects.sort((a, b) => b.priority - a.priority);
  return scoredAspects[0].aspect;
}

/**
 * Computes all pairwise synastry aspects between two charts or planet lists.
 */
export function computeAspects(
  planetsA: MinimalPlanet[],
  planetsB: MinimalPlanet[],
  orbConfig?: Record<string, number>
): { aspects: SynastryAspect[]; strongestAspect: SynastryAspect } {
  const aspects: SynastryAspect[] = [];

  for (const pA of planetsA) {
    for (const pB of planetsB) {
      const angle = calculateAngularDistance(pA.longitude, pB.longitude);
      const isLuminary = LUMINARIES.has(pA.name) || LUMINARIES.has(pB.name);

      for (const def of ASPECT_DEFINITIONS) {
        const customOrb = orbConfig?.[def.type];
        const maxOrb = customOrb ?? (isLuminary ? def.luminaryOrb : def.majorOrb);
        const orb = Math.abs(angle - def.nominalAngle);

        if (orb <= maxOrb) {
          const weight = calculateOrbWeight(orb, maxOrb);
          aspects.push({
            planetA: pA.name,
            planetB: pB.name,
            type: def.type,
            angle: Number(angle.toFixed(2)),
            orb: Number(orb.toFixed(2)),
            weight,
            description: getAspectDescription(pA.name, def.type, pB.name),
          });
        }
      }
    }
  }

  const strongestAspect = getStrongestAspect(aspects);
  return { aspects, strongestAspect };
}

/**
 * Convenience function taking NatalChart objects directly.
 */
export function findSynastryAspects(
  chartA: NatalChart,
  chartB: NatalChart,
  orbConfig?: Record<string, number>
): SynastryAspect[] {
  const planetsA = [...chartA.planets];
  if (chartA.ascendant && !chartA.lowConfidence) {
    planetsA.push(chartA.ascendant);
  }

  const planetsB = [...chartB.planets];
  if (chartB.ascendant && !chartB.lowConfidence) {
    planetsB.push(chartB.ascendant);
  }

  const { aspects } = computeAspects(planetsA, planetsB, orbConfig);
  return aspects;
}
