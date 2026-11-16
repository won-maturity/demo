// 예약된 만기 계획(목적별 예금)을 고객 발화로 고치는 데모용 결정론적 해석기다.
// 바뀐 항목만 새 값으로 바꾸고, 나머지는 저장된 계획을 그대로 둔다.
// 결과는 기존 validateIntent 검증과 고객 확인을 그대로 거친다.

import { formatKoreanDate } from '../lib/format';
import { INTENT_PURPOSE_LABEL, detectPurpose, detectTime, parseMoney, type IntentItem, type Purpose } from './interpret';
import type { SplitLeg } from './split';

export type PlanRevision = {
  items: IntentItem[];
  changed: Purpose[];
  notes: string[];
};

const TIME_CUE = /\d{1,2}\s*월|봄|상반기|연말/;

function shiftYear(date: string, years: number): string {
  return `${Number(date.slice(0, 4)) + years}${date.slice(4)}`;
}

function resolveDate(segment: string, today: string, maturityDate: string, notes: string[], label: string) {
  const time = detectTime(segment, today);
  if (time.certainty === 'NEEDS_CONFIRM' && !time.dateRange) {
    return { timeText: time.timeText, certainty: 'NEEDS_CONFIRM' as const };
  }
  const vague = /봄|상반기|연말/.test(time.timeText);
  if (vague) {
    return { timeText: time.timeText, dateRange: time.dateRange, certainty: 'NEEDS_CONFIRM' as const };
  }
  let date = time.date ?? time.dateRange?.to;
  if (!date) return { timeText: time.timeText, certainty: 'NEEDS_CONFIRM' as const };
  // "6월"처럼 연도가 없고 만기일보다 이르면 다음 해로 본다.
  if (date <= maturityDate && !/올해|내년/.test(segment)) date = shiftYear(date, 1);
  if (date <= maturityDate) {
    notes.push(`${label} 날짜가 만기일보다 빨라서 다시 확인이 필요해요.`);
    return { timeText: '날짜 확인 필요', certainty: 'NEEDS_CONFIRM' as const };
  }
  if (!time.date) notes.push(`${label}는 날짜를 말씀하지 않으셔서 그 달 말일(${formatKoreanDate(date)})로 잡았어요.`);
  return { timeText: formatKoreanDate(date), date, certainty: 'CONFIRMED' as const };
}

export function revisePlan(
  legs: SplitLeg[],
  utterance: string,
  today: string,
  principal: number,
  maturityDate: string,
): PlanRevision | null {
  const items: IntentItem[] = legs.map((leg) => ({
    purpose: leg.purpose,
    amount: leg.amount,
    date: leg.date,
    timeText: formatKoreanDate(leg.date),
    certainty: 'CONFIRMED',
  }));
  const changed = new Set<Purpose>();
  const amountChanged = new Set<number>();
  const notes: string[] = [];

  for (const segment of utterance.split(/[,.]|그리고|나머지는/)) {
    const purpose = detectPurpose(segment);
    const index = items.findIndex((item) => item.purpose === purpose);
    if (!purpose || index < 0) continue;
    const label = INTENT_PURPOSE_LABEL[purpose];
    const current = items[index];
    const amount = parseMoney(segment);
    let next: IntentItem = { ...current };
    if (amount !== undefined && amount !== current.amount) {
      next.amount = amount;
      amountChanged.add(index);
    }
    if (TIME_CUE.test(segment)) {
      const resolved = resolveDate(segment, today, maturityDate, notes, label);
      next = { ...next, date: undefined, dateRange: undefined, ...resolved };
    }
    if (next.amount !== current.amount || next.date !== current.date || next.certainty !== current.certainty) {
      items[index] = next;
      changed.add(purpose);
    }
  }

  // 두 건 중 한 건의 금액만 바꾸면 나머지는 원금에 맞춰 자동으로 맞춘다.
  if (items.length === 2 && amountChanged.size === 1) {
    const [only] = [...amountChanged];
    const other = only === 0 ? 1 : 0;
    const rest = principal - (items[only].amount ?? 0);
    if (rest > 0 && rest !== items[other].amount) {
      items[other] = { ...items[other], amount: rest };
      changed.add(items[other].purpose);
      notes.push(`${INTENT_PURPOSE_LABEL[items[other].purpose]} 금액은 원금에 맞춰 ${rest.toLocaleString('ko-KR')}원으로 맞췄어요.`);
    }
  }

  if (changed.size === 0) return null;
  return { items, changed: [...changed], notes };
}

export function describePlanChanges(before: SplitLeg[], after: SplitLeg[]): string[] {
  const lines: string[] = [];
  for (const leg of after) {
    const prev = before.find((item) => item.purpose === leg.purpose);
    if (!prev) continue;
    if (prev.date !== leg.date) lines.push(`${leg.purposeLabel} 날짜 ${prev.date} → ${leg.date}`);
    if (prev.amount !== leg.amount) {
      lines.push(`${leg.purposeLabel} 금액 ${prev.amount.toLocaleString('ko-KR')}원 → ${leg.amount.toLocaleString('ko-KR')}원`);
    }
  }
  return lines;
}
