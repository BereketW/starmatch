import { SynastryResult } from '@/lib/synastry/types';

/**
 * Stable 32-bit FNV-1a hash generator for deterministic prose selection.
 */
export function getSynastrySeed(synastry: SynastryResult): number {
  const seedString = [
    synastry.personA.name ?? '',
    synastry.personA.birthDate ?? synastry.personA.zodiacSign ?? '',
    synastry.personB.name ?? '',
    synastry.personB.birthDate ?? synastry.personB.zodiacSign ?? '',
    synastry.relationshipType,
    synastry.overallScore,
    (synastry.aspects ?? []).map(a => `${a.planetA}-${a.type}-${a.planetB}`).join(':')
  ].join('|');

  let hash = 0x811c9dc5;
  for (let i = 0; i < seedString.length; i++) {
    hash ^= seedString.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return Math.abs(hash >>> 0);
}

/**
 * Deterministically picks a variant from an array using an offset seed.
 */
export function pickVariant<T>(variants: T[], seed: number, salt: number = 0): T {
  if (!variants || variants.length === 0) {
    throw new Error('Cannot pick from empty variants array');
  }
  const index = Math.abs((seed + salt * 997) % variants.length);
  return variants[index];
}

export type ScoreTier = 'high' | 'mid' | 'low';

export function getScoreTier(score: number): ScoreTier {
  if (score >= 70) return 'high';
  if (score >= 45) return 'mid';
  return 'low';
}

export interface OverviewTemplates {
  high: string[];
  mid: string[];
  low: string[];
}

export const OVERVIEW_SYNTHESIS: OverviewTemplates = {
  high: [
    'The gravitational field between {nameA} and {nameB} registers an overall resonance of {score}%. This is not an accidental confluence; your core frequencies complement each other without flattening individual contours. Rather than dissolving into stagnant comfort, your bond acts as an amplifier: personal sovereignty is honored while mutual momentum accelerates shared vision.',
    'Overall compatibility between {nameA} and {nameB} reaches {score}%. A high-charge harmonic alignment where instincts sync with minimal rhetorical friction. You navigate mutual vulnerabilities with instinctive restraint, building an emotional architecture that withstands external chaos without demanding rigid conformity.',
    'At {score}% overall compatibility, {nameA} and {nameB} share a rare structural symmetry. The connection does not depend on performative intensity; it endures through effortless psychic comprehension. What one leaves unsaid is frequently anticipated and respected by the other.',
  ],
  mid: [
    'The dynamic between {nameA} and {nameB} registers an overall compatibility of {score}%. This connection represents dynamic, high-friction polarity where boundaries are continually negotiated and redefined. Rather than smooth agreement, your dynamic operates as a mirror: what remains unintegrated within yourself is immediately reflected in the presence of the other.',
    'Compatibility between {nameA} and {nameB} charts at {score}%. This is a negotiated alliance characterized by intellectual sparks and stubborn habits. When both parties drop the expectation of effortless harmony and embrace conscious translation, this bond produces profound psychological maturity.',
    'At {score}%, the bond between {nameA} and {nameB} balances magnetic draw against contrasting operating rhythms. You do not share an automatic consensus on all matters; every shared step forward requires deliberate intention rather than passive drift.',
  ],
  low: [
    'The synastry field between {nameA} and {nameB} registers at {score}%. This pairing represents two sovereign operating systems with fundamentally distinct constitutional codes. Mutual comprehension does not arrive pre-installed; it requires deliberate, patient bridge-building across divergent emotional landscapes.',
    'Overall compatibility registers at {score}%. Tension is the baseline environment here; assumptions that what works for {nameA} will work for {nameB} invariably produce friction. Longevity in this bond demands ruthless respect for radical difference and strict emotional boundary hygiene.',
    'At {score}%, {nameA} and {nameB} encounter a crucible dynamic. The connection is designed to illuminate ego defenses and stubborn reflexes rather than provide an easy emotional sanctuary. Growth here is demanding, unsentimental, and transformative.',
  ],
};

export const CHEMISTRY_TEMPLATES: Record<ScoreTier, string[]> = {
  high: [
    'Chemistry registers at {score}%. The kinetic resonance between you is immediate, visceral, and unmistakable. Planetary polarities generate an effortless cadence of mutual fascination, where physical tension or creative momentum flows without awkward hesitation. Your instinctive impulses align with quiet confidence.',
    'Visceral chemistry charts at {score}%. The magnetic pull between your placements operates beneath spoken language. There is an unforced somatic ease when occupying the same room; energy transfers smoothly and stimulates creative vitality without tipping into possessive anxiety.',
    'With a chemistry score of {score}%, attraction behaves like an open current. You draw vitality from shared presence, finding intuitive rhythm in shared glances and unspoken agreements. Mutual desire feels regenerative rather than draining.',
  ],
  mid: [
    'Chemistry scores {score}%. Magnetic attraction is intermittent, volatile, and intense. High passion alternates with sudden cooling cycles, demanding that both partners distinguish between genuine physical intimacy and adrenaline born of unresolved relational suspense.',
    'Chemistry registers at {score}%. The polarity carries genuine electric tension, but friction easily builds if expectations are left unspoken. You are deeply intrigued by what you cannot fully predict in each other, though this unpredictability can occasionally tilt into defensive posturing.',
    'At {score}%, chemistry functions like an erratic spark. There is sufficient heat to ignite genuine interest, but sustaining an even flame requires cultivating conscious attraction beyond initial curiosity.',
  ],
  low: [
    'Chemistry registers at {score}%. Visceral attraction does not ignite spontaneously; it requires deliberate mutual curiosity and emotional context to awaken. Physical or collaborative dynamics function best when grounded in intellectual respect rather than raw impulse.',
    'Chemistry registers at {score}%. Magnetic resonance is subtle and easily disrupted by logistical stress. Attempting to force an intense spark will only trigger defensive withdrawal; allow warmth to build through shared respect and patience.',
    'At {score}%, physical and aesthetic chemistry moves at an uneven pace. You express enthusiasm through contrasting dialects, which can create awkward pauses unless both learn to interpret subtle affection.',
  ],
};

export const COMMUNICATION_TEMPLATES: Record<ScoreTier, string[]> = {
  high: [
    'Communication scores {score}%. Your cognitive gears mesh with fluid velocity. Mercurial currents allow ideas to be passed, dissected, and expanded without defensive static. You finish each other’s conceptual frameworks while maintaining respect for individual viewpoints.',
    'Intellectual alignment registers at {score}%. Verbal interplay is nimble and intellectually stimulating. Conversations navigate complex emotional territory without getting bogged down in pedantic misunderstandings or retroactive scorekeeping.',
    'Communication reaches {score}%. Shared mental pacing creates an intuitive dialogue. You naturally clarify intentions before leaping to hostile conclusions, allowing difficult topics to be unpacked with clinical clarity and warmth.',
  ],
  mid: [
    'Communication scores {score}%. Intellectual gears engage with sharpness, but internal processing clocks operate on differing cadences. While one processes observations through rapid verbal improvisation, the other requires silent gestation before delivering a considered verdict. When talks stall, bridge the gap with explicit pauses.',
    'Communication registers at {score}%. You speak complementary dialects, but subtext frequently gets tangled in translation. Tone and timing are paramount: discussions initiated late at night or under logistical duress frequently turn into defensive debates.',
    'With communication at {score}%, you share intellectual curiosity alongside sharp conversational friction. Mutual respect exists, but each partner must resist the urge to correct the other’s phrasing during vulnerable exchanges.',
  ],
  low: [
    'Communication scores {score}%. Mental frequencies operate on starkly divergent wavelengths. What one considers straightforward candor, the other perceives as unnecessary bluntness or evasive vagueness. Establishing concrete conversational protocols is essential.',
    'Intellectual connection registers at {score}%. Spontaneous debates frequently escalate into philosophical standoffs. Direct speech must be stripped of sarcasm, and active listening must replace internal rehearsal of counterarguments.',
    'At {score}%, dialogue requires deliberate translation. You do not share instinctive verbal reflexes; misunderstandings arise quickly unless you explicitly ask for clarification before reacting.',
  ],
};

export const EMOTIONAL_BOND_TEMPLATES: Record<ScoreTier, string[]> = {
  high: [
    'Emotional bond registers at {score}%. Gut-level security is supported by genuine lunar resonance, allowing you to share uncurated fears without feeling the obligation to perform composure. You possess the capacity to hold quiet solidarity during personal crises.',
    'Emotional connection charts at {score}%. Mutual vulnerability is met with steady containment rather than emotional withdrawal. The psychic climate between you feels like a safe harbor where defenses can be dropped without fear of weaponization.',
    'At {score}%, your emotional bond offers deep somatic stability. An intuitive awareness of each other’s unspoken sorrow or anxiety creates a resilient foundation that outlasts transient external pressures.',
  ],
  mid: [
    'The emotional bond scores {score}%. Vulnerability is present but guarded by self-protective armor. When emotional atmospheric shifts occur, one partner absorbs stress like a sponge while the other erects rigid boundaries. Naming overwhelm aloud prevents instinctive retreat.',
    'Emotional bond registers at {score}%. You care profoundly for one another, yet emotional pacing differs. When vulnerability is exposed, clumsy responses can trigger defensive retreat. Cultivating patience during emotional disclosures builds lasting trust.',
    'At {score}%, emotional safety requires active maintenance. You do not experience seamless psychic fusion, which preserves individuality but requires intentional reassurance when self-doubt surfaces.',
  ],
  low: [
    'Emotional bond registers at {score}%. Gut-level containment is precarious; emotional reactions are easily misread as rejection or overbearing scrutiny. True emotional safety cannot be assumed; it must be constructed piece by piece through consistent reliability.',
    'Emotional resonance charts at {score}%. Divergent attachment responses create emotional turbulence. Where one seeks immediate reassurance, the other demands solitude to restore equilibrium. Honoring these differing needs without judgment is vital.',
    'At {score}%, emotional alignment demands rigorous self-awareness. Unprocessed individual baggage easily projects onto the bond; maintaining personal therapeutic spaces protects the relationship from emotional overload.',
  ],
};

export const CONFLICT_REPAIR_TEMPLATES: Record<ScoreTier, string[]> = {
  high: [
    'Conflict style scores {score}%. Disagreements are treated as navigational adjustments rather than existential threats. When friction arises, both parties exhibit high emotional hygiene: de-escalation begins before ego defense mechanisms entrench into rigid contempt.',
    'Conflict management registers at {score}%. You possess an instinctive ability to decompress heated moments. Arguments remain focused on current logistical facts rather than historical grievances, allowing clean repair without prolonged emotional aftermath.',
    'At {score}%, repair occurs rapidly and cleanly. Apologies are offered with accountability rather than tactical deflection, ensuring that temporary friction becomes a catalyst for deeper understanding.',
  ],
  mid: [
    'Conflict style registers at {score}%. Friction tends to trigger familiar defensive postures: rapid confrontation on one side meets deliberate withdrawal on the other. Repair requires explicit ceasefire intervals: step away for twenty minutes to regulate nervous systems before resuming contentious discussions.',
    'Conflict scores {score}%. Sharp tongues and stubborn wills can escalate minor logistical disagreements into tests of personal loyalty. Establish a firm rule against dispute litigation late at night or through electronic text channels.',
    'At {score}%, friction is an inevitable by-product of your contrasting temperaments. The danger is not the argument itself, but the slow accumulation of unspoken resentments. Regular clearing rituals prevent minor irritations from hardening into permanent walls.',
  ],
  low: [
    'Conflict style registers at {score}%. Under stress, friction quickly turns volatile or freezes into icy alienation. Defensive reactions can become reflexively punitive. Concrete protocols—such as mandatory cool-down periods and third-party facilitation—are vital for preventing mutual exhaustion.',
    'Conflict registers at {score}%. Misunderstandings escalate with explosive velocity unless immediate emotional containment is observed. Never attempt resolution while adrenaline is surging; silence must be utilized as calm reflection, not weaponized withholding.',
    'At {score}%, disagreement tests the structural integrity of the bond. Both parties must actively surrender the compulsion to win every argument; prioritizing mutual peace over rhetorical victory is the only sustainable strategy.',
  ],
};

export const LONG_TERM_TEMPLATES: Record<ScoreTier, string[]> = {
  high: [
    'Long-term potential registers at {score}%. Saturnian anchors provide structural longevity to this connection. This is a pairing equipped to weather the inevitable collapse of romantic idealization without dismantling the relationship itself. Shared accountability keeps the bond grounded over decades.',
    'Longevity scores {score}%. You share an instinctive respect for mutual commitments; promises are treated as binding contracts rather than casual suggestions. As long as you maintain common horizons, this foundation possesses formidable durability.',
    'At {score}%, long-term alignment is remarkably sturdy. Everyday routines do not erode your mutual appreciation; instead, shared domestic or collaborative responsibilities deepen your sense of enduring partnership.',
  ],
  mid: [
    'Long-term potential scores {score}%. Structural durability depends on continual calibration of life goals. While the foundation is capable of sustaining meaningful seasons together, divergent career trajectories or domestic visions will require conscious compromise rather than silent sacrifice.',
    'Longevity registers at {score}%. The bond has real staying power, provided neither partner expects the other to subordinate personal growth to the relationship. Longevity is sustained by periodic reinvention rather than clinging to initial arrangements.',
    'At {score}%, long-term horizons are viable but require regular auditing. Check in on shared milestones every few months to ensure both partners still genuinely desire the future you are building together.',
  ],
  low: [
    'Long-term potential registers at {score}%. Staying power is challenged by divergent life philosophies and contrasting practical habits. Sustaining this bond over extended horizons requires exceptional discipline and clear structural boundaries.',
    'Longevity scores {score}%. Without deliberate external scaffolding and shared pragmatic objectives, relational gravity tends to pull you into separate orbits over time. Focus on concrete shared projects rather than abstract promises.',
    'At {score}%, long-term viability requires radical honesty regarding what each partner can realistically offer. Avoid making commitments based on hopeful potential rather than demonstrated consistency.',
  ],
};

export const GROWTH_TIPS_BY_RELATIONSHIP: Record<string, string[]> = {
  romantic: [
    'Actionable growth tips for your romantic partnership:\n1. Schedule regular check-ins where unspoken resentments are cleared before they harden into defensive walls.\n2. Protect separate individual interests; passionate mutual attraction requires personal space to sustain its polarity.\n3. Practice deliberate repair rituals following arguments, prioritizing nervous system calm over winning the debate.',
    'Key growth practices for your romantic bond:\n1. Name your needs directly without expecting intuitive mind-reading.\n2. Celebrate individual victories with wholehearted enthusiasm rather than quiet comparison.\n3. Build quiet evening rituals devoid of screens to anchor shared emotional presence.',
  ],
  crush: [
    'Actionable growth tips for navigating this connection:\n1. Separate genuine observation from hopeful projection; observe how they treat obligations under stress.\n2. Regulate conversational pacing—resist the impulse to over-disclose intimacy before reciprocal trust is demonstrated.\n3. Ground emotional investment in verifiable actions rather than cryptic social cues.',
    'Essential growth guidelines for exploring this dynamic:\n1. Stay anchored in your independent routine while exploring mutual interest.\n2. Communicate interest with straightforward simplicity rather than tactical games.\n3. Allow curiosity to unfold organically without rushing to label the outcome.',
  ],
  ex: [
    'Actionable growth tips for post-relational clarity:\n1. Establish absolute digital and personal boundaries; ambiguity prolongs unresolved attachment loops.\n2. Perform an objective post-mortem on repeated conflict patterns without assigning villainhood to either party.\n3. Channel residual emotional energy into personal sovereignty, self-reflection, and creative renewal.',
    'Core growth practices for honoring closure:\n1. Refrain from reopening emotional negotiations during moments of nostalgic loneliness.\n2. Acknowledge what the connection taught you about your boundary thresholds.\n3. Grant full permission for both parties to evolve independently without lingering resentment.',
  ],
  friend: [
    'Actionable growth tips for enduring friendship:\n1. Honor divergent life trajectories without interpreting natural space as relational drift.\n2. Ensure emotional support flows symmetrically; prevent conversations from becoming one-sided unloading.\n3. Preserve spontaneous playfulness and shared levity amidst adult logistical demands.',
    'Foundational growth recommendations for your friendship:\n1. Check in without an agenda simply to celebrate the other’s presence.\n2. Offer candid, constructive feedback with tenderness when asked for advice.\n3. Respect their external partnerships while safeguarding your private camaraderie.',
  ],
  friendship: [
    'Actionable growth tips for enduring friendship:\n1. Honor divergent life trajectories without interpreting natural space as relational drift.\n2. Ensure emotional support flows symmetrically; prevent conversations from becoming one-sided unloading.\n3. Preserve spontaneous playfulness and shared levity amidst adult logistical demands.',
    'Foundational growth recommendations for your friendship:\n1. Check in without an agenda simply to celebrate the other’s presence.\n2. Offer candid, constructive feedback with tenderness when asked for advice.\n3. Respect their external partnerships while safeguarding your private camaraderie.',
  ],
  family: [
    'Actionable growth tips for family dynamics:\n1. Relinquish childhood roles; interact as sovereign adults rather than historical archetypes.\n2. Maintain strict boundaries around unsolicited life advice and personal choices.\n3. Focus shared time on common values while sidestepping known generational trigger points.',
    'Constructive growth practices for kinship:\n1. Listen to family narratives with curiosity rather than knee-jerk defensiveness.\n2. Give grace for generational limitations without compromising your emotional integrity.\n3. Create new, adult traditions that reflect mutual respect and autonomy.',
  ],
  coworker: [
    'Actionable growth tips for professional alignment:\n1. Document project expectations and deliverables with ruthless clarity to eliminate ambiguity.\n2. Depersonalize procedural friction; evaluate strategy based on outcome metrics rather than personal pride.\n3. Maintain healthy separation between workplace camaraderie and professional accountability.',
    'Strategic growth guidelines for professional collaboration:\n1. Establish explicit communication channels for urgent vs routine deliverables.\n2. Acknowledge complementary competencies and delegate leadership accordingly.\n3. Address workplace misalignment immediately before subtle dissatisfaction impacts team momentum.',
  ],
  business: [
    'Actionable growth tips for professional alignment:\n1. Document project expectations and deliverables with ruthless clarity to eliminate ambiguity.\n2. Depersonalize procedural friction; evaluate strategy based on outcome metrics rather than personal pride.\n3. Maintain healthy separation between workplace camaraderie and professional accountability.',
    'Strategic growth guidelines for professional collaboration:\n1. Establish explicit communication channels for urgent vs routine deliverables.\n2. Acknowledge complementary competencies and delegate leadership accordingly.\n3. Address workplace misalignment immediately before subtle dissatisfaction impacts team momentum.',
  ],
};
