import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateOtpCode,
  generateMagicToken,
  canAddPairToVault,
  assertVaultCapacity,
  generateGdprArchive,
  VaultManager,
  globalVaultManager,
  executePermanentAccountPurge,
  DEFAULT_PRICING_CATALOG,
  STARMATCH_REFUND_POLICY,
  isRefundEligible,
  validateCheckoutEligibility,
  toCents,
  createCustomerPortalRedirect,
  resolveEntitlementFromSession,
  MAX_FREE_VAULT_SLOTS,
} from '@/lib/vault';

describe('Vault, Auth & Billing (Features 10 & 11)', () => {
  let vaultManager: VaultManager;

  beforeEach(() => {
    vaultManager = new VaultManager();
  });

  describe('Feature 11: Auth & Token Generation', () => {
    it('F11-1: generates 6-digit numeric OTP code', () => {
      for (let i = 0; i < 20; i++) {
        const otp = generateOtpCode();
        expect(otp).toMatch(/^\d{6}$/);
        const num = parseInt(otp, 10);
        expect(num).toBeGreaterThanOrEqual(100000);
        expect(num).toBeLessThanOrEqual(999999);
      }
    });

    it('F11-2: generates 64-character URL-safe hexadecimal magic token', () => {
      const token = generateMagicToken();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64);
      expect(token).toMatch(/^[0-9a-fA-F]{64}$/);
    });

    it('F11-3: creates auth challenge and verifies with correct OTP', () => {
      const email = 'user@example.com';
      const challenge = vaultManager.createAuthChallenge(email);

      expect(challenge.email).toBe(email);
      expect(challenge.otpCode).toMatch(/^\d{6}$/);
      expect(challenge.magicToken.length).toBe(64);

      // Verify with wrong OTP fails
      const failSession = vaultManager.verifyOtp(email, '000000');
      expect(failSession).toBeNull();

      // Verify with correct OTP succeeds and returns session
      const validSession = vaultManager.verifyOtp(email, challenge.otpCode);
      expect(validSession).toBeDefined();
      expect(validSession?.email).toBe(email);
      expect(validSession?.token).toMatch(/^sess_/);
      expect(validSession?.isSubscriber).toBe(false);

      // Challenge is single-use: second attempt fails
      expect(vaultManager.verifyOtp(email, challenge.otpCode)).toBeNull();
    });

    it('F11-4: verifies auth challenge via 64-character magic token', () => {
      const email = 'magic@example.com';
      const challenge = vaultManager.createAuthChallenge(email);

      const session = vaultManager.verifyMagicToken(challenge.magicToken);
      expect(session).toBeDefined();
      expect(session?.email).toBe(email);
      expect(session?.isSubscriber).toBe(false);

      // Subsequent attempt with consumed token fails
      expect(vaultManager.verifyMagicToken(challenge.magicToken)).toBeNull();
    });

    it('F11-5: tracks active session status correctly', () => {
      const session = vaultManager.createSession('usr_test', 'test@test.com');
      expect(vaultManager.hasActiveSession('usr_test')).toBe(true);
      expect(vaultManager.getSession(session.token)).toEqual(session);
      expect(vaultManager.hasActiveSession('usr_unknown')).toBe(false);
    });
  });

  describe('Feature 11: Vault Capacity & Management', () => {
    it('F11-6: free tier limits saved pair vault to 3 pairs', () => {
      expect(MAX_FREE_VAULT_SLOTS).toBe(3);
      expect(canAddPairToVault(0, false)).toBe(true);
      expect(canAddPairToVault(1, false)).toBe(true);
      expect(canAddPairToVault(2, false)).toBe(true);
      expect(canAddPairToVault(3, false)).toBe(false);
      expect(canAddPairToVault(4, false)).toBe(false);

      // Subscribers have unlimited slots
      expect(canAddPairToVault(3, true)).toBe(true);
      expect(canAddPairToVault(10, true)).toBe(true);
    });

    it('F11-7: assertVaultCapacity enforces exact exception on 4th free save', () => {
      expect(() => assertVaultCapacity(2, false)).not.toThrow();
      expect(() => assertVaultCapacity(3, false)).toThrow('Vault capacity reached (3 pairs max on free tier)');
      expect(() => assertVaultCapacity(3, true)).not.toThrow();
    });

    it('F11-8: saves, retrieves, updates, and deletes pairs in vault', () => {
      const userId = 'usr_vault_1';

      // Save pair 1
      const p1 = vaultManager.savePair(userId, { name: 'Partner One', score: 85 });
      expect(p1.id).toBeDefined();
      expect(p1.name).toBe('Partner One');

      // Save pair 2 & 3
      vaultManager.savePair(userId, { name: 'Partner Two', score: 72 });
      vaultManager.savePair(userId, { name: 'Partner Three', score: 91 });

      const pairs = vaultManager.getPairs(userId);
      expect(pairs.length).toBe(3);

      // Attempt 4th save as non-subscriber throws
      expect(() => {
        vaultManager.savePair(userId, { name: 'Partner Four' }, false);
      }).toThrow(/Vault capacity reached/);

      // 4th save succeeds when subscriber
      const p4 = vaultManager.savePair(userId, { name: 'Partner Four' }, true);
      expect(p4.name).toBe('Partner Four');
      expect(vaultManager.getPairs(userId).length).toBe(4);

      // Update pair
      const updated = vaultManager.updatePair(userId, p1.id, { notes: 'High emotional affinity' });
      expect(updated?.notes).toBe('High emotional affinity');

      // Delete pair
      const deleted = vaultManager.deletePair(userId, p1.id);
      expect(deleted).toBe(true);
      expect(vaultManager.getPairs(userId).length).toBe(3);
    });
  });

  describe('Feature 11: GDPR Export & Permanent Account Purge', () => {
    it('F11-9: generates GDPR-compliant JSON data export archive', () => {
      const user = { id: 'usr_export_1', email: 'privacy@user.com' };
      const pairs = [
        { id: 'p_1', name: 'Alex', score: 88, relationshipType: 'romantic' as const },
        { id: 'p_2', name: 'Sam', score: 74, relationshipType: 'coworker' as const },
      ];

      const archive = generateGdprArchive(user, pairs);

      expect(archive.userId).toBe('usr_export_1');
      expect(archive.userEmail).toBe('privacy@user.com');
      expect(archive.formatVersion).toBe('1.0');
      expect(archive.savedMatches.length).toBe(2);
      expect(archive.exportedMatches.length).toBe(2);
      expect(archive.exportedMatches[0].name).toBe('Alex');
      expect(archive.securityLog.length).toBeGreaterThan(0);

      // Valid JSON round-trip
      const json = JSON.stringify(archive);
      const parsed = JSON.parse(json);
      expect(parsed.formatVersion).toBe('1.0');
      expect(parsed.userId).toBe('usr_export_1');
    });

    it('F11-10: executes 1-click total account and birth data deletion contract', () => {
      const userId = 'usr_purge_test';
      vaultManager.createSession(userId, 'purge@test.com');
      vaultManager.savePair(userId, { name: 'Partner A' }, false);
      vaultManager.savePair(userId, { name: 'Partner B' }, false);

      expect(vaultManager.getPairs(userId).length).toBe(2);
      expect(vaultManager.hasActiveSession(userId)).toBe(true);

      const purgeResult = vaultManager.purgeAccount(userId);
      expect(purgeResult.success).toBe(true);
      expect(purgeResult.recordsPurged.userProfiles).toBe(1);
      expect(purgeResult.recordsPurged.vaultPairs).toBe(2);
      expect(purgeResult.recordsPurged.birthRecords).toBe(4);
      expect(purgeResult.recordsPurged.activeSessions).toBe(1);

      // Data is completely wiped
      expect(vaultManager.getPairs(userId).length).toBe(0);
      expect(vaultManager.hasActiveSession(userId)).toBe(false);
    });

    it('F11-11: global purge helper and instance execute safely', () => {
      expect(globalVaultManager).toBeInstanceOf(VaultManager);
      const result = executePermanentAccountPurge('usr_anon_global');
      expect(result.success).toBe(true);
      expect(result.recordsPurged.userProfiles).toBe(1);
    });
  });

  describe('Feature 10: Transparent Billing, Pricing & Checkout', () => {
    it('F10-1: defines $6.99 single report one-time price point', () => {
      const single = DEFAULT_PRICING_CATALOG.single;
      expect(single.price).toBe(6.99);
      expect(single.type).toBe('one-time');
      expect(toCents(single.price)).toBe(699);
    });

    it('F10-2: defines $7.99/mo monthly recurring plan', () => {
      const monthly = DEFAULT_PRICING_CATALOG.monthly;
      expect(monthly.price).toBe(7.99);
      expect(monthly.interval).toBe('month');
      expect(monthly.type).toBe('recurring');
      expect(toCents(monthly.price)).toBe(799);
    });

    it('F10-3: defines $39.99/yr annual recurring plan', () => {
      const annual = DEFAULT_PRICING_CATALOG.annual;
      expect(annual.price).toBe(39.99);
      expect(annual.interval).toBe('year');
      expect(annual.type).toBe('recurring');
      expect(toCents(annual.price)).toBe(3999);
    });

    it('F10-4: mandates 18+ age verification before checkout submission', () => {
      expect(() => {
        validateCheckoutEligibility({ ageConfirmed: false });
      }).toThrow(/18\+/);

      expect(validateCheckoutEligibility({ ageConfirmed: true, amount: 6.99 })).toBe(true);
    });

    it('F10-5: enforces 14-day transparent refund policy terms', () => {
      expect(STARMATCH_REFUND_POLICY.windowDays).toBe(14);
      expect(STARMATCH_REFUND_POLICY.allowSelfServe).toBe(true);

      const now = Date.now();
      const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
      const twentyDaysAgo = now - 20 * 24 * 60 * 60 * 1000;

      expect(isRefundEligible(threeDaysAgo)).toBe(true);
      expect(isRefundEligible(twentyDaysAgo)).toBe(false);
    });

    it('F10-6: provides 2-click Stripe customer portal cancellation redirect', () => {
      const portal = createCustomerPortalRedirect('cus_xyz987');
      expect(portal.action).toBe('portal_redirect');
      expect(portal.portalUrl).toMatch(/^https:\/\/billing\.stripe\.com/);
      expect(portal.portalUrl).toContain('cus_xyz987');
    });

    it('F10-7: resolves user entitlements from Stripe checkout webhook session', () => {
      const singleSession = {
        id: 'cs_test_1',
        customer_email: 'buyer@test.com',
        amount_total: 699,
        currency: 'usd',
        payment_status: 'paid' as const,
        metadata: {
          userId: 'usr_buyer_1',
          matchId: 'match_pair_1',
          planType: 'single' as const,
        },
      };

      const entitlement = resolveEntitlementFromSession(singleSession);
      expect(entitlement.userId).toBe('usr_buyer_1');
      expect(entitlement.matchId).toBe('match_pair_1');
      expect(entitlement.planType).toBe('single');
      expect(entitlement.isUnlocked).toBe(true);
      expect(entitlement.expiresAt).toBeNull(); // Lifetime single report

      const monthlySession = {
        id: 'cs_test_2',
        customer_email: 'sub@test.com',
        amount_total: 799,
        currency: 'usd',
        payment_status: 'paid' as const,
        metadata: {
          userId: 'usr_sub_2',
          planType: 'monthly' as const,
        },
      };

      const monthlyEntitlement = resolveEntitlementFromSession(monthlySession);
      expect(monthlyEntitlement.isUnlocked).toBe(true);
      expect(monthlyEntitlement.expiresAt).not.toBeNull();
    });
  });
});
