'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export type PricingTier = 'single' | 'monthly' | 'annual';

export interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: (plan: PricingTier) => Promise<void> | void;
  pairNames?: { personA: string; personB: string };
  matchId?: string;
  defaultPlan?: PricingTier;
}

interface PlanOption {
  id: PricingTier;
  title: string;
  price: string;
  cadence: string;
  badge?: string;
  features: string[];
}

const PLANS: PlanOption[] = [
  {
    id: 'single',
    title: 'Single In-Depth Report',
    price: '$6.99',
    cadence: 'One-time payment',
    badge: 'MOST POPULAR',
    features: [
      'Lifetime permanent report link for this pair',
      'All 7 deep sections unlocked',
      'Downloadable high-res print / PDF export',
      'Complete pairwise aspect directory & orbs',
    ],
  },
  {
    id: 'monthly',
    title: 'Monthly Unlimited',
    price: '$7.99',
    cadence: 'Billed monthly',
    features: [
      'Unlimited pair reports & checks',
      'Weekly relationship transit forecast',
      'Saved pair vault with unlimited storage',
      '2-click instant cancellation anytime',
    ],
  },
  {
    id: 'annual',
    title: 'Annual VIP Pass',
    price: '$39.99',
    cadence: '$3.33/mo (billed annually)',
    badge: 'SAVE 58%',
    features: [
      'Full year of unlimited synastry intelligence',
      'All standout features (Eros & Chaos Capsules)',
      'Priority astronomical ephemeris alerts',
      '14-day full refund guarantee',
    ],
  },
];

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  onCheckout,
  pairNames,
  defaultPlan = 'single',
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PricingTier>(defaultPlan);
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgeConfirmed || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onCheckout(selectedPlan);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nameA = pairNames?.personA || 'You';
  const nameB = pairNames?.personB || 'Them';

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="border-b border-[#D6D6D6] pb-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#575657]">
            Transparent Checkout
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-[#141414] mt-1">
            Unlock Full Report: {nameA} × {nameB}
          </h3>
          <p className="text-xs sm:text-sm text-[#575657] mt-1.5 leading-relaxed font-sans">
            Instant unlock for all 7 deep sections, full aspect directory, psychological attachment breakdown, and high-contrast printable PDF.
          </p>
        </div>

        {/* Pricing Plan Selector */}
        <div className="space-y-3" role="radiogroup" aria-label="Select pricing plan">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <label
                key={plan.id}
                className={`relative flex flex-col p-4 border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#141414] bg-white ring-1 ring-[#141414]'
                    : 'border-[#D6D6D6] bg-[#FBFBFB] hover:border-[#575657]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="pricing-plan"
                      value={plan.id}
                      checked={isSelected}
                      onChange={() => setSelectedPlan(plan.id)}
                      className="w-4 h-4 text-[#141414] bg-white border-[#575657] focus:ring-[#141414] accent-[#141414] cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-mono font-bold text-[#141414] tracking-[0.04em] uppercase">
                        {plan.title}
                      </span>
                      <span className="block text-xs text-[#575657] font-mono">
                        {plan.cadence}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-lg font-bold text-[#141414] tabular-nums">
                      {plan.price}
                    </span>
                    {plan.badge && (
                      <span className="block text-[10px] font-mono tracking-[0.08em] text-[#141414] bg-[rgba(144,202,243,0.35)] px-1.5 py-0.5 font-semibold uppercase">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features Pill */}
                {isSelected && (
                  <ul className="mt-3 pt-3 border-t border-[#D6D6D6] text-xs text-[#575657] space-y-1 font-sans">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-[#141414] text-xs font-bold">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </label>
            );
          })}
        </div>

        {/* Mandatory 18+ Age Verification Guard (FR-23) */}
        <div className="p-3.5 bg-[#F4F4F2] border border-[#D6D6D6] space-y-1">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id="age-verification-checkbox"
              checked={isAgeConfirmed}
              onChange={(e) => setIsAgeConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#141414] bg-white border-[#575657] focus:ring-[#141414] accent-[#141414] cursor-pointer"
              required
            />
            <span className="text-xs text-[#575657] leading-snug">
              <strong className="text-[#141414] font-semibold">Age Confirmation:</strong>{' '}
              I confirm that I am at least 18 years of age and agree to the terms of service.
            </span>
          </label>
        </div>

        {/* CTA Button (Disabled if 18+ not checked) */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isAgeConfirmed || isSubmitting}
          aria-disabled={!isAgeConfirmed || isSubmitting}
          isLoading={isSubmitting}
          className="min-h-[48px] uppercase tracking-[0.08em] font-semibold"
        >
          {`Unlock Full Report — ${
            selectedPlan === 'single'
              ? '$6.99'
              : selectedPlan === 'monthly'
              ? '$7.99 / mo'
              : '$39.99 / yr'
          }`}
        </Button>

        {/* 14-Day Refund & Entertainment Notice (FR-11, FR-28) */}
        <div className="text-center space-y-1.5 pt-1">
          <p className="text-[11px] text-[#575657] font-mono leading-tight">
            ✦ 14-day money-back guarantee. No questions asked. 2-click cancellation via self-serve account portal.
          </p>
          <p className="text-[10px] text-[#575657] leading-tight">
            For entertainment purposes only. Not a substitute for licensed medical, psychological, financial, or legal counsel.
          </p>
        </div>
      </form>
    </Modal>
  );
};
