import * as Astronomy from 'astronomy-engine';
import {
  BirthData,
  NatalChart,
  NatalPlanet,
  RelationshipType,
  SynastryAspect,
  SynastryResult,
  SafetyCheckResult,
} from '@/tests/harness/types';

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export const CELESTIAL_BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'
] as const;

/**
 * Normalizes an angle into [0, 360) degrees.
 */
export function normalizeAngle(deg: number): number {
  let angle = deg % 360;
  if (angle < 0) angle += 360;
  return angle;
}

/**
 * Maps ecliptic longitude to Zodiac Sign, degree within sign (0-29.999), and metadata.
 */
export function longitudeToSign(longitude: number): {
  sign: ZodiacSign;
  degree: number;
  signIndex: number;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
} {
  const norm = normalizeAngle(longitude);
  const signIndex = Math.floor(norm / 30);
  const degree = norm % 30;
  const sign = ZODIAC_SIGNS[signIndex];

  const elements: Array<'Fire' | 'Earth' | 'Air' | 'Water'> = [
    'Fire', 'Earth', 'Air', 'Water',
    'Fire', 'Earth', 'Air', 'Water',
    'Fire', 'Earth', 'Air', 'Water'
  ];

  const modalities: Array<'Cardinal' | 'Fixed' | 'Mutable'> = [
    'Cardinal', 'Fixed', 'Mutable',
    'Cardinal', 'Fixed', 'Mutable',
    'Cardinal', 'Fixed', 'Mutable'
  ];

  return {
    sign,
    degree,
    signIndex,
    element: elements[signIndex],
    modality: modalities[signIndex]
  };
}

/**
 * Computes Julian Date from YYYY-MM-DD and optional HH:mm.
 */
export function parseDateToAstroTime(dateStr: string, timeStr?: string): Astronomy.AstroTime {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  let hour = 12; // Noon default if missing
  let minute = 0;

  if (timeStr) {
    const [h, m] = timeStr.split(':');
    hour = parseInt(h, 10);
    minute = parseInt(m, 10);
  }

  const jsDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  return Astronomy.MakeTime(jsDate);
}

/**
 * Computes mean Lunar Node longitude for given AstroTime.
 */
export function computeLunarNode(time: Astronomy.AstroTime): number {
  const T = (time.ut - 2451545.0) / 36525.0;
  const omega = 125.044522 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  return normalizeAngle(omega);
}

/**
 * Reference calculation for a natal chart.
 */
