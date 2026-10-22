import { describe, it, expect } from 'vitest';
import {
  calculateAngularDistance,
  calculateOrbWeight,
  computeAspects,
  getAspectDescription,
} from '@/lib/synastry/aspects';

describe('Synastry Aspects', () => {
  it('calculates angular distance correctly', () => {
    expect(calculateAngularDistance(45.0, 45.0)).toBe(0.0);
    expect(calculateAngularDistance(358.0, 2.0)).toBe(4.0);
    expect(calculateAngularDistance(10.0, 190.0)).toBe(180.0);
  });

  it('computes non-linear orb weight curve bounded in [0, 1]', () => {
    // Exact aspect -> weight 1.0
    expect(calculateOrbWeight(0.0, 8.0)).toBe(1.0);

    // Boundary aspect -> weight 0.0
    expect(calculateOrbWeight(8.0, 8.0)).toBe(0.0);
    expect(calculateOrbWeight(8.5, 8.0)).toBe(0.0);

    // Intermediate deviation: dev=2.5, maxOrb=7.0 -> ratio ~0.3571, weight ~0.7077
    const w = calculateOrbWeight(2.5, 7.0);
    expect(w).toBeGreaterThan(0.65);
    expect(w).toBeLessThan(0.75);
  });

  it('detects aspects with appropriate luminary orbs', () => {
    // Sun at 0°, Moon at 7° -> conjunction within 8° luminary orb
    const planetsA = [{ name: 'Sun', longitude: 0 }];
    const planetsB = [{ name: 'Moon', longitude: 7 }];

    const { aspects, strongestAspect } = computeAspects(planetsA, planetsB);
    expect(aspects.length).toBe(1);
    expect(aspects[0].type).toBe('conjunction');
    expect(aspects[0].planetA).toBe('Sun');
    expect(aspects[0].planetB).toBe('Moon');
    expect(aspects[0].orb).toBe(7);
    expect(strongestAspect.type).toBe('conjunction');
  });

  it('uses major planet orb limits for non-luminaries', () => {
    // Mars at 0°, Venus at 7° -> beyond major orb of 6° for conjunction
    const planetsA = [{ name: 'Mars', longitude: 0 }];
    const planetsB = [{ name: 'Venus', longitude: 7 }];

    const { aspects } = computeAspects(planetsA, planetsB);
    expect(aspects.length).toBe(0);

    // Mars at 0°, Venus at 5° -> within major orb of 6°
    const { aspects: withinOrb } = computeAspects(planetsA, [{ name: 'Venus', longitude: 5 }]);
    expect(withinOrb.length).toBe(1);
    expect(withinOrb[0].type).toBe('conjunction');
  });

  it('generates rich aspect descriptions', () => {
    const descMarsVenus = getAspectDescription('Venus', 'conjunction', 'Mars');
    expect(descMarsVenus).toContain('physical spark');

    const descSunMoon = getAspectDescription('Sun', 'trine', 'Moon');
    expect(descSunMoon).toContain('harmony');
  });
});
