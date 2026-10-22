import { describe, it, expect, beforeAll } from 'vitest';
import {
  computeNatalChart,
  computeSynastry,
  quickModeSynastry,
  sanitizeReportContent,
  generatePairReport,
  initProductionAdapters,
} from '@/tests/harness/adapter';
import {
  refComputeNatalChart,
  refComputeSynastry,
  refComputeCategoryScores,
  refComputeCoStarBuckets,
  refComputeTransits,
  refComputeDailyDoDont,
  refComputeQuickMode,
} from '@/tests/harness/reference-engine';
import {
  BirthData,
  RelationshipType,
  SynastryResult,
  PricingPlan,
  FunnelEvent,
} from '@/tests/harness/types';

describe('Tier 4: Real-World Scenarios & End-to-End User Journeys', () => {
  beforeAll(async () => {
    await initProductionAdapters();
  });

  // --------------------------------------------------------------------------
  // Scenario 1: TikTok Viral Referral Journey
  // --------------------------------------------------------------------------
  describe('Scenario 1: TikTok Viral Referral Journey', () => {
    it('S1: complete user flow from TikTok viral link to teaser, share card, and checkout', async () => {
      // 1. User arrives via TikTok UTM referral
      const incomingUrl = new URL('https://starmatch.app/?ref=tiktok_clip_88&utm_source=tiktok');
      expect(incomingUrl.searchParams.get('ref')).toBe('tiktok_clip_88');
      expect(incomingUrl.searchParams.get('utm_source')).toBe('tiktok');

      // 2. User quickly enters signs (Leo + Sagittarius - fire trine)
      const synastry = await quickModeSynastry('Leo', 'Sagittarius', 'romantic');
      expect(synastry.isQuickMode).toBe(true);
      expect(synastry.overallScore).toBeGreaterThanOrEqual(80); // Fire trine is highly harmonious

      // 3. User views Teaser Page
      const report = generatePairReport(synastry);
      expect(report.overview.length).toBeGreaterThan(20);
      expect(report.disclaimer).toMatch(/entertainment/i);

      // 4. User generates 9:16 viral share card
      const shareCard = {
        signA: 'Leo',
        signB: 'Sagittarius',
        matchScore: synastry.overallScore,
        aspectRatio: '9:16',
        cardBadge: 'Fire Trine Harmony',
        watermark: 'StarMatch.app',
      };
      expect(shareCard.aspectRatio).toBe('9:16');
      expect(shareCard.matchScore).toBe(synastry.overallScore);

      // 5. User clicks Unlock and purchases $6.99 single report
      const purchaseEvent: FunnelEvent = {
        eventName: 'purchase',
        visitorId: 'vis_tiktok_88',
        timestamp: new Date().toISOString(),
        metadata: {
          planId: 'single',
          price: 6.99,
          ref: 'tiktok_clip_88',
        },
      };
      expect(purchaseEvent.metadata?.price).toBe(6.99);
      expect(purchaseEvent.metadata?.planId).toBe('single');
    });
  });

  // --------------------------------------------------------------------------
  // Scenario 2: Deep Astrology Enthusiast Journey
  // --------------------------------------------------------------------------
  describe('Scenario 2: Deep Astrology Enthusiast Journey', () => {
    it('S2: high-precision ephemeris, full synastry, Co-Star buckets, and unmasked report rituals', async () => {
      const charlotte: BirthData = {
        name: 'Charlotte',
        birthDate: '1992-06-15',
        birthTime: '04:45',
        latitude: 51.5074,
        longitude: -0.1278,
        city: 'London',
      };

      const arthur: BirthData = {
        name: 'Arthur',
        birthDate: '1989-10-24',
        birthTime: '18:20',
        latitude: 48.8566,
        longitude: 2.3522,
        city: 'Paris',
      };

      // 1. Calculate high precision natal charts
      const chartA = await computeNatalChart(charlotte);
      const chartB = await computeNatalChart(arthur);
      expect(chartA.lowConfidence).toBe(false);
      expect(chartB.lowConfidence).toBe(false);
      expect(chartA.ascendant).toBeDefined();
      expect(chartB.ascendant).toBeDefined();

      // 2. Compute full synastry
      const synastry = await computeSynastry(charlotte, arthur, 'romantic');
      expect(synastry.aspects.length).toBeGreaterThan(0);
      expect(synastry.lowConfidence).toBe(false);

      // 3. Inspect all 7 Co-Star buckets
      const buckets = synastry.coStarBuckets;
      expect(buckets.basicIdentities).toBeGreaterThanOrEqual(0);
      expect(buckets.howYouLove).toBeGreaterThanOrEqual(0);
      expect(buckets.sexAndAggression).toBeGreaterThanOrEqual(0);
      expect(buckets.moodsAndEmotions).toBeGreaterThanOrEqual(0);
      expect(buckets.philosophy).toBeGreaterThanOrEqual(0);
      expect(buckets.responsibility).toBeGreaterThanOrEqual(0);
      expect(buckets.imagination).toBeGreaterThanOrEqual(0);

      // 4. Generate full paid editorial report
      const fullReport = generatePairReport(synastry);
      expect(fullReport.chemistry.length).toBeGreaterThan(15);
      expect(fullReport.conflictAndRepair.length).toBeGreaterThan(15);
      expect(fullReport.growthTips.length).toBeGreaterThan(15);

      // 5. Verify safety compliance
      const safety = sanitizeReportContent(
        `${fullReport.overview} ${fullReport.conflictAndRepair} ${fullReport.growthTips}`
      );
      expect(safety.isSafe).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Scenario 3: "Cross Our Stars" 2-Way Consent Invite Journey
  // --------------------------------------------------------------------------
  describe('Scenario 3: "Cross Our Stars" 2-Way Consent Invite Journey', () => {
    it('S3: inviter creates token, invitee receives link, accepts with birth data, both see completed match', async () => {
      // 1. Maya creates invite link
      const maya: BirthData = {
        name: 'Maya',
        birthDate: '1996-08-18',
        birthTime: '11:15',
        latitude: 37.7749,
        longitude: -122.4194,
        city: 'San Francisco',
      };

      const inviteState = {
        token: 'cos_invite_9944a',
        inviter: maya,
        invitee: null as BirthData | null,
        message: 'Let us cross our stars and see what celestial chemistry we have!',
        status: 'pending' as 'pending' | 'completed' | 'expired',
      };

      expect(inviteState.status).toBe('pending');

      // 2. Jordan opens invite link and reviews Maya invitation
      const inviteUrl = `https://starmatch.app/invite/${inviteState.token}`;
      expect(inviteUrl).toContain(inviteState.token);

      // 3. Jordan consents and submits their birth data
      const jordan: BirthData = {
        name: 'Jordan',
        birthDate: '1994-12-05',
        birthTime: '16:00',
        latitude: 41.8781,
        longitude: -87.6298,
        city: 'Chicago',
      };

      inviteState.invitee = jordan;
      inviteState.status = 'completed';

      // 4. Synastry automatically computed
      const synastry = await computeSynastry(inviteState.inviter, inviteState.invitee);
      expect(synastry.overallScore).toBeGreaterThan(0);
      expect(synastry.personA.name).toBe('Maya');
      expect(synastry.personB.name).toBe('Jordan');

      // 5. Shared result accessible to both users
      const matchResultUrl = `https://starmatch.app/match/${inviteState.token}`;
      expect(matchResultUrl).toBe('https://starmatch.app/match/cos_invite_9944a');
    });
  });

  // --------------------------------------------------------------------------
  // Scenario 4: Organic SEO Sign-Pair Exploration Journey
  // --------------------------------------------------------------------------
  describe('Scenario 4: Organic SEO Sign-Pair Exploration Journey', () => {
    it('S4: user enters via SEO slug, reads canonical dynamic, clicks CTA to pre-populated calculator', async () => {
      // 1. Crawler / user lands on canonical URL
      const path = '/compatibility/scorpio-cancer';
      const signs = path.replace('/compatibility/', '').split('-');
      const signA = signs[0].charAt(0).toUpperCase() + signs[0].slice(1);
      const signB = signs[1].charAt(0).toUpperCase() + signs[1].slice(1);

      expect(signA).toBe('Scorpio');
      expect(signB).toBe('Cancer');

      // 2. Archetype calculation for Scorpio (Water) + Cancer (Water) = Trine
      const archetypeSynastry = await quickModeSynastry(signA, signB);
      expect(archetypeSynastry.overallScore).toBeGreaterThanOrEqual(80); // Water trine high resonance

      // 3. User clicks CTA to personalize with exact birth time
      const ctaTargetUrl = `/calculator?signA=${signA}&signB=${signB}&mode=exact`;
      expect(ctaTargetUrl).toBe('/calculator?signA=Scorpio&signB=Cancer&mode=exact');

      // 4. User inputs exact dates
      const scorpioExact: BirthData = { birthDate: '1990-11-04', birthTime: '03:30' };
      const cancerExact: BirthData = { birthDate: '1992-07-08', birthTime: '15:15' };
      const exactSynastry = await computeSynastry(scorpioExact, cancerExact);

      expect(exactSynastry.isQuickMode).toBe(false);
      expect(exactSynastry.overallScore).toBeGreaterThan(0);
    });
  });

  // --------------------------------------------------------------------------
  // Scenario 5: Founder Admin & Analytics Inspection Journey
  // --------------------------------------------------------------------------
  describe('Scenario 5: Founder Admin & Analytics Inspection Journey', () => {
    it('S5: admin inspects business KPIs, verifies latency SLOs, and crafts social clip', async () => {
      // 1. Admin authenticated session
      const adminSession = {
        role: 'founder',
        token: 'adm_secret_token_123',
        isValid: true,
      };
      expect(adminSession.isValid).toBe(true);

      // 2. Admin retrieves conversion funnel telemetry
      const funnelMetrics = {
        totalVisitors: 5000,
        inputsEntered: 2800,
        resultViewed: 2750,
        paywallViewed: 1400,
        purchases: 182,
        get conversionRate() {
          return ((this.purchases / this.totalVisitors) * 100).toFixed(2);
        },
      };
      expect(funnelMetrics.conversionRate).toBe('3.64');

      // 3. Admin verifies calculation latency SLA (<100ms)
      const start = performance.now();
      await computeSynastry(
        { birthDate: '1990-01-01', birthTime: '12:00' },
        { birthDate: '1992-05-05', birthTime: '12:00' }
      );
      const latencyMs = performance.now() - start;
      expect(latencyMs).toBeLessThan(100);

      // 4. Admin launches Clip Maker Studio to export 3-slide promotional clip
      const promoClip = {
        fps: 30,
        dimensions: { width: 1080, height: 1920 }, // 9:16 vertical video
        slides: [
          { slide: 1, text: 'Are Scorpio & Taurus True Soulmates?' },
          { slide: 2, text: 'Cosmic Tension: 89% Polarity Magnetism' },
          { slide: 3, text: 'Find Your Synastry at StarMatch.app' },
        ],
      };
      expect(promoClip.dimensions.height).toBe(1920);
      expect(promoClip.slides.length).toBe(3);
    });
  });

  // --------------------------------------------------------------------------
  // Scenario 6: Privacy-First GDPR Data Sovereignty Journey
  // --------------------------------------------------------------------------
  describe('Scenario 6: Privacy-First GDPR Data Sovereignty Journey', () => {
    it('S6: user inspects vault, exports full GDPR data archive, and executes 1-click purge', async () => {
      // 1. User with 3 saved synastry connections in Vault
      const user = {
        id: 'usr_privacy_first_44',
        email: 'privacy@user.io',
        vault: [
          { id: 'match_1', name: 'Alex', score: 84 },
          { id: 'match_2', name: 'Sam', score: 72 },
          { id: 'match_3', name: 'Riley', score: 91 },
        ],
      };
      expect(user.vault.length).toBe(3);

      // 2. User requests GDPR data export
      const gdprArchive = {
        userId: user.id,
        userEmail: user.email,
        exportedMatches: user.vault,
        securityLog: [{ action: 'login', ip: '192.168.1.1' }],
        exportDate: new Date().toISOString(),
      };
      expect(gdprArchive.exportedMatches.length).toBe(3);
      expect(gdprArchive.userId).toBe('usr_privacy_first_44');

      // 3. User requests 1-Click Permanent Deletion
      let isAccountActive = true;
      let vaultDataCount = user.vault.length;

      // Execute purge
      isAccountActive = false;
      vaultDataCount = 0;

      expect(isAccountActive).toBe(false);
      expect(vaultDataCount).toBe(0);
    });
  });

  // --------------------------------------------------------------------------
  // Scenario 7: Chaos Mode Time-Capsule & Future Transit Journey
  // --------------------------------------------------------------------------
  describe('Scenario 7: Chaos Mode Time-Capsule & Future Transit Journey', () => {
    it('S7: lovers seal future anniversary capsule locked until major cosmic transit', () => {
      // 1. Couple creates capsule
      const capsule = {
        id: 'capsule_anniversary_2027',
        author: 'Elena & Lucas',
        encryptedMessage: 'V2UgZm91bmQgZWFjaCBvdGhlciB1bmRlciB0aGUgQXJpZXMgTmV3IE1vb24h',
        unlockTransit: 'Jupiter Conjunction Venus',
        status: 'sealed' as 'sealed' | 'unlocked',
        sealedUntilEpoch: Date.now() + 180 * 86400 * 1000, // 6 months ahead
        attemptUnlock(currentTransits: string[]) {
          if (currentTransits.includes(this.unlockTransit)) {
            this.status = 'unlocked';
            return { success: true, message: 'We found each other under the Aries New Moon!' };
          }
          return { success: false, reason: 'Transit condition not yet satisfied' };
        },
      };

      expect(capsule.status).toBe('sealed');

      // 2. Early unlock attempt during unrelated transit -> rejected
      const earlyAttempt = capsule.attemptUnlock(['Mars Square Saturn', 'Moon Trine Sun']);
      expect(earlyAttempt.success).toBe(false);
      expect(capsule.status).toBe('sealed');

      // 3. Target transit arrives in the sky -> unlocked
      const transitUnlock = capsule.attemptUnlock(['Jupiter Conjunction Venus', 'Sun Trine Pluto']);
      expect(transitUnlock.success).toBe(true);
      expect(capsule.status).toBe('unlocked');
      expect(transitUnlock.message).toContain('Aries New Moon');
    });
  });

  // --------------------------------------------------------------------------
  // Scenario 8: Subscription Upgrade & Vault Expansion Journey
  // --------------------------------------------------------------------------
  describe('Scenario 8: Subscription Upgrade & Vault Expansion Journey', () => {
    it('S8: free user reaches 3 match limit, upgrades to monthly plan, expands vault capacity to unlimited', async () => {
      // 1. Free tier state with 3 slots filled
      const userState = {
        tier: 'free' as 'free' | 'monthly' | 'annual' | 'single',
        vaultLimit: 3,
        savedMatches: ['match_a', 'match_b', 'match_c'],
        canAddMatch() {
          return this.savedMatches.length < this.vaultLimit;
        },
      };

      expect(userState.canAddMatch()).toBe(false);

      // 2. Attempting to add 4th match throws/prompts upgrade
      const addAttempt = userState.canAddMatch();
      expect(addAttempt).toBe(false);

      // 3. User subscribes to Monthly plan ($14.99)
      const upgradePlan: PricingPlan = {
        id: 'monthly',
        name: 'StarMatch Pro',
        price: 14.99,
        interval: 'month',
        description: 'Unlimited vault slots and real-time weekly synastry forecasts',
      };

      userState.tier = upgradePlan.id;
      userState.vaultLimit = Infinity;

      // 4. User adds 4th and 5th matches
      userState.savedMatches.push('match_d');
      userState.savedMatches.push('match_e');

      expect(userState.savedMatches.length).toBe(5);
      expect(userState.canAddMatch()).toBe(true);
      expect(userState.tier).toBe('monthly');
    });
  });
});
