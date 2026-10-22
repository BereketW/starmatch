import { SynastryResult } from '@/lib/synastry/types';
import {
  FullPairReport,
  ReportComposerOptions,
  LLMReportProvider,
  LLMReportPromptContext,
  DeepReportSection,
  FullDeepReport,
  OneSharpTruth,
} from './types';
import {
  getSynastrySeed,
  pickVariant,
  getScoreTier,
  OVERVIEW_SYNTHESIS,
  CHEMISTRY_TEMPLATES,
  COMMUNICATION_TEMPLATES,
  EMOTIONAL_BOND_TEMPLATES,
  CONFLICT_REPAIR_TEMPLATES,
  LONG_TERM_TEMPLATES,
  GROWTH_TIPS_BY_RELATIONSHIP,
} from './templates';
import {
  sanitizeReportContent,
  UNIVERSAL_ENTERTAINMENT_DISCLAIMER,
} from '@/lib/safety/filter';

function replaceVars(template: string, vars: Record<string, string | number>): string {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, String(val));
  }
  return result;
}

/**
 * Generates rich, multi-paragraph, psychologically incisive prose report for a synastry pair.
 * 100% offline and deterministic.
 */
export function generatePairReport(
  synastry: SynastryResult,
  options?: ReportComposerOptions
): FullPairReport {
  const nameA = synastry.personA?.name?.trim() || 'Person A';
  const nameB = synastry.personB?.name?.trim() || 'Person B';
  const score = synastry.overallScore ?? 50;

  const categories = synastry.categories ?? synastry.scores ?? {
    chemistry: 50,
    communication: 50,
    emotionalBond: 50,
    conflictStyle: 50,
    longTermPotential: 50,
  };

  const relType = (synastry.relationshipType || 'romantic').toLowerCase();
  const seed = getSynastrySeed(synastry);

  // 1. Overview Synthesis
  const overviewTier = getScoreTier(score);
  const overviewTemplate = pickVariant(OVERVIEW_SYNTHESIS[overviewTier], seed, 1);
  const overviewP1 = replaceVars(overviewTemplate, { nameA, nameB, score });

  let overviewP2 = '';
  if (synastry.strongestAspect && synastry.strongestAspect.description && synastry.strongestAspect.description !== 'None') {
    overviewP2 = `The central axis of this relationship is driven by ${synastry.strongestAspect.description}. This planetary dynamic serves as your primary fulcrum: an instinctual polarity where your most potent chemistry and greatest mutual lessons intersect.`;
  } else {
    overviewP2 = `The central fulcrum of this connection operates through steady elemental equilibrium. Rather than being jolted by volatile aspect friction, your dynamic develops through cumulative familiarity and quiet mutual observation.`;
  }

  let overviewP3 = '';
  if (synastry.isQuickMode || synastry.lowConfidence) {
    overviewP3 = `Note on Astrological Resolution: This reading is calculated based on solar zodiac placements. Because exact birth times and coordinates were omitted, rising signs and house cusps are withheld from definitive claims. Enter exact birth times to unlock high-precision ascendant and house synastry.`;
  } else {
    overviewP3 = `Elementally, this partnership bridges distinct temperamental currents. Sustaining growth requires that both partners resist treating initial impressions as permanent truths, remaining curious as each other's hidden facets emerge over time.`;
  }

  const rawOverview = [overviewP1, overviewP2, overviewP3].join('\n\n');

  // 2. Chemistry
  const chemTier = getScoreTier(categories.chemistry);
  const chemTemplate = pickVariant(CHEMISTRY_TEMPLATES[chemTier], seed, 2);
  let rawChemistry = replaceVars(chemTemplate, { score: categories.chemistry, nameA, nameB });
  if (relType === 'coworker' || relType === 'business') {
    rawChemistry += ` In a professional setting, this chemistry channels directly into collaborative velocity, creative momentum, and strategic ambition rather than romantic heat.`;
  } else if (relType === 'friend' || relType === 'friendship') {
    rawChemistry += ` Within friendship, this magnetic ease creates high-energy camaraderie, spontaneous humor, and shared social enthusiasm.`;
  }

  // 3. Communication
  const commTier = getScoreTier(categories.communication);
  const commTemplate = pickVariant(COMMUNICATION_TEMPLATES[commTier], seed, 3);
  const rawCommunication = replaceVars(commTemplate, { score: categories.communication, nameA, nameB });

  // 4. Emotional Bond
  const emotTier = getScoreTier(categories.emotionalBond);
  const emotTemplate = pickVariant(EMOTIONAL_BOND_TEMPLATES[emotTier], seed, 4);
  const rawEmotionalBond = replaceVars(emotTemplate, { score: categories.emotionalBond, nameA, nameB });

  // 5. Conflict Style & Repair
  const confTier = getScoreTier(categories.conflictStyle);
  const confTemplate = pickVariant(CONFLICT_REPAIR_TEMPLATES[confTier], seed, 5);
  let rawConflictAndRepair = replaceVars(confTemplate, { score: categories.conflictStyle, nameA, nameB });

  if (synastry.transits?.pressure && synastry.transits.pressure.length > 0) {
    const topPressure = synastry.transits.pressure[0];
    rawConflictAndRepair += `\n\nCurrent transit pressure highlights ${topPressure.title}: ${topPressure.description} Treat this period as an intentional stress-test for your emotional boundaries.`;
  }

  // 6. Long-term Potential
  const longTier = getScoreTier(categories.longTermPotential);
  const longTemplate = pickVariant(LONG_TERM_TEMPLATES[longTier], seed, 6);
  const rawLongTermPotential = replaceVars(longTemplate, { score: categories.longTermPotential, nameA, nameB });

  // 7. Actionable Growth Tips
  const growthList = GROWTH_TIPS_BY_RELATIONSHIP[relType] ?? GROWTH_TIPS_BY_RELATIONSHIP.romantic;
  const rawGrowthTips = pickVariant(growthList, seed, 7);

  // 8. Disclaimer
  const disclaimer = options?.customDisclaimer || UNIVERSAL_ENTERTAINMENT_DISCLAIMER;

  // Pass all generated content through safety sanitizer to guarantee 0 policy violations
  const overview = sanitizeReportContent(rawOverview).sanitizedText;
  const chemistry = sanitizeReportContent(rawChemistry).sanitizedText;
  const communication = sanitizeReportContent(rawCommunication).sanitizedText;
  const emotionalBond = sanitizeReportContent(rawEmotionalBond).sanitizedText;
  const conflictAndRepair = sanitizeReportContent(rawConflictAndRepair).sanitizedText;
  const longTermPotential = sanitizeReportContent(rawLongTermPotential).sanitizedText;
  const growthTips = sanitizeReportContent(rawGrowthTips).sanitizedText;

  return {
    overview,
    chemistry,
    communication,
    emotionalBond,
    conflictAndRepair,
    longTermPotential,
    growthTips,
    disclaimer,
  };
}

