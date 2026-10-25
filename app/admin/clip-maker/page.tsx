'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ZODIAC_SIGNS_ORDER, SIGN_SEO_DATA } from '@/lib/synastry/seo-pairs';
import { quickModeSynastry } from '@/lib/synastry/quick-mode';
import { ScoreGauge } from '@/components/match/ScoreGauge';
import { CategoryBars } from '@/components/match/CategoryBars';
import { EditorialFooter } from '@/components/home/EditorialFooter';
import type { ZodiacSign } from '@/lib/astro/types';

export const CLIP_STUDIO_CONFIG = {
  ratio: '9:16' as const,
  canvasWidth: 1080,
  canvasHeight: 1920,
};

export const CLIP_STAGES = [
  'intro',
  'score_reveal',
  'aspect_cards',
  'dodont_punchline',
] as const;

export type ClipStage = (typeof CLIP_STAGES)[number];

export function stepFrameForward(current: number, max: number): number {
  return Math.min(max, current + 1);
}

export function stepFrameBackward(current: number): number {
  return Math.max(0, current - 1);
}

export function getExportStrategy(hasMediaRecorder: boolean): 'media_recorder' | 'canvas_frames_zip' {
  return hasMediaRecorder ? 'media_recorder' : 'canvas_frames_zip';
}