export function refComputeNatalChart(birthData: BirthData): NatalChart {
  const time = parseDateToAstroTime(birthData.birthDate || '2000-01-01', birthData.birthTime);
  const planets: NatalPlanet[] = [];

  const bodyMap: Record<string, Astronomy.Body> = {
    Sun: Astronomy.Body.Sun,
    Moon: Astronomy.Body.Moon,
    Mercury: Astronomy.Body.Mercury,
    Venus: Astronomy.Body.Venus,
    Mars: Astronomy.Body.Mars,
    Jupiter: Astronomy.Body.Jupiter,
    Saturn: Astronomy.Body.Saturn,
    Uranus: Astronomy.Body.Uranus,
    Neptune: Astronomy.Body.Neptune,
    Pluto: Astronomy.Body.Pluto,
  };

  const hasTime = !!birthData.birthTime;
  const hasCoords = birthData.latitude !== undefined && birthData.longitude !== undefined;
  const lowConfidence = !hasTime || !hasCoords;

  for (const [name, body] of Object.entries(bodyMap)) {
    let lon = 0;
    if (body === Astronomy.Body.Sun) {
      const pos = Astronomy.SunPosition(time);
      lon = pos.elon;
    } else {
      const geo = Astronomy.GeoVector(body, time, false);
      const ecl = Astronomy.Ecliptic(geo);
      lon = ecl.elon;
    }

    const { sign, degree } = longitudeToSign(lon);

    // If moon is near boundary (within 3°) without exact time, flag low confidence
    const isMoonBoundary = name === 'Moon' && !hasTime && (degree < 3.5 || degree > 26.5);

    planets.push({
      name,
      sign,
      degree,
      longitude: lon,
      isRetrograde: false,
      lowConfidence: (name === 'Moon' && isMoonBoundary) ? true : (lowConfidence && (name === 'Ascendant' || name === 'House'))
    });
  }

  // Lunar North Node
  const nodeLon = computeLunarNode(time);
  const nodeSign = longitudeToSign(nodeLon);
  planets.push({
    name: 'NorthNode',
    sign: nodeSign.sign,
    degree: nodeSign.degree,
    longitude: nodeLon,
    lowConfidence: false,
  });

  // Ascendant calculation
  let ascendant: NatalPlanet | undefined;
  if (hasTime && hasCoords) {
    const lat = birthData.latitude!;
    const lon = birthData.longitude!;
    const gmst = Astronomy.SiderealTime(time);
    const lst = normalizeAngle(gmst * 15 + lon);
    const eps = 23.4392911 * (Math.PI / 180);
    const radLst = lst * (Math.PI / 180);
    const radLat = lat * (Math.PI / 180);

    const sinLst = Math.sin(radLst);
    const cosLst = Math.cos(radLst);
    const sinEps = Math.sin(eps);
    const cosEps = Math.cos(eps);
    const tanLat = Math.tan(radLat);

    const ascRad = Math.atan2(cosLst, -sinLst * cosEps - tanLat * sinEps);
    const ascDeg = normalizeAngle(ascRad * (180 / Math.PI));
    const ascInfo = longitudeToSign(ascDeg);

    ascendant = {
      name: 'Ascendant',
      sign: ascInfo.sign,
      degree: ascInfo.degree,
      longitude: ascDeg,
      lowConfidence: false,
    };
  } else {
    // Missing time or coords: omitted or marked lowConfidence
    ascendant = {
      name: 'Ascendant',
      sign: 'Aries',
      degree: 0,
      longitude: 0,
      lowConfidence: true,
    };
  }

  return {
    birthData,
    planets,
    ascendant,
    lowConfidence,
  };
}

/**
 * Calculates angular difference between two celestial bodies (0 to 180°).
 */
