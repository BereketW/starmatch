import { describe, it, expect } from 'vitest';
import {
  sanitizeReportContent,
  validateAgeConfirmation,
  getEntertainmentDisclaimer,
  UNIVERSAL_ENTERTAINMENT_DISCLAIMER,
  REDACTION_TOKEN,
} from '@/lib/safety/filter';

describe('Safety & Compliance Filter (lib/safety/filter.ts)', () => {
  describe('Category Enforcement (Negative Cases)', () => {
    it('detects and redacts medical diagnosis and prescriptions', () => {
      const input = 'Your partner has a medical diagnosis and requires a prescription.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(false);
      expect(res.violations).toContain('medical');
      expect(res.sanitizedText).toContain(REDACTION_TOKEN);
    });

    it('detects and redacts clinical cancer disease claims', () => {
      const input = 'This transit indicates cancer disease progression and medical treatment.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(false);
      expect(res.violations).toContain('medical');
      expect(res.sanitizedText).toContain(REDACTION_TOKEN);
    });

    it('detects and redacts pregnancy and fertility predictions', () => {
      const input = 'The stars show you will become pregnant next month with a boy.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(false);
      expect(res.violations).toContain('pregnancy');
      expect(res.sanitizedText).toContain(REDACTION_TOKEN);
    });

    it('detects and redacts death and fatal accident claims', () => {
      const input = 'A fatal accident or death is written in their transit.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(false);
      expect(res.violations).toContain('death');
      expect(res.sanitizedText).toContain(REDACTION_TOKEN);
    });

    it('detects and redacts financial investment and lottery claims', () => {
      const input = 'You will win the lottery and should invest in this guaranteed profit stock.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(false);
      expect(res.violations).toContain('financial');
      expect(res.sanitizedText).toContain(REDACTION_TOKEN);
    });

    it('detects and redacts legal outcome predictions and lawsuit advice', () => {
      const input = 'You will win the lawsuit against them so you should sue them now.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(false);
      expect(res.violations).toContain('legal');
      expect(res.sanitizedText).toContain(REDACTION_TOKEN);
    });

    it('detects and redacts manipulative commands', () => {
      const input = 'The alignment is toxic, you must divorce and cut contact now.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(false);
      expect(res.violations).toContain('manipulative_command');
      expect(res.sanitizedText).toContain(REDACTION_TOKEN);
    });
  });

  describe('False-Positive Resistance (Positive Cases)', () => {
    it('does NOT falsely flag the astrological sign Cancer as a medical violation', () => {
      const input = 'Your Moon in Cancer brings emotional depth and sensitive awareness.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(true);
      expect(res.violations).toHaveLength(0);
      expect(res.sanitizedText).toBe(input);
    });

    it('does NOT falsely flag astrological transit terminology like Mercury retrograde', () => {
      const input = 'Mercury retrograde may cause communication delays.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(true);
      expect(res.violations).toHaveLength(0);
      expect(res.sanitizedText).toBe(input);
    });

    it('does NOT falsely flag creative fertility metaphors', () => {
      const input = 'This connection sparks a fertile imagination and mutual artistic inspiration.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(true);
      expect(res.violations).toHaveLength(0);
      expect(res.sanitizedText).toBe(input);
    });

    it('does NOT falsely flag benign relationship coaching statements', () => {
      const input = 'Consider naming your boundaries clearly during difficult conversations.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(true);
      expect(res.violations).toHaveLength(0);
      expect(res.sanitizedText).toBe(input);
    });
  });

  describe('Adversarial & Multi-Violation Cases', () => {
    it('sanitizes multiple distinct violations in a single paragraph', () => {
      const input = 'You will win the lottery and cure your cancer diagnosis.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(false);
      expect(res.violations).toContain('financial');
      expect(res.violations).toContain('medical');
      expect(res.sanitizedText).not.toContain('win the lottery');
      expect(res.sanitizedText).not.toContain('cancer diagnosis');
      expect(res.sanitizedText).toContain(REDACTION_TOKEN);
    });

    it('handles uppercase and mixed-case bypass attempts', () => {
      const input = 'SHE WILL GET PREGNANT AND GET A DIAGNOSIS.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(false);
      expect(res.violations).toContain('pregnancy');
      expect(res.violations).toContain('medical');
      expect(res.sanitizedText).toContain(REDACTION_TOKEN);
    });

    it('handles empty or whitespace-only input safely', () => {
      const resEmpty = sanitizeReportContent('');
      expect(resEmpty.isSafe).toBe(true);
      expect(resEmpty.violations).toHaveLength(0);
      expect(resEmpty.sanitizedText).toBe('');

      const resWhitespace = sanitizeReportContent('   ');
      expect(resWhitespace.isSafe).toBe(true);
      expect(resWhitespace.violations).toHaveLength(0);
      expect(resWhitespace.sanitizedText.trim()).toBe('');
    });
  });

  describe('Universal Disclaimer & 18+ Age Verification', () => {
    it('returns the canonical entertainment disclaimer containing required keyword', () => {
      const disclaimer = getEntertainmentDisclaimer();
      expect(disclaimer).toMatch(/entertainment/i);
      expect(disclaimer).toBe(UNIVERSAL_ENTERTAINMENT_DISCLAIMER);
      expect(disclaimer).toContain('Not a substitute for professional');
    });

    it('validates 18+ age confirmation successfully when true', () => {
      expect(validateAgeConfirmation(true)).toBe(true);
    });

    it('throws error when 18+ age confirmation is false', () => {
      expect(() => validateAgeConfirmation(false)).toThrow('User must confirm they are 18+');
    });
  });
});
