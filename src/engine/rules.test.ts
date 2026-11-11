import { describe, expect, it } from 'vitest';
import { annualEffect, EFFECT_DEFAULTS } from './effect';
import { ELDERLY_AGE, QUIZ_FAIL_LIMIT } from './rules';
import {
  diagnosisStatus,
  estimateHorizon,
  executionPath,
  getDefaultSelectedId,
  getEligibleOptions,
  getFitScores,
  needsHandoff,
  predictChurn,
} from './rules';
import { getPersona } from '../mock/personas';
import { ETF_PORTFOLIO_ID, INVEST_ID, REDEPOSIT_ID } from '../mock/products';

const personaA = getPersona('A');
const personaB = getPersona('B');
const personaC = getPersona('C');
const personaD = getPersona('D');

describe('estimateHorizon', () => {
  it('maps timing chips to a horizon and keeps a real use date', () => {
    expect(estimateHorizon({ timing: 'WITHIN_6M', useDate: '2027-05-20' })).toEqual({
      horizon: 'SHORT',
      useDate: '2027-05-20',
    });
    expect(estimateHorizon({ timing: 'Y1_3' }).horizon).toBe('MID');
    expect(estimateHorizon({ timing: 'OVER_3Y' }).horizon).toBe('LONG');
    expect(estimateHorizon({ timing: 'UNKNOWN', useDate: 'unknown' })).toEqual({ horizon: 'UNKNOWN' });
  });

  it('classifies a real use date by months from the demo today', () => {
    expect(estimateHorizon({ timing: 'Y1_3', useDate: '2027-05-20' }).horizon).toBe('SHORT');
    expect(estimateHorizon({ useDate: '2028-03-01' }).horizon).toBe('MID');
    expect(estimateHorizon({ useDate: '2030-01-01' }).horizon).toBe('LONG');
  });
});

describe('RULE_DEFAULT_REDEPOSIT', () => {
  it('puts redeposit first and selects it by default', () => {
    const { options, appliedRules } = getEligibleOptions(personaB, 'LONG');
    expect(options[0]?.productId).toBe(REDEPOSIT_ID);
    expect(options[0]?.kind).toBe('redeposit');
    expect(getDefaultSelectedId(options)).toBe(REDEPOSIT_ID);
    expect(appliedRules).toContain('RULE_DEFAULT_REDEPOSIT');
    expect(options.length).toBeLessThanOrEqual(3);
  });
});

describe('RULE_SHORT_TERM_NO_INVEST', () => {
  it('drops investment products for a short horizon', () => {
    const { options, excluded, appliedRules } = getEligibleOptions(personaB, 'SHORT', '2027-05-20');
    expect(options.some((option) => option.kind === 'invest')).toBe(false);
    expect(excluded.some((item) => item.productId === INVEST_ID)).toBe(true);
    expect(appliedRules).toContain('RULE_SHORT_TERM_NO_INVEST');
    expect(options.some((option) => option.productId === 'super-deposit')).toBe(true);
  });
});

describe('RULE_SUITABILITY_ONLY', () => {
  it('hides investment from a conservative customer even on a long horizon', () => {
    const { options, excluded, appliedRules } = getEligibleOptions(personaB, 'LONG');
    expect(options.some((option) => option.kind === 'invest')).toBe(false);
    expect(excluded.find((item) => item.productId === INVEST_ID)?.reason).toContain('안정형');
    expect(appliedRules).toContain('RULE_SUITABILITY_ONLY');
  });

  it('hides investment when the risk profile is missing', () => {
    const { options, appliedRules } = getEligibleOptions(personaC, 'LONG');
    expect(options.some((option) => option.kind === 'invest')).toBe(false);
    expect(appliedRules).toContain('RULE_SUITABILITY_ONLY');
  });

  it('shows an investment option only to a suitable long-horizon customer', () => {
    const { options, appliedRules } = getEligibleOptions(personaA, 'LONG');
    expect(options.some((option) => option.productId === ETF_PORTFOLIO_ID && option.provider === '우리자산운용')).toBe(true);
    expect(appliedRules).toContain('RULE_COOLING_OFF');
  });
});

describe('official affiliate choices', () => {
  it('offers securities and asset management alternatives with official sources for an aggressive investor', () => {
    for (const horizon of ['MID', 'LONG'] as const) {
      const result = getEligibleOptions(personaA, horizon);
      expect(result.options.map((option) => option.productId)).toEqual([REDEPOSIT_ID, INVEST_ID, ETF_PORTFOLIO_ID]);
      const affiliates = result.options.filter((option) => option.kind === 'invest');
      expect(affiliates.map((option) => option.provider)).toEqual(['우리투자증권', '우리자산운용']);
      expect(affiliates.every((option) => !option.isExample && option.officialUrl?.startsWith('https://') && option.officialCheckedAt)).toBe(true);
      expect(affiliates.find((option) => option.productId === ETF_PORTFOLIO_ID)?.ticker).toBe('444490');
      expect(affiliates.every((option) => !option.principalGuaranteed && option.annualRate === null)).toBe(true);
      expect(result.excluded.some((option) => affiliates.some((shown) => shown.productId === option.productId))).toBe(false);
    }
  });

  it('limits a stability-seeking investor to RP rather than the equity ETF', () => {
    const result = getEligibleOptions({ ...personaA, riskProfile: '안정추구형' }, 'LONG');
    expect(result.options.some((option) => option.productId === INVEST_ID)).toBe(true);
    expect(result.options.some((option) => option.productId === ETF_PORTFOLIO_ID)).toBe(false);
  });
});

