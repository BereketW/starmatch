import { describe, it, expect } from 'vitest';
import { longitudeToZodiac, normalizeLongitude, zodiacToLongitude, getSignDetails, calculateAngularDistance } from '@/lib/astro/zodiac';

describe('Zodiac Utilities', () => {
  it('normalizes out-of-bounds angles correctly', () => {
    expect(normalizeLongitude(365)).toBe(5);
    expect(normalizeLongitude(-10)).toBe(350);
    expect(normalizeLongitude(720)).toBe(0);
  });

  it('calculates angular distance correctly across 0/360 boundary', () => {
    expect(calculateAngularDistance(10, 20)).toBe(10);
    expect(calculateAngularDistance(355, 5)).toBe(10);
    expect(calculateAngularDistance(0, 180)).toBe(180);
    expect(calculateAngularDistance(10, 200)).toBe(170);
  });

  it('maps boundary longitudes to exact Zodiac signs and degrees', () => {
    // 0° is Aries 0.00°
    const aries = longitudeToZodiac(0);
    expect(aries.sign).toBe('Aries');
    expect(aries.degree).toBe(0);

    // 29.99° is Aries 29.99°
    const ariesEnd = longitudeToZodiac(29.99);
    expect(ariesEnd.sign).toBe('Aries');
    expect(ariesEnd.degree).toBe(29.99);

    // 30° is Taurus 0.00°
    const taurus = longitudeToZodiac(30);
    expect(taurus.sign).toBe('Taurus');
    expect(taurus.degree).toBe(0);

    // 359.99° is Pisces 29.99°
    const pisces = longitudeToZodiac(359.99);
    expect(pisces.sign).toBe('Pisces');
    expect(pisces.degree).toBe(29.99);
  });

  it('converts sign and degree back to longitude', () => {
    expect(zodiacToLongitude('Aries', 15.5)).toBe(15.5);
    expect(zodiacToLongitude('Taurus', 10)).toBe(40);
    expect(zodiacToLongitude('Scorpio', 0)).toBe(210);
  });

  it('returns correct elements, modalities, and rulers', () => {
    const scorpio = getSignDetails('Scorpio');
    expect(scorpio.element).toBe('Water');
    expect(scorpio.modality).toBe('Fixed');
    expect(scorpio.modernRuler).toBe('Pluto');
    expect(scorpio.traditionalRuler).toBe('Mars');

    const gemini = getSignDetails('Gemini');
    expect(gemini.element).toBe('Air');
    expect(gemini.modality).toBe('Mutable');
    expect(gemini.modernRuler).toBe('Mercury');
  });
});
