import { SynastryAspect } from './aspects';
import { CategoryScores, computeOverallScore, RelationshipType } from './scoring';
import { CoStarBuckets } from './costar';
import { BirthData, SynastryResult } from './types';

export type ZodiacSign =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

export const ZODIAC_SIGNS: ZodiacSign[] = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
];

export const SIGN_INDICES: Record<ZodiacSign, number> = {
  aries: 0,
  taurus: 1,
  gemini: 2,
  cancer: 3,
  leo: 4,
  virgo: 5,
  libra: 6,
  scorpio: 7,
  sagittarius: 8,
  capricorn: 9,
  aquarius: 10,
  pisces: 11,
};

export interface QuickModeResult {
  signA: ZodiacSign;
  signB: ZodiacSign;
  relationshipType: RelationshipType;
  overallScore: number;
  categories: CategoryScores;
  coStarBuckets: CoStarBuckets;
  aspects: SynastryAspect[];
  strongestAspect: SynastryAspect;
  sharpInsight: string;
  isQuickMode: true;
  lowConfidence: true;
}

const GEOMETRIC_BASELINES: Record<number, {
  categories: CategoryScores;
  aspectType: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  sharpInsight: string;
}> = {
  0: {
    categories: { chemistry: 75, communication: 72, emotionalBond: 76, conflictStyle: 54, longTermPotential: 68 },
    aspectType: 'conjunction',
    sharpInsight: 'Mirror dynamics: you understand each other instantly, including the habits you hate about yourselves.',
  },
  1: {
    categories: { chemistry: 54, communication: 58, emotionalBond: 55, conflictStyle: 58, longTermPotential: 56 },
    aspectType: 'sextile',
    sharpInsight: 'Adjacent perspectives: operating on adjacent frequencies that require active translation to align.',
  },
  2: {
    categories: { chemistry: 74, communication: 82, emotionalBond: 75, conflictStyle: 72, longTermPotential: 76 },
    aspectType: 'sextile',
    sharpInsight: 'Effortless intellectual banter and high collaborative ease across complementary elements.',
  },
  3: {
    categories: { chemistry: 72, communication: 48, emotionalBond: 50, conflictStyle: 38, longTermPotential: 52 },
    aspectType: 'square',
    sharpInsight: 'Dynamic friction and growth through crisis; high creative tension that tests your patience.',
  },
  4: {
    categories: { chemistry: 82, communication: 80, emotionalBond: 85, conflictStyle: 78, longTermPotential: 82 },
    aspectType: 'trine',
    sharpInsight: 'Unspoken elemental harmony; natural flow and effortless domestic and emotional comfort.',
  },
  5: {
    categories: { chemistry: 58, communication: 46, emotionalBond: 48, conflictStyle: 44, longTermPotential: 50 },
    aspectType: 'square',
    sharpInsight: 'Fascinating foreign chemistry; neither can predict the other’s reflexes, creating mystery and misreads.',
  },
  6: {
    categories: { chemistry: 88, communication: 62, emotionalBond: 70, conflictStyle: 42, longTermPotential: 62 },
    aspectType: 'opposition',
    sharpInsight: 'Intense magnetic polarity; irresistible physical pull paired with completely opposing instincts.',
  },
};

export function normalizeSignName(sign: string): ZodiacSign {
  const lower = sign.trim().toLowerCase();
  if (lower in SIGN_INDICES) return lower as ZodiacSign;
  // default to aries if unknown
  return 'aries';
}

export function computeQuickModeCompatibility(
  signAInput: string,
  signBInput: string,
  relationshipType: RelationshipType = 'romantic'
): QuickModeResult {
  const signA = normalizeSignName(signAInput);
  const signB = normalizeSignName(signBInput);

  const idxA = SIGN_INDICES[signA];
  const idxB = SIGN_INDICES[signB];

  const diff = Math.abs(idxA - idxB);
  const distance = Math.min(diff, 12 - diff);

  const baseline = GEOMETRIC_BASELINES[distance] ?? GEOMETRIC_BASELINES[0];
  const categories = { ...baseline.categories };

  const overallScore = computeOverallScore(categories, relationshipType);

  const coStarBuckets: CoStarBuckets = {
    basicIdentities: distance === 0 ? 80 : distance === 4 ? 85 : distance === 2 ? 78 : distance === 6 ? 65 : 50,
    howYouLove: distance === 4 ? 82 : distance === 0 ? 76 : distance === 2 ? 75 : distance === 6 ? 70 : 52,
    sexAndAggression: distance === 6 ? 88 : distance === 0 ? 78 : distance === 4 ? 80 : distance === 3 ? 74 : 55,
    moodsAndEmotions: distance === 4 ? 86 : distance === 0 ? 78 : distance === 2 ? 74 : distance === 6 ? 68 : 48,
    philosophy: distance === 4 ? 80 : distance === 2 ? 82 : distance === 0 ? 72 : 55,
    responsibility: distance === 4 ? 78 : distance === 2 ? 75 : distance === 0 ? 68 : 50,
    imagination: distance === 4 ? 80 : distance === 6 ? 75 : 55,
  };

  const syntheticAspect: SynastryAspect = {
    planetA: 'Sun',
    planetB: 'Sun',
    type: baseline.aspectType,
    angle: distance * 30,
    orb: 0,
    weight: 1.0,
    description: baseline.sharpInsight,
  };

  return {
    signA,
    signB,
    relationshipType,
    overallScore,
    categories,
    coStarBuckets,
    aspects: [syntheticAspect],
    strongestAspect: syntheticAspect,
    sharpInsight: baseline.sharpInsight,
    isQuickMode: true,
    lowConfidence: true,
  };
}

/**
 * Returns full SynastryResult for Quick Mode.
 */
export function computeQuickModeSynastry(
  signAInput: string,
  signBInput: string,
  relationshipType: RelationshipType = 'romantic',
  _options?: unknown
): SynastryResult {
  void _options;
  const quick = computeQuickModeCompatibility(signAInput, signBInput, relationshipType);

  const personA: BirthData = {
    birthDate: '',
    zodiacSign: quick.signA.charAt(0).toUpperCase() + quick.signA.slice(1),
  };
  const personB: BirthData = {
    birthDate: '',
    zodiacSign: quick.signB.charAt(0).toUpperCase() + quick.signB.slice(1),
  };

  return {
    personA,
    personB,
    relationshipType,
    overallScore: quick.overallScore,
    categories: quick.categories,
    scores: quick.categories,
    coStarBuckets: quick.coStarBuckets,
    aspects: quick.aspects,
    strongestAspect: quick.strongestAspect,
    transits: {
      power: [
        {
          title: 'Archetypal Harmonic Resonance',
          description: quick.sharpInsight,
        },
      ],
      pressure: [
        {
          title: 'Elemental Boundary Check',
          description: 'Navigating mutual differences requires conscious communication rather than assumed agreement.',
        },
      ],
    },
    dailyDoDont: {
      headline: 'Quick Check Daily Focus',
      doAction: 'Acknowledge each other’s natural element and give space to process.',
      dontAction: 'Assume their silence means anger or disinterest.',
    },
    isQuickMode: true,
    lowConfidence: true,
  };
}

export const quickModeSynastry = computeQuickModeSynastry;