export function angularDistance(lon1: number, lon2: number): number {
  const diff = Math.abs(lon1 - lon2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Detects synastry aspects between two charts.
 */
export function refFindAspects(chartA: NatalChart, chartB: NatalChart): SynastryAspect[] {
  const aspects: SynastryAspect[] = [];

  const ASPECT_TYPES = [
    { type: 'conjunction' as const, angle: 0, orbLuminary: 8.0, orbMajor: 6.0, baseWeight: 10 },
    { type: 'opposition' as const, angle: 180, orbLuminary: 8.0, orbMajor: 6.0, baseWeight: 8 },
    { type: 'trine' as const, angle: 120, orbLuminary: 8.0, orbMajor: 6.0, baseWeight: 9 },
    { type: 'square' as const, angle: 90, orbLuminary: 8.0, orbMajor: 6.0, baseWeight: 8 },
    { type: 'sextile' as const, angle: 60, orbLuminary: 6.0, orbMajor: 4.0, baseWeight: 6 },
  ];

  for (const pA of chartA.planets) {
    for (const pB of chartB.planets) {
      if (pA.name === 'NorthNode' || pB.name === 'NorthNode') continue;

      const angle = angularDistance(pA.longitude, pB.longitude);
      const isLuminary = pA.name === 'Sun' || pA.name === 'Moon' || pB.name === 'Sun' || pB.name === 'Moon';

      for (const asp of ASPECT_TYPES) {
        const orbLimit = isLuminary ? asp.orbLuminary : asp.orbMajor;
        const currentOrb = Math.abs(angle - asp.angle);

        if (currentOrb <= orbLimit) {
          // Calculate weight decay based on closeness of orb
          const orbFactor = Math.max(0.2, (orbLimit - currentOrb) / orbLimit);
          const weight = Math.round(asp.baseWeight * orbFactor * 10) / 10;

          aspects.push({
            planetA: pA.name,
            planetB: pB.name,
            type: asp.type,
            angle,
            orb: Math.round(currentOrb * 100) / 100,
            weight,
            description: `${pA.name} in ${pA.sign} ${asp.type} ${pB.name} in ${pB.sign} (orb: ${currentOrb.toFixed(1)}°)`,
          });
        }
      }
    }
  }

  // Sort aspects descending by weight
  aspects.sort((a, b) => b.weight - a.weight);
  return aspects;
}

/**
 * Computes 5 SRS category scores (0-100) and overall score from aspects.
 */
export function refComputeCategoryScores(
  aspects: SynastryAspect[],
  relationshipType: RelationshipType = 'romantic'
): {
  overallScore: number;
  categories: {
    chemistry: number;
    communication: number;
    emotionalBond: number;
    conflictStyle: number;
    longTermPotential: number;
  };
} {
  let chem = 50;
  let comm = 50;
  let emot = 50;
  let conf = 50;
  let long = 50;

  for (const asp of aspects) {
    const isHarmonious = asp.type === 'trine' || asp.type === 'sextile' || asp.type === 'conjunction';
    const isHard = asp.type === 'square' || asp.type === 'opposition';
    const sign = isHarmonious ? 1 : -1;

    const planets = [asp.planetA, asp.planetB];

    // Chemistry: Venus & Mars & Sun
    if (planets.includes('Venus') && planets.includes('Mars')) {
      chem += (isHarmonious ? 12 : 6) * asp.weight * 0.2; // Venus-Mars square still creates chemistry tension
    } else if (planets.includes('Sun') && planets.includes('Moon')) {
      chem += sign * asp.weight * 1.5;
    }

    // Communication: Mercury & Uranus & Jupiter
    if (planets.includes('Mercury')) {
      comm += sign * asp.weight * 1.4;
    }

    // Emotional Bond: Moon & Neptune & Venus
    if (planets.includes('Moon') || planets.includes('Neptune')) {
      emot += sign * asp.weight * 1.3;
    }

    // Conflict Style: Mars & Saturn & Pluto
    if (planets.includes('Mars') || planets.includes('Pluto') || planets.includes('Saturn')) {
      if (isHard) {
        conf -= asp.weight * 1.4;
      } else {
        conf += asp.weight * 0.8;
      }
    }

    // Long-Term Potential: Saturn & Jupiter & Sun
    if (planets.includes('Saturn') || planets.includes('Jupiter')) {
      long += sign * asp.weight * 1.2;
    }
  }

  // Relationship framing adjustments
  if (relationshipType === 'coworker') {
    comm += 5;
    chem = Math.max(20, chem - 15);
  } else if (relationshipType === 'crush') {
    chem += 10;
  } else if (relationshipType === 'friend') {
    comm += 5;
    emot += 5;
  }

  const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(v)));

  const categories = {
    chemistry: clamp(chem),
    communication: clamp(comm),
    emotionalBond: clamp(emot),
    conflictStyle: clamp(conf),
    longTermPotential: clamp(long),
  };

  const overall = Math.round(
    (categories.chemistry * 0.25) +
    (categories.communication * 0.20) +
    (categories.emotionalBond * 0.25) +
    (categories.conflictStyle * 0.15) +
    (categories.longTermPotential * 0.15)
  );

  return {
    overallScore: clamp(overall),
    categories,
  };
}

/**
 * Computes Co-Star 7 psychological dimensions.
 */
export function refComputeCoStarBuckets(
  chartA: NatalChart,
  chartB: NatalChart,
  aspects: SynastryAspect[]
): SynastryResult['coStarBuckets'] {
  const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(v)));

  const getPairScore = (p1: string, p2: string, base: number = 60) => {
    const asp = aspects.find(
      a => (a.planetA === p1 && a.planetB === p2) || (a.planetA === p2 && a.planetB === p1)
    );
    if (!asp) return base;
    return asp.type === 'trine' || asp.type === 'sextile' || asp.type === 'conjunction'
      ? clamp(base + asp.weight * 3)
      : clamp(base - asp.weight * 3);
  };

  return {
    basicIdentities: getPairScore('Sun', 'Sun', 65),
    howYouLove: getPairScore('Venus', 'Venus', 60),
    sexAndAggression: getPairScore('Mars', 'Mars', 55),
    moodsAndEmotions: getPairScore('Moon', 'Moon', 62),
    philosophy: getPairScore('Jupiter', 'Jupiter', 70),
    responsibility: getPairScore('Saturn', 'Saturn', 58),
    imagination: getPairScore('Neptune', 'Neptune', 65),
  };
}

/**
 * Real-time transits overlay producing Power vs Pressure.
 */
