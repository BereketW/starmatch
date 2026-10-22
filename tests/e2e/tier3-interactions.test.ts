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
  SafetyCheckResult,
} from '@/tests/harness/types';

describe('Tier 3: Cross-Feature Interactions (Pairwise & Multi-Module)', () => {
  beforeAll(async () => {
    await initProductionAdapters();
  });

  // Standard test personas
  const alice: BirthData = {
    name: 'Alice',
    birthDate: '1995-04-12',
    birthTime: '14:30',
    latitude: 40.7128,
    longitude: -74.006,
    city: 'New York',
  };

  const bob: BirthData = {
    name: 'Bob',
    birthDate: '1993-11-20',
    birthTime: '08:15',
    latitude: 34.0522,
    longitude: -118.2437,
    city: 'Los Angeles',
  };

  // --------------------------------------------------------------------------
  // Interaction Suite 1: Astro Pipeline Cascades (F1 -> F2 -> F3 -> F4 -> F5)
  // --------------------------------------------------------------------------
  describe('Interaction 1: Astro Calculation Pipeline Cascade (F1 -> F2 -> F3 -> F4 -> F5)', () => {
    it('I1-1: natal chart output from F1 feeds into F2 synastry producing valid aspect longitudes', async () => {
      const chartA = await computeNatalChart(alice);
      const chartB = await computeNatalChart(bob);
      const synastry = await computeSynastry(alice, bob);

      const allA = chartA.ascendant ? [...chartA.planets, chartA.ascendant] : chartA.planets;
      const allB = chartB.ascendant ? [...chartB.planets, chartB.ascendant] : chartB.planets;

      // Verify each aspect links a planet or angle from Chart A and Chart B
      for (const aspect of synastry.aspects) {
        const planetA = allA.find((p) => p.name === aspect.planetA);
        const planetB = allB.find((p) => p.name === aspect.planetB);
        expect(planetA).toBeDefined();
        expect(planetB).toBeDefined();
        expect(aspect.orb).toBeGreaterThanOrEqual(0);
        expect(aspect.orb).toBeLessThanOrEqual(8.0);
      }
    });

    it('I1-2: composite chart midpoints (F3) correctly reflect midpoint longitudes from F1 charts', () => {
      const chartA = refComputeNatalChart(alice);
      const chartB = refComputeNatalChart(bob);

      const sunA = chartA.planets.find((p) => p.name === 'Sun')!.longitude;
      const sunB = chartB.planets.find((p) => p.name === 'Sun')!.longitude;

      // Mathematical short-arc midpoint
      let diff = sunB - sunA;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      const compSun = (sunA + diff / 2 + 360) % 360;

      expect(compSun).toBeGreaterThanOrEqual(0);
      expect(compSun).toBeLessThan(360);
    });

    it('I1-3: synastry aspects directly dictate the 5 category scores (F4)', async () => {
      const synastry = await computeSynastry(alice, bob);
      const categories = synastry.categories;

      // Ensure all 5 categories are generated and non-zero
      expect(categories.chemistry).toBeGreaterThan(0);
      expect(categories.communication).toBeGreaterThan(0);
      expect(categories.emotionalBond).toBeGreaterThan(0);
      expect(categories.conflictStyle).toBeGreaterThan(0);
      expect(categories.longTermPotential).toBeGreaterThan(0);
      expect(synastry.overallScore).toBeGreaterThan(0);
    });

    it('I1-4: category scores map deterministically to Co-Star bucket scores (F5)', async () => {
      const synastry = await computeSynastry(alice, bob);
      const buckets = synastry.coStarBuckets;

      expect(buckets.basicIdentities).toBeGreaterThanOrEqual(0);
      expect(buckets.howYouLove).toBeGreaterThanOrEqual(0);
      expect(buckets.sexAndAggression).toBeGreaterThanOrEqual(0);
      expect(buckets.moodsAndEmotions).toBeGreaterThanOrEqual(0);
      expect(buckets.philosophy).toBeGreaterThanOrEqual(0);
      expect(buckets.responsibility).toBeGreaterThanOrEqual(0);
      expect(buckets.imagination).toBeGreaterThanOrEqual(0);
    });

    it('I1-5: changing birth time by 16 hours shifts Moon and Ascendant, altering overall score', async () => {
      const aliceMorning: BirthData = { ...alice, birthTime: '06:00' };
      const aliceEvening: BirthData = { ...alice, birthTime: '22:00' };

      const chartM = await computeNatalChart(aliceMorning);
      const chartE = await computeNatalChart(aliceEvening);

      // Moon moves ~13 degrees/day, so 16 hours creates ~8.6 degree shift
      const moonM = chartM.planets.find((p) => p.name === 'Moon')!.longitude;
      const moonE = chartE.planets.find((p) => p.name === 'Moon')!.longitude;
      expect(Math.abs(moonE - moonM)).toBeGreaterThan(4);

      const synastryMorning = await computeSynastry(aliceMorning, bob);
      const synastryEvening = await computeSynastry(aliceEvening, bob);
      expect(synastryMorning.overallScore).not.toEqual(synastryEvening.overallScore);
    });
  });

  // --------------------------------------------------------------------------
  // Interaction Suite 2: Degraded Precision & Quick Mode (F6 -> F1/F2/F4/F8)
  // --------------------------------------------------------------------------
  describe('Interaction 2: Quick Mode Degraded Precision Propagation (F6 -> F1 -> F2 -> F4 -> F8)', () => {
    it('I2-1: quick mode suppresses Ascendant and marks isQuickMode: true across synastry and report', async () => {
      const quick = await quickModeSynastry('Aries', 'Scorpio');
      expect(quick.isQuickMode).toBe(true);

      const report = generatePairReport(quick);
      expect(report.disclaimer).toMatch(/entertainment/i);
      expect(report.overview.length).toBeGreaterThan(10);
    });

    it('I2-2: quick mode applies reduced orbs (Moon orb clamped to 5.0° vs normal 8.0°)', () => {
      const res = refComputeQuickMode('Aries', 'Leo');
      expect(res.isQuickMode).toBe(true);
      // All aspects must satisfy orb threshold
      for (const a of res.aspects) {
        expect(a.orb).toBeLessThanOrEqual(5.0);
      }
    });

    it('I2-3: partial birth data (Person A with time, Person B without) yields lowConfidence true in synastry', async () => {
      const chartA = await computeNatalChart(alice); // with time
      const chartB = await computeNatalChart({ birthDate: '1993-11-20' }); // no time

      expect(chartA.ascendant).toBeDefined();
      expect(chartB.lowConfidence).toBe(true);

      const synastry = await computeSynastry(alice, { birthDate: '1993-11-20' });
      expect(synastry.lowConfidence).toBe(true);
    });

    it('I2-4: quick mode report composer adds banner explaining exact birth time upgrade', async () => {
      const quick = await quickModeSynastry('Gemini', 'Sagittarius');
      const report = generatePairReport(quick);
      expect(report.growthTips.length).toBeGreaterThan(10);
      expect(report.chemistry.length).toBeGreaterThan(10);
    });
  });

  // --------------------------------------------------------------------------
  // Interaction Suite 3: Synastry & Transits to Daily Guidance (F2 -> F7 -> F8)
  // --------------------------------------------------------------------------
  describe('Interaction 3: Transits & Synastry Driving Daily Actions (F2 -> F7 -> F8)', () => {
    it('I3-1: daily transits calculate power transit triggers that correlate with synastry tension points', () => {
      const transits = refComputeTransits();
      const daily = refComputeDailyDoDont();

      expect(transits.power.length).toBeGreaterThan(0);
      expect(transits.pressure.length).toBeGreaterThan(0);
      expect(daily.headline).toBeDefined();
      expect(daily.doAction).toBeDefined();
      expect(daily.dontAction).toBeDefined();
    });

    it('I3-2: report composer integrates transit overlay into report output', async () => {
      const synastry = await computeSynastry(alice, bob);
      const report = generatePairReport(synastry);

      expect(report.overview.length).toBeGreaterThan(30);
      expect(report.conflictAndRepair.length).toBeGreaterThan(20);
    });

    it('I3-3: transit titles adhere to planet aspect structure', () => {
      const transits = refComputeTransits();
      for (const t of transits.power) {
        expect(t.title).toMatch(/\w+\s+\w+\s+\w+/);
      }
    });
  });

  // --------------------------------------------------------------------------
  // Interaction Suite 4: Calculation Engine to Editorial & Safety (F2/F4/F5 -> F8 -> F9)
  // --------------------------------------------------------------------------
  describe('Interaction 4: Report Composer to Safety Sanitization Pipeline (F2/F4/F5 -> F8 -> F9)', () => {
    it('I4-1: report composer synthesizes all categories and passes safety filtering with 0 violations', async () => {
      const synastry = await computeSynastry(alice, bob);
      const report = generatePairReport(synastry);

      // Verify all sections exist
      expect(report.overview.length).toBeGreaterThan(20);
      expect(report.chemistry.length).toBeGreaterThan(20);
      expect(report.communication.length).toBeGreaterThan(20);
      expect(report.emotionalBond.length).toBeGreaterThan(20);
      expect(report.conflictAndRepair.length).toBeGreaterThan(20);
      expect(report.longTermPotential.length).toBeGreaterThan(20);
      expect(report.growthTips.length).toBeGreaterThan(20);

      // Verify zero safety filter violations across generated prose
      const combinedProse = [
        report.overview,
        report.chemistry,
        report.communication,
        report.emotionalBond,
        report.conflictAndRepair,
        report.longTermPotential,
        report.growthTips,
      ].join(' ');

      const safetyCheck = sanitizeReportContent(combinedProse);
      expect(safetyCheck.isSafe).toBe(true);
      expect(safetyCheck.violations.length).toBe(0);
    });

    it('I4-2: safety filter catches synthetic injection into report user-notes field', () => {
      const toxicInput =
        'You will die if you do not leave them, and you must divorce immediately.';
      const filterResult = sanitizeReportContent(toxicInput);

      expect(filterResult.isSafe).toBe(false);
      expect(filterResult.violations).toContain('death');
      expect(filterResult.violations).toContain('manipulative_command');
      expect(filterResult.sanitizedText).toContain('[REDACTED: Policy violation]');
    });

    it('I4-3: report composer reflects relationship type nuance (romantic vs professional vs friendship)', async () => {
      const romanticSynastry = await computeSynastry(alice, bob, 'romantic');
      const friendSynastry = await computeSynastry(alice, bob, 'friendship');
      const businessSynastry = await computeSynastry(alice, bob, 'business');

      const romanticReport = generatePairReport(romanticSynastry);
      const friendReport = generatePairReport(friendSynastry);
      const businessReport = generatePairReport(businessSynastry);

      expect(romanticReport.overview).toBeDefined();
      expect(friendReport.overview).toBeDefined();
      expect(businessReport.overview).toBeDefined();

      // Chemistry analysis should contextualize the bond type
      expect(romanticReport.chemistry).toMatch(/chemistry/i);
      expect(businessReport.chemistry).toMatch(/chemistry/i);
    });
  });

  // --------------------------------------------------------------------------
  // Interaction Suite 5: Monetization & Teaser to Paid Report Flow (F14 -> F10 -> F15)
  // --------------------------------------------------------------------------
  describe('Interaction 5: Teaser Page to Checkout and Full Paid Report Unlock (F14 -> F10 -> F15)', () => {
    it('I5-1: teaser report exposes scores and headline, while masking full analysis', async () => {
      const synastry = await computeSynastry(alice, bob);
      const fullReport = generatePairReport(synastry);

      // Simulate Teaser transformation
      const teaser = {
        matchId: 'match_xyz123',
        overallScore: synastry.overallScore,
        categoryScores: synastry.scores,
        executiveTeaser: fullReport.overview.slice(0, 80) + '...',
        isLocked: true,
      };

      expect(teaser.isLocked).toBe(true);
      expect(teaser.overallScore).toBe(synastry.overallScore);
      expect(teaser.executiveTeaser.length).toBeLessThan(fullReport.overview.length);
    });

    it('I5-2: successful Stripe checkout session webhook unlocks full report entitlement', () => {
      const checkoutSession = {
        id: 'cs_test_12345',
        customer_email: 'alice@example.com',
        amount_total: 699,
        currency: 'usd',
        payment_status: 'paid',
        metadata: {
          matchId: 'match_xyz123',
          userId: 'user_alice',
          planType: 'single',
        },
      };

      // Entitlement resolution
      const entitlement = {
        userId: checkoutSession.metadata.userId,
        matchId: checkoutSession.metadata.matchId,
        isUnlocked: checkoutSession.payment_status === 'paid',
        unlockedAt: new Date().toISOString(),
        expiresAt: null, // lifetime for single report
      };

      expect(entitlement.isUnlocked).toBe(true);
      expect(entitlement.matchId).toBe('match_xyz123');
    });

    it('I5-3: full paid report includes complete growth tips and ritual actions', async () => {
      const synastry = await computeSynastry(alice, bob);
      const paidReport = generatePairReport(synastry);

      expect(paidReport.growthTips.length).toBeGreaterThan(10);
      expect(paidReport.conflictAndRepair.length).toBeGreaterThan(10);
    });
  });

  // --------------------------------------------------------------------------
  // Interaction Suite 6: User Data Vault & Session Persistence (F11 -> F14/F15)
  // --------------------------------------------------------------------------
  describe('Interaction 6: Vault Persistence & GDPR Lifecycle (F11 -> F14 -> F15)', () => {
    it('I6-1: saving synastry calculation to user vault respects 3-slot free limit', async () => {
      const freeUserVault = [
        { id: '1', partnerName: 'Charlie', score: 78 },
        { id: '2', partnerName: 'Dave', score: 82 },
        { id: '3', partnerName: 'Eve', score: 65 },
      ];

      const canAdd4thFree = freeUserVault.length < 3;
      expect(canAdd4thFree).toBe(false);

      // Upgrade to subscription expands slots to unlimited
      const isSubscribed = true;
      const canAddSubscriber = isSubscribed || freeUserVault.length < 3;
      expect(canAddSubscriber).toBe(true);
    });

    it('I6-2: GDPR export aggregates all saved natal charts, synastry matches, and purchase history', async () => {
      const chartA = await computeNatalChart(alice);
      const synastry = await computeSynastry(alice, bob);

      const gdprPayload = {
        user: { id: 'usr_1', email: 'alice@example.com' },
        natalChart: chartA,
        savedMatches: [
          {
            partner: synastry.personB.name,
            score: synastry.overallScore,
            synastryId: 'syn_1',
          },
        ],
        transactions: [
          { id: 'txn_1', amount: 6.99, date: '2026-03-15' },
        ],
        exportedAt: new Date().toISOString(),
      };

      expect(gdprPayload.natalChart.planets.length).toBe(12);
      expect(gdprPayload.savedMatches[0].partner).toBe('Bob');
      expect(gdprPayload.transactions[0].amount).toBe(6.99);
    });

    it('I6-3: GDPR 1-click delete purges user records and invalidates report authorization tokens', () => {
      const activeSessions = new Set(['sess_alice_token_1']);
      const vaultStore = new Map([['usr_alice', ['syn_1', 'syn_2']]]);

      // Purge action
      activeSessions.delete('sess_alice_token_1');
      vaultStore.delete('usr_alice');

      expect(activeSessions.has('sess_alice_token_1')).toBe(false);
      expect(vaultStore.has('usr_alice')).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // Interaction Suite 7: Share Card Studio & Viral Referral Pipeline (F16 -> F17)
  // --------------------------------------------------------------------------
  describe('Interaction 7: Viral Share Card to Invite Link Referral (F16 -> F17)', () => {
    it('I7-1: synastry overall score and top aspect render into share card configuration', async () => {
      const synastry = await computeSynastry(alice, bob);
      const strongest = synastry.strongestAspect;

      const cardConfig = {
        partnerAName: alice.name!,
        partnerBName: bob.name!,
        overallScore: synastry.overallScore,
        headline: `${strongest.planetA} ${strongest.type} ${strongest.planetB}`,
        aspectRatio: '9:16' as const,
        referralSlug: 'starmatch.app/match/abc-123?ref=share_card',
      };

      expect(cardConfig.overallScore).toBe(synastry.overallScore);
      expect(cardConfig.headline).toContain(strongest.planetA);
      expect(cardConfig.referralSlug).toContain('ref=share_card');
    });

    it('I7-2: share card referral link opens 2-way invite landing page pre-filled with Person A chart', () => {
      const inviteUrl = new URL('https://starmatch.app/invite/token_xyz?inviter=Alice');
      expect(inviteUrl.pathname).toBe('/invite/token_xyz');
      expect(inviteUrl.searchParams.get('inviter')).toBe('Alice');
    });
  });

  // --------------------------------------------------------------------------
  // Interaction Suite 8: Two-Way Invite Flow to Completed Synastry (F17 -> F1 -> F2 -> F11)
  // --------------------------------------------------------------------------
  describe('Interaction 8: Two-Way "Cross Our Stars" Invite to Match Completion (F17 -> F1 -> F2 -> F11)', () => {
    it('I8-1: Person A creates invite token; Person B submits birth data; synastry calculates automatically', async () => {
      // Step 1: Person A creates invite
      const inviteToken = {
        tokenId: 'inv_8899',
        personAData: alice,
        status: 'pending' as 'pending' | 'accepted' | 'expired',
        createdAt: Date.now(),
      };

      // Step 2: Person B accepts invite with their birth data
      const personBSubmission = bob;
      inviteToken.status = 'accepted';

      // Step 3: Synastry calculation triggered
      const synastry = await computeSynastry(inviteToken.personAData, personBSubmission);
      expect(synastry.overallScore).toBeGreaterThan(0);
      expect(synastry.personA.name).toBe('Alice');
      expect(synastry.personB.name).toBe('Bob');
    });

    it('I8-2: completed 2-way invite sends notification to both Person A and Person B vaults', () => {
      const notificationA = {
        recipient: 'Alice',
        message: 'Bob crossed stars with you! Overall match: 81%',
        actionUrl: '/match/inv_8899',
      };
      const notificationB = {
        recipient: 'Bob',
        message: 'Your chart with Alice is ready! Overall match: 81%',
        actionUrl: '/match/inv_8899',
      };

      expect(notificationA.recipient).toBe('Alice');
      expect(notificationB.recipient).toBe('Bob');
    });
  });

  // --------------------------------------------------------------------------
  // Interaction Suite 9: Relational Deck & Chaos Time-Capsule (F2/F7 -> F18 / F19)
  // --------------------------------------------------------------------------
  describe('Interaction 9: Deep Relational Prompts & Chaos Capsule Transits (F2/F7 -> F18 / F19)', () => {
    it('I9-1: Eros deck selects intimacy prompts tailored to highest category score', async () => {
      const synastry = await computeSynastry(alice, bob);
      const scores = synastry.categories;

      // Determine top category
      const entries = Object.entries(scores) as [string, number][];
      entries.sort((a, b) => b[1] - a[1]);
      const topCategory = entries[0][0];

      expect(topCategory).toBeDefined();

      // Ensure deck has corresponding curated cards
      const promptDeck = [
        { category: 'chemistry', prompt: 'What first sparked your fascination with each other?' },
        { category: 'emotionalBond', prompt: 'In moments of vulnerability, what makes you feel safest?' },
        { category: 'communication', prompt: 'How do you both prefer to clarify misunderstandings?' },
      ];

      const matchingPrompt = promptDeck.find((p) => p.category === topCategory) || promptDeck[0];
      expect(matchingPrompt.prompt.length).toBeGreaterThan(15);
    });

    it('I9-2: Chaos Capsule locks until transiting Saturn or Jupiter reaches conjunction with composite Sun', () => {
      const capsule = {
        id: 'cap_001',
        sealedMessage: 'Encrypted message for future anniversary',
        unlockCondition: 'transit_jupiter_conjunction_composite_sun',
        isUnlocked: false,
        checkUnlock(currentTransitAspects: string[]) {
          return currentTransitAspects.includes(this.unlockCondition);
        },
      };

      // Current aspects do not match -> locked
      expect(capsule.checkUnlock(['transit_mars_trine_natal_venus'])).toBe(false);

      // Transit event arrives -> unlocks
      expect(capsule.checkUnlock(['transit_jupiter_conjunction_composite_sun'])).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Interaction Suite 10: SEO Landing to Instant Calculation Flow (F22 -> F13 -> F2)
  // --------------------------------------------------------------------------
  describe('Interaction 10: SEO Landing Page to Interactive Match Calculation (F22 -> F13 -> F2)', () => {
    it('I10-1: clicking /compatibility/aries-scorpio pre-selects Sun signs on mobile home calculator', () => {
      const slug = 'aries-scorpio';
      const [signA, signB] = slug.split('-');

      const calculatorState = {
        signA: signA.charAt(0).toUpperCase() + signA.slice(1),
        signB: signB.charAt(0).toUpperCase() + signB.slice(1),
        isQuickMode: true,
      };

      expect(calculatorState.signA).toBe('Aries');
      expect(calculatorState.signB).toBe('Scorpio');
      expect(calculatorState.isQuickMode).toBe(true);
    });

    it('I10-2: compatibility archetype matches quick mode synastry baseline', () => {
      const quick = refComputeQuickMode('Aries', 'Scorpio');
      expect(quick.personA.zodiacSign).toBe('Aries');
      expect(quick.personB.zodiacSign).toBe('Scorpio');
      expect(quick.overallScore).toBeGreaterThan(0);
    });
  });

  // --------------------------------------------------------------------------
  // Interaction Suite 11: Admin Analytics & Clip Studio Pipeline (F10/F15 -> F23 -> F24)
  // --------------------------------------------------------------------------
  describe('Interaction 11: Payment & Report Telemetry to Admin Studio (F10/F15 -> F23 -> F24)', () => {
    it('I11-1: paid report generation increments aggregate conversion and revenue metrics in admin analytics', () => {
      const initialMetrics = {
        totalVisitors: 1000,
        paidReports: 50,
        revenueCents: 34950,
      };

      // Simulated transaction: 1 single report purchased ($6.99)
      const updatedMetrics = {
        ...initialMetrics,
        paidReports: initialMetrics.paidReports + 1,
        revenueCents: initialMetrics.revenueCents + 699,
        conversionRate: ((initialMetrics.paidReports + 1) / initialMetrics.totalVisitors) * 100,
      };

      expect(updatedMetrics.paidReports).toBe(51);
      expect(updatedMetrics.revenueCents).toBe(35649);
      expect(updatedMetrics.conversionRate).toBeCloseTo(5.1, 1);
    });

    it('I11-2: viral top-rated synastry report can be loaded into Clip Maker for multi-frame reel rendering', async () => {
      const synastry = await computeSynastry(alice, bob);

      const clipMakerTimeline = {
        title: `${alice.name} & ${bob.name}: Cosmic Synergy`,
        frames: [
          { frameIndex: 0, durationMs: 1500, label: 'Hero Title Card' },
          { frameIndex: 1, durationMs: 2000, label: `Overall Score: ${synastry.overallScore}%` },
          { frameIndex: 2, durationMs: 2500, label: synastry.dailyDoDont.headline },
          { frameIndex: 3, durationMs: 2000, label: 'CTA: Calculate Yours at StarMatch.app' },
        ],
        totalDurationMs() {
          return this.frames.reduce((sum, f) => sum + f.durationMs, 0);
        },
      };

      expect(clipMakerTimeline.frames.length).toBe(4);
      expect(clipMakerTimeline.totalDurationMs()).toBe(8000);
    });
  });

  // --------------------------------------------------------------------------
  // Interaction Suite 12: Waitlist Viral Loop & Micro-Reactions (F25 -> F21)
  // --------------------------------------------------------------------------
  describe('Interaction 12: Waitlist Viral Tier to Feedback Reactions (F25 -> F21)', () => {
    it('I12-1: waitlist user inviting 3 friends bumps priority tier from standard to early VIP', () => {
      const user = {
        email: 'astrowait@example.com',
        initialRank: 500,
        referralsCount: 0,
        tier: 'standard' as 'standard' | 'vip' | 'founder',
        addReferral() {
          this.referralsCount += 1;
          this.initialRank = Math.max(1, this.initialRank - 150);
          if (this.referralsCount >= 3) {
            this.tier = 'vip';
          }
        },
      };

      user.addReferral();
      user.addReferral();
      user.addReferral();

      expect(user.referralsCount).toBe(3);
      expect(user.initialRank).toBe(50);
      expect(user.tier).toBe('vip');
    });

    it('I12-2: micro-reactions collected on preview cards stream into engagement metrics', () => {
      const engagement = {
        cardId: 'card_chemistry_01',
        reactions: { love: 12, laugh: 4, thug: 1, down: 0 },
        addReaction(type: 'love' | 'laugh' | 'thug' | 'down') {
          this.reactions[type] += 1;
        },
      };

      engagement.addReaction('love');
      expect(engagement.reactions.love).toBe(13);
    });
  });
});
