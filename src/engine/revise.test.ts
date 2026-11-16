import { describe, expect, it } from 'vitest';
import { describePlanChanges, revisePlan } from './revise';
import { buildSplitPlan, type SplitLeg } from './split';

const TODAY = '2026-10-22';
const MATURITY = '2026-11-21';
const PRINCIPAL = 30_000_000;

const legs = buildSplitPlan([
  { purpose: 'TUITION', amount: 15_000_000, date: '2027-05-20', timeText: '', certainty: 'CONFIRMED' },
  { purpose: 'MOVING', amount: 15_000_000, date: '2027-03-31', timeText: '', certainty: 'CONFIRMED' },
]) as SplitLeg[];

describe('revisePlan', () => {
  it('moves only the mentioned date and uses month end when no day is given', () => {
    const revision = revisePlan(legs, '이사가 내년 6월 말로 미뤄졌어요', TODAY, PRINCIPAL, MATURITY);
    expect(revision?.changed).toEqual(['MOVING']);
    expect(revision?.items).toMatchObject([
      { purpose: 'TUITION', amount: 15_000_000, date: '2027-05-20', certainty: 'CONFIRMED' },
      { purpose: 'MOVING', amount: 15_000_000, date: '2027-06-30', certainty: 'CONFIRMED' },
    ]);
    expect(revision?.notes.join(' ')).toContain('말일');
  });

  it('keeps an exact day and assumes next year when the month has passed', () => {
    const revision = revisePlan(legs, '학비는 3월 2일에 내요', TODAY, PRINCIPAL, MATURITY);
    expect(revision?.items[0]).toMatchObject({ purpose: 'TUITION', date: '2027-03-02', certainty: 'CONFIRMED' });
  });

  it('balances the other leg when one amount changes', () => {
    const revision = revisePlan(legs, '학비는 2천만 원 필요해요', TODAY, PRINCIPAL, MATURITY);
    expect(revision?.items.map((item) => item.amount)).toEqual([20_000_000, 10_000_000]);
    expect(revision?.changed).toEqual(['TUITION', 'MOVING']);
  });

  it('asks again for a vague time instead of guessing', () => {
    const revision = revisePlan(legs, '이사는 내년 상반기쯤이요', TODAY, PRINCIPAL, MATURITY);
    expect(revision?.items[1]).toMatchObject({ purpose: 'MOVING', certainty: 'NEEDS_CONFIRM' });
  });

  it('returns null when nothing in the plan changes', () => {
    expect(revisePlan(legs, '그냥 확인만 할게요', TODAY, PRINCIPAL, MATURITY)).toBeNull();
  });

  it('describes date and amount changes for the record', () => {
    const after = legs.map((leg) => (leg.purpose === 'MOVING' ? { ...leg, date: '2027-06-30' } : leg));
    expect(describePlanChanges(legs, after)).toEqual(['이사 날짜 2027-03-31 → 2027-06-30']);
  });
});
