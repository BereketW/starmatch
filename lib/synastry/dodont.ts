import { TransitAspect } from '../astro/transits';
import { SynastryAspect } from './types';

export interface DailyDoDont {
  doAction: string;
  dontAction: string;
  headline: string;
}

interface DoDontRule {
  headline: string;
  doAction: string;
  dontAction: string;
}

const SPECIFIC_RULES: Record<string, DoDontRule> = {
  'Moon_square_Mars': {
    headline: 'Short Fuses & Impulsive Spikes',
    doAction: 'Give each other 2 hours of complete silence before discussing plans.',
    dontAction: 'Critique their driving or bring up unresolved chores today.',
  },
  'Mars_square_Moon': {
    headline: 'Short Fuses & Impulsive Spikes',
    doAction: 'Give each other 2 hours of complete silence before discussing plans.',
    dontAction: 'Critique their driving or bring up unresolved chores today.',
  },
  'Mercury_square_Saturn': {
    headline: 'Mental Crosstalk & Censorship',
    doAction: 'Write down complicated thoughts before speaking; confirm details twice.',
    dontAction: 'Send long text paragraphs dissecting the relationship at 11 PM.',
  },
  'Saturn_square_Mercury': {
    headline: 'Mental Crosstalk & Censorship',
    doAction: 'Write down complicated thoughts before speaking; confirm details twice.',
    dontAction: 'Send long text paragraphs dissecting the relationship at 11 PM.',
  },
  'Venus_trine_Neptune': {
    headline: 'Unspoken Tenderness & Romance',
    doAction: 'Get dinner in an unfamiliar quiet place; be generous with affection.',
    dontAction: 'Demand strict practical commitments or talk about taxes tonight.',
  },
  'Neptune_trine_Venus': {
    headline: 'Unspoken Tenderness & Romance',
    doAction: 'Get dinner in an unfamiliar quiet place; be generous with affection.',
    dontAction: 'Demand strict practical commitments or talk about taxes tonight.',
  },
  'Mars_square_Pluto': {
    headline: 'Power Struggles & Ultimatums',
    doAction: 'Walk away the instant someone raises their voice; channel energy into a workout.',
    dontAction: 'Issue ultimatums or demand an apology right this second.',
  },
  'Pluto_square_Mars': {
    headline: 'Power Struggles & Ultimatums',
    doAction: 'Walk away the instant someone raises their voice; channel energy into a workout.',
    dontAction: 'Issue ultimatums or demand an apology right this second.',
  },
  'Sun_trine_Jupiter': {
    headline: 'Shared Horizon & Big Energy',
    doAction: 'Plan a future weekend trip or collaborate on a creative project.',
    dontAction: 'Overspend recklessly assuming tomorrow’s problem won’t arrive.',
  },
  'Jupiter_trine_Sun': {
    headline: 'Shared Horizon & Big Energy',
    doAction: 'Plan a future weekend trip or collaborate on a creative project.',
    dontAction: 'Overspend recklessly assuming tomorrow’s problem won’t arrive.',
  },
  'Saturn_square_Moon': {
    headline: 'Emotional Austerity & Fatigue',
    doAction: 'Offer physical presence without trying to solve their sadness.',
    dontAction: 'Tell them they are overreacting or being unreasonably sensitive.',
  },
  'Moon_square_Saturn': {
    headline: 'Emotional Austerity & Fatigue',
    doAction: 'Offer physical presence without trying to solve their sadness.',
    dontAction: 'Tell them they are overreacting or being unreasonably sensitive.',
  },
};

const GENERAL_PRESSURE_RULES: DoDontRule[] = [
  {
    headline: 'Guarded Boundaries & Defensive Pride',
    doAction: 'Acknowledge their independence without turning it into a test of loyalty.',
    dontAction: 'Bring up unresolved financial or boundary grievances over text.',
  },
  {
    headline: 'Pacing Misalignment',
    doAction: 'Slow down verbal responses by five seconds; focus on clarifying rather than defending.',
    dontAction: 'Demand an immediate definitive answer to a complex long-term question.',
  },
  {
    headline: 'Restless Friction',
    doAction: 'Change physical environments or take a quiet walk together.',
    dontAction: 'Micro-manage how they organize their personal space or routine.',
  },
];

const GENERAL_POWER_RULES: DoDontRule[] = [
  {
    headline: 'Harmonious Momentum',
    doAction: 'Express explicit gratitude for a specific small gesture they did recently.',
    dontAction: 'Take the ease for granted or retreat into separate screens all evening.',
  },
  {
    headline: 'Electric Banter & Connection',
    doAction: 'Lean into playful curiosity; ask a question you have never asked them before.',
    dontAction: 'Overthink their tone or search for hidden meanings in simple jokes.',
  },
];

/**
 * Generates today's Pair Do & Don't for Us.
 * Deterministic mapping based on active dominant transit aspects or synastry baseline.
 */
export function generateDailyDoDont(
  transits: TransitAspect[],
  _strongestAspect?: SynastryAspect,
  _options?: { date?: Date | string; seed?: string }
): DailyDoDont {
  void _strongestAspect;
  void _options;
  // 1. Direct match on specific transit rules
  for (const t of transits) {
    const key = `${t.transitPlanet}_${t.aspectType}_${t.targetPlanet}`;
    if (SPECIFIC_RULES[key]) {
      const rule = SPECIFIC_RULES[key];
      return {
        headline: rule.headline,
        doAction: rule.doAction,
        dontAction: rule.dontAction,
      };
    }
  }

  // 2. Highest significance Pressure transit
  const topPressure = transits.find((t) => t.nature === 'frictional');
  if (topPressure) {
    const idx =
      (topPressure.transitPlanet.charCodeAt(0) + topPressure.targetPlanet.charCodeAt(0)) %
      GENERAL_PRESSURE_RULES.length;
    const rule = GENERAL_PRESSURE_RULES[idx];
    return {
      headline: rule.headline,
      doAction: rule.doAction,
      dontAction: rule.dontAction,
    };
  }

  // 3. Highest significance Power transit
  const topPower = transits.find((t) => t.nature === 'harmonious');
  if (topPower) {
    const idx =
      (topPower.transitPlanet.charCodeAt(0) + topPower.targetPlanet.charCodeAt(0)) %
      GENERAL_POWER_RULES.length;
    const rule = GENERAL_POWER_RULES[idx];
    return {
      headline: rule.headline,
      doAction: rule.doAction,
      dontAction: rule.dontAction,
    };
  }

  // 4. Default fallback
  const fallbackRule = GENERAL_PRESSURE_RULES[0];
  return {
    headline: fallbackRule.headline,
    doAction: fallbackRule.doAction,
    dontAction: fallbackRule.dontAction,
  };
}
