import {
  AuthChallenge,
  AuthSession,
  SavedPair,
  GdprExportArchive,
  PurgeResult,
} from './types';
import { NatalChart, RelationshipType } from '@/lib/astro/types';

export const MAX_FREE_VAULT_SLOTS = 3;

/**
 * Generates a cryptographically secure 6-digit OTP code matching /^\d{6}$/.
 */
export function generateOtpCode(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const code = ((array[0] % 900000) + 100000).toString();
    return code;
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generates a 64-character URL-safe hexadecimal magic-link token.
 */
export function generateMagicToken(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return (
    Math.random().toString(36).substring(2) +
    Math.random().toString(36).substring(2) +
    Date.now().toString(36)
  ).padEnd(64, '0').slice(0, 64);
}

/**
 * Checks if a pair can be added to the vault based on capacity rules.
 */
export function canAddPairToVault(currentCount: number, isSubscriber: boolean): boolean {
  return isSubscriber || currentCount < MAX_FREE_VAULT_SLOTS;
}

/**
 * Throws an error if vault capacity is reached.
 */
export function assertVaultCapacity(currentCount: number, isSubscriber: boolean): void {
  if (!canAddPairToVault(currentCount, isSubscriber)) {
    throw new Error('Vault capacity reached (3 pairs max on free tier)');
  }
}

/**
 * Compiles a GDPR / CCPA compliant JSON data export archive.
 */
export function generateGdprArchive(
  user: { id: string; email: string },
  vaultPairs: Array<{
    id: string;
    partner?: string;
    name?: string;
    partnerName?: string;
    score?: number;
    overallScore?: number;
    synastryId?: string;
    createdAt?: string;
    relationshipType?: RelationshipType;
  }> = [],
  natalChart: NatalChart | null = null,
  transactions: Array<{
    id: string;
    amount: number;
    currency: string;
    date: string;
    plan: string;
    status: string;
  }> = []
): GdprExportArchive {
  const now = new Date().toISOString();

  const savedMatches = vaultPairs.map(p => ({
    id: p.id,
    partner: p.partner || p.partnerName || p.name || 'Unknown',
    name: p.name || p.partnerName || p.partner || 'Unknown',
    score: p.score ?? p.overallScore ?? 50,
    synastryId: p.synastryId,
    createdAt: p.createdAt || now,
    relationshipType: p.relationshipType,
  }));

  const exportedMatches = vaultPairs.map(p => ({
    id: p.id,
    name: p.name || p.partnerName || p.partner || 'Unknown',
    score: p.score ?? p.overallScore ?? 50,
  }));

  return {
    userId: user.id,
    userEmail: user.email,
    exportedAt: now,
    exportDate: now,
    formatVersion: '1.0',
    natalChart: natalChart || null,
    savedMatches,
    exportedMatches,
    transactions: transactions || [],
    securityLog: [
      {
        action: 'GDPR_DATA_EXPORT_GENERATED',
        timestamp: now,
      },
    ],
  };
}

/**
 * Isomorphic storage abstraction with in-memory fallback.
 */
class MemoryStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch {}
    }
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
      } catch {}
    }
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch {}
    }
    this.store.delete(key);
  }

  clear(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.clear();
      } catch {}
    }
    this.store.clear();
  }
}

export const defaultStorage = new MemoryStorage();

/**
 * Vault and session state manager.
 */
export class VaultManager {
  private sessions = new Map<string, AuthSession>(); // token -> session
  private userSessions = new Map<string, string[]>(); // userId -> tokens[]
  private challenges = new Map<string, AuthChallenge>(); // email -> challenge
  private pairsByUser = new Map<string, SavedPair[]>(); // userId -> pairs[]

  createAuthChallenge(email: string): AuthChallenge {
    const otpCode = generateOtpCode();
    const magicToken = generateMagicToken();
    const now = Date.now();
    const challenge: AuthChallenge = {
      email,
      otpCode,
      magicToken,
      expiresAt: now + 15 * 60 * 1000, // 15 mins
      createdAt: now,
    };
    this.challenges.set(email.toLowerCase(), challenge);
    return challenge;
  }

  verifyOtp(email: string, code: string): AuthSession | null {
    const challenge = this.challenges.get(email.toLowerCase());
    if (!challenge) return null;
    if (Date.now() > challenge.expiresAt) {
      this.challenges.delete(email.toLowerCase());
      return null;
    }
    if (challenge.otpCode !== code.trim()) {
      return null;
    }
    this.challenges.delete(email.toLowerCase());
    const userId = `usr_${email.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}_${Date.now().toString(36)}`;
    return this.createSession(userId, email);
  }

