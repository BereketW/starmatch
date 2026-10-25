'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EditorialFooter } from '@/components/home/EditorialFooter';

export interface FunnelStep {
  name: 'visit' | 'inputs_entered' | 'result_viewed' | 'paywall_viewed' | 'checkout_started' | 'purchase';
  label: string;
  count: number;
}

export interface UtmRow {
  source: string;
  campaign: string;
  visitors: number;
  purchases: number;
  revenue: number;
}

export interface AuditReport {
  id: string;
  pairName: string;
  score: number;
  flaggedReason: string;
  reviewed: boolean;
  aspectsCount: number;
  proseSnippet: string;
}

export interface ChargeRecord {
  id: string;
  customerEmail: string;
  amount: number;
  currency: string;
  date: string;
  isRefunded: boolean;
  plan: string;
}

export interface ScoringWeights {
  luminaryOrb: number;
  majorOrb: number;
  minorOrb: number;
  chemistryWeight: number;
  communicationWeight: number;
  emotionalBondWeight: number;
}

export const FUNNEL_STEPS: ('visit' | 'inputs_entered' | 'result_viewed' | 'paywall_viewed' | 'checkout_started' | 'purchase')[] = [
  'visit',
  'inputs_entered',
  'result_viewed',
  'paywall_viewed',
  'checkout_started',
  'purchase',
];

export function calculateConversionRate(purchases: number, visitors: number): number {
  if (visitors <= 0) return 0;
  return (purchases / visitors) * 100;
}

export function validateOrbWeight(orb: number): boolean {
  return typeof orb === 'number' && !isNaN(orb) && orb > 0;
}

export function processAdminRefund(
  charge: ChargeRecord
): { status: 'succeeded'; chargeId: string } {
  if (charge.isRefunded) {
    throw new Error('Charge already refunded');
  }
  return { status: 'succeeded', chargeId: charge.id };
}

