import { describe, it, expect, beforeEach } from 'vitest';
import {
  encodeMatchId,
  decodeMatchId,
  isValidMatchId,
  saveRecentPair,
  getRecentPairs,
  clearRecentPairs,
} from '@/lib/synastry/match-id';
import { computeSynastry } from '@/lib/synastry/engine';
import { composeFullReport, getOneSharpTruth } from '@/lib/report/composer';
import { POPULAR_CITIES, searchCities, findCityByName } from '@/lib/astro/cities';
import { getTierInfo } from '@/components/match/ScoreGauge';
import type { BirthData } from '@/lib/astro/types';

describe('Milestone 3: UI & Editorial Foundation Tests', () => {
  const alice: BirthData = {
    name: 'Alice',
    birthDate: '1992-04-12',
    birthTime: '14:30',
    latitude: 40.7128,
    longitude: -74.006,
    city: 'New York',
  };

  const bob: BirthData = {
    name: 'Bob',
    birthDate: '1990-11-23',
    birthTime: '08:15',
    latitude: 34.0522,
    longitude: -118.2437,
    city: 'Los Angeles',
  };

  describe('URL Codec: encodeMatchId & decodeMatchId', () => {
    it('encodes and decodes full birth data correctly', () => {
      const matchId = encodeMatchId(alice, bob, 'romantic');
      expect(typeof matchId).toBe('string');
      expect(matchId.length).toBeGreaterThan(10);
      expect(isValidMatchId(matchId)).toBe(true);

      const decoded = decodeMatchId(matchId);
      expect(decoded).not.toBeNull();
      expect(decoded?.personA.name).toBe('Alice');
      expect(decoded?.personA.birthDate).toBe('1992-04-12');
      expect(decoded?.personA.latitude).toBeCloseTo(40.7128);
      expect(decoded?.personB.name).toBe('Bob');
      expect(decoded?.personB.birthDate).toBe('1990-11-23');
      expect(decoded?.relationshipType).toBe('romantic');
    });

    it('supports options object overload in encodeMatchId', () => {
      const matchId = encodeMatchId({
        personA: alice,
        personB: bob,
        relationshipType: 'romantic',
      });
      const decoded = decodeMatchId(matchId);
      expect(decoded).not.toBeNull();
      expect(decoded?.relationshipType).toBe('romantic');
    });

    it('encodes and decodes quick sign mode correctly', () => {
      const quickA: BirthData = {
        name: 'Aries Person',
        zodiacSign: 'Aries',
      };
      const quickB: BirthData = {
        name: 'Leo Person',
        zodiacSign: 'Leo',
      };

      const matchId = encodeMatchId(quickA, quickB, 'friendship');
      expect(isValidMatchId(matchId)).toBe(true);

      const decoded = decodeMatchId(matchId);
      expect(decoded).not.toBeNull();
      expect(decoded?.personA.zodiacSign).toBe('Aries');
      expect(decoded?.personB.zodiacSign).toBe('Leo');
      expect(decoded?.relationshipType).toBe('friendship');
      expect(decoded?.isQuickMode).toBe(true);
    });

    it('encodes and decodes quick mode without birth dates matching CompatibilityForm payload', () => {
      const matchId = encodeMatchId({
        personA: { name: 'You', zodiacSign: 'Aries' },
        personB: { name: 'Them', zodiacSign: 'Leo' },
        relationshipType: 'romantic',
        isQuickMode: true,
      });

      expect(isValidMatchId(matchId)).toBe(true);
      const decoded = decodeMatchId(matchId);
      expect(decoded).not.toBeNull();
      expect(decoded?.isQuickMode).toBe(true);
      expect(decoded?.personA.birthDate).toBeUndefined();
      expect(decoded?.personB.birthDate).toBeUndefined();
      expect(decoded?.personA.zodiacSign).toBe('Aries');
      expect(decoded?.personB.zodiacSign).toBe('Leo');

      const synastry = computeSynastry(decoded!.personA, decoded!.personB, {
        relationshipType: decoded!.relationshipType,
      });
      expect(synastry.isQuickMode).toBe(true);
      expect(synastry.personA.name).toBe('You');
      expect(synastry.personB.name).toBe('Them');
      expect(synastry.overallScore).toBeGreaterThan(0);
      expect(synastry.strongestAspect).toBeDefined();
    });

    it('returns null and false on corrupted or malformed match IDs', () => {
      expect(isValidMatchId('')).toBe(false);
      expect(isValidMatchId('not-valid-base64-!@#$%^')).toBe(false);
      expect(decodeMatchId('gibberish123')).toBeNull();
      expect(decodeMatchId('')).toBeNull();
    });
  });

  describe('Recent Pairs Storage Shelf', () => {
    beforeEach(() => {
      clearRecentPairs();
    });

    it('saves, retrieves, and clears recent pairs', () => {
      const pair1 = {
        id: 'pair-1',
        personA: { name: 'Alice', birthDate: '1992-04-12' },
        personB: { name: 'Bob', birthDate: '1990-11-23' },
        relationshipType: 'romantic' as const,
        overallScore: 82,
        savedAt: new Date('2026-04-17T12:00:00Z').toISOString(),
      };

      saveRecentPair(pair1);
      const pairs = getRecentPairs();
      expect(pairs.length).toBe(1);
      expect(pairs[0].id).toBe('pair-1');
      expect(pairs[0].overallScore).toBe(82);

      clearRecentPairs();
      expect(getRecentPairs()).toEqual([]);
    });

    it('deduplicates recent pairs by id and puts newest first', () => {
      const pair1 = {
        id: 'same-pair',
        personA: { name: 'Alice' },
        personB: { name: 'Bob' },
        relationshipType: 'romantic' as const,
        overallScore: 75,
      };

      const pair1Updated = {
        id: 'same-pair',
        personA: { name: 'Alice' },
        personB: { name: 'Bob' },
        relationshipType: 'romantic' as const,
        overallScore: 88,
      };

      saveRecentPair(pair1);
      saveRecentPair(pair1Updated);

      const pairs = getRecentPairs();
      expect(pairs.length).toBe(1);
      expect(pairs[0].overallScore).toBe(88);
    });

    it('stores and retrieves quick mode pairs with signA and signB', () => {
      saveRecentPair({
        matchId: 'm_quick_test',
        nameA: 'You',
        nameB: 'Them',
        signA: 'Aries',
        signB: 'Leo',
        relationshipType: 'romantic',
        savedAt: new Date('2026-04-17T12:00:00Z').toISOString(),
      });

      const pairs = getRecentPairs();
      expect(pairs.length).toBe(1);
      expect(pairs[0].signA).toBe('Aries');
      expect(pairs[0].signB).toBe('Leo');
      expect(pairs[0].matchId).toBe('m_quick_test');
    });
  });

  describe('Cities Database & Search', () => {
    it('contains popular cities with valid latitudes and longitudes', () => {
      expect(POPULAR_CITIES.length).toBeGreaterThan(20);
      for (const city of POPULAR_CITIES) {
        expect(city.name).toBeDefined();
        expect(city.latitude).toBeGreaterThanOrEqual(-90);
        expect(city.latitude).toBeLessThanOrEqual(90);
        expect(city.longitude).toBeGreaterThanOrEqual(-180);
        expect(city.longitude).toBeLessThanOrEqual(180);
      }
    });

    it('searches cities by name and country case-insensitively', () => {
      const nyResults = searchCities('new york');
      expect(nyResults.length).toBeGreaterThan(0);
      expect(nyResults[0].name).toBe('New York');

      const tokyo = findCityByName('Tokyo');
      expect(tokyo).toBeDefined();
      expect(tokyo?.country).toBe('Japan');

      const londonResults = searchCities('united kingdom');
      expect(londonResults.some((c) => c.name === 'London')).toBe(true);
    });

    it('returns empty list for non-matching search queries', () => {
      expect(searchCities('xyznonexistentcity12345')).toEqual([]);
    });
  });

  describe('Full Deep Report Composer & Sharp Truth', () => {
    it('composes a full 7-chapter deep report with valid synthesis', () => {
      const synastry = computeSynastry(alice, bob, { relationshipType: 'romantic' });
      const report = composeFullReport(synastry);

      expect(report.relationshipType).toBe('romantic');
      expect(report.overallScore).toBe(synastry.overallScore);
      expect(report.sections).toHaveLength(7);

      for (const section of report.sections) {
        expect(section.id).toBeDefined();
        expect(section.title.length).toBeGreaterThan(3);
        expect(section.prose.length).toBeGreaterThan(20);
        expect(section.keyInsights.length).toBeGreaterThan(0);
      }

      // Check convenience properties
      expect(report.personA?.name).toBe('Alice');
      expect(report.personB?.name).toBe('Bob');
      expect(report.oneSharpTruth?.headline.length).toBeGreaterThan(5);
      expect(report.oneSharpTruth?.quote.length).toBeGreaterThan(10);
      expect(report.disclaimer).toBeDefined();
    });

    it('generates OneSharpTruth with headline, quote, and aspectName', () => {
      const synastry = computeSynastry(alice, bob, { relationshipType: 'coworker' });
      const truth = getOneSharpTruth(synastry);

      expect(truth.headline).toBeTruthy();
      expect(truth.quote).toBeTruthy();
      expect(truth.aspectName).toBeTruthy();
    });
  });

  describe('ScoreGauge Tier Mapping', () => {
    it('maps scores to correct editorial tiers and statuses', () => {
      const tier90 = getTierInfo(90);
      expect(tier90.status).toBe('COSMIC CATALYST');

      const tier75 = getTierInfo(75);
      expect(tier75.status).toBe('MAGNETIC DYNAMIC');

      const tier60 = getTierInfo(60);
      expect(tier60.status).toBe('VOLATILE FASCINATION');

      const tier40 = getTierInfo(40);
      expect(tier40.status).toBe('FRICTIONAL FORGE');
    });
  });
});
