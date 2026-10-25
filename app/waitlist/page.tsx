'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { EditorialFooter } from '@/components/home/EditorialFooter';

export function validateWaitlistEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function generateWaitlistRank(email: string): { rank: number; total: number; refCode: string } {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = (hash << 5) - hash + email.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);
  const rank = 400 + (positiveHash % 600); // 400 - 999
  const total = 2500 + (positiveHash % 500);
  const refCode = `STAR-${positiveHash.toString(36).toUpperCase().slice(0, 6)}`;
  return { rank, total, refCode };
}

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [waitlistData, setWaitlistData] = useState<{
    email: string;
    rank: number;
    total: number;
    refCode: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const stored = localStorage.getItem('starmatch_waitlist');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.email && parsed?.rank) {
            setWaitlistData(parsed);
            setIsSuccess(true);
          }
        }
      } catch {
        // Ignore localStorage errors
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateWaitlistEmail(email)) {
      setError('Please enter a valid email address (e.g. name@domain.com)');
      return;
    }

    setLoading(true);

    try {
      const generated = generateWaitlistRank(email);
      const data = {
        email: email.trim(),
        rank: generated.rank,
        total: generated.total,
        refCode: generated.refCode,
      };

      try {
        localStorage.setItem('starmatch_waitlist', JSON.stringify(data));
      } catch {
        // Storage fallback
      }

      setWaitlistData(data);
      setIsSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const referralUrl = waitlistData?.refCode
    ? `https://starmatch.app/waitlist?ref=${waitlistData.refCode}`
    : 'https://starmatch.app/waitlist';

  const handleCopyReferral = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(referralUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-[#141414]">
      {/* Header */}
      <header className="border-b border-[#D6D6D6] bg-[#F7F7F7]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
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
            <span className="font-mono text-xs text-[#575657] font-normal uppercase tracking-[0.06em]">/ WAITLIST</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-mono uppercase tracking-wider text-[#141414] hover:bg-[#141414] hover:text-white border border-[#141414] px-3 py-1.5 transition-colors"
          >
            Open Calculator
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <span className="px-3 py-1 text-xs font-mono tracking-widest uppercase bg-[#FBFBFB] border border-[#D6D6D6] text-[#141414] inline-block">
            Phase 2 VIP Access
          </span>
          <h1 className="text-3xl sm:text-6xl font-serif font-normal tracking-tight text-[#141414]">
            Early Access Protocol
          </h1>
          <p className="text-[#575657] text-sm sm:text-base max-w-xl mx-auto font-sans leading-relaxed">
            Join the waitlist for live transit notifications, anonymous mutual synastry matching, and high-precision synastry forecasting.
          </p>
        </div>

        {/* Form or Success State */}
        <div className="bg-[#FBFBFB] border border-[#D6D6D6] p-6 sm:p-10 max-w-xl mx-auto space-y-6">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="waitlist-email"
                  className="block text-xs font-mono uppercase tracking-wider text-[#141414]"
                >
                  Email Address
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full bg-white border border-[#D6D6D6] px-4 py-3 text-sm text-[#141414] placeholder-[#575657]/60 focus:outline-none focus:border-[#141414] transition-colors font-mono"
                />
                {error && (
                  <p className="text-xs font-mono text-[#141414] bg-[rgba(243,144,144,0.2)] border border-[#141414] px-2 py-1 mt-1" role="alert">
                    {error}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                className="w-full"
              >
                Join Priority Queue
              </Button>

              <p className="text-[11px] font-mono text-[#575657] text-center">
                Strict privacy. Zero spam. One-click unsubscribe anytime.
              </p>
            </form>
          ) : (
            <div className="space-y-6 text-center py-4">
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#141414] bg-white border border-[#141414] px-3 py-1 inline-block">
                  Queue Position Confirmed
                </span>
                <div className="text-5xl font-serif font-normal text-[#141414] tracking-tight pt-2">
                  #{waitlistData?.rank}
                </div>
                <div className="text-xs font-mono text-[#575657] uppercase tracking-wider">
                  Out of {waitlistData?.total?.toLocaleString()} people in line
                </div>
              </div>

              <div className="border-t border-b border-[#D6D6D6] py-4 space-y-2 text-left">
                <div className="text-xs font-mono text-[#575657] uppercase">Registered Email:</div>
                <div className="text-sm font-mono text-[#141414]">{waitlistData?.email}</div>
              </div>

              {/* Referral Boost */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-mono uppercase tracking-wider text-[#141414]">
                  Move Up 50 Spots for Every Friend Invited
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralUrl}
                    className="flex-1 bg-white border border-[#D6D6D6] px-3 py-2 text-xs font-mono text-[#141414] select-all"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyReferral}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  try {
                    localStorage.removeItem('starmatch_waitlist');
                  } catch {}
                  setIsSuccess(false);
                  setEmail('');
                }}
                className="text-xs text-[#575657] hover:text-[#141414]"
              >
                Change Email / Register Another
              </Button>
            </div>
          )}
        </div>

        {/* Feature Preview Cards */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#575657]">
              Upcoming VIP Features
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[#D6D6D6]">
            <div className="bg-white border-b md:border-b-0 md:border-r border-[#D6D6D6] p-5 space-y-3">
              <span className="text-xs font-mono text-[#575657] uppercase">Phase 1</span>
              <h3 className="text-base font-serif font-normal text-[#141414]">
                Live Transit Alerts
              </h3>
              <p className="text-xs text-[#575657] leading-relaxed font-sans">
                Instant SMS and push notifications the exact hour Mars triggers your partner’s Saturn or Venus enters your 7th House.
              </p>
            </div>

            <div className="bg-white border-b md:border-b-0 md:border-r border-[#D6D6D6] p-5 space-y-3">
              <span className="text-xs font-mono text-[#575657] uppercase">Phase 2</span>
              <h3 className="text-base font-serif font-normal text-[#141414]">
                Mutual Ghost Matching
              </h3>
              <p className="text-xs text-[#575657] leading-relaxed font-sans">
                Encrypted zero-knowledge synastry pool. Match with people who hold &gt;85% compatibility with your birth chart.
              </p>
            </div>

            <div className="bg-white p-5 space-y-3">
              <span className="text-xs font-mono text-[#575657] uppercase">Phase 3</span>
              <h3 className="text-base font-serif font-normal text-[#141414]">
                Parchment Synastry Art
              </h3>
              <p className="text-xs text-[#575657] leading-relaxed font-sans">
                Museum-grade vector art prints rendered from your pairwise planetary aspects and aspect geometries.
              </p>
            </div>
          </div>
        </section>
      </main>

      <EditorialFooter />
    </div>
  );
}
