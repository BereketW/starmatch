import { BirthData, RelationshipType } from '@/lib/astro/types';

export interface CompactPerson {
  n?: string;   // Name
  d?: string;   // Birth date YYYY-MM-DD
  t?: string;   // Birth time HH:mm
  c?: string;   // City
  lat?: number; // Latitude
  lng?: number; // Longitude
  s?: string;   // Zodiac sign (for quick mode)
}

export interface CompactPayload {
  v: 1;                 // Version
  m: 'f' | 'q';         // Mode: 'f' = full, 'q' = quick
  a: CompactPerson;
  b: CompactPerson;
  r: RelationshipType;
  ts?: number;          // Timestamp created
}

export interface DecodedMatch {
  personA: BirthData;
  personB: BirthData;
  relationshipType: RelationshipType;
  isQuickMode: boolean;
  createdAt?: number;
}

export interface RecentPair {
  id: string;
  matchId: string;
  nameA: string;
  nameB: string;
  personA: { name: string; birthDate?: string };
  personB: { name: string; birthDate?: string };
  signA?: string;
  signB?: string;
  score?: number;
  overallScore?: number;
  relationshipType: RelationshipType;
  updatedAt: number;
  savedAt: string;
}

export interface EncodeMatchOptions {
  personA: BirthData;
  personB: BirthData;
  relationshipType?: RelationshipType;
  isQuickMode?: boolean;
}

const RECENT_PAIRS_STORAGE_KEY = 'starmatch_recent_pairs';

/**
 * Base64url encode string (URL-safe, no +, /, or = padding)
 */
function toBase64Url(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  // Browser fallback
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Base64url decode string
 */
function fromBase64Url(base64url: string): string {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64, 'base64').toString('utf-8');
  }
  return decodeURIComponent(escape(atob(base64)));
}

function cleanPerson(p: BirthData): CompactPerson {
  const compact: CompactPerson = {};
  if (p.name && p.name.trim()) compact.n = p.name.trim().slice(0, 40);
  if (p.birthDate) compact.d = p.birthDate.trim();
  if (p.birthTime) compact.t = p.birthTime.trim();
  if (p.city) compact.c = p.city.trim().slice(0, 40);
  if (typeof p.latitude === 'number') compact.lat = Math.round(p.latitude * 10000) / 10000;
  if (typeof p.longitude === 'number') compact.lng = Math.round(p.longitude * 10000) / 10000;
  if (p.zodiacSign) compact.s = p.zodiacSign.trim();
  return compact;
}

function expandPerson(c: CompactPerson, defaultName: string): BirthData {
  return {
    name: c.n?.trim() || defaultName,
    birthDate: c.d,
    birthTime: c.t,
    city: c.c,
    latitude: c.lat,
    longitude: c.lng,
    zodiacSign: c.s,
  };
}

/**
 * Encodes two people and relationship type into a deterministic URL-safe match slug.
 * Always produces a URL-safe string starting with 'm_' and containing no '+', '/', or '='.
 */
export function encodeMatchId(
  personAOrOptions: BirthData | EncodeMatchOptions,
  maybePersonB?: BirthData,
  maybeRelationshipType: RelationshipType = 'romantic',
  maybeIsQuickMode?: boolean
): string {
  let personA: BirthData;
  let personB: BirthData;
  let relationshipType: RelationshipType = 'romantic';
  let isQuickMode: boolean | undefined;

  if ('personA' in personAOrOptions && 'personB' in personAOrOptions) {
    personA = personAOrOptions.personA;
    personB = personAOrOptions.personB;
    relationshipType = personAOrOptions.relationshipType || 'romantic';
    isQuickMode = personAOrOptions.isQuickMode;
  } else {
    personA = personAOrOptions as BirthData;
    personB = maybePersonB as BirthData;
    relationshipType = maybeRelationshipType;
    isQuickMode = maybeIsQuickMode;
  }

  const quick = Boolean(
    isQuickMode ||
    (!personA.birthDate && personA.zodiacSign) ||
    (!personB.birthDate && personB.zodiacSign)
  );

  const payload: CompactPayload = {
    v: 1,
    m: quick ? 'q' : 'f',
    a: cleanPerson(personA),
    b: cleanPerson(personB),
    r: relationshipType,
    ts: Date.now(),
  };

  const jsonStr = JSON.stringify(payload);
  return `m_${toBase64Url(jsonStr)}`;
}

/**
 * Decodes a match slug into personA, personB, and relationshipType.
 * Supports:
 * 1. Stateless base64url slug ('m_...')
 * 2. In-browser localStorage lookup for stored pair IDs (UUIDv4/ULID)
 */