/**
 * Optional LLM-assisted report generator with deterministic fallback.
 */
export async function generatePairReportWithLLM(
  synastry: SynastryResult,
  provider: LLMReportProvider,
  options?: ReportComposerOptions
): Promise<FullPairReport> {
  const fallback = generatePairReport(synastry, options);

  const context: LLMReportPromptContext = {
    personAName: synastry.personA.name || 'Person A',
    personBName: synastry.personB.name || 'Person B',
    relationshipType: synastry.relationshipType,
    overallScore: synastry.overallScore,
    categories: synastry.categories,
    coStarBuckets: synastry.coStarBuckets,
    strongestAspect: synastry.strongestAspect,
    pressureAspects: synastry.transits?.pressure || [],
    isQuickMode: Boolean(synastry.isQuickMode),
    lowConfidence: Boolean(synastry.lowConfidence),
  };

  try {
    if (provider.generateFullReport) {
      const llmResult = await Promise.race([
        provider.generateFullReport(context),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('LLM Timeout')), 3000)),
      ]);
      if (llmResult) {
        return {
          overview: sanitizeReportContent(llmResult.overview || fallback.overview).sanitizedText,
          chemistry: sanitizeReportContent(llmResult.chemistry || fallback.chemistry).sanitizedText,
          communication: sanitizeReportContent(llmResult.communication || fallback.communication).sanitizedText,
          emotionalBond: sanitizeReportContent(llmResult.emotionalBond || fallback.emotionalBond).sanitizedText,
          conflictAndRepair: sanitizeReportContent(llmResult.conflictAndRepair || fallback.conflictAndRepair).sanitizedText,
          longTermPotential: sanitizeReportContent(llmResult.longTermPotential || fallback.longTermPotential).sanitizedText,
          growthTips: sanitizeReportContent(llmResult.growthTips || fallback.growthTips).sanitizedText,
          disclaimer: llmResult.disclaimer || fallback.disclaimer,
        };
      }
    }
  } catch {
    // Graceful fallback to deterministic engine on timeout or failure
  }

  return fallback;
}

