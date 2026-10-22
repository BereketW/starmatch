import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateShareCardSvg,
  renderShareCard,
  CARD_DIMENSIONS,
} from '@/lib/share';
import {
  InviteStore,
} from '@/lib/vault/invite-store';
import {
  getTransitTriggers,
  checkCapsuleUnlockStatus,
  ChaosTimeCapsuleStore,
} from '@/lib/viral/chaos';
import { generateErosDeck } from '@/lib/viral/eros';
import manifest from '@/app/manifest';
import { computeSynastry } from '@/lib/synastry/engine';
import { decodeMatchId } from '@/lib/synastry/match-id';
import { BirthData, RelationshipType, SynastryResult } from '@/lib/synastry/types';

describe('Milestone 4 Challenger: Empirical Stress & Adversarial Suite', () => {
  const basePersonA: BirthData = {
    name: 'Ada Lovelace',
    birthDate: '1815-12-10',
    birthTime: '13:00',
    latitude: 51.5074,
    longitude: -0.1278,
    zodiacSign: 'Sagittarius',
  };

  const basePersonB: BirthData = {
    name: 'Charles Babbage',
    birthDate: '1791-12-26',
    birthTime: '18:00',
    latitude: 51.5074,
    longitude: -0.1278,
    zodiacSign: 'Capricorn',
  };

  const standardSynastry: SynastryResult = computeSynastry(basePersonA, basePersonB, 'romantic');

  // =========================================================================
  // SUITE 1: Viral Share Card Studio & Renderer Adversarial Stress
  // =========================================================================
  describe('1. Share Card SVG & Renderer Adversarial Stress', () => {
    it('handles extreme name lengths: empty, whitespace-only, and 10,000 characters', () => {
      // Empty string
      const synastryEmptyName = {
        ...standardSynastry,
        personA: { ...standardSynastry.personA, name: '' },
        personB: { ...standardSynastry.personB, name: '   ' },
      };
      const svgEmpty = generateShareCardSvg({ synastry: synastryEmptyName, format: '9:16' });
      // Should fall back gracefully to zodiac sign or 'You' / 'Them'
      expect(svgEmpty).toContain('Sagittarius');
      expect(svgEmpty).toContain('Capricorn');

      // 10,000 char huge name
      const hugeName = 'A'.repeat(10000);
      const synastryHugeName = {
        ...standardSynastry,
        personA: { ...standardSynastry.personA, name: hugeName },
      };
      const svgHuge = generateShareCardSvg({ synastry: synastryHugeName, format: '1:1' });
      expect(svgHuge).toContain(hugeName);
      expect(svgHuge.length).toBeGreaterThan(10000);
    });

    it('neutralizes malicious XSS, HTML, and XML injection vectors in names and inputs', () => {
      const maliciousName = `"><script>alert('XSS')</script><svg onload="exploit()">&'`;
      const synastryMalicious = {
        ...standardSynastry,
        personA: { ...standardSynastry.personA, name: maliciousName },
      };

      const svg916 = generateShareCardSvg({ synastry: synastryMalicious, format: '9:16' });
      const svg11 = generateShareCardSvg({ synastry: synastryMalicious, format: '1:1' });

      for (const svg of [svg916, svg11]) {
        // Raw unescaped angle brackets or quotes must not appear
        expect(svg).not.toContain('<script>');
        expect(svg).not.toContain('"><svg onload');
        // Escaped entities must be present
        expect(svg).toContain('&lt;script&gt;');
        expect(svg).toContain('&amp;');
        expect(svg).toContain('&quot;');
        expect(svg).toContain('&apos;');
      }
    });

    it('preserves complex Unicode, composite emojis, RTL, and multilingual scripts cleanly', () => {
      const emojiName = '🪐 Astro ✨ ❤️‍🔥 👑';
      const rtlName = 'فاطمة & יוסף';
      const cjkName = '周杰伦 × 宇多田ヒカル';

      const synastryUnicode = {
        ...standardSynastry,
        personA: { ...standardSynastry.personA, name: `${emojiName} ${rtlName}` },
        personB: { ...standardSynastry.personB, name: cjkName },
      };

      const svg = generateShareCardSvg({ synastry: synastryUnicode, format: '9:16' });
      expect(svg).toContain('🪐 Astro ✨ ❤️‍🔥 👑');
      expect(svg).toContain('فاطمة &amp; יוסף');
      expect(svg).toContain('周杰伦 × 宇多田ヒカル');
    });

    it('handles extreme scores (0, 100, negative, >100) and fractional orbs', () => {
      // Score = 0
      const synastryZero = { ...standardSynastry, overallScore: 0 };
      const svgZero = generateShareCardSvg({ synastry: synastryZero, format: '9:16' });
      expect(svgZero).toContain('0<tspan');
      expect(svgZero).toContain('width="0"');

      // Score = 100
      const synastryHundred = { ...standardSynastry, overallScore: 100 };
      const svgHundred = generateShareCardSvg({ synastry: synastryHundred, format: '1:1' });
      expect(svgHundred).toContain('100<tspan');
      expect(svgHundred).toContain('width="300"'); // 300 * (100/100)

      // Extreme orb aspect
      const synastryExtremeOrb = {
        ...standardSynastry,
        strongestAspect: {
          planetA: 'Sun',
          planetB: 'Pluto',
          type: 'conjunction' as const,
          angle: 0.001,
          orb: 0.001,
          weight: 10,
          description: 'A razor-sharp exact alignment with 0.001 degree orb.',
        },
      };
      const svgOrb = generateShareCardSvg({ synastry: synastryExtremeOrb, format: '9:16' });
      expect(svgOrb).toContain('0.001 degree orb');
      expect(svgOrb).toContain('razor-sharp');
    });

    it('survives completely missing / undefined nested payloads without throwing', () => {
      const barebonesSynastry: SynastryResult = {
        personA: undefined as unknown as BirthData,
        personB: undefined as unknown as BirthData,
        relationshipType: undefined as unknown as RelationshipType,
        overallScore: undefined as unknown as number,
        categories: undefined as unknown as SynastryResult['categories'],
        coStarBuckets: undefined as unknown as SynastryResult['coStarBuckets'],
        aspects: [],
        strongestAspect: undefined as unknown as SynastryResult['strongestAspect'],
        transits: { power: [], pressure: [] },
        dailyDoDont: undefined as unknown as SynastryResult['dailyDoDont'],
        isQuickMode: false,
        lowConfidence: false,
      };

      expect(() => {
        const svg916 = generateShareCardSvg({ synastry: barebonesSynastry, format: '9:16' });
        expect(svg916).toContain('You');
        expect(svg916).toContain('Them');
        expect(svg916).toContain('50'); // default score fallback
      }).not.toThrow();

      expect(() => {
        const svg11 = generateShareCardSvg({ synastry: barebonesSynastry, format: '1:1' });
        expect(svg11).toContain('You');
        expect(svg11).toContain('Them');
      }).not.toThrow();
    });

    it('exercises all combinations of themes, formats, and watermarks', () => {
      const formats: Array<'9:16' | '1:1'> = ['9:16', '1:1'];
      const themes: Array<'dark' | 'light'> = ['dark', 'light'];
      const watermarks = [true, false];

      for (const format of formats) {
        for (const theme of themes) {
          for (const watermark of watermarks) {
            const svg = generateShareCardSvg({
              synastry: standardSynastry,
              format,
              theme,
              watermark,
            });

            const expectedDim = CARD_DIMENSIONS[format];
            expect(svg).toContain(`width="${expectedDim.width}"`);
            expect(svg).toContain(`height="${expectedDim.height}"`);

            if (theme === 'light') {
              expect(svg).toContain('#ffffff');
            } else {
              expect(svg).toContain('#050505');
            }

            if (watermark) {
              expect(svg).toContain('CROSS YOUR STARS AT STARMATCH.APP');
            } else {
              expect(svg).not.toContain('CROSS YOUR STARS AT STARMATCH.APP');
            }
          }
        }
      }
    });

    it('renderShareCard produces valid base64 data URL in Node environment', async () => {
      const dataUrl = await renderShareCard({
        synastry: standardSynastry,
        format: '1:1',
      });

      expect(dataUrl.startsWith('data:image/svg+xml;base64,')).toBe(true);
      const b64 = dataUrl.replace('data:image/svg+xml;base64,', '');
      const decoded = Buffer.from(b64, 'base64').toString('utf-8');
      expect(decoded).toContain('<svg');
      expect(decoded).toContain('viewBox="0 0 1080 1080"');
    });

    it('documents XML entity compliance and presence of HTML entity references in SVG template', () => {
      const svg916 = generateShareCardSvg({ synastry: standardSynastry, format: '9:16' });
      const svg11 = generateShareCardSvg({ synastry: standardSynastry, format: '1:1' });

      // In XML 1.0, only &amp;, &lt;, &gt;, &quot;, &apos; are predefined.
      // Named HTML entities &ldquo;, &rdquo;, and &bull; require DTD or numeric/UTF-8 forms in pure XML parsers.
      const hasLdquo = svg916.includes('&ldquo;') || svg11.includes('&ldquo;');
      const hasRdquo = svg916.includes('&rdquo;') || svg11.includes('&rdquo;');
      const hasBull = svg11.includes('&bull;');

      // Empirically document whether template contains HTML entity references:
      expect(hasLdquo).toBe(true);
      expect(hasRdquo).toBe(true);
      expect(hasBull).toBe(true);

      // Verify that escaping function itself only produces valid XML entities:
      const escaped = generateShareCardSvg({
        synastry: {
          ...standardSynastry,
          personA: { ...standardSynastry.personA, name: 'A & B < C > D " E \' F' },
        },
        format: '9:16',
      });
      expect(escaped).toContain('A &amp; B &lt; C &gt; D &quot; E &apos; F');
    });
  });

  // =========================================================================
  // SUITE 2: InviteStore Concurrency, Expiration & Token Security Stress
  // =========================================================================
  describe('2. InviteStore Concurrency, Expiration & Token Security', () => {
    let store: InviteStore;

    beforeEach(() => {
      store = new InviteStore();
    });

    it('generates 200 cryptographically distinct tokens with zero collisions under concurrent creation', async () => {
      const count = 200;
      const promises = Array.from({ length: count }, (_, i) =>
        Promise.resolve().then(() =>
          store.createInvite({
            personA: { name: `Inviter_${i}`, birthDate: '1995-01-01', zodiacSign: 'Capricorn' },
          })
        )
      );

      const records = await Promise.all(promises);
      const tokens = records.map((r) => r.token);
      const uniqueTokens = new Set(tokens);

      expect(uniqueTokens.size).toBe(count);
      for (const t of tokens) {
        expect(t).toMatch(/^inv_[0-9a-f]{32}$/);
      }
    });

    it('handles 50 concurrent completeInvite attempts idempotently on the same token', async () => {
      const invite = store.createInvite({
        personA: basePersonA,
        relationshipType: 'crush',
      });

      // 50 parallel acceptance requests with identical Person B
      const attempts = Array.from({ length: 50 }, () =>
        Promise.resolve().then(() => store.completeInvite(invite.token, basePersonB))
      );

      const results = await Promise.all(attempts);

      // Every attempt must succeed and return the exact same matchId
      const firstMatchId = results[0].matchId;
      expect(firstMatchId).toBeDefined();

      for (const res of results) {
        expect(res.matchId).toBe(firstMatchId);
        expect(res.invite.status).toBe('completed');
        expect(res.invite.personB?.name).toBe('Charles Babbage');
      }

      // Stored record should reflect completion
      const stored = store.getInvite(invite.token);
      expect(stored?.status).toBe('completed');
      expect(stored?.matchId).toBe(firstMatchId);
    });

    it('strictly enforces expiration threshold at boundary (now vs expiresAt)', () => {
      const invite = store.createInvite({
        personA: basePersonA,
        expiresInDays: 7,
      });

      // 1 second before expiry: invite is valid
      const record = store.getInvite(invite.token);
      expect(record).not.toBeNull();
      expect(record?.status).toBe('pending');

      // Simulate passage of time past expiresAt
      if (record) {
        record.expiresAt = Date.now() - 1;
      }

      // Re-fetching should now transition status to 'expired'
      const expiredRecord = store.getInvite(invite.token);
      expect(expiredRecord?.status).toBe('expired');

      // Attempting to complete an expired invite must throw
      expect(() => {
        store.completeInvite(invite.token, basePersonB);
      }).toThrow('This invite has expired');
    });

    it('ensures completed invites remain completed and do not transition to expired', () => {
      const invite = store.createInvite({
        personA: basePersonA,
      });

      const { invite: completed } = store.completeInvite(invite.token, basePersonB);
      expect(completed.status).toBe('completed');

      // Now set expiresAt in the past
      completed.expiresAt = Date.now() - 100000;

      // getInvite should NOT change status from 'completed' to 'expired'
      const refetched = store.getInvite(invite.token);
      expect(refetched?.status).toBe('completed');
    });

    it('safely handles non-existent, malformed, and attack tokens', () => {
      const maliciousTokens = [
        '',
        '   ',
        'inv_nonexistent',
        "' OR '1'='1",
        '<script>alert(1)</script>',
        'inv_' + 'f'.repeat(10000),
      ];

      for (const token of maliciousTokens) {
        expect(store.getInvite(token)).toBeNull();
        expect(() => {
          store.completeInvite(token, basePersonB);
        }).toThrow(/not found/i);
      }
    });

    it('generates a valid matchId that decodes loss-lessly via decodeMatchId', () => {
      const invite = store.createInvite({
        personA: basePersonA,
        relationshipType: 'coworker',
      });

      const { matchId } = store.completeInvite(invite.token, basePersonB);
      expect(matchId.startsWith('m_')).toBe(true);

      const decoded = decodeMatchId(matchId);
      expect(decoded).not.toBeNull();
      expect(decoded?.personA.name).toBe('Ada Lovelace');
      expect(decoded?.personB.name).toBe('Charles Babbage');
      expect(decoded?.relationshipType).toBe('coworker');
    });

    it('falls back to 7 days if expiresInDays is zero or negative', () => {
      const inviteZero = store.createInvite({ personA: basePersonA, expiresInDays: 0 });
      const inviteNeg = store.createInvite({ personA: basePersonA, expiresInDays: -10 });

      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      expect(inviteZero.expiresAt).toBeGreaterThanOrEqual(inviteZero.createdAt + sevenDaysMs - 100);
      expect(inviteNeg.expiresAt).toBeGreaterThanOrEqual(inviteNeg.createdAt + sevenDaysMs - 100);
    });
  });

  // =========================================================================
  // SUITE 3: Chaos Mode Planetary Transits & Temporal Hardening
  // =========================================================================
  describe('3. Chaos Mode Planetary Transits & Temporal Hardening', () => {
    let chaosStore: ChaosTimeCapsuleStore;

    beforeEach(() => {
      chaosStore = new ChaosTimeCapsuleStore();
    });

    it('computes valid future planetary triggers across varied historical & boundary dates', () => {
      const testDates = [
        new Date('1900-01-01T00:00:00Z'), // Turn of 20th century
        new Date('2000-01-01T00:00:00Z'), // Y2K
        new Date('2024-02-29T12:00:00Z'), // Leap year leap day
        new Date('2026-03-20T12:00:00Z'), // Spring equinox
        new Date('2026-06-21T12:00:00Z'), // Summer solstice
        new Date('2026-09-22T12:00:00Z'), // Autumn equinox
        new Date('2026-10-22T15:00:00Z'), // Current project anchor
        new Date('2026-12-21T12:00:00Z'), // Winter solstice
        new Date('2050-07-04T00:00:00Z'), // Future
        new Date('2099-12-31T23:59:59Z'), // End of 21st century
      ];

      for (const baseDate of testDates) {
        const triggers = getTransitTriggers(baseDate);
        expect(triggers.length).toBe(4);

        const ids = triggers.map((t) => t.id);
        expect(ids).toEqual(['full_moon', 'new_moon', 'mercury_retrograde', 'venus_mars_reckoning']);

        for (const trigger of triggers) {
          expect(trigger.targetTimestamp).toBeGreaterThan(baseDate.getTime());
          // Target date should be a valid ISO string
          const parsed = new Date(trigger.targetDate);
          expect(isNaN(parsed.getTime())).toBe(false);
          expect(parsed.getTime()).toBe(trigger.targetTimestamp);
          expect(trigger.name.length).toBeGreaterThan(5);
          expect(trigger.significance.length).toBeGreaterThan(5);
        }
      }
    });

    it('seals time-capsules safely under huge payloads and unknown triggers', () => {
      // 20,000 char message
      const massiveMessage = 'Cosmic confession '.repeat(1000);
      const capsule = chaosStore.sealCapsule({
        matchId: 'm_test_capsule',
        authorName: '<script>alert(1)</script>',
        message: massiveMessage,
        triggerId: 'unknown_trigger_id', // non-existent trigger ID
      });

      expect(capsule.id).toMatch(/^capsule_/);
      expect(capsule.isSealed).toBe(true);
      expect(capsule.authorName).toBe('<script>alert(1)</script>');
      expect(capsule.message.length).toBe(massiveMessage.trim().length);
      // Unknown trigger ID should fall back safely to triggers[0] (full_moon)
      expect(capsule.triggerId).toBe('full_moon');
    });

    it('calculates countdown boundaries with millisecond precision', () => {
      const now = 1700000000000;

      // Exactly at unlock time
      const statusExact = checkCapsuleUnlockStatus(
        {
          id: 'c1',
          authorName: 'A',
          message: 'M',
          triggerId: 'full_moon',
          triggerName: 'Full Moon',
          unlockDate: new Date(now).toISOString(),
          unlockTimestamp: now,
          isSealed: true,
          createdAt: new Date(now - 1000).toISOString(),
        },
        now
      );
      expect(statusExact.isUnlocked).toBe(true);
      expect(statusExact.timeRemainingMs).toBe(0);
      expect(statusExact.timeRemainingFormatted).toBe('UNLOCKED BY TRANSIT');

      // 1 ms before unlock
      const statusBefore = checkCapsuleUnlockStatus(
        {
          id: 'c2',
          authorName: 'A',
          message: 'M',
          triggerId: 'full_moon',
          triggerName: 'Full Moon',
          unlockDate: new Date(now + 1).toISOString(),
          unlockTimestamp: now + 1,
          isSealed: true,
          createdAt: new Date(now - 1000).toISOString(),
        },
        now
      );
      expect(statusBefore.isUnlocked).toBe(false);
      expect(statusBefore.timeRemainingMs).toBe(1);

      // 1 ms after unlock
      const statusAfter = checkCapsuleUnlockStatus(
        {
          id: 'c3',
          authorName: 'A',
          message: 'M',
          triggerId: 'full_moon',
          triggerName: 'Full Moon',
          unlockDate: new Date(now - 1).toISOString(),
          unlockTimestamp: now - 1,
          isSealed: true,
          createdAt: new Date(now - 1000).toISOString(),
        },
        now
      );
      expect(statusAfter.isUnlocked).toBe(true);
      expect(statusAfter.timeRemainingMs).toBe(0);

      // 3 days, 4 hours, 30 minutes in future
      const futureDiff = (3 * 24 * 60 + 4 * 60 + 30) * 60 * 1000;
      const statusFuture = checkCapsuleUnlockStatus(
        {
          id: 'c4',
          authorName: 'A',
          message: 'M',
          triggerId: 'full_moon',
          triggerName: 'Full Moon',
          unlockDate: new Date(now + futureDiff).toISOString(),
          unlockTimestamp: now + futureDiff,
          isSealed: true,
          createdAt: new Date(now).toISOString(),
        },
        now
      );
      expect(statusFuture.isUnlocked).toBe(false);
      expect(statusFuture.days).toBe(3);
      expect(statusFuture.hours).toBe(4);
      expect(statusFuture.minutes).toBe(30);
      expect(statusFuture.timeRemainingFormatted).toBe('3d 4h 30m');
    });

    it('isolates time-capsules by matchId correctly without data leak', () => {
      chaosStore.sealCapsule({ matchId: 'pair_1', message: 'Note 1', triggerId: 'full_moon' });
      chaosStore.sealCapsule({ matchId: 'pair_1', message: 'Note 2', triggerId: 'new_moon' });
      chaosStore.sealCapsule({ matchId: 'pair_2', message: 'Note 3', triggerId: 'full_moon' });

      const p1List = chaosStore.listCapsules('pair_1');
      const p2List = chaosStore.listCapsules('pair_2');
      const allList = chaosStore.listCapsules();

      expect(p1List.length).toBe(2);
      expect(p2List.length).toBe(1);
      expect(allList.length).toBe(3);
    });
  });

  // =========================================================================
  // SUITE 4: Eros Relationship Deck Matrix Across All 6 Relationship Types
  // =========================================================================
  describe('4. Eros Relationship Prompts Matrix Across All 6 Relationship Types', () => {
    const allRelationshipTypes: RelationshipType[] = [
      'romantic',
      'crush',
      'ex',
      'friend',
      'family',
      'coworker',
    ];

    it('generates complete, non-empty Eros decks for all 6 relationship types', () => {
      for (const relType of allRelationshipTypes) {
        const synastry = computeSynastry(basePersonA, basePersonB, relType);
        const deck = generateErosDeck(synastry);

        expect(deck.length).toBe(9);

        // Every card must have valid required fields
        for (const card of deck) {
          expect(card.id).toBeDefined();
          expect(card.id.length).toBeGreaterThan(0);
          expect(card.category).toBeDefined();
          expect(card.categoryLabel).toBeDefined();
          expect(card.title).toBeDefined();
          expect(card.title.length).toBeGreaterThan(0);
          expect(card.prompt).toBeDefined();
          expect(card.prompt.length).toBeGreaterThan(10);
          expect(card.planetaryDriver).toBeDefined();
          expect(card.planetaryDriver.length).toBeGreaterThan(5);
          expect(card.actionableProtocol).toBeDefined();
          expect(card.actionableProtocol.length).toBeGreaterThan(10);

          // Zero null, undefined, or NaN in serialized strings
          expect(card.prompt).not.toContain('undefined');
          expect(card.prompt).not.toContain('null');
          expect(card.prompt).not.toContain('NaN');
          expect(card.actionableProtocol).not.toContain('undefined');
        }

        // Verify representation of all 4 categories
        const categories = deck.map((c) => c.category);
        expect(categories).toContain('intimacy');
        expect(categories).toContain('conflict_repair');
        expect(categories).toContain('how_to_argue');
        expect(categories).toContain('note_from_the_void');
      }
    });

    it('adapts drivers based on score extremes (0 vs 100, high vs low tension)', () => {
      // Low conflict score (< 60) triggers 'Saturnian Pressure Dynamic'
      const synastryLowConflict = {
        ...standardSynastry,
        categories: { ...standardSynastry.categories, conflictStyle: 30, chemistry: 85 },
      };
      const deckLow = generateErosDeck(synastryLowConflict);
      const repairCardLow = deckLow.find((c) => c.id === 'eros_repair_1');
      const intimacyCardHigh = deckLow.find((c) => c.id === 'eros_intimacy_2');

      expect(repairCardLow?.planetaryDriver).toBe('Saturnian Pressure Dynamic');
      expect(intimacyCardHigh?.planetaryDriver).toBe('High-Tension Mars-Venus Resonance');

      // High conflict score (>= 60) and lower chemistry (<= 70)
      const synastryHighConflict = {
        ...standardSynastry,
        categories: { ...standardSynastry.categories, conflictStyle: 80, chemistry: 45 },
      };
      const deckHigh = generateErosDeck(synastryHighConflict);
      const repairCardHigh = deckHigh.find((c) => c.id === 'eros_repair_1');
      const intimacyCardSubtle = deckHigh.find((c) => c.id === 'eros_intimacy_2');

      expect(repairCardHigh?.planetaryDriver).toBe('Balanced Mars-Mercury Cadence');
      expect(intimacyCardSubtle?.planetaryDriver).toBe('Subtle Venusian Alignment');
    });

    it('survives empty aspect lists and massive 50-aspect collections', () => {
      // 0 aspects
      const synastryEmptyAspects = { ...standardSynastry, aspects: [] };
      const deckEmpty = generateErosDeck(synastryEmptyAspects);
      expect(deckEmpty.length).toBe(9);

      // 50 aspects
      const manyAspects = Array.from({ length: 50 }, (_, i) => ({
        planetA: 'Sun',
        planetB: 'Moon',
        type: 'trine' as const,
        angle: 120,
        orb: 1.5,
        weight: i + 1,
        description: `Aspect ${i + 1}`,
      }));
      const synastryManyAspects = { ...standardSynastry, aspects: manyAspects };
      const deckMany = generateErosDeck(synastryManyAspects);
      expect(deckMany.length).toBe(9);
    });

    it('documents prompt contextual nuance across romantic vs professional relationship types', () => {
      const coworkerSynastry = computeSynastry(basePersonA, basePersonB, 'coworker');
      const coworkerDeck = generateErosDeck(coworkerSynastry);

      // Card 2 is 'Kinetic Re-Centering' with erotic/physical tension prompt
      const kineticCard = coworkerDeck.find((c) => c.id === 'eros_intimacy_2');
      expect(kineticCard).toBeDefined();
      expect(kineticCard?.prompt).toContain('physical pull');
      // Documenting: In current M4 implementation, Eros Deck prompts are universally composed
      // regardless of relationship type (romantic, coworker, family all share the same deck structure).
    });
  });

  // =========================================================================
  // SUITE 5: PWA Web App Manifest & APK Feature Parity
  // =========================================================================
  describe('5. Web PWA Manifest & App Installation Hardening', () => {
    it('strictly satisfies W3C Web App Manifest requirements', () => {
      const pwa = manifest();

      expect(pwa.name).toBe('StarMatch — Editorial Astrological Synastry');
      expect(pwa.short_name).toBe('StarMatch');
      expect(pwa.start_url).toBe('/');
      expect(pwa.display).toBe('standalone');
      expect(pwa.background_color).toBe('#050505');
      expect(pwa.theme_color).toBe('#050505');
      expect(pwa.orientation).toBe('portrait');

      // Icons check
      expect(Array.isArray(pwa.icons)).toBe(true);
      expect(pwa.icons?.length).toBeGreaterThanOrEqual(3);

      const sizes = pwa.icons?.map((i) => i.sizes);
      expect(sizes).toContain('192x192');
      expect(sizes).toContain('512x512');
      expect(sizes).toContain('any');

      // Shortcuts check
      expect(Array.isArray(pwa.shortcuts)).toBe(true);
      expect(pwa.shortcuts?.length).toBe(3);

      const shortcutNames = pwa.shortcuts?.map((s) => s.name);
      expect(shortcutNames).toContain('Check Crush');
      expect(shortcutNames).toContain("Today's Pair Do/Don't");
      expect(shortcutNames).toContain('My Birth Chart');

      for (const s of pwa.shortcuts || []) {
        expect(s.url.startsWith('/')).toBe(true);
        expect(s.description?.length).toBeGreaterThan(10);
      }
    });
  });
});