export function decodeMatchId(id: string): DecodedMatch | null {
  if (!id || typeof id !== 'string') return null;

  // Case 1: Deterministic base64url encoded slug
  if (id.startsWith('m_')) {
    try {
      const b64 = id.slice(2);
      const jsonStr = fromBase64Url(b64);
      const payload = JSON.parse(jsonStr) as CompactPayload;

      if (!payload || !payload.a || !payload.b) {
        return null;
      }

      const relType: RelationshipType = payload.r || 'romantic';
      const isQuick = payload.m === 'q';

      return {
        personA: expandPerson(payload.a, 'You'),
        personB: expandPerson(payload.b, 'Them'),
        relationshipType: relType,
        isQuickMode: isQuick,
        createdAt: payload.ts,
      };
    } catch {
      return null;
    }
  }

  // Case 2: In-browser lookup for custom IDs / invite tokens from localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('starmatch_saved_matches');
      if (stored) {
        const matches = JSON.parse(stored);
        if (matches[id]) {
          const entry = matches[id];
          return {
            personA: entry.personA,
            personB: entry.personB,
            relationshipType: entry.relationshipType || 'romantic',
            isQuickMode: Boolean(entry.isQuickMode),
          };
        }
      }

      // Check recent pairs
      const recent = getRecentPairs();
      const found = recent.find((r) => r.id === id);
      if (found) {
        return {
          personA: { name: found.nameA, zodiacSign: found.signA },
          personB: { name: found.nameB, zodiacSign: found.signB },
          relationshipType: found.relationshipType,
          isQuickMode: Boolean(found.signA && found.signB),
        };
      }
    } catch {
      // Storage unavailable or parsing error
    }
  }

  // Case 3: Check if valid ULID/UUID (length >= 16) but not decoded
  return null;
}

/**
 * Checks if a string is a potentially valid match ID
 */
export function isValidMatchId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  if (id.startsWith('m_') && id.length > 5) {
    return decodeMatchId(id) !== null;
  }
  return /^[a-zA-Z0-9_-]{16,}$/.test(id);
}

const memoryStorage: Record<string, string> = {};

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof localStorage !== 'undefined') return localStorage;
  return {
    getItem: (key: string) => memoryStorage[key] ?? null,
    setItem: (key: string, val: string) => {
      memoryStorage[key] = val;
    },
    removeItem: (key: string) => {
      delete memoryStorage[key];
    },
  };
}

/**
 * Saves a pair to the client-side recent comparisons shelf in localStorage
 */
export function saveRecentPair(pair: RecentPair | {
  id?: string;
  matchId?: string;
  nameA?: string;
  nameB?: string;
  personA?: { name: string; birthDate?: string };
  personB?: { name: string; birthDate?: string };
  signA?: string;
  signB?: string;
  relationshipType: RelationshipType;
  overallScore?: number;
  score?: number;
  savedAt?: string;
  updatedAt?: number;
}): void {
  try {
    const storage = getStorage();
    if (!storage) return;

    const pId = 'id' in pair && pair.id ? pair.id : ('matchId' in pair && pair.matchId ? pair.matchId : 'temp');
    const pMatchId = 'matchId' in pair && pair.matchId ? pair.matchId : pId;
    const pNameA = 'nameA' in pair && pair.nameA ? pair.nameA : (pair.personA?.name || 'You');
    const pNameB = 'nameB' in pair && pair.nameB ? pair.nameB : (pair.personB?.name || 'Them');
    const pScore = 'score' in pair ? pair.score : ('overallScore' in pair ? pair.overallScore : undefined);
    const pSignA = 'signA' in pair ? pair.signA : undefined;
    const pSignB = 'signB' in pair ? pair.signB : undefined;

    const normalized: RecentPair = {
      id: pId,
      matchId: pMatchId,
      nameA: pNameA,
      nameB: pNameB,
      personA: pair.personA || { name: pNameA },
      personB: pair.personB || { name: pNameB },
      signA: pSignA,
      signB: pSignB,
      score: pScore,
      overallScore: pScore,
      relationshipType: pair.relationshipType,
      updatedAt: 'updatedAt' in pair && pair.updatedAt ? pair.updatedAt : Date.now(),
      savedAt: 'savedAt' in pair && pair.savedAt ? pair.savedAt : new Date().toISOString(),
    };

    const existing = getRecentPairs();
    const filtered = existing.filter((p) => p.id !== normalized.id && p.matchId !== normalized.matchId);
    const updated = [normalized, ...filtered].slice(0, 10); // Keep max 10
    storage.setItem(RECENT_PAIRS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // LocalStorage quota or privacy error
  }
}

/**
 * Retrieves the client-side recent comparisons from localStorage
 */
export function getRecentPairs(): RecentPair[] {
  try {
    const storage = getStorage();
    if (!storage) return [];

    const raw = storage.getItem(RECENT_PAIRS_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as RecentPair[];
    return list.map((item) => {
      const nA = item.nameA || item.personA?.name || 'You';
      const nB = item.nameB || item.personB?.name || 'Them';
      return {
        ...item,
        id: item.id || item.matchId || '',
        matchId: item.matchId || item.id || '',
        nameA: nA,
        nameB: nB,
        personA: item.personA || { name: nA },
        personB: item.personB || { name: nB },
        overallScore: item.overallScore ?? item.score,
        savedAt: item.savedAt || new Date(item.updatedAt || Date.now()).toISOString(),
      };
    });
  } catch {
    return [];
  }
}

/**
 * Clears the client-side recent comparisons shelf
 */
export function clearRecentPairs(): void {
  try {
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(RECENT_PAIRS_STORAGE_KEY);
  } catch {
    // Ignore
  }
}
