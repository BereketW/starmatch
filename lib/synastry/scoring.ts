import { SynastryAspect } from './aspects';
import { CategoryScores, NatalChart, RelationshipType } from './types';

export { type CategoryScores, type RelationshipType };

export interface AspectImpactRule {
  planet1: string;
  planet2: string;
  aspectType: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  impact: number;
}

export const CHEMISTRY_RULES: AspectImpactRule[] = [
  { planet1: 'Venus', planet2: 'Mars', aspectType: 'conjunction', impact: 18 },
  { planet1: 'Venus', planet2: 'Mars', aspectType: 'trine', impact: 14 },
  { planet1: 'Venus', planet2: 'Mars', aspectType: 'sextile', impact: 10 },
  { planet1: 'Venus', planet2: 'Mars', aspectType: 'square', impact: 8 },
  { planet1: 'Venus', planet2: 'Mars', aspectType: 'opposition', impact: 9 },
  { planet1: 'Sun', planet2: 'Venus', aspectType: 'conjunction', impact: 12 },
  { planet1: 'Sun', planet2: 'Venus', aspectType: 'trine', impact: 10 },
  { planet1: 'Sun', planet2: 'Venus', aspectType: 'sextile', impact: 7 },
  { planet1: 'Sun', planet2: 'Venus', aspectType: 'square', impact: -4 },
  { planet1: 'Mars', planet2: 'Pluto', aspectType: 'conjunction', impact: 10 },
  { planet1: 'Mars', planet2: 'Pluto', aspectType: 'trine', impact: 8 },
  { planet1: 'Mars', planet2: 'Pluto', aspectType: 'square', impact: 5 },
  { planet1: 'Venus', planet2: 'Uranus', aspectType: 'conjunction', impact: 8 },
  { planet1: 'Venus', planet2: 'Uranus', aspectType: 'trine', impact: 7 },
  { planet1: 'Venus', planet2: 'Pluto', aspectType: 'conjunction', impact: 11 },
  { planet1: 'Venus', planet2: 'Pluto', aspectType: 'trine', impact: 8 },
  { planet1: 'Saturn', planet2: 'Venus', aspectType: 'square', impact: -12 },
  { planet1: 'Saturn', planet2: 'Venus', aspectType: 'opposition', impact: -10 },
  { planet1: 'Saturn', planet2: 'Mars', aspectType: 'opposition', impact: -10 },
  { planet1: 'Saturn', planet2: 'Mars', aspectType: 'square', impact: -10 },
];

export const COMMUNICATION_RULES: AspectImpactRule[] = [
  { planet1: 'Mercury', planet2: 'Mercury', aspectType: 'conjunction', impact: 15 },
  { planet1: 'Mercury', planet2: 'Mercury', aspectType: 'trine', impact: 14 },
  { planet1: 'Mercury', planet2: 'Mercury', aspectType: 'sextile', impact: 10 },
  { planet1: 'Mercury', planet2: 'Mercury', aspectType: 'square', impact: -12 },
  { planet1: 'Mercury', planet2: 'Mercury', aspectType: 'opposition', impact: -8 },
  { planet1: 'Mercury', planet2: 'Sun', aspectType: 'trine', impact: 12 },
  { planet1: 'Mercury', planet2: 'Sun', aspectType: 'conjunction', impact: 12 },
  { planet1: 'Mercury', planet2: 'Sun', aspectType: 'sextile', impact: 9 },
  { planet1: 'Mercury', planet2: 'Jupiter', aspectType: 'trine', impact: 10 },
  { planet1: 'Mercury', planet2: 'Jupiter', aspectType: 'conjunction', impact: 10 },
  { planet1: 'Mercury', planet2: 'Jupiter', aspectType: 'sextile', impact: 8 },
  { planet1: 'Mercury', planet2: 'Saturn', aspectType: 'square', impact: -14 },
  { planet1: 'Mercury', planet2: 'Saturn', aspectType: 'opposition', impact: -12 },
  { planet1: 'Mercury', planet2: 'Saturn', aspectType: 'trine', impact: 8 },
  { planet1: 'Mercury', planet2: 'Mars', aspectType: 'square', impact: -12 },
  { planet1: 'Mercury', planet2: 'Mars', aspectType: 'opposition', impact: -10 },
  { planet1: 'Mercury', planet2: 'Uranus', aspectType: 'square', impact: -10 },
  { planet1: 'Mercury', planet2: 'Uranus', aspectType: 'trine', impact: 8 },
];

