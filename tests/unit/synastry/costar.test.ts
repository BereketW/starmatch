import { describe, it, expect } from 'vitest';
import {
  computeCoStarDimensions,
  getSignElement,
  getElementSynergyOffset,
  COSTAR_VERDICTS,
} from '@/lib/synastry/costar';
import { SynastryAspect } from '@/lib/synastry/aspects';

describe('Co-Star Psychological Dimensions', () => {
  it('correctly calculates element synergy offsets', () => {
    expect(getSignElement('Aries')).toBe('fire');
    expect(getSignElement('Leo')).toBe('fire');
    expect(getSignElement('Libra')).toBe('air');

    // Fire + Fire -> +10
    expect(getElementSynergyOffset('fire', 'fire')).toBe(10);
    // Fire + Air -> +6
    expect(getElementSynergyOffset('fire', 'air')).toBe(6);
    // Fire + Water -> -6
    expect(getElementSynergyOffset('fire', 'water')).toBe(-6);
  });

  it('computes 7 psychological dimensions with realistic verdicts', () => {
    const aspects: SynastryAspect[] = [
      {
        planetA: 'Sun',
        planetB: 'Sun',
        type: 'trine',
        angle: 120,
        orb: 1.0,
        weight: 0.9,
        description: 'Harmonic flow',
      },
    ];

    const result = computeCoStarDimensions(aspects, {
      sunSignA: 'Leo',
      sunSignB: 'Sagittarius',
      moonSignA: 'Cancer',
      moonSignB: 'Pisces',
      hasBirthTimeA: true,
      hasBirthTimeB: true,
    });

    expect(result.scores.basicIdentities).toBeGreaterThanOrEqual(60);
    expect(result.dimensions.basicIdentities.verdict).toBe(COSTAR_VERDICTS.basicIdentities.high);
    expect(result.dimensions.basicIdentities.lowConfidence).toBe(false);
  });

  it('marks lowConfidence when birth time is missing for relevant dimensions', () => {
    const result = computeCoStarDimensions([], {
      sunSignA: 'Aries',
      sunSignB: 'Taurus',
      hasBirthTimeA: false,
      hasBirthTimeB: false,
    });

    expect(result.dimensions.basicIdentities.lowConfidence).toBe(true);
    expect(result.dimensions.moodsAndEmotions.lowConfidence).toBe(true);
    expect(result.dimensions.howYouLove.lowConfidence).toBe(false);
  });
});