describe('investment preference', () => {
  it('excludes investments for Yang even if a stored risk profile would otherwise permit them', () => {
    const result = getEligibleOptions({ ...personaD, riskProfile: '적극투자형' }, 'LONG');
    expect(result.options.some((option) => option.kind === 'invest')).toBe(false);
    expect(result.appliedRules).toContain('RULE_NO_INVESTMENT_PREFERENCE');
    expect(result.excluded.find((item) => item.productId === ETF_PORTFOLIO_ID)?.reason).toContain('원하지');
    expect(result.decision).toContain('예금만');
  });

  it('keeps short-term and unknown use dates out of investment even for an aggressive investor', () => {
    for (const horizon of ['SHORT', 'UNKNOWN'] as const) {
      expect(getEligibleOptions(personaA, horizon).options.some((option) => option.kind === 'invest')).toBe(false);
    }
  });
});

describe('RULE_ELDERLY_HANDOFF', () => {
  it(`hands off at age ${ELDERLY_AGE} when an investment is requested`, () => {
    expect(needsHandoff({ age: ELDERLY_AGE }, 0, { investInquiry: true })).toMatchObject({
      handoff: true,
      reason: 'RULE_ELDERLY_HANDOFF',
    });
    expect(needsHandoff(personaC, 0, { investInquiry: true }).handoff).toBe(true);
  });

  it('does not hand off an older customer who stays with deposits', () => {
    expect(needsHandoff(personaC, 0).handoff).toBe(false);
    expect(needsHandoff({ age: ELDERLY_AGE - 1 }, 0, { investInquiry: true }).handoff).toBe(false);
  });
});

describe('RULE_QUIZ_FAIL_HANDOFF', () => {
  it(`stops after ${QUIZ_FAIL_LIMIT} misses on the same question`, () => {
    expect(needsHandoff(personaB, 1).handoff).toBe(false);
    expect(needsHandoff(personaB, QUIZ_FAIL_LIMIT)).toMatchObject({
      handoff: true,
      reason: 'RULE_QUIZ_FAIL_HANDOFF',
    });
  });
});

describe('RULE_COOLING_OFF', () => {
  it('makes the investment path longer than a deposit confirmation', () => {
    const invest = executionPath('invest');
    const deposit = executionPath('deposit');
    expect(invest.rule).toBe('RULE_COOLING_OFF');
    expect(invest.steps).toEqual(['profile', 'explain', 'quiz', 'cooling', 'final']);
    expect(deposit.steps).toEqual(['confirm']);
    expect(invest.steps.length).toBeGreaterThan(deposit.steps.length);
  });
});

describe('diagnosisStatus', () => {
  it('marks a diagnosis older than a year as expired', () => {
    expect(diagnosisStatus('2025-09-01', '2026-10-22').state).toBe('expired');
    expect(diagnosisStatus('2026-04-02', '2026-10-22').state).toBe('valid');
    expect(diagnosisStatus(undefined).state).toBe('none');
  });
});

describe('predictChurn and fit scores', () => {
  it('returns the example churn figure from the engine', () => {
    expect(predictChurn(personaA)).toMatchObject({ probability: 0.72, priority: '상', isExample: true });
  });

  it('can rank a matched deposit above redeposit while redeposit stays the default', () => {
    const scores = getFitScores(personaA, 'SHORT', '2027-05-20');
    const top = scores.find((item) => !item.excluded);
    expect(top?.productId).toBe('super-deposit');
    const { options } = getEligibleOptions(personaA, 'SHORT', '2027-05-20');
    expect(getDefaultSelectedId(options)).toBe(REDEPOSIT_ID);
  });
});

describe('option bounds', () => {
  it('keeps redeposit first and caps every persona and horizon at 3 cards', () => {
    const horizons = ['SHORT', 'MID', 'LONG', 'UNKNOWN'] as const;
    for (const persona of [personaA, personaB, personaC, personaD]) {
      for (const horizon of horizons) {
        const { options } = getEligibleOptions(persona, horizon, '2027-05-20');
        expect(options[0]?.kind).toBe('redeposit');
        expect(options.length).toBeGreaterThan(0);
        expect(options.length).toBeLessThanOrEqual(3);
        if (persona.investmentPreference === 'declines' || persona.riskProfile === '안정형') {
          expect(options.some((option) => option.kind === 'invest')).toBe(false);
        }
      }
    }
  });
});

describe('choice narrative', () => {
  it('explains a short-term jeonse choice in the customer’s own situation', () => {
    const { heard, decision, options } = getEligibleOptions(personaA, 'SHORT', '2027-05-20', { purpose: 'JEONSE' });
    expect(heard).toContain('전세');
    expect(heard).toContain('2027년 5월 20일');
    expect(decision).toContain('재예치');
    expect(decision).not.toContain('펀드');
    expect(options[0]?.proceedLabel).toContain('재예치');
    expect(options.find((option) => option.productId === 'super-deposit')?.guide.length).toBeGreaterThan(40);
  });
});

describe('annualEffect', () => {
  it('returns about 5.5 billion won at the default assumptions', () => {
    const result = annualEffect(EFFECT_DEFAULTS);
    expect(result.fundingSave).toBe(3_000_000_000);
    expect(result.feeIncome).toBe(2_500_000_000);
    expect(result.total).toBe(5_500_000_000);
  });
});
