import {
  BirthData,
  NatalChart,
  RelationshipType,
  SynastryResult,
  SafetyCheckResult,
} from './types';
import * as RefEngine from './reference-engine';

/**
 * Registry of available production modules for progressive verification.
 */
export const ModuleStatus = {
  ephemeris: false,
  synastry: false,
  safety: false,
  report: false,
  vault: false,
};

// Asynchronously attempt to probe production modules
let prodEphemeris: { computeNatalChart?: (b: BirthData) => Promise<NatalChart> | NatalChart } | null = null;
let prodSynastry: {
  computeSynastry?: (a: BirthData, b: BirthData, r?: RelationshipType) => Promise<SynastryResult> | SynastryResult;
  quickModeSynastry?: (a: string, b: string, r?: RelationshipType) => Promise<SynastryResult> | SynastryResult;
} | null = null;
let prodSafety: Record<string, unknown> | null = null;
let prodReport: Record<string, unknown> | null = null;
let prodVault: Record<string, unknown> | null = null;

export async function initProductionAdapters() {
  try {
    // Dynamic import to prevent build failure if file does not exist yet
    prodEphemeris = await import('@/lib/astro/ephemeris').catch(() => null);
    if (prodEphemeris) ModuleStatus.ephemeris = true;
  } catch {}

  try {
    prodSynastry = await import('@/lib/synastry/engine').catch(() => null);
    if (prodSynastry) ModuleStatus.synastry = true;
  } catch {}

  try {
    prodSafety = await import('@/lib/safety/filter').catch(() => null);
    if (prodSafety) ModuleStatus.safety = true;
  } catch {}

  try {
    prodReport = await import('@/lib/report/composer').catch(() => null);
    if (prodReport) ModuleStatus.report = true;
  } catch {}

  try {
    prodVault = await import('@/lib/vault/store').catch(() => null);
    if (prodVault) ModuleStatus.vault = true;
  } catch {}
}

/**
 * Adapter for computeNatalChart
 */
export async function computeNatalChart(birthData: BirthData): Promise<NatalChart> {
  if (prodEphemeris && typeof prodEphemeris.computeNatalChart === 'function') {
    return prodEphemeris.computeNatalChart(birthData);
  }
  return RefEngine.refComputeNatalChart(birthData);
}

/**
 * Adapter for computeSynastry
 */
export async function computeSynastry(
  personA: BirthData,
  personB: BirthData,
  relationshipType: RelationshipType = 'romantic'
): Promise<SynastryResult> {
  if (prodSynastry && typeof prodSynastry.computeSynastry === 'function') {
    return prodSynastry.computeSynastry(personA, personB, relationshipType);
  }
  return RefEngine.refComputeSynastry(personA, personB, relationshipType);
}

/**
 * Adapter for quickModeSynastry
 */
export async function quickModeSynastry(
  signA: string,
  signB: string,
  relationshipType: RelationshipType = 'romantic'
): Promise<SynastryResult> {
  if (prodSynastry && typeof prodSynastry.quickModeSynastry === 'function') {
    return prodSynastry.quickModeSynastry(signA, signB, relationshipType);
  }
  return RefEngine.refComputeQuickMode(signA, signB, relationshipType);
}

/**
 * Adapter for sanitizeReportContent
 */
export function sanitizeReportContent(text: string): SafetyCheckResult {
  if (prodSafety && typeof prodSafety.sanitizeReportContent === 'function') {
    return prodSafety.sanitizeReportContent(text);
  }
  return RefEngine.refSanitizeReportContent(text);
}

/**
 * Adapter for generatePairReport
 */
export function generatePairReport(synastry: SynastryResult): {
  overview: string;
  chemistry: string;
  communication: string;
  emotionalBond: string;
  conflictAndRepair: string;
  longTermPotential: string;
  growthTips: string;
  disclaimer: string;
} {
  if (prodReport && typeof prodReport.generatePairReport === 'function') {
    return prodReport.generatePairReport(synastry);
  }
  return RefEngine.refGeneratePairReport(synastry);
}