export const EMOTIONAL_BOND_RULES: AspectImpactRule[] = [
  { planet1: 'Moon', planet2: 'Moon', aspectType: 'conjunction', impact: 18 },
  { planet1: 'Moon', planet2: 'Moon', aspectType: 'trine', impact: 16 },
  { planet1: 'Moon', planet2: 'Moon', aspectType: 'sextile', impact: 11 },
  { planet1: 'Moon', planet2: 'Moon', aspectType: 'square', impact: -14 },
  { planet1: 'Moon', planet2: 'Moon', aspectType: 'opposition', impact: -10 },
  { planet1: 'Sun', planet2: 'Moon', aspectType: 'conjunction', impact: 18 },
  { planet1: 'Sun', planet2: 'Moon', aspectType: 'trine', impact: 15 },
  { planet1: 'Sun', planet2: 'Moon', aspectType: 'sextile', impact: 11 },
  { planet1: 'Sun', planet2: 'Moon', aspectType: 'square', impact: -10 },
  { planet1: 'Moon', planet2: 'Venus', aspectType: 'trine', impact: 12 },
  { planet1: 'Moon', planet2: 'Venus', aspectType: 'conjunction', impact: 13 },
  { planet1: 'Moon', planet2: 'Neptune', aspectType: 'conjunction', impact: 10 },
  { planet1: 'Moon', planet2: 'Neptune', aspectType: 'trine', impact: 10 },
  { planet1: 'Moon', planet2: 'Saturn', aspectType: 'square', impact: -16 },
  { planet1: 'Moon', planet2: 'Saturn', aspectType: 'opposition', impact: -14 },
  { planet1: 'Moon', planet2: 'Pluto', aspectType: 'square', impact: -14 },
  { planet1: 'Moon', planet2: 'Pluto', aspectType: 'opposition', impact: -12 },
];

export const CONFLICT_STYLE_RULES: AspectImpactRule[] = [
  { planet1: 'Mars', planet2: 'Mars', aspectType: 'trine', impact: 15 },
  { planet1: 'Mars', planet2: 'Mars', aspectType: 'sextile', impact: 10 },
  { planet1: 'Mars', planet2: 'Mars', aspectType: 'square', impact: -16 },
  { planet1: 'Mars', planet2: 'Mars', aspectType: 'opposition', impact: -14 },
  { planet1: 'Mars', planet2: 'Mercury', aspectType: 'trine', impact: 12 },
  { planet1: 'Mars', planet2: 'Mercury', aspectType: 'square', impact: -12 },
  { planet1: 'Mars', planet2: 'Saturn', aspectType: 'sextile', impact: 10 },
  { planet1: 'Mars', planet2: 'Saturn', aspectType: 'trine', impact: 11 },
  { planet1: 'Mars', planet2: 'Saturn', aspectType: 'conjunction', impact: -14 },
  { planet1: 'Mars', planet2: 'Saturn', aspectType: 'square', impact: -15 },
  { planet1: 'Mars', planet2: 'Saturn', aspectType: 'opposition', impact: -14 },
  { planet1: 'Mars', planet2: 'Pluto', aspectType: 'square', impact: -18 },
  { planet1: 'Mars', planet2: 'Pluto', aspectType: 'opposition', impact: -16 },
  { planet1: 'Mercury', planet2: 'Uranus', aspectType: 'square', impact: -10 },
  { planet1: 'Sun', planet2: 'Mars', aspectType: 'square', impact: -12 },
  { planet1: 'Sun', planet2: 'Mars', aspectType: 'opposition', impact: -10 },
];

export const LONG_TERM_RULES: AspectImpactRule[] = [
  { planet1: 'Saturn', planet2: 'Sun', aspectType: 'trine', impact: 16 },
  { planet1: 'Saturn', planet2: 'Sun', aspectType: 'conjunction', impact: 14 },
  { planet1: 'Saturn', planet2: 'Sun', aspectType: 'sextile', impact: 11 },
  { planet1: 'Saturn', planet2: 'Sun', aspectType: 'square', impact: -15 },
  { planet1: 'Saturn', planet2: 'Sun', aspectType: 'opposition', impact: -14 },
  { planet1: 'Saturn', planet2: 'Moon', aspectType: 'trine', impact: 14 },
  { planet1: 'Saturn', planet2: 'Moon', aspectType: 'sextile', impact: 9 },
  { planet1: 'Jupiter', planet2: 'Sun', aspectType: 'trine', impact: 12 },
  { planet1: 'Jupiter', planet2: 'Sun', aspectType: 'conjunction', impact: 11 },
  { planet1: 'Sun', planet2: 'NorthNode', aspectType: 'conjunction', impact: 15 },
  { planet1: 'Sun', planet2: 'North Node', aspectType: 'conjunction', impact: 15 },
  { planet1: 'Sun', planet2: 'NorthNode', aspectType: 'trine', impact: 12 },
  { planet1: 'Sun', planet2: 'North Node', aspectType: 'trine', impact: 12 },
  { planet1: 'Venus', planet2: 'Saturn', aspectType: 'trine', impact: 12 },
  { planet1: 'Venus', planet2: 'Saturn', aspectType: 'conjunction', impact: 9 },
  { planet1: 'Uranus', planet2: 'Sun', aspectType: 'opposition', impact: -14 },
  { planet1: 'Uranus', planet2: 'Sun', aspectType: 'square', impact: -12 },
  { planet1: 'Neptune', planet2: 'Sun', aspectType: 'square', impact: -12 },
];

