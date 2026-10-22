import { RelationshipType, SynastryResult } from '@/lib/synastry/types';

export interface FullPairReport {
  overview: string;
  chemistry: string;
  communication: string;
  emotionalBond: string;
  conflictAndRepair: string;
  longTermPotential: string;
  growthTips: string;
  disclaimer: string;
}

export type PairReport = FullPairReport;

export interface ReportComposerOptions {
  llmProvider?: LLMReportProvider;
  toneVariant?: 'stark' | 'lyrical' | 'balanced';
  customDisclaimer?: string;
}

export type ReportSectionKey = keyof Omit<FullPairReport, 'disclaimer'>;

export interface LLMReportPromptContext {
  personAName: string;
  personBName: string;
  relationshipType: RelationshipType;
  overallScore: number;
  categories: SynastryResult['categories'];
  coStarBuckets: SynastryResult['coStarBuckets'];
  strongestAspect: SynastryResult['strongestAspect'];
  pressureAspects: Array<{ title: string; description: string }>;
  isQuickMode: boolean;
  lowConfidence: boolean;
}

export interface LLMReportProvider {
  generateFullReport?(context: LLMReportPromptContext): Promise<FullPairReport | Partial<FullPairReport>>;
  generateSection?(section: ReportSectionKey, context: LLMReportPromptContext): Promise<string>;
}

export interface DeepReportSection {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  astrologicalDomain: string;
  prose: string;
  narrative?: string;
  keyInsights: string[];
  strengths?: string[];
  frictionPoints?: string[];
  actionableGuidance?: string;
  aspects?: SynastryResult['aspects'];
}

export interface FullDeepReport {
  pair: {
    personA: SynastryResult['personA'];
    personB: SynastryResult['personB'];
    relationshipType: RelationshipType;
  };
  personA?: SynastryResult['personA'];
  personB?: SynastryResult['personB'];
  relationshipType?: RelationshipType;
  overallScore: number;
  sections: DeepReportSection[];
  strongestAspect: SynastryResult['strongestAspect'];
  aspects: SynastryResult['aspects'];
  oneSharpTruth?: OneSharpTruth;
  disclaimer: string;
  generatedAt: string;
}

export interface OneSharpTruth {
  aspectName: string;
  aspectType: string;
  orb: string;
  headline: string;
  quote: string;
  elaboration?: string;
}
