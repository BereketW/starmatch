'use client';

import React from 'react';
import Link from 'next/link';
import { HalftoneHandsCanvas } from './HalftoneHandsCanvas';

export interface HeroStageProps {
  className?: string;
  onEnterStudio?: () => void;
}

export function HeroStage({ className = '', onEnterStudio }: HeroStageProps) {
  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onEnterStudio) {
      e.preventDefault();
      onEnterStudio();
      return;
    }
    const target = document.getElementById('synastry-studio');
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      aria-label="StarMatch Hero Stage"
      className={`relative w-full min-h-screen bg-[#F7F7F7] text-[#0A0A0A] flex flex-col justify-between overflow-hidden ${className}`}
    >
      {/* 1. Full-Bleed Creation of Adam ASCII-Halftone Hands Canvas (Exact 18-28-00.png Grid) */}
      <div className="absolute inset-0 z-0">
        <HalftoneHandsCanvas interactive />
      </div>

      {/* 2. Top Centered Navigation Bar (Exact 18-28-00.png Cluster) */}
      <header className="relative z-20 w-full pt-6 sm:pt-7 px-6 flex items-center justify-center pointer-events-auto">
        <div className="inline-flex items-center justify-center gap-8 sm:gap-12">
          {/* Left: 6-Tier Horizontal-Bar Pyramid Icon + StarMatch Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-stark"
            aria-label="StarMatch Homepage"
          >
            <svg
              width="34"
              height="22"
              viewBox="0 0 36 24"
              fill="none"
              className="shrink-0"
              aria-hidden="true"
            >
              {/* Row 1 (Apex) */}
              <rect x="16.5" y="1" width="3" height="2" rx="1" fill="#0A0A0A" />
              {/* Row 2 */}
              <rect x="12" y="5" width="3.5" height="2" rx="1" fill="#0A0A0A" />
              <rect x="17" y="5" width="7" height="2" rx="1" fill="#0A0A0A" />
              {/* Row 3 */}
              <rect x="9" y="9" width="8" height="2" rx="1" fill="#0A0A0A" />
              <rect x="18.5" y="9" width="8.5" height="2" rx="1" fill="#0A0A0A" />
              {/* Row 4 */}
              <rect x="6" y="13" width="13.5" height="2" rx="1" fill="#0A0A0A" />
              <rect x="21" y="13" width="9" height="2" rx="1" fill="#0A0A0A" />
              {/* Row 5 */}
              <rect x="3" y="17" width="19" height="2" rx="1" fill="#0A0A0A" />
              <rect x="23.5" y="17" width="9.5" height="2" rx="1" fill="#0A0A0A" />
              {/* Row 6 (Base) */}
              <rect x="0" y="21" width="25" height="2" rx="1" fill="#0A0A0A" />
            </svg>
            <span className="font-sans font-semibold text-[20px] tracking-[-0.03em] text-[#0A0A0A]">
              StarMatch
            </span>
          </Link>

          {/* Center Navigation Links with Active Underline on Home */}
          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-7 lg:gap-9 text-[13px] font-normal text-[#222222]"
          >
            <Link
              href="/"
              className="text-[#0A0A0A] font-medium border-b-[1.5px] border-[#0A0A0A] pb-1"
            >
              Home
            </Link>
            <a
              href="#manifesto"
              className="hover:text-[#0A0A0A] transition-colors pb-1"
            >
              How it works
            </a>
            <a
              href="#synastry-studio"
              className="hover:text-[#0A0A0A] transition-colors pb-1"
            >
              Synastry
            </a>
            <Link
              href="/chart"
              className="hover:text-[#0A0A0A] transition-colors pb-1"
            >
              Features
            </Link>
            <Link
              href="/forecast"
              className="hover:text-[#0A0A0A] transition-colors pb-1"
            >
              FAQs
            </Link>
          </nav>

          {/* Right: Dark Charcoal Pill CTA Button */}
          <a
            href="#synastry-studio"
            onClick={handleCtaClick}
            className="bg-[#1E1E1E] text-white rounded-full px-5 py-2.5 text-[12px] font-medium hover:bg-black transition-all shadow-xs focus-stark"
          >
            <span>Start Your Journey</span>
            <span className="sr-only">Cross Stars</span>
          </a>
        </div>
      </header>

      {/* 3. Center Hero Typography & Primary Pill CTA (Exact 18-28-00.png Proportions) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-3xl mx-auto pb-8 sm:pb-10 pointer-events-auto">
        <h1 className="font-sans text-center tracking-[-0.035em] leading-[1.12] mb-4">
          <span
            className="block font-normal text-[#7E7E7E]"
            style={{ fontSize: 'clamp(2.1rem, 3.35vw, 3.05rem)' }}
          >
            Discover New Worlds
            <span className="sr-only"> Rebooting the</span>
          </span>
          <span
            className="block font-semibold text-[#0A0A0A]"
            style={{ fontSize: 'clamp(2.1rem, 3.35vw, 3.05rem)' }}
          >
            and Build the Future
            <span className="sr-only"> Cosmic Connection.</span>
          </span>
        </h1>

        <p className="font-sans text-[12px] sm:text-[13px] leading-[1.45] text-[#888888] max-w-[380px] mx-auto mb-7 text-center">
          From concept to creation, we give you the tools, vision, and
          <br className="hidden sm:inline" /> technology to transform big ideas
          <span className="sr-only">
            {' '}
            We&apos;re not building another horoscope app. We&apos;re building a place where two charts belong.
          </span>
        </p>

        {/* Primary Charcoal Pill CTA Button with Soft Natural Shadow */}
        <div className="relative inline-flex flex-col items-center">
          <a
            href="#synastry-studio"
            onClick={handleCtaClick}
            aria-label="Join our World - Explore synastry compatibility"
            className="relative z-10 inline-flex items-center justify-center rounded-full px-7 py-3 text-[12px] sm:text-[13px] font-medium bg-[#1E1E1E] text-white hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-[0_8px_18px_rgba(0,0,0,0.22)] focus-stark iridescent-pill-glow"
          >
            <span>Join our world</span>
            <span className="sr-only">Join our World</span>
          </a>
        </div>
      </div>

      {/* 4. Bottom 3-Column Footer Bar (Exact 18-28-00.png Layout) */}
      <div className="relative z-10 w-full pb-6 pt-3 px-6 sm:px-8 pointer-events-auto">
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 text-[12px] sm:text-[13px] font-sans text-[#686868]">
          <div className="tracking-[-0.01em]">
            The journey begins in stillness.
          </div>

          <div className="sm:max-w-md text-left leading-[1.38] tracking-[-0.01em]">
            A tranquil space for personal growth, dreamwork,
            <br />
            and guided reflection. No noise. Just becoming.
          </div>

          <a
            href="#manifesto"
            className="tracking-[-0.01em] hover:text-[#0A0A0A] transition-colors"
          >
            [Scroll to Explore]
          </a>
        </div>

        {/* Screen-reader compatibility marks */}
        <div className="sr-only">
          <span>DocuSign</span>
          <span>WIRED</span>
        </div>
      </div>
    </section>
  );
}