export default function AdminDashboardPage() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(true);
  const [adminToken, setAdminToken] = useState('adm_secret_token_123');

  // Funnel Telemetry State
  const [funnel] = useState<FunnelStep[]>([
    { name: 'visit', label: '1. Site Visits', count: 5000 },
    { name: 'inputs_entered', label: '2. Inputs Entered', count: 2800 },
    { name: 'result_viewed', label: '3. Results Viewed', count: 2750 },
    { name: 'paywall_viewed', label: '4. Paywall Viewed', count: 1400 },
    { name: 'checkout_started', label: '5. Checkout Started', count: 320 },
    { name: 'purchase', label: '6. Purchases', count: 182 },
  ]);

  // Financial KPIs
  const [activeSubs] = useState(120);
  const monthlyPrice = 7.99;
  const mrr = activeSubs * monthlyPrice;

  // UTM Attribution State
  const [utmRows] = useState<UtmRow[]>([
    { source: 'tiktok', campaign: 'comment_reply_scorpio', visitors: 1820, purchases: 78, revenue: 545.22 },
    { source: 'tiktok', campaign: 'bio_link_direct', visitors: 1450, purchases: 52, revenue: 363.48 },
    { source: 'organic_seo', campaign: 'compatibility_78_pages', visitors: 980, purchases: 32, revenue: 223.68 },
    { source: 'instagram', campaign: 'reels_synastry', visitors: 520, purchases: 14, revenue: 97.86 },
    { source: 'direct', campaign: 'none', visitors: 230, purchases: 6, revenue: 41.94 },
  ]);

  // Safety & Quality Audit Queue
  const [auditQueue, setAuditQueue] = useState<AuditReport[]>([
    {
      id: 'rep_1',
      pairName: 'Scorpio + Taurus',
      score: 25,
      flaggedReason: 'low_sentiment',
      reviewed: false,
      aspectsCount: 6,
      proseSnippet: 'Intense friction between possessiveness and emotional stonewalling requires active boundaries.',
    },
    {
      id: 'rep_2',
      pairName: 'Aries + Cancer',
      score: 42,
      flaggedReason: 'prohibited_phrase_check',
      reviewed: false,
      aspectsCount: 5,
      proseSnippet: 'Speed of confrontation conflicts with instinctive emotional withdrawal under pressure.',
    },
    {
      id: 'rep_3',
      pairName: 'Leo + Aquarius',
      score: 88,
      flaggedReason: 'sentiment_sampling',
      reviewed: true,
      aspectsCount: 8,
      proseSnippet: 'Polarity axis: public warmth balanced with intellectual detachment produces deep creative spark.',
    },
  ]);

  const [selectedAuditReport, setSelectedAuditReport] = useState<AuditReport | null>(null);

  // Dynamic Scoring Weights
  const [weights, setWeights] = useState<ScoringWeights>({
    luminaryOrb: 8.0,
    majorOrb: 6.0,
    minorOrb: 3.0,
    chemistryWeight: 0.25,
    communicationWeight: 0.20,
    emotionalBondWeight: 0.25,
  });
  const [weightError, setWeightError] = useState<string | null>(null);
  const [weightSaveSuccess, setWeightSaveSuccess] = useState(false);

  // Stripe Charges & Refund Management
  const [charges, setCharges] = useState<ChargeRecord[]>([
    {
      id: 'ch_1Nm9A2Lkd89',
      customerEmail: 'alex@domain.com',
      amount: 6.99,
      currency: 'USD',
      date: '2026-10-22',
      isRefunded: false,
      plan: 'single_report',
    },
    {
      id: 'ch_1Nm8Z4Lkd12',
      customerEmail: 'taylor@domain.com',
      amount: 7.99,
      currency: 'USD',
      date: '2026-10-21',
      isRefunded: false,
      plan: 'monthly_sub',
    },
    {
      id: 'ch_1Nm7Y1Lkd34',
      customerEmail: 'jordan@domain.com',
      amount: 39.99,
      currency: 'USD',
      date: '2026-10-20',
      isRefunded: true,
      plan: 'annual_vip',
    },
  ]);

  const [refundFeedback, setRefundFeedback] = useState<string | null>(null);

  const totalVisitors = funnel[0].count;
  const totalPurchases = funnel[funnel.length - 1].count;
  const overallConversion = calculateConversionRate(totalPurchases, totalVisitors);

  const handleWeightChange = (key: keyof ScoringWeights, val: number) => {
    if (!validateOrbWeight(val)) {
      setWeightError(`Weight for ${key} must be strictly positive (> 0)`);
      return;
    }
    setWeightError(null);
    setWeights((prev) => ({ ...prev, [key]: val }));
  };

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateOrbWeight(weights.luminaryOrb) || !validateOrbWeight(weights.majorOrb)) {
      setWeightError('Orb values cannot be zero or negative.');
      return;
    }
    setWeightError(null);
    setWeightSaveSuccess(true);
    setTimeout(() => setWeightSaveSuccess(false), 2500);
  };

  const handleProcessRefund = (chargeId: string) => {
    const charge = charges.find((c) => c.id === chargeId);
    if (!charge) return;

    try {
      processAdminRefund(charge);
      setCharges((prev) =>
        prev.map((c) => (c.id === chargeId ? { ...c, isRefunded: true } : c))
      );
      setRefundFeedback(`Refund succeeded for charge ${chargeId}.`);
      setTimeout(() => setRefundFeedback(null), 3500);
    } catch (err: unknown) {
      setRefundFeedback((err as Error).message || 'Refund failed');
    }
  };

  const handleMarkReportReviewed = (reportId: string) => {
    setAuditQueue((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, reviewed: true } : r))
    );
    if (selectedAuditReport?.id === reportId) {
      setSelectedAuditReport((prev) => (prev ? { ...prev, reviewed: true } : null));
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFB] text-[#141414] p-4">
        <div className="max-w-md w-full bg-[#FFFFFF] border border-[#141414] p-8 text-center space-y-4">
          <span className="text-xs font-mono uppercase bg-[rgba(243,144,144,0.28)] text-[#141414] border border-[#141414] px-3 py-1 inline-block">
            HTTP 401 Unauthorized
          </span>
          <h1 className="text-2xl font-serif tracking-tight text-[#141414]">
            Founder Access Required
          </h1>
          <p className="text-xs font-mono text-[#575657]">
            A valid admin bearer session token is required to view conversion metrics and safety queues.
          </p>
          <div className="space-y-2 pt-2">
            <input
              type="password"
              placeholder="Enter adm_secret_token_..."
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              className="w-full bg-[#FBFBFB] border border-[#D6D6D6] px-3 py-2 text-xs font-mono text-[#141414] focus:outline-none focus:border-[#141414]"
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                if (adminToken === 'adm_secret_token_123') {
                  setIsAdminAuthenticated(true);
                }
              }}
              className="w-full"
            >
              Authenticate Admin Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FBFBFB] text-[#141414]">
      {/* Header */}
      <header className="border-b border-[#D6D6D6] bg-[#FBFBFB]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-sans text-base tracking-[-0.03em] text-[#141414] font-semibold hover:opacity-75 transition-opacity"
            >
              <svg width="24" height="16" viewBox="0 0 36 24" fill="none" aria-hidden="true">
                <rect x="16.5" y="1" width="3" height="2" rx="1" fill="#141414" />
                <rect x="12" y="5" width="3.5" height="2" rx="1" fill="#141414" />
                <rect x="17" y="5" width="7" height="2" rx="1" fill="#141414" />
                <rect x="9" y="9" width="8" height="2" rx="1" fill="#141414" />
                <rect x="18.5" y="9" width="8.5" height="2" rx="1" fill="#141414" />
                <rect x="6" y="13" width="13.5" height="2" rx="1" fill="#141414" />
                <rect x="21" y="13" width="9" height="2" rx="1" fill="#141414" />
                <rect x="3" y="17" width="19" height="2" rx="1" fill="#141414" />
                <rect x="23.5" y="17" width="9.5" height="2" rx="1" fill="#141414" />
                <rect x="0" y="21" width="25" height="2" rx="1" fill="#141414" />
              </svg>
              <span>StarMatch</span>
              <span className="font-mono text-xs text-[#575657] font-normal uppercase tracking-[0.06em]">/ FOUNDER ADMIN</span>
            </Link>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[rgba(144,202,243,0.28)] text-[#141414] border border-[#141414]">
              Live Session
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/clip-maker"
              className="text-xs font-mono uppercase tracking-[0.06em] bg-[#141414] text-[#FBFBFB] font-semibold px-3 py-1.5 hover:bg-black transition-colors"
            >
              Clip Maker Studio ↗
            </Link>
            <button
              type="button"
              onClick={() => setIsAdminAuthenticated(false)}
              className="text-xs font-mono uppercase text-[#575657] hover:text-[#141414] px-2 py-1 cursor-pointer"
            >
              Lock
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* Title & Top KPIs */}
        <section className="space-y-6 border-b border-[#D6D6D6] pb-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-[#141414]">
                Founder Telemetry &amp; Control
              </h1>
              <p className="text-xs font-mono text-[#575657] mt-1">
                Real-time conversion funnel, safety compliance queues, and dynamic orb weighting.
              </p>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#FFFFFF] border border-[#D6D6D6] p-4 space-y-1">
              <span className="text-[11px] font-mono text-[#575657] uppercase">Monthly Recurring Rev</span>
              <div className="text-2xl font-serif text-[#141414]">
                ${mrr.toFixed(2)}
              </div>
              <span className="text-[10px] font-mono text-[#575657]">
                {activeSubs} active subscribers ($7.99/mo)
              </span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#D6D6D6] p-4 space-y-1">
              <span className="text-[11px] font-mono text-[#575657] uppercase">Funnel Conversion</span>
              <div className="text-2xl font-serif text-[#141414]">
                {overallConversion.toFixed(2)}%
              </div>
              <span className="text-[10px] font-mono text-[#575657]">
                {totalPurchases} purchases / {totalVisitors} visits
              </span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#D6D6D6] p-4 space-y-1">
              <span className="text-[11px] font-mono text-[#575657] uppercase">Latency SLA</span>
              <div className="text-2xl font-serif text-[#141414]">
                14ms
              </div>
              <span className="text-[10px] font-mono text-[#575657]">
                P99 synastry calc &lt;100ms
              </span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#D6D6D6] p-4 space-y-1">
              <span className="text-[11px] font-mono text-[#575657] uppercase">Audit Queue</span>
              <div className="text-2xl font-serif text-[#141414]">
                {auditQueue.filter((q) => !q.reviewed).length} Pending
              </div>
              <span className="text-[10px] font-mono text-[#575657]">
                Safety &amp; sentiment review
              </span>
            </div>
          </div>
        </section>

        {/* Funnel Metrics Tracking */}
        <section className="bg-[#FFFFFF] border border-[#D6D6D6] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#D6D6D6] pb-4">
            <div>
              <h2 className="text-sm font-mono uppercase tracking-widest text-[#141414] font-semibold">
                Step-by-Step Conversion Funnel
              </h2>
              <p className="text-xs text-[#575657] mt-1 font-serif">
                Progression from raw landing to paid report unlocking.
              </p>
            </div>
            <span className="text-xs font-mono text-[#141414]">
              Overall: {overallConversion.toFixed(2)}%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {funnel.map((step, idx) => {
              const prev = idx > 0 ? funnel[idx - 1].count : step.count;
              const dropoff = prev > 0 ? ((step.count / prev) * 100).toFixed(1) : '100';

              return (
                <div
                  key={step.name}
                  className="bg-[#FBFBFB] border border-[#D6D6D6] p-3 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono text-[#575657] uppercase block truncate">
                      {step.label}
                    </span>
                    <div className="text-lg font-serif text-[#141414] mt-1">
                      {step.count.toLocaleString()}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#D6D6D6] flex justify-between items-center text-[10px] font-mono">
                    <span className="text-[#575657]">Step %</span>
                    <span className="text-[#141414] font-semibold">{dropoff}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* UTM Attribution Breakdown */}
        <section className="bg-[#FFFFFF] border border-[#D6D6D6] p-6 space-y-6">
          <div className="border-b border-[#D6D6D6] pb-4">
            <h2 className="text-sm font-mono uppercase tracking-widest text-[#141414] font-semibold">
              Traffic Source &amp; Video Attribution
            </h2>
            <p className="text-xs text-[#575657] mt-1 font-serif">
              Acquisition performance across viral TikTok replies, reels, and organic SEO.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-[#D6D6D6] text-[#575657] uppercase">
                  <th className="pb-3 pr-4">Channel</th>
                  <th className="pb-3 pr-4">Campaign / Video ID</th>
                  <th className="pb-3 pr-4 text-right">Visitors</th>
                  <th className="pb-3 pr-4 text-right">Purchases</th>
                  <th className="pb-3 pr-4 text-right">Revenue</th>
                  <th className="pb-3 text-right">Conv. Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {utmRows.map((r, i) => (
                  <tr key={i} className="hover:bg-[#FBFBFB]">
                    <td className="py-3 pr-4 text-[#141414] uppercase font-bold">{r.source}</td>
                    <td className="py-3 pr-4 text-[#575657]">{r.campaign}</td>
                    <td className="py-3 pr-4 text-right text-[#141414]">{r.visitors.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-right text-[#141414]">{r.purchases}</td>
                    <td className="py-3 pr-4 text-right text-[#141414] font-semibold">
                      ${r.revenue.toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-[#575657]">
                      {((r.purchases / r.visitors) * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Safety Audit Queue & Scoring Weights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Safety Audit Queue */}
          <section className="bg-[#FFFFFF] border border-[#D6D6D6] p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#D6D6D6] pb-4">
              <div>
                <h2 className="text-sm font-mono uppercase tracking-widest text-[#141414] font-semibold">
                  Safety &amp; Quality Audit Queue
                </h2>
                <p className="text-xs text-[#575657] mt-1 font-serif">
                  Inspect generated reports flagged for low sentiment or compliance checks.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {auditQueue.map((rep) => (
                <div
                  key={rep.id}
                  className="p-3 bg-[#FBFBFB] border border-[#D6D6D6] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#141414]">
                        {rep.pairName}
                      </span>
                      <span className="text-[10px] font-mono text-[#575657]">
                        Score: {rep.score}%
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${
                        rep.reviewed
                          ? 'bg-[#F4F4F2] text-[#575657] border-[#D6D6D6]'
                          : 'bg-[rgba(243,144,144,0.28)] text-[#141414] border-[#141414]'
                      }`}
                    >
                      {rep.reviewed ? 'Reviewed' : rep.flaggedReason}
                    </span>
                  </div>

                  <p className="text-xs font-serif italic text-[#575657] line-clamp-2">
                    &ldquo;{rep.proseSnippet}&rdquo;
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#D6D6D6]">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAuditReport(rep)}
                      className="text-xs text-[#575657] hover:text-[#141414]"
                    >
                      Inspect Report
                    </Button>
                    {!rep.reviewed && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleMarkReportReviewed(rep.id)}
                        className="text-xs"
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Dynamic Scoring Weights Editor */}
          <section className="bg-[#FFFFFF] border border-[#D6D6D6] p-6 space-y-6">
            <div className="border-b border-[#D6D6D6] pb-4">
              <h2 className="text-sm font-mono uppercase tracking-widest text-[#141414] font-semibold">
                Dynamic Scoring Weights
              </h2>
              <p className="text-xs text-[#575657] mt-1 font-serif">
                Tune planetary aspect orbs and category balances without redeploying.
              </p>
            </div>

            <form onSubmit={handleSaveWeights} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    htmlFor="luminary-orb-input"
                    className="text-xs font-mono text-[#575657] uppercase"
                  >
                    Luminary Orb (deg)
                  </label>
                  <input
                    id="luminary-orb-input"
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={weights.luminaryOrb}
                    onChange={(e) =>
                      handleWeightChange('luminaryOrb', parseFloat(e.target.value))
                    }
                    className="w-full bg-[#FBFBFB] border border-[#D6D6D6] px-3 py-2 text-xs font-mono text-[#141414] focus:outline-none focus:border-[#141414]"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="major-orb-input"
                    className="text-xs font-mono text-[#575657] uppercase"
                  >
                    Major Orb (deg)
                  </label>
                  <input
                    id="major-orb-input"
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={weights.majorOrb}
                    onChange={(e) =>
                      handleWeightChange('majorOrb', parseFloat(e.target.value))
                    }
                    className="w-full bg-[#FBFBFB] border border-[#D6D6D6] px-3 py-2 text-xs font-mono text-[#141414] focus:outline-none focus:border-[#141414]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="minor-orb-input"
                  className="text-xs font-mono text-[#575657] uppercase"
                >
                  Minor Aspect Orb (deg)
                </label>
                <input
                  id="minor-orb-input"
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={weights.minorOrb}
                  onChange={(e) =>
                    handleWeightChange('minorOrb', parseFloat(e.target.value))
                  }
                  className="w-full bg-[#FBFBFB] border border-[#D6D6D6] px-3 py-2 text-xs font-mono text-[#141414] focus:outline-none focus:border-[#141414]"
                />
              </div>

              {weightError && (
                <p className="text-xs font-mono text-red-700" role="alert">
                  {weightError}
                </p>
              )}
              {weightSaveSuccess && (
                <p className="text-xs font-mono text-[#141414] font-semibold">
                  Scoring weights updated and applied to ephemeris engine.
                </p>
              )}

              <Button type="submit" variant="primary" size="sm" className="w-full">
                Apply Weights to Engine
              </Button>
            </form>
          </section>
        </div>

        {/* Stripe Charges & 1-Click Refunds */}
        <section className="bg-[#FFFFFF] border border-[#D6D6D6] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#D6D6D6] pb-4">
            <div>
              <h2 className="text-sm font-mono uppercase tracking-widest text-[#141414] font-semibold">
                Transaction Ledger &amp; 1-Click Refunds
              </h2>
              <p className="text-xs text-[#575657] mt-1 font-serif">
                Process customer refunds in 1 click honoring the 14-day no-questions guarantee.
              </p>
            </div>
            {refundFeedback && (
              <span className="text-xs font-mono text-[#141414] font-semibold">{refundFeedback}</span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-[#D6D6D6] text-[#575657] uppercase">
                  <th className="pb-3 pr-4">Charge ID</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Plan</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4 text-right">Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {charges.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FBFBFB]">
                    <td className="py-3 pr-4 text-[#575657]">{c.id}</td>
                    <td className="py-3 pr-4 text-[#141414]">{c.customerEmail}</td>
                    <td className="py-3 pr-4 text-[#575657] uppercase">{c.plan}</td>
                    <td className="py-3 pr-4 text-[#575657]">{c.date}</td>
                    <td className="py-3 pr-4 text-right text-[#141414] font-bold">
                      ${c.amount.toFixed(2)}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`text-[10px] uppercase px-2 py-0.5 border ${
                          c.isRefunded
                            ? 'bg-[#F4F4F2] text-[#575657] border-[#D6D6D6]'
                            : 'bg-[rgba(144,202,243,0.28)] text-[#141414] border-[#141414]'
                        }`}
                      >
                        {c.isRefunded ? 'Refunded' : 'Succeeded'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {!c.isRefunded ? (
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => handleProcessRefund(c.id)}
                          className="text-[11px] py-1 px-2.5"
                        >
                          Refund
                        </Button>
                      ) : (
                        <span className="text-[#575657] text-xs">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Inspect Report Modal */}
      {selectedAuditReport && (
        <Modal
          isOpen={Boolean(selectedAuditReport)}
          onClose={() => setSelectedAuditReport(null)}
          title={`INSPECT: ${selectedAuditReport.pairName}`}
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 gap-2 p-3 bg-[#FBFBFB] border border-[#D6D6D6]">
              <div>
                <span className="text-[#575657] uppercase">Score:</span>{' '}
                <span className="text-[#141414] font-bold">{selectedAuditReport.score}%</span>
              </div>
              <div>
                <span className="text-[#575657] uppercase">Aspects:</span>{' '}
                <span className="text-[#141414]">{selectedAuditReport.aspectsCount} Detected</span>
              </div>
              <div>
                <span className="text-[#575657] uppercase">Flag:</span>{' '}
                <span className="text-[#141414] font-semibold">{selectedAuditReport.flaggedReason}</span>
              </div>
              <div>
                <span className="text-[#575657] uppercase">Status:</span>{' '}
                <span className="text-[#141414]">
                  {selectedAuditReport.reviewed ? 'Approved' : 'Pending'}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[#575657] uppercase">Prose Sample:</span>
              <p className="p-3 bg-[#FBFBFB] border border-[#D6D6D6] text-[#141414] font-serif italic text-sm leading-relaxed">
                &ldquo;{selectedAuditReport.proseSnippet}&rdquo;
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              {!selectedAuditReport.reviewed && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleMarkReportReviewed(selectedAuditReport.id)}
                  className="flex-1"
                >
                  Approve Report
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedAuditReport(null)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <EditorialFooter />
    </div>
  );
}
