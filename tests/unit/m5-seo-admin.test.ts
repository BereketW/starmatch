import { describe, it, expect } from 'vitest';
import {
  ALL_CANONICAL_SLUGS,
  ALL_78_PAIRS,
  formatPairSlug,
  formatSlug,
  canonicalizePairSlug,
  isValidPairSlug,
  isCanonicalPairSlug,
  parsePairSlug,
  getRelatedPairs,
  generatePairJsonLd,
} from '@/lib/synastry/seo-pairs';
import { generateStaticParams, generateMetadata } from '@/app/compatibility/[pair]/page';
import sitemap from '@/app/sitemap';
import { validateWaitlistEmail, generateWaitlistRank } from '@/app/waitlist/page';
import {
  generateGdprArchive,
  executePermanentAccountPurge,
  globalVaultManager,
} from '@/lib/vault/store';
import {
  calculateConversionRate,
  validateOrbWeight,
  processAdminRefund,
  FUNNEL_STEPS,
  ChargeRecord,
} from '@/app/admin/page';
import {
  CLIP_STUDIO_CONFIG,
  CLIP_STAGES,
  stepFrameForward,
  stepFrameBackward,
  getExportStrategy,
} from '@/app/admin/clip-maker/page';

describe('Milestone 5: 78 SEO Sign-Pair Pages & Admin Suite', () => {
  // --------------------------------------------------------------------------
  // 1. 78 SEO Sign Pairs & Slug Resolution
  // --------------------------------------------------------------------------
  describe('1. 78 SEO Sign-Pair Indexing & Geometry', () => {
    it('generates exactly 78 unique pairings for 12 zodiac signs (12*13/2 = 78)', () => {
      expect(ALL_CANONICAL_SLUGS).toHaveLength(78);
      expect(ALL_78_PAIRS).toHaveLength(78);
    });

    it('contains exactly 12 identical self-pairs and 66 distinct mixed-pairs', () => {
      const selfPairs = ALL_78_PAIRS.filter((p) => p.isSelfPair);
      const mixedPairs = ALL_78_PAIRS.filter((p) => !p.isSelfPair);
      expect(selfPairs).toHaveLength(12);
      expect(mixedPairs).toHaveLength(66);
    });

    it('enforces canonical alphabetical slug formatting', () => {
      expect(formatPairSlug('Taurus', 'Aries')).toBe('aries-taurus');
      expect(formatPairSlug('Aries', 'Taurus')).toBe('aries-taurus');
      expect(formatSlug('Taurus', 'Aries')).toBe('/compatibility/aries-taurus');
    });

    it('canonicalizes reverse slugs to alphabetical order', () => {
      expect(canonicalizePairSlug('taurus-aries')).toBe('aries-taurus');
      expect(canonicalizePairSlug('scorpio-cancer')).toBe('cancer-scorpio');
      expect(canonicalizePairSlug('pisces-pisces')).toBe('pisces-pisces');
    });

    it('returns null or false for invalid sign pair slugs', () => {
      expect(canonicalizePairSlug('aries-unicorn')).toBeNull();
      expect(canonicalizePairSlug('single')).toBeNull();
      expect(canonicalizePairSlug('aries-taurus-gemini')).toBeNull();
      expect(isValidPairSlug('aries-unicorn')).toBe(false);
      expect(isValidPairSlug('aries-taurus')).toBe(true);
    });

    it('identifies whether a slug is canonical', () => {
      expect(isCanonicalPairSlug('aries-taurus')).toBe(true);
      expect(isCanonicalPairSlug('taurus-aries')).toBe(false);
      expect(isCanonicalPairSlug('aries-unicorn')).toBe(false);
    });

    it('parses valid pair slugs into rich component structures', () => {
      const parsed = parsePairSlug('aries-scorpio');
      expect(parsed).not.toBeNull();
      expect(parsed?.signA).toBe('Aries');
      expect(parsed?.signB).toBe('Scorpio');
      expect(parsed?.signAId).toBe('aries');
      expect(parsed?.signBId).toBe('scorpio');
      expect(parsed?.canonicalSlug).toBe('aries-scorpio');
      expect(parsed?.isCanonical).toBe(true);
    });

    it('parses non-canonical slug but preserves correct sign components', () => {
      const parsed = parsePairSlug('scorpio-cancer');
      expect(parsed).not.toBeNull();
      expect(parsed?.signA).toBe('Scorpio');
      expect(parsed?.signB).toBe('Cancer');
      expect(parsed?.canonicalSlug).toBe('cancer-scorpio');
      expect(parsed?.isCanonical).toBe(false);
    });

    it('produces rich metadata with valid baselines for all 78 pairs', () => {
      for (const pair of ALL_78_PAIRS) {
        expect(pair.slug).toBeDefined();
        expect(pair.baselineScore).toBeGreaterThanOrEqual(30);
        expect(pair.baselineScore).toBeLessThanOrEqual(100);
        expect(pair.elementalDynamic).toContain('+');
        expect(pair.aspectGeometry).toBeDefined();
        expect(pair.sharpTruth.length).toBeGreaterThan(10);
      }
    });

    it('finds related pairs for rich internal linking', () => {
      const relatedAries = getRelatedPairs('Aries', 4);
      expect(relatedAries).toHaveLength(4);
      for (const p of relatedAries) {
        expect(p.signAId === 'aries' || p.signBId === 'aries').toBe(true);
      }
    });

    it('generates valid Schema.org Article and BreadcrumbList JSON-LD', () => {
      const jsonLd = generatePairJsonLd('Aries', 'Leo', 'aries-leo');
      expect(jsonLd['@context']).toBe('https://schema.org');
      expect(jsonLd['@type']).toBe('Article');
      expect(jsonLd.headline).toContain('Aries and Leo');
      expect(jsonLd.breadcrumb['@type']).toBe('BreadcrumbList');
      expect(jsonLd.breadcrumb.itemListElement).toHaveLength(3);
    });
  });

  // --------------------------------------------------------------------------
  // 2. Next.js App Router Page & Dynamic Metadata
  // --------------------------------------------------------------------------
  describe('2. Next.js App Router Static Params & Metadata', () => {
    it('generateStaticParams returns all 78 canonical slugs', async () => {
      const params = await generateStaticParams();
      expect(params).toHaveLength(78);
      expect(params[0]).toHaveProperty('pair');
      const uniqueSlugs = new Set(params.map((p) => p.pair));
      expect(uniqueSlugs.size).toBe(78);
    });

    it('generateMetadata returns dynamic metadata for valid pair slug', async () => {
      const meta = await generateMetadata({
        params: Promise.resolve({ pair: 'aries-taurus' }),
      });
      expect(meta.title).toContain('Aries and Taurus');
      expect(meta.alternates?.canonical).toBe('https://starmatch.app/compatibility/aries-taurus');
      expect((meta.openGraph as Record<string, unknown>)?.type).toBe('article');
    });

    it('generateMetadata returns fallback metadata for invalid slug', async () => {
      const meta = await generateMetadata({
        params: Promise.resolve({ pair: 'aries-unicorn' }),
      });
      expect(meta.title).toBe('Pair Compatibility | StarMatch');
    });
  });

  // --------------------------------------------------------------------------
  // 3. Dynamic Sitemap
  // --------------------------------------------------------------------------
  describe('3. Dynamic Sitemap Generation', () => {
    it('sitemap contains 6 core routes plus all 78 pairing URLs (total 84)', () => {
      const entries = sitemap();
      expect(entries).toHaveLength(84);

      const urls = entries.map((e) => e.url);
      expect(urls).toContain('https://starmatch.app');
      expect(urls).toContain('https://starmatch.app/chart');
      expect(urls).toContain('https://starmatch.app/forecast');
      expect(urls).toContain('https://starmatch.app/compatibility');
      expect(urls).toContain('https://starmatch.app/invite');
      expect(urls).toContain('https://starmatch.app/waitlist');

      // Check all 78 pairs
      for (const slug of ALL_CANONICAL_SLUGS) {
        expect(urls).toContain(`https://starmatch.app/compatibility/${slug}`);
      }
    });

    it('sets 0.8 priority for compatibility pages and 1.0 for homepage', () => {
      const entries = sitemap();
      const home = entries.find((e) => e.url === 'https://starmatch.app');
      expect(home?.priority).toBe(1.0);

      const compat = entries.find((e) => e.url.includes('/compatibility/aries-taurus'));
      expect(compat?.priority).toBe(0.8);
      expect(compat?.changeFrequency).toBe('monthly');
    });
  });

  // --------------------------------------------------------------------------
  // 4. Waitlist Registration & Validation
  // --------------------------------------------------------------------------
  describe('4. Waitlist Registration & Email Validation', () => {
    it('accepts valid email addresses and plus-addressed emails', () => {
      expect(validateWaitlistEmail('user@starmatch.app')).toBe(true);
      expect(validateWaitlistEmail('user+astrology@domain.com')).toBe(true);
      expect(validateWaitlistEmail('vip.member+tag@sub.domain.org')).toBe(true);
    });

    it('rejects invalid or empty email addresses', () => {
      expect(validateWaitlistEmail('')).toBe(false);
      expect(validateWaitlistEmail('notanemail')).toBe(false);
      expect(validateWaitlistEmail('user@')).toBe(false);
      expect(validateWaitlistEmail('@domain.com')).toBe(false);
      expect(validateWaitlistEmail('user@domain')).toBe(false);
    });

    it('generates viral queue rank and referral code', () => {
      const res = generateWaitlistRank('alex@domain.com');
      expect(res.rank).toBeGreaterThanOrEqual(400);
      expect(res.rank).toBeLessThanOrEqual(res.total);
      expect(res.refCode).toMatch(/^STAR-[A-Z0-9]+$/);
    });
  });

  // --------------------------------------------------------------------------
  // 5. Account & Privacy: GDPR Export & Purge
  // --------------------------------------------------------------------------
  describe('5. Account & Privacy: GDPR Export & Purge', () => {
    it('generates standard GDPR JSON export archive with valid fields', () => {
      const user = { id: 'usr_privacy_test', email: 'privacy@user.io' };
      const vaultPairs = [
        { id: 'p1', partnerName: 'Taylor', score: 85 },
        { id: 'p2', partnerName: 'Jordan', score: 72 },
      ];
      const archive = generateGdprArchive(user, vaultPairs);
      expect(archive.userId).toBe(user.id);
      expect(archive.userEmail).toBe(user.email);
      expect(archive.formatVersion).toBe('1.0');
      expect(archive.savedMatches).toHaveLength(2);
      expect(archive.securityLog).toBeDefined();
    });

    it('executes 1-click permanent account and birth data purge', () => {
      const testUserId = `usr_purge_${Date.now()}`;
      globalVaultManager.savePair(testUserId, { name: 'Partner A', score: 80 });
      globalVaultManager.savePair(testUserId, { name: 'Partner B', score: 90 });

      expect(globalVaultManager.getPairs(testUserId)).toHaveLength(2);

      const purgeResult = executePermanentAccountPurge(testUserId);
      expect(purgeResult.success).toBe(true);
      expect(purgeResult.recordsPurged.userProfiles).toBe(1);
      expect(purgeResult.recordsPurged.vaultPairs).toBe(2);

      expect(globalVaultManager.getPairs(testUserId)).toHaveLength(0);
    });
  });

  // --------------------------------------------------------------------------
  // 6. Admin Funnel Telemetry & Moderation
  // --------------------------------------------------------------------------
  describe('6. Admin Dashboard Funnel & Controls', () => {
    it('tracks all 6 conversion funnel steps', () => {
      expect(FUNNEL_STEPS).toHaveLength(6);
      expect(FUNNEL_STEPS).toEqual([
        'visit',
        'inputs_entered',
        'result_viewed',
        'paywall_viewed',
        'checkout_started',
        'purchase',
      ]);
    });

    it('computes conversion rate cleanly and handles zero visitors safely', () => {
      expect(calculateConversionRate(182, 5000)).toBeCloseTo(3.64, 2);
      expect(calculateConversionRate(0, 0)).toBe(0);
      expect(calculateConversionRate(10, 0)).toBe(0);
    });

    it('validates orb weight inputs (strictly positive)', () => {
      expect(validateOrbWeight(8.0)).toBe(true);
      expect(validateOrbWeight(0.5)).toBe(true);
      expect(validateOrbWeight(0)).toBe(false);
      expect(validateOrbWeight(-1.5)).toBe(false);
      expect(validateOrbWeight(NaN)).toBe(false);
    });

    it('processes admin refund and rejects already-refunded charges', () => {
      const charge: ChargeRecord = {
        id: 'ch_test_123',
        customerEmail: 'customer@test.com',
        amount: 6.99,
        currency: 'USD',
        date: '2026-10-22',
        isRefunded: false,
        plan: 'single_report',
      };

      const refundResult = processAdminRefund(charge);
      expect(refundResult.status).toBe('succeeded');
      expect(refundResult.chargeId).toBe('ch_test_123');

      // Attempting refund on already-refunded charge throws
      charge.isRefunded = true;
      expect(() => processAdminRefund(charge)).toThrow(/already refunded/);
    });
  });

  // --------------------------------------------------------------------------
  // 7. Admin Clip Maker Studio Controls
  // --------------------------------------------------------------------------
  describe('7. Admin Clip Maker Studio 9:16 Pipeline', () => {
    it('operates vertical 9:16 layout with strictly positive integer dimensions', () => {
      expect(CLIP_STUDIO_CONFIG.ratio).toBe('9:16');
      expect(CLIP_STUDIO_CONFIG.canvasWidth).toBe(1080);
      expect(CLIP_STUDIO_CONFIG.canvasHeight).toBe(1920);
      expect(Number.isInteger(CLIP_STUDIO_CONFIG.canvasWidth)).toBe(true);
      expect(Number.isInteger(CLIP_STUDIO_CONFIG.canvasHeight)).toBe(true);
    });

    it('sequences 4 distinct animation reveal stages', () => {
      expect(CLIP_STAGES).toEqual([
        'intro',
        'score_reveal',
        'aspect_cards',
        'dodont_punchline',
      ]);
    });

    it('clamps frame progression boundaries (cannot step before 0 or past max)', () => {
      const max = CLIP_STAGES.length - 1; // 3
      expect(stepFrameForward(0, max)).toBe(1);
      expect(stepFrameForward(2, max)).toBe(3);
      expect(stepFrameForward(3, max)).toBe(3);

      expect(stepFrameBackward(3)).toBe(2);
      expect(stepFrameBackward(1)).toBe(0);
      expect(stepFrameBackward(0)).toBe(0);
    });

    it('selects media_recorder or canvas_frames_zip fallback based on capability', () => {
      expect(getExportStrategy(true)).toBe('media_recorder');
      expect(getExportStrategy(false)).toBe('canvas_frames_zip');
    });
  });
});
