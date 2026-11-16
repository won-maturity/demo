import { CalendarClock } from 'lucide-react';
import { formatDotDate, formatWon } from '../../lib/format';
import type { MaturityPlan } from '../../store/useDemoStore';

/** 예약된 만기 계획을 보여 주는 카드. 채팅 안 조회 카드와 계획 보기 화면에서 함께 쓴다. */
export function PlanCard({ plan }: { plan: MaturityPlan }) {
  return (
    <section className="won-bank-lookup" aria-label="예약된 만기 계획">
      <header><CalendarClock size={17} aria-hidden /><h2>예약된 만기 계획</h2><small>시연 데이터</small></header>
      <dl>
        {plan.legs.map((leg) => (
          <div key={leg.purpose}>
            <dt>{leg.purposeLabel}<small>{leg.productName}</small></dt>
            <dd>{formatWon(leg.amount)} · {formatDotDate(leg.date)}</dd>
          </div>
        ))}
        <div><dt>실행 예정일</dt><dd>{formatDotDate(plan.executeOn)}</dd></div>
      </dl>
      <p className="won-bank-lookup-source">승인 {plan.approvedAt.replace(/-/g, '.')} · 만기일 전까지 바꿀 수 있어요</p>
    </section>
  );
}
