import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatComma, formatWon } from '../../lib/format';
import { BankingHeader, Segmented } from './BankingShell';
import { expensesByMonth, type Expense } from './data';

const sampleYear = 2024;
const startingMonth = 9;
const firstMonth = 8;
const lastMonth = 10;
const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
const views = [{ value: 'calendar', label: '달력' }, { value: 'budget', label: '예산' }] as const;

function sum(expenses: Expense[]) {
  return expenses.reduce((total, item) => total + item.amount, 0);
}

export function SpendingPage() {
  const [mode, setMode] = useState<'overview' | 'analysis'>('overview');
  const [view, setView] = useState<'calendar' | 'budget'>('calendar');
  const [month, setMonth] = useState(startingMonth);
  const [selectedDay, setSelectedDay] = useState(31);
  const monthExpenses = expensesByMonth[month] ?? [];
  const dayExpenses = monthExpenses.filter(({ day }) => day === selectedDay);
  const total = sum(monthExpenses);
  const previous = expensesByMonth[month - 1];
  const firstWeekday = new Date(sampleYear, month, 1).getDay();
  const daysInMonth = new Date(sampleYear, month + 1, 0).getDate();
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const categories = Array.from(new Set(monthExpenses.map(({ category }) => category)));

  function changeMonth(offset: number) {
    setMonth(month + offset);
    setSelectedDay(1);
  }

  return (
    <>
      <BankingHeader title="소비" />
      <div className="won-top-tabs won-top-tabs--bold" role="group" aria-label="소비 보기">
        <button type="button" aria-pressed={mode === 'overview'} onClick={() => setMode('overview')}>현황</button>
        <button type="button" aria-pressed={mode === 'analysis'} onClick={() => setMode('analysis')}>분석</button>
      </div>
      <main className="won-scroll won-page">
        <section className="won-panel won-spending">
          <div className="won-spending-toolbar">
            <span className="won-muted">2024.10.31 15:15</span>
            {mode === 'overview' && <Segmented<'calendar' | 'budget'> label="지출 현황 형식" options={views} value={view} onChange={setView} />}
          </div>
          <div className="won-month-picker">
            <button type="button" disabled={month === firstMonth} onClick={() => changeMonth(-1)} aria-label="이전 달"><ChevronLeft size={18} /></button>
            <h2>{month + 1}월</h2>
            <button type="button" disabled={month === lastMonth} onClick={() => changeMonth(1)} aria-label="다음 달"><ChevronRight size={18} /></button>
          </div>
          <p className="won-large-amount">{formatWon(total)}</p>
          {previous && <p className="won-spending-previous">지난 달에는 <strong className="won-negative">{formatWon(sum(previous))}</strong> 사용했어요</p>}

          {mode === 'analysis' ? (
            <div className="won-spending-summary">
              <h3>항목별 지출</h3>
              {categories.length === 0 && <p className="won-muted">이 달의 예시 지출이 없어요.</p>}
              {categories.map((category) => {
                const amount = sum(monthExpenses.filter((item) => item.category === category));
                return (
                  <div className="won-budget-row" key={category}>
                    <div><span>{category}</span><strong>{formatWon(amount)}</strong></div>
                    <progress max={total} value={amount} aria-label={`${category} 지출 비중`} />
                  </div>
                );
              })}
            </div>
          ) : view === 'budget' ? (
            <div className="won-spending-summary won-budget-row">
              <h3>이달의 예산</h3>
              <div><span>사용한 금액</span><strong>{formatWon(total)}</strong></div>
              <progress max={1_500_000} value={total} aria-label="예시 예산 대비 지출" />
              <p className="won-muted">예산 {formatWon(1_500_000)} · {total > 1_500_000 ? `${formatWon(total - 1_500_000)} 초과` : `${formatWon(1_500_000 - total)} 남음`}</p>
            </div>
          ) : (
            <div className="won-calendar" aria-label={`${month + 1}월 지출 달력`}>
              {weekdays.map((weekday, index) => <span key={weekday} className={index === 0 ? 'won-negative' : ''}>{weekday}</span>)}
              {Array.from({ length: cellCount }, (_, index) => {
                const day = index - firstWeekday + 1;
                const isCurrent = day > 0 && day <= daysInMonth;
                const amount = isCurrent ? sum(monthExpenses.filter((item) => item.day === day)) : 0;
                const displayDay = new Date(sampleYear, month, day).getDate();
                return isCurrent ? (
                  <button
                    key={index}
                    type="button"
                    className={index % 7 === 0 ? 'won-calendar-sunday' : undefined}
                    aria-pressed={day === selectedDay}
                    aria-label={`${month + 1}월 ${day}일, 지출 ${formatWon(amount)}`}
                    onClick={() => setSelectedDay(day)}
                  >
                    <strong>{displayDay}</strong>
                    {amount > 0 && <small>{formatComma(amount)}</small>}
                  </button>
                ) : <span key={index} aria-hidden="true" className="won-calendar-other">{displayDay}</span>;
              })}
            </div>
          )}
        </section>
        {mode === 'overview' && view === 'calendar' && (
          <section className="won-panel won-day-expenses">
            <h2>{month + 1}월 {selectedDay}일 지출</h2>
            {dayExpenses.length ? (
              <dl className="won-amount-list">{dayExpenses.map((item) => <div key={item.name}><dt>{item.name}</dt><dd>{formatWon(item.amount)}</dd></div>)}</dl>
            ) : <p className="won-muted">이날의 지출이 없어요.</p>}
          </section>
        )}
      </main>
    </>
  );
}
