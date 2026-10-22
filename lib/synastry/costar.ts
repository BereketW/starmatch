import { SynastryAspect } from './aspects';
import { CoStarBuckets, NatalChart, RelationshipType } from './types';

export { type CoStarBuckets };

export interface CoStarDimensionResult {
  score: number;
  verdict: string;
  lowConfidence: boolean;
}

export interface CoStarDetailedResult {
  scores: CoStarBuckets;
  dimensions: {
    basicIdentities: CoStarDimensionResult;
    howYouLove: CoStarDimensionResult;
    sexAndAggression: CoStarDimensionResult;
    moodsAndEmotions: CoStarDimensionResult;
    philosophy: CoStarDimensionResult;
    responsibility: CoStarDimensionResult;
    imagination: CoStarDimensionResult;
  };
}

export type ZodiacElement = 'fire' | 'earth' | 'air' | 'water';

const SIGN_ELEMENT_MAP: Record<string, ZodiacElement> = {
  aries: 'fire', leo: 'fire', sagittarius: 'fire',
  taurus: 'earth', virgo: 'earth', capricorn: 'earth',
  gemini: 'air', libra: 'air', aquarius: 'air',
  cancer: 'water', scorpio: 'water', pisces: 'water',
};

export function getSignElement(sign: string): ZodiacElement {
  return SIGN_ELEMENT_MAP[sign.toLowerCase()] ?? 'fire';
}

export function getElementSynergyOffset(elemA: ZodiacElement, elemB: ZodiacElement): number {
  if (elemA === elemB) return 10;
  if (
    (elemA === 'fire' && elemB === 'air') ||
    (elemA === 'air' && elemB === 'fire') ||
    (elemA === 'earth' && elemB === 'water') ||
    (elemA === 'water' && elemB === 'earth')
  ) {
    return 6;
  }
  if (
    (elemA === 'fire' && elemB === 'water') ||
    (elemA === 'water' && elemB === 'fire') ||
    (elemA === 'earth' && elemB === 'air') ||
    (elemA === 'air' && elemB === 'earth')
  ) {
    return -6;
  }
  return 0;
}

export const COSTAR_VERDICTS = {
  basicIdentities: {
    high: 'Your egos fuel rather than extinguish each other, provided neither demands total worship.',
    mid: 'You both want to be the author of the narrative; neither wants to edit.',
    low: 'Two sovereign states with completely incompatible border policies.',
  },
  howYouLove: {
    high: 'You speak the same dialect of devotion: quiet loyalty without theatrics.',
    mid: 'One shows love through space; the other demands suffocating proximity.',
    low: 'A recurring cycle where affection feels like a debt you are forced to pay back.',
  },
  sexAndAggression: {
    high: 'The physical magnetic current is immediate, electric, and restorative.',
    mid: 'The friction in bed is magnetic, but neither knows when to drop the knife.',
    low: 'Anger either turns into silent frost or a complete lack of mutual heat.',
  },
  moodsAndEmotions: {
    high: 'You can sit in silence during genuine grief without feeling the need to perform.',
    mid: 'You process fear through silence; they process fear through interrogation.',
    low: 'Emotional triggers ricochet off each other until everyone is locked in separate rooms.',
  },
  philosophy: {
    high: 'A shared moral compass and identical sense of dark existential humor.',
    mid: 'You agree on what is funny, but completely disagree on what is moral.',
    low: 'You disagree on the fundamental purpose of waking up tomorrow morning.',
  },
  responsibility: {
    high: 'A fortress of mutual accountability; bills paid, promises honored without nagging.',
    mid: 'One carries the mental load like a martyr; the other forgets the trash exists.',
    low: 'A shared domestic disaster waiting for an adult to intervene.',
  },
  imagination: {
    high: 'A private psychic universe that feels like home, detached from external noise.',
    mid: 'Your shared fantasies are intoxicating until rent is due.',
    low: 'One lives in pure pragmatic realism; the other feels lonely in dreams.',
  },
};

function getVerdict(key: keyof typeof COSTAR_VERDICTS, score: number): string {
  if (score >= 70) return COSTAR_VERDICTS[key].high;
  if (score >= 45) return COSTAR_VERDICTS[key].mid;
  return COSTAR_VERDICTS[key].low;
}

export interface PlacementsForCostar {
  sunSignA: string;
  sunSignB: string;
  moonSignA?: string;
  moonSignB?: string;
  venusSignA?: string;
  venusSignB?: string;
  marsSignA?: string;
  marsSignB?: string;
  hasBirthTimeA: boolean;
  hasBirthTimeB: boolean;
}

