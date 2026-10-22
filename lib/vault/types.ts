import { BirthData, RelationshipType, SynastryAspect, NatalChart } from '@/lib/astro/types';
import { CategoryScores } from '@/lib/synastry/types';

export interface AuthChallenge {
  email: string;
  otpCode: string; // 6 digits
  magicToken: string; // 64-char hex string
  expiresAt: number; // Epoch ms
  createdAt: number;
}

export interface AuthSession {
  token: string;
  userId: string;
  email: string;
  isSubscriber: boolean;
  tier: 'free' | 'monthly' | 'annual' | 'single';
  createdAt: string; // ISO-8601
  expiresAt: string; // ISO-8601
}

export interface SavedPair {
  id: string;
  userId: string;
  partnerName?: string;
  name?: string;
  score?: number;
  personA?: BirthData;
  personB?: BirthData;
  relationshipType?: RelationshipType;
  overallScore?: number;
  scores?: CategoryScores;
  strongestAspect?: SynastryAspect;
  nicknameA?: string;
  nicknameB?: string;
  notes?: string;
  tags?: string[];
  isFavorite?: boolean;
  isReportUnlocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VaultState {
  pairs: SavedPair[];
  vaultLimit: number;
  isSubscriber: boolean;
  lastSyncedAt?: string;
}

export interface GdprExportArchive {
  userId: string;
  userEmail: string;
  exportedAt: string;
  exportDate: string;
  formatVersion: '1.0';
  natalChart?: NatalChart | null;
  savedMatches: Array<{
    id: string;
    partner?: string;
    name?: string;
    score: number;
    synastryId?: string;
    createdAt?: string;
    relationshipType?: RelationshipType;
  }>;
  exportedMatches: Array<{
    id: string;
    name?: string;
    score: number;
  }>;
  transactions: Array<{
    id: string;
    amount: number;
    currency: string;
    date: string;
    plan: string;
    status: string;
  }>;
  securityLog: Array<{
    action: string;
    ip?: string;
    userAgent?: string;
    timestamp: string;
  }>;
}

export interface PurgeResult {
  success: boolean;
  recordsPurged: {
    userProfiles: number;
    birthRecords: number;
    vaultPairs: number;
    activeSessions: number;
  };
  purgedAt: string;
}

export interface PricingPlan {
  id: 'single' | 'monthly' | 'annual' | 'free';
  name: string;
  price: number;
  interval?: 'month' | 'year';
  type?: 'one-time' | 'recurring';
  description: string;
  features?: string[];
}

export interface RefundPolicy {
  windowDays: number;
  allowSelfServe: boolean;
  disclaimer: string;
}

export interface CheckoutSessionWebhookPayload {
  id: string;
  customer_email: string;
  amount_total: number;
  currency: string;
  payment_status: 'paid' | 'unpaid' | 'no_payment_required';
  metadata: {
    userId: string;
    matchId?: string;
    planType: 'single' | 'monthly' | 'annual';
  };
}

export interface EntitlementResolution {
  userId: string;
  matchId?: string;
  planType: 'single' | 'monthly' | 'annual';
  isUnlocked: boolean;
  unlockedAt: string;
  expiresAt: string | null;
}
