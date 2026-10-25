'use client';

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import {
  CHAPTER_EMBLEMS,
  ChapterEmblem,
} from '@/lib/emblems/data';

export interface ScanlineMatrixMorpherProps {
  initialChapter?: number | string;
  className?: string;
  autoPlay?: boolean;
  onChapterChange?: (chapterIndex: number) => void;
}

// OGREES uses a 32×32 outer Cartesian grid with a 2-cell border around the 28×28 emblem
const OUTER_GRID_DIM = 32;
const EMBLEM_DIM = 28;
const PAD_CELLS = 2;
const CANVAS_SIZE = 336; // 32 * 10.5 = 336px (preserves 336x336 viewBox & dimensions)
const CELL_SIZE = CANVAS_SIZE / OUTER_GRID_DIM; // 10.5px per cell
const ACTIVE_BAND = 36; // Active glitch band +/- 36px around scanline

const CHAPTER_CELESTIAL_TELEMETRY: Record<string, { coord: string; harmonic: string }> = {
  '01': { coord: 'RA 04h 35m // DEC +16°30′', harmonic: 'Ψ₁ ORBITAL TENSION // H8' },
  '02': { coord: 'RA 07h 45m // DEC +28°01′', harmonic: '♊ BINARY SYNASTRY // H7' },
  '03': { coord: 'RA 16h 29m // DEC -26°25′', harmonic: '♏ ALCHEMICAL ORB // Δ 0.04°' },
  '04': { coord: 'RA 10h 08m // DEC +11°58′', harmonic: '♌ COR LEONIS // CONJUNCTION' },
  '05': { coord: 'RA 20h 41m // DEC +45°16′', harmonic: 'VSOP87 DE405 // SUB-MRAD' },
};

const emptySubscribe = () => () => {};

