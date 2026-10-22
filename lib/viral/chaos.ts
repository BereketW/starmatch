import * as Astronomy from 'astronomy-engine';

export interface TransitTrigger {
  id: string;
  name: string;
  description: string;
  targetDate: string; // ISO string
  targetTimestamp: number;
  celestialBody: string;
  significance: string;
}

export interface TimeCapsuleRecord {
  id: string;
  matchId?: string;
  authorName: string;
  message: string;
  triggerId: string;
  triggerName: string;
  unlockDate: string;
  unlockTimestamp: number;
  isSealed: boolean;
  createdAt: string;
}

const CAPSULES_STORAGE_KEY = 'starmatch_chaos_capsules';

/**
 * Calculates deterministic future celestial transit triggers using astronomy-engine.
 */
export function getTransitTriggers(baseDate: Date = new Date(Date.UTC(2026, 9, 22))): TransitTrigger[] {
  const triggers: TransitTrigger[] = [];

  // 1. Next Full Moon (Exact Lunar opposition to Sun: 180 deg)
  try {
    const nextFullMoonTime = Astronomy.SearchMoonPhase(180, baseDate, 45);
    if (!nextFullMoonTime) throw new Error('Full moon search returned null');
    const fullMoonDate = nextFullMoonTime.date;
    triggers.push({
      id: 'full_moon',
      name: 'Next Full Moon (Lunar Exposure)',
      description: 'The Moon reaches exact 180° opposition with the Sun, exposing subconscious desires and unsaid truths.',
      targetDate: fullMoonDate.toISOString(),
      targetTimestamp: fullMoonDate.getTime(),
      celestialBody: 'Moon',
      significance: 'Peak emotional clarity & unmasking',
    });
  } catch {
    // Fallback +14 days
    const fallbackDate = new Date(baseDate.getTime() + 14 * 86400000);
    triggers.push({
      id: 'full_moon',
      name: 'Next Full Moon (Lunar Exposure)',
      description: 'The Moon reaches exact 180° opposition with the Sun.',
      targetDate: fallbackDate.toISOString(),
      targetTimestamp: fallbackDate.getTime(),
      celestialBody: 'Moon',
      significance: 'Peak emotional clarity',
    });
  }

  // 2. Next New Moon (Lunar conjunction with Sun: 0 deg)
  try {
    const nextNewMoonTime = Astronomy.SearchMoonPhase(0, baseDate, 45);
    if (!nextNewMoonTime) throw new Error('New moon search returned null');
    const newMoonDate = nextNewMoonTime.date;
    triggers.push({
      id: 'new_moon',
      name: 'Next New Moon (Dark Moon Void)',
      description: 'Conjunction of luminaries in the deep void. Ideal for quiet re-commitment or releasing dead patterns.',
      targetDate: newMoonDate.toISOString(),
      targetTimestamp: newMoonDate.getTime(),
      celestialBody: 'Moon & Sun',
      significance: 'Quiet threshold of rebirth & reset',
    });
  } catch {
    const fallbackDate = new Date(baseDate.getTime() + 28 * 86400000);
    triggers.push({
      id: 'new_moon',
      name: 'Next New Moon (Dark Moon Void)',
      description: 'Conjunction of luminaries in the deep void.',
      targetDate: fallbackDate.toISOString(),
      targetTimestamp: fallbackDate.getTime(),
      celestialBody: 'Moon & Sun',
      significance: 'Quiet threshold of rebirth',
    });
  }

  // 3. Next Mercury Retrograde Station (Revisiting the Past)
  // Approximated deterministically ~55 days out
  const mercuryStationDate = new Date(baseDate.getTime() + 54 * 86400000);
  triggers.push({
    id: 'mercury_retrograde',
    name: 'Next Mercury Retrograde Station',
    description: 'Mercury slows to stationary retrograde. Words spoken rashly return to be renegotiated.',
    targetDate: mercuryStationDate.toISOString(),
    targetTimestamp: mercuryStationDate.getTime(),
    celestialBody: 'Mercury',
    significance: 'Unvarnished retrospective honesty',
  });

  // 4. Next Venus-Mars Passion Gate (Visceral Reckoning)
  // Approximated deterministically ~75 days out
  const venusMarsDate = new Date(baseDate.getTime() + 75 * 86400000);
  triggers.push({
    id: 'venus_mars_reckoning',
    name: 'Next Venus-Mars Aspect (The Reckoning)',
    description: 'Planetary alignment of erotic desire and assertive boundaries.',
    targetDate: venusMarsDate.toISOString(),
    targetTimestamp: venusMarsDate.getTime(),
    celestialBody: 'Venus & Mars',
    significance: 'Resolution of unspoken physical or romantic tension',
  });

  return triggers;
}

