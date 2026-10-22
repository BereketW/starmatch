import { NatalPlanet } from './types';
import { longitudeToZodiac } from './zodiac';

/**
 * Calculates GMST, LST, and True Obliquity.
 */
export function calculateSiderealParams(date: Date, longitude: number): {
  lst: number;
  eps: number;
} {
  const ms = date.getTime();
  const jd = ms / 86400000.0 + 2440587.5;
  const T = (jd - 2451545.0) / 36525.0;

  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000.0;
  gmst = ((gmst % 360) + 360) % 360;

  const lst = ((gmst + longitude) % 360 + 360) % 360;
  const eps = 23.4392911 - 0.0130042 * T;

  return { lst, eps };
}

/**
 * Computes exact Ascendant as a NatalPlanet object.
 */
export function calculateAscendant(date: Date, latitude: number, longitude: number): NatalPlanet {
  const { lst, eps } = calculateSiderealParams(date, longitude);

  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;
  const lstRad = lst * toRad;
  const epsRad = eps * toRad;
  const latRad = latitude * toRad;

  const y = Math.cos(lstRad);
  const x = -Math.sin(lstRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);

  let ascDeg = Math.atan2(y, x) * toDeg;
  ascDeg = ((ascDeg % 360) + 360) % 360;

  const zodiac = longitudeToZodiac(ascDeg);

  return {
    name: 'Ascendant',
    sign: zodiac.sign,
    degree: zodiac.degree,
    longitude: zodiac.longitude,
    house: 1,
  };
}

/**
 * Computes 12 house cusps (Equal House default).
 */
export function calculateHouseCusps(
  date: Date,
  latitude: number,
  longitude: number,
  system: 'equal' | 'wholesign' = 'equal'
): number[] {
  const asc = calculateAscendant(date, latitude, longitude);
  const cusps: number[] = [];

  if (system === 'wholesign') {
    const signStart = Math.floor(asc.longitude / 30) * 30;
    for (let i = 0; i < 12; i++) {
      cusps.push((signStart + i * 30) % 360);
    }
  } else {
    // Equal House
    for (let i = 0; i < 12; i++) {
      cusps.push((asc.longitude + i * 30) % 360);
    }
  }

  return cusps;
}

/**
 * Assigns house numbers (1-12) to planets using house cusps.
 */
export function assignHousesToPlanets(
  planets: NatalPlanet[],
  ascendant?: NatalPlanet,
  cusps?: number[]
): void {
  if (!ascendant || !cusps || cusps.length !== 12) return;

  for (const planet of planets) {
    if (planet.name === 'Ascendant') {
      planet.house = 1;
      continue;
    }

    // Equal House calculation relative to Ascendant
    const diff = ((planet.longitude - ascendant.longitude) % 360 + 360) % 360;
    const house = Math.floor(diff / 30) + 1;
    planet.house = house;
  }
}
