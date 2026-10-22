export type { ZodiacSign } from './zodiac';

export interface BirthData {
  name?: string;
  birthDate?: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm
  latitude?: number;
  longitude?: number;
  city?: string;
  zodiacSign?: string; // For Quick Mode
}

export type RelationshipType =
  | 'romantic'
  | 'crush'
  | 'ex'
  | 'friend'
  | 'family'
  | 'coworker'
  | 'friendship'
  | 'business';

export interface NatalPlanet {
  name: string; // 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto' | 'North Node' | 'South Node' | 'Ascendant'
  sign: string;
  degree: number; // 0-29.99
  longitude: number; // 0-359.99
  house?: number; // 1-12 (omitted when birth time/coords missing)
  isRetrograde?: boolean;
  lowConfidence?: boolean;
}

export interface NatalChart {
  birthData: BirthData;
  planets: NatalPlanet[];
  ascendant?: NatalPlanet;
  midheaven?: NatalPlanet;
  houseCusps?: number[]; // Longitudes of 12 house cusps
  lowConfidence: boolean;
}

export interface SynastryAspect {
  planetA: string;
  planetB: string;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  angle: number;
  orb: number;
  weight: number;
  description: string;
}

export type CrossAspect = SynastryAspect;

export interface SynastryResult {
  personA: BirthData;
  personB: BirthData;
  relationshipType: RelationshipType;
  overallScore: number; // 0-100
  categories: {
    chemistry: number; // 0-100
    communication: number; // 0-100
    emotionalBond: number; // 0-100
    conflictStyle: number; // 0-100
    longTermPotential: number; // 0-100
  };
  scores?: {
    chemistry: number;
    communication: number;
    emotionalBond: number;
    conflictStyle: number;
    longTermPotential: number;
  };
  coStarBuckets: {
    basicIdentities: number; // 0-100
    howYouLove: number; // 0-100
    sexAndAggression: number; // 0-100
    moodsAndEmotions: number; // 0-100
    philosophy: number; // 0-100
    responsibility: number; // 0-100
    imagination: number; // 0-100
  };
  aspects: SynastryAspect[];
  strongestAspect: SynastryAspect;
  transits: {
    power: Array<{ title: string; description: string }>;
    pressure: Array<{ title: string; description: string }>;
  };
  dailyDoDont: {
    doAction: string;
    dontAction: string;
    headline: string;
  };
  isQuickMode: boolean;
  lowConfidence: boolean;
}
