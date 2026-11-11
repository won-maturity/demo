import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { formatWon } from '../../lib/format';
import { BankMark, AccountCard } from './AccountCards';
import { BankingHeader, Segmented, useBankingCustomer, useOpenMaturity } from './BankingShell';
import { getAccounts, monthlySavings } from './data';

export function AssetsPage() {
  const { persona } = useBankingCustomer();
  return (
    <>
      <BankingHeader title="자산" />
      <main className="won-scroll won-page">
        <div className="won-section-heading">
          <h2>전체 계좌</h2>
          <div>
            <Link to="/savings" className="won-pill">저축진단 <ChevronRight size={14} aria-hidden /></Link>
            <Link to="/spending" className="won-pill">소비 <ChevronRight size={14} aria-hidden /></Link>
          </div>
        </div>
        <section className="won-account-list" aria-label="금융 계좌">
          {getAccounts(persona).map((account) => <AccountCard key={account.id} account={account} />)}
        </section>
      </main>
    </>
  );
}

export function AccountPage() {
  const { accountId } = useParams();
  const [params] = useSearchParams();
  const { persona } = useBankingCustomer();
  const openMaturity = useOpenMaturity();
  const account = getAccounts(persona).find((item) => item.id === accountId);

  if (!account) return <Navigate to="/assets" replace />;
  const actionView = params.get('action') === '1' && ['이체', '추가입금'].includes(account.action);

  return (
    <>
      <BankingHeader title={actionView ? account.action : '계좌 상세'} backTo={actionView ? `/assets/accounts/${account.id}` : '/assets'} centered />
      <main className="won-scroll won-page">
        <section className="won-panel won-account-info">
          <BankMark brand={account.brand} />
          <h2>{account.name}</h2>
          <p className="won-muted">{account.number}</p>
          <strong className="won-large-amount">{formatWon(account.amount)}</strong>
          {account.detail && <p>{account.detail}</p>}
          {account.id === 'maturity' && <button className="won-main-action" type="button" onClick={openMaturity}>WON하는 만기</button>}
          {actionView && <p className="won-info-note">이 계좌의 {account.action} 화면은 예시입니다. 실제 거래는 실행되지 않아요.</p>}
        </section>
      </main>
    </>
  );
}

const periods = [{ value: 6, label: '6개월' }, { value: 12, label: '12개월' }] as const;

export function SavingsPage() {
  const [period, setPeriod] = useState<6 | 12>(6);
  const savings = monthlySavings.slice(-(period + 1));
  const first = savings[0].amount;
  const last = savings[savings.length - 1].amount;
  const growth = last - first;
  const points = savings.map(({ amount }, index) => ({
    x: 22 + index * (286 / period),
    y: 147 - ((amount - first) / growth) * 111,
  }));
  const path = points.map(({ x, y }) => `${x},${y}`).join(' ');
  const periodName = period === 6 ? '반년' : '1년';

  return (
    <div className="won-white-page">
      <BankingHeader title="저축진단" backTo="/assets" centered />
      <main className="won-scroll won-page won-savings">
        <section>
          <h2 className="won-muted">현재 저축금액</h2>
          <p className="won-large-amount">{formatWon(last)}</p>
          <p>지난 달 보다 <strong className="won-negative">{formatWon(last - monthlySavings[monthlySavings.length - 2].amount)}</strong> 늘었어요</p>
        </section>
        <section className="won-savings-trend">
          <h2>지난 <em>{periodName}</em> 동안<br /><em>{formatWon(growth)}</em>을 모았어요</h2>
          <figure>
            <svg viewBox="0 0 330 166" role="img" aria-label={`${period}개월 저축금액이 ${formatWon(first)}에서 ${formatWon(last)}으로 증가`}>
              {[13, 51, 89, 127, 165].map((y) => <line key={y} x1="0" y1={y} x2="330" y2={y} className="won-chart-grid" />)}
              <polygon points={`22,165 ${path} 308,165`} className="won-chart-area" />
              <line x1="0" y1="36" x2="330" y2="36" className="won-chart-guide" />
              <line x1="0" y1="147" x2="330" y2="147" className="won-chart-guide" />
              <polyline points={path} className="won-chart-line" />
              {points.map(({ x, y }) => <circle key={x} cx={x} cy={y} r="3.6" className="won-chart-dot" />)}
              <rect x="1" y="23" width="77" height="12" rx="3" className="won-chart-tag" />
              <text x="4" y="32" className="won-chart-label">{formatWon(last)}</text>
              <rect x="254" y="148" width="75" height="14" rx="3" className="won-chart-tag" />
              <text x="258" y="158" className="won-chart-label">{formatWon(first)}</text>
            </svg>
            <figcaption className="won-chart-months" aria-hidden="true">
              {savings.map(({ label }, index) => (
                <span key={label}>{period === 6 || index % 2 === 0 ? label : ''}</span>
              ))}
            </figcaption>
          </figure>
          <Segmented<6 | 12> label="저축 기간" options={periods} value={period} onChange={setPeriod} />
        </section>
        <section className="won-savings-average">
          <h2>지난 {periodName} 동안, 월평균<br /><em>{formatWon(growth / period)}</em>을 모았어요</h2>
        </section>
      </main>
    </div>
  );
}
