import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
    expect(state.messages.at(-1)?.text).toContain('자동 재예치는 켜져 있어요');
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
    expect(useDemoStore.getState().maturityLookup).toMatchObject({ status: 'success', data: { customerName: '이서연', principal: 50_000_000 } });
    expect(useDemoStore.getState().messages.some((message) => message.text.includes('양대건'))).toBe(false);
  });

  it('refreshes a setting changed during a lookup before acknowledging the result', async () => {
    const store = useDemoStore.getState();
    const request = store.startMaturityChat();
    store.setAutoRedeposit(false);
    await vi.runAllTimersAsync();
    await request;
    expect(useDemoStore.getState().maturityLookup).toMatchObject({ status: 'success', data: { autoRedeposit: false } });
    expect(useDemoStore.getState().messages.at(-1)?.text).toContain('자동 재예치는 꺼져 있어요');
  });

  it('does not query investment information for a deposit-only comparison', async () => {
    const store = useDemoStore.getState();
    store.setAnswers({ timing: 'OVER_3Y', purpose: 'SPARE' });
    await store.prepareChatOptions();
    expect(useDemoStore.getState().investmentLookup.status).toBe('idle');
    expect(useDemoStore.getState().chatStep).toBe('closing');
  });

  it('queries the registered investment profile when needed and reports an expired diagnosis', async () => {
    const store = useDemoStore.getState();
    store.selectPersona('B');
    store.setAnswers({ timing: 'OVER_3Y', purpose: 'SPARE' });
    const request = store.prepareChatOptions();
    expect(useDemoStore.getState().investmentLookup.status).toBe('loading');
    expect(useDemoStore.getState().chatStep).not.toBe('closing');
    await vi.runAllTimersAsync();
    await request;
    expect(useDemoStore.getState().investmentLookup).toMatchObject({ status: 'success', data: { riskProfile: '안정추구형', diagnosis: { state: 'expired' } } });
    expect(useDemoStore.getState().messages.some((message) => message.text.includes('재진단이 필요해요'))).toBe(true);
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
