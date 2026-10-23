import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { themeStore } from '@/components/theme/ThemeProvider';
import { StudioChrome } from '@/components/chrome/StudioChrome';
import { HeroStage } from '@/components/hero/HeroStage';
import { ScanlineMatrixMorpher } from '@/components/home/ScanlineMatrixMorpher';
import { WireframeCelestialSculpture } from '@/components/hero/WireframeCelestialSculpture';
import { LiveCelestialBiWheel } from '@/components/home/LiveCelestialBiWheel';
import HomePage from '@/app/page';
import { CHAPTER_EMBLEMS, getChapterEmblem } from '@/lib/emblems/data';
import type { NatalPlanet, SynastryAspect } from '@/lib/astro/types';

// Mock next/navigation for Node-based SSR testing of CompatibilityForm & HomePage
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

describe('Milestone 5: Interactive Showcase & UI Verification Suite', () => {
  // =========================================================================
  // 1. Halftone Dot-Matrix & Hooke's Law Spring Physics Math
  // =========================================================================
  describe("1. Halftone Dot Matrix & Hooke's Law Spring Physics Calculations", () => {
    // Pure mathematical model of the damped Hooke's Law spring physics in HalftoneHandsCanvas
    function simulateSpringStep(
      x: number,
      vx: number,
      x0: number,
      k: number = 0.08,
      damping: number = 0.86
    ) {
      const fx = (x0 - x) * k;
      const nextVx = (vx + fx) * damping;
      const nextX = x + nextVx;
      return { x: nextX, vx: nextVx };
    }

    function calculatePointerRepulsion(
      dotX: number,
      dotY: number,
      pointerX: number,
      pointerY: number,
      maxDist: number = 110,
      maxForce: number = 3.8
    ) {
      const dx = dotX - pointerX;
      const dy = dotY - pointerY;
      const dist = Math.hypot(dx, dy);

      if (dist < maxDist && dist > 0.001) {
        const force = (1 - dist / maxDist) * maxForce;
        return {
          active: true,
          impulseX: (dx / dist) * force,
          impulseY: (dy / dist) * force,
          force,
        };
      }
      return { active: false, impulseX: 0, impulseY: 0, force: 0 };
    }

    it('calculates single-tick restorative spring force toward equilibrium', () => {
      const x0 = 100;
      const displacedX = 120; // displaced by +20px
      const initialVx = 0;

      const result = simulateSpringStep(displacedX, initialVx, x0, 0.08, 0.86);

      // Expected: fx = (100 - 120) * 0.08 = -1.6
      // vx = (0 - 1.6) * 0.86 = -1.376
      // x = 120 - 1.376 = 118.624
      expect(result.vx).toBeCloseTo(-1.376, 3);
      expect(result.x).toBeCloseTo(118.624, 3);
      expect(result.x).toBeLessThan(displacedX);
    });

    it('converges smoothly to equilibrium x0 over multiple simulation steps without explosion', () => {
      const x0 = 250;
      let x = 320; // initial displacement of +70px
      let vx = 0;

      // Run 60 frames (1 second at 60fps)
      for (let frame = 0; frame < 60; frame++) {
        const step = simulateSpringStep(x, vx, x0, 0.08, 0.86);
        x = step.x;
        vx = step.vx;
      }

      // After 60 frames with k=0.08 and damping=0.86, system settles within 1.0px of equilibrium (from 70px)
      expect(Math.abs(x - x0)).toBeLessThan(1.0);
      expect(Math.abs(vx)).toBeLessThan(0.05);
    });

    it('calculates radial elastic cursor repulsion when pointer is within active radius', () => {
      const dotX = 100;
      const dotY = 100;
      const pointerX = 100;
      const pointerY = 45; // pointer is 55px directly above (half of 110px maxDist)

      const repulsion = calculatePointerRepulsion(dotX, dotY, pointerX, pointerY, 110, 3.8);

      expect(repulsion.active).toBe(true);
      // At half distance: force = (1 - 55 / 110) * 3.8 = 0.5 * 3.8 = 1.9
      expect(repulsion.force).toBeCloseTo(1.9, 2);
      expect(repulsion.impulseX).toBeCloseTo(0, 2);
      // Impulses downward (+Y away from pointer)
      expect(repulsion.impulseY).toBeCloseTo(1.9, 2);
    });

    it('returns zero impulse when pointer is outside max interaction distance', () => {
      const dotX = 100;
      const dotY = 100;
      const pointerX = 300;
      const pointerY = 300; // dist ~ 282px > 110px

      const repulsion = calculatePointerRepulsion(dotX, dotY, pointerX, pointerY, 110, 3.8);

      expect(repulsion.active).toBe(false);
      expect(repulsion.impulseX).toBe(0);
      expect(repulsion.impulseY).toBe(0);
      expect(repulsion.force).toBe(0);
    });
  });

  // =========================================================================
  // 2. 3D Wireframe Projection & Perspective Math
  // =========================================================================
  describe('2. 3D Wireframe Projection and Perspective Math', () => {
    // Pure implementation of the 3D projection pipeline used in WireframeCelestialSculpture
    function project3DPoint(
      p: { x: number; y: number; z: number },
      rotX: number,
      rotY: number,
      cameraDist: number = 320,
      fov: number = 400,
      cx: number = 200,
      cy: number = 200
    ) {
      // 1. Yaw rotation (Y axis)
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = p.x * cosY + p.z * sinY;
      const z1 = -p.x * sinY + p.z * cosY;

      // 2. Pitch rotation (X axis)
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y2 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;

      // 3. Camera distance & perspective divide
      const zEff = z2 + cameraDist;
      if (zEff <= 1) return null; // Behind or at camera plane

      const scale = fov / zEff;
      return {
        screenX: x1 * scale + cx,
        screenY: y2 * scale + cy,
        scale,
        depth: z2,
      };
    }

    it('projects origin (0, 0, 0) directly to screen center under zero rotation', () => {
      const proj = project3DPoint({ x: 0, y: 0, z: 0 }, 0, 0, 320, 400, 250, 250);

      expect(proj).not.toBeNull();
      expect(proj?.screenX).toBeCloseTo(250, 4);
      expect(proj?.screenY).toBeCloseTo(250, 4);
      expect(proj?.depth).toBeCloseTo(0, 4);
      expect(proj?.scale).toBeCloseTo(400 / 320, 4);
    });

    it('demonstrates perspective foreshortening: nearer z results in larger scale', () => {
      const nearPoint = { x: 50, y: 0, z: 80 }; // Nearer to camera (larger +Z forward)
      const farPoint = { x: 50, y: 0, z: -80 }; // Further from camera (-Z away)

      // In camera perspective zEff = z + cameraDist
      const projNear = project3DPoint(nearPoint, 0, 0, 320, 400, 200, 200);
      const projFar = project3DPoint(farPoint, 0, 0, 320, 400, 200, 200);

      expect(projNear).not.toBeNull();
      expect(projFar).not.toBeNull();

      // Near point at z=80 has zEff = 400, scale = 400/400 = 1.0
      // Far point at z=-80 has zEff = 240, scale = 400/240 = 1.666
      expect(projNear!.scale).toBeLessThan(projFar!.scale);
      expect(projNear!.depth).toBeGreaterThan(projFar!.depth);
    });

    it('correctly rotates coordinates under 90-degree yaw rotation', () => {
      const p = { x: 100, y: 0, z: 0 };
      const halfPi = Math.PI / 2;

      // After 90-deg yaw rotation around Y:
      // x1 = 100 * cos(pi/2) + 0 = 0
      // z1 = -100 * sin(pi/2) + 0 = -100
      const proj = project3DPoint(p, 0, halfPi, 320, 400, 200, 200);

      expect(proj).not.toBeNull();
      expect(proj?.screenX).toBeCloseTo(200, 2); // Center X since x1=0
      expect(proj?.depth).toBeCloseTo(-100, 2);
    });

    it('clips points behind camera plane (zEff <= 1)', () => {
      // Camera at cameraDist=320, if z2 <= -320 then zEff <= 0
      const pointBehind = { x: 0, y: 0, z: -350 };
      const proj = project3DPoint(pointBehind, 0, 0, 320, 400, 200, 200);

      expect(proj).toBeNull();
    });
  });

  // =========================================================================
  // 3. OGREES 5-Chapter Matrix Data Integrity & Scanline Glitch Function
  // =========================================================================
  describe('3. OGREES 5-Chapter Matrix Data Integrity & Scanline Wave Glitch', () => {
    it('has exactly 5 chapters with sequential numbers 01 through 05', () => {
      expect(CHAPTER_EMBLEMS.length).toBe(5);
      const numbers = CHAPTER_EMBLEMS.map((c) => c.number);
      expect(numbers).toEqual(['01', '02', '03', '04', '05']);
    });

    it('verifies all 5 emblem matrices have dimension 28x28 with valid palette mappings', () => {
      CHAPTER_EMBLEMS.forEach((emblem) => {
        expect(emblem.dimensions.width).toBe(28);
        expect(emblem.dimensions.height).toBe(28);
        expect(emblem.matrix.length).toBe(28);

        // Every row must be strictly 28 characters
        emblem.matrix.forEach((row, rowIdx) => {
          expect(
            row.length,
            `Chapter ${emblem.number} row ${rowIdx} length must be 28`
          ).toBe(28);

          // Every character in the row must map to a valid palette entry
          for (let col = 0; col < row.length; col++) {
            const char = row[col];
            expect(
              emblem.palette[char],
              `Chapter ${emblem.number} unknown character '${char}' at row ${rowIdx}, col ${col}`
            ).toBeDefined();
          }
        });

        // Palette must define transparent background and non-empty color strings
        expect(emblem.palette['.']).toBe('transparent');
        expect(emblem.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(emblem.editorial.length).toBeGreaterThan(20);
        expect(emblem.title.length).toBeGreaterThan(5);
      });
    });

    it('retrieves emblems correctly using getChapterEmblem by number and index', () => {
      expect(getChapterEmblem('01').title).toBe('Giving Our Best');
      expect(getChapterEmblem('02').title).toBe("Adding Value Where Others Don't");
      expect(getChapterEmblem('03').title).toBe('Pushing Boundaries');
      expect(getChapterEmblem('04').title).toBe('Connecting Hearts, Stars, and People');
      expect(getChapterEmblem('05').title).toBe('Driving Truth Through Astronomy');

      // Numeric indices (0-based)
      expect(getChapterEmblem(0).number).toBe('01');
      expect(getChapterEmblem(4).number).toBe('05');

      // Clamping out-of-range indices
      expect(getChapterEmblem(-1).number).toBe('01');
      expect(getChapterEmblem(99).number).toBe('05');
    });

    // Pure mathematical model of ScanlineMatrixMorpher's slice/wave displacement glitch
    function calculateScanlineDisplacement(
      y: number,
      scanlineY: number,
      t: number,
      activeBand: number = 32,
      maxAmplitude: number = 24
    ): number {
      const distToScanline = Math.abs(y - scanlineY);
      if (distToScanline < activeBand) {
        const bandFactor = 1 - distToScanline / activeBand;
        return (
          Math.sin(Math.floor(y / 4) * 1.8 + t * 12) * maxAmplitude * bandFactor
        );
      }
      return 0;
    }

    it('calculates zero displacement outside the active scanline band', () => {
      const scanlineY = 168; // Center of 336px canvas
      const farY = 50; // dist = 118 > 32
      const deltaX = calculateScanlineDisplacement(farY, scanlineY, 1.0, 32, 24);

      expect(deltaX).toBe(0);
    });

    it('applies maximum amplitude modulation at the center of the scanline', () => {
      const scanlineY = 168;
      const atScanline = 168; // dist = 0 -> bandFactor = 1.0
      const deltaX = calculateScanlineDisplacement(atScanline, scanlineY, 0.5, 32, 24);

      // Must be non-zero and bounded within [-24, 24]
      expect(Math.abs(deltaX)).toBeLessThanOrEqual(24);
      expect(deltaX).toBe(
        Math.sin(Math.floor(168 / 4) * 1.8 + 0.5 * 12) * 24
      );
    });

    it('quantizes wave displacement in 4px vertical slices for coherent pixel-block movement', () => {
      // y = 100, 101, 102, 103 all share Math.floor(y / 4) = 25
      const sliceBase = 100;
      const phase1 = Math.floor(sliceBase / 4);
      const phase2 = Math.floor((sliceBase + 1) / 4);
      const phase3 = Math.floor((sliceBase + 2) / 4);
      const phase4 = Math.floor((sliceBase + 3) / 4);

      expect(phase1).toBe(25);
      expect(phase2).toBe(25);
      expect(phase3).toBe(25);
      expect(phase4).toBe(25);
    });
  });

  // =========================================================================
  // 4. React 19 useSyncExternalStore Theme Store Referential Stability
  // =========================================================================
  describe('4. React 19 useSyncExternalStore Theme Store Stability', () => {
    it('maintains strict referential equality on consecutive getSnapshot calls', () => {
      const snap1 = themeStore.getSnapshot();
      const snap2 = themeStore.getSnapshot();

      expect(Object.is(snap1, snap2)).toBe(true);
      expect(snap1).toBe(snap2);
      expect(['alabaster', 'obsidian']).toContain(snap1);
    });

    it('returns deterministic server snapshot for SSR rendering', () => {
      const serverSnap = themeStore.getServerSnapshot();
      expect(serverSnap).toBe('alabaster');
    });

    it('notifies subscribers and updates snapshot referentially on toggleTheme', () => {
      let notifiedCount = 0;
      const unsubscribe = themeStore.subscribe(() => {
        notifiedCount++;
      });

      themeStore.setTheme('obsidian');
      const snapBefore = themeStore.getSnapshot();
      expect(snapBefore).toBe('obsidian');

      themeStore.toggleTheme();
      const snapAfter = themeStore.getSnapshot();
      expect(snapAfter).toBe('alabaster');
      expect(notifiedCount).toBeGreaterThanOrEqual(1);

      // Clean up subscription
      unsubscribe();
      const countBeforeUnsub = notifiedCount;
      themeStore.toggleTheme();
      expect(notifiedCount).toBe(countBeforeUnsub); // no more notifications

      // Restore to obsidian baseline
      themeStore.setTheme('obsidian');
    });
  });

  // =========================================================================
  // 5. SSR Prerender Verification via renderToString
  // =========================================================================
  describe('5. SSR Prerender Verification via renderToString', () => {
    it('renders HeroStage cleanly during SSR with zero crashes', () => {
      const html = renderToString(React.createElement(HeroStage));

      expect(html).toContain('Rebooting the');
      expect(html).toContain('Cosmic Connection.');
      expect(html).toContain('We&#x27;re not building another horoscope app');
      expect(html).toContain('Cross Stars');
      expect(html).toContain('Join our World');
      expect(html).toContain('href="#synastry-studio"');
      expect(html).toContain('<canvas');
    });

    it('renders ScanlineMatrixMorpher cleanly with accessible tablist and SVG fallback during SSR', () => {
      const html = renderToString(React.createElement(ScanlineMatrixMorpher));

      // ARIA Tablist and interactive scrub tabs
      expect(html).toContain('role="tablist"');
      expect(html).toContain('role="tab"');
      expect(html).toContain('chapter-tab-01');
      expect(html).toContain('chapter-tab-05');
      expect(html).toContain('Giving Our Best');
      expect(html).toContain('Oracle Spirit');

      // SSR SVG Fallback rendering
      expect(html).toContain('<svg');
      expect(html).toContain('viewBox="0 0 336 336"');
      expect(html).toContain('width="336"');
      expect(html).toContain('height="336"');
    });

    it('renders WireframeCelestialSculpture cleanly during SSR with monumental typography and off-white CTA', () => {
      const html = renderToString(React.createElement(WireframeCelestialSculpture));
      expect(html).toContain('id="mantis-sculpture"');
      expect(html).toContain('we decode feelings.');
      expect(html).toContain('Compare charts');
      expect(html).toContain('StarMatch');
      expect(html).toContain('MANTIS LABS // OBS-03');
      expect(html).toContain('FIGURE 03 // REACHING GESTURE');
      expect(html).toContain('Synastry');
      expect(html).toContain('Manifesto');
      expect(html).toContain('<canvas');
    });

    it('renders StudioChrome cleanly with 4-corner telemetry and children during SSR', () => {
      const html = renderToString(
        React.createElement(
          StudioChrome,
          null,
          React.createElement('div', { id: 'inner-observatory-test' }, 'Child Payload')
        )
      );

      // Top pinned header
      expect(html).toContain('role="banner"');
      expect(html).toContain('STARMATCH');
      expect(html).toContain('SYNASTRY STUDIO');
      expect(html).toContain('NATAL');
      expect(html).toContain('FORECAST');
      expect(html).toContain('ARCHIVE');

      // Bottom pinned footer
      expect(html).toContain('role="contentinfo"');
      expect(html).toContain('DETERMINISTIC STUDIO');
      expect(html).toContain('VSOP87 DE405');
      expect(html).toContain('STARMATCH V4');

      // Child payload
      expect(html).toContain('id="inner-observatory-test"');
      expect(html).toContain('Child Payload');
    });

    it('renders LiveCelestialBiWheel during SSR in Default Mode, Quick Mode, and Full Aspect Mode', () => {
      // 1. Default empty bi-wheel
      const htmlDefault = renderToString(React.createElement(LiveCelestialBiWheel));
      expect(htmlDefault).toContain('<svg');
      expect(htmlDefault).toContain('aria-label="Dual-Ring Celestial Bi-Wheel SVG"');
      expect(htmlDefault).toContain('aria-label="Celestial Synastry Bi-Wheel"');
      // Contains zodiac glyphs
      expect(htmlDefault).toContain('♈');
      expect(htmlDefault).toContain('♓');

      // 2. Quick Mode with 2 Signs
      const htmlQuick = renderToString(
        React.createElement(LiveCelestialBiWheel, {
          signA: 'Aries',
          signB: 'Leo',
          isQuickMode: true,
          personAName: 'Atlas',
          personBName: 'Lyra',
        })
      );
      expect(htmlQuick).toContain('ATLAS');
      expect(htmlQuick).toContain('LYRA');
      expect(htmlQuick).toContain('QUICK MODE SYNTHESIS');

      // 3. Explicit Planetary Aspects
      const samplePlanetsA: NatalPlanet[] = [
        { name: 'Sun', longitude: 28.5, sign: 'Aries', degree: 28.5 },
        { name: 'Venus', longitude: 52.1, sign: 'Taurus', degree: 22.1 },
      ];
      const samplePlanetsB: NatalPlanet[] = [
        { name: 'Moon', longitude: 208.5, sign: 'Libra', degree: 28.5 },
        { name: 'Mars', longitude: 54.0, sign: 'Taurus', degree: 24.0 },
      ];
      const sampleAspects: SynastryAspect[] = [
        {
          planetA: 'Sun',
          planetB: 'Moon',
          type: 'opposition',
          angle: 180,
          orb: 0.0,
          weight: 8.5,
          description: 'Sun opposition Moon',
        },
        {
          planetA: 'Venus',
          planetB: 'Mars',
          type: 'conjunction',
          angle: 0,
          orb: 1.9,
          weight: 9.5,
          description: 'Venus conjunction Mars',
        },
      ];

      const htmlFull = renderToString(
        React.createElement(LiveCelestialBiWheel, {
          planetsA: samplePlanetsA,
          planetsB: samplePlanetsB,
          aspects: sampleAspects,
          personAName: 'Person A',
          personBName: 'Person B',
        })
      );
      expect(htmlFull).toContain('PERSON A');
      expect(htmlFull).toContain('CHORDS');
      expect(htmlFull).toContain('TRUE VSOP87 POSITIONS');
    });

    it('renders complete integrated HomePage with all 6 architectural layers during SSR', () => {
      const htmlPage = renderToString(React.createElement(HomePage));

      // Layer 1: StudioChrome
      expect(htmlPage).toContain('role="banner"');
      expect(htmlPage).toContain('STARMATCH');
      expect(htmlPage).toContain('DETERMINISTIC STUDIO');

      // Layer 2: HeroStage
      expect(htmlPage).toContain('Rebooting the');
      expect(htmlPage).toContain('Cosmic Connection.');
      expect(htmlPage).toContain('Join our World');
      expect(htmlPage).toContain('Cross Stars');

      // Layer 3: ScanlineMatrixMorpher
      expect(htmlPage).toContain('Giving Our Best');
      expect(htmlPage).toContain('Oracle Spirit');

      // Layer 4: WireframeCelestialSculpture (Mantis 3D Sculpture)
      expect(htmlPage).toContain('id="mantis-sculpture"');
      expect(htmlPage).toContain('we decode feelings.');
      expect(htmlPage).toContain('Compare charts');

      // Layer 5: CompatibilityForm (Tactile Synastry Studio)
      expect(htmlPage).toContain('id="synastry-studio"');
      expect(htmlPage).toContain('INSTANT CALIBRATION PRESETS:');
      expect(htmlPage).toContain('Person A');
      expect(htmlPage).toContain('Person B');

      // Layer 6: EditorialFooter
      expect(htmlPage).toContain('STARMATCH OBSERVATORY');
      expect(htmlPage).toContain('© 2026 StarMatch Inc.');
    });
  });
});