export function ScanlineMatrixMorpher({
  initialChapter = 0,
  className = '',
  autoPlay = false,
  onChapterChange,
}: ScanlineMatrixMorpherProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const initialIndex =
    typeof initialChapter === 'string'
      ? Math.max(
          0,
          CHAPTER_EMBLEMS.findIndex(
            (c) => c.number === initialChapter || c.id === initialChapter
          )
        )
      : Math.max(0, Math.min(CHAPTER_EMBLEMS.length - 1, initialChapter));

  const [activeChapterIndex, setActiveChapterIndex] = useState(initialIndex);
  const [outgoingChapterIndex, setOutgoingChapterIndex] = useState(initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenOutRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenInRef = useRef<HTMLCanvasElement | null>(null);

  const animFrameRef = useRef<number | null>(null);
  const transitionStartRef = useRef<number | null>(null);
  const transitionDurationRef = useRef<number>(720); // ms
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeEmblem = CHAPTER_EMBLEMS[activeChapterIndex] || CHAPTER_EMBLEMS[0];
  const outgoingEmblem = CHAPTER_EMBLEMS[outgoingChapterIndex] || CHAPTER_EMBLEMS[0];
  const activeTelemetry = CHAPTER_CELESTIAL_TELEMETRY[activeEmblem.number] || CHAPTER_CELESTIAL_TELEMETRY['01'];

  // Render an emblem's 28×28 matrix centered inside the 32×32 offscreen canvas (with 2-cell padding)
  const renderEmblemToCanvas = useCallback(
    (targetCanvas: HTMLCanvasElement, emblem: ChapterEmblem) => {
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      const matrix = emblem.matrix;
      const palette = emblem.palette;

      for (let r = 0; r < EMBLEM_DIM; r++) {
        const row = matrix[r] || '';
        for (let c = 0; c < EMBLEM_DIM; c++) {
          const char = row[c] || '.';
          const color = palette[char];
          if (color && color !== 'transparent') {
            ctx.fillStyle = color;
            const x = (c + PAD_CELLS) * CELL_SIZE;
            const y = (r + PAD_CELLS) * CELL_SIZE;
            // Slight +0.35px overlap avoids subpixel hairlines inside solid blocks
            ctx.fillRect(x, y, CELL_SIZE + 0.35, CELL_SIZE + 0.35);
          }
        }
      }
    },
    []
  );

  const triggerTransition = useCallback(
    (targetIndex: number) => {
      if (targetIndex === activeChapterIndex && !isTransitioning) return;
      if (targetIndex < 0 || targetIndex >= CHAPTER_EMBLEMS.length) return;

      setOutgoingChapterIndex(activeChapterIndex);
      setActiveChapterIndex(targetIndex);
      setIsTransitioning(true);
      setTransitionProgress(0);
      transitionStartRef.current = null;

      if (onChapterChange) {
        onChapterChange(targetIndex);
      }
    },
    [activeChapterIndex, isTransitioning, onChapterChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (index + 1) % CHAPTER_EMBLEMS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (index - 1 + CHAPTER_EMBLEMS.length) % CHAPTER_EMBLEMS.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = CHAPTER_EMBLEMS.length - 1;
    } else {
      return;
    }

    tabRefs.current[nextIndex]?.focus();
    triggerTransition(nextIndex);
  };

  useEffect(() => {
    if (!isMounted) return;

    if (!offscreenOutRef.current) {
      const c = document.createElement('canvas');
      c.width = CANVAS_SIZE;
      c.height = CANVAS_SIZE;
      offscreenOutRef.current = c;
    }
    if (!offscreenInRef.current) {
      const c = document.createElement('canvas');
      c.width = CANVAS_SIZE;
      c.height = CANVAS_SIZE;
      offscreenInRef.current = c;
    }
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    if (offscreenOutRef.current) {
      renderEmblemToCanvas(offscreenOutRef.current, outgoingEmblem);
    }
    if (offscreenInRef.current) {
      renderEmblemToCanvas(offscreenInRef.current, activeEmblem);
    }
  }, [activeEmblem, outgoingEmblem, isMounted, renderEmblemToCanvas]);

  useEffect(() => {
    if (!autoPlay || !isMounted) return;
    const interval = setInterval(() => {
      setActiveChapterIndex((prev) => {
        const next = (prev + 1) % CHAPTER_EMBLEMS.length;
        setOutgoingChapterIndex(prev);
        setIsTransitioning(true);
        setTransitionProgress(0);
        transitionStartRef.current = null;
        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [autoPlay, isMounted]);

  // 60fps HTML5 Canvas Render Loop with OGREES 32×32 Cartesian Grid & Crisp Scanline Wipe
  useEffect(() => {
    if (!isMounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = CANVAS_SIZE * dpr;
    canvas.height = CANVAS_SIZE * dpr;
    ctx.scale(dpr, dpr);

    let isRunning = true;

    const drawFrame = (currentTime: number) => {
      if (!isRunning) return;

      const t = currentTime / 1000;

      let progress = 1;
      let currentScanlineY = CANVAS_SIZE;

      if (isTransitioning) {
        if (transitionStartRef.current === null) {
          transitionStartRef.current = currentTime;
        }

        const elapsed = currentTime - transitionStartRef.current;
        progress = Math.min(1, elapsed / transitionDurationRef.current);

        const eased = 0.5 - Math.cos(progress * Math.PI) * 0.5;
        setTransitionProgress(eased);

        // Scanline sweeps upwards from bottom (CANVAS_SIZE) to top (0) as in OGREES video
        currentScanlineY = CANVAS_SIZE * (1 - eased);

        if (progress >= 1) {
          setIsTransitioning(false);
          setTransitionProgress(1);
          transitionStartRef.current = null;
          setOutgoingChapterIndex(activeChapterIndex);
        }
      } else {
        currentScanlineY = 0;
      }

      // 1. Pure white stage background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // 2. Render horizontal slices of outgoing/incoming 28×28 emblem
      const offOut = offscreenOutRef.current;
      const offIn = offscreenInRef.current;

      if (offOut && offIn) {
        const sliceH = 4;
        const totalBands = Math.ceil(CANVAS_SIZE / sliceH);

        for (let b = 0; b < totalBands; b++) {
          const y = b * sliceH;
          const distToScanline = Math.abs(y - currentScanlineY);

          let deltaX = 0;
          if (isTransitioning && distToScanline < ACTIVE_BAND) {
            const bandFactor = 1 - distToScanline / ACTIVE_BAND;
            // Subtle, crisp horizontal step right at the active scanline boundary
            deltaX =
              Math.round(Math.sin(Math.floor(y / 8) + t * 6) * 4 * bandFactor);
          }

          if (isTransitioning) {
            if (y < currentScanlineY) {
              ctx.drawImage(
                offOut,
                0,
                y,
                CANVAS_SIZE,
                sliceH,
                deltaX,
                y,
                CANVAS_SIZE,
                sliceH
              );
            } else {
              ctx.drawImage(
                offIn,
                0,
                y,
                CANVAS_SIZE,
                sliceH,
                -deltaX,
                y,
                CANVAS_SIZE,
                sliceH
              );
            }
          } else {
            ctx.drawImage(
              offIn,
              0,
              y,
              CANVAS_SIZE,
              sliceH,
              0,
              y,
              CANVAS_SIZE,
              sliceH
            );
          }
        }
      }

      // 3. Draw 32×32 subtle Cartesian grid hairlines (#EAEAEA) on top so grid lines remain crisp
      ctx.lineWidth = 0.65;
      ctx.strokeStyle = '#EAEAEA';

      for (let c = 0; c <= OUTER_GRID_DIM; c++) {
        const x = c * CELL_SIZE;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_SIZE);
        ctx.stroke();
      }
      for (let r = 0; r <= OUTER_GRID_DIM; r++) {
        const y = r * CELL_SIZE;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_SIZE, y);
        ctx.stroke();
      }

      // 4. Outer border hairline
      ctx.lineWidth = 0.75;
      ctx.strokeStyle = '#E5E5E5';
      ctx.strokeRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // 5. Active scanline across the canvas during transition
      if (isTransitioning) {
        ctx.beginPath();
        ctx.moveTo(0, currentScanlineY);
        ctx.lineTo(CANVAS_SIZE, currentScanlineY);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#111111';
        ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(drawFrame);
    };

    animFrameRef.current = requestAnimationFrame(drawFrame);

    return () => {
      isRunning = false;
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isTransitioning, activeChapterIndex, isMounted]);

  // Scanline Y percentage from top (sweeps from 100% down to 0%)
  const scanlineTopPct = (1 - transitionProgress) * 100;

  return (
    <section
      ref={containerRef}
      id="story-chapters"
      aria-label="StarMatch 5-Chapter Storyline"
      className={`relative w-full min-h-screen bg-[#FFFFFF] text-[#0A0A0A] flex flex-col justify-between overflow-hidden select-none ${className}`}
    >
      {/* Full-Viewport Sweeping 1px Black Scanline Hairline (Exact OGREES Screen-Wide Wipe) */}
      {isTransitioning && (
        <div
          className="pointer-events-none absolute left-0 right-0 h-[1px] bg-[#111111] z-30"
          style={{ top: `${scanlineTopPct}%` }}
          aria-hidden="true"
        />
      )}

      {/* Top Section Index Bar (Co-Star Editorial Hairline without competing website nav) */}
      <div className="w-full px-6 sm:px-10 pt-5 pb-3 border-t border-b border-[#D6D6D6] flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.12em] text-[#575657] z-10">
        <span>01 // ARCHITECTURAL PRINCIPLES OF SYNASTRY</span>
        <span>CHAPTER {activeEmblem.number} OF 05</span>
      </div>

      {/* Main 3-Zone OGREES Display Stage */}
      <div
        role="tabpanel"
        id={`chapter-panel-${activeEmblem.number}`}
        aria-labelledby={`chapter-tab-${activeEmblem.number}`}
        className="flex-1 w-full px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6 relative"
      >
        {/* Left Column: Chapter Number + Monumental Sans-Serif Title Split by Scanline */}
        <div className="lg:col-span-4 text-left flex flex-col justify-center z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[11px] font-sans font-medium text-[#111111]">
              {activeEmblem.number}
            </span>
            <span className="text-[9px] font-mono tracking-[0.14em] text-[#999999] uppercase">
              {activeTelemetry.harmonic}
            </span>
          </div>

          {/* Monumental Sans-Serif Heading with OGREES Scanline Split Effect */}
          <div className="relative min-h-[132px] sm:min-h-[156px] flex items-center">
            {isTransitioning ? (
              <div className="relative w-full">
                {/* Outgoing Title (faded #D0D0D0 above scanline) */}
                <div
                  className="text-[38px] sm:text-[48px] xl:text-[54px] font-normal tracking-[-0.035em] leading-[1.03] text-[#D0D0D0] select-none"
                  style={{
                    clipPath: `inset(0 0 ${transitionProgress * 100}% 0)`,
                  }}
                >
                  {outgoingEmblem.title}
                </div>
                {/* Incoming Title (solid #0A0A0A revealed below scanline) */}
                <div
                  className="absolute inset-0 text-[38px] sm:text-[48px] xl:text-[54px] font-normal tracking-[-0.035em] leading-[1.03] text-[#0A0A0A]"
                  style={{
                    clipPath: `inset(${(1 - transitionProgress) * 100}% 0 0 0)`,
                  }}
                >
                  {activeEmblem.title}
                </div>
              </div>
            ) : (
              <h2 className="text-[38px] sm:text-[48px] xl:text-[54px] font-normal tracking-[-0.035em] leading-[1.03] text-[#0A0A0A]">
                {activeEmblem.title}
              </h2>
            )}
          </div>

          <p className="text-[11px] text-[#7A7A7A] tracking-[0.01em] font-sans mt-2">
            {activeEmblem.subtitle}
          </p>

          {/* Accessible Chapter Scrub Tabs (01 .. 05) */}
          <div
            role="tablist"
            aria-label="Story Chapters"
            className="flex items-center gap-2.5 pt-5"
          >
            {CHAPTER_EMBLEMS.map((emblem, idx) => {
              const isSelected = activeChapterIndex === idx;
              return (
                <button
                  key={emblem.id}
                  ref={(el) => {
                    tabRefs.current[idx] = el;
                  }}
                  role="tab"
                  id={`chapter-tab-${emblem.number}`}
                  aria-selected={isSelected}
                  aria-controls={`chapter-panel-${emblem.number}`}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => triggerTransition(idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className={`px-2 py-1 text-[10px] font-mono tracking-wider transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#111111] ${
                    isSelected
                      ? 'text-[#0A0A0A] font-semibold border-b border-[#0A0A0A]'
                      : 'text-[#AAAAAA] hover:text-[#111111]'
                  }`}
                >
                  {emblem.number}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Column: 32×32 Outer Cartesian Grid with 28×28 Pixel-Perfect OGREES Emblem */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center z-10">
          <div className="relative w-[336px] h-[336px] sm:w-[384px] sm:h-[384px] bg-white flex items-center justify-center">
            {isMounted ? (
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="w-full h-full block"
                aria-label={`Cartesian 28x28 Pixel Matrix displaying Chapter ${activeEmblem.number}: ${activeEmblem.title}`}
              />
            ) : (
              /* High-Fidelity SSR SVG Fallback (preserves 336x336 viewBox & dimensions) */
              <svg
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
                className="w-[336px] h-[336px] block bg-white"
                aria-label={`Cartesian Pixel Matrix fallback for Chapter ${activeEmblem.number}`}
              >
                <rect width={CANVAS_SIZE} height={CANVAS_SIZE} fill="#FFFFFF" />
                {activeEmblem.matrix.map((row, r) =>
                  row.split('').map((char, c) => {
                    const color = activeEmblem.palette[char];
                    if (!color || color === 'transparent') return null;
                    return (
                      <rect
                        key={`${r}-${c}`}
                        x={(c + PAD_CELLS) * CELL_SIZE}
                        y={(r + PAD_CELLS) * CELL_SIZE}
                        width={CELL_SIZE}
                        height={CELL_SIZE}
                        fill={color}
                      />
                    );
                  })
                )}
                {Array.from({ length: OUTER_GRID_DIM + 1 }).map((_, i) => (
                  <React.Fragment key={i}>
                    <line
                      x1={i * CELL_SIZE}
                      y1={0}
                      x2={i * CELL_SIZE}
                      y2={CANVAS_SIZE}
                      stroke="#EAEAEA"
                      strokeWidth="0.5"
                    />
                    <line
                      x1={0}
                      y1={i * CELL_SIZE}
                      x2={CANVAS_SIZE}
                      y2={i * CELL_SIZE}
                      stroke="#EAEAEA"
                      strokeWidth="0.5"
                    />
                  </React.Fragment>
                ))}
              </svg>
            )}
          </div>
          {/* Subtle StarMatch Celestial Ephemeris Coordinate Telemetry under Grid */}
          <div className="w-[336px] sm:w-[384px] flex items-center justify-between pt-2 text-[9px] font-mono text-[#A0A0A0] tracking-[0.08em]">
            <span>{activeTelemetry.coord}</span>
            <span>GRID 32×32 // EMBLEM 28×28</span>
          </div>
        </div>

        {/* Bottom-Right Column: Indented Narrative Editorial Paragraph (Exact OGREES Placement) */}
        <div className="lg:col-span-4 flex flex-col justify-end items-start lg:items-end self-end pb-4 lg:pb-10 z-10">
          <div className="relative max-w-[300px]">
            {isTransitioning ? (
              <div className="relative">
                <p
                  className="text-left text-[15px] leading-[1.32] font-normal text-[#C8C8C8] indent-12"
                  style={{
                    clipPath: `inset(0 0 ${transitionProgress * 100}% 0)`,
                  }}
                >
                  {outgoingEmblem.editorial}
                </p>
                <p
                  className="absolute inset-0 text-left text-[15px] leading-[1.32] font-normal text-[#111111] indent-12"
                  style={{
                    clipPath: `inset(${(1 - transitionProgress) * 100}% 0 0 0)`,
                  }}
                >
                  {activeEmblem.editorial}
                </p>
              </div>
            ) : (
              <p className="text-left text-[15px] leading-[1.32] font-normal text-[#111111] indent-12">
                {activeEmblem.editorial}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section Telemetry Bar (Replaces competing section footer) */}
      <div className="w-full px-6 sm:px-10 pt-3 pb-5 border-t border-[#EAEAEA] flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.1em] text-[#71717a] z-10">
        <span>TRUE EPHEMERIS • 0.1° GEOCENTRIC PRECISION</span>
        <span>CARTESIAN MATRIX V4</span>
      </div>
    </section>
  );
}

export default ScanlineMatrixMorpher;
