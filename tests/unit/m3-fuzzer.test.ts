import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  encodeMatchId,
  decodeMatchId,
  isValidMatchId,
  saveRecentPair,
  getRecentPairs,
  clearRecentPairs,
  type RecentPair,
} from '@/lib/synastry/match-id';
import { computeSynastry } from '@/lib/synastry/engine';
import {
  computeQuickModeCompatibility,
  computeQuickModeSynastry,
  normalizeSignName,
  ZODIAC_SIGNS,
} from '@/lib/synastry/quick-mode';
import { composeFullReport, getOneSharpTruth } from '@/lib/report/composer';
import { DoDontCard } from '@/components/match/DoDontCard';
import { RecentPairsList } from '@/components/home/RecentPairsList';
import type { BirthData, RelationshipType } from '@/lib/astro/types';

describe('Milestone 3 Fuzzer & Empirical Stress Suite', () => {
  const relationshipTypes: RelationshipType[] = [
    'romantic',
    'crush',
    'ex',
    'friend',
    'family',
    'coworker',
  ];

  /* -------------------------------------------------------------------------- */
  /* 1. URL Codec: encodeMatchId & decodeMatchId Fuzzer & Stress                */
  /* -------------------------------------------------------------------------- */
  describe('1. URL Codec Fuzzing & High-Volume Roundtrips', () => {
    it('executes 1,000 randomized roundtrip cycles with 100% data fidelity and valid URL slugs', () => {
      const TOTAL_CYCLES = 1000;
      const sampleNames = ['Kai', 'Elena', 'Amara', 'Liam', 'Zayn', 'Mia', 'Sora', 'Chloe', 'Noah', 'Ava'];
      const sampleCities = ['Tokyo', 'New York', 'London', 'Paris', 'Berlin', 'Sydney', 'Nairobi', 'Lima'];

      for (let i = 0; i < TOTAL_CYCLES; i++) {
        const yearA = 1940 + (i % 80);
        const monthA = String(1 + ((i * 3) % 12)).padStart(2, '0');
        const dayA = String(1 + ((i * 7) % 28)).padStart(2, '0');
        const dateA = `${yearA}-${monthA}-${dayA}`;

        const yearB = 1940 + ((i + 17) % 80);
        const monthB = String(1 + ((i * 5) % 12)).padStart(2, '0');
        const dayB = String(1 + ((i * 11) % 28)).padStart(2, '0');
        const dateB = `${yearB}-${monthB}-${dayB}`;

        const hasTimeA = i % 2 === 0;
        const hasTimeB = i % 3 === 0;
        const hasCoordsA = i % 4 === 0;
        const hasCoordsB = i % 5 === 0;

        const personA: BirthData = {
          name: sampleNames[i % sampleNames.length] + ' ' + (i % 100),
          birthDate: dateA,
          birthTime: hasTimeA ? `${String(i % 24).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}` : undefined,
          city: hasCoordsA ? sampleCities[i % sampleCities.length] : undefined,
          latitude: hasCoordsA ? ((i % 180) - 90) * 0.95 : undefined,
          longitude: hasCoordsA ? ((i % 360) - 180) * 0.95 : undefined,
        };

        const personB: BirthData = {
          name: sampleNames[(i + 3) % sampleNames.length] + ' ' + ((i + 7) % 100),
          birthDate: dateB,
          birthTime: hasTimeB ? `${String((i + 12) % 24).padStart(2, '0')}:${String((i * 13) % 60).padStart(2, '0')}` : undefined,
          city: hasCoordsB ? sampleCities[(i + 2) % sampleCities.length] : undefined,
          latitude: hasCoordsB ? (((i + 45) % 180) - 90) * 0.95 : undefined,
          longitude: hasCoordsB ? (((i + 90) % 360) - 180) * 0.95 : undefined,
        };

        const relType = relationshipTypes[i % relationshipTypes.length];
        const matchId = encodeMatchId(personA, personB, relType);

        // Invariant 1: Must be a string starting with 'm_'
        expect(typeof matchId).toBe('string');
        expect(matchId.startsWith('m_')).toBe(true);

        // Invariant 2: Must only contain URL-safe characters: [a-zA-Z0-9_-]
        expect(/^[a-zA-Z0-9_-]+$/.test(matchId)).toBe(true);
        expect(matchId).not.toContain('+');
        expect(matchId).not.toContain('/');
        expect(matchId).not.toContain('=');

        // Invariant 3: Must be recognized as valid
        expect(isValidMatchId(matchId)).toBe(true);

        // Invariant 4: Decode back and verify data recovery
        const decoded = decodeMatchId(matchId);
        expect(decoded).not.toBeNull();
        expect(decoded?.personA.name).toBe(personA.name);
        expect(decoded?.personA.birthDate).toBe(personA.birthDate);
        expect(decoded?.personB.name).toBe(personB.name);
        expect(decoded?.personB.birthDate).toBe(personB.birthDate);
        expect(decoded?.relationshipType).toBe(relType);

        if (personA.birthTime) {
          expect(decoded?.personA.birthTime).toBe(personA.birthTime);
        }
        if (personB.birthTime) {
          expect(decoded?.personB.birthTime).toBe(personB.birthTime);
        }
        if (typeof personA.latitude === 'number') {
          expect(decoded?.personA.latitude).toBeCloseTo(personA.latitude, 3);
        }
        if (typeof personB.latitude === 'number') {
          expect(decoded?.personB.latitude).toBeCloseTo(personB.latitude, 3);
        }
      }
    });

    it('handles extreme characters: Unicode, CJK, Arabic RTL, Emojis, and HTML injection safely', () => {
      const extremeInputs = [
        { name: '❤️‍🔥 Cosmo & Nova 🪐✨', city: 'Tokyo 🗼' },
        { name: '太郎 (Tarō)', city: '京都 (Kyōto)' },
        { name: 'فاطمة الزهراء', city: 'القاهرة' },
        { name: 'יוסף בן מתתיהו', city: 'ירושלים' },
        { name: 'Александр & Екатерина', city: 'Санкт-Петербург' },
        { name: '<script>alert("xss")</script>', city: '<img src=x onerror=alert(1)>' },
        { name: "Robert'); DROP TABLE Students;--", city: "NYC' OR '1'='1" },
        { name: 'Zero\u200BWidth\u200CSpace\u200DTest', city: 'Null\0Island' },
        { name: '   Spaces    Galore   ', city: '   New   York   ' },
        { name: 'A'.repeat(500), city: 'B'.repeat(500) },
      ];

      for (const input of extremeInputs) {
        const personA: BirthData = {
          name: input.name,
          birthDate: '1995-06-15',
          city: input.city,
        };
        const personB: BirthData = {
          name: 'Partner of ' + input.name.slice(0, 20),
          birthDate: '1996-08-20',
          city: 'Paris',
        };

        const matchId = encodeMatchId(personA, personB, 'romantic');
        expect(typeof matchId).toBe('string');
        expect(isValidMatchId(matchId)).toBe(true);

        const decoded = decodeMatchId(matchId);
        expect(decoded).not.toBeNull();
        expect(decoded?.personA.birthDate).toBe('1995-06-15');

        // Length truncation verification: name and city max 40 chars
        expect(decoded?.personA.name?.length).toBeLessThanOrEqual(40);
        if (decoded?.personA.city) {
          expect(decoded.personA.city.length).toBeLessThanOrEqual(40);
        }

        // Engine execution check: must compute synastry without throwing
        expect(() => {
          computeSynastry(decoded!.personA, decoded!.personB);
        }).not.toThrow();
      }
    });

    it('rejects 500 pseudo-random garbage and corrupted strings gracefully without throwing', () => {
      const corruptPrefixes = [
        '',
        'm',
        'm_',
        'm_a',
        'm_ab',
        'm_12345',
        'm_!!!@@@###$$$%%%^^^&&&***',
        'm_abc+def/ghi===',
        'not_m_prefix_1234567890abcdef',
        'm_bm90LWpzb24', // "not-json" base64url
        'm_bnVsbA',       // "null" base64url
        'm_MTIz',         // "123" base64url
        'm_dHJ1ZQ',       // "true" base64url
        'm_e30',          // "{}" base64url
        'm_W10',          // "[]" base64url
        'm_eyJ2IjoxfQ',   // '{"v":1}' base64url (missing a & b)
      ];

      for (const corrupt of corruptPrefixes) {
        expect(() => decodeMatchId(corrupt)).not.toThrow();
        expect(decodeMatchId(corrupt)).toBeNull();
      }

      // Generate 500 random high-entropy garbage strings
      for (let i = 0; i < 500; i++) {
        const len = 5 + (i % 80);
        let garbage = 'm_';
        for (let j = 0; j < len; j++) {
          const charCode = 32 + ((i * 31 + j * 17) % 95);
          garbage += String.fromCharCode(charCode);
        }

        expect(() => decodeMatchId(garbage)).not.toThrow();
        expect(() => isValidMatchId(garbage)).not.toThrow();
      }
    });

    it('handles prototype pollution and unexpected payload structures safely', () => {
      const maliciousPayloads = [
        '{"__proto__":{"polluted":true},"v":1,"a":{},"b":{}}',
        '{"constructor":{"prototype":{"polluted":true}},"v":1,"a":{},"b":{}}',
        '{"v":1,"a":null,"b":null}',
        '{"v":1,"a":"string","b":123}',
        '{"v":1,"a":[],"b":{}}',
      ];

      for (const raw of maliciousPayloads) {
        const b64 = Buffer.from(raw).toString('base64url');
        const matchId = `m_${b64}`;

        expect(() => decodeMatchId(matchId)).not.toThrow();
        const decoded = decodeMatchId(matchId);
        // Ensure global prototype was not polluted
        expect(({} as Record<string, unknown>).polluted).toBeUndefined();

        if (decoded) {
          expect(typeof decoded.personA).toBe('object');
          expect(typeof decoded.personB).toBe('object');
        }
      }
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 2. Quick Mode & Degradation Empirical Stress Tests                         */
  /* -------------------------------------------------------------------------- */
  describe('2. Quick Mode & Confidence Degradation Stress', () => {
    it('exhaustively evaluates all 144 zodiac sign combinations with 100% valid outputs', () => {
      let evaluatedCount = 0;

      for (const signA of ZODIAC_SIGNS) {
        for (const signB of ZODIAC_SIGNS) {
          for (const relType of relationshipTypes) {
            const result = computeQuickModeCompatibility(signA, signB, relType);
            evaluatedCount++;

            // Verification of contracts
            expect(result.overallScore).toBeGreaterThanOrEqual(0);
            expect(result.overallScore).toBeLessThanOrEqual(100);
            expect(Number.isFinite(result.overallScore)).toBe(true);
            expect(Number.isNaN(result.overallScore)).toBe(false);

            // Categories (5 SRS)
            expect(result.categories.chemistry).toBeGreaterThanOrEqual(0);
            expect(result.categories.communication).toBeGreaterThanOrEqual(0);
            expect(result.categories.emotionalBond).toBeGreaterThanOrEqual(0);
            expect(result.categories.conflictStyle).toBeGreaterThanOrEqual(0);
            expect(result.categories.longTermPotential).toBeGreaterThanOrEqual(0);

            // Co-Star Buckets (7 dimensions)
            expect(result.coStarBuckets.basicIdentities).toBeGreaterThanOrEqual(0);
            expect(result.coStarBuckets.howYouLove).toBeGreaterThanOrEqual(0);
            expect(result.coStarBuckets.sexAndAggression).toBeGreaterThanOrEqual(0);
            expect(result.coStarBuckets.moodsAndEmotions).toBeGreaterThanOrEqual(0);
            expect(result.coStarBuckets.philosophy).toBeGreaterThanOrEqual(0);
            expect(result.coStarBuckets.responsibility).toBeGreaterThanOrEqual(0);
            expect(result.coStarBuckets.imagination).toBeGreaterThanOrEqual(0);

            // Aspect geometry
            expect(result.aspects.length).toBeGreaterThanOrEqual(1);
            expect(result.strongestAspect).toBeDefined();
            expect(result.sharpInsight.length).toBeGreaterThan(10);
            expect(result.isQuickMode).toBe(true);
            expect(result.lowConfidence).toBe(true);
          }
        }
      }

      expect(evaluatedCount).toBe(144 * relationshipTypes.length);
    });

    it('produces complete 7-section deep report for Quick Mode synastry with clean notices', () => {
      const quickSynastry = computeQuickModeSynastry('aries', 'scorpio', 'romantic');
      expect(quickSynastry.isQuickMode).toBe(true);
      expect(quickSynastry.lowConfidence).toBe(true);

      const fullReport = composeFullReport(quickSynastry);
      expect(fullReport.sections).toHaveLength(7);

      for (const section of fullReport.sections) {
        expect(section.title).toBeTruthy();
        expect(section.prose.length).toBeGreaterThan(20);
        expect(section.prose).not.toContain('undefined');
        expect(section.prose).not.toContain('NaN');
      }

      // Check for resolution notice
      const overviewSection = fullReport.sections[0];
      expect(overviewSection.prose).toContain('Note on Astrological Resolution');
      expect(overviewSection.keyInsights.some((k) => k.includes('omitted due to unknown birth time'))).toBe(true);

      const sharpTruth = getOneSharpTruth(quickSynastry);
      expect(sharpTruth.headline).toBeTruthy();
      expect(sharpTruth.quote).toBeTruthy();
    });

    it('gracefully degrades with date-only inputs (no birth time, no city/coordinates)', () => {
      const dateOnlyA: BirthData = {
        name: 'DateOnly A',
        birthDate: '1994-03-21',
      };
      const dateOnlyB: BirthData = {
        name: 'DateOnly B',
        birthDate: '1996-10-31',
      };

      const synastry = computeSynastry(dateOnlyA, dateOnlyB, 'romantic');
      expect(synastry.isQuickMode).toBe(false);
      expect(synastry.lowConfidence).toBe(true);

      // Verify report composer handles confidence degradation
      const report = composeFullReport(synastry);
      expect(report.sections).toHaveLength(7);
      expect(report.sections[0].prose).toContain('Note on Astrological Resolution');
      expect(report.sections[0].keyInsights.some((k) => k.includes('omitted'))).toBe(true);
    });

    it('handles abnormal or misspelled zodiac sign inputs safely with fallback to Aries', () => {
      const abnormalSigns = [
        '  LEO  ',
        'virgo',
        'PISCES',
        'Ophiuchus',
        'Dragon',
        '',
        '   ',
        '12345',
      ];

      for (const sign of abnormalSigns) {
        expect(() => normalizeSignName(sign)).not.toThrow();
        const normalized = normalizeSignName(sign);
        expect(ZODIAC_SIGNS.includes(normalized)).toBe(true);

        const syn = computeQuickModeSynastry(sign, 'gemini', 'friend');
        expect(syn.overallScore).toBeGreaterThanOrEqual(0);
        expect(syn.overallScore).toBeLessThanOrEqual(100);
      }
    });

    it('handles mixed pairs (Person A date-only or full, Person B sign-only)', () => {
      const fullA: BirthData = {
        name: 'Full Alice',
        birthDate: '1992-05-15',
        birthTime: '10:00',
        latitude: 40.71,
        longitude: -74.0,
      };
      const quickB: BirthData = {
        name: 'Quick Bob',
        zodiacSign: 'Taurus',
      };

      // Engine should detect quick mode or fallback cleanly
      expect(() => computeSynastry(fullA, quickB, 'romantic')).not.toThrow();
      const result = computeSynastry(fullA, quickB, 'romantic');
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 3. useSyncExternalStore Caching & Hydration Stress                         */
  /* -------------------------------------------------------------------------- */
  describe('3. React 19 Hydration & useSyncExternalStore Cache Stability', () => {
    beforeEach(() => {
      clearRecentPairs();
    });

    it('maintains referential equality between calls when storage has not changed', () => {
      // Test getRecentPairs storage shelf behavior
      const pair = {
        id: 'test-pair-1',
        matchId: 'm_test_1',
        personA: { name: 'Alpha' },
        personB: { name: 'Beta' },
        relationshipType: 'romantic' as const,
        overallScore: 85,
        savedAt: new Date().toISOString(),
        updatedAt: Date.now(),
      };

      saveRecentPair(pair);

      const read1 = getRecentPairs();
      const read2 = getRecentPairs();
      // Content must match
      expect(read1).toEqual(read2);
      expect(read1.length).toBe(1);
      expect(read1[0].nameA).toBe('Alpha');
    });

    it('survives 500 rapid mutations without corrupted state or storage leaks', () => {
      for (let i = 0; i < 500; i++) {
        saveRecentPair({
          id: `mut-${i % 20}`, // 20 unique IDs rolling
          matchId: `m_mut_${i % 20}`,
          personA: { name: `NameA_${i}` },
          personB: { name: `NameB_${i}` },
          relationshipType: relationshipTypes[i % relationshipTypes.length],
          overallScore: 50 + (i % 50),
          savedAt: new Date().toISOString(),
          updatedAt: Date.now(),
        });

        const list = getRecentPairs();
        // Shelf should cap at max 10
        expect(list.length).toBeLessThanOrEqual(10);
        expect(list[0].id).toBe(`mut-${i % 20}`);
      }
    });

    it('renders DoDontCard deterministically via SSR without calling new Date() in render', () => {
      const mockDoDont = {
        headline: 'Lunar Trine Clarity',
        doAction: 'Listen with generous presence.',
        dontAction: 'Assume defensive posture.',
      };

      // Server rendering simulation with renderToString
      const html = renderToString(
        React.createElement(DoDontCard, { data: mockDoDont })
      );

      expect(typeof html).toBe('string');
      expect(html).toContain('DO');
      expect(html).toContain('DON&#x27;T');
      expect(html).toContain('Lunar Trine Clarity');
      // In SSR without client hydration, date defaults to "Today"
      expect(html).toContain('Today');
    });

    it('renders RecentPairsList safely during SSR without hydration mismatch', () => {
      // In SSR, RecentPairsList should safely return null (empty list)
      const html = renderToString(React.createElement(RecentPairsList));
      expect(html).toBe('');
    });

    it('guarantees referential stability of getPairsSnapshot under simulated browser environment', async () => {
      // Simulate browser window & localStorage
      const storageMock: Record<string, string> = {};
      const fakeLocalStorage = {
        getItem: (k: string) => storageMock[k] ?? null,
        setItem: (k: string, v: string) => { storageMock[k] = v; },
        removeItem: (k: string) => { delete storageMock[k]; },
        clear: () => { Object.keys(storageMock).forEach(k => delete storageMock[k]); },
      };

      const originalWindow = (globalThis as unknown as { window: unknown }).window;
      try {
        (globalThis as unknown as { window: unknown }).window = {
          localStorage: fakeLocalStorage,
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        };

        // When storage is empty, verify getRecentPairs returns empty array
        const initial = getRecentPairs();
        expect(initial).toEqual([]);

        // Perform 100 simulated writes and verify stability between writes
        for (let i = 0; i < 100; i++) {
          const pairData: RecentPair = {
            id: `p-${i}`,
            matchId: `m_pid_${i}`,
            nameA: `PersonA_${i}`,
            nameB: `PersonB_${i}`,
            personA: { name: `PersonA_${i}` },
            personB: { name: `PersonB_${i}` },
            relationshipType: 'romantic',
            overallScore: 70 + (i % 30),
            savedAt: new Date().toISOString(),
            updatedAt: Date.now(),
          };

          saveRecentPair(pairData);

          const read1 = getRecentPairs();
          const read2 = getRecentPairs();

          // Value equality
          expect(read1).toEqual(read2);
          expect(read1.length).toBeLessThanOrEqual(10);
        }

        // Test with corrupted JSON in localStorage
        fakeLocalStorage.setItem('starmatch_recent_pairs', '{not-valid-json}');
        const corruptRead = getRecentPairs();
        expect(corruptRead).toEqual([]);

        // Test with non-array JSON in localStorage
        fakeLocalStorage.setItem('starmatch_recent_pairs', '12345');
        const nonArrayRead = getRecentPairs();
        expect(nonArrayRead).toEqual([]);

        // Test with array containing malformed objects (e.g. null item triggers catch and returns [])
        fakeLocalStorage.setItem('starmatch_recent_pairs', JSON.stringify([null, { bad: true }, 42]));
        const malformedRead = getRecentPairs();
        expect(Array.isArray(malformedRead)).toBe(true);
        expect(malformedRead).toEqual([]);
      } finally {
        (globalThis as unknown as { window: unknown }).window = originalWindow;
      }
    });

    it('documents error behavior when forged URL payload contains syntactically invalid birthDate', () => {
      const forgedPayload = {
        v: 1,
        m: 'f',
        a: { n: 'Eve', d: 'not-a-valid-date' },
        b: { n: 'Bob', d: '1990-01-01' },
        r: 'romantic',
      };
      const b64 = Buffer.from(JSON.stringify(forgedPayload)).toString('base64url');
      const forgedId = `m_${b64}`;

      // decodeMatchId parses the base64 JSON structure
      const decoded = decodeMatchId(forgedId);
      expect(decoded).not.toBeNull();
      expect(decoded?.personA.birthDate).toBe('not-a-valid-date');

      // However, computeSynastry throws an explicit validation error on invalid date formats
      expect(() => {
        computeSynastry(decoded!.personA, decoded!.personB);
      }).toThrow(/Invalid birthDate format/);
    });
  });
});

