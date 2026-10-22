import { BirthData, RelationshipType } from '@/lib/astro/types';
import { encodeMatchId } from '@/lib/synastry/match-id';

export interface InviteRecord {
  token: string;
  personA: BirthData;
  relationshipType: RelationshipType;
  status: 'pending' | 'completed' | 'expired';
  createdAt: number;
  expiresAt: number;
  completedAt?: number;
  personB?: BirthData;
  matchId?: string;
}

export interface CreateInviteInput {
  personA: BirthData;
  relationshipType?: RelationshipType;
  expiresInDays?: number;
}

const INVITES_STORAGE_KEY = 'starmatch_invites';

/**
 * Generates a URL-safe random invite token.
 */
export function generateInviteToken(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return `inv_${hex}`;
  }
  return `inv_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
}

export class InviteStore {
  private inMemory = new Map<string, InviteRecord>();

  private loadFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const raw = window.localStorage.getItem(INVITES_STORAGE_KEY);
      if (raw) {
        const records = JSON.parse(raw) as InviteRecord[];
        for (const r of records) {
          this.inMemory.set(r.token, r);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const list = Array.from(this.inMemory.values());
      window.localStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Ignore storage errors
    }
  }

  createInvite(input: CreateInviteInput): InviteRecord {
    this.loadFromStorage();
    const token = generateInviteToken();
    const now = Date.now();
    const days = input.expiresInDays && input.expiresInDays > 0 ? input.expiresInDays : 7;
    const expiresAt = now + days * 24 * 60 * 60 * 1000;

    const record: InviteRecord = {
      token,
      personA: input.personA,
      relationshipType: input.relationshipType || 'romantic',
      status: 'pending',
      createdAt: now,
      expiresAt,
    };

    this.inMemory.set(token, record);
    this.saveToStorage();
    return record;
  }

  getInvite(token: string): InviteRecord | null {
    this.loadFromStorage();
    const record = this.inMemory.get(token);
    if (!record) return null;

    if (record.status === 'pending' && Date.now() > record.expiresAt) {
      record.status = 'expired';
      this.saveToStorage();
    }

    return record;
  }

  completeInvite(
    token: string,
    personB: BirthData
  ): { invite: InviteRecord; matchId: string } {
    const invite = this.getInvite(token);
    if (!invite) {
      throw new Error(`Invite token ${token} not found`);
    }

    if (invite.status === 'expired') {
      throw new Error('This invite has expired');
    }

    if (invite.status === 'completed' && invite.matchId) {
      return { invite, matchId: invite.matchId };
    }

    // Combine Person A and Person B to compute stateless matchId
    const matchId = encodeMatchId({
      personA: invite.personA,
      personB,
      relationshipType: invite.relationshipType,
    });

    invite.status = 'completed';
    invite.personB = personB;
    invite.matchId = matchId;
    invite.completedAt = Date.now();

    this.inMemory.set(token, invite);
    this.saveToStorage();

    return { invite, matchId };
  }

  listInvites(): InviteRecord[] {
    this.loadFromStorage();
    return Array.from(this.inMemory.values());
  }

  clear(): void {
    this.inMemory.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(INVITES_STORAGE_KEY);
    }
  }
}

export const globalInviteStore = new InviteStore();

export function createInvite(input: CreateInviteInput): InviteRecord {
  return globalInviteStore.createInvite(input);
}

export function getInvite(token: string): InviteRecord | null {
  return globalInviteStore.getInvite(token);
}

export function completeInvite(
  token: string,
  personB: BirthData
): { invite: InviteRecord; matchId: string } {
  return globalInviteStore.completeInvite(token, personB);
}
