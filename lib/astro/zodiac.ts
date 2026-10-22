export const ZODIAC_SIGNS = [
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
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export type Element = 'Fire' | 'Earth' | 'Air' | 'Water';
export type Modality = 'Cardinal' | 'Fixed' | 'Mutable';

export interface SignDetails {
  name: ZodiacSign;
  index: number;
  element: Element;
  modality: Modality;
  modernRuler: string;
  traditionalRuler: string;
  symbol: string;
}

export const SIGN_METADATA: Record<ZodiacSign, Omit<SignDetails, 'name' | 'index'>> = {
  Aries: { element: 'Fire', modality: 'Cardinal', modernRuler: 'Mars', traditionalRuler: 'Mars', symbol: '♈' },
  Taurus: { element: 'Earth', modality: 'Fixed', modernRuler: 'Venus', traditionalRuler: 'Venus', symbol: '♉' },
  Gemini: { element: 'Air', modality: 'Mutable', modernRuler: 'Mercury', traditionalRuler: 'Mercury', symbol: '♊' },
  Cancer: { element: 'Water', modality: 'Cardinal', modernRuler: 'Moon', traditionalRuler: 'Moon', symbol: '♋' },
  Leo: { element: 'Fire', modality: 'Fixed', modernRuler: 'Sun', traditionalRuler: 'Sun', symbol: '♌' },
  Virgo: { element: 'Earth', modality: 'Mutable', modernRuler: 'Mercury', traditionalRuler: 'Mercury', symbol: '♍' },
  Libra: { element: 'Air', modality: 'Cardinal', modernRuler: 'Venus', traditionalRuler: 'Venus', symbol: '♎' },
  Scorpio: { element: 'Water', modality: 'Fixed', modernRuler: 'Pluto', traditionalRuler: 'Mars', symbol: '♏' },
  Sagittarius: { element: 'Fire', modality: 'Mutable', modernRuler: 'Jupiter', traditionalRuler: 'Jupiter', symbol: '♐' },
  Capricorn: { element: 'Earth', modality: 'Cardinal', modernRuler: 'Saturn', traditionalRuler: 'Saturn', symbol: '♑' },
  Aquarius: { element: 'Air', modality: 'Fixed', modernRuler: 'Uranus', traditionalRuler: 'Saturn', symbol: '♒' },
  Pisces: { element: 'Water', modality: 'Mutable', modernRuler: 'Neptune', traditionalRuler: 'Jupiter', symbol: '♓' },
};

/**
 * Normalizes any angle to [0, 360)
 */
export function normalizeLongitude(lon: number): number {
  const mod = lon % 360;
  return mod < 0 ? mod + 360 : mod;
}

/**
 * Calculates the shortest angular distance between two ecliptic longitudes in degrees [0, 180].
 */
export function calculateAngularDistance(lon1: number, lon2: number): number {
  const diff = Math.abs(lon1 - lon2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Converts 0-360° longitude into Zodiac sign and degree (0 - 29.99°)
 */
export function longitudeToZodiac(longitude: number): {
  sign: ZodiacSign;
  degree: number;
  longitude: number;
} {
  const norm = normalizeLongitude(longitude);
  let signIndex = Math.floor(norm / 30);
  if (signIndex >= 12) signIndex = 0;

  const rawDeg = norm - signIndex * 30;
  // Format to 2 decimal places with strict 29.99 ceiling
  const degree = Math.min(29.99, Number(rawDeg.toFixed(2)));
  const formattedLon = Math.min(359.99, Number(norm.toFixed(2)));

  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree,
    longitude: formattedLon,
  };
}

/**
 * Converts Zodiac sign name and degree (0-29.99) back to absolute 0-360° longitude.
 */
export function zodiacToLongitude(sign: string, degree: number): number {
  const normalizedSign = sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase();
  const idx = ZODIAC_SIGNS.indexOf(normalizedSign as ZodiacSign);
  if (idx === -1) throw new Error(`Invalid zodiac sign: ${sign}`);
  return normalizeLongitude(idx * 30 + degree);
}

/**
 * Retrieves full metaphysical attributes for a sign.
 */
export function getSignDetails(sign: string): SignDetails {
  const normalizedSign = sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase() as ZodiacSign;
  const meta = SIGN_METADATA[normalizedSign];
  if (!meta) throw new Error(`Invalid zodiac sign: ${sign}`);
  const index = ZODIAC_SIGNS.indexOf(normalizedSign);
  return {
    name: normalizedSign,
    index,
    ...meta,
  };
}
