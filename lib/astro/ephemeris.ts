import * as Astronomy from 'astronomy-engine';
import { BirthData, NatalPlanet, NatalChart } from './types';
import { longitudeToZodiac } from './zodiac';
import { calculateAscendant, calculateHouseCusps, assignHousesToPlanets } from './houses';

const PLANET_BODIES: Array<{ name: string; body: Astronomy.Body }> = [
  { name: 'Sun', body: Astronomy.Body.Sun },
  { name: 'Moon', body: Astronomy.Body.Moon },
  { name: 'Mercury', body: Astronomy.Body.Mercury },
  { name: 'Venus', body: Astronomy.Body.Venus },
  { name: 'Mars', body: Astronomy.Body.Mars },
  { name: 'Jupiter', body: Astronomy.Body.Jupiter },
  { name: 'Saturn', body: Astronomy.Body.Saturn },
  { name: 'Uranus', body: Astronomy.Body.Uranus },
  { name: 'Neptune', body: Astronomy.Body.Neptune },
  { name: 'Pluto', body: Astronomy.Body.Pluto },
];

/**
 * Parses BirthData into an exact UTC Date object.
 */
export function parseBirthDateTime(birthData: BirthData): { date: Date; timeProvided: boolean } {
  const dateStr = birthData.birthDate || '2000-01-01';
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error(`Invalid birthDate format: ${birthData.birthDate}. Expected YYYY-MM-DD.`);
  }

  let hours = 12;
  let minutes = 0;
  let timeProvided = false;

  if (birthData.birthTime && birthData.birthTime.includes(':')) {
    const [h, m] = birthData.birthTime.split(':').map((s) => parseInt(s, 10));
    if (!isNaN(h) && !isNaN(m)) {
      hours = h;
      minutes = m;
      timeProvided = true;
    }
  }

  let date: Date;
  if (timeProvided && birthData.longitude !== undefined) {
    // Local mean solar time adjustment to UTC
    const offsetHours = birthData.longitude / 15.0;
    const utcMs = Date.UTC(year, month, day, hours, minutes, 0) - offsetHours * 3600000;
    date = new Date(utcMs);
  } else {
    date = new Date(Date.UTC(year, month, day, hours, minutes, 0));
  }

  return { date, timeProvided };
}

/**
 * Calculates raw geocentric ecliptic longitude for any supported body.
 */
export function calculateBodyLongitude(body: Astronomy.Body, time: Astronomy.AstroTime): number {
  if (body === Astronomy.Body.Sun) {
    return Astronomy.SunPosition(time).elon;
  }
  if (body === Astronomy.Body.Moon) {
    return Astronomy.EclipticGeoMoon(time).lon;
  }
  const geoVec = Astronomy.GeoVector(body, time, true);
  const ecl = Astronomy.Ecliptic(geoVec);
  return ecl.elon;
}

/**
 * Central-difference retrograde determination (±1 hour).
 */
export function calculateIsRetrograde(body: Astronomy.Body, date: Date): boolean {
  if (body === Astronomy.Body.Sun || body === Astronomy.Body.Moon) {
    return false;
  }
  const t0 = Astronomy.MakeTime(new Date(date.getTime() - 3600000));
  const t1 = Astronomy.MakeTime(new Date(date.getTime() + 3600000));
  const lon0 = calculateBodyLongitude(body, t0);
  const lon1 = calculateBodyLongitude(body, t1);

  let diff = lon1 - lon0;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;

  return diff < 0;
}

/**
 * Calculates True and Mean Lunar Nodes (Rahu) and South Node (Ketu).
 */