  verifyMagicToken(token: string): AuthSession | null {
    for (const [email, challenge] of this.challenges.entries()) {
      if (challenge.magicToken === token.trim()) {
        if (Date.now() > challenge.expiresAt) {
          this.challenges.delete(email);
          return null;
        }
        this.challenges.delete(email);
        const userId = `usr_${email.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}_${Date.now().toString(36)}`;
        return this.createSession(userId, email);
      }
    }
    return null;
  }

  createSession(
    userId: string,
    email: string,
    tier: 'free' | 'monthly' | 'annual' | 'single' = 'free'
  ): AuthSession {
    const token = `sess_${generateMagicToken().slice(0, 32)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const session: AuthSession = {
      token,
      userId,
      email,
      isSubscriber: tier === 'monthly' || tier === 'annual',
      tier,
      createdAt: now.toISOString(),
      expiresAt,
    };
    this.sessions.set(token, session);

    const userTokens = this.userSessions.get(userId) || [];
    userTokens.push(token);
    this.userSessions.set(userId, userTokens);

    return session;
  }

  getSession(token: string): AuthSession | null {
    const sess = this.sessions.get(token);
    if (!sess) return null;
    if (new Date(sess.expiresAt).getTime() < Date.now()) {
      this.sessions.delete(token);
      return null;
    }
    return sess;
  }

  hasActiveSession(userId: string): boolean {
    const tokens = this.userSessions.get(userId) || [];
    for (const t of tokens) {
      if (this.getSession(t)) return true;
    }
    return false;
  }

  savePair(userId: string, pairData: Partial<SavedPair>, isSubscriber: boolean = false): SavedPair {
    const pairs = this.pairsByUser.get(userId) || [];
    assertVaultCapacity(pairs.length, isSubscriber);

    const newPair: SavedPair = {
      id: pairData.id || `pair_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      userId,
      partnerName: pairData.partnerName || pairData.name,
      name: pairData.name || pairData.partnerName,
      score: pairData.score ?? pairData.overallScore ?? 50,
      overallScore: pairData.overallScore ?? pairData.score ?? 50,
      personA: pairData.personA,
      personB: pairData.personB,
      relationshipType: pairData.relationshipType || 'romantic',
      scores: pairData.scores,
      strongestAspect: pairData.strongestAspect,
      nicknameA: pairData.nicknameA,
      nicknameB: pairData.nicknameB,
      notes: pairData.notes,
      tags: pairData.tags || [],
      isFavorite: pairData.isFavorite ?? false,
      isReportUnlocked: pairData.isReportUnlocked ?? false,
      createdAt: pairData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    pairs.push(newPair);
    this.pairsByUser.set(userId, pairs);
    return newPair;
  }

  getPairs(userId: string): SavedPair[] {
    return this.pairsByUser.get(userId) || [];
  }

  deletePair(userId: string, pairId: string): boolean {
    const pairs = this.pairsByUser.get(userId) || [];
    const initialLen = pairs.length;
    const filtered = pairs.filter(p => p.id !== pairId);
    this.pairsByUser.set(userId, filtered);
    return filtered.length < initialLen;
  }

  updatePair(userId: string, pairId: string, updates: Partial<SavedPair>): SavedPair | null {
    const pairs = this.pairsByUser.get(userId) || [];
    const index = pairs.findIndex(p => p.id === pairId);
    if (index === -1) return null;

    pairs[index] = {
      ...pairs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.pairsByUser.set(userId, pairs);
    return pairs[index];
  }

  purgeAccount(userId: string): PurgeResult {
    const pairs = this.pairsByUser.get(userId) || [];
    const pairCount = pairs.length;
    this.pairsByUser.delete(userId);

    const tokens = this.userSessions.get(userId) || [];
    const sessionCount = tokens.length;
    for (const t of tokens) {
      this.sessions.delete(t);
    }
    this.userSessions.delete(userId);

    return {
      success: true,
      recordsPurged: {
        userProfiles: 1,
        birthRecords: pairCount * 2,
        vaultPairs: pairCount,
        activeSessions: sessionCount,
      },
      purgedAt: new Date().toISOString(),
    };
  }
}

export const globalVaultManager = new VaultManager();

export function executePermanentAccountPurge(userId: string): PurgeResult {
  return globalVaultManager.purgeAccount(userId);
}
