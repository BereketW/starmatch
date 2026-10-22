import { TransitAspect } from '../astro/transits';

export interface TransitCardItem {
  title: string;
  description: string;
}

export interface PowerPressureResult {
  power: TransitCardItem[];
  pressure: TransitCardItem[];
}

// Curated high-impact interpretation dictionary
const POWER_INTERPRETATIONS: Record<string, string> = {
  'Jupiter_trine_Sun': 'Current Jupiter trine Sun gives effortless conversational rapport and expansive optimism this week.',
  'Jupiter_sextile_Sun': 'Mutual confidence is elevated; collaborative ideas and future plans find easy agreement.',
  'Venus_trine_Moon': 'Gentle emotional tenderness flows naturally. A protective and soothed emotional climate.',
  'Venus_conjunct_Moon': 'High emotional receptivity and affection. Mutual vulnerability feels safe and rewarded.',
  'Venus_trine_Venus': 'Aesthetic and romantic rhythm are completely in sync. Frictionless intimacy and unspoken mutual understanding.',
  'Venus_sextile_Mars': 'Playful physical chemistry and affectionate banter without territorial pressure.',
  'Sun_trine_Jupiter': 'Generous energy and good humor defuse any lingering domestic tension.',
  'Mercury_trine_Mercury': 'Rapid, effortless communication. You finish each other’s thoughts and resolve logistics swiftly.',
  'Mercury_sextile_Venus': 'Compliments and soft diplomacy land with precision. Ideal climate for delicate conversations.',
};

const PRESSURE_INTERPRETATIONS: Record<string, string> = {
  'Saturn_square_Venus': 'Transiting Saturn square Venus creates perceived emotional distance today. Avoid demanding instant reassurances.',
  'Saturn_opposition_Venus': 'Feelings of isolation or coldness can trigger withdrawal. Give each other space without creating ultimatums.',
  'Mars_square_Mercury': 'Sharp verbal reflexes and snappy reactions. Short fuses make casual banter easily misinterpreted.',
  'Mars_square_Mars': 'Competitive friction and territorial ego clashes. Minor schedule disagreements risk blowing up.',
  'Mars_square_Pluto': 'Intense power struggles or manipulative standoffs. Walk away the second an ultimatum surfaces.',
  'Saturn_square_Moon': 'Emotional austerity and defensiveness. One partner feels burdened while the other feels emotionally starved.',
  'Moon_square_Mars': 'Emotional irritation and quick anger over trivial domestic details.',
  'Uranus_square_Sun': 'Erratic impulses or sudden detachment. Resistance to routine can create unexpected disruptions.',
  'Mercury_square_Saturn': 'Mental exhaustion and fear of being judged. Silence is preferable to forced, heavy dissecting.',
};

function formatAspectTitle(transitPlanet: string, aspectType: string, targetPlanet: string): string {
  const capAspect = aspectType.charAt(0).toUpperCase() + aspectType.slice(1);
  return `${transitPlanet} ${capAspect} ${targetPlanet}`;
}

function synthesizePowerDescription(transitPlanet: string, aspectType: string, targetPlanet: string): string {
  return `Harmonious activation between transiting ${transitPlanet} and natal ${targetPlanet} enhances mutual ease, empathy, and intuitive flow.`;
}

function synthesizePressureDescription(transitPlanet: string, aspectType: string, targetPlanet: string): string {
  return `Tension between transiting ${transitPlanet} and natal ${targetPlanet} tests patience. Emotional defenses are heightened; maintain gentle boundaries.`;
}

/**
 * Partitions transit aspects into Power vs Pressure and returns the top 1-3 cards for each.
 * Guarantees at least 1 Power and 1 Pressure card even on quiet transit days.
 */
export function partitionPowerPressure(transits: TransitAspect[]): PowerPressureResult {
  const powerItems: TransitCardItem[] = [];
  const pressureItems: TransitCardItem[] = [];

  for (const t of transits) {
    const key = `${t.transitPlanet}_${t.aspectType}_${t.targetPlanet}`;
    const title = formatAspectTitle(t.transitPlanet, t.aspectType, t.targetPlanet);

    if (t.nature === 'harmonious') {
      const description = POWER_INTERPRETATIONS[key] || synthesizePowerDescription(t.transitPlanet, t.aspectType, t.targetPlanet);
      if (!powerItems.some(item => item.title === title)) {
        powerItems.push({ title, description });
      }
    } else if (t.nature === 'frictional') {
      const description = PRESSURE_INTERPRETATIONS[key] || synthesizePressureDescription(t.transitPlanet, t.aspectType, t.targetPlanet);
      if (!pressureItems.some(item => item.title === title)) {
        pressureItems.push({ title, description });
      }
    }
  }

  // Fallbacks if sky is unusually neutral: ensure UI never renders empty state
  if (powerItems.length === 0) {
    powerItems.push({
      title: 'Solar Harmonic Baseline',
      description: 'The sky offers neutral ground today. Steady, unprovoked baseline harmony supports routine bonding.',
    });
  }

  if (pressureItems.length === 0) {
    pressureItems.push({
      title: 'Subtle Atmospheric Friction',
      description: 'No major planetary pressure points active today. Watch out only for self-generated overthinking.',
    });
  }

  // Return top 3 Power and top 3 Pressure items
  return {
    power: powerItems.slice(0, 3),
    pressure: pressureItems.slice(0, 3),
  };
}
