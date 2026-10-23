import React from 'react';
import type { Metadata } from 'next';
import { StudioChrome } from '@/components/chrome/StudioChrome';
import { HeroStage } from '@/components/hero/HeroStage';
import { ScanlineMatrixMorpher } from '@/components/home/ScanlineMatrixMorpher';
import { WireframeCelestialSculpture } from '@/components/hero/WireframeCelestialSculpture';
import { CompatibilityForm } from '@/components/home/CompatibilityForm';
import { RecentPairsList } from '@/components/home/RecentPairsList';
import { EditorialFooter } from '@/components/home/EditorialFooter';

export const metadata: Metadata = {
  title: 'StarMatch — Two Charts. One Sharp Truth.',
  description:
    'Instant, account-free synastry analysis powered by high-precision VSOP87 planetary ephemerides and ruthless psychological dynamics.',
  openGraph: {
    title: 'StarMatch — Two Charts. One Sharp Truth.',
    description:
      'Instant, account-free synastry analysis powered by high-precision planetary ephemerides.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <StudioChrome>
      <main className="flex-1 w-full flex flex-col">
        {/* 1. HERO STAGE */}
        <HeroStage />

        {/* 2. OGREES SCANLINE MATRIX MORPHER */}
        <ScanlineMatrixMorpher />

        {/* 3. WIREFRAME CELESTIAL SCULPTURE */}
        <WireframeCelestialSculpture />

        {/* 4. SYNASTRY STUDIO & RECENT PAIRS */}
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-12 sm:space-y-16">
          <CompatibilityForm />

          <RecentPairsList />
        </div>
      </main>

      <EditorialFooter />
    </StudioChrome>
  );
}