/**
 * Extracts the #1 strongest aspect as an unsparing "One Sharp Truth" quote
 */
export function getOneSharpTruth(synastry: SynastryResult): OneSharpTruth {
  const aspect = synastry.strongestAspect;
  if (!aspect || !aspect.description || aspect.description === 'None') {
    return {
      aspectName: 'Cosmic Equilibrium',
      aspectType: 'conjunction',
      orb: '0.0° orb',
      headline: 'A baseline of subtle elemental equilibrium',
      quote: 'Rather than volatile aspect spikes, this connection develops through cumulative observation and unspoken resonance.',
      elaboration: 'Rather than volatile aspect spikes, this connection develops through cumulative observation and unspoken resonance.',
    };
  }

  const aspectName = `${aspect.planetA} ${aspect.type.toUpperCase()} ${aspect.planetB}`;
  const orb = `${aspect.orb.toFixed(1)}° orb`;
  const headline = `Gravitational axis: ${aspect.planetA} and ${aspect.planetB} in direct dialogue`;
  const quote = aspect.description;

  return {
    aspectName,
    aspectType: aspect.type,
    orb,
    headline,
    quote,
    elaboration: quote,
  };
}

/**
 * Composes the structured 7 Deep Sections full report from synastry data.
 * 100% deterministic and safe.
 */