export function computeCoStarDimensions(
  aspects: SynastryAspect[],
  placements: PlacementsForCostar
): CoStarDetailedResult {
  const isMissingTime = !placements.hasBirthTimeA || !placements.hasBirthTimeB;

  // 1. Basic Identities (Sun & Ascendant)
  const sunElemA = getSignElement(placements.sunSignA);
  const sunElemB = getSignElement(placements.sunSignB);
  let idDelta = getElementSynergyOffset(sunElemA, sunElemB);
  for (const a of aspects) {
    const pair = [a.planetA, a.planetB].sort().join('-');
    if (pair === 'Sun-Sun') {
      if (a.type === 'conjunction' || a.type === 'trine') idDelta += 14 * a.weight;
      if (a.type === 'sextile') idDelta += 9 * a.weight;
      if (a.type === 'square') idDelta -= 12 * a.weight;
      if (a.type === 'opposition') idDelta -= 8 * a.weight;
    }
  }
  const idScore = Math.max(0, Math.min(100, Math.round(50 + idDelta)));

  // 2. How You Love (Venus)
  const venElemA = getSignElement(placements.venusSignA ?? placements.sunSignA);
  const venElemB = getSignElement(placements.venusSignB ?? placements.sunSignB);
  let loveDelta = getElementSynergyOffset(venElemA, venElemB);
  for (const a of aspects) {
    const pair = [a.planetA, a.planetB].sort().join('-');
    if (pair === 'Venus-Venus' || pair === 'Sun-Venus') {
      if (a.type === 'conjunction' || a.type === 'trine') loveDelta += 14 * a.weight;
      if (a.type === 'sextile') loveDelta += 9 * a.weight;
      if (a.type === 'square') loveDelta -= 10 * a.weight;
      if (a.type === 'opposition') loveDelta -= 6 * a.weight;
    }
    if (pair === 'Moon-Venus') {
      if (a.type === 'conjunction' || a.type === 'trine') loveDelta += 12 * a.weight;
      if (a.type === 'square') loveDelta -= 8 * a.weight;
    }
  }
  const loveScore = Math.max(0, Math.min(100, Math.round(50 + loveDelta)));

  // 3. Sex & Aggression (Mars)
  const marElemA = getSignElement(placements.marsSignA ?? placements.sunSignA);
  const marElemB = getSignElement(placements.marsSignB ?? placements.sunSignB);
  let sexDelta = getElementSynergyOffset(marElemA, marElemB);
  for (const a of aspects) {
    const pair = [a.planetA, a.planetB].sort().join('-');
    if (pair === 'Mars-Mars' || pair === 'Mars-Venus') {
      if (a.type === 'conjunction' || a.type === 'trine') sexDelta += 15 * a.weight;
      if (a.type === 'sextile') sexDelta += 10 * a.weight;
      if (a.type === 'square') sexDelta += (pair === 'Mars-Venus' ? 8 : -14) * a.weight;
      if (a.type === 'opposition') sexDelta += (pair === 'Mars-Venus' ? 9 : -12) * a.weight;
    }
    if (pair === 'Mars-Pluto') {
      if (a.type === 'conjunction' || a.type === 'trine') sexDelta += 12 * a.weight;
      if (a.type === 'square') sexDelta -= 14 * a.weight;
    }
  }
  const sexScore = Math.max(0, Math.min(100, Math.round(50 + sexDelta)));

  // 4. Moods & Emotions (Moon)
  const mooElemA = getSignElement(placements.moonSignA ?? placements.sunSignA);
  const mooElemB = getSignElement(placements.moonSignB ?? placements.sunSignB);
  let moodDelta = getElementSynergyOffset(mooElemA, mooElemB);
  for (const a of aspects) {
    const pair = [a.planetA, a.planetB].sort().join('-');
    if (pair === 'Moon-Moon' || pair === 'Moon-Sun') {
      if (a.type === 'conjunction' || a.type === 'trine') moodDelta += 16 * a.weight;
      if (a.type === 'sextile') moodDelta += 10 * a.weight;
      if (a.type === 'square') moodDelta -= 12 * a.weight;
      if (a.type === 'opposition') moodDelta -= 8 * a.weight;
    }
    if (pair === 'Moon-Saturn') {
      if (a.type === 'square' || a.type === 'opposition') moodDelta -= 15 * a.weight;
      if (a.type === 'trine') moodDelta += 8 * a.weight;
    }
  }
  const moodScore = Math.max(0, Math.min(100, Math.round(50 + moodDelta)));

  // 5. Philosophy (Jupiter)
  let philDelta = 0;
  for (const a of aspects) {
    const pair = [a.planetA, a.planetB].sort().join('-');
    if (pair.includes('Jupiter')) {
      if (a.type === 'conjunction' || a.type === 'trine') philDelta += 12 * a.weight;
      if (a.type === 'sextile') philDelta += 8 * a.weight;
      if (a.type === 'square') philDelta -= 8 * a.weight;
      if (a.type === 'opposition') philDelta -= 6 * a.weight;
    }
  }
  const philScore = Math.max(0, Math.min(100, Math.round(50 + philDelta)));

  // 6. Responsibility (Saturn)
  let respDelta = 0;
  for (const a of aspects) {
    const pair = [a.planetA, a.planetB].sort().join('-');
    if (pair.includes('Saturn')) {
      if (a.type === 'trine' || a.type === 'sextile') respDelta += 12 * a.weight;
      if (a.type === 'conjunction') respDelta += 8 * a.weight;
      if (a.type === 'square' || a.type === 'opposition') respDelta -= 12 * a.weight;
    }
  }
  const respScore = Math.max(0, Math.min(100, Math.round(50 + respDelta)));

  // 7. Imagination (Neptune / Uranus / Pluto)
  let imagDelta = 0;
  for (const a of aspects) {
    const pair = [a.planetA, a.planetB].sort().join('-');
    if (pair.includes('Neptune') || pair.includes('Uranus')) {
      if (a.type === 'conjunction' || a.type === 'trine') imagDelta += 10 * a.weight;
      if (a.type === 'sextile') imagDelta += 7 * a.weight;
      if (a.type === 'square') imagDelta -= 8 * a.weight;
    }
  }
  const imagScore = Math.max(0, Math.min(100, Math.round(50 + imagDelta)));

  const scores: CoStarBuckets = {
    basicIdentities: idScore,
    howYouLove: loveScore,
    sexAndAggression: sexScore,
    moodsAndEmotions: moodScore,
    philosophy: philScore,
    responsibility: respScore,
    imagination: imagScore,
  };

  return {
    scores,
    dimensions: {
      basicIdentities: {
        score: idScore,
        verdict: getVerdict('basicIdentities', idScore),
        lowConfidence: isMissingTime,
      },
      howYouLove: {
        score: loveScore,
        verdict: getVerdict('howYouLove', loveScore),
        lowConfidence: false,
      },
      sexAndAggression: {
        score: sexScore,
        verdict: getVerdict('sexAndAggression', sexScore),
        lowConfidence: false,
      },
      moodsAndEmotions: {
        score: moodScore,
        verdict: getVerdict('moodsAndEmotions', moodScore),
        lowConfidence: isMissingTime,
      },
      philosophy: {
        score: philScore,
        verdict: getVerdict('philosophy', philScore),
        lowConfidence: false,
      },
      responsibility: {
        score: respScore,
        verdict: getVerdict('responsibility', respScore),
        lowConfidence: false,
      },
      imagination: {
        score: imagScore,
        verdict: getVerdict('imagination', imagScore),
        lowConfidence: false,
      },
    },
  };
}

