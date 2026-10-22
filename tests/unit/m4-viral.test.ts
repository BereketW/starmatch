import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateShareCardSvg,
  renderShareCard,
} from '@/lib/share';
import {
  createInvite,
  getInvite,
  completeInvite,
  InviteStore,
} from '@/lib/vault/invite-store';
import { generateErosDeck } from '@/lib/viral/eros';
import {
  getTransitTriggers,
  sealTimeCapsule,
  checkCapsuleUnlockStatus,
  ChaosTimeCapsuleStore,
} from '@/lib/viral/chaos';
import manifest from '@/app/manifest';
import { computeSynastry } from '@/lib/synastry/engine';
import { BirthData } from '@/lib/synastry/types';

describe('Milestone 4: Viral Share Cards, Standout Mechanics & PWA', () => {
  const personA: BirthData = {
    name: 'Aria',
    birthDate: '1995-04-15',
    birthTime: '14:30',
    latitude: 40.7128,
    longitude: -74.006,
    zodiacSign: 'Aries',
  };

  const personB: BirthData = {
    name: 'Julian',
    birthDate: '1993-11-20',
    birthTime: '08:15',
    latitude: 34.0522,
    longitude: -118.2437,
    zodiacSign: 'Scorpio',
  };

  const sampleSynastry = computeSynastry(personA, personB, 'romantic');

  describe('1. Viral Share Card Studio & Renderer', () => {
    it('generates 9:16 Instagram Story SVG with exact 1080x1920 dimensions and crisp branding', () => {
      const svg = generateShareCardSvg({
        synastry: sampleSynastry,
        format: '9:16',
        theme: 'dark',
        watermark: true,
      });
      expect(typeof svg).toBe('string');
      expect(svg).toContain('<svg');
      expect(svg).toContain('viewBox="0 0 1080 1920"');
      expect(svg).toContain('width="1080"');
      expect(svg).toContain('height="1920"');
      expect(svg).toContain('Aria');
      expect(svg).toContain('Julian');
      expect(svg).toContain('STARMATCH');
      expect(svg).toContain('OVERALL RESONANCE');
      expect(svg).toContain(`${sampleSynastry.overallScore}`);
      expect(svg).toContain('%');
    });

    it('generates 1:1 Feed Post SVG with exact 1080x1080 dimensions', () => {
      const svg = generateShareCardSvg({
        synastry: sampleSynastry,
        format: '1:1',
        theme: 'dark',
        watermark: true,
      });
      expect(typeof svg).toBe('string');
      expect(svg).toContain('viewBox="0 0 1080 1080"');
      expect(svg).toContain('width="1080"');
      expect(svg).toContain('height="1080"');
      expect(svg).toContain('Aria');
      expect(svg).toContain('Julian');
      expect(svg).toContain('ONE SHARP TRUTH');
    });

    it('handles light theme configuration properly', () => {
      const svg = generateShareCardSvg({
        synastry: sampleSynastry,
        format: '1:1',
        theme: 'light',
        watermark: false,
      });
      expect(svg).toContain('#f4f4f5'); // light background fill
      expect(svg).not.toContain('CROSS YOUR STARS AT STARMATCH.APP'); // watermark excluded
    });

    it('renderShareCard falls back safely to SVG data URL in headless Node test environment', async () => {
      const dataUrl = await renderShareCard({
        synastry: sampleSynastry,
        format: '9:16',
      });
      expect(typeof dataUrl).toBe('string');
      expect(dataUrl.startsWith('data:image/svg+xml;base64,')).toBe(true);
      const decoded = Buffer.from(dataUrl.split(',')[1], 'base64').toString('utf-8');
      expect(decoded).toContain('Aria');
      expect(decoded).toContain('Julian');
    });

    it('escapes XML special characters in person names cleanly', () => {
      const synastryWithSpecialChars = {
        ...sampleSynastry,
        personA: { ...sampleSynastry.personA, name: 'Romeo & Juliet <3' },
      };
      const svg = generateShareCardSvg({
        synastry: synastryWithSpecialChars,
        format: '9:16',
      });
      expect(svg).toContain('Romeo &amp; Juliet &lt;3');
    });
  });

  describe('2. "Cross Our Stars" 2-Way Consent Invite Flow', () => {
    let inviteStore: InviteStore;

    beforeEach(() => {
      inviteStore = new InviteStore();
    });

    it('creates an invite record with token and 7-day expiration', () => {
      const invite = inviteStore.createInvite({
        personA: {
          name: 'Sophia',
          birthDate: '1998-06-21',
          birthTime: '10:00',
          latitude: 40.7128,
          longitude: -74.006,
          zodiacSign: 'Gemini',
        },
        relationshipType: 'romantic',
      });

      expect(invite.token).toMatch(/^inv_[0-9a-f]{32}$/);
      expect(invite.status).toBe('pending');
      expect(invite.personA.name).toBe('Sophia');
      expect(invite.relationshipType).toBe('romantic');

      const expectedExpiry = invite.createdAt + 7 * 24 * 60 * 60 * 1000;
      expect(invite.expiresAt).toBe(expectedExpiry);
    });

    it('retrieves an active invite by token', () => {
      const created = inviteStore.createInvite({
        personA: {
          name: 'Leo',
          birthDate: '1990-08-10',
          birthTime: '12:00',
          latitude: 51.5074,
          longitude: -0.1278,
          zodiacSign: 'Leo',
        },
      });

      const retrieved = inviteStore.getInvite(created.token);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.token).toBe(created.token);
      expect(retrieved?.personA.name).toBe('Leo');
    });

    it('returns null for unknown token', () => {
      expect(inviteStore.getInvite('inv_00000000000000000000000000000000')).toBeNull();
    });

    it('completes invite with mutual consent and generates synastry matchId', () => {
      const invite = inviteStore.createInvite({
        personA: {
          name: 'Kai',
          birthDate: '1994-03-25',
          birthTime: '16:45',
          latitude: 37.7749,
          longitude: -122.4194,
          zodiacSign: 'Aries',
        },
        relationshipType: 'friend',
      });

      const { invite: completed, matchId } = inviteStore.completeInvite(invite.token, {
        name: 'Elena',
        birthDate: '1996-09-12',
        birthTime: '09:30',
        latitude: 34.0522,
        longitude: -118.2437,
        zodiacSign: 'Virgo',
      });

      expect(completed.status).toBe('completed');
      expect(completed.personB?.name).toBe('Elena');
      expect(completed.completedAt).toBeDefined();
      expect(matchId).toBeDefined();
      expect(typeof matchId).toBe('string');
      expect(matchId.length).toBeGreaterThan(10);

      // Verify getting the invite now returns the completed state
      const rechecked = inviteStore.getInvite(invite.token);
      expect(rechecked?.status).toBe('completed');
      expect(rechecked?.matchId).toBe(matchId);
    });

    it('marks invite as expired once expiresAt has passed', () => {
      const invite = inviteStore.createInvite({
        personA: {
          name: 'PastUser',
          birthDate: '1990-01-01',
          zodiacSign: 'Capricorn',
        },
      });

      // Manually set expiresAt to the past
      const record = inviteStore.getInvite(invite.token);
      if (record) {
        record.expiresAt = Date.now() - 1000;
      }

      const expiredRecord = inviteStore.getInvite(invite.token);
      expect(expiredRecord?.status).toBe('expired');

      expect(() => {
        inviteStore.completeInvite(invite.token, {
          name: 'LateUser',
          birthDate: '1992-02-02',
          zodiacSign: 'Aquarius',
        });
      }).toThrow('This invite has expired');
    });

    it('global convenience helpers function identically', () => {
      const invite = createInvite({
        personA: {
          name: 'GlobalInviter',
          birthDate: '1991-01-01',
          zodiacSign: 'Capricorn',
        },
      });
      expect(getInvite(invite.token)).not.toBeNull();

      const { invite: accepted } = completeInvite(invite.token, {
        name: 'GlobalAcceptor',
        birthDate: '1992-02-02',
        zodiacSign: 'Aquarius',
      });
      expect(accepted.status).toBe('completed');
    });
  });

  describe('3. Standout Eros Web Relationship Deck', () => {
    it('generates cards across all mandatory relationship categories', () => {
      const cards = generateErosDeck(sampleSynastry);

      expect(cards.length).toBeGreaterThanOrEqual(4);

      const categories = cards.map((c) => c.category);
      expect(categories).toContain('intimacy');
      expect(categories).toContain('conflict_repair');
      expect(categories).toContain('how_to_argue');
      expect(categories).toContain('note_from_the_void');
    });

    it('each card provides both prompt and actionable psychological protocol', () => {
      const cards = generateErosDeck(sampleSynastry);

      for (const card of cards) {
        expect(card.id).toBeDefined();
        expect(card.title.length).toBeGreaterThan(0);
        expect(card.prompt.length).toBeGreaterThan(15);
        expect(card.planetaryDriver.length).toBeGreaterThan(5);
        expect(card.actionableProtocol.length).toBeGreaterThan(20);
        expect(card.categoryLabel.length).toBeGreaterThan(0);
      }
    });

    it('dynamically tailors argument style and conflict repair from synastry aspects', () => {
      const cards = generateErosDeck(sampleSynastry);
      const conflictCard = cards.find((c) => c.category === 'conflict_repair');
      const argCard = cards.find((c) => c.category === 'how_to_argue');

      expect(conflictCard).toBeDefined();
      expect(conflictCard?.actionableProtocol).toMatch(
        /pause|apologize|somatic|tone|repair|trigger|nervous system|resolve|breathe/i
      );

      expect(argCard).toBeDefined();
      expect(argCard?.prompt).toMatch(
        /corner|avalanche|evidence|rhetorical|argue|truth|frustration|silence|speak/i
      );
    });

    it('produces valid deterministic decks even for 2-sign quick mode synastry', () => {
      const quickSynastry = computeSynastry(
        { zodiacSign: 'Gemini' },
        { zodiacSign: 'Sagittarius' },
        'romantic'
      );
      const cards = generateErosDeck(quickSynastry);
      expect(cards.length).toBeGreaterThanOrEqual(4);
      expect(cards[0].prompt).toBeDefined();
    });
  });

  describe('4. Standout Chaos Mode Planetary Time-Capsule', () => {
    let capsuleStore: ChaosTimeCapsuleStore;

    beforeEach(() => {
      capsuleStore = new ChaosTimeCapsuleStore();
    });

    it('calculates deterministic future planetary transit triggers using astronomy engine', () => {
      const now = new Date('2026-06-01T12:00:00Z');
      const triggers = getTransitTriggers(now);

      expect(triggers.length).toBeGreaterThanOrEqual(4);

      const triggerIds = triggers.map((t) => t.id);
      expect(triggerIds).toContain('full_moon');
      expect(triggerIds).toContain('new_moon');
      expect(triggerIds).toContain('mercury_retrograde');
      expect(triggerIds).toContain('venus_mars_reckoning');

      // Every trigger target date must be strictly after the base reference date
      for (const t of triggers) {
        const targetMs = new Date(t.targetDate).getTime();
        expect(targetMs).toBeGreaterThan(now.getTime());
        expect(t.description.length).toBeGreaterThan(10);
        expect(t.significance.length).toBeGreaterThan(5);
      }
    });

    it('seals a time-capsule with locked messages and specific planetary trigger', () => {
      const capsule = sealTimeCapsule({
        matchId: 'match_test_123',
        authorName: 'Aria',
        message: 'Remember how calm we felt on the terrace.',
        triggerId: 'full_moon',
      });

      expect(capsule.id).toMatch(/^capsule_/);
      expect(capsule.isSealed).toBe(true);
      expect(capsule.matchId).toBe('match_test_123');
      expect(capsule.message).toBe('Remember how calm we felt on the terrace.');
      expect(capsule.unlockTimestamp).toBeGreaterThan(Date.now() - 5000);
    });

    it('reports locked status and positive countdown before unlock date arrives', () => {
      const futureUnlockTime = Date.now() + 1000 * 60 * 60 * 24 * 3; // 3 days in future
      const testCapsule = {
        id: 'capsule_future_1',
        authorName: 'Aria',
        message: 'Future note',
        triggerId: 'new_moon',
        triggerName: 'Next New Moon',
        unlockDate: new Date(futureUnlockTime).toISOString(),
        unlockTimestamp: futureUnlockTime,
        isSealed: true,
        createdAt: new Date().toISOString(),
      };

      const status = checkCapsuleUnlockStatus(testCapsule, Date.now());
      expect(status.isUnlocked).toBe(false);
      expect(status.timeRemainingMs).toBeGreaterThan(0);
      expect(status.days).toBeGreaterThanOrEqual(2);
      expect(status.hours).toBeGreaterThanOrEqual(0);
    });

    it('unlocks capsule when current timestamp surpasses unlockTimestamp', () => {
      const pastUnlockTime = Date.now() - 1000 * 60; // 1 minute in past
      const testCapsule = {
        id: 'capsule_past_1',
        authorName: 'Julian',
        message: 'Past note',
        triggerId: 'new_moon',
        triggerName: 'Past New Moon',
        unlockDate: new Date(pastUnlockTime).toISOString(),
        unlockTimestamp: pastUnlockTime,
        isSealed: true,
        createdAt: new Date().toISOString(),
      };

      const status = checkCapsuleUnlockStatus(testCapsule, Date.now());
      expect(status.isUnlocked).toBe(true);
      expect(status.timeRemainingMs).toBe(0);
      expect(status.days).toBe(0);
      expect(status.hours).toBe(0);
      expect(status.timeRemainingFormatted).toBe('UNLOCKED BY TRANSIT');
    });

    it('lists capsules associated with a specific matchId', () => {
      capsuleStore.sealCapsule({
        matchId: 'match_pair_A',
        authorName: 'A',
        message: 'M1',
        triggerId: 'full_moon',
      });
      capsuleStore.sealCapsule({
        matchId: 'match_pair_A',
        authorName: 'B',
        message: 'M2',
        triggerId: 'mercury_retrograde',
      });
      capsuleStore.sealCapsule({
        matchId: 'match_pair_B',
        authorName: 'X',
        message: 'M3',
        triggerId: 'full_moon',
      });

      const pairACapsules = capsuleStore.listCapsules('match_pair_A');
      expect(pairACapsules).toHaveLength(2);

      const pairBCapsules = capsuleStore.listCapsules('match_pair_B');
      expect(pairBCapsules).toHaveLength(1);
    });
  });

  describe('5. Web PWA Manifest & App Installation', () => {
    it('manifest provides correct standalone web app metadata', () => {
      const pwaManifest = manifest();

      expect(pwaManifest.name).toBe('StarMatch — Editorial Astrological Synastry');
      expect(pwaManifest.short_name).toBe('StarMatch');
      expect(pwaManifest.start_url).toBe('/');
      expect(pwaManifest.display).toBe('standalone');
      expect(pwaManifest.background_color).toBe('#050505');
      expect(pwaManifest.theme_color).toBe('#050505');
      expect(pwaManifest.orientation).toBe('portrait');
    });

    it('manifest includes quick action app shortcuts', () => {
      const pwaManifest = manifest();
      expect(pwaManifest.shortcuts).toBeDefined();
      expect(pwaManifest.shortcuts?.length).toBeGreaterThanOrEqual(3);

      const shortcutNames = pwaManifest.shortcuts?.map((s) => s.name);
      expect(shortcutNames).toContain('Check Crush');
      expect(shortcutNames).toContain("Today's Pair Do/Don't");
      expect(shortcutNames).toContain('My Birth Chart');

      const urlList = pwaManifest.shortcuts?.map((s) => s.url);
      expect(urlList).toContain('/');
      expect(urlList).toContain('/?shortcut=dodont');
      expect(urlList).toContain('/chart');
    });

    it('manifest specifies web app icon assets', () => {
      const pwaManifest = manifest();
      expect(pwaManifest.icons).toBeDefined();
      expect(pwaManifest.icons?.length).toBeGreaterThanOrEqual(2);

      const sizes = pwaManifest.icons?.map((i) => i.sizes);
      expect(sizes).toContain('192x192');
      expect(sizes).toContain('512x512');
    });
  });
});