export function composeFullReport(
  synastry: SynastryResult,
  options?: ReportComposerOptions
): FullDeepReport {
  const pairReport = generatePairReport(synastry, options);
  const nameA = synastry.personA?.name?.trim() || 'Person A';
  const nameB = synastry.personB?.name?.trim() || 'Person B';
  const score = synastry.overallScore ?? 50;

  // Filter aspects by domain relevance
  const luminaryAspects = (synastry.aspects || []).filter(
    (a) => ['Sun', 'Moon', 'Ascendant'].includes(a.planetA) || ['Sun', 'Moon', 'Ascendant'].includes(a.planetB)
  );
  const emotionalAspects = (synastry.aspects || []).filter(
    (a) => ['Moon', 'Venus', 'Neptune'].includes(a.planetA) || ['Moon', 'Venus', 'Neptune'].includes(a.planetB)
  );
  const mentalAspects = (synastry.aspects || []).filter(
    (a) => ['Mercury', 'Jupiter', 'Uranus'].includes(a.planetA) || ['Mercury', 'Jupiter', 'Uranus'].includes(a.planetB)
  );
  const attractionAspects = (synastry.aspects || []).filter(
    (a) => ['Venus', 'Mars', 'Pluto'].includes(a.planetA) || ['Venus', 'Mars', 'Pluto'].includes(a.planetB)
  );
  const frictionAspects = (synastry.aspects || []).filter(
    (a) => (a.type === 'square' || a.type === 'opposition') ||
           ['Mars', 'Saturn', 'Uranus', 'Pluto'].includes(a.planetA)
  );
  const karmicAspects = (synastry.aspects || []).filter(
    (a) => ['North Node', 'South Node', 'Saturn', 'Pluto'].includes(a.planetA) ||
           ['North Node', 'South Node', 'Saturn', 'Pluto'].includes(a.planetB)
  );

  const sections: DeepReportSection[] = [
    {
      id: 'section-1',
      number: 1,
      title: 'Core Archetypal Dynamic',
      subtitle: 'Foundational gravitational polarity and luminary alignment',
      astrologicalDomain: 'Sun, Moon & Rising Placements',
      prose: pairReport.overview,
      keyInsights: [
        `Overall synastry resonance registers at ${score}/100.`,
        `Basic Identities score: ${synastry.coStarBuckets?.basicIdentities ?? 50}/100.`,
        synastry.lowConfidence
          ? 'Rising signs & houses omitted due to unknown birth time; focus remains on exact planetary longitudes.'
          : 'Exact birth data confirmed: full angular house dynamics active.',
      ],
      aspects: luminaryAspects.slice(0, 4),
    },
    {
      id: 'section-2',
      number: 2,
      title: 'Emotional Safety & Attachment',
      subtitle: 'Somatic containment, vulnerability pacing, and psychological trust',
      astrologicalDomain: 'Moon-Moon, Moon-Venus & Neptune',
      prose: pairReport.emotionalBond,
      keyInsights: [
        `Emotional Bond score: ${synastry.categories?.emotionalBond ?? 50}/100.`,
        `Moods & Emotions dimension: ${synastry.coStarBuckets?.moodsAndEmotions ?? 50}/100.`,
        'Instinctive nervous system regulation and vulnerability thresholds.',
      ],
      aspects: emotionalAspects.slice(0, 4),
    },
    {
      id: 'section-3',
      number: 3,
      title: 'Communication & Mental Wavelength',
      subtitle: 'Conversational cadence, intellectual agility, and subtext translation',
      astrologicalDomain: 'Mercury, Jupiter & 3rd/9th Archetypes',
      prose: pairReport.communication,
      keyInsights: [
        `Communication score: ${synastry.categories?.communication ?? 50}/100.`,
        `Philosophy dimension: ${synastry.coStarBuckets?.philosophy ?? 50}/100.`,
        'Speed of intellectual comprehension and debate vs argument boundaries.',
      ],
      aspects: mentalAspects.slice(0, 4),
    },
    {
      id: 'section-4',
      number: 4,
      title: 'Desire, Chemistry & Attraction',
      subtitle: 'Physical magnetism, erotic polarity, and creative heat',
      astrologicalDomain: 'Venus-Mars Polarity, 5th/8th Archetypes & Pluto',
      prose: pairReport.chemistry,
      keyInsights: [
        `Chemistry score: ${synastry.categories?.chemistry ?? 50}/100.`,
        `How You Love: ${synastry.coStarBuckets?.howYouLove ?? 50}/100 • Sex & Aggression: ${synastry.coStarBuckets?.sexAndAggression ?? 50}/100.`,
        'Magnetic attraction dynamics and romantic generosity.',
      ],
      aspects: attractionAspects.slice(0, 4),
    },
    {
      id: 'section-5',
      number: 5,
      title: 'Friction Points & Growth Edges',
      subtitle: 'Reactive tripwires, defensive loops, and de-escalation hygiene',
      astrologicalDomain: 'Saturnian Boundaries, Mars, Uranus & Squares',
      prose: pairReport.conflictAndRepair,
      keyInsights: [
        `Conflict Style score: ${synastry.categories?.conflictStyle ?? 50}/100.`,
        `Responsibility dimension: ${synastry.coStarBuckets?.responsibility ?? 50}/100.`,
        'Tension discharge patterns and repair speed under interpersonal stress.',
      ],
      aspects: frictionAspects.slice(0, 4),
    },
    {
      id: 'section-6',
      number: 6,
      title: 'Karmic & Evolutionary Destiny',
      subtitle: 'The evolutionary assignment and developmental horizons',
      astrologicalDomain: 'Lunar Nodes, Saturn & Transpersonal Planets',
      prose: pairReport.longTermPotential,
      keyInsights: [
        `Long-Term Potential score: ${synastry.categories?.longTermPotential ?? 50}/100.`,
        `Imagination dimension: ${synastry.coStarBuckets?.imagination ?? 50}/100.`,
        'Evolutionary trajectory demanding mutual character maturation.',
      ],
      aspects: karmicAspects.slice(0, 4),
    },
    {
      id: 'section-7',
      number: 7,
      title: 'The Final Verdict & Navigation Guide',
      subtitle: 'Strategic rules of engagement and sustainable protocols',
      astrologicalDomain: 'Synthesis Verdict & Behavioral Action Plan',
      prose: pairReport.growthTips,
      keyInsights: [
        `Tailored specifically for ${synastry.relationshipType} partnership between ${nameA} & ${nameB}.`,
        'Three non-negotiable relationship agreements to prevent recurring friction.',
        'Continuous mutual curiosity over assumptions of permanent knowledge.',
      ],
    },
  ];

  const sharpTruth = getOneSharpTruth(synastry);

  return {
    pair: {
      personA: synastry.personA,
      personB: synastry.personB,
      relationshipType: synastry.relationshipType,
    },
    personA: synastry.personA,
    personB: synastry.personB,
    relationshipType: synastry.relationshipType,
    overallScore: score,
    sections: sections.map((s) => ({
      ...s,
      narrative: s.prose,
      strengths: s.keyInsights.slice(0, 2),
      frictionPoints: s.keyInsights.slice(2, 4),
      actionableGuidance: s.keyInsights[s.keyInsights.length - 1],
    })),
    strongestAspect: synastry.strongestAspect,
    aspects: synastry.aspects || [],
    oneSharpTruth: sharpTruth,
    disclaimer: pairReport.disclaimer,
    generatedAt: new Date().toISOString(),
  };
}
