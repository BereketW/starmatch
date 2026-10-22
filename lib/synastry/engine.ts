import { BirthData, RelationshipType, NatalChart, SynastryAspect, SynastryResult } from './types';
import { computeNatalChart } from '../astro/ephemeris';
import { findSynastryAspects, getStrongestAspect } from './aspects';
import { calculateSynastryScores } from './scoring';
import { calculateCoStarBuckets } from './costar';
import { computeQuickModeSynastry, quickModeSynastry } from './quick-mode';
import { computePairTransits } from '../astro/transits';
import { partitionPowerPressure } from './power-pressure';
import { generateDailyDoDont } from './dodont';

export { quickModeSynastry };

export interface ComputeSynastryOptions {
  currentDate?: Date | string;
  scoringWeights?: Record<string, unknown>;
  orbConfig?: Record<string, number>;
  relationshipType?: RelationshipType;
}

/**
 * Top-level facade function for StarMatch synastry calculations.
 * 100% deterministic: identical inputs yield identical outputs.
 */
export function computeSynastry(
  personA: BirthData,
  personB: BirthData,
  relationshipTypeOrOptions?: RelationshipType | ComputeSynastryOptions,
  optionsOrUndefined?: ComputeSynastryOptions
): SynastryResult {
  // Resolve arguments: support both (pA, pB, relType, opts) and (pA, pB, opts)
  let relationshipType: RelationshipType = 'romantic';
  let options: ComputeSynastryOptions = {};

  if (typeof relationshipTypeOrOptions === 'string') {
    relationshipType = relationshipTypeOrOptions as RelationshipType;
    if (optionsOrUndefined) options = optionsOrUndefined;
  } else if (relationshipTypeOrOptions && typeof relationshipTypeOrOptions === 'object') {
    options = relationshipTypeOrOptions;
    if (options.relationshipType) relationshipType = options.relationshipType;
  }

  // Quick Mode Detection
  const isQuickMode = Boolean(
    (!personA.birthDate && personA.zodiacSign) ||
    (!personB.birthDate && personB.zodiacSign) ||
    (personA.zodiacSign && personB.zodiacSign && !personA.birthDate && !personB.birthDate)
  );

  if (isQuickMode && (personA.zodiacSign || personB.zodiacSign)) {
    const signA = personA.zodiacSign ?? 'Aries';
    const signB = personB.zodiacSign ?? 'Aries';
    const result = computeQuickModeSynastry(signA, signB, relationshipType, options);
    if (personA.name) result.personA.name = personA.name;
    if (personB.name) result.personB.name = personB.name;
    return result;
  }

  // Full Birth Data Mode
  const chartA: NatalChart = computeNatalChart(personA);
  const chartB: NatalChart = computeNatalChart(personB);

  // Confidence degradation per FR-2:
  // If birth time or coordinates are unknown, lowConfidence is true
  const lowConfidence = Boolean(chartA.lowConfidence || chartB.lowConfidence);

  // Synastry Aspects
  const aspects: SynastryAspect[] = findSynastryAspects(chartA, chartB, options.orbConfig);

  // Strongest Aspect (#1 strongest aspect by weight/significance for "One Sharp Truth")
  const strongestAspect: SynastryAspect = getStrongestAspect(aspects);

  // 5 SRS Category Scores & Overall Score
  const { overallScore, categories } = calculateSynastryScores(
    aspects,
    chartA,
    chartB,
    relationshipType,
    options.scoringWeights
  );

  // 7 Co-Star Psychological Buckets
  const coStarBuckets = calculateCoStarBuckets(
    chartA,
    chartB,
    aspects,
    relationshipType
  );

  // Real-Time Transits
  const transitAspects = computePairTransits(chartA, chartB, {
    targetDate: options.currentDate,
  });

  // Power vs Pressure Transits
  const transits = partitionPowerPressure(transitAspects);

  // Daily Do & Don't for Us
  const dailyDoDont = generateDailyDoDont(
    transitAspects,
    strongestAspect,
    { date: options.currentDate }
  );

  return {
    personA,
    personB,
    relationshipType,
    overallScore,
    categories,
    scores: categories,
    coStarBuckets,
    aspects,
    strongestAspect,
    transits,
    dailyDoDont,
    isQuickMode: false,
    lowConfidence,
  };
}

export const calculateSynastry = computeSynastry;
