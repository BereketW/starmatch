import { describe, it, expect } from 'vitest';
import { computeNatalChart, calculateLunarNodes, calculateIsRetrograde } from '@/lib/astro/ephemeris';
import * as Astronomy from 'astronomy-engine';

describe('Ephemeris Engine', () => {
  it('is 100% deterministic: identical inputs yield identical positions', () => {
    const input = { birthDate: '1995-12-17', birthTime: '08:30', latitude: 40.7128, longitude: -74.006 };
    const chart1 = computeNatalChart(input);
    const chart2 = computeNatalChart(input);

    expect(chart1.planets).toEqual(chart2.planets);
    expect(chart1.ascendant).toEqual(chart2.ascendant);
    expect(chart1.lowConfidence).toBe(false);
  });

  it('computes known J2000 epoch positions accurately', () => {
    const chart = computeNatalChart({ birthDate: '2000-01-01', birthTime: '12:00', longitude: 0, latitude: 51.5 });
    const sun = chart.planets.find((p) => p.name === 'Sun')!;
    // J2000 Sun is at approx 280.37° (Capricorn ~10°)
    expect(sun.sign).toBe('Capricorn');
    expect(sun.longitude).toBeCloseTo(280.37, 1);

    const moon = chart.planets.find((p) => p.name === 'Moon')!;
    // J2000 Moon is at approx 223.32° (Scorpio ~13°)
    expect(moon.sign).toBe('Scorpio');
    expect(moon.longitude).toBeCloseTo(223.32, 1);
  });

  it('accurately identifies retrograde planetary motion', () => {
    // Mercury was known retrograde around 2024-04-10
    const retroDate = new Date('2024-04-10T12:00:00Z');
    const isRetro = calculateIsRetrograde(Astronomy.Body.Mercury, retroDate);
    expect(isRetro).toBe(true);

    // Direct around 2024-05-15
    const directDate = new Date('2024-05-15T12:00:00Z');
    const isDirect = calculateIsRetrograde(Astronomy.Body.Mercury, directDate);
    expect(isDirect).toBe(false);

    // Sun is never retrograde
    expect(calculateIsRetrograde(Astronomy.Body.Sun, retroDate)).toBe(false);
  });

  it('computes true and mean lunar nodes with opposite south node', () => {
    const { trueNode, southNode } = calculateLunarNodes(new Date('2000-01-01T12:00:00Z'));
    expect(trueNode).toBeCloseTo(126.02, 1); // Leo ~6°
    expect(southNode).toBeCloseTo((trueNode + 180) % 360, 1); // Aquarius ~6°
  });
});
