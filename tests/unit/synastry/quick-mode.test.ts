import { describe, it, expect } from 'vitest';
import {
  computeQuickModeCompatibility,
  computeQuickModeSynastry,
  ZODIAC_SIGNS,
} from '@/lib/synastry/quick-mode';

describe('2-Sign Quick Mode', () => {
  it('is 100% deterministic for identical sign pairs', () => {
    const res1 = computeQuickModeCompatibility('Aries', 'Leo');
    const res2 = computeQuickModeCompatibility('Aries', 'Leo');
    expect(res1).toEqual(res2);
  });

  it('computes valid scores for all 144 sign combinations', () => {
    for (const signA of ZODIAC_SIGNS) {
      for (const signB of ZODIAC_SIGNS) {
        const res = computeQuickModeCompatibility(signA, signB);
        expect(res.overallScore).toBeGreaterThanOrEqual(0);
        expect(res.overallScore).toBeLessThanOrEqual(100);

        Object.values(res.categories).forEach((score) => {
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
        });

        Object.values(res.coStarBuckets).forEach((score) => {
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
        });
      }
    }
  });

  it('returns valid SynastryResult matching interface contract', () => {
    const fullRes = computeQuickModeSynastry('Gemini', 'Libra', 'friend');
    expect(fullRes.isQuickMode).toBe(true);
    expect(fullRes.lowConfidence).toBe(true);
    expect(fullRes.relationshipType).toBe('friend');
    expect(fullRes.transits.power.length).toBeGreaterThan(0);
    expect(fullRes.transits.pressure.length).toBeGreaterThan(0);
    expect(fullRes.dailyDoDont.headline).toBeTruthy();
  });
});