export class ChaosTimeCapsuleStore {
  private inMemory = new Map<string, TimeCapsuleRecord>();

  private loadStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const raw = window.localStorage.getItem(CAPSULES_STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw) as TimeCapsuleRecord[];
        for (const c of list) {
          this.inMemory.set(c.id, c);
        }
      }
    } catch {}
  }

  private saveStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const list = Array.from(this.inMemory.values());
      window.localStorage.setItem(CAPSULES_STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }

  sealCapsule(input: {
    matchId?: string;
    authorName?: string;
    message: string;
    triggerId: string;
    customBaseDate?: Date;
  }): TimeCapsuleRecord {
    this.loadStorage();
    const triggers = getTransitTriggers(input.customBaseDate);
    const trigger = triggers.find((t) => t.id === input.triggerId) || triggers[0];

    const id = `capsule_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const record: TimeCapsuleRecord = {
      id,
      matchId: input.matchId,
      authorName: input.authorName?.trim() || 'Anonymous',
      message: input.message.trim(),
      triggerId: trigger.id,
      triggerName: trigger.name,
      unlockDate: trigger.targetDate,
      unlockTimestamp: trigger.targetTimestamp,
      isSealed: true,
      createdAt: new Date().toISOString(),
    };

    this.inMemory.set(id, record);
    this.saveStorage();
    return record;
  }

  getCapsule(id: string): TimeCapsuleRecord | null {
    this.loadStorage();
    return this.inMemory.get(id) || null;
  }

  listCapsules(matchId?: string): TimeCapsuleRecord[] {
    this.loadStorage();
    const all = Array.from(this.inMemory.values());
    if (matchId) {
      return all.filter((c) => !c.matchId || c.matchId === matchId);
    }
    return all;
  }

  clear(): void {
    this.inMemory.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(CAPSULES_STORAGE_KEY);
    }
  }
}

export const globalChaosStore = new ChaosTimeCapsuleStore();

export function sealTimeCapsule(input: {
  matchId?: string;
  authorName?: string;
  message: string;
  triggerId: string;
  customBaseDate?: Date;
}): TimeCapsuleRecord {
  return globalChaosStore.sealCapsule(input);
}

export function getTimeCapsule(id: string): TimeCapsuleRecord | null {
  return globalChaosStore.getCapsule(id);
}

export function listTimeCapsules(matchId?: string): TimeCapsuleRecord[] {
  return globalChaosStore.listCapsules(matchId);
}

/**
 * Checks whether the planetary transit timestamp has passed and formats the countdown.
 */
export function checkCapsuleUnlockStatus(
  capsule: TimeCapsuleRecord,
  currentTimeMs: number = Date.now()
): {
  isUnlocked: boolean;
  timeRemainingMs: number;
  timeRemainingFormatted: string;
  days: number;
  hours: number;
  minutes: number;
} {
  const diff = capsule.unlockTimestamp - currentTimeMs;
  if (diff <= 0) {
    return {
      isUnlocked: true,
      timeRemainingMs: 0,
      timeRemainingFormatted: 'UNLOCKED BY TRANSIT',
      days: 0,
      hours: 0,
      minutes: 0,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return {
    isUnlocked: false,
    timeRemainingMs: diff,
    timeRemainingFormatted: `${days}d ${hours}h ${minutes}m`,
    days,
    hours,
    minutes,
  };
}

export { ChaosTimeCapsuleStore as TimeCapsuleStore };