export function calculateCoStarBuckets(
  chartA: NatalChart,
  chartB: NatalChart,
  aspects: SynastryAspect[],
  _relationshipType?: RelationshipType
): CoStarBuckets {
  void _relationshipType;
  const getPlanetSign = (chart: NatalChart, name: string) =>
    chart.planets.find((p) => p.name === name)?.sign;

  const sunSignA = getPlanetSign(chartA, 'Sun') ?? 'Aries';
  const sunSignB = getPlanetSign(chartB, 'Sun') ?? 'Aries';
  const moonSignA = getPlanetSign(chartA, 'Moon');
  const moonSignB = getPlanetSign(chartB, 'Moon');
  const venusSignA = getPlanetSign(chartA, 'Venus');
  const venusSignB = getPlanetSign(chartB, 'Venus');
  const marsSignA = getPlanetSign(chartA, 'Mars');
  const marsSignB = getPlanetSign(chartB, 'Mars');

  const detailed = computeCoStarDimensions(aspects, {
    sunSignA,
    sunSignB,
    moonSignA,
    moonSignB,
    venusSignA,
    venusSignB,
    marsSignA,
    marsSignB,
    hasBirthTimeA: Boolean(chartA.birthData.birthTime),
    hasBirthTimeB: Boolean(chartB.birthData.birthTime),
  });

  return detailed.scores;
}
