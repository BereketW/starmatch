import { describe, it, expect } from 'vitest';
import { computeSynastry } from '@/lib/synastry/engine';
import { generatePairReport } from '@/lib/report/composer';
import {
  VaultManager,
  canAddPairToVault,
  generateGdprArchive,
  MAX_FREE_VAULT_SLOTS,
} from '@/lib/vault';
import { RelationshipType } from '@/lib/astro/types';

describe('Milestone 2 Stress Test Suite: Report Prose & Vault Systems', () => {
  const relationshipTypes: RelationshipType[] = [
    'romantic',
    'crush',
    'ex',
    'friend',
    'family',
    'coworker',
  ];

  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];

  describe('1. 500+ Generated Reports Empirical Stress Test', () => {
    it('generates 500+ reports across varying birth dates and relationship types with 0 NaN, 0 undefined sections, non-empty prose in all 8 sections', () => {
      const TOTAL_PAIRS = 520;
      let evaluatedCount = 0;

      // Seeded date generator from 1950 to 2024
      const startDate = new Date('1950-01-01').getTime();
      const endDate = new Date('2024-01-01').getTime();
      const dateSpan = endDate - startDate;

      for (let i = 0; i < TOTAL_PAIRS; i++) {
        const relType = relationshipTypes[i % relationshipTypes.length];

        // Pseudo-random pseudo-deterministic progression
        const offsetA = (i * 1234567) % dateSpan;
        const offsetB = ((i + 77) * 7654321) % dateSpan;

        const dateA = new Date(startDate + offsetA).toISOString().slice(0, 10);
        const dateB = new Date(startDate + offsetB).toISOString().slice(0, 10);

        const isQuick = i % 10 === 0; // 10% quick mode tests
        const withTimes = i % 3 === 0; // Some with birth times

        let synastry;
        if (isQuick) {
          const signA = zodiacSigns[i % 12];
          const signB = zodiacSigns[(i + 5) % 12];
          synastry = computeSynastry(
            { name: `PartnerA_${i}`, zodiacSign: signA, birthDate: '' },
            { name: `PartnerB_${i}`, zodiacSign: signB, birthDate: '' },
            relType
          );
        } else {
          synastry = computeSynastry(
            {
              name: `PersonA_${i}`,
              birthDate: dateA,
              birthTime: withTimes ? '09:30' : undefined,
              latitude: withTimes ? 40.7128 : undefined,
              longitude: withTimes ? -74.006 : undefined,
            },
            {
              name: `PersonB_${i}`,
              birthDate: dateB,
              birthTime: withTimes ? '18:45' : undefined,
              latitude: withTimes ? 34.0522 : undefined,
              longitude: withTimes ? -118.2437 : undefined,
            },
            relType
          );
        }

        // Verify numeric integrity
        expect(Number.isNaN(synastry.overallScore)).toBe(false);
        expect(synastry.overallScore).toBeGreaterThanOrEqual(0);
        expect(synastry.overallScore).toBeLessThanOrEqual(100);

        for (const [catName, catVal] of Object.entries(synastry.categories)) {
          expect(Number.isNaN(catVal), `Category ${catName} should not be NaN for pair ${i}`).toBe(false);
          expect(catVal).toBeGreaterThanOrEqual(0);
          expect(catVal).toBeLessThanOrEqual(100);
        }

        // Generate report prose
        const report = generatePairReport(synastry);

        // Verify all 8 sections exist and are non-empty strings
        const expectedSections: (keyof typeof report)[] = [
          'overview',
          'chemistry',
          'communication',
          'emotionalBond',
          'conflictAndRepair',
          'longTermPotential',
          'growthTips',
          'disclaimer',
        ];

        for (const section of expectedSections) {
          const content = report[section];
          expect(content, `Report section ${section} must not be undefined/null in pair ${i}`).toBeDefined();
          expect(typeof content).toBe('string');
          expect(content.length, `Section ${section} must be non-empty in pair ${i}`).toBeGreaterThan(20);

          // Zero NaN check in prose
          expect(content).not.toMatch(/\bNaN\b/);
          expect(content).not.toContain('NaN%');

          // Zero unreplaced template tags
          expect(content).not.toMatch(/\{[a-zA-Z0-9_]+\}/);
        }

        // Check disclaimer
        expect(report.disclaimer.toLowerCase()).toContain('entertainment');

        evaluatedCount++;
      }

      expect(evaluatedCount).toBe(TOTAL_PAIRS);
    });
  });

  describe('2. Strict Determinism Empirical Stress Test', () => {
    it('produces byte-identical reports across multiple evaluations of the same birth pair', () => {
      const testCases = [
        {
          pA: { name: 'Elena', birthDate: '1995-11-23', birthTime: '14:20' },
          pB: { name: 'Marcus', birthDate: '1992-04-18', birthTime: '08:15' },
          rel: 'romantic' as RelationshipType,
        },
        {
          pA: { name: 'Aria', birthDate: '2000-01-01' },
          pB: { name: 'Leo', birthDate: '1999-12-31' },
          rel: 'crush' as RelationshipType,
        },
        {
          pA: { name: 'DevA', birthDate: '1988-07-14' },
          pB: { name: 'DevB', birthDate: '1990-09-02' },
          rel: 'coworker' as RelationshipType,
        },
        {
          pA: { name: 'Friend1', zodiacSign: 'Gemini', birthDate: '' },
          pB: { name: 'Friend2', zodiacSign: 'Sagittarius', birthDate: '' },
          rel: 'friend' as RelationshipType,
        },
        {
          pA: { name: 'Kin1', birthDate: '1965-03-30' },
          pB: { name: 'Kin2', birthDate: '1993-10-12' },
          rel: 'family' as RelationshipType,
        },
      ];

      for (const tc of testCases) {
        const synastry1 = computeSynastry(tc.pA, tc.pB, tc.rel);
        const synastry2 = computeSynastry(tc.pA, tc.pB, tc.rel);
        const synastry3 = computeSynastry(tc.pA, tc.pB, tc.rel);

        const rep1 = generatePairReport(synastry1);
        const rep2 = generatePairReport(synastry2);
        const rep3 = generatePairReport(synastry3);

        expect(rep1).toEqual(rep2);
        expect(rep2).toEqual(rep3);

        // Byte-identical verification
        expect(JSON.stringify(rep1)).toBe(JSON.stringify(rep2));
        expect(JSON.stringify(rep2)).toBe(JSON.stringify(rep3));
      }
    });
  });

  describe('3. Diversity Across Distinct Birth Pairs', () => {
    it('distinct birth pairs produce distinct prose across generated reports', () => {
      const distinctPairs = [
        {
          pA: { name: 'A1', birthDate: '1990-01-01' },
          pB: { name: 'B1', birthDate: '1990-06-01' },
          rel: 'romantic' as RelationshipType,
        },
        {
          pA: { name: 'A2', birthDate: '1985-03-21' },
          pB: { name: 'B2', birthDate: '1988-10-23' },
          rel: 'coworker' as RelationshipType,
        },
        {
          pA: { name: 'A3', birthDate: '1975-08-15' },
          pB: { name: 'B3', birthDate: '1979-12-05' },
          rel: 'friend' as RelationshipType,
        },
        {
          pA: { name: 'A4', birthDate: '2001-04-12' },
          pB: { name: 'B4', birthDate: '2003-02-28' },
          rel: 'crush' as RelationshipType,
        },
        {
          pA: { name: 'A5', birthDate: '1992-11-17' },
          pB: { name: 'B5', birthDate: '1994-05-04' },
          rel: 'family' as RelationshipType,
        },
      ];

      const reportSignatures = new Set<string>();

      for (const pair of distinctPairs) {
        const syn = computeSynastry(pair.pA, pair.pB, pair.rel);
        const rep = generatePairReport(syn);
        // Combine core analytical sections
        const signature = `${rep.overview.slice(0, 80)}|${rep.chemistry.slice(0, 80)}|${rep.communication.slice(0, 80)}`;
        expect(reportSignatures.has(signature)).toBe(false);
        reportSignatures.add(signature);
      }

      expect(reportSignatures.size).toBe(distinctPairs.length);
    });
  });

  describe('4. Vault Concurrency, Boundaries, Upgrades & Purge', () => {
    it('enforces 0, 1, 2, 3 capacity on free tier and rejects 4th pair', () => {
      const vault = new VaultManager();
      const userId = 'usr_free_boundary';

      expect(MAX_FREE_VAULT_SLOTS).toBe(3);
      expect(canAddPairToVault(0, false)).toBe(true);
      expect(canAddPairToVault(1, false)).toBe(true);
      expect(canAddPairToVault(2, false)).toBe(true);
      expect(canAddPairToVault(3, false)).toBe(false);
      expect(canAddPairToVault(4, false)).toBe(false);

      // Save 1st
      vault.savePair(userId, { name: 'Partner 1', score: 80 }, false);
      expect(vault.getPairs(userId).length).toBe(1);

      // Save 2nd
      vault.savePair(userId, { name: 'Partner 2', score: 75 }, false);
      expect(vault.getPairs(userId).length).toBe(2);

      // Save 3rd
      vault.savePair(userId, { name: 'Partner 3', score: 90 }, false);
      expect(vault.getPairs(userId).length).toBe(3);

      // Save 4th: must throw capacity rejection
      expect(() => {
        vault.savePair(userId, { name: 'Partner 4', score: 65 }, false);
      }).toThrow('Vault capacity reached (3 pairs max on free tier)');

      // Verify pair count is still 3
      expect(vault.getPairs(userId).length).toBe(3);
    });

    it('upgrading to subscriber grants unlimited capacity for 4+ pairs', () => {
      const vault = new VaultManager();
      const userId = 'usr_upgrade_test';

      // Fill 3 free slots
      for (let i = 1; i <= 3; i++) {
        vault.savePair(userId, { name: `Free Partner ${i}`, score: 70 + i }, false);
      }
      expect(vault.getPairs(userId).length).toBe(3);

      // User upgrades to subscriber (isSubscriber: true)
      // Save 4th, 5th, up to 25 pairs
      for (let i = 4; i <= 25; i++) {
        expect(() => {
          vault.savePair(userId, { name: `Sub Partner ${i}`, score: 70 + (i % 20) }, true);
        }).not.toThrow();
      }

      expect(vault.getPairs(userId).length).toBe(25);
    });

    it('validates JSON export integrity under GDPR archive standards', () => {
      const user = { id: 'usr_gdpr_check', email: 'privacy@starmatch.io' };

      const pairs = [
        { id: 'p_1', name: 'Partner Alpha', score: 88, relationshipType: 'romantic' as const },
        { id: 'p_2', name: 'Partner Beta', score: 72, relationshipType: 'friend' as const },
        { id: 'p_3', name: 'Partner Gamma', score: 95, relationshipType: 'coworker' as const },
      ];

      const archive = generateGdprArchive(user, pairs);

      expect(archive.userId).toBe(user.id);
      expect(archive.userEmail).toBe(user.email);
      expect(archive.formatVersion).toBe('1.0');
      expect(archive.savedMatches.length).toBe(3);
      expect(archive.exportedMatches.length).toBe(3);
      expect(archive.securityLog.length).toBeGreaterThan(0);
      expect(archive.securityLog[0].action).toBe('GDPR_DATA_EXPORT_GENERATED');

      // Full JSON round-trip serialization
      const jsonString = JSON.stringify(archive);
      expect(typeof jsonString).toBe('string');
      const parsed = JSON.parse(jsonString);
      expect(parsed.userId).toBe(user.id);
      expect(parsed.savedMatches[0].name).toBe('Partner Alpha');
      expect(parsed.savedMatches[1].relationshipType).toBe('friend');
      expect(parsed.savedMatches[2].score).toBe(95);
    });

    it('executes irreversible account purge wiping all pairs, sessions, and records', () => {
      const vault = new VaultManager();
      const userId = 'usr_purge_stress';

      // Create session
      vault.createSession(userId, 'purge_target@example.com');
      expect(vault.hasActiveSession(userId)).toBe(true);

      // Save 3 pairs
      vault.savePair(userId, { name: 'Pair 1' }, false);
      vault.savePair(userId, { name: 'Pair 2' }, false);
      vault.savePair(userId, { name: 'Pair 3' }, false);
      expect(vault.getPairs(userId).length).toBe(3);

      // Purge account
      const purgeResult = vault.purgeAccount(userId);

      expect(purgeResult.success).toBe(true);
      expect(purgeResult.recordsPurged.userProfiles).toBe(1);
      expect(purgeResult.recordsPurged.vaultPairs).toBe(3);
      expect(purgeResult.recordsPurged.birthRecords).toBe(6);
      expect(purgeResult.recordsPurged.activeSessions).toBe(1);
      expect(purgeResult.purgedAt).toBeDefined();

      // Ensure state is completely wiped
      expect(vault.getPairs(userId).length).toBe(0);
      expect(vault.hasActiveSession(userId)).toBe(false);
    });

    it('simulates concurrent interleaved access across multiple users with strict isolation', () => {
      const vault = new VaultManager();
      const USER_COUNT = 30;

      // Interleaved saves for 30 distinct users
      for (let round = 1; round <= 3; round++) {
        for (let u = 0; u < USER_COUNT; u++) {
          const uId = `concurrent_user_${u}`;
          vault.savePair(uId, { name: `Round ${round} Partner`, score: 50 + round + u }, false);
        }
      }

      // Check each user has exactly 3 pairs and cannot save a 4th without subscribing
      for (let u = 0; u < USER_COUNT; u++) {
        const uId = `concurrent_user_${u}`;
        const pairs = vault.getPairs(uId);
        expect(pairs.length).toBe(3);
        expect(() => {
          vault.savePair(uId, { name: 'Overflow' }, false);
        }).toThrow(/Vault capacity reached/);
      }
    });
  });
});
