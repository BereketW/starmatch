import { ZodiacSign } from '@/lib/astro/types';
import { SIGN_INDICES, computeQuickModeCompatibility } from './quick-mode';

export const ZODIAC_SIGNS_CANONICAL = [
  'aquarius',
  'aries',
  'cancer',
  'capricorn',
  'gemini',
  'leo',
  'libra',
  'pisces',
  'sagittarius',
  'scorpio',
  'taurus',
  'virgo',
] as const;

export const ZODIAC_SIGNS_ORDER: ZodiacSign[] = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

export interface SignSeoMetadata {
  id: string;
  name: ZodiacSign;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  ruler: string;
  archetype: string;
  traits: string[];
  keywords: string[];
  tagline: string;
}

export const SIGN_SEO_DATA: Record<string, SignSeoMetadata> = {
  aries: {
    id: 'aries',
    name: 'Aries',
    symbol: '♈',
    element: 'Fire',
    modality: 'Cardinal',
    ruler: 'Mars',
    archetype: 'The Pioneer',
    traits: ['Impulsive', 'Courageous', 'Direct', 'Passionate'],
    keywords: ['initiative', 'assertion', 'raw instinct', 'fearless pursuit'],
    tagline: 'Pure kinetic will and unfiltered emotional transparency.',
  },
  taurus: {
    id: 'taurus',
    name: 'Taurus',
    symbol: '♉',
    element: 'Earth',
    modality: 'Fixed',
    ruler: 'Venus',
    archetype: 'The Anchor',
    traits: ['Sensual', 'Steadfast', 'Possessive', 'Grounded'],
    keywords: ['devotion', 'tactile safety', 'deliberate pace', 'aesthetic loyalty'],
    tagline: 'Quiet permanence, sensual luxury, and unyielding endurance.',
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    symbol: '♊',
    element: 'Air',
    modality: 'Mutable',
    ruler: 'Mercury',
    archetype: 'The Messenger',
    traits: ['Witty', 'Curious', 'Restless', 'Dualistic'],
    keywords: ['mental banter', 'curiosity', 'cognitive spark', 'quick reflexes'],
    tagline: 'Rapid mental cadence and endless fascination with contradiction.',
  },
  cancer: {
    id: 'cancer',
    name: 'Cancer',
    symbol: '♋',
    element: 'Water',
    modality: 'Cardinal',
    ruler: 'Moon',
    archetype: 'The Protector',
    traits: ['Intuitive', 'Protective', 'Empathetic', 'Cautious'],
    keywords: ['emotional shelter', 'vulnerability', 'subconscious memory', 'deep devotion'],
    tagline: 'Primal devotion wrapped in intuitive psychic self-defense.',
  },
  leo: {
    id: 'leo',
    name: 'Leo',
    symbol: '♌',
    element: 'Fire',
    modality: 'Fixed',
    ruler: 'Sun',
    archetype: 'The Sovereign',
    traits: ['Radiant', 'Loyal', 'Generous', 'Theatrical'],
    keywords: ['magnificence', 'unconditional devotion', 'warm presence', 'pride'],
    tagline: 'Blazing generosity, intense pride, and open-hearted grandeur.',
  },
  virgo: {
    id: 'virgo',
    name: 'Virgo',
    symbol: '♍',
    element: 'Earth',
    modality: 'Mutable',
    ruler: 'Mercury',
    archetype: 'The Analyst',
    traits: ['Perceptive', 'Devoted', 'Exact', 'Reflective'],
    keywords: ['devotional service', 'intellectual precision', 'quiet observation', 'care'],
    tagline: 'Quiet attentiveness, analytical devotion, and intentional integrity.',
  },
  libra: {
    id: 'libra',
    name: 'Libra',
    symbol: '♎',
    element: 'Air',
    modality: 'Cardinal',
    ruler: 'Venus',
    archetype: 'The Harmonizer',
    traits: ['Charming', 'Diplomatic', 'Idealistic', 'Refined'],
    keywords: ['aesthetic equilibrium', 'partnership', 'reciprocity', 'grace'],
    tagline: 'Relational artistry, aesthetic balance, and effortless charm.',
  },
  scorpio: {
    id: 'scorpio',
    name: 'Scorpio',
    symbol: '♏',
    element: 'Water',
    modality: 'Fixed',
    ruler: 'Pluto & Mars',
    archetype: 'The Alchemist',
    traits: ['Penetrating', 'Magnetic', 'Guarded', 'Transformative'],
    keywords: ['soul fusion', 'psychological depth', 'radical honesty', 'intensity'],
    tagline: 'Absolute emotional gravity, psychological x-ray vision, and total devotion.',
  },
  sagittarius: {
    id: 'sagittarius',
    name: 'Sagittarius',
    symbol: '♐',
    element: 'Fire',
    modality: 'Mutable',
    ruler: 'Jupiter',
    archetype: 'The Philosopher',
    traits: ['Expansive', 'Candid', 'Adventurous', 'Philosophical'],
    keywords: ['existential freedom', 'bold candor', 'hunger for truth', 'unbridled optimism'],
    tagline: 'Uncontainable momentum, existential honesty, and hunger for horizons.',
  },
  capricorn: {
    id: 'capricorn',
    name: 'Capricorn',
    symbol: '♑',
    element: 'Earth',
    modality: 'Cardinal',
    ruler: 'Saturn',
    archetype: 'The Architect',
    traits: ['Disciplined', 'Stoic', 'Strategic', 'Architectural'],
    keywords: ['enduring legacy', 'calculated loyalty', 'quiet resilience', 'earned trust'],
    tagline: 'Architectural ambition, granite loyalty, and stoic devotion.',
  },
  aquarius: {
    id: 'aquarius',
    name: 'Aquarius',
    symbol: '♒',
    element: 'Air',
    modality: 'Fixed',
    ruler: 'Uranus & Saturn',
    archetype: 'The Visionary',
    traits: ['Unorthodox', 'Objective', 'Egalitarian', 'Electric'],
    keywords: ['intellectual autonomy', 'futuristic vision', 'unconventional bond', 'space'],
    tagline: 'Radical individuality, intellectual camaraderie, and defiant authenticity.',
  },
  pisces: {
    id: 'pisces',
    name: 'Pisces',
    symbol: '♓',
    element: 'Water',
    modality: 'Mutable',
    ruler: 'Neptune & Jupiter',
    archetype: 'The Mystic',
    traits: ['Boundless', 'Empathetic', 'Poetic', 'Mystic'],
    keywords: ['psychic osmosis', 'transcendent empathy', 'oceanic feeling', 'surrender'],
    tagline: 'Oceanic empathy, dreamlike connection, and boundary-dissolving tenderness.',
  },
};

