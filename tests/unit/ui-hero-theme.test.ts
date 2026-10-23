import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { themeStore, ThemeProvider } from '@/components/theme/ThemeProvider';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { StudioChrome } from '@/components/chrome/StudioChrome';
import { HeroStage } from '@/components/hero/HeroStage';
import { HalftoneHandsCanvas } from '@/components/hero/HalftoneHandsCanvas';
import { WireframeCelestialSculpture } from '@/components/hero/WireframeCelestialSculpture';

describe('Milestones 1 & 2: Hero Stage & Theme Architecture Tests', () => {
  beforeEach(() => {
    themeStore.setTheme('alabaster');
  });

  describe('ThemeProvider & themeStore (React 19 useSyncExternalStore Contract)', () => {
    it('returns referentially stable snapshot conforming to Object.is checks', () => {
      const snap1 = themeStore.getSnapshot();
      const snap2 = themeStore.getSnapshot();
      expect(Object.is(snap1, snap2)).toBe(true);
      expect(['alabaster', 'obsidian']).toContain(snap1);
    });

    it('returns deterministic server snapshot for SSR rendering', () => {
      const serverSnap = themeStore.getServerSnapshot();
      expect(serverSnap).toBe('alabaster');
    });

    it('toggles theme polarity deterministically', () => {
      themeStore.setTheme('obsidian');
      expect(themeStore.getSnapshot()).toBe('obsidian');

      themeStore.toggleTheme();
      expect(themeStore.getSnapshot()).toBe('alabaster');

      themeStore.toggleTheme();
      expect(themeStore.getSnapshot()).toBe('obsidian');
    });

    it('renders ThemeProvider wrapper safely during SSR without hydration mismatch', () => {
      const html = renderToString(
        React.createElement(
          ThemeProvider,
          null,
          React.createElement('div', { id: 'test-child' }, 'Inner Content')
        )
      );
      expect(html).toContain('Inner Content');
      expect(html).toContain('id="test-child"');
    });
  });

  describe('ThemeToggle Component', () => {
    it('renders accessible studio toggle button with aria attributes during SSR', () => {
      const html = renderToString(React.createElement(ThemeToggle, { variant: 'studio' }));
      expect(html).toContain('aria-label="Toggle theme polarity between Alabaster and Obsidian"');
      expect(html).toContain('ALABASTER');
      expect(html).toContain('SWITCH → DARK');
    });

    it('renders minimal toggle button variant', () => {
      const html = renderToString(React.createElement(ThemeToggle, { variant: 'minimal' }));
      expect(html).toContain('aria-label="Toggle theme polarity between Alabaster and Obsidian"');
      expect(html).toContain('OBSIDIAN');
    });
  });

  describe('StudioChrome Pinned Viewport Frame', () => {
    it('renders pinned top header with brand and studio navigation', () => {
      const html = renderToString(
        React.createElement(
          StudioChrome,
          null,
          React.createElement('main', null, 'Studio Body')
        )
      );

      // Top bar landmarks
      expect(html).toContain('role="banner"');
      expect(html).toContain('STARMATCH');
      expect(html).toContain('SYNASTRY STUDIO');
      expect(html).toContain('SYNASTRY');
      expect(html).toContain('NATAL');
      expect(html).toContain('FORECAST');
      expect(html).toContain('ARCHIVE');
      expect(html).toContain('LET&#x27;S MATCH');

      // Side rail telemetry
      expect(html).toContain('LAT 41.3851° N • LON 2.1734° E');
      expect(html).toContain('EPHEMERIS LOCK • 0.1° PRECISION');

      // Bottom bar landmarks
      expect(html).toContain('role="contentinfo"');
      expect(html).toContain('DETERMINISTIC STUDIO');
      expect(html).toContain('VSOP87 DE405');
      expect(html).toContain('STARMATCH V4');

      // Children content
      expect(html).toContain('Studio Body');
    });
  });

  describe('HeroStage & Interactive Sculptures', () => {
    it('renders monumental typography and iridescent black pill CTA during SSR with zero crashes', () => {
      const html = renderToString(React.createElement(HeroStage));

      // Reboot headlines
      expect(html).toContain('Rebooting the');
      expect(html).toContain('Cosmic Connection.');
      expect(html).toContain('We&#x27;re not building another horoscope app');

      // Top floating nav & CTA
      expect(html).toContain('StarMatch');
      expect(html).toContain('Synastry');
      expect(html).toContain('Cross Stars');

      // Primary CTA with rainbow underglow
      expect(html).toContain('Join our World');
      expect(html).toContain('href="#synastry-studio"');
      expect(html).toContain('iridescent-pill-glow');

      // Halftone canvas and partner strip
      expect(html).toContain('<canvas');
      expect(html).toContain('DocuSign');
      expect(html).toContain('WIRED');
    });

    it('renders HalftoneHandsCanvas safely during SSR', () => {
      const html = renderToString(React.createElement(HalftoneHandsCanvas));
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain('<canvas');
    });

    it('renders WireframeCelestialSculpture safely during SSR', () => {
      const html = renderToString(React.createElement(WireframeCelestialSculpture));
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain('<canvas');
    });
  });
});
