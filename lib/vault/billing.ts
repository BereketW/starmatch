import {
  PricingPlan,
  RefundPolicy,
  CheckoutSessionWebhookPayload,
  EntitlementResolution,
} from './types';
import { validateAgeConfirmation } from '@/lib/safety/filter';

export { validateAgeConfirmation };

export const DEFAULT_PRICING_CATALOG: Record<'single' | 'monthly' | 'annual' | 'free', PricingPlan> = {
  free: {
    id: 'free',
    name: 'StarMatch Free',
    price: 0.0,
    type: 'one-time',
    description: 'Instant synastry, teaser preview, 1 sharp truth, and daily Do/Don’t.',
    features: [
      'Instant pairwise synastry',
      'Free teaser preview & score gauge',
      'One Sharp Truth aspect highlight',
      'Today’s Pair Do & Don’t table',
      'Up to 3 saved pairs in vault',
    ],
  },
  single: {
    id: 'single',
    name: 'Single In-Depth Report',
    price: 6.99,
    type: 'one-time',
    description: 'Complete 7-section deep synastry report for this pair with lifetime access.',
    features: [
      'Full 7 deep report sections',
      'Aspect-by-aspect psychological breakdown',
      'Downloadable PDF & print layout',
      'Lifetime permanent report link',
    ],
  },
  monthly: {
    id: 'monthly',
    name: 'Monthly Unlimited',
    price: 7.99,
    interval: 'month',
    type: 'recurring',
    description: 'Unlimited compatibility reports and weekly synastry forecasts for all your bonds.',
    features: [
      'Unlimited saved pairs in Vault',
      'All full reports unlocked',
      'Weekly relationship transit forecast',
      'Eros intimacy & conflict repair decks',
      'Cancel in 2 clicks anytime',
    ],
  },
  annual: {
    id: 'annual',
    name: 'Annual VIP Pass',
    price: 39.99,
    interval: 'year',
    type: 'recurring',
    description: 'Full year of unlimited astrological guidance. Best value ($3.33/month).',
    features: [
      'All Monthly Unlimited features',
      'Priority planetary transit alerts',
      '58% savings compared to monthly plan',
      '14-day money-back guarantee',
    ],
  },
};

export const STARMATCH_REFUND_POLICY: RefundPolicy = {
  windowDays: 14,
  allowSelfServe: true,
  disclaimer: 'Refund requests honored within 14 days of purchase. No questions asked.',
};

/**
 * Checks if a purchase timestamp falls within the 14-day refund window.
 */
export function isRefundEligible(purchaseTimestamp: string | number | Date): boolean {
  const purchaseTime =
    purchaseTimestamp instanceof Date
      ? purchaseTimestamp.getTime()
      : typeof purchaseTimestamp === 'string'
      ? new Date(purchaseTimestamp).getTime()
      : purchaseTimestamp;

  const now = Date.now();
  const elapsedDays = (now - purchaseTime) / (1000 * 60 * 60 * 24);
  return elapsedDays >= 0 && elapsedDays <= STARMATCH_REFUND_POLICY.windowDays;
}

/**
 * Validates checkout options, ensuring 18+ verification and valid purchase amount.
 */
export function validateCheckoutEligibility(options: {
  ageConfirmed: boolean;
  termsAccepted?: boolean;
  amount?: number;
}): boolean {
  validateAgeConfirmation(options.ageConfirmed);
  if (options.amount !== undefined && options.amount <= 0) {
    throw new Error('Purchase amount must be positive');
  }
  return true;
}

/**
 * Converts dollar prices to integer cents without floating-point errors.
 */
export function toCents(price: number): number {
  return Math.round(price * 100);
}

/**
 * Generates direct Stripe customer portal URL for transparent 2-click cancellation.
 */
export function createCustomerPortalRedirect(customerId: string = 'portal_session_default'): {
  portalUrl: string;
  action: 'portal_redirect';
} {
  return {
    portalUrl: `https://billing.stripe.com/p/session/${customerId}`,
    action: 'portal_redirect',
  };
}

/**
 * Resolves user entitlement from Stripe webhook session.
 */
export function resolveEntitlementFromSession(
  session: CheckoutSessionWebhookPayload
): EntitlementResolution {
  const isPaid = session.payment_status === 'paid';
  const planType = session.metadata.planType;
  const now = new Date();

  let expiresAt: string | null = null;
  if (planType === 'monthly') {
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    expiresAt = nextMonth.toISOString();
  } else if (planType === 'annual') {
    const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    expiresAt = nextYear.toISOString();
  }

  return {
    userId: session.metadata.userId,
    matchId: session.metadata.matchId,
    planType,
    isUnlocked: isPaid,
    unlockedAt: now.toISOString(),
    expiresAt,
  };
}
