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
  name: string; // 'Sun' | 'Moon' | 'Mercury' | ...
  sign: string;
  degree: number; // 0-29.99
  longitude: number; // 0-359.99
  house?: number;
  isRetrograde?: boolean;
  lowConfidence?: boolean;
}

export interface NatalChart {
  birthData: BirthData;
  planets: NatalPlanet[];
  ascendant?: NatalPlanet;
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

export interface SafetyCheckResult {
  isSafe: boolean;
  violations: string[];
  sanitizedText: string;
}

export interface PricingPlan {
  id: 'single' | 'monthly' | 'annual' | 'free';
  name: string;
  price: number;
  interval?: 'month' | 'year';
  description: string;
}

export interface FunnelEvent {
  eventName: 'visit' | 'inputs_entered' | 'result_viewed' | 'paywall_viewed' | 'checkout_started' | 'purchase';
  visitorId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ErosPrompt {
  id: string;
  category: 'intimacy' | 'conflict_repair' | 'void_note';
  prompt: string;
  guidance: string;
}

export interface ChaosCapsule {
  id: string;
  senderEmail: string;
  recipientEmail?: string;
  message: string;
  targetTransit: string;
  createdAt: string;
  unlockedAt?: string;
  isUnlocked: boolean;
}
