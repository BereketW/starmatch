export interface SafetyCheckResult {
  isSafe: boolean;
  violations: string[];
  sanitizedText: string;
}

export interface ProhibitedRule {
  category: string;
  regex: RegExp;
}

export const REDACTION_TOKEN = '[REDACTED: Policy violation]';

export const UNIVERSAL_ENTERTAINMENT_DISCLAIMER =
  'For entertainment purposes only. Not a substitute for professional relationship, legal, financial, or medical guidance.';

export const PROHIBITED_PATTERNS: ProhibitedRule[] = [
  {
    category: 'medical',
    regex: /\b(diagnos(e|is|ed|ing)|cancer\s+(disease|treatment|patient|cell|diagnosis|stage)|cure\s+(for|your|any|disease)|medical\s+(advice|diagnosis|treatment|cure)|prescri(be|ption|bed))\b/gi,
  },
  {
    category: 'pregnancy',
    regex: /\b(pregnant|pregnancy|fertility|miscarriage|conceive\s+in|baby's\s+gender|gender\s+of\s+(the|your)\s+baby)\b/gi,
  },
  {
    category: 'death',
    regex: /\b(death|will\s+die|going\s+to\s+die|fatal|terminal\s+illness|lifespan|suicide)\b/gi,
  },
  {
    category: 'financial',
    regex: /\b(lottery|invest\s+in|guaranteed\s+profit|buy\s+stock|buy\s+crypto|financial\s+windfall|gambl(e|ing))\b/gi,
  },
  {
    category: 'legal',
    regex: /\b(win\s+the\s+lawsuit|lose\s+the\s+lawsuit|guilty\s+verdict|legal\s+ruling|sue\s+them|take\s+them\s+to\s+court)\b/gi,
  },
  {
    category: 'manipulative_command',
    regex: /\b(you\s+must\s+(divorce|leave\s+them|break\s+up|cut\s+contact\s+now|stay\s+with\s+them)|cut\s+contact\s+now)\b/gi,
  },
];

/**
 * Sanitizes report content by redacting prohibited categories and returning structured violation tags.
 */
export function sanitizeReportContent(text: string): SafetyCheckResult {
  if (!text || text.trim().length === 0) {
    return {
      isSafe: true,
      violations: [],
      sanitizedText: text ?? '',
    };
  }

  const detectedCategories: string[] = [];
  let sanitized = text;

  for (const { category, regex } of PROHIBITED_PATTERNS) {
    regex.lastIndex = 0;
    if (regex.test(sanitized)) {
      if (!detectedCategories.includes(category)) {
        detectedCategories.push(category);
      }
      regex.lastIndex = 0;
      sanitized = sanitized.replace(regex, REDACTION_TOKEN);
    }
  }

  return {
    isSafe: detectedCategories.length === 0,
    violations: detectedCategories,
    sanitizedText: sanitized,
  };
}

/**
 * Validates that user has confirmed they are 18+ before checkout.
 */
export function validateAgeConfirmation(ageConfirmed: boolean): boolean {
  if (!ageConfirmed) {
    throw new Error('User must confirm they are 18+');
  }
  return true;
}

/**
 * Returns the canonical universal entertainment disclaimer.
 */
export function getEntertainmentDisclaimer(): string {
  return UNIVERSAL_ENTERTAINMENT_DISCLAIMER;
}