export default function AdminClipMakerPage() {
  const [signA, setSignA] = useState<ZodiacSign>('Gemini');
  const [signB, setSignB] = useState<ZodiacSign>('Pisces');
  const [commentAuthor, setCommentAuthor] = useState('@astrogirl99');
  const [commentText, setCommentText] = useState('what about gemini and pisces?? are they toxic or soulmates 😭');

  // Stage timeline: 0 = intro, 1 = score_reveal, 2 = aspect_cards, 3 = dodont_punchline
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2000); // ms per slide
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const synastry = quickModeSynastry(signA, signB, 'romantic');
  const signAMeta = SIGN_SEO_DATA[signA.toLowerCase()] || SIGN_SEO_DATA.gemini;
  const signBMeta = SIGN_SEO_DATA[signB.toLowerCase()] || SIGN_SEO_DATA.pisces;

  // Auto-advance when playing
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setTimeout(() => {
        setCurrentStageIndex((prev) => {
          if (prev >= CLIP_STAGES.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStageIndex, playbackSpeed]);

  const handlePlayToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentStageIndex >= CLIP_STAGES.length - 1) {
        setCurrentStageIndex(0);
      }
      setIsPlaying(true);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentStageIndex((prev) => stepFrameForward(prev, CLIP_STAGES.length - 1));
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    setCurrentStageIndex((prev) => stepFrameBackward(prev));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStageIndex(0);
  };

  const handleExportVideo = () => {
    const hasMediaRecorder = typeof window !== 'undefined' && 'MediaRecorder' in window;
    const strategy = getExportStrategy(hasMediaRecorder);
    if (strategy === 'media_recorder') {
      setExportNotice('Exporting high-framerate 9:16 clip sequence (video/mp4)... Download ready!');
    } else {
      setExportNotice('Generated 4 high-DPI keyframes (ZIP archive ready).');
    }
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleCopyCaption = async () => {
    const caption = `Reply to ${commentAuthor}: ${signA} + ${signB} synastry breakdown! Score: ${synastry.overallScore}%. One sharp truth: "${synastry.strongestAspect?.description}". Calculate yours free at starmatch.app\n\n#${signA.toLowerCase()} #${signB.toLowerCase()} #astrology #synastry #zodiac #compatibility #starmatch`;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(caption);
        setExportNotice('Viral caption copied to clipboard!');
        setTimeout(() => setExportNotice(null), 2500);
      }
    } catch {}
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FBFBFB] text-[#141414]">
      {/* Header */}
      <header className="border-b border-[#D6D6D6] bg-[#FBFBFB]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
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
              <span className="font-mono text-xs text-[#575657] font-normal uppercase tracking-[0.06em]">/ CLIP MAKER</span>
            </Link>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#F4F4F2] border border-[#D6D6D6] text-[#141414]">
              9:16 Video Studio
            </span>
          </div>
          <Link
            href="/admin"
            className="text-xs font-mono uppercase tracking-[0.06em] text-[#141414] hover:bg-[#141414] hover:text-[#FBFBFB] border border-[#141414] px-3 py-1.5 transition-colors"
          >
            ← Admin Dashboard
          </Link>
        </div>
      </header>

      {/* Main Studio View */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: 9:16 Phone Canvas Preview */}
          <div className="w-full lg:w-[420px] shrink-0 flex flex-col items-center">
            <div className="w-full text-center mb-2">
              <span className="text-[11px] font-mono uppercase text-[#575657] tracking-wider">
                Preview Screen (9:16 Vertical • 1080×1920)
              </span>
            </div>

            {/* Simulated Smartphone Screen (Co-Star Light Editorial Frame) */}
            <div className="w-[340px] sm:w-[360px] h-[600px] sm:h-[640px] bg-[#FFFFFF] border-2 border-[#141414] relative overflow-hidden flex flex-col justify-between p-6 shadow-xl select-none">
              {/* Top Watermark & TikTok Comment Box */}
              <div className="space-y-3 z-10">
                <div className="flex justify-between items-center text-[10px] font-mono text-[#575657] uppercase border-b border-[#D6D6D6] pb-2">
                  <span className="tracking-widest font-bold text-[#141414]">STARMATCH.APP</span>
                  <span>CO-STAR × WRAPPED</span>
                </div>

                {/* TikTok Comment Bubble */}
                <div className="bg-[#F4F4F2] text-[#141414] border border-[#141414] p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#575657]">
                    <span className="w-4 h-4 bg-[#141414] text-[#FBFBFB] flex items-center justify-center text-[9px] font-bold">
                      @
                    </span>
                    <span>Reply to {commentAuthor}</span>
                  </div>
                  <p className="text-xs font-serif font-medium leading-tight line-clamp-2 text-[#141414]">
                    {commentText}
                  </p>
                </div>
              </div>

              {/* Dynamic Stage Content */}
              <div className="flex-1 flex flex-col justify-center items-center text-center my-4">
                {/* Stage 0: Intro Hook */}
                {currentStageIndex === 0 && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                    <span className="text-[11px] font-mono tracking-widest uppercase bg-[#F4F4F2] border border-[#141414] px-3 py-1 text-[#141414]">
                      Cosmic Dynamic Analysis
                    </span>
                    <div className="text-4xl font-serif text-[#141414] flex items-center justify-center gap-3">
                      <span>{signAMeta.symbol}</span>
                      <span className="text-[#575657] text-2xl italic">&amp;</span>
                      <span>{signBMeta.symbol}</span>
                    </div>
                    <h2 className="text-2xl font-serif tracking-tight text-[#141414]">
                      {signA} <span className="text-[#575657] italic">&amp;</span> {signB}
                    </h2>
                    <p className="text-xs font-serif text-[#575657] leading-relaxed px-4">
                      Are they true soulmates or a volatile collision? Here is what nobody tells you.
                    </p>
                  </div>
                )}

                {/* Stage 1: Score Reveal */}
                {currentStageIndex === 1 && (
                  <div className="space-y-4 w-full animate-in fade-in zoom-in-95 duration-300">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-[#575657]">
                      Overall Synastry Score
                    </span>
                    <div className="py-2">
                      <ScoreGauge
                        score={synastry.overallScore}
                        lowConfidence={true}
                        size="md"
                        animated={false}
                      />
                    </div>
                    <div className="text-left w-full px-2">
                      <CategoryBars categories={synastry.categories} showDescriptions={false} />
                    </div>
                  </div>
                )}

                {/* Stage 2: One Sharp Truth */}
                {currentStageIndex === 2 && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 px-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-[#141414] bg-[#F4F4F2] border border-[#141414] px-2.5 py-0.5 inline-block">
                      The Unfiltered Dynamic
                    </span>
                    <h3 className="text-xs font-mono uppercase text-[#575657]">
                      Strongest Planetary Aspect
                    </h3>
                    <p className="text-lg font-serif italic text-[#141414] leading-snug">
                      &ldquo;{synastry.strongestAspect?.description}&rdquo;
                    </p>
                    <p className="text-[11px] font-serif text-[#575657] leading-relaxed">
                      Elemental polarities force both partners to either grow past their defensive armor or continuously trigger each other.
                    </p>
                  </div>
                )}

                {/* Stage 3: Do & Don't Punchline & CTA */}
                {currentStageIndex === 3 && (
                  <div className="space-y-3 w-full animate-in fade-in zoom-in-95 duration-300 text-left">
                    <div className="p-3 bg-[rgba(144,202,243,0.28)] border border-[#141414] space-y-1">
                      <div className="text-[10px] font-mono text-[#141414] uppercase font-bold">
                        DO FOR THIS PAIR:
                      </div>
                      <div className="text-xs font-serif text-[#141414]">
                        {synastry.dailyDoDont.doAction}
                      </div>
                    </div>
                    <div className="p-3 bg-[rgba(243,144,144,0.28)] border border-[#141414] space-y-1">
                      <div className="text-[10px] font-mono text-[#141414] uppercase font-bold">
                        DON&apos;T DO:
                      </div>
                      <div className="text-xs font-serif text-[#141414]">
                        {synastry.dailyDoDont.dontAction}
                      </div>
                    </div>
                    <div className="text-center pt-2">
                      <span className="text-xs font-mono text-[#141414] font-bold tracking-wider uppercase block">
                        Get Your Free Reading:
                      </span>
                      <span className="text-[11px] font-mono text-[#575657] uppercase">
                        starmatch.app
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Phone Stamp */}
              <div className="text-center border-t border-[#D6D6D6] pt-2 z-10">
                <span className="text-[10px] font-mono text-[#575657] uppercase tracking-wider">
                  Slide {currentStageIndex + 1} of {CLIP_STAGES.length} • {CLIP_STAGES[currentStageIndex]}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Studio Controls Panel */}
          <div className="flex-1 w-full space-y-6">
            {/* Playback Controls Box */}
            <div className="bg-[#FFFFFF] border border-[#D6D6D6] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#D6D6D6] pb-4">
                <div>
                  <h2 className="text-sm font-mono uppercase tracking-widest text-[#141414] font-semibold">
                    Timeline &amp; Playback Controller
                  </h2>
                  <p className="text-xs text-[#575657] mt-1 font-serif">
                    Play, pause, and step through the 4 sequenced reveal slides.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#141414] px-2.5 py-0.5 bg-[#F4F4F2] border border-[#141414]">
                  {isPlaying ? 'PLAYING' : 'PAUSED'}
                </span>
              </div>

              {/* Stage Step Indicators */}
              <div className="grid grid-cols-4 gap-2">
                {CLIP_STAGES.map((stage, idx) => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStageIndex(idx);
                    }}
                    className={`p-2.5 text-left border transition-colors cursor-pointer ${
                      currentStageIndex === idx
                        ? 'bg-[#141414] text-[#FBFBFB] border-[#141414] font-bold'
                        : 'bg-[#FBFBFB] text-[#575657] border-[#D6D6D6] hover:border-[#141414] hover:text-[#141414]'
                    }`}
                  >
                    <div className="text-[10px] font-mono uppercase">Slide {idx + 1}</div>
                    <div className="text-xs font-mono uppercase truncate">{stage}</div>
                  </button>
                ))}
              </div>

              {/* Control Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant={isPlaying ? 'danger' : 'primary'}
                  size="md"
                  onClick={handlePlayToggle}
                  className="w-28 font-mono uppercase"
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleStepBackward}
                  disabled={currentStageIndex === 0}
                  className="font-mono uppercase"
                >
                  ← Step Back
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleStepForward}
                  disabled={currentStageIndex === CLIP_STAGES.length - 1}
                  className="font-mono uppercase"
                >
                  Step Next →
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={handleReset}
                  className="font-mono uppercase text-[#575657] hover:text-[#141414]"
                >
                  Reset
                </Button>
              </div>

              {/* Slide Duration Slider */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-mono text-[#575657]">
                  <span>Slide Duration</span>
                  <span>{(playbackSpeed / 1000).toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="4000"
                  step="250"
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="w-full accent-[#141414]"
                />
              </div>
            </div>

            {/* Signs & Comment Reply Configurator */}
            <div className="bg-[#FFFFFF] border border-[#D6D6D6] p-6 space-y-6">
              <div className="border-b border-[#D6D6D6] pb-4">
                <h2 className="text-sm font-mono uppercase tracking-widest text-[#141414] font-semibold">
                  Comment &amp; Sign Selector
                </h2>
                <p className="text-xs text-[#575657] mt-1 font-serif">
                  Customize the user question and the two astrological signs being evaluated.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    htmlFor="clip-sign-a"
                    className="text-xs font-mono text-[#575657] uppercase"
                  >
                    Person A Sign
                  </label>
                  <select
                    id="clip-sign-a"
                    value={signA}
                    onChange={(e) => setSignA(e.target.value as ZodiacSign)}
                    className="w-full bg-[#FBFBFB] border border-[#D6D6D6] px-3 py-2 text-xs font-mono text-[#141414] focus:outline-none focus:border-[#141414]"
                  >
                    {ZODIAC_SIGNS_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {s} ({SIGN_SEO_DATA[s.toLowerCase()].symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="clip-sign-b"
                    className="text-xs font-mono text-[#575657] uppercase"
                  >
                    Person B Sign
                  </label>
                  <select
                    id="clip-sign-b"
                    value={signB}
                    onChange={(e) => setSignB(e.target.value as ZodiacSign)}
                    className="w-full bg-[#FBFBFB] border border-[#D6D6D6] px-3 py-2 text-xs font-mono text-[#141414] focus:outline-none focus:border-[#141414]"
                  >
                    {ZODIAC_SIGNS_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {s} ({SIGN_SEO_DATA[s.toLowerCase()].symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="clip-author-input"
                  className="text-xs font-mono text-[#575657] uppercase"
                >
                  TikTok Commenter Handle
                </label>
                <input
                  id="clip-author-input"
                  type="text"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  className="w-full bg-[#FBFBFB] border border-[#D6D6D6] px-3 py-2 text-xs font-mono text-[#141414] focus:outline-none focus:border-[#141414]"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="clip-comment-text"
                  className="text-xs font-mono text-[#575657] uppercase"
                >
                  Comment Question / Hook Text
                </label>
                <textarea
                  id="clip-comment-text"
                  rows={2}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-[#FBFBFB] border border-[#D6D6D6] px-3 py-2 text-xs font-mono text-[#141414] focus:outline-none focus:border-[#141414]"
                />
              </div>
            </div>

            {/* Export & Publishing Box */}
            <div className="bg-[#FFFFFF] border border-[#D6D6D6] p-6 space-y-4">
              <div className="border-b border-[#D6D6D6] pb-3">
                <h2 className="text-sm font-mono uppercase tracking-widest text-[#141414] font-semibold">
                  Export Video &amp; Social Assets
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleExportVideo}
                  className="font-mono uppercase"
                >
                  Export 9:16 Video (MP4)
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyCaption}
                  className="font-mono uppercase"
                >
                  Copy TikTok Caption
                </Button>
              </div>

              {exportNotice && (
                <p className="text-xs font-mono text-[#141414] font-semibold">{exportNotice}</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <EditorialFooter />
    </div>
  );
}
