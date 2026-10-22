import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'fs';
import path from 'path';

import { PaywallModal } from '@/components/match/PaywallModal';
import { composeFullReport, getOneSharpTruth } from '@/lib/report/composer';
import { FullReportView } from '@/components/report/FullReportView';
import type { SynastryResult, SynastryAspect } from '@/lib/synastry/types';
import type { RelationshipType } from '@/lib/astro/types';

describe('Milestone 3 Empirical Challenger Stress Suite', () => {
  /* ==========================================================================
     PART 1: PaywallModal Empirical Verification
     ========================================================================== */
  describe('PaywallModal Stress & Constraint Tests', () => {
    it('PM-1: renders all 3 pricing tiers with exact upfront amounts ($6.99, $7.99, $39.99)', () => {
      const html = renderToStaticMarkup(
        React.createElement(PaywallModal, {
          isOpen: true,
          onClose: () => {},
          onCheckout: () => {},
          pairNames: { personA: 'Aura', personB: 'Orion' },
        })
      );

      // Verify the three tiers and upfront pricing
      expect(html).toContain('Single In-Depth Report');
      expect(html).toContain('$6.99');
      expect(html).toContain('Monthly Unlimited');
      expect(html).toContain('$7.99');
      expect(html).toContain('Annual VIP Pass');
      expect(html).toContain('$39.99');
    });

    it('PM-2: checkout submit button is strictly disabled by default (18+ gate unchecked)', () => {
      const html = renderToStaticMarkup(
        React.createElement(PaywallModal, {
          isOpen: true,
          onClose: () => {},
          onCheckout: () => {},
          pairNames: { personA: 'Aura', personB: 'Orion' },
          defaultPlan: 'single',
        })
      );

      // Checkbox is unchecked
      expect(html).toContain('id="age-verification-checkbox"');
      // Button must have disabled and aria-disabled="true"
      expect(html).toMatch(/<button[^>]*disabled=""[^>]*aria-disabled="true"/);
      // Button text matches selected plan
      expect(html).toContain('Unlock Full Report — $6.99');
    });

    it('PM-3: dynamically updates checkout CTA amount according to selected defaultPlan', () => {
      const htmlSingle = renderToStaticMarkup(
        React.createElement(PaywallModal, {
          isOpen: true,
          onClose: () => {},
          onCheckout: () => {},
          defaultPlan: 'single',
        })
      );
      expect(htmlSingle).toContain('Unlock Full Report — $6.99');

      const htmlMonthly = renderToStaticMarkup(
        React.createElement(PaywallModal, {
          isOpen: true,
          onClose: () => {},
          onCheckout: () => {},
          defaultPlan: 'monthly',
        })
      );
      expect(htmlMonthly).toContain('Unlock Full Report — $7.99 / mo');

      const htmlAnnual = renderToStaticMarkup(
        React.createElement(PaywallModal, {
          isOpen: true,
          onClose: () => {},
          onCheckout: () => {},
          defaultPlan: 'annual',
        })
      );
      expect(htmlAnnual).toContain('Unlock Full Report — $39.99 / yr');
    });

    it('PM-4: displays mandatory 14-day refund notice and entertainment disclaimer', () => {
      const html = renderToStaticMarkup(
        React.createElement(PaywallModal, {
          isOpen: true,
          onClose: () => {},
          onCheckout: () => {},
        })
      );

      // 14-day refund notice
      expect(html).toContain('14-day money-back guarantee');
      expect(html).toContain('2-click cancellation');
      // Entertainment disclaimer
      expect(html).toContain('For entertainment purposes only');
      expect(html).toContain('Not a substitute for licensed medical, psychological, financial, or legal counsel');
    });

    it('PM-5 [CHALLENGE]: checks whether PaywallModal contains an explicit hyperlink to Refund Policy', () => {
      const html = renderToStaticMarkup(
        React.createElement(PaywallModal, {
          isOpen: true,
          onClose: () => {},
          onCheckout: () => {},
        })
      );

      // PaywallModal text states "14-day money-back guarantee", but does it contain an actual <a href="..."> link?
      const hasRefundLink = /<a[^>]*href=["'][^"']*refund[^"']*["']/i.test(html);
      // Empirical verification: record whether a dedicated href link exists in the modal
      expect(hasRefundLink).toBe(false); // Finding: Notice is text-only, no clickable link inside PaywallModal
    });

    it('PM-6: handles null modal state cleanly when isOpen is false', () => {
      const html = renderToStaticMarkup(
        React.createElement(PaywallModal, {
          isOpen: false,
          onClose: () => {},
          onCheckout: () => {},
        })
      );
      expect(html).toBe('');
    });
  });

  /* ==========================================================================
     PART 2: Print Stylesheet & Report Presentation Empirical Verification
     ========================================================================== */
  describe('Print Stylesheet (app/globals.css) & Report Expansion', () => {
    const cssPath = path.resolve(process.cwd(), 'app/globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    it('PR-1: app/globals.css contains valid @media print rules with high-contrast inversion', () => {
      expect(cssContent).toContain('@media print');
      expect(cssContent).toMatch(/background-color:\s*#ffffff\s*!important/);
      expect(cssContent).toMatch(/color:\s*#000000\s*!important/);
    });

    it('PR-2: app/globals.css defines .print:hidden, .print:block, and page break utilities', () => {
      expect(cssContent).toMatch(/\.print\\:hidden\s*\{\s*display:\s*none\s*!important;\s*\}/);
      expect(cssContent).toMatch(/\.print\\:block\s*\{\s*display:\s*block\s*!important;\s*\}/);
      expect(cssContent).toMatch(/page-break-inside:\s*avoid/);
      expect(cssContent).toMatch(/break-inside:\s*avoid/);
    });

    it('PR-3: FullReportView attaches print:hidden to action bar header and chapter nav', () => {
      const mockSynastry = createMockSynastry({ overallScore: 84 });
      const mockReport = composeFullReport(mockSynastry);

      const html = renderToStaticMarkup(
        React.createElement(FullReportView, {
          synastry: mockSynastry,
          report: mockReport,
          matchId: 'test-match-123',
        })
      );

      // Header with "Share Report" and "Export / Print PDF" must be hidden in print
      expect(html).toMatch(/<header[^>]*print:hidden[^>]*>/);
      // Chapter jump navigation must be hidden in print
      expect(html).toMatch(/<nav[^>]*print:hidden[^>]*>/);
    });

    it('PR-4: FullReportView renders all 7 narrative sections without text truncation/clipping', () => {
      const mockSynastry = createMockSynastry({ overallScore: 84 });
      const mockReport = composeFullReport(mockSynastry);

      const html = renderToStaticMarkup(
        React.createElement(FullReportView, {
          synastry: mockSynastry,
          report: mockReport,
          matchId: 'test-match-123',
        })
      );

      // Verify all 7 section IDs are rendered
      for (let i = 1; i <= 7; i++) {
        expect(html).toContain(`id="section-${i}"`);
      }

      // Assert that none of the deep report sections have line-clamp or overflow-hidden
      const sectionMatches = html.match(/<section id="section-[1-7]"[^>]*>/g) || [];
      expect(sectionMatches.length).toBe(7);
      for (const secTag of sectionMatches) {
        expect(secTag).not.toContain('line-clamp');
        expect(secTag).not.toContain('overflow-hidden');
      }

      // Assert prose container does not have max-height or line-clamp
      expect(html).not.toMatch(/prose[^>]*line-clamp/);
      expect(html).not.toMatch(/prose[^>]*max-h-/);
    });

    it('PR-5 [CHALLENGE]: checks whether app/globals.css has universal selectors for header/button/dialog in @media print', () => {
      const printBlockMatch = cssContent.match(/@media print\s*\{([\s\S]*?)\}/);
      expect(printBlockMatch).not.toBeNull();
      const printBlock = printBlockMatch![1];

      // Check if generic tags like 'button', 'header', '[role="dialog"]', or '.fixed' are globally targeted
      const targetsButton = /\bbutton\b/.test(printBlock);
      const targetsDialog = /dialog|role=["']dialog["']/.test(printBlock);
      const targetsFixed = /\.fixed\b/.test(printBlock);

      // Empirical finding: app/globals.css relies on explicit utility classes (.print:hidden)
      // rather than element-level global print resets.
      expect(targetsButton).toBe(false);
      expect(targetsDialog).toBe(false);
      expect(targetsFixed).toBe(false);
    });
  });

  /* ==========================================================================
     PART 3: getOneSharpTruth & composeFullReport Across Extreme Scores & Edges
     ========================================================================== */
  describe('Report Composer & Sharp Truth Extreme Synastry Score Tests', () => {
    it('SCORE-EXTREME: handles extreme non-NaN scores (0, 1, 50, 99, 100, -15, 105.75) without undefined prose', () => {
      const validScores = [0, 1, 50, 99, 100, -15, 105.75];
      for (const score of validScores) {
        const synastry = createMockSynastry({ overallScore: score });
        const report = composeFullReport(synastry);

        expect(report.sections).toHaveLength(7);
        for (const sec of report.sections) {
          expect(sec.id).toBeTruthy();
          expect(sec.title).toBeTruthy();
          expect(sec.prose).toBeTruthy();
          expect(sec.prose.length).toBeGreaterThan(10);
          expect(sec.prose).not.toContain('undefined');
          expect(sec.prose).not.toContain('null');
          expect(sec.prose).not.toContain('NaN');
        }
      }
    });

    it('SCORE-EXTREME [CHALLENGE]: verifies vulnerability where NaN score propagates into prose text as literal "NaN%"', () => {
      // synastry.overallScore ?? 50 does not catch NaN because Number.isNaN(NaN) is true but NaN !== null && NaN !== undefined
      const synastry = createMockSynastry({ overallScore: NaN });
      const report = composeFullReport(synastry);

      expect(report.sections).toHaveLength(7);
      // Empirical verification: overview prose contains literal "NaN%" due to unshielded template interpolation
      expect(report.sections[0].prose).toContain('NaN%');
    });

    it('ASPECT-EDGE: handles empty aspect array (zero planetary aspects)', () => {
      const synastry = createMockSynastry({
        overallScore: 65,
        aspects: [],
        strongestAspect: undefined as unknown as SynastryAspect,
      });

      const truth = getOneSharpTruth(synastry);
      expect(truth.aspectName).toBe('Cosmic Equilibrium');
      expect(truth.headline).toContain('elemental equilibrium');
      expect(truth.quote).toContain('cumulative observation');
      expect(truth.orb).toBe('0.0° orb');

      const report = composeFullReport(synastry);
      expect(report.sections).toHaveLength(7);
      expect(report.oneSharpTruth?.aspectName).toBe('Cosmic Equilibrium');
      expect(report.aspects).toEqual([]);
    });

    it('ASPECT-EDGE: handles strongestAspect with description="None"', () => {
      const synastry = createMockSynastry({
        overallScore: 50,
        strongestAspect: {
          planetA: 'Sun',
          planetB: 'Moon',
          type: 'conjunction',
          angle: 0,
          orb: 0,
          weight: 0,
          description: 'None',
        },
      });

      const truth = getOneSharpTruth(synastry);
      expect(truth.aspectName).toBe('Cosmic Equilibrium');
      expect(truth.quote).toBeTruthy();
    });

    it('ASPECT-EDGE: handles extreme orb values (0.0° exact conjunction vs 9.9° loose)', () => {
      const exactAspect: SynastryAspect = {
        planetA: 'Venus',
        planetB: 'Mars',
        type: 'conjunction',
        angle: 0,
        orb: 0.0,
        weight: 15,
        description: 'Venus Conjunction Mars generates raw physical magnetism.',
      };
      const exactSynastry = createMockSynastry({
        overallScore: 92,
        aspects: [exactAspect],
        strongestAspect: exactAspect,
      });
      const exactTruth = getOneSharpTruth(exactSynastry);
      expect(exactTruth.orb).toBe('0.0° orb');
      expect(exactTruth.aspectName).toBe('Venus CONJUNCTION Mars');

      const looseAspect: SynastryAspect = {
        planetA: 'Saturn',
        planetB: 'Mercury',
        type: 'square',
        angle: 90,
        orb: 9.88,
        weight: 3,
        description: 'Saturn Square Mercury tests verbal patience.',
      };
      const looseSynastry = createMockSynastry({
        overallScore: 45,
        aspects: [looseAspect],
        strongestAspect: looseAspect,
      });
      const looseTruth = getOneSharpTruth(looseSynastry);
      expect(looseTruth.orb).toBe('9.9° orb');
      expect(looseTruth.aspectName).toBe('Saturn SQUARE Mercury');
    });

    it('BOUND-EDGE: handles undefined categories and coStarBuckets with defensive fallbacks', () => {
      const barebonesSynastry = {
        personA: { name: 'A' },
        personB: { name: 'B' },
        relationshipType: 'crush' as RelationshipType,
        overallScore: 50,
        categories: undefined as unknown as SynastryResult['categories'],
        coStarBuckets: undefined as unknown as SynastryResult['coStarBuckets'],
        aspects: [],
        strongestAspect: undefined as unknown as SynastryAspect,
        transits: { power: [], pressure: [] },
        dailyDoDont: { doAction: 'Listen', dontAction: 'Overthink', headline: 'Patience' },
        isQuickMode: false,
        lowConfidence: false,
      } as unknown as SynastryResult;

      const report = composeFullReport(barebonesSynastry);
      expect(report.sections).toHaveLength(7);
      for (const sec of report.sections) {
        expect(sec.prose).toBeTruthy();
        for (const insight of sec.keyInsights) {
          expect(insight).not.toContain('undefined');
          expect(insight).not.toContain('NaN');
        }
      }
    });

    it('CONFIDENCE-EDGE: respects lowConfidence flag and annotates angular house dynamic in Section 1', () => {
      const lowConfSynastry = createMockSynastry({
        overallScore: 70,
        lowConfidence: true,
      });
      const lowConfReport = composeFullReport(lowConfSynastry);
      const sec1Low = lowConfReport.sections[0];
      expect(sec1Low.keyInsights.some((k) => k.includes('omitted due to unknown birth time'))).toBe(true);

      const highConfSynastry = createMockSynastry({
        overallScore: 70,
        lowConfidence: false,
      });
      const highConfReport = composeFullReport(highConfSynastry);
      const sec1High = highConfReport.sections[0];
      expect(sec1High.keyInsights.some((k) => k.includes('angular house dynamics active'))).toBe(true);
    });

    it('RELATIONSHIP-TYPES: adapts across all 6 relationship types without distortion', () => {
      const types: RelationshipType[] = ['romantic', 'crush', 'ex', 'friend', 'family', 'coworker'];
      for (const relType of types) {
        const synastry = createMockSynastry({
          overallScore: 77,
          relationshipType: relType,
        });
        const report = composeFullReport(synastry);
        expect(report.relationshipType).toBe(relType);
        expect(report.sections[6].keyInsights[0]).toContain(relType);
      }
    });
  });
});

/* Helper to build flexible mock synastry */
function createMockSynastry(overrides: Partial<SynastryResult> = {}): SynastryResult {
  const defaultAspect: SynastryAspect = {
    planetA: 'Sun',
    planetB: 'Moon',
    type: 'trine',
    angle: 120,
    orb: 1.2,
    weight: 12,
    description: 'Sun Trine Moon creates intuitive emotional harmony and mutual understanding.',
  };

  return {
    personA: { name: 'Aura', birthDate: '1995-03-21', zodiacSign: 'Aries' },
    personB: { name: 'Orion', birthDate: '1993-07-25', zodiacSign: 'Leo' },
    relationshipType: 'romantic',
    overallScore: 82,
    categories: {
      chemistry: 88,
      communication: 79,
      emotionalBond: 85,
      conflictStyle: 70,
      longTermPotential: 86,
    },
    coStarBuckets: {
      basicIdentities: 85,
      howYouLove: 88,
      sexAndAggression: 80,
      moodsAndEmotions: 82,
      philosophy: 84,
      responsibility: 76,
      imagination: 80,
    },
    aspects: [defaultAspect],
    strongestAspect: defaultAspect,
    transits: {
      power: [{ title: 'Sun Sextile Jupiter', description: 'Expansive mutual optimism' }],
      pressure: [{ title: 'Mars Square Saturn', description: 'Patience required around timing' }],
    },
    dailyDoDont: {
      doAction: 'Acknowledge their creative autonomy directly.',
      dontAction: 'Assume silence means rejection.',
      headline: 'Vocal affirmations break static tension.',
    },
    isQuickMode: false,
    lowConfidence: false,
    ...overrides,
  };
}