/**
 * Normalizes planet pair match regardless of person order.
 */
function matchesRule(aspect: SynastryAspect, rule: AspectImpactRule): boolean {
  if (aspect.type !== rule.aspectType) return false;
  return (
    (aspect.planetA === rule.planet1 && aspect.planetB === rule.planet2) ||
    (aspect.planetA === rule.planet2 && aspect.planetB === rule.planet1)
  );
}

/**
 * Calculates a single category score from baseline 50 and accumulated aspect modifiers.
 */
function calculateCategoryScore(aspects: SynastryAspect[], rules: AspectImpactRule[]): number {
  let scoreDelta = 0;

  for (const aspect of aspects) {
    for (const rule of rules) {
      if (matchesRule(aspect, rule)) {
        scoreDelta += rule.impact * aspect.weight;
      }
    }
  }

  const raw = Math.round(50 + scoreDelta);
  return Math.max(0, Math.min(100, raw));
}

export function computeCategoryScores(aspects: SynastryAspect[]): CategoryScores {
  return {
    chemistry: calculateCategoryScore(aspects, CHEMISTRY_RULES),
    communication: calculateCategoryScore(aspects, COMMUNICATION_RULES),
    emotionalBond: calculateCategoryScore(aspects, EMOTIONAL_BOND_RULES),
    conflictStyle: calculateCategoryScore(aspects, CONFLICT_STYLE_RULES),
    longTermPotential: calculateCategoryScore(aspects, LONG_TERM_RULES),
  };
}

export const RELATIONSHIP_WEIGHTS: Record<RelationshipType, {
  chemistry: number;
  communication: number;
  emotionalBond: number;
  conflictStyle: number;
  longTermPotential: number;
}> = {
  romantic: { chemistry: 0.20, communication: 0.25, emotionalBond: 0.25, conflictStyle: 0.15, longTermPotential: 0.15 },
  crush:    { chemistry: 0.35, communication: 0.25, emotionalBond: 0.20, conflictStyle: 0.10, longTermPotential: 0.10 },
  ex:       { chemistry: 0.10, communication: 0.15, emotionalBond: 0.25, conflictStyle: 0.30, longTermPotential: 0.20 },
  friend:   { chemistry: 0.05, communication: 0.35, emotionalBond: 0.25, conflictStyle: 0.20, longTermPotential: 0.15 },
  family:   { chemistry: 0.00, communication: 0.15, emotionalBond: 0.35, conflictStyle: 0.25, longTermPotential: 0.25 },
  coworker: { chemistry: 0.00, communication: 0.40, emotionalBond: 0.10, conflictStyle: 0.30, longTermPotential: 0.20 },
  friendship: { chemistry: 0.05, communication: 0.35, emotionalBond: 0.25, conflictStyle: 0.20, longTermPotential: 0.15 },
  business: { chemistry: 0.00, communication: 0.40, emotionalBond: 0.10, conflictStyle: 0.30, longTermPotential: 0.20 },
};

export function computeOverallScore(
  categories: CategoryScores,
  relationshipType: RelationshipType = 'romantic',
  customWeights?: Record<string, number>
): number {
  const w = (customWeights as typeof RELATIONSHIP_WEIGHTS[RelationshipType]) ||
    RELATIONSHIP_WEIGHTS[relationshipType] ||
    RELATIONSHIP_WEIGHTS.romantic;

  const raw = (
    categories.chemistry * w.chemistry +
    categories.communication * w.communication +
    categories.emotionalBond * w.emotionalBond +
    categories.conflictStyle * w.conflictStyle +
    categories.longTermPotential * w.longTermPotential
  );
  return Math.max(0, Math.min(100, Math.round(raw)));
}

/**
 * Combines category and overall scoring into one call.
 */
export function calculateSynastryScores(
  aspects: SynastryAspect[],
  _chartA?: NatalChart,
  _chartB?: NatalChart,
  relationshipType: RelationshipType = 'romantic',
  customWeights?: Record<string, unknown>
): { overallScore: number; categories: CategoryScores } {
  const categories = computeCategoryScores(aspects);
  const overallScore = computeOverallScore(
    categories,
    relationshipType,
    customWeights as Record<string, number> | undefined
  );
  return { overallScore, categories };
}
