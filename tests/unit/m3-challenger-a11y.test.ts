import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LiveCelestialBiWheel, synthesizeQuickPlanets } from '@/components/home/LiveCelestialBiWheel';
import { CompatibilityForm } from '@/components/home/CompatibilityForm';
import { PersonInputCard } from '@/components/home/PersonInputCard';
import { RecentPairsList } from '@/components/home/RecentPairsList';
import { QuickSignSelector } from '@/components/home/QuickSignSelector';
import { RelationshipTypeSelector } from '@/components/home/RelationshipTypeSelector';

// Mock next/navigation for SSR unit testing
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

// WCAG 2.1 Luminance and Contrast Calculation Functions
function sRGBtoLinear(c: number): number {
  const norm = c / 255;
  return norm <= 0.04045 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b);
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Milestone 3 Challenger 2: A11y, Contrast, SVG Geometry & Layout Integrity', () => {
  /* ==========================================================================
     1. WCAG 2.1 CONTRAST VERIFICATION
     ========================================================================== */
  describe('WCAG 2.1 Contrast Standards Verification', () => {
    it('C-1: primary text (#0a0a0a) against pure white (#ffffff) meets AAA level (>= 7.0:1)', () => {
      const ratio = getContrastRatio('#0a0a0a', '#ffffff');
      expect(ratio).toBeGreaterThanOrEqual(7.0);
      expect(ratio).toBeCloseTo(19.8, 1);
    });

    it('C-2: primary text (#0a0a0a) against sub-surface (#fafafa) meets AAA level (>= 7.0:1)', () => {
      const ratio = getContrastRatio('#0a0a0a', '#fafafa');
      expect(ratio).toBeGreaterThanOrEqual(7.0);
      expect(ratio).toBeCloseTo(18.97, 1);
    });

    it('C-3: primary CTA submit button (white text #ffffff on #0a0a0a) meets AAA level (>= 7.0:1)', () => {
      const ratio = getContrastRatio('#ffffff', '#0a0a0a');
      expect(ratio).toBeGreaterThanOrEqual(7.0);
      expect(ratio).toBeCloseTo(19.8, 1);
    });

    it('C-4: secondary metadata text (#71717a) against pure white (#ffffff) meets AA Normal Text (>= 4.5:1)', () => {
      const ratio = getContrastRatio('#71717a', '#ffffff');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(ratio).toBeCloseTo(4.83, 1);
    });

    it('C-5: secondary metadata text (#71717a) against sub-surface (#fafafa) meets AA Normal Text (>= 4.5:1)', () => {
      const ratio = getContrastRatio('#71717a', '#fafafa');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(ratio).toBeCloseTo(4.63, 1);
    });

    it('C-6: editorial quote text (#52525b) against pure white (#ffffff) meets AAA Normal Text (>= 7.0:1)', () => {
      const ratio = getContrastRatio('#52525b', '#ffffff');
      expect(ratio).toBeGreaterThanOrEqual(7.0);
      expect(ratio).toBeCloseTo(7.73, 1);
    });

    it('C-7: telemetry alert badges (emerald-700 on emerald-50) meets AA Normal Text (>= 4.5:1)', () => {
      const ratio = getContrastRatio('#047857', '#ecfdf5');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(ratio).toBeCloseTo(5.21, 1);
    });

    it('C-8: telemetry alert badges (sky-700 on sky-50) meets AA Normal Text (>= 4.5:1)', () => {
      const ratio = getContrastRatio('#0369a1', '#f0f9ff');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(ratio).toBeCloseTo(5.57, 1);
    });

    it('C-9: telemetry alert badges (amber-800 on amber-50) meets AA Normal Text (>= 4.5:1)', () => {
      const ratio = getContrastRatio('#92400e', '#fffbeb');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(ratio).toBeCloseTo(6.84, 1);
    });

    it('C-10: telemetry alert badges (red-700 on red-50) meets AA Normal Text (>= 4.5:1)', () => {
      const ratio = getContrastRatio('#b91c1c', '#fef2f2');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(ratio).toBeCloseTo(5.91, 1);
    });
  });

  /* ==========================================================================
     2. LIVE CELESTIAL BI-WHEEL SVG GEOMETRY & PLANET DISCS
     ========================================================================== */
  describe('LiveCelestialBiWheel SVG Geometry & Node Discs', () => {
    it('BW-1: renders SVG with standard viewBox="0 0 440 440" and aspect-square container', () => {
      const html = renderToStaticMarkup(
        React.createElement(LiveCelestialBiWheel, {
          personAName: 'Elena',
          personBName: 'Julian',
          signA: 'Scorpio',
          signB: 'Leo',
          isQuickMode: true,
        })
      );

      expect(html).toContain('viewBox="0 0 440 440"');
      expect(html).toContain('aspect-square');
      expect(html).toContain('max-w-[400px]');
      expect(html).toContain('role="region"');
      expect(html).toContain('aria-label="Celestial Synastry Bi-Wheel"');
    });

    it('BW-2: all planetary node discs render with fill="#ffffff" and crisp stroke="#0a0a0a"', () => {
      const html = renderToStaticMarkup(
        React.createElement(LiveCelestialBiWheel, {
          personAName: 'Elena',
          personBName: 'Julian',
          signA: 'Scorpio',
          signB: 'Leo',
          isQuickMode: true,
        })
      );

      // Verify ZERO black/dark node fills: #050505, #070709, #000000, or #0b0b0e in circle fills
      expect(html).not.toMatch(/<circle[^>]*fill="#050505"[^>]*>/);
      expect(html).not.toMatch(/<circle[^>]*fill="#070709"[^>]*>/);
      expect(html).not.toMatch(/<circle[^>]*fill="#0b0b0e"[^>]*>/);

      // Verify node base circles have fill="#ffffff" and stroke="#0a0a0a"
      const nodeCircles = html.match(/<circle[^>]*r="(7\.5|8\.5)"[^>]*>/g) || [];
      expect(nodeCircles.length).toBe(24); // 12 for Person A + 12 for Person B
      nodeCircles.forEach((circleTag) => {
        expect(circleTag).toContain('fill="#ffffff"');
        expect(circleTag).toContain('stroke="#0a0a0a"');
        expect(circleTag).toContain('vector-effect="non-scaling-stroke"');
      });
    });

    it('BW-3: planet glyph texts render with high-contrast fill="#0a0a0a" and bold weight', () => {
      const html = renderToStaticMarkup(
        React.createElement(LiveCelestialBiWheel, {
          personAName: 'Elena',
          personBName: 'Julian',
          signA: 'Scorpio',
          signB: 'Leo',
          isQuickMode: true,
        })
      );

      // Verify glyph texts render with fill="#0a0a0a" and font-weight="bold"
      expect(html).toContain('fill="#0a0a0a"');
      expect(html).toContain('font-weight="bold"');
      // Verify contrast between glyph #0a0a0a and disc fill #ffffff
      const glyphContrast = getContrastRatio('#0a0a0a', '#ffffff');
      expect(glyphContrast).toBeGreaterThanOrEqual(7.0);
    });

    it('BW-4: renders 12 zodiac sector glyphs and division lines with proper structure', () => {
      const html = renderToStaticMarkup(
        React.createElement(LiveCelestialBiWheel, {
          signA: 'Scorpio',
          signB: 'Leo',
        })
      );

      // 12 zodiac glyphs: ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓
      const glyphs = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
      glyphs.forEach((glyph) => {
        expect(html).toContain(glyph);
      });
    });

    it('BW-5: renders aspect chords with appropriate harmonic stroke colors', () => {
      const planetsA = synthesizeQuickPlanets('Scorpio');
      const planetsB = synthesizeQuickPlanets('Leo');
      const html = renderToStaticMarkup(
        React.createElement(LiveCelestialBiWheel, {
          personAName: 'Elena',
          personBName: 'Julian',
          planetsA,
          planetsB,
        })
      );

      // Harmonic colors: trine (#10b981), square (#ef4444), opposition (#f97316), conjunction (#0284c7)
      expect(html).toMatch(/stroke="#(10b981|059669|ef4444|f97316|0284c7)"/);
    });
  });

  /* ==========================================================================
     3. PERSON INPUT CARD & CONFIDENCE INDICATORS
     ========================================================================== */
  describe('PersonInputCard Accessibility & Responsive Layout', () => {
    it('PI-1: displays Tier I confidence indicator when only birthDate is provided', () => {
      const html = renderToStaticMarkup(
        React.createElement(PersonInputCard, {
          label: 'Person A',
          defaultPlaceholderName: 'You',
          data: {
            name: 'Elena',
            birthDate: '1994-11-08',
            birthTime: '',
            city: '',
          },
          onChange: () => {},
        })
      );

      expect(html).toContain('TIER I · NOON EPHEMERIS');
      expect(html).toContain('amber');
    });

    it('PI-2: displays Tier II confidence indicator when birthDate and birthTime are provided', () => {
      const html = renderToStaticMarkup(
        React.createElement(PersonInputCard, {
          label: 'Person A',
          defaultPlaceholderName: 'You',
          data: {
            name: 'Elena',
            birthDate: '1994-11-08',
            birthTime: '21:15',
            city: '',
          },
          onChange: () => {},
        })
      );

      expect(html).toContain('TIER II · TEMPORAL LOCK');
      expect(html).toContain('sky');
    });

    it('PI-3: displays Tier III confidence indicator when birthDate, birthTime, and coordinates are provided', () => {
      const html = renderToStaticMarkup(
        React.createElement(PersonInputCard, {
          label: 'Person A',
          defaultPlaceholderName: 'You',
          data: {
            name: 'Elena',
            birthDate: '1994-11-08',
            birthTime: '21:15',
            city: 'New York, United States',
            latitude: 40.7128,
            longitude: -74.006,
          },
          onChange: () => {},
        })
      );

      expect(html).toContain('TIER III · FULL HOUSE LOCK');
      expect(html).toContain('emerald');
    });

    it('PI-4: renders accessible form inputs with labels matching input IDs', () => {
      const html = renderToStaticMarkup(
        React.createElement(PersonInputCard, {
          label: 'Person A',
          defaultPlaceholderName: 'You',
          data: {
            name: '',
            birthDate: '',
            birthTime: '',
            city: '',
          },
          onChange: () => {},
        })
      );

      expect(html).toContain('for="Person A-name"');
      expect(html).toContain('id="Person A-name"');
      expect(html).toContain('for="Person A-date"');
      expect(html).toContain('id="Person A-date"');
    });

    it('PI-5: displays error alert with [!] prefix when validation error is passed', () => {
      const html = renderToStaticMarkup(
        React.createElement(PersonInputCard, {
          label: 'Person A',
          defaultPlaceholderName: 'You',
          data: {
            name: '',
            birthDate: '',
            birthTime: '',
            city: '',
          },
          error: 'Birth date is required',
          onChange: () => {},
        })
      );

      expect(html).toContain('[!]');
      expect(html).toContain('Birth date is required');
      expect(html).toContain('text-red-600');
    });
  });

  /* ==========================================================================
     4. QUICK SIGN & RELATIONSHIP TYPE SELECTORS A11Y
     ========================================================================== */
  describe('Selectors Radiogroup & Accessible Hit Targets', () => {
    it('QS-1: QuickSignSelector renders with role="radiogroup" and individual role="radio" items', () => {
      const html = renderToStaticMarkup(
        React.createElement(QuickSignSelector, {
          label: 'Person A (You)',
          selectedSign: 'Scorpio',
          onSelect: () => {},
        })
      );

      expect(html).toContain('role="radiogroup"');
      expect(html).toContain('role="radio"');
      expect(html).toContain('aria-checked="true"');
      expect(html).toContain('LOCKED: <span class="font-semibold text-[#0A0A0A] uppercase">Scorpio</span>');
      // Minimum touch target sizes for touch devices
      expect(html).toContain('min-h-[64px]');
      expect(html).toContain('min-w-[44px]');
    });

    it('RT-1: RelationshipTypeSelector renders with role="radiogroup" and all 6 relationship options', () => {
      const html = renderToStaticMarkup(
        React.createElement(RelationshipTypeSelector, {
          value: 'romantic',
          onChange: () => {},
        })
      );

      expect(html).toContain('role="radiogroup"');
      expect(html).toContain('aria-label="Relationship Context"');
      expect(html).toContain('aria-checked="true"');
      expect(html).toContain('Romantic');
      expect(html).toContain('Crush / Talking');
      expect(html).toContain('Ex / Complicated');
      expect(html).toContain('Friendship');
      expect(html).toContain('Colleague / Co-founder');
      expect(html).toContain('Family / Bloodline');
      // Responsive grid classes
      expect(html).toContain('grid-cols-2 sm:grid-cols-3 lg:grid-cols-6');
      expect(html).toContain('min-h-[56px]');
    });
  });

  /* ==========================================================================
     5. RECENT PAIRS LIST
     ========================================================================== */
  describe('RecentPairsList Card Layout & Contrast', () => {
    it('RP-1: returns null gracefully when pairs list is empty', () => {
      const html = renderToStaticMarkup(React.createElement(RecentPairsList));
      expect(html).toBe('');
    });
  });

  /* ==========================================================================
     6. COMPATIBILITY FORM SUBMIT BUTTON & RESPONSIVE LAYOUT
     ========================================================================== */
  describe('CompatibilityForm Submit Button & Container Bounds', () => {
    it('CF-1: renders primary submit CTA button with black pill aesthetic and min-h-[54px]', () => {
      const html = renderToStaticMarkup(React.createElement(CompatibilityForm));

      // Solid black pill submit button
      expect(html).toContain('rounded-full bg-[#0A0A0A] text-white');
      expect(html).toContain('min-h-[54px]');
      expect(html).toContain('min-w-[280px]');
      expect(html).toContain('Calculate Synastry →');
    });

    it('CF-2: renders 1-click archetypal pair presets bar with instant buttons', () => {
      const html = renderToStaticMarkup(React.createElement(CompatibilityForm));

      expect(html).toContain('INSTANT CALIBRATION PRESETS:');
      expect(html).toContain('Scorpio × Leo');
      expect(html).toContain('[MAGNETIC FRICTION]');
      expect(html).toContain('Aries × Libra');
      expect(html).toContain('[OPPOSITION AXIS]');
      expect(html).toContain('Pisces × Capricorn');
      expect(html).toContain('[ARCHITECT &amp; MYSTIC]');
      expect(html).toContain('Gemini × Aquarius');
      expect(html).toContain('[CEREBRAL TRINE]');
    });

    it('CF-3: pure white styling verification — zero dark background classes in form container', () => {
      const html = renderToStaticMarkup(React.createElement(CompatibilityForm));

      // Should not contain legacy dark background classes
      expect(html).not.toContain('bg-[#050505]');
      expect(html).not.toContain('bg-[#070709]');
      expect(html).not.toContain('bg-[#0b0b0e]');
      expect(html).not.toContain('bg-zinc-950');
    });
  });
});
