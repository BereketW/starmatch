import { describe, it, expect } from 'vitest';
import { generatePairReport, generatePairReportWithLLM } from '@/lib/report';
import { SynastryResult } from '@/lib/synastry/types';
import { sanitizeReportContent } from '@/lib/safety';

describe('Report Prose Composer (Feature 8)', () => {
  const sampleSynastry: SynastryResult = {
    personA: { birthDate: '1990-05-15', name: 'Alex', zodiacSign: 'Taurus' },
    personB: { birthDate: '1992-08-20', name: 'Jordan', zodiacSign: 'Leo' },
    relationshipType: 'romantic',
    overallScore: 78,
    categories: {
      chemistry: 85,
      communication: 72,
      emotionalBond: 80,
      conflictStyle: 65,
      longTermPotential: 82,
    },
    coStarBuckets: {
      basicIdentities: 80,
      howYouLove: 85,
      sexAndAggression: 75,
      moodsAndEmotions: 70,
      philosophy: 80,
      responsibility: 75,
      imagination: 82,
    },
    aspects: [
      {
        planetA: 'Sun',
        planetB: 'Mars',
        type: 'trine',
        angle: 120,
        orb: 1.5,
        weight: 12,
        description: 'Sun Trine Mars stimulates mutual vitality and passionate momentum.',
      },
      {
        planetA: 'Mercury',
        planetB: 'Venus',
        type: 'sextile',
        angle: 60,
        orb: 2.1,
        weight: 10,
        description: 'Mercury Sextile Venus promotes gracious conversational harmony.',
      },
    ],
    strongestAspect: {
      planetA: 'Sun',
      planetB: 'Mars',
      type: 'trine',
      angle: 120,
      orb: 1.5,
      weight: 12,
      description: 'Sun Trine Mars',
    },
    transits: {
      power: [{ title: 'Trine Support', description: 'Trine support across career sectors' }],
      pressure: [{
        title: 'Saturn Square Moon',
        description: 'Testing emotional restraint and vulnerability defenses.',
      }],
    },
    dailyDoDont: {
      doAction: 'Listen with open curiosity',
      dontAction: 'Assume defensive posture',
      headline: 'Embrace vulnerable dialogue today',
    },
    isQuickMode: false,
    lowConfidence: false,
  };

  it('F8-1: returns all 8 required report properties with substantial text', () => {
    const report = generatePairReport(sampleSynastry);

    expect(report).toBeDefined();
    expect(typeof report.overview).toBe('string');
    expect(typeof report.chemistry).toBe('string');
    expect(typeof report.communication).toBe('string');
    expect(typeof report.emotionalBond).toBe('string');
    expect(typeof report.conflictAndRepair).toBe('string');
    expect(typeof report.longTermPotential).toBe('string');
    expect(typeof report.growthTips).toBe('string');
    expect(typeof report.disclaimer).toBe('string');

    // Section length bounds (> 20 chars for all sections)
    expect(report.overview.length).toBeGreaterThan(100);
    expect(report.chemistry.length).toBeGreaterThan(20);
    expect(report.communication.length).toBeGreaterThan(20);
    expect(report.emotionalBond.length).toBeGreaterThan(20);
    expect(report.conflictAndRepair.length).toBeGreaterThan(20);
    expect(report.longTermPotential.length).toBeGreaterThan(20);
    expect(report.growthTips.length).toBeGreaterThan(20);
  });

  it('F8-2: incorporates partner names into report text', () => {
    const report = generatePairReport(sampleSynastry);

    expect(report.overview).toContain('Alex');
    expect(report.overview).toContain('Jordan');
  });

  it('F8-3: attaches mandatory entertainment disclaimer matching /entertainment/i', () => {
    const report = generatePairReport(sampleSynastry);
    expect(report.disclaimer).toMatch(/entertainment/i);
    expect(report.disclaimer).toContain('Not a substitute for professional');
  });

  it('F8-4: growthTips includes actionable growth keyword', () => {
    const report = generatePairReport(sampleSynastry);
    expect(report.growthTips.toLowerCase()).toContain('growth');
  });

  it('F8-5: produces deterministic outputs for identical inputs', () => {
    const report1 = generatePairReport(sampleSynastry);
    const report2 = generatePairReport(sampleSynastry);

    expect(report1.overview).toBe(report2.overview);
    expect(report1.chemistry).toBe(report2.chemistry);
    expect(report1.communication).toBe(report2.communication);
    expect(report1.emotionalBond).toBe(report2.emotionalBond);
    expect(report1.conflictAndRepair).toBe(report2.conflictAndRepair);
    expect(report1.longTermPotential).toBe(report2.longTermPotential);
    expect(report1.growthTips).toBe(report2.growthTips);
  });

  it('F8-6: distinct pairs produce non-identical report text', () => {
    const altSynastry: SynastryResult = {
      ...sampleSynastry,
      personA: { birthDate: '1985-02-10', name: 'Chris', zodiacSign: 'Aquarius' },
      personB: { birthDate: '1987-11-04', name: 'Taylor', zodiacSign: 'Scorpio' },
      overallScore: 42,
      categories: {
        chemistry: 40,
        communication: 45,
        emotionalBond: 38,
        conflictStyle: 42,
        longTermPotential: 44,
      },
    };

    const report1 = generatePairReport(sampleSynastry);
    const report2 = generatePairReport(altSynastry);

    expect(report1.overview).not.toBe(report2.overview);
    expect(report1.chemistry).not.toBe(report2.chemistry);
  });

  it('F8-7: gracefully falls back to Person A and Person B when names are omitted', () => {
    const namelessSynastry: SynastryResult = {
      ...sampleSynastry,
      personA: { birthDate: '1990-05-15' },
      personB: { birthDate: '1992-08-20' },
    };

    const report = generatePairReport(namelessSynastry);
    expect(report.overview).toMatch(/Person A/);
    expect(report.overview).toMatch(/Person B/);
  });

  it('F8-8: handles long names and special characters without crash or corrupt interpolation', () => {
    const longSpecialSynastry: SynastryResult = {
      ...sampleSynastry,
      personA: { birthDate: '1990-05-15', name: 'Dr. Jean-Luc O\'Connor & Sons IV' },
      personB: { birthDate: '1992-08-20', name: 'Jane "Smiley" <Smith>' },
    };

    const report = generatePairReport(longSpecialSynastry);
    expect(report.overview).toContain('Dr. Jean-Luc O\'Connor & Sons IV');
    expect(report.overview).toContain('Jane "Smiley" <Smith>');
  });

  it('F8-9: handles empty aspects gracefully with valid prose', () => {
    const emptyAspectsSynastry = {
      ...sampleSynastry,
      aspects: [],
      strongestAspect: undefined as unknown as SynastryResult['strongestAspect'],
    };

    const report = generatePairReport(emptyAspectsSynastry);
    expect(report.overview.length).toBeGreaterThan(50);
    expect(report.conflictAndRepair.length).toBeGreaterThan(20);
  });

  it('F8-10: includes quick-mode precision banner when birth time is omitted', () => {
    const quickSynastry: SynastryResult = {
      ...sampleSynastry,
      isQuickMode: true,
    };

    const report = generatePairReport(quickSynastry);
    expect(report.overview).toContain('Note on Astrological Resolution');
    expect(report.overview).toContain('rising signs');
  });

  it('F8-11: contextualizes prose for coworker and friendship relationship types', () => {
    const coworkerSynastry: SynastryResult = {
      ...sampleSynastry,
      relationshipType: 'coworker',
    };
    const friendSynastry: SynastryResult = {
      ...sampleSynastry,
      relationshipType: 'friendship',
    };

    const coworkerReport = generatePairReport(coworkerSynastry);
    const friendReport = generatePairReport(friendSynastry);

    expect(coworkerReport.chemistry).toContain('professional');
    expect(coworkerReport.growthTips.toLowerCase()).toContain('growth');

    expect(friendReport.chemistry).toContain('friendship');
    expect(friendReport.growthTips.toLowerCase()).toContain('growth');
  });

  it('F8-12: guarantees all generated sections pass safety sanitization with 0 violations', () => {
    const report = generatePairReport(sampleSynastry);

    for (const [section, text] of Object.entries(report)) {
      if (section === 'disclaimer') continue;
      const safetyCheck = sanitizeReportContent(text);
      expect(safetyCheck.isSafe).toBe(true);
      expect(safetyCheck.violations.length).toBe(0);
      expect(text).not.toContain('[REDACTED');
    }
  });

  it('F8-13: supports custom disclaimer override via options', () => {
    const customDisclaimer = 'Custom entertainment and counseling disclaimer test string.';
    const report = generatePairReport(sampleSynastry, { customDisclaimer });

    expect(report.disclaimer).toBe(customDisclaimer);
  });

  it('F8-14: generatePairReportWithLLM uses mock provider and falls back safely on error', async () => {
    const mockProvider = {
      generateFullReport: async () => ({
        overview: 'Custom LLM generated overview for test.',
        chemistry: 'Custom LLM chemistry text.',
        communication: 'Custom LLM communication text.',
        emotionalBond: 'Custom LLM emotional bond text.',
        conflictAndRepair: 'Custom LLM conflict text.',
        longTermPotential: 'Custom LLM long-term text.',
        growthTips: 'Custom LLM growth tips text.',
      }),
    };

    const reportFromLLM = await generatePairReportWithLLM(sampleSynastry, mockProvider);
    expect(reportFromLLM.overview).toBe('Custom LLM generated overview for test.');
    expect(reportFromLLM.disclaimer).toMatch(/entertainment/i);

    // Failing provider fallback
    const failingProvider = {
      generateFullReport: async () => {
        throw new Error('LLM Gateway Failure');
      },
    };

    const reportFallback = await generatePairReportWithLLM(sampleSynastry, failingProvider);
    expect(reportFallback.overview).toContain('Alex');
    expect(reportFallback.disclaimer).toMatch(/entertainment/i);
  });
});