export interface PairMeta {
  slug: string;
  signA: ZodiacSign;
  signB: ZodiacSign;
  signAId: string;
  signBId: string;
  isSelfPair: boolean;
  title: string;
  description: string;
  elementalDynamic: string;
  aspectGeometry: string;
  headline: string;
  sharpTruth: string;
  baselineScore: number;
}

/**
 * Canonical alphabetical slug generation:
 * [s1.toLowerCase(), s2.toLowerCase()].sort().join('-')
 */
export function formatPairSlug(signA: string, signB: string): string {
  const sorted = [signA.trim().toLowerCase(), signB.trim().toLowerCase()].sort();
  return `${sorted[0]}-${sorted[1]}`;
}

export function formatSlug(signA: string, signB: string): string {
  return `/compatibility/${formatPairSlug(signA, signB)}`;
}

/**
 * Checks if a string is a valid zodiac sign.
 */
export function isValidSignName(sign: string): boolean {
  return sign.trim().toLowerCase() in SIGN_SEO_DATA;
}

/**
 * Canonicalizes any sign pair slug.
 * Returns null if either sign is invalid.
 */
export function canonicalizePairSlug(slug: string): string | null {
  const parts = slug.toLowerCase().split('-');
  if (parts.length !== 2) return null;
  const [s1, s2] = parts;
  if (!isValidSignName(s1) || !isValidSignName(s2)) return null;
  return [s1, s2].sort().join('-');
}

export function isValidPairSlug(slug: string): boolean {
  const parts = slug.toLowerCase().split('-');
  if (parts.length !== 2) return false;
  return isValidSignName(parts[0]) && isValidSignName(parts[1]);
}

export function isCanonicalPairSlug(slug: string): boolean {
  const canonical = canonicalizePairSlug(slug);
  return canonical !== null && canonical === slug.toLowerCase();
}

/**
 * Parses a slug into pair components, returning null if invalid.
 */
export function parsePairSlug(slug: string): {
  signA: ZodiacSign;
  signB: ZodiacSign;
  signAId: string;
  signBId: string;
  isCanonical: boolean;
  canonicalSlug: string;
} | null {
  const parts = slug.toLowerCase().split('-');
  if (parts.length !== 2) return null;
  const [s1, s2] = parts;
  if (!isValidSignName(s1) || !isValidSignName(s2)) return null;

  const metaA = SIGN_SEO_DATA[s1];
  const metaB = SIGN_SEO_DATA[s2];
  const canonicalSlug = [s1, s2].sort().join('-');

  return {
    signA: metaA.name,
    signB: metaB.name,
    signAId: s1,
    signBId: s2,
    isCanonical: slug.toLowerCase() === canonicalSlug,
    canonicalSlug,
  };
}