export function calculateLunarNodes(date: Date): {
  trueNode: number;
  meanNode: number;
  southNode: number;
} {
  const time = Astronomy.MakeTime(date);
  const T = time.tt / 36525.0; // Julian centuries from J2000.0

  // Mean Ascending Node (Meeus AA Ch 47)
  let omega = 125.044522 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  omega = ((omega % 360) + 360) % 360;

  // Periodic perturbations for True Node
  const d2r = Math.PI / 180;
  const D = (297.85036 + 445267.11148 * T - 0.0019142 * T * T + (T * T * T) / 189474) * d2r;
  const M = (357.52772 + 35999.05034 * T - 0.0001603 * T * T - (T * T * T) / 300000) * d2r;
  const Mprime = (134.96298 + 477198.867398 * T + 0.0086972 * T * T + (T * T * T) / 56250) * d2r;
  const F = (93.27191 + 483202.017538 * T - 0.0036825 * T * T + (T * T * T) / 327270) * d2r;

  const deltaOmega =
    -1.4979 * Math.sin(2 * (F - D)) -
    0.15 * Math.sin(M) -
    0.1226 * Math.sin(2 * F) +
    0.1176 * Math.sin(2 * D) -
    0.0801 * Math.sin(2 * (F - D) + Mprime);

  const trueNode = ((omega + deltaOmega) % 360 + 360) % 360;
  const southNode = (trueNode + 180) % 360;

  return { trueNode, meanNode: omega, southNode };
}

/**
 * Calculates planetary positions for an arbitrary date (used for charts and transits).
 */
export function calculateNatalPlanets(date: Date, timeProvided: boolean = true): NatalPlanet[] {
  const time = Astronomy.MakeTime(date);
  const planets: NatalPlanet[] = [];

  for (const item of PLANET_BODIES) {
    const rawLon = calculateBodyLongitude(item.body, time);
    const zodiac = longitudeToZodiac(rawLon);
    const isRetrograde = calculateIsRetrograde(item.body, date);

    let lowConfidence = false;
    if (item.name === 'Moon' && !timeProvided) {
      const degInSign = rawLon % 30;
      if (degInSign < 6.5 || degInSign > 23.5) {
        lowConfidence = true;
      }
    }

    planets.push({
      name: item.name,
      sign: zodiac.sign,
      degree: zodiac.degree,
      longitude: zodiac.longitude,
      isRetrograde,
      ...(lowConfidence ? { lowConfidence: true } : {}),
    });
  }

  const { trueNode, southNode } = calculateLunarNodes(date);
  const northZodiac = longitudeToZodiac(trueNode);
  const southZodiac = longitudeToZodiac(southNode);

  planets.push({
    name: 'North Node',
    sign: northZodiac.sign,
    degree: northZodiac.degree,
    longitude: northZodiac.longitude,
    isRetrograde: true,
  });

  planets.push({
    name: 'South Node',
    sign: southZodiac.sign,
    degree: southZodiac.degree,
    longitude: southZodiac.longitude,
    isRetrograde: true,
  });

  return planets;
}

/**
 * Computes full NatalChart adhering to interface contract and confidence degradation rules.
 */
export function computeNatalChart(birthData: BirthData): NatalChart {
  const { date, timeProvided } = parseBirthDateTime(birthData);
  const planets = calculateNatalPlanets(date, timeProvided);

  const hasCoordinates = birthData.latitude !== undefined && birthData.longitude !== undefined;
  const isHighConfidence = timeProvided && hasCoordinates;
  const overallLowConfidence = !isHighConfidence;

  let ascendant: NatalPlanet | undefined;
  let houseCusps: number[] | undefined;

  if (hasCoordinates) {
    ascendant = calculateAscendant(date, birthData.latitude!, birthData.longitude!);
    houseCusps = calculateHouseCusps(date, birthData.latitude!, birthData.longitude!);

    if (!timeProvided && ascendant) {
      ascendant.lowConfidence = true;
    }

    // Assign houses if high confidence, or omit definitive claims if low confidence
    if (timeProvided && houseCusps) {
      assignHousesToPlanets(planets, ascendant, houseCusps);
    }
  }

  return {
    birthData,
    planets,
    ascendant: !timeProvided ? undefined : ascendant,
    houseCusps: timeProvided ? houseCusps : undefined,
    lowConfidence: overallLowConfidence,
  };
}
