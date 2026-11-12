import { describe, expect, it } from 'vitest';
import { EXAMPLE_UTTERANCES, mockInterpret, validateIntent } from './interpret';
import { DEMO_TODAY } from '../mock/personas';

describe('mockInterpret', () => {
  it('splits the highlight sentence into tuition and moving money', () => {
    const result = mockInterpret(EXAMPLE_UTTERANCES[0], DEMO_TODAY);
    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toMatchObject({ purpose: 'TUITION', amount: 15_000_000, certainty: 'CONFIRMED', date: '2027-05-20' });
    expect(result.items[1]).toMatchObject({ purpose: 'MOVING', amount: 15_000_000, certainty: 'NEEDS_CONFIRM', timeText: '내년 봄쯤' });
  });

  it('asks for a day when only a month is given instead of inventing the twentieth', () => {
    const result = mockInterpret('3천만 원 중 반은 내년 5월 아이 학비, 나머지는 이사 가서 내년 봄쯤 쓸 것 같아요', DEMO_TODAY);
    expect(result.items[0]).toMatchObject({ certainty: 'NEEDS_CONFIRM', dateRange: { from: '2027-05-01', to: '2027-05-31' } });
    expect(result.items[0]?.date).toBeUndefined();
  });

  it('preserves an explicit use day and rejects an impossible calendar date', () => {
    expect(mockInterpret('내년 5월 28일 학비', DEMO_TODAY).items[0]?.date).toBe('2027-05-28');
    expect(mockInterpret('내년 2월 30일 학비', DEMO_TODAY).items[0]?.certainty).toBe('NEEDS_CONFIRM');
    expect(mockInterpret('내년 2월 30일 학비', DEMO_TODAY).items[0]?.date).toBeUndefined();
  });

  it('keeps a vague moving plan unconfirmed', () => {
    const result = mockInterpret(EXAMPLE_UTTERANCES[1], DEMO_TODAY);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.purpose).toBe('MOVING');
    expect(result.items[0]?.certainty).toBe('NEEDS_CONFIRM');
  });

  it('reads spare money that will sit for years', () => {
    const result = mockInterpret(EXAMPLE_UTTERANCES[2], DEMO_TODAY);
    expect(result.items[0]?.purpose).toBe('SPARE');
    expect(result.items[0]?.timeText).toBe('몇 년');
    expect(result.items[0]?.certainty).toBe('NEEDS_CONFIRM');
  });
});

describe('validateIntent', () => {
  it('marks items for confirmation when the amounts do not add up to the principal', () => {
    const parsed = mockInterpret(EXAMPLE_UTTERANCES[0], DEMO_TODAY);
    const checked = validateIntent(parsed, 20_000_000);
    expect(checked.fixes.length).toBeGreaterThan(0);
    expect(checked.result.items.every((item) => item.certainty === 'NEEDS_CONFIRM')).toBe(true);
  });

  it('leaves a matching tuition item confirmed', () => {
    const parsed = mockInterpret(EXAMPLE_UTTERANCES[0], DEMO_TODAY);
    const checked = validateIntent(parsed, 30_000_000);
    expect(checked.fixes).toEqual([]);
    expect(checked.result.items[0]?.certainty).toBe('CONFIRMED');
  });
});
