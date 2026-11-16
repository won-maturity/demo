import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { DATE_CHIPS } from '../../mock/chatScripts';
import type { IntentItem } from '../../engine/interpret';
import { INTENT_PURPOSE_LABEL } from '../../engine/interpret';
import { formatKoreanDate, formatManWon } from '../../lib/format';

const SPRING_CHIPS = [
  { label: '3월 말', date: '2027-03-31' },
  { label: '4월 말', date: '2027-04-30' },
  { label: '5월 말', date: '2027-05-31' },
];

export function InterpretCard({
  items,
  notes,
  pickingIndex,
  onPickDate,
  onPickTiming,
  onAskCustomDate,
  previous,
}: {
  /** 계획을 고칠 때 저장된 이전 값. 바뀐 항목에 "변경 전"을 함께 보여 준다. */
  previous?: { purpose: IntentItem['purpose']; amount: number; date: string }[];
  items: IntentItem[];
  notes: string[];
  pickingIndex: number | null;
  onPickDate: (index: number, date: string) => void;
  onPickTiming: (index: number, label: string) => void;
  onAskCustomDate: (index: number) => void;
}) {
  return (
    <Card>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge tone="ai">AI 응답</Badge>
        <p className="text-sm font-bold text-textStrong">{previous ? '바뀐 계획' : 'AI 해석 결과'}</p>
      </div>
      <ul className="space-y-3">
        {items.map((item, index) => {
          const before = previous?.find((leg) => leg.purpose === item.purpose);
          const changed = before && (before.amount !== item.amount || before.date !== item.date);
          return (
          <li key={`${item.purpose}-${index}`}>
            {changed ? (
              <p className="text-[13px] leading-5 text-textWeak">
                <Badge tone="caution">변경</Badge>{' '}
                <span className="line-through">
                  {INTENT_PURPOSE_LABEL[item.purpose]} · {formatManWon(before.amount)} · {formatKoreanDate(before.date)}
                </span>
              </p>
            ) : null}
            <p className={`text-sm leading-6 text-textStrong${changed ? ' font-bold' : ''}`}>
              {INTENT_PURPOSE_LABEL[item.purpose]} · {item.amount ? formatManWon(item.amount) : '금액 미정'} ·{' '}
              {item.date ? formatKoreanDate(item.date) : item.timeText} · {item.certainty === 'CONFIRMED' ? '확실' : '확인 필요'}
            </p>
            {item.certainty === 'NEEDS_CONFIRM' && /봄/.test(item.timeText) ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {SPRING_CHIPS.map((chip) => (
                  <Chip key={chip.date} label={chip.label} onClick={() => onPickDate(index, chip.date)} />
                ))}
                <Chip label="직접 고를게요" onClick={() => onAskCustomDate(index)} />
              </div>
            ) : null}
            {item.certainty === 'NEEDS_CONFIRM' && item.timeText === '몇 년' ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {['1년 안', '1~3년', '3년 이상'].map((label) => (
                  <Chip key={label} label={label} onClick={() => onPickTiming(index, label)} />
                ))}
              </div>
            ) : null}
            {item.certainty === 'NEEDS_CONFIRM' && !/봄/.test(item.timeText) && item.timeText !== '몇 년' && pickingIndex !== index
              ? <div className="mt-2"><Chip label="사용 날짜 확인하기" onClick={() => onAskCustomDate(index)} /></div>
              : null}
            {pickingIndex === index ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {DATE_CHIPS.filter((chip) => chip.id !== 'unknown').map((chip) => (
                  <Chip key={chip.id} label={chip.label} onClick={() => onPickDate(index, chip.id)} />
                ))}
              </div>
            ) : null}
          </li>
          );
        })}
      </ul>
      {notes.map((note) => (
        <p key={note} className="mt-3 text-[13px] leading-5 text-textBody">
          {note}
        </p>
      ))}
      <p className="mt-3 text-[12px] leading-5 text-textWeak">AI가 이해한 내용이에요. 상품은 규칙에 따라 골라요.</p>
    </Card>
  );
}
