import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ALL_CANONICAL_SLUGS,
  parsePairSlug,
  getPairMetadata,
  getRelatedPairs,
  generatePairJsonLd,
  SIGN_SEO_DATA,
} from '@/lib/synastry/seo-pairs';
import { quickModeSynastry } from '@/lib/synastry/quick-mode';
import { ScoreGauge } from '@/components/match/ScoreGauge';
import { CategoryBars } from '@/components/match/CategoryBars';
import { CoStarBuckets } from '@/components/match/CoStarBuckets';
import { DoDontCard } from '@/components/match/DoDontCard';
import { EditorialFooter } from '@/components/home/EditorialFooter';

interface PageProps {
  params: Promise<{ pair: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateStaticParams() {
  return ALL_CANONICAL_SLUGS.map((slug) => ({
    pair: slug,
  }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { pair } = await props.params;
  const parsed = parsePairSlug(pair);

  if (!parsed) {
    return {
      title: 'Pair Compatibility | StarMatch',
      description: 'Zodiac synastry and compatibility reading on StarMatch.',
    };
  }

  const meta = getPairMetadata(parsed.signA, parsed.signB);
  const canonicalUrl = `https://starmatch.app/compatibility/${meta.slug}`;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalUrl,
      type: 'article',
      images: [
        {
          url: `/api/og?mode=seo&signA=${parsed.signA}&signB=${parsed.signB}`,
          width: 1200,
          height: 630,
          alt: `${parsed.signA} & ${parsed.signB} Synastry Compatibility`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  };
}

export default async function CompatibilityPairPage(props: PageProps) {
  const { pair } = await props.params;
  const parsed = parsePairSlug(pair);

  if (!parsed) {
    notFound();
  }

  const meta = getPairMetadata(parsed.signA, parsed.signB);
  const synastry = quickModeSynastry(parsed.signA, parsed.signB, 'romantic');
  const relatedA = getRelatedPairs(parsed.signA, 4);
  const relatedB = getRelatedPairs(parsed.signB, 4);
  const jsonLd = generatePairJsonLd(parsed.signA, parsed.signB, meta.slug);

  const signAMeta = SIGN_SEO_DATA[parsed.signAId] || SIGN_SEO_DATA.aries;
  const signBMeta = SIGN_SEO_DATA[parsed.signBId] || SIGN_SEO_DATA.aries;

  const calculatorUrl = `/?signA=${parsed.signA}&signB=${parsed.signB}&mode=exact`;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FBFBFB] text-[#141414]">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b border-[#D6D6D6] bg-[#F7F7F7]/95 backdrop-blur-sm sticky top-0 z-40">
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
            <span className="font-mono text-xs text-[#575657] font-normal uppercase tracking-[0.06em]">/ COMPATIBILITY</span>
          </Link>
          <Link
            href={calculatorUrl}
            className="text-xs font-mono uppercase tracking-[0.06em] text-[#141414] hover:bg-[#141414] hover:text-[#FBFBFB] border border-[#141414] px-3 py-1.5 transition-colors"
          >
            Check Birthdays
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center space-x-2 text-xs font-mono text-[#575657] uppercase tracking-[0.08em]"
        >
          <Link href="/" className="hover:text-[#141414] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/compatibility" className="hover:text-[#141414] transition-colors">
            Compatibility
          </Link>
          <span>/</span>
          <span className="text-[#141414] font-semibold">
            {parsed.signA} + {parsed.signB}
          </span>
        </nav>

        {/* Hero Section */}
        <section className="space-y-4 border-b border-[#D6D6D6] pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 text-[11px] font-mono tracking-[0.08em] uppercase bg-[#F4F4F2] border border-[#D6D6D6] text-[#141414]">
              {meta.aspectGeometry}
            </span>
            <span className="px-2.5 py-1 text-[11px] font-mono tracking-[0.08em] uppercase bg-[#F4F4F2] border border-[#D6D6D6] text-[#141414]">
              {meta.elementalDynamic}
            </span>
            <span className="px-2.5 py-1 text-[11px] font-mono tracking-[0.08em] uppercase bg-white border border-[#D6D6D6] text-[#575657]">
              Quick Synastry Reading
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-4">
            <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#141414]">
              {parsed.signA} <span className="text-[#575657] italic font-light">&amp;</span> {parsed.signB}
            </h1>
            <div className="text-2xl sm:text-3xl font-mono text-[#141414] flex items-center gap-2">
              <span>{signAMeta.symbol}</span>
              <span className="text-[#575657]">×</span>
              <span>{signBMeta.symbol}</span>
            </div>
          </div>

          <p className="text-[#575657] text-sm sm:text-base leading-relaxed max-w-2xl font-sans">
            {signAMeta.tagline} meets {signBMeta.tagline}
          </p>
        </section>

        {/* Score & One Sharp Truth Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="bg-white border border-[#D6D6D6] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D6D6D6] pb-3">
              <span className="text-xs font-mono uppercase tracking-[0.12em] text-[#575657]">
                Archetypal Resonance
              </span>
              <span className="text-[10px] font-mono uppercase bg-[#F4F4F2] text-[#141414] border border-[#D6D6D6] px-2 py-0.5">
                Approximate • No Birth Time
              </span>
            </div>
            <ScoreGauge
              score={synastry.overallScore}
              lowConfidence={true}
              relationshipType="romantic"
            />
          </div>

          <div className="bg-white border border-[#D6D6D6] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D6D6D6] pb-3">
              <span className="text-xs font-mono uppercase tracking-[0.12em] text-[#575657]">
                One Sharp Truth
              </span>
              <span className="text-[10px] font-mono uppercase text-[#575657]">
                Luminaries Only
              </span>
            </div>
            <div className="space-y-3 pt-2">
              <p className="text-lg sm:text-xl font-serif italic text-[#141414] leading-snug">
                &ldquo;{synastry.strongestAspect?.description || meta.sharpTruth}&rdquo;
              </p>
              <p className="text-xs text-[#575657] leading-relaxed font-sans">
                This dynamic is calculated from the geometric angular distance between {parsed.signA} and {parsed.signB}. To reveal your exact personal placements (Ascendant, Moon, Venus, Mars), calculate with exact birth times.
              </p>
            </div>
          </div>
        </section>

        {/* 5 SRS Core Category Scores */}
        <section className="bg-white border border-[#D6D6D6] p-6 space-y-6">
          <div className="border-b border-[#D6D6D6] pb-4">
            <h2 className="text-sm font-mono uppercase tracking-[0.12em] text-[#141414] font-semibold">
              Core Compatibility Metrics (0–100)
            </h2>
            <p className="text-xs text-[#575657] mt-1 font-sans">
              Five-dimension synastry breakdown based on archetypal elemental and modality interactions.
            </p>
          </div>
          <CategoryBars categories={synastry.categories} showDescriptions={true} />
        </section>

        {/* Co-Star 7 Psychological Dimensions */}
        <section className="bg-white border border-[#D6D6D6] p-6 space-y-6">
          <div className="border-b border-[#D6D6D6] pb-4">
            <h2 className="text-sm font-mono uppercase tracking-[0.12em] text-[#141414] font-semibold">
              Co-Star Psychological Dimensions
            </h2>
            <p className="text-xs text-[#575657] mt-1 font-sans">
              Reverse-engineered 7-bucket synastry dynamics between {parsed.signA} and {parsed.signB}.
            </p>
          </div>
          <CoStarBuckets buckets={synastry.coStarBuckets} />
        </section>

        {/* Pair Do & Don't */}
        <section className="space-y-4">
          <DoDontCard data={synastry.dailyDoDont} dateString="Daily Interaction Protocol" />
        </section>

        {/* Primary Call to Action Widget */}
        <section className="bg-white border border-[#141414] p-8 text-center space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-[#141414] bg-[rgba(144,202,243,0.3)] border border-[#575657]/50 px-3 py-1 inline-block">
              Unlock Your Exact Synastry
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-[#141414]">
              Want Your Real Score?
            </h2>
            <p className="text-[#575657] text-sm max-w-xl mx-auto leading-relaxed font-sans">
              Zodiac Sun signs only tell 20% of the story. Your exact birth minute determines your Moon (emotional reflex), Venus (love style), Mars (chemistry &amp; friction), and Rising sign.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href={calculatorUrl}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#141414] text-[#FBFBFB] border border-[#141414] font-mono font-bold text-xs uppercase tracking-[0.08em] hover:bg-white hover:text-[#141414] transition-colors inline-block"
            >
              Enter exact birthdays for your real score
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 bg-transparent border border-[#575657] text-[#141414] font-mono text-xs uppercase tracking-[0.08em] hover:bg-[#141414] hover:text-[#FBFBFB] transition-colors inline-block"
            >
              Open Calculator
            </Link>
          </div>
          <p className="text-[11px] font-mono text-[#575657]">
            100% Free • Account-Free Instant Result • No App Install Required
          </p>
        </section>

        {/* Internal SEO Linking: Related Pairs */}
        <section className="border-t border-[#D6D6D6] pt-8 space-y-6">
          <h2 className="text-sm font-mono uppercase tracking-[0.12em] text-[#575657]">
            Explore More Compatibility Combinations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase text-[#141414]">
                More {parsed.signA} Pairings
              </h3>
              <div className="flex flex-wrap gap-2">
                {relatedA.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/compatibility/${p.slug}`}
                    className="text-xs font-mono bg-white hover:bg-[#141414] border border-[#D6D6D6] text-[#141414] hover:text-[#FBFBFB] px-3 py-1.5 transition-colors"
                  >
                    {p.signA} &amp; {p.signB}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase text-[#141414]">
                More {parsed.signB} Pairings
              </h3>
              <div className="flex flex-wrap gap-2">
                {relatedB.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/compatibility/${p.slug}`}
                    className="text-xs font-mono bg-white hover:bg-[#141414] border border-[#D6D6D6] text-[#141414] hover:text-[#FBFBFB] px-3 py-1.5 transition-colors"
                  >
                    {p.signA} &amp; {p.signB}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <EditorialFooter />
    </div>
  );
}