/**
 * Build rich pair metadata.
 */
export function getPairMetadata(signAInput: string, signBInput: string): PairMeta {
  const sA = signAInput.trim().toLowerCase();
  const sB = signBInput.trim().toLowerCase();
  const metaA = SIGN_SEO_DATA[sA] || SIGN_SEO_DATA.aries;
  const metaB = SIGN_SEO_DATA[sB] || SIGN_SEO_DATA.aries;

  const slug = formatPairSlug(sA, sB);
  const isSelfPair = sA === sB;

  const quick = computeQuickModeCompatibility(sA, sB, 'romantic');
  const idxA = SIGN_INDICES[metaA.id as keyof typeof SIGN_INDICES] ?? 0;
  const idxB = SIGN_INDICES[metaB.id as keyof typeof SIGN_INDICES] ?? 0;
  const diff = Math.abs(idxA - idxB);
  const distance = Math.min(diff, 12 - diff);

  const aspectNames: Record<number, string> = {
    0: 'Conjunction (Same Sign)',
    1: 'Semi-Sextile (Adjacent)',
    2: 'Sextile (Harmonic)',
    3: 'Square (Dynamic Tension)',
    4: 'Trine (Natural Flow)',
    5: 'Quincunx (Fascinating Misalignment)',
    6: 'Opposition (Magnetic Polarity)',
  };

  const elementalDynamic = `${metaA.element} (${metaA.name}) + ${metaB.element} (${metaB.name})`;
  const aspectGeometry = aspectNames[distance] ?? 'Harmonic Aspect';

  const title = `${metaA.name} and ${metaB.name} Compatibility: Love, Sex & Psychological Chemistry | StarMatch`;
  const description = `Explore in-depth synastry compatibility between ${metaA.name} and ${metaB.name}. Overall score: ${quick.overallScore}%. One sharp truth: ${quick.sharpInsight}`;

  return {
    slug,
    signA: metaA.name,
    signB: metaB.name,
    signAId: metaA.id,
    signBId: metaB.id,
    isSelfPair,
    title,
    description,
    elementalDynamic,
    aspectGeometry,
    headline: `${metaA.name} & ${metaB.name}: ${quick.sharpInsight.split(';')[0]}`,
    sharpTruth: quick.sharpInsight,
    baselineScore: quick.overallScore,
  };
}

/**
 * Exactly 78 unique canonical slugs generated deterministically:
 * 12 identical sign pairs + 66 distinct pairs.
 */
export const ALL_CANONICAL_SLUGS: string[] = (() => {
  const slugs: string[] = [];
  for (let i = 0; i < ZODIAC_SIGNS_CANONICAL.length; i++) {
    for (let j = i; j < ZODIAC_SIGNS_CANONICAL.length; j++) {
      slugs.push(`${ZODIAC_SIGNS_CANONICAL[i]}-${ZODIAC_SIGNS_CANONICAL[j]}`);
    }
  }
  return slugs;
})();

/**
 * All 78 Pair metadata definitions.
 */
export const ALL_78_PAIRS: PairMeta[] = ALL_CANONICAL_SLUGS.map((slug) => {
  const [s1, s2] = slug.split('-');
  return getPairMetadata(s1, s2);
});

/**
 * Returns related pairs for internal SEO linking.
 */
export function getRelatedPairs(sign: string, limit: number = 6): PairMeta[] {
  const targetId = sign.trim().toLowerCase();
  const related = ALL_78_PAIRS.filter(
    (p) => p.signAId === targetId || p.signBId === targetId
  );
  return related.slice(0, limit);
}

/**
 * Generates Schema.org JSON-LD Article + BreadcrumbList structure.
 */
export function generatePairJsonLd(signA: string, signB: string, slug: string) {
  const canonUrl = `https://starmatch.app/compatibility/${slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${signA} and ${signB} Compatibility Reading`,
    description: `Astrological synastry and love compatibility between ${signA} and ${signB}, including chemistry, communication, and emotional dynamics.`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonUrl,
    },
    author: {
      '@type': 'Organization',
      name: 'StarMatch',
      url: 'https://starmatch.app',
    },
    publisher: {
      '@type': 'Organization',
      name: 'StarMatch',
      url: 'https://starmatch.app',
      logo: {
        '@type': 'ImageObject',
        url: 'https://starmatch.app/icon.png',
      },
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://starmatch.app',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Compatibility',
          item: 'https://starmatch.app/compatibility',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: `${signA} & ${signB}`,
          item: canonUrl,
        },
      ],
    },
  };
}