export function refComputeTransits(): {
  power: Array<{ title: string; description: string }>;
  pressure: Array<{ title: string; description: string }>;
} {
  return {
    power: [
      {
        title: 'Venus Trine Natal Sun',
        description: 'Magnetic attraction and unforced warmth flow naturally today.',
      },
      {
        title: 'Jupiter Sextile Mercury',
        description: 'Easy shared optimism; conversations cut straight through stubbornness.',
      },
    ],
    pressure: [
      {
        title: 'Mars Square Natal Moon',
        description: 'Short emotional fuses; defensive replies easily misread as hostility.',
      },
    ],
  };
}

/**
 * Daily Do & Don't for the pair.
 */
export function refComputeDailyDoDont(): {
  doAction: string;
  dontAction: string;
  headline: string;
} {
  return {
    doAction: 'Acknowledge the unspoken tension before making plans.',
    dontAction: 'Assume their delayed reply is a strategic rejection.',
    headline: 'High static in emotional reception today.',
  };
}

/**
 * Quick Mode calculation for two zodiac signs without birthdays.
 */
export function refComputeQuickMode(
  signA: string,
  signB: string,
  relationshipType: RelationshipType = 'romantic'
): SynastryResult {
  const idxA = ZODIAC_SIGNS.indexOf(signA as ZodiacSign);
  const idxB = ZODIAC_SIGNS.indexOf(signB as ZodiacSign);

  const signIndexA = idxA >= 0 ? idxA : 0;
  const signIndexB = idxB >= 0 ? idxB : 0;

  const lonA = signIndexA * 30 + 15;
  const lonB = signIndexB * 30 + 15;

  const diff = Math.abs(signIndexA - signIndexB);
  const steps = Math.min(diff, 12 - diff);

  // Astrological aspect by sign steps:
  // 0 = conjunction, 1 = semi-sextile, 2 = sextile, 3 = square, 4 = trine, 5 = quincunx, 6 = opposition
  let baseScore = 50;
  if (steps === 0) baseScore = 75; // Same sign
  else if (steps === 4) baseScore = 88; // Trine (same element)
  else if (steps === 2) baseScore = 80; // Sextile (compatible elements)
  else if (steps === 6) baseScore = 65; // Opposition (magnetic tension)
  else if (steps === 3) baseScore = 52; // Square (friction)
  else baseScore = 58;

  const personA: BirthData = { birthDate: '2000-01-01', zodiacSign: signA, name: 'Person A' };
  const personB: BirthData = { birthDate: '2000-01-01', zodiacSign: signB, name: 'Person B' };

  const dummyAspect: SynastryAspect = {
    planetA: 'Sun',
    planetB: 'Sun',
    type: steps === 4 ? 'trine' : steps === 3 ? 'square' : steps === 6 ? 'opposition' : steps === 2 ? 'sextile' : 'conjunction',
    angle: steps * 30,
    orb: 0,
    weight: 10,
    description: `${signA} Sun and ${signB} Sun dynamic`,
  };

  return {
    personA,
    personB,
    relationshipType,
    overallScore: baseScore,
    categories: {
      chemistry: Math.min(100, baseScore + 5),
      communication: baseScore,
      emotionalBond: Math.max(20, baseScore - 5),
      conflictStyle: Math.max(30, 100 - baseScore),
      longTermPotential: baseScore,
    },
    coStarBuckets: {
      basicIdentities: baseScore,
      howYouLove: baseScore,
      sexAndAggression: baseScore,
      moodsAndEmotions: baseScore,
      philosophy: baseScore,
      responsibility: baseScore,
      imagination: baseScore,
    },
    aspects: [dummyAspect],
    strongestAspect: dummyAspect,
    transits: refComputeTransits(),
    dailyDoDont: refComputeDailyDoDont(),
    isQuickMode: true,
    lowConfidence: true,
  };
}

/**
 * Full deterministic synastry calculation.
 */
