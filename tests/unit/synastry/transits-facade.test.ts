import { describe, it, expect } from 'vitest';
import { computeSynastry } from '@/lib/synastry/engine';
import { BirthData } from '@/lib/astro/types';
import { generateDailyDoDont } from '@/lib/synastry/dodont';
import { TransitAspect } from '@/lib/astro/transits';

describe('Synastry & Transits Facade Engine', () => {
  const pA: BirthData = {
    name: 'Alex',
    birthDate: '1995-12-17',
    birthTime: '08:30',
    latitude: 40.7128,
    longitude: -74.006,
  };

  const pB: BirthData = {
    name: 'Jordan',
    birthDate: '1997-04-20',
    birthTime: '14:15',
    latitude: 34.0522,
    longitude: -118.2437,
  };

  const testDate = '2026-10-22T00:00:00.000Z';

  it('produces 100% deterministic results given identical inputs and fixed date', () => {
    const res1 = computeSynastry(pA, pB, 'romantic', { currentDate: testDate });
    const res2 = computeSynastry(pA, pB, 'romantic', { currentDate: testDate });

    expect(res1).toEqual(res2);
    expect(res1.overallScore).toBe(res2.overallScore);
    expect(res1.categories).toEqual(res2.categories);
    expect(res1.coStarBuckets).toEqual(res2.coStarBuckets);
    expect(res1.dailyDoDont).toEqual(res2.dailyDoDont);
  });

  it('produces distinct aspects and distinct scores for two different birth pairs', () => {
    const pC: BirthData = {
      name: 'Morgan',
      birthDate: '1988-08-08',
      birthTime: '04:00',
      latitude: 51.5074,
      longitude: -0.1278,
    };

    const resAB = computeSynastry(pA, pB, 'romantic', { currentDate: testDate });
    const resAC = computeSynastry(pA, pC, 'romantic', { currentDate: testDate });

    expect(resAB.overallScore).not.toBe(resAC.overallScore);
    expect(resAB.categories).not.toEqual(resAC.categories);
    expect(resAB.aspects).not.toEqual(resAC.aspects);
  });

  it('flags lowConfidence: true when birthTime or coordinates are omitted', () => {
    const pANoTime: BirthData = { birthDate: '1995-12-17' };
    const pBNoTime: BirthData = { birthDate: '1997-04-20' };

    const resNoTime = computeSynastry(pANoTime, pBNoTime, 'romantic');
    expect(resNoTime.lowConfidence).toBe(true);

    const resWithTime = computeSynastry(pA, pB, 'romantic');
    expect(resWithTime.lowConfidence).toBe(false);
  });

  it('clamps all scores to [0, 100]', () => {
    const res = computeSynastry(pA, pB, 'romantic', { currentDate: testDate });

    expect(res.overallScore).toBeGreaterThanOrEqual(0);
    expect(res.overallScore).toBeLessThanOrEqual(100);

    Object.values(res.categories).forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(Number.isInteger(score)).toBe(true);
    });

    Object.values(res.coStarBuckets).forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(Number.isInteger(score)).toBe(true);
    });
  });

  it('correctly partitions transits into Power and Pressure items', () => {
    const res = computeSynastry(pA, pB, 'romantic', { currentDate: testDate });

    expect(Array.isArray(res.transits.power)).toBe(true);
    expect(Array.isArray(res.transits.pressure)).toBe(true);
    expect(res.transits.power.length).toBeGreaterThan(0);
    expect(res.transits.pressure.length).toBeGreaterThan(0);

    expect(res.transits.power[0]).toHaveProperty('title');
    expect(res.transits.power[0]).toHaveProperty('description');
    expect(res.transits.pressure[0]).toHaveProperty('title');
    expect(res.transits.pressure[0]).toHaveProperty('description');
  });

  it('generates non-empty daily Do & Don’t for Us matching specifications', () => {
    const res = computeSynastry(pA, pB, 'romantic', { currentDate: testDate });

    expect(res.dailyDoDont.headline).toBeTruthy();
    expect(res.dailyDoDont.doAction).toBeTruthy();
    expect(res.dailyDoDont.dontAction).toBeTruthy();
  });

  it('triggers specific mandatory SRS Do/Don’t rules based on active dominant transits', () => {
    const mockTransit1: TransitAspect = {
      transitPlanet: 'Moon',
      targetPerson: 'personA',
      targetPlanet: 'Mars',
      aspectType: 'square',
      angle: 90,
      orb: 0.5,
      nature: 'frictional',
      significance: 0.9,
    };

    const doDont1 = generateDailyDoDont([mockTransit1]);
    expect(doDont1.headline).toBe('Short Fuses & Impulsive Spikes');
    expect(doDont1.doAction).toContain('2 hours of complete silence');

    const mockTransit2: TransitAspect = {
      transitPlanet: 'Sun',
      targetPerson: 'personB',
      targetPlanet: 'Jupiter',
      aspectType: 'trine',
      angle: 120,
      orb: 0.2,
      nature: 'harmonious',
      significance: 0.95,
    };

    const doDont2 = generateDailyDoDont([mockTransit2]);
    expect(doDont2.headline).toBe('Shared Horizon & Big Energy');
    expect(doDont2.doAction).toContain('Plan a future weekend trip');
  });

  it('seamlessly supports Quick Mode when zodiac signs are provided without birth dates', () => {
    const qA: BirthData = { zodiacSign: 'Leo' };
    const qB: BirthData = { zodiacSign: 'Aries' };

    const res = computeSynastry(qA, qB, 'crush');
    expect(res.isQuickMode).toBe(true);
    expect(res.lowConfidence).toBe(true);
    expect(res.overallScore).toBeGreaterThan(0);
    expect(res.strongestAspect).toBeDefined();
  });
});
