import { describe, it, expect } from 'vitest';
import {
  sanitizeReportContent,
  validateAgeConfirmation,
  REDACTION_TOKEN,
  UNIVERSAL_ENTERTAINMENT_DISCLAIMER,
} from '@/lib/safety/filter';
import { validateCheckoutEligibility } from '@/lib/vault/billing';

describe('Safety Filter Adversarial Fuzzer & Stress Suite', () => {
  // =========================================================================
  // 1. MEDICAL & PRESCRIPTION CLAIMS (20+ vectors)
  // =========================================================================
  describe('Medical & Prescription Adversarial Vectors', () => {
    const vectors = [
      { text: 'A medical diagnosis will confirm this imbalance.', match: 'medical' },
      { text: 'They need a doctor to diagnose their condition.', match: 'medical' },
      { text: 'The charts have diagnosed this chronic fatigue.', match: 'medical' },
      { text: 'By diagnosing the underlying symptom you heal.', match: 'medical' },
      { text: 'Seek medical advice immediately for your pain.', match: 'medical' },
      { text: 'This aspect delivers a definitive medical treatment.', match: 'medical' },
      { text: 'The planetary alignment provides a medical cure.', match: 'medical' },
      { text: 'A doctor will prescribe medication for this issue.', match: 'medical' },
      { text: 'You must fill your prescription right away.', match: 'medical' },
      { text: 'The physician prescribed daily antidepressants.', match: 'medical' },
      { text: 'This placement reveals a cure for heart disease.', match: 'medical' },
      { text: 'The stars reveal a cure your body requires.', match: 'medical' },
      { text: 'There is a cure any physician would validate.', match: 'medical' },
      { text: 'A miraculous cure disease protocol is foreseen.', match: 'medical' },
      { text: 'This chart transit indicates cancer disease progression.', match: 'medical' },
      { text: 'They will begin intensive cancer treatment soon.', match: 'medical' },
      { text: 'Being a cancer patient will test their resilience.', match: 'medical' },
      { text: 'A malignant cancer cell has been activated.', match: 'medical' },
      { text: 'The chart reveals a severe cancer diagnosis.', match: 'medical' },
      { text: 'Their prognosis indicates advanced cancer stage 4.', match: 'medical' },
      // Casing variations
      { text: 'A DOCTOR MUST PRESCRIBE STRONG MEDICATION.', match: 'medical' },
      { text: 'ThIs Is A mEdIcAl DiAgNoSiS fOr YoUr PaRtNeR.', match: 'medical' },
      { text: 'tHe CaNcEr DiSeAsE wIlL sPrEaD.', match: 'medical' },
      // Whitespace / multiline injections
      { text: 'Medical\nadvice is strictly provided here.', match: 'medical' },
      { text: 'The stars\tcure\t\tyour\tillness.', match: 'medical' },
      { text: 'A   cancer   treatment   is foreseen.', match: 'medical' },
      // Punctuation trailing
      { text: 'They require an immediate diagnosis!', match: 'medical' },
      { text: 'Refill your prescription; do not wait.', match: 'medical' },
    ];

    vectors.forEach(({ text, match }, idx) => {
      it(`catches medical vector #${idx + 1}: "${text.slice(0, 35)}..."`, () => {
        const res = sanitizeReportContent(text);
        expect(res.isSafe).toBe(false);
        expect(res.violations).toContain(match);
        expect(res.sanitizedText).toContain(REDACTION_TOKEN);
      });
    });
  });

  // =========================================================================
  // 2. PREGNANCY & FERTILITY PREDICTIONS (20+ vectors)
  // =========================================================================
  describe('Pregnancy & Fertility Adversarial Vectors', () => {
    const vectors = [
      { text: 'You will definitely become pregnant this spring.', match: 'pregnancy' },
      { text: 'The transits show high pregnancy probability.', match: 'pregnancy' },
      { text: 'Your physical fertility is at its celestial peak.', match: 'pregnancy' },
      { text: 'Beware a potential miscarriage during the transit.', match: 'pregnancy' },
      { text: 'You will conceive in November under Jupiter.', match: 'pregnancy' },
      { text: 'The celestial clock reveals your baby\'s gender accurately.', match: 'pregnancy' },
      { text: 'The stars determine the gender of the baby as female.', match: 'pregnancy' },
      { text: 'We predict the gender of your baby will be male.', match: 'pregnancy' },
      // Casing variations
      { text: 'YOU ARE DEFINITELY GOING TO BECOME PREGNANT.', match: 'pregnancy' },
      { text: 'yOu WiLl CoNcEiVe In AuGuSt.', match: 'pregnancy' },
      { text: 'hEr PhYsIcAl FeRtIlItY iS gUaRaNtEeD.', match: 'pregnancy' },
      { text: 'THE GENDER OF YOUR BABY IS REVEALED.', match: 'pregnancy' },
      { text: 'THIS PROMISES A HIGH CHANCE OF MISCARRIAGE.', match: 'pregnancy' },
      // Whitespace / multiline injections
      { text: 'You will conceive\n\nin the coming cycle.', match: 'pregnancy' },
      { text: 'The baby\'s\t\tgender will be known.', match: 'pregnancy' },
      { text: 'The gender   of   the   baby is locked.', match: 'pregnancy' },
      { text: 'High\nfertility\nwindow ahead.', match: 'pregnancy' },
      // Punctuation trailing
      { text: 'Are you pregnant? Yes, definitively.', match: 'pregnancy' },
      { text: 'Prepare for pregnancy!', match: 'pregnancy' },
      { text: 'Risk of miscarriage; consult charts.', match: 'pregnancy' },
    ];

    vectors.forEach(({ text, match }, idx) => {
      it(`catches pregnancy vector #${idx + 1}: "${text.slice(0, 35)}..."`, () => {
        const res = sanitizeReportContent(text);
        expect(res.isSafe).toBe(false);
        expect(res.violations).toContain(match);
        expect(res.sanitizedText).toContain(REDACTION_TOKEN);
      });
    });
  });

  // =========================================================================
  // 3. DEATH & MORTALITY CLAIMS (20+ vectors)
  // =========================================================================
  describe('Death & Mortality Adversarial Vectors', () => {
    const vectors = [
      { text: 'This aspect portends an untimely death.', match: 'death' },
      { text: 'Your partner will die before their fiftieth birthday.', match: 'death' },
      { text: 'They are going to die under this planetary square.', match: 'death' },
      { text: 'A fatal collision is written in their transits.', match: 'death' },
      { text: 'They will succumb to a terminal illness next year.', match: 'death' },
      { text: 'Their expected lifespan is only sixty-two years.', match: 'death' },
      { text: 'Thoughts of suicide will plague this transit.', match: 'death' },
      // Casing variations
      { text: 'DEATH IS CERTAIN UNDER THIS ECLIPSE.', match: 'death' },
      { text: 'ThEy WiLl DiE sOoN.', match: 'death' },
      { text: 'yOu ArE gOiNg To DiE uNdEr ThIs AsPeCt.', match: 'death' },
      { text: 'A FATAL ACCIDENT WILL OCCUR.', match: 'death' },
      { text: 'TeRmInAl IlLnEsS iS pRoMiSeD.', match: 'death' },
      { text: 'A SHORT LIFESPAN IS WRITTEN IN THE STARS.', match: 'death' },
      { text: 'WARNING: SUICIDE RISK PREDICTED.', match: 'death' },
      // Whitespace / multiline injections
      { text: 'They will\n\ndie before winter.', match: 'death' },
      { text: 'A\tterminal\t\tillness approaches.', match: 'death' },
      { text: 'Going   to   die in a sudden manner.', match: 'death' },
      // Punctuation trailing
      { text: 'Death! It is inevitable.', match: 'death' },
      { text: 'Is it fatal? The transit says yes.', match: 'death' },
      { text: 'Calculated lifespan: 55 years.', match: 'death' },
    ];

    vectors.forEach(({ text, match }, idx) => {
      it(`catches death vector #${idx + 1}: "${text.slice(0, 35)}..."`, () => {
        const res = sanitizeReportContent(text);
        expect(res.isSafe).toBe(false);
        expect(res.violations).toContain(match);
        expect(res.sanitizedText).toContain(REDACTION_TOKEN);
      });
    });
  });

  // =========================================================================
  // 4. FINANCIAL / LOTTERY / CRYPTO / INVESTMENTS (20+ vectors)
  // =========================================================================
  describe('Financial & Investment Adversarial Vectors', () => {
    const vectors = [
      { text: 'Play your lucky numbers to win the lottery tomorrow.', match: 'financial' },
      { text: 'You should invest in tech stocks immediately.', match: 'financial' },
      { text: 'This transit guarantees guaranteed profit in foreign exchange.', match: 'financial' },
      { text: 'The planets urge you to buy stock before Friday.', match: 'financial' },
      { text: 'Now is the celestial time to buy crypto assets.', match: 'financial' },
      { text: 'An unexpected financial windfall will arrive by mail.', match: 'financial' },
      { text: 'Go ahead and gamble your savings at the casino.', match: 'financial' },
      { text: 'Heavy gambling is highly favored by Jupiter.', match: 'financial' },
      // Casing variations
      { text: 'BUY THE WINNING LOTTERY TICKET TODAY.', match: 'financial' },
      { text: 'iNvEsT iN tHiS oPpOrTuNiTy FoR 10X.', match: 'financial' },
      { text: 'GUARANTEED PROFIT AWAITS YOUR PORTFOLIO.', match: 'financial' },
      { text: 'bUy CrYpTo NoW fOr InStAnT rIcHes.', match: 'financial' },
      { text: 'BUY STOCK IN ENERGY SECTORS.', match: 'financial' },
      { text: 'A HUGE FINANCIAL WINDFALL WILL HIT YOU.', match: 'financial' },
      { text: 'GAMBLING WILL MAKE YOU A MILLIONAIRE.', match: 'financial' },
      // Whitespace / multiline injections
      { text: 'You must invest\n\nin this new venture.', match: 'financial' },
      { text: 'Guaranteed\tprofit\tis coming.', match: 'financial' },
      { text: 'Buy   crypto   while Venus is in Taurus.', match: 'financial' },
      { text: 'A financial\nwindfall is guaranteed.', match: 'financial' },
      // Punctuation trailing
      { text: 'Play the lottery!', match: 'financial' },
      { text: 'Ready to gamble? Fortune smiles.', match: 'financial' },
    ];

    vectors.forEach(({ text, match }, idx) => {
      it(`catches financial vector #${idx + 1}: "${text.slice(0, 35)}..."`, () => {
        const res = sanitizeReportContent(text);
        expect(res.isSafe).toBe(false);
        expect(res.violations).toContain(match);
        expect(res.sanitizedText).toContain(REDACTION_TOKEN);
      });
    });
  });

  // =========================================================================
  // 5. LEGAL OUTCOMES & DISPUTES (15+ vectors)
  // =========================================================================
  describe('Legal Adversarial Vectors', () => {
    const vectors = [
      { text: 'You will win the lawsuit against your former business partner.', match: 'legal' },
      { text: 'The stars indicate you will lose the lawsuit badly.', match: 'legal' },
      { text: 'A jury will deliver a guilty verdict next Tuesday.', match: 'legal' },
      { text: 'The impending legal ruling will favor your claims completely.', match: 'legal' },
      { text: 'Do not hesitate to sue them for maximum damages.', match: 'legal' },
      { text: 'You should take them to court to settle this grievance.', match: 'legal' },
      // Casing variations
      { text: 'YOU WILL WIN THE LAWSUIT WITHOUT QUESTION.', match: 'legal' },
      { text: 'yOu WiLl LoSe ThE lAwSuIt CoMpLeTeLy.', match: 'legal' },
      { text: 'THE JURY WILL REACH A GUILTY VERDICT.', match: 'legal' },
      { text: 'A FAVORABLE LEGAL RULING IS DESTINED.', match: 'legal' },
      { text: 'sUe ThEm ImMeDiAtElY fOr BrEaCh.', match: 'legal' },
      { text: 'TAKE THEM TO COURT RIGHT NOW.', match: 'legal' },
      // Whitespace / multiline injections
      { text: 'You will win\n\nthe lawsuit.', match: 'legal' },
      { text: 'Take\tthem\tto\tcourt.', match: 'legal' },
      { text: 'Sue   them   before the statute expires.', match: 'legal' },
      // Punctuation trailing
      { text: 'Will you win? Win the lawsuit!', match: 'legal' },
      { text: 'Guilty verdict; justice is served.', match: 'legal' },
    ];

    vectors.forEach(({ text, match }, idx) => {
      it(`catches legal vector #${idx + 1}: "${text.slice(0, 35)}..."`, () => {
        const res = sanitizeReportContent(text);
        expect(res.isSafe).toBe(false);
        expect(res.violations).toContain(match);
        expect(res.sanitizedText).toContain(REDACTION_TOKEN);
      });
    });
  });

  // =========================================================================
  // 6. MANIPULATIVE COMMANDS (20+ vectors)
  // =========================================================================
  describe('Manipulative Commands Adversarial Vectors', () => {
    const vectors = [
      { text: 'The stars insist you must divorce your spouse immediately.', match: 'manipulative_command' },
      { text: 'This transit commands that you must leave them today.', match: 'manipulative_command' },
      { text: 'The alignment dictates you must break up before sunset.', match: 'manipulative_command' },
      { text: 'The cosmos orders you must cut contact now forever.', match: 'manipulative_command' },
      { text: 'No matter the abuse, you must stay with them.', match: 'manipulative_command' },
      { text: 'Do not listen to reason, cut contact now.', match: 'manipulative_command' },
      // Casing variations
      { text: 'YOU MUST DIVORCE THEM BEFORE THE FULL MOON.', match: 'manipulative_command' },
      { text: 'yOu MuSt LeAvE tHeM aT oNcE.', match: 'manipulative_command' },
      { text: 'YOU MUST BREAK UP IMMEDIATELY.', match: 'manipulative_command' },
      { text: 'yOu MuSt CuT cOnTaCt NoW.', match: 'manipulative_command' },
      { text: 'YOU MUST STAY WITH THEM REGARDLESS OF HARM.', match: 'manipulative_command' },
      { text: 'CUT CONTACT NOW WITHOUT EXPLANATION.', match: 'manipulative_command' },
      // Whitespace / multiline injections
      { text: 'You\nmust\ndivorce.', match: 'manipulative_command' },
      { text: 'You\tmust\tleave\tthem.', match: 'manipulative_command' },
      { text: 'You   must   break   up   right away.', match: 'manipulative_command' },
      { text: 'You\nmust\nstay\nwith\nthem.', match: 'manipulative_command' },
      { text: 'Cut\ncontact\nnow.', match: 'manipulative_command' },
      // Punctuation trailing
      { text: 'You must divorce!', match: 'manipulative_command' },
      { text: 'Cut contact now; block their phone.', match: 'manipulative_command' },
      { text: 'You must break up.', match: 'manipulative_command' },
    ];

    vectors.forEach(({ text, match }, idx) => {
      it(`catches manipulative vector #${idx + 1}: "${text.slice(0, 35)}..."`, () => {
        const res = sanitizeReportContent(text);
        expect(res.isSafe).toBe(false);
        expect(res.violations).toContain(match);
        expect(res.sanitizedText).toContain(REDACTION_TOKEN);
      });
    });
  });

  // =========================================================================
  // 7. MULTI-VIOLATION PARAGRAPHS & DENSE ADVERSARIAL BLOCKS (15+ vectors)
  // =========================================================================
  describe('Multi-Violation Paragraphs & Dense Injections', () => {
    it('catches medical + financial combination', () => {
      const input = 'Invest in penny stocks to pay for your cancer treatment.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(false);
      expect(res.violations).toContain('financial');
      expect(res.violations).toContain('medical');
      expect(res.sanitizedText).not.toContain('Invest in');
      expect(res.sanitizedText).not.toContain('cancer treatment');
    });

    it('catches pregnancy + death combination', () => {
      const input = 'She will become pregnant, but a fatal illness will strike.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(false);
      expect(res.violations).toContain('pregnancy');
      expect(res.violations).toContain('death');
      expect(res.sanitizedText).not.toContain('pregnant');
      expect(res.sanitizedText).not.toContain('fatal');
    });

    it('catches legal + manipulative command combination', () => {
      const input = 'You will win the lawsuit, so you must divorce them immediately.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(false);
      expect(res.violations).toContain('legal');
      expect(res.violations).toContain('manipulative_command');
      expect(res.sanitizedText).not.toContain('win the lawsuit');
      expect(res.sanitizedText).not.toContain('you must divorce');
    });

    it('catches 3 categories: medical + pregnancy + death', () => {
      const input = 'A doctor will prescribe rest because you are pregnant, but a fatal accident threatens.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(false);
      expect(res.violations).toEqual(expect.arrayContaining(['medical', 'pregnancy', 'death']));
    });

    it('catches 3 categories: financial + legal + manipulative', () => {
      const input = 'Buy crypto with your savings, sue them for fraud, and cut contact now.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(false);
      expect(res.violations).toEqual(expect.arrayContaining(['financial', 'legal', 'manipulative_command']));
    });

    it('catches 4 categories: medical + death + financial + manipulative', () => {
      const input = 'A medical diagnosis warns that they will die unless you buy stock, so you must leave them.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(false);
      expect(res.violations).toEqual(expect.arrayContaining(['medical', 'death', 'financial', 'manipulative_command']));
    });

    it('catches 5 categories: medical + pregnancy + death + financial + legal', () => {
      const input = 'She is pregnant with a baby whose lifespan is short; cure disease claims are false, so buy crypto and take them to court.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(false);
      expect(res.violations).toEqual(expect.arrayContaining(['pregnancy', 'death', 'medical', 'financial', 'legal']));
    });

    it('catches all 6 categories in a single paragraph', () => {
      const input = `
        A medical diagnosis reveals her condition. She is pregnant.
        However, death awaits anyone who fails to buy crypto.
        You will win the lawsuit, and you must divorce right now!
      `;
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(false);
      expect(res.violations).toContain('medical');
      expect(res.violations).toContain('pregnancy');
      expect(res.violations).toContain('death');
      expect(res.violations).toContain('financial');
      expect(res.violations).toContain('legal');
      expect(res.violations).toContain('manipulative_command');
      expect(res.violations.length).toBe(6);
    });

    it('replaces multiple occurrences of the same category in one block', () => {
      const input = 'You should buy crypto and buy stock to win the lottery.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(false);
      expect(res.violations).toEqual(['financial']);
      expect(res.sanitizedText).not.toContain('buy crypto');
      expect(res.sanitizedText).not.toContain('buy stock');
      expect(res.sanitizedText).not.toContain('lottery');
      const matches = res.sanitizedText.split(REDACTION_TOKEN).length - 1;
      expect(matches).toBe(3);
    });

    it('replaces 3 distinct medical assertions with 3 redaction tokens', () => {
      const input = 'A doctor will prescribe medicine to cure your illness after this diagnosis.';
      const res = sanitizeReportContent(input);
      expect(res.isSafe).toBe(false);
      expect(res.violations).toContain('medical');
      expect(res.sanitizedText).not.toContain('prescribe');
      expect(res.sanitizedText).not.toContain('cure your');
      expect(res.sanitizedText).not.toContain('diagnosis');
      const matches = res.sanitizedText.split(REDACTION_TOKEN).length - 1;
      expect(matches).toBe(3);
    });
  });

  // =========================================================================
  // 8. ASTROLOGICAL FALSE-POSITIVE DEFENSES (25+ celestial terms)
  // =========================================================================
  describe('Astrological False-Positive Defenses', () => {
    const celestialPhrases = [
      'Moon in Cancer brings deep emotional attunement and protective loyalty.',
      'Sun in Cancer illuminates the private emotional sanctuary of the pair.',
      'Venus in Cancer fosters nostalgic tenderness and home-centered intimacy.',
      'Mars in Cancer directs passion into fierce protective devotion.',
      'Jupiter in Cancer expands intuition and domestic abundance.',
      'Their Cancer Ascendant creates an approachable, receptive aura.',
      'With Cancer rising, emotional weather dictates social ease.',
      'A powerful Cancer stellium emphasizes water-element receptivity.',
      'The Cancer cusp in the fourth house anchors family roots.',
      'Mercury retrograde creates a fertile space for reflective contemplation.',
      'Pluto transit in 8th house precipitates profound psychological transformation.',
      'Mars opposite Saturn requires patient structural discipline and paced action.',
      'Saturn return in 8th house marks the maturity of shared emotional investments.',
      'Venus conjunct Neptune in Pisces heightens transcendental artistic empathy.',
      'Uranus square Sun demands radical personal autonomy and innovative reinvention.',
      'Chiron transit in 6th house highlights holistic somatic balance.',
      'Jupiter sextile Pluto fosters empowered philosophical convictions.',
      'Midheaven in Capricorn inspires deliberate long-term institutional ambition.',
      'North Node in Aries champions courageous self-assertion and pioneering spirit.',
      'South Node in Libra releases over-dependence on social pleasing.',
      'Eighth house transformation clears outdated psychological attachments.',
      'Scorpio energy and rebirth foster profound intimacy and unwavering depth.',
      'This celestial chemistry inspires a fertile imagination and mutual artistic flow.',
      'Harmonious trine between Moon and Venus softens mutual communication.',
      'Their astrological alignment celebrates mutual resilience and enduring devotion.',
      'Deep celestial affinity connects their solar essences across generational houses.',
    ];

    celestialPhrases.forEach((phrase, idx) => {
      it(`does NOT flag astrological phrase #${idx + 1}: "${phrase.slice(0, 40)}..."`, () => {
        const res = sanitizeReportContent(phrase);
        expect(res.isSafe).toBe(true);
        expect(res.violations).toEqual([]);
        expect(res.sanitizedText).toBe(phrase);
      });
    });
  });

  // =========================================================================
  // 9. 18+ AGE VERIFICATION & CHECKOUT ELIGIBILITY MATRIX
  // =========================================================================
  describe('18+ Age Verification & Checkout Rejection Matrix', () => {
    it('approves age confirmation when explicitly true', () => {
      expect(validateAgeConfirmation(true)).toBe(true);
    });

    it('rejects age confirmation when false', () => {
      expect(() => validateAgeConfirmation(false)).toThrow('User must confirm they are 18+');
    });

    it('rejects age confirmation when undefined', () => {
      expect(() => validateAgeConfirmation(undefined as unknown as boolean)).toThrow('User must confirm they are 18+');
    });

    it('rejects age confirmation when null', () => {
      expect(() => validateAgeConfirmation(null as unknown as boolean)).toThrow('User must confirm they are 18+');
    });

    it('rejects age confirmation when 0 or falsy values passed', () => {
      expect(() => validateAgeConfirmation(0 as unknown as boolean)).toThrow('User must confirm they are 18+');
      expect(() => validateAgeConfirmation('' as unknown as boolean)).toThrow('User must confirm they are 18+');
    });

    it('approves checkout when ageConfirmed is true and valid amount provided', () => {
      expect(validateCheckoutEligibility({ ageConfirmed: true, amount: 6.99 })).toBe(true);
      expect(validateCheckoutEligibility({ ageConfirmed: true, amount: 7.99 })).toBe(true);
      expect(validateCheckoutEligibility({ ageConfirmed: true, amount: 39.99 })).toBe(true);
    });

    it('rejects checkout when ageConfirmed is false regardless of amount', () => {
      expect(() => validateCheckoutEligibility({ ageConfirmed: false, amount: 6.99 })).toThrow('User must confirm they are 18+');
      expect(() => validateCheckoutEligibility({ ageConfirmed: false, amount: 39.99 })).toThrow('User must confirm they are 18+');
    });

    it('rejects checkout when ageConfirmed is undefined or missing', () => {
      expect(() => validateCheckoutEligibility({ ageConfirmed: undefined as unknown as boolean })).toThrow('User must confirm they are 18+');
      expect(() => validateCheckoutEligibility({ ageConfirmed: null as unknown as boolean })).toThrow('User must confirm they are 18+');
      expect(() => validateCheckoutEligibility({} as { ageConfirmed: boolean })).toThrow('User must confirm they are 18+');
    });

    it('rejects checkout when amount is zero or negative', () => {
      expect(() => validateCheckoutEligibility({ ageConfirmed: true, amount: 0 })).toThrow('Purchase amount must be positive');
      expect(() => validateCheckoutEligibility({ ageConfirmed: true, amount: -10 })).toThrow('Purchase amount must be positive');
    });
  });

  // =========================================================================
  // 10. CORNER CASES, INVARIANTS & INTEGRATION
  // =========================================================================
  describe('Invariants & Sanitization Corner Cases', () => {
    it('returns canonical entertainment disclaimer verbatim', () => {
      expect(UNIVERSAL_ENTERTAINMENT_DISCLAIMER).toContain('For entertainment purposes only');
      expect(UNIVERSAL_ENTERTAINMENT_DISCLAIMER).toContain('Not a substitute for professional');
    });

    it('preserves text idempotently when safe', () => {
      const text = 'The Sun trines Moon in peaceful harmony.';
      const pass1 = sanitizeReportContent(text);
      const pass2 = sanitizeReportContent(pass1.sanitizedText);
      expect(pass1.sanitizedText).toBe(text);
      expect(pass2.sanitizedText).toBe(text);
      expect(pass2.isSafe).toBe(true);
    });

    it('preserves redaction idempotently across multiple passes', () => {
      const dirty = 'This will cure your disease and you must divorce.';
      const pass1 = sanitizeReportContent(dirty);
      expect(pass1.isSafe).toBe(false);
      const pass2 = sanitizeReportContent(pass1.sanitizedText);
      // Once redacted, the REDACTION_TOKEN itself must not trigger violations
      expect(pass2.isSafe).toBe(true);
      expect(pass2.violations).toHaveLength(0);
      expect(pass2.sanitizedText).toBe(pass1.sanitizedText);
    });

    it('handles extremely long text (>10k chars) with embedded violations efficiently', () => {
      const harmlessBlock = 'Their emotional chemistry is balanced and mutually respectful. '.repeat(200);
      const payload = harmlessBlock + ' However, you will win the lottery. ' + harmlessBlock;
      const t0 = performance.now();
      const res = sanitizeReportContent(payload);
      const t1 = performance.now();
      expect(res.isSafe).toBe(false);
      expect(res.violations).toContain('financial');
      expect(res.sanitizedText).toContain(REDACTION_TOKEN);
      expect(t1 - t0).toBeLessThan(100); // Must execute in < 100ms
    });
  });
});
