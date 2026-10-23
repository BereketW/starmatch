'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface StudioChromeProps {
  children?: React.ReactNode;
  className?: string;
  hideSideRails?: boolean;
}

// Deterministic SSR timestamp to prevent Next.js 16 prerender errors
const DETERMINISTIC_TIMESTAMP = 'J2000.0 // 2026.10.23';

export function StudioChrome({
  children,
  className = '',
  hideSideRails = false,
}: StudioChromeProps) {
  const [mountedTime, setMountedTime] = useState<string>(DETERMINISTIC_TIMESTAMP);

  // Initialize live telemetry clock safely on client mount only
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const timeStr = `${now.getUTCFullYear()}.${pad(now.getUTCMonth() + 1)}.${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())} UTC`;
      setMountedTime(timeStr);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`relative min-h-screen bg-white text-[#0A0A0A] ${className}`}>
      {/* 1. ACCESSIBLE STUDIO LANDMARK BAR (Visually hidden so Reboot/Mantis minimalist nav owns the viewport) */}
      <header
        role="banner"
        className="sr-only"
      >
        {/* Top-Left: Studio Brandmark */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 group focus-stark"
            aria-label="StarMatch Observatory Homepage"
          >
            <span className="w-2.5 h-2.5 bg-[#0a0a0a] rounded-none transform rotate-45 transition-transform group-hover:rotate-90 duration-300" />
            <span className="font-mono text-xs md:text-sm font-black tracking-[0.25em] uppercase text-[#0a0a0a]">
              STARMATCH
            </span>
          </Link>
          <span className="hidden sm:inline-block font-mono text-[10px] text-[#71717a] tracking-widest uppercase">
            {'//'} SYNASTRY STUDIO
          </span>
        </div>

        {/* Top-Center: Studio Navigation Portals */}
        <nav
          aria-label="Studio navigation"
          className="hidden md:flex items-center gap-1 lg:gap-2 font-mono text-[10px] tracking-widest uppercase text-[#71717a]"
        >
          <a
            href="#synastry-studio"
            className="px-2.5 py-1 hover:text-[#0a0a0a] hover:bg-zinc-100 transition-colors"
          >
            SYNASTRY
          </a>
          <span className="text-[#d4d4d8]">/</span>
          <Link
            href="/chart"
            className="px-2.5 py-1 hover:text-[#0a0a0a] hover:bg-zinc-100 transition-colors"
          >
            NATAL
          </Link>
          <span className="text-[#d4d4d8]">/</span>
          <Link
            href="/forecast"
            className="px-2.5 py-1 hover:text-[#0a0a0a] hover:bg-zinc-100 transition-colors"
          >
            FORECAST
          </Link>
          <span className="text-[#d4d4d8]">/</span>
          <Link
            href="/compatibility"
            className="px-2.5 py-1 hover:text-[#0a0a0a] hover:bg-zinc-100 transition-colors"
          >
            ARCHIVE
          </Link>
          <span className="text-[#d4d4d8]">/</span>
          <Link
            href="/invite"
            className="px-2.5 py-1 text-emerald-600 font-semibold hover:bg-emerald-500/10 transition-colors"
          >
            LET&apos;S MATCH
          </Link>
        </nav>

        {/* Top-Right: Telemetry Clock & Theme Switcher */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 font-mono text-[10px] text-[#71717a] tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="tabular-nums">{mountedTime}</span>
          </div>
          <ThemeToggle variant="studio" />
        </div>
      </header>

      {/* 2. VERTICAL SIDE-RAIL TELEMETRY (Screen-reader accessible) */}
      {!hideSideRails && (
        <>
          {/* Left Vertical Side-Rail */}
          <aside
            aria-label="Observatory coordinates"
            className="sr-only"
          >
            <div className="flex items-center gap-4 py-4">
              <span>LAT 41.3851° N • LON 2.1734° E</span>
              <span className="w-1 h-1 bg-[#a1a1aa] rounded-full" />
              <span>OBLIQUITY 23.43929°</span>
              <span className="w-1 h-1 bg-[#a1a1aa] rounded-full" />
              <span>J2000.0 CALIBRATION</span>
            </div>
          </aside>

          {/* Right Vertical Side-Rail */}
          <aside
            aria-label="Engine specifications"
            className="sr-only"
          >
            <div className="flex items-center gap-4 py-4">
              <span>EPHEMERIS LOCK • 0.1° PRECISION</span>
              <span className="w-1 h-1 bg-[#a1a1aa] rounded-full" />
              <span>VSOP87 / ELP2000-82</span>
              <span className="w-1 h-1 bg-[#a1a1aa] rounded-full" />
              <span>ZERO SYNTHETIC HALLUCINATIONS</span>
            </div>
          </aside>
        </>
      )}

      {/* 3. MAIN CONTENT CONTAINER */}
      <div>{children}</div>

      {/* 4. ACCESSIBLE STUDIO FOOTER LANDMARK */}
      <footer
        role="contentinfo"
        className="sr-only"
      >
        {/* Bottom-Left */}
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          <span>DETERMINISTIC STUDIO {'//'} VSOP87 DE405</span>
        </div>

        {/* Bottom-Center */}
        <div className="hidden md:flex items-center gap-3">
          <span>GAUSSIAN ORB DECAY</span>
          <span className="text-[#d4d4d8]">•</span>
          <span>MEEUS AA CH 47</span>
          <span className="text-[#d4d4d8]">•</span>
          <span>PLACIDUS HOUSES</span>
        </div>

        {/* Bottom-Right */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">INDEPENDENT ENGINE {'//'}</span>
          <span className="font-semibold text-[#0a0a0a]">STARMATCH V4</span>
        </div>
      </footer>
    </div>
  );
}
