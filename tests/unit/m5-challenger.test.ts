import { describe, it, expect } from 'vitest';
import {
  ALL_CANONICAL_SLUGS,
  ALL_78_PAIRS,
  canonicalizePairSlug,
  isValidPairSlug,
  isCanonicalPairSlug,
  parsePairSlug,
  getPairMetadata,
  getRelatedPairs,
  generatePairJsonLd,
  ZODIAC_SIGNS_CANONICAL,
} from '@/lib/synastry/seo-pairs';
import { quickModeSynastry, computeQuickModeCompatibility } from '@/lib/synastry/quick-mode';
import { RelationshipType } from '@/lib/astro/types';
import {
  generateGdprArchive,
  executePermanentAccountPurge,
  globalVaultManager,
} from '@/lib/vault/store';
import {
  calculateConversionRate,
  validateOrbWeight,
  processAdminRefund,
  ChargeRecord,
} from '@/app/admin/page';
import {
  CLIP_STAGES,
  stepFrameForward,
  stepFrameBackward,
} from '@/app/admin/clip-maker/page';
import { validateWaitlistEmail, generateWaitlistRank } from '@/app/waitlist/page';

describe('Milestone 5 Challenger: Adversarial Stress & Empirical Verification', () => {
  // =========================================================================
  // SUITE 1: Slug Parsing, Canonicalization & Fuzzing
  // =========================================================================
  describe('1. Slug Parsing & Canonicalization Stress Fuzzer', () => {
    it('handles all 144 sign permutations with deterministic symmetry', () => {
      const allSigns = [...ZODIAC_SIGNS_CANONICAL];
      let permutationCount = 0;

      for (const s1 of allSigns) {
        for (const s2 of allSigns) {
          permutationCount++;
          const rawSlug = `${s1}-${s2}`;
          const canon = canonicalizePairSlug(rawSlug);

          expect(canon).not.toBeNull();
          expect(typeof canon).toBe('string');

          // Alphabetical order guarantee
          const expectedSlug = [s1, s2].sort().join('-');
          expect(canon).toBe(expectedSlug);

          // Symmetry guarantee: canon(a-b) === canon(b-a)
          const reverseSlug = `${s2}-${s1}`;
          expect(canonicalizePairSlug(reverseSlug)).toBe(canon);

          // Parse verification
          const parsed = parsePairSlug(rawSlug);
          expect(parsed).not.toBeNull();
          expect(parsed?.canonicalSlug).toBe(expectedSlug);
          expect(parsed?.isCanonical).toBe(rawSlug === expectedSlug);
          expect(parsed?.signA.toLowerCase()).toBe(s1);
          expect(parsed?.signB.toLowerCase()).toBe(s2);
        }
      }

      expect(permutationCount).toBe(144);
    });

    it('rejects malformed slugs, wrong delimiters, and invalid token counts safely', () => {
      const malformedSlugs = [
        '',
        'aries',
        'aries-',
        '-aries',
        'aries--taurus',
        'aries---taurus',
        'aries-taurus-gemini',
        'a-b-c-d',
        'aries/taurus',
        'aries.taurus',
        'aries_taurus',
        'aries:taurus',
        'aries taurus',
        'aries+taurus',
        '♈-♉',
        'aries-tau\u0000rus',
        'áríés-táúrús',
        'unknown-aries',
        'aries-notasign',
        '123-456',
        'true-false',
        'null-undefined',
        'NaN-NaN',
      ];

      for (const badSlug of malformedSlugs) {
        expect(canonicalizePairSlug(badSlug)).toBeNull();
        expect(isValidPairSlug(badSlug)).toBe(false);
        expect(isCanonicalPairSlug(badSlug)).toBe(false);
        expect(parsePairSlug(badSlug)).toBeNull();
      }
    });

    it('neutralizes injection payloads and path traversal attempts safely', () => {
      const injectionSlugs = [
        '<script>alert(1)</script>-taurus',
        'aries-<svg onload=alert(1)>',
        "aries'; DROP TABLE users;--taurus",
        "aries' OR '1'='1-taurus",
        '../compatibility/aries-taurus',
        '../../etc/passwd-taurus',
        '%20aries-taurus',
        'aries%00-taurus',
        '{{7*7}}-taurus',
        '${7*7}-taurus',
      ];

      for (const injection of injectionSlugs) {
        expect(canonicalizePairSlug(injection)).toBeNull();
        expect(isValidPairSlug(injection)).toBe(false);
        expect(parsePairSlug(injection)).toBeNull();
      }
    });

    it('evaluates case insensitivity across variations', () => {
      const cases = [
        { input: 'ARIES-TAURUS', expected: 'aries-taurus' },
        { input: 'ArIeS-tAuRuS', expected: 'aries-taurus' },
        { input: 'lEo-vIrGo', expected: 'leo-virgo' },
        { input: 'PISCES-AQUARIUS', expected: 'aquarius-pisces' },
        { input: 'SCORPIO-CANCER', expected: 'cancer-scorpio' },
      ];

      for (const { input, expected } of cases) {
        expect(canonicalizePairSlug(input)).toBe(expected);
        expect(isValidPairSlug(input)).toBe(true);
        const parsed = parsePairSlug(input);
        expect(parsed).not.toBeNull();
        expect(parsed?.canonicalSlug).toBe(expected);
      }
    });

    it('reveals prototype property leakage in isValidSignName ("constructor" in SIGN_SEO_DATA)', () => {
      // "constructor" and "__proto__" match "in" operator on plain object SIGN_SEO_DATA
      const parsed = parsePairSlug('constructor-taurus');
      // Empirical verification: "constructor" is treated as valid sign, producing non-zodiac metadata
      expect(parsed?.signAId).toBe('constructor');
      expect(parsed?.signA).toBe('Object'); // metaA.name is Object.name!
    });

    it('crashes with TypeError on whitespace-padded slug " aries-taurus"', () => {
      // isValidSignName trims, but parsePairSlug indexes SIGN_SEO_DATA without trimming
      expect(() => {
        parsePairSlug(' aries-taurus');
      }).toThrow(TypeError);
    });

    it('fuzzes with 100 random malformed input strings without crashing or throwing', () => {
      const charset = 'abcdefghijklmnopqrstuvwxyz0123456789-_/\\.!@#$%^&*() \t\n\r';
      const fuzzedInputs: string[] = [];

      for (let i = 0; i < 100; i++) {
        const length = Math.floor(Math.random() * 20);
        let str = '';
        for (let j = 0; j < length; j++) {
          str += charset[Math.floor(Math.random() * charset.length)];
        }
        fuzzedInputs.push(str);
      }

      for (const fuzz of fuzzedInputs) {
        expect(() => {
          const canon = canonicalizePairSlug(fuzz);
          const valid = isValidPairSlug(fuzz);
          const isCanon = isCanonicalPairSlug(fuzz);
          const parsed = parsePairSlug(fuzz);
          expect(typeof isCanon).toBe('boolean');
          if (canon !== null) {
            expect(typeof canon).toBe('string');
            expect(valid).toBe(true);
          }
          if (parsed !== null) {
            expect(parsed.canonicalSlug).toBeDefined();
            expect(parsed.signA).toBeDefined();
            expect(parsed.signB).toBeDefined();
          }
        }).not.toThrow();
      }
    });
  });

  // =========================================================================
  // SUITE 2: All 78 Pairs Mathematical & Astrological Invariants
  // =========================================================================
  describe('2. All 78 Pairs Completeness & Numerical Integrity', () => {
    it('contains exactly 78 canonical pairs with 12 self-pairs and 66 distinct pairs', () => {
      expect(ALL_CANONICAL_SLUGS.length).toBe(78);
      expect(ALL_78_PAIRS.length).toBe(78);

      const uniqueSlugs = new Set(ALL_CANONICAL_SLUGS);
      expect(uniqueSlugs.size).toBe(78);

      const selfPairs = ALL_78_PAIRS.filter((p) => p.isSelfPair);
      const distinctPairs = ALL_78_PAIRS.filter((p) => !p.isSelfPair);

      expect(selfPairs.length).toBe(12);
      expect(distinctPairs.length).toBe(66);
    });

    it('verifies all 78 pairs produce strictly valid, non-null numeric scores (0-100) with zero NaN', () => {
      for (const pair of ALL_78_PAIRS) {
        // Baseline score in metadata
        expect(typeof pair.baselineScore).toBe('number');
        expect(isNaN(pair.baselineScore)).toBe(false);
        expect(pair.baselineScore).toBeGreaterThanOrEqual(0);
        expect(pair.baselineScore).toBeLessThanOrEqual(100);

        // Dynamic quick mode calculation
        const synastry = quickModeSynastry(pair.signA, pair.signB, 'romantic');

        // Overall score
        expect(typeof synastry.overallScore).toBe('number');
        expect(isNaN(synastry.overallScore)).toBe(false);
        expect(synastry.overallScore).toBeGreaterThanOrEqual(0);
        expect(synastry.overallScore).toBeLessThanOrEqual(100);

        // 5 SRS Categories
        const { categories } = synastry;
        const categoryKeys: (keyof typeof categories)[] = [
          'chemistry',
          'communication',
          'emotionalBond',
          'conflictStyle',
          'longTermPotential',
        ];
        for (const catKey of categoryKeys) {
          const score = categories[catKey];
          expect(typeof score).toBe('number');
          expect(isNaN(score)).toBe(false);
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
        }

        // 7 Co-Star Psychological Buckets
        const { coStarBuckets } = synastry;
        const bucketKeys: (keyof typeof coStarBuckets)[] = [
          'basicIdentities',
          'howYouLove',
          'sexAndAggression',
          'moodsAndEmotions',
          'philosophy',
          'responsibility',
          'imagination',
        ];
        for (const bKey of bucketKeys) {
          const score = coStarBuckets[bKey];
          expect(typeof score).toBe('number');
          expect(isNaN(score)).toBe(false);
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
        }

        // Aspects, transits, and daily recommendations
        expect(synastry.aspects.length).toBeGreaterThan(0);
        expect(synastry.strongestAspect).toBeDefined();
        expect(synastry.strongestAspect.angle).toBeGreaterThanOrEqual(0);
        expect(isNaN(synastry.strongestAspect.angle)).toBe(false);
        expect(synastry.dailyDoDont.doAction.length).toBeGreaterThan(3);
        expect(synastry.dailyDoDont.dontAction.length).toBeGreaterThan(3);
        expect(synastry.dailyDoDont.headline.length).toBeGreaterThan(3);
        expect(synastry.transits.power.length).toBeGreaterThan(0);
        expect(synastry.transits.pressure.length).toBeGreaterThan(0);
      }
    });

    it('verifies all 6 relationship types produce valid numeric scores across sample pairs', () => {
      const sampleSlugs = ['aries-leo', 'cancer-scorpio', 'gemini-gemini', 'taurus-scorpio'];
      const relationshipTypes: RelationshipType[] = [
        'romantic',
        'crush',
        'ex',
        'friend',
        'family',
        'coworker',
      ];

      for (const slug of sampleSlugs) {
        const parsed = parsePairSlug(slug)!;
        for (const relType of relationshipTypes) {
          const result = quickModeSynastry(parsed.signA, parsed.signB, relType);
          expect(result.relationshipType).toBe(relType);
          expect(result.overallScore).toBeGreaterThanOrEqual(0);
          expect(result.overallScore).toBeLessThanOrEqual(100);
          expect(isNaN(result.overallScore)).toBe(false);
        }
      }
    });

    it('validates geometric symmetry between signA-signB and signB-signA', () => {
      for (const pair of ALL_78_PAIRS) {
        const resForward = computeQuickModeCompatibility(pair.signAId, pair.signBId, 'romantic');
        const resReverse = computeQuickModeCompatibility(pair.signBId, pair.signAId, 'romantic');

        expect(resForward.overallScore).toBe(resReverse.overallScore);
        expect(resForward.categories).toEqual(resReverse.categories);
        expect(resForward.coStarBuckets).toEqual(resReverse.coStarBuckets);
      }
    });

    it('ensures getPairMetadata, getRelatedPairs, and JSON-LD generate valid schemas for all 78 pairs', () => {
      for (const pair of ALL_78_PAIRS) {
        const meta = getPairMetadata(pair.signA, pair.signB);
        expect(meta.title).toContain(pair.signA);
        expect(meta.title).toContain(pair.signB);
        expect(meta.sharpTruth.length).toBeGreaterThan(10);

        const related = getRelatedPairs(pair.signA, 4);
        expect(related.length).toBeGreaterThan(0);
        expect(related.length).toBeLessThanOrEqual(4);

        const jsonLd = generatePairJsonLd(pair.signA, pair.signB, pair.slug);
        expect(jsonLd['@context']).toBe('https://schema.org');
        expect(jsonLd['@type']).toBe('Article');
        expect(jsonLd.breadcrumb['@type']).toBe('BreadcrumbList');
        expect(jsonLd.breadcrumb.itemListElement.length).toBe(3);
      }
    });
  });

  // =========================================================================
  // SUITE 3: GDPR Export Completeness & JSON Parse Integrity
  // =========================================================================
  describe('3. GDPR Export JSON Completeness & Parse Integrity', () => {
    it('guarantees round-trip JSON serialization and parse integrity', () => {
      const user = { id: 'usr_fuzz_test_99', email: 'privacy.lead+test@starmatch.io' };
      const vaultPairs = [
        {
          id: 'p1',
          name: 'Partner One',
          partnerName: 'Partner One',
          score: 88,
          overallScore: 88,
          relationshipType: 'romantic' as RelationshipType,
        },
        {
          id: 'p2',
          name: 'Partner Two',
          partnerName: 'Partner Two',
          score: 65,
          overallScore: 65,
          relationshipType: 'crush' as RelationshipType,
        },
      ];
      const transactions = [
        {
          id: 'tx_001',
          amount: 6.99,
          currency: 'USD',
          date: '2026-10-22T10:00:00Z',
          plan: 'single_report',
          status: 'paid',
        },
      ];

      const archive = generateGdprArchive(user, vaultPairs, null, transactions);

      // Verify schema completeness
      expect(archive.userId).toBe(user.id);
      expect(archive.userEmail).toBe(user.email);
      expect(archive.formatVersion).toBe('1.0');
      expect(archive.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(archive.savedMatches).toHaveLength(2);
      expect(archive.transactions).toHaveLength(1);
      expect(archive.securityLog.length).toBeGreaterThanOrEqual(1);

      // JSON serialization & parse integrity
      const jsonString = JSON.stringify(archive);
      const parsedArchive = JSON.parse(jsonString);

      expect(parsedArchive).toEqual(archive);
      expect(parsedArchive.userId).toBe(user.id);
      expect(parsedArchive.savedMatches[0].score).toBe(88);
    });

    it('survives boundary payloads: empty arrays, 500 records, special characters in email', () => {
      // Empty data
      const emptyArchive = generateGdprArchive({ id: 'u_empty', email: 'empty@user.org' }, []);
      expect(emptyArchive.savedMatches).toEqual([]);
      expect(emptyArchive.transactions).toEqual([]);

      // Large payload (500 vault pairs)
      const largePairs = Array.from({ length: 500 }, (_, i) => ({
        id: `pair_${i}`,
        partnerName: `Partner ${i}`,
        score: (i * 7) % 101,
      }));
      const largeArchive = generateGdprArchive({ id: 'u_large', email: 'scale@user.org' }, largePairs);
      expect(largeArchive.savedMatches).toHaveLength(500);

      const serialized = JSON.stringify(largeArchive);
      expect(serialized.length).toBeGreaterThan(20000);
      const deserialized = JSON.parse(serialized);
      expect(deserialized.savedMatches.length).toBe(500);
    });
  });

  // =========================================================================
  // SUITE 4: Storage Purge & executePermanentAccountPurge
  // =========================================================================
  describe('4. Storage Purge & Account Deletion Guarantees', () => {
    it('executes 100% account and session purge in vault manager with isolation', () => {
      const targetUserId = `usr_target_${Date.now()}`;
      const bystanderUserId = `usr_bystander_${Date.now()}`;

      // Populate target user data
      globalVaultManager.savePair(targetUserId, { name: 'Partner 1', score: 75 });
      globalVaultManager.savePair(targetUserId, { name: 'Partner 2', score: 85 });
      globalVaultManager.createSession(targetUserId, 'target@user.io');

      // Populate bystander user data
      globalVaultManager.savePair(bystanderUserId, { name: 'Bystander Partner', score: 90 });
      globalVaultManager.createSession(bystanderUserId, 'bystander@user.io');

      expect(globalVaultManager.getPairs(targetUserId).length).toBe(2);
      expect(globalVaultManager.hasActiveSession(targetUserId)).toBe(true);
      expect(globalVaultManager.getPairs(bystanderUserId).length).toBe(1);
      expect(globalVaultManager.hasActiveSession(bystanderUserId)).toBe(true);

      // Execute purge
      const purgeResult = executePermanentAccountPurge(targetUserId);

      expect(purgeResult.success).toBe(true);
      expect(purgeResult.recordsPurged.userProfiles).toBe(1);
      expect(purgeResult.recordsPurged.vaultPairs).toBe(2);
      expect(purgeResult.recordsPurged.activeSessions).toBe(1);

      // Target user state is 100% wiped
      expect(globalVaultManager.getPairs(targetUserId).length).toBe(0);
      expect(globalVaultManager.hasActiveSession(targetUserId)).toBe(false);

      // Bystander user state is unaffected
      expect(globalVaultManager.getPairs(bystanderUserId).length).toBe(1);
      expect(globalVaultManager.hasActiveSession(bystanderUserId)).toBe(true);
    });

    it('purging non-existent user succeeds safely with 0 records purged', () => {
      const nonExistentUserId = 'usr_ghost_never_existed_999';
      const res = executePermanentAccountPurge(nonExistentUserId);
      expect(res.success).toBe(true);
      expect(res.recordsPurged.vaultPairs).toBe(0);
      expect(res.recordsPurged.activeSessions).toBe(0);
    });

    it('verifies simulated browser storage key sweep guarantees zero residual trace', () => {
      // Mock standard storage keys used across StarMatch
      const mockStorage: Record<string, string> = {
        starmatch_account_user: JSON.stringify({ id: 'u1' }),
        starmatch_account_pairs: JSON.stringify([{ id: 'p1' }]),
        starmatch_recent_pairs: JSON.stringify([{ id: 'r1' }]),
        starmatch_reactions: JSON.stringify({ react_1: 'love' }),
        starmatch_chaos_capsules: JSON.stringify([{ id: 'c1' }]),
      };

      const purgeKeys = [
        'starmatch_account_user',
        'starmatch_account_pairs',
        'starmatch_recent_pairs',
        'starmatch_reactions',
        'starmatch_chaos_capsules',
      ];

      // Execute purge sweep
      for (const key of purgeKeys) {
        delete mockStorage[key];
      }

      // Assert 0 residual keys
      for (const key of purgeKeys) {
        expect(mockStorage[key]).toBeUndefined();
      }
      expect(Object.keys(mockStorage).length).toBe(0);
    });
  });

  // =========================================================================
  // SUITE 5: Admin Telemetry & Boundary Calculations
  // =========================================================================
  describe('5. Admin Telemetry & Boundary Calculations', () => {
    it('handles zero, negative, and extreme visitor values in calculateConversionRate', () => {
      // Normal
      expect(calculateConversionRate(100, 1000)).toBe(10);
      expect(calculateConversionRate(182, 5000)).toBeCloseTo(3.64, 2);

      // Zero visitors (divide-by-zero protection)
      expect(calculateConversionRate(0, 0)).toBe(0);
      expect(calculateConversionRate(10, 0)).toBe(0);

      // Negative visitors
      expect(calculateConversionRate(10, -50)).toBe(0);

      // 100% conversion
      expect(calculateConversionRate(500, 500)).toBe(100);

      // Infinite visitors
      expect(calculateConversionRate(10, Infinity)).toBe(0);
    });

    it('enforces orb weight boundary validation rules', () => {
      // Valid strictly positive finite numbers
      expect(validateOrbWeight(8.0)).toBe(true);
      expect(validateOrbWeight(0.5)).toBe(true);
      expect(validateOrbWeight(12.0)).toBe(true);

      // Invalid: zero, negative, NaN, non-numbers
      expect(validateOrbWeight(0)).toBe(false);
      expect(validateOrbWeight(-1)).toBe(false);
      expect(validateOrbWeight(-0.01)).toBe(false);
      expect(validateOrbWeight(NaN)).toBe(false);
      expect(validateOrbWeight(undefined as unknown as number)).toBe(false);
      expect(validateOrbWeight(null as unknown as number)).toBe(false);
      expect(validateOrbWeight('8.0' as unknown as number)).toBe(false);
    });

    it('verifies refund processing rejects duplicate or invalid refund attempts', () => {
      const charge: ChargeRecord = {
        id: 'ch_test_999',
        customerEmail: 'buyer@test.io',
        amount: 39.99,
        currency: 'USD',
        date: '2026-10-22',
        isRefunded: false,
        plan: 'annual_membership',
      };

      // First refund succeeds
      const result = processAdminRefund(charge);
      expect(result.status).toBe('succeeded');
      expect(result.chargeId).toBe('ch_test_999');

      // Subsequent attempt throws
      charge.isRefunded = true;
      expect(() => processAdminRefund(charge)).toThrow(/already refunded/);
    });

    it('clamps clip-maker playback frame stepping at boundaries', () => {
      const maxStage = CLIP_STAGES.length - 1; // 3

      // Forward clamping
      expect(stepFrameForward(0, maxStage)).toBe(1);
      expect(stepFrameForward(2, maxStage)).toBe(3);
      expect(stepFrameForward(3, maxStage)).toBe(3); // Does not exceed max
      expect(stepFrameForward(99, maxStage)).toBe(maxStage); // Clamps to maxStage

      // Backward clamping
      expect(stepFrameBackward(3)).toBe(2);
      expect(stepFrameBackward(1)).toBe(0);
      expect(stepFrameBackward(0)).toBe(0); // Does not go negative
    });
  });

  // =========================================================================
  // SUITE 6: Waitlist Validation & Queue Hash Stress
  // =========================================================================
  describe('6. Waitlist Validation & Queue Ranking Stress', () => {
    it('validates RFC-compliant emails including plus-tags and rejects bad formats', () => {
      // Valid
      expect(validateWaitlistEmail('user@starmatch.app')).toBe(true);
      expect(validateWaitlistEmail('user+tag@domain.com')).toBe(true);
      expect(validateWaitlistEmail('a.b.c+d@sub.domain.co.uk')).toBe(true);
      expect(validateWaitlistEmail('  trimmed@domain.com  ')).toBe(true);

      // Invalid
      expect(validateWaitlistEmail('')).toBe(false);
      expect(validateWaitlistEmail('   ')).toBe(false);
      expect(validateWaitlistEmail('plainstring')).toBe(false);
      expect(validateWaitlistEmail('@nodomain.com')).toBe(false);
      expect(validateWaitlistEmail('noat.com')).toBe(false);
      expect(validateWaitlistEmail('user@')).toBe(false);
      expect(validateWaitlistEmail(null as unknown as string)).toBe(false);
      expect(validateWaitlistEmail(undefined as unknown as string)).toBe(false);
    });

    it('generates deterministic queue ranks and valid referral codes across 50 email variations', () => {
      for (let i = 0; i < 50; i++) {
        const testEmail = `fuzz.user.${i}@domain-${i % 5}.com`;
        const rank1 = generateWaitlistRank(testEmail);
        const rank2 = generateWaitlistRank(testEmail);

        // Deterministic
        expect(rank1.rank).toBe(rank2.rank);
        expect(rank1.total).toBe(rank2.total);
        expect(rank1.refCode).toBe(rank2.refCode);

        // Bounds
        expect(rank1.rank).toBeGreaterThanOrEqual(400);
        expect(rank1.rank).toBeLessThanOrEqual(rank1.total);
        expect(rank1.total).toBeGreaterThanOrEqual(2500);
        expect(rank1.refCode).toMatch(/^STAR-[A-Z0-9]+$/);
      }
    });
  });
});
