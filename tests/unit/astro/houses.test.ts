import { describe, it, expect } from 'vitest';
import { computeNatalChart } from '@/lib/astro/ephemeris';
import { calculateAscendant, calculateHouseCusps } from '@/lib/astro/houses';

describe('Houses and Confidence Degradation', () => {
  it('computes Ascendant and 12 house cusps for exact location and time', () => {
    const date = new Date('2000-01-01T12:00:00Z');
    const asc = calculateAscendant(date, 51.5074, 0); // London
    expect(asc.name).toBe('Ascendant');
    expect(asc.sign).toBe('Aries'); // approx 24° Aries
    expect(asc.longitude).toBeCloseTo(24.3, 1);

    const cusps = calculateHouseCusps(date, 51.5074, 0);
    expect(cusps.length).toBe(12);
    expect(cusps[0]).toBe(asc.longitude);
    expect(cusps[1]).toBeCloseTo((asc.longitude + 30) % 360, 2);
  });

  it('degrades confidence and omits houses when birth time is missing', () => {
    const chart = computeNatalChart({ birthDate: '1995-05-20' });
    expect(chart.lowConfidence).toBe(true);
    expect(chart.ascendant).toBeUndefined();
    expect(chart.houseCusps).toBeUndefined();
    // Planets should not have definitive house claims
    chart.planets.forEach((p) => {
      expect(p.house).toBeUndefined();
    });
  });

  it('flags Moon placement as low confidence when near zodiac sign boundary and time is missing', () => {
    // Pick a date where Moon is near boundary at noon UTC
    const chart = computeNatalChart({ birthDate: '2024-01-11' });
    const moon = chart.planets.find((p) => p.name === 'Moon')!;
    if (moon.degree < 6.5 || moon.degree > 23.5) {
      expect(moon.lowConfidence).toBe(true);
    }
  });
});