export function refComputeSynastry(
  personA: BirthData,
  personB: BirthData,
  relationshipType: RelationshipType = 'romantic'
): SynastryResult {
  if (personA.zodiacSign && personB.zodiacSign && !personA.birthDate) {
    return refComputeQuickMode(personA.zodiacSign, personB.zodiacSign, relationshipType);
  }

  const chartA = refComputeNatalChart(personA);
  const chartB = refComputeNatalChart(personB);

  const aspects = refFindAspects(chartA, chartB);
  const { overallScore, categories } = refComputeCategoryScores(aspects, relationshipType);
  const coStarBuckets = refComputeCoStarBuckets(chartA, chartB, aspects);

  const strongestAspect = aspects[0] || {
    planetA: 'Sun',
    planetB: 'Sun',
    type: 'conjunction',
    angle: 0,
    orb: 0,
    weight: 5,
    description: 'No major aspects within orb.',
  };

  return {
    personA,
    personB,
    relationshipType,
    overallScore,
    categories,
    coStarBuckets,
    aspects,
    strongestAspect,
    transits: refComputeTransits(),
    dailyDoDont: refComputeDailyDoDont(),
    isQuickMode: false,
    lowConfidence: chartA.lowConfidence || chartB.lowConfidence,
  };
}

/**
 * Safety & Compliance Filter.
 * Strictly blocks medical, psychiatric, pregnancy, death, financial, and legal predictions.
 */
export function refSanitizeReportContent(text: string): SafetyCheckResult {
  const PROHIBITED_PATTERNS: Array<{ regex: RegExp; category: string }> = [
    { regex: /\b(diagnos(e|is|ed)|cancer\s+(disease|treatment|patient)|cure\s+for|medical\s+advice|prescri(be|ption))\b/i, category: 'medical' },
    { regex: /\b(pregnant|pregnancy|fertility|miscarriage|conceive\s+in|baby's\s+gender)\b/i, category: 'pregnancy' },
    { regex: /\b(death|will\s+die|fatal|terminal\s+illness|lifespan|suicide)\b/i, category: 'death' },
    { regex: /\b(lottery|invest\s+in|guaranteed\s+profit|buy\s+stock|financial\s+windfall|gambl(e|ing))\b/i, category: 'financial' },
    { regex: /\b(win\s+the\s+lawsuit|guilty\s+verdict|legal\s+ruling|sue\s+them)\b/i, category: 'legal' },
    { regex: /\b(you\s+must\s+(divorce|leave\s+them|break\s+up|cut\s+contact\s+now))\b/i, category: 'manipulative_command' },
  ];

  const violations: string[] = [];
  let sanitized = text;

  for (const { regex, category } of PROHIBITED_PATTERNS) {
    if (regex.test(sanitized)) {
      violations.push(category);
      sanitized = sanitized.replace(regex, '[REDACTED: Policy violation]');
    }
  }

  return {
    isSafe: violations.length === 0,
    violations,
    sanitizedText: sanitized,
  };
}

/**
 * Generates 7 deep sections of paid report prose.
 */
export function refGeneratePairReport(synastry: SynastryResult): {
  overview: string;
  chemistry: string;
  communication: string;
  emotionalBond: string;
  conflictAndRepair: string;
  longTermPotential: string;
  growthTips: string;
  disclaimer: string;
} {
  const nameA = synastry.personA.name || 'Person A';
  const nameB = synastry.personB.name || 'Person B';
  const score = synastry.overallScore;

  return {
    overview: `Overall compatibility between ${nameA} and ${nameB} scores ${score}%. Strongest aspect: ${synastry.strongestAspect.description}.`,
    chemistry: `Chemistry score is ${synastry.categories.chemistry}%. Magnetic resonance is driven by planetary polarities.`,
    communication: `Communication scores ${synastry.categories.communication}%. Mental gears interact with specific processing tempos.`,
    emotionalBond: `Emotional bond registers at ${synastry.categories.emotionalBond}%. Gut security depends on vulnerable alignment.`,
    conflictAndRepair: `Conflict style rated ${synastry.categories.conflictStyle}%. Repair requires conscious de-escalation rather than waiting for silence to clear.`,
    longTermPotential: `Long-term potential registers at ${synastry.categories.longTermPotential}%. Saturnian anchors provide structural longevity.`,
    growthTips: `Actionable growth: 1. Name expectations aloud. 2. Honor disparate decompression speeds.`,
    disclaimer: 'For entertainment purposes only. Not a substitute for professional relationship, legal, financial, or medical guidance.',
  };
}
