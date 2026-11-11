import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPersona } from '../mock/personas';
import { estimateHorizon, getEligibleOptions } from '../engine/rules';
import { useDemoStore } from './useDemoStore';

describe('bank lookup conversation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useDemoStore.getState().selectPersona('D');
    useDemoStore.getState().setLookupFailureOnce('none');
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('runs the tuition and moving persona through clarification and customer confirmation before building two deposits', async () => {
    const store = useDemoStore.getState();
    store.selectPersona('E');
    const persona = getPersona('E');
    const request = store.startMaturityChat();
    await vi.runAllTimersAsync();
    await request;
    expect(useDemoStore.getState().maturityLookup).toMatchObject({ status: 'success', data: { customerName: '정하늘', principal: 30_000_000 } });
    store.submitUtterance(persona.scenario!.utterance);
    let state = useDemoStore.getState();
    expect(state.interpret?.items).toMatchObject([
      { purpose: 'TUITION', amount: 15_000_000, date: '2027-05-20', certainty: 'CONFIRMED' },
      { purpose: 'MOVING', amount: 15_000_000, timeText: '내년 봄쯤', certainty: 'NEEDS_CONFIRM' },
    ]);
    expect(state.messages.at(-1)?.text).toContain('3월 말로 보면 될까요');
    expect(store.confirmIntent()).toBe(false);
    expect(state.splitLegs).toBeNull();
    store.answerIntentDate(1, '2027-03-31');
    expect(useDemoStore.getState().splitLegs).toBeNull();
    expect(useDemoStore.getState().intentConfirmed).toBe(false);
    expect(store.confirmIntent()).toBe(true);
    await store.prepareChatOptions();
    state = useDemoStore.getState();
    expect(state.chatStep).toBe('closing');
    expect(state.splitLegs).toMatchObject([
      { purpose: 'TUITION', amount: 15_000_000, date: '2027-05-20', productId: 'super-deposit' },
      { purpose: 'MOVING', amount: 15_000_000, date: '2027-03-31', productId: 'super-deposit' },
    ]);
    const horizon = estimateHorizon(state.answers);
    const choices = getEligibleOptions(persona, horizon.horizon, horizon.useDate, { split: true });
    expect(choices.appliedRules).toContain('RULE_SPLIT_BY_PURPOSE');
    expect(choices.options.every((option) => option.kind !== 'invest')).toBe(true);
  });

  it('shows the introduction and loading state before exposing bank data and an acknowledgement', async () => {
    const request = useDemoStore.getState().startMaturityChat();
    let state = useDemoStore.getState();
    expect(state.maturityLookup.status).toBe('loading');
    expect(state.messages.slice(2).map((message) => message.id)).toEqual(['maturity-introduction', 'maturity-lookup']);
    expect(state.messages.some((message) => message.role === 'user')).toBe(false);
    expect(state.messages.some((message) => message.text.includes('만기네요'))).toBe(false);

    await vi.runAllTimersAsync();
    await request;
    state = useDemoStore.getState();
    expect(state.maturityLookup).toMatchObject({
      status: 'success',
      data: { customerName: '양대건', principal: 30_000_000, estimatedInterest: 930_000, annualRate: 0.031,
        maturityDate: '2026-11-21', daysToMaturity: 30, autoRedeposit: true, source: 'demo-bank-service' },
    });
    expect(state.messages.at(-1)?.text).toContain('이 돈은 언제 쓰실 예정이세요?');
    expect(state.messages.some((message) => message.text.includes('자동 재예치는 켜져 있어요'))).toBe(true);
  });

  it('keeps existing answers and avoids querying or introducing itself twice on reentry', async () => {
    const store = useDemoStore.getState();
    const request = store.startMaturityChat();
    await vi.runAllTimersAsync();
    await request;
    store.setAnswers({ timing: 'WITHIN_6M', purpose: 'TUITION' });
    store.setChatStep('date');
    store.appendMessage('user', '학비');
    const messages = useDemoStore.getState().messages;
    await store.startMaturityChat();
    expect(useDemoStore.getState().messages).toBe(messages);
    expect(vi.getTimerCount()).toBe(0);
    expect(useDemoStore.getState().answers).toEqual({ timing: 'WITHIN_6M', purpose: 'TUITION' });
    expect(useDemoStore.getState().chatStep).toBe('date');
  });

  it('reports query failure without inventing a success and allows a one-shot failure to be retried', async () => {
    const store = useDemoStore.getState();
    store.setLookupFailureOnce('maturity');
    const failed = store.startMaturityChat();
    await vi.runAllTimersAsync();
    await failed;
    expect(useDemoStore.getState().maturityLookup.status).toBe('error');
    expect(useDemoStore.getState().messages.some((message) => message.text.includes('만기네요'))).toBe(false);
    const retry = store.startMaturityChat();
    await vi.runAllTimersAsync();
    await retry;
    expect(useDemoStore.getState().maturityLookup.status).toBe('success');
    expect(useDemoStore.getState().messages.filter((message) => message.id === 'maturity-introduction')).toHaveLength(1);
    expect(useDemoStore.getState().messages.filter((message) => message.kind === 'maturity-lookup')).toHaveLength(1);
  });

  it('does not duplicate concurrent lookups and ignores a result from a reset session', async () => {
    const store = useDemoStore.getState();
    const oldRequest = store.startMaturityChat();
    await store.startMaturityChat();
    expect(vi.getTimerCount()).toBe(1);
    store.selectPersona('B');
    const newRequest = store.startMaturityChat();
    await vi.runAllTimersAsync();
    await Promise.all([oldRequest, newRequest]);
    expect(useDemoStore.getState().maturityLookup).toMatchObject({ status: 'success', data: { customerName: '소원', principal: 50_000_000 } });
    expect(useDemoStore.getState().messages.some((message) => message.text.includes('양대건'))).toBe(false);
  });

  it('refreshes a setting changed during a lookup before acknowledging the result', async () => {
    const store = useDemoStore.getState();
    const request = store.startMaturityChat();
    store.setAutoRedeposit(false);
    await vi.runAllTimersAsync();
    await request;
    expect(useDemoStore.getState().maturityLookup).toMatchObject({ status: 'success', data: { autoRedeposit: false } });
    expect(useDemoStore.getState().messages.some((message) => message.text.includes('자동 재예치는 꺼져 있어요'))).toBe(true);
  });

  it('retrieves existing analysis for a customer who declines investment and keeps deposit-only choices', async () => {
    const store = useDemoStore.getState();
    store.setAnswers({ timing: 'OVER_3Y', purpose: 'SPARE' });
    const request = store.prepareChatOptions();
    await vi.runAllTimersAsync();
    await request;
    expect(useDemoStore.getState().investmentLookup).toMatchObject({ status: 'success', data: {
      investmentPreference: 'declines', portfolio: { allocations: [{ label: '예금·현금', percent: 100 }] },
    } });
    expect(useDemoStore.getState().messages.at(-1)?.text).toContain('예금만');
    expect(useDemoStore.getState().chatStep).toBe('closing');
  });

  it('retrieves the stored diagnosis without renewing an expired date', async () => {
    const store = useDemoStore.getState();
    store.selectPersona('B');
    store.setAnswers({ timing: 'OVER_3Y', purpose: 'SPARE' });
    const request = store.prepareChatOptions();
    expect(useDemoStore.getState().investmentLookup.status).toBe('loading');
    expect(useDemoStore.getState().chatStep).not.toBe('closing');
    await vi.runAllTimersAsync();
    await request;
    expect(useDemoStore.getState().investmentLookup).toMatchObject({ status: 'success', data: { riskProfile: '안정형', diagnosis: { state: 'expired' } } });
    expect(useDemoStore.getState().investmentLookup).toMatchObject({ status: 'success', data: { diagnosedAt: '2025-09-01' } });
    expect(useDemoStore.getState().invest.profile).toBe(false);
    expect(useDemoStore.getState().chatStep).toBe('closing');
  });

  it('blocks investment comparison on lookup failure and continues after a successful retry', async () => {
    const store = useDemoStore.getState();
    store.selectPersona('B');
    store.setAnswers({ timing: 'OVER_3Y', purpose: 'SPARE' });
    store.setLookupFailureOnce('investment');
    const failed = store.prepareChatOptions();
    await vi.runAllTimersAsync();
    await failed;
    expect(useDemoStore.getState().investmentLookup.status).toBe('error');
    expect(useDemoStore.getState().chatStep).not.toBe('closing');
    const retry = store.prepareChatOptions();
    await vi.runAllTimersAsync();
    await retry;
    expect(useDemoStore.getState().investmentLookup.status).toBe('success');
    expect(useDemoStore.getState().chatStep).toBe('closing');
  });

  it('retrieves Kim Jaewon’s existing aggressive diagnosis and external portfolio report', async () => {
    const store = useDemoStore.getState();
    store.selectPersona('A');
    const request = store.startMaturityChat();
    await vi.runAllTimersAsync();
    await request;
    const lookup = useDemoStore.getState().investmentLookup;
    expect(lookup).toMatchObject({ status: 'success', data: {
      riskProfile: '적극투자형', diagnosedAt: '2026-04-02', source: 'demo-profile-service',
      portfolio: { analyzedAt: '2026-10-15', allocations: [
        { label: '주식·ETF', percent: 65 }, { label: '채권', percent: 15 }, { label: '예금·현금', percent: 20 },
      ] },
    } });
    await store.fetchInvestmentContext();
    expect(useDemoStore.getState().investmentLookup).toBe(lookup);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('resets investment approvals when the product changes and records the selected securities product', () => {
    const store = useDemoStore.getState();
    store.selectPersona('A');
    store.selectProduct('woori-securities-rp-cma');
    store.markInvest('profile');
    store.markInvest('explain');
    store.selectProduct('won-sp500-etf');
    expect(useDemoStore.getState().invest.profile).toBe(false);
    expect(useDemoStore.getState().invest.explain).toBe(false);
    store.complete('invest');
    expect(useDemoStore.getState().completion?.productId).toBe('won-sp500-etf');
  });

  it('ignores an investment lookup that finishes after a customer reset', async () => {
    const store = useDemoStore.getState();
    store.selectPersona('B');
    store.setAnswers({ timing: 'OVER_3Y', purpose: 'SPARE' });
    const request = store.prepareChatOptions();
    store.selectPersona('D');
    await vi.runAllTimersAsync();
    await request;
    expect(useDemoStore.getState().investmentLookup.status).toBe('idle');
    expect(useDemoStore.getState().messages).toHaveLength(2);
    expect(useDemoStore.getState().chatStep).toBe('timing');
  });
});
