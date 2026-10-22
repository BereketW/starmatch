import { SynastryResult } from '@/lib/synastry/types';

export type ErosCategory =
  | 'intimacy'
  | 'conflict_repair'
  | 'how_to_argue'
  | 'note_from_the_void';

export interface ErosCard {
  id: string;
  category: ErosCategory;
  categoryLabel: string;
  title: string;
  prompt: string;
  planetaryDriver: string;
  actionableProtocol: string;
  shadowWarning?: string;
}

const CATEGORY_LABELS: Record<ErosCategory, string> = {
  intimacy: 'Intimacy & Desire',
  conflict_repair: 'Conflict & Repair',
  how_to_argue: 'How to Argue With Them',
  note_from_the_void: 'Note From the Void',
};

/**
 * Deterministically generates an Eros relationship deck customized to the pair's synastry.
 */
export function generateErosDeck(synastry: SynastryResult): ErosCard[] {
  const cards: ErosCard[] = [];
  const nameA = synastry.personA?.name?.trim() || synastry.personA?.zodiacSign || 'You';
  const nameB = synastry.personB?.name?.trim() || synastry.personB?.zodiacSign || 'Them';
  const score = synastry.overallScore ?? 50;
  const conflictScore = synastry.categories?.conflictStyle ?? 50;
  const chemistryScore = synastry.categories?.chemistry ?? 50;

  // 1. Intimacy Card: Somatic & Vulnerability
  cards.push({
    id: 'eros_intimacy_1',
    category: 'intimacy',
    categoryLabel: CATEGORY_LABELS.intimacy,
    title: 'Somatic Vulnerability Drop',
    prompt: `Tonight, ask ${nameB} what part of themselves they protect most fiercely around you.`,
    planetaryDriver: 'Venus × Moon Synastry Harmonic',
    actionableProtocol: 'Listen without offering reassurance, rationalization, or solutions for a full three minutes. Simply nod and hold somatic stillness.',
    shadowWarning: 'Defensiveness disguised as "explaining yourself" will instantly collapse the safety container.',
  });

  // 2. Intimacy Card: Kinetic / Erotic Tension
  cards.push({
    id: 'eros_intimacy_2',
    category: 'intimacy',
    categoryLabel: CATEGORY_LABELS.intimacy,
    title: 'Kinetic Re-Centering',
    prompt: `Acknowledge the physical pull between you without immediately converting it into distraction.`,
    planetaryDriver: chemistryScore > 70 ? 'High-Tension Mars-Venus Resonance' : 'Subtle Venusian Alignment',
    actionableProtocol: 'Maintain unbroken eye contact for 60 seconds before speaking about anything logistical.',
    shadowWarning: 'Treating desire solely as a game of validation blinds you to genuine emotional reciprocity.',
  });

  // 3. Conflict Repair: De-escalation Protocol
  cards.push({
    id: 'eros_repair_1',
    category: 'conflict_repair',
    categoryLabel: CATEGORY_LABELS.conflict_repair,
    title: 'The 20% Volume Rule',
    prompt: `When friction arises between ${nameA} and ${nameB}, name the physical sensation in your chest before debating the facts.`,
    planetaryDriver: conflictScore < 60 ? 'Saturnian Pressure Dynamic' : 'Balanced Mars-Mercury Cadence',
    actionableProtocol: 'Say out loud: "I want to resolve this with you, but my nervous system is spiked. Give me 10 minutes to breathe before we continue."',
    shadowWarning: 'Silence used as a punishment is violence; silence requested for regulation is medicine.',
  });

  // 4. Conflict Repair: Repair Attempt
  cards.push({
    id: 'eros_repair_2',
    category: 'conflict_repair',
    categoryLabel: CATEGORY_LABELS.conflict_repair,
    title: 'The Unilateral Olive Branch',
    prompt: `Identify the 5% truth in ${nameB}'s complaint about you, and validate that 5% unconditionally.`,
    planetaryDriver: 'Mercury Trine / Square Axis',
    actionableProtocol: 'Drop the urge to point out where they were also wrong. Conceding one point is not losing the dynamic.',
    shadowWarning: 'Do not qualify your apology with "but you made me feel..."',
  });

  // 5. How to Argue: Tactical Field Guide 1
  cards.push({
    id: 'eros_argue_1',
    category: 'how_to_argue',
    categoryLabel: CATEGORY_LABELS.how_to_argue,
    title: `How to Argue with ${nameB}: Brevity Protocol`,
    prompt: `Do not corner ${nameB} with an avalanche of chronological evidence or rhetorical questions.`,
    planetaryDriver: 'Mercury-Mars Tactical Interface',
    actionableProtocol: 'Formulate your boundary in exactly one sentence: "When X occurs, I feel Y, and I need Z going forward."',
    shadowWarning: 'If they shut down, demanding immediate responses forces them into survival mode.',
  });

  // 6. How to Argue: Tactical Field Guide 2
  cards.push({
    id: 'eros_argue_2',
    category: 'how_to_argue',
    categoryLabel: CATEGORY_LABELS.how_to_argue,
    title: `How to Argue with ${nameB}: Ego Detonation`,
    prompt: `Never make public or sarcastic jokes about ${nameB}'s insecurities during a dispute.`,
    planetaryDriver: 'Solar-Saturnian Pride Matrix',
    actionableProtocol: 'Address issues in private with zero sarcasm. Dignity preservation is the fastest path to compromise.',
    shadowWarning: 'Humiliation leaves permanent scar tissue that love cannot easily dissolve.',
  });

  // 7. Note From the Void 1 (Editorial Stark / Co-Star style)
  cards.push({
    id: 'eros_void_1',
    category: 'note_from_the_void',
    categoryLabel: CATEGORY_LABELS.note_from_the_void,
    title: 'Void Transmission #041',
    prompt: `You think you want them to read your mind, but you are terrified of what they would find if they actually could.`,
    planetaryDriver: 'Transpersonal Neptune Opposition',
    actionableProtocol: 'Say the one thing you have edited out of three consecutive conversations.',
  });

  // 8. Note From the Void 2
  cards.push({
    id: 'eros_void_2',
    category: 'note_from_the_void',
    categoryLabel: CATEGORY_LABELS.note_from_the_void,
    title: 'Void Transmission #089',
    prompt: `Chemistry is not an endorsement from destiny. Sometimes two planets collide solely to shatter what was already brittle.`,
    planetaryDriver: `Pluto-Venus Orbital Crucible (${score}% Overall)`,
    actionableProtocol: 'Observe whether this connection makes you braver or merely more anxious.',
  });

  // 9. Note From the Void 3
  cards.push({
    id: 'eros_void_3',
    category: 'note_from_the_void',
    categoryLabel: CATEGORY_LABELS.note_from_the_void,
    title: 'Void Transmission #104',
    prompt: `Stop testing their loyalty with silence. The void will always reflect your own detachment right back at you.`,
    planetaryDriver: 'Saturnian Threshold Transit',
    actionableProtocol: 'Reach out first today with zero pretext or expectation of immediate tribute.',
  });

  return cards;
}
