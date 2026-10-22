import { describe, it, expect } from 'vitest';
import { computeCategoryScores, computeOverallScore } from '@/lib/synastry/scoring';
import { SynastryAspect } from '@/lib/synastry/aspects';

describe('SRS Category Scoring', () => {
  it('returns neutral baseline 50 when no aspects are present', () => {
    const categories = computeCategoryScores([]);
    expect(categories.chemistry).toBe(50);
    expect(categories.communication).toBe(50);
    expect(categories.emotionalBond).toBe(50);
    expect(categories.conflictStyle).toBe(50);
    expect(categories.longTermPotential).toBe(50);

    const overall = computeOverallScore(categories, 'romantic');
    expect(overall).toBe(50);
  });

  it('boosts chemistry for Venus-Mars conjunction', () => {
    const aspects: SynastryAspect[] = [
      {
        planetA: 'Venus',
        planetB: 'Mars',
        type: 'conjunction',
        angle: 0,
        orb: 0,
        weight: 1.0,
        description: 'Magnetic spark',
      },
    ];

    const categories = computeCategoryScores(aspects);
    expect(categories.chemistry).toBe(68); // 50 + 18
  });

  it('drops conflict style for Mars-Mars and Mars-Pluto squares', () => {
    const aspects: SynastryAspect[] = [
      {
        planetA: 'Mars',
        planetB: 'Mars',
        type: 'square',
        angle: 90,
        orb: 0,
        weight: 1.0,
        description: 'Aggressive clashes',
      },
      {
        planetA: 'Mars',
        planetB: 'Pluto',
        type: 'square',
        angle: 90,
        orb: 0,
        weight: 1.0,
        description: 'Power struggle',
      },
    ];

    const categories = computeCategoryScores(aspects);
    // 50 - 16 - 18 = 16
    expect(categories.conflictStyle).toBe(16);
    expect(categories.conflictStyle).toBeGreaterThanOrEqual(0);
  });

  it('clamps all scores strictly to [0, 100]', () => {
    const heavyFrictionAspects: SynastryAspect[] = [
      { planetA: 'Mars', planetB: 'Pluto', type: 'square', angle: 90, orb: 0, weight: 1.0, description: '' },
      { planetA: 'Mars', planetB: 'Saturn', type: 'square', angle: 90, orb: 0, weight: 1.0, description: '' },
      { planetA: 'Mars', planetB: 'Mars', type: 'square', angle: 90, orb: 0, weight: 1.0, description: '' },
      { planetA: 'Mars', planetB: 'Mercury', type: 'square', angle: 90, orb: 0, weight: 1.0, description: '' },
      { planetA: 'Sun', planetB: 'Mars', type: 'square', angle: 90, orb: 0, weight: 1.0, description: '' },
    ];

    const cat = computeCategoryScores(heavyFrictionAspects);
    expect(cat.conflictStyle).toBe(0); // clamped at 0
    expect(cat.conflictStyle).toBeGreaterThanOrEqual(0);
  });

  it('adjusts overall score according to relationship type weights', () => {
    const categories = {
      chemistry: 90,
      communication: 40,
      emotionalBond: 50,
      conflictStyle: 50,
      longTermPotential: 50,
    };

    const romanticScore = computeOverallScore(categories, 'romantic');
    const crushScore = computeOverallScore(categories, 'crush');
    const coworkerScore = computeOverallScore(categories, 'coworker');

    // Crush prioritizes chemistry higher (0.35) than romantic (0.20), coworker ignores chemistry (0.00)
    expect(crushScore).toBeGreaterThan(romanticScore);
    expect(romanticScore).toBeGreaterThan(coworkerScore);
  });
});
