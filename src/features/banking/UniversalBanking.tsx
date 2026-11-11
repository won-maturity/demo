import { useState } from 'react';
import { ChevronDown, ChevronRight, CreditCard } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { formatWon } from '../../lib/format';
import { BankingHeader, ServiceRow } from './BankingShell';

const categories = ['꿀머니', '카드', '캐피탈', '증권', '저축은행'] as const;
type Category = (typeof categories)[number];

const categoriesInfo: Record<Exclude<Category, '카드'>, { label: string; amount: number; detail: string; to: string }> = {
  꿀머니: { label: '보유 꿀머니', amount: 12_000, detail: '나의 카드 혜택을 확인해보세요.', to: '/benefits' },
  캐피탈: { label: '중고차 다이렉트 잔액', amount: 8_400_000, detail: '연결된 계좌의 잔액을 확인해보세요.', to: '/assets/accounts/hana' },
  증권: { label: '예시 투자 자산', amount: 2_400_000, detail: '주식·채권 매매 서비스 안내를 확인해보세요.', to: '/benefits/services/securities' },
  저축은행: { label: '예시 저축금액', amount: 11_500_000, detail: '저축 흐름을 확인해보세요.', to: '/savings' },
};

const bill = [
  { title: '일시불', amount: 523_000 },
  { title: '할부', amount: 205_000 },
];
const billTotal = bill.reduce((total, item) => total + item.amount, 0);

export function UniversalBankingPage() {
  const [active, setActive] = useState<Category>('카드');

  return (
    <>
      <BankingHeader title="유니버설뱅킹" centered />
      <div className="won-top-tabs won-top-tabs--line" role="group" aria-label="금융 서비스">
        {categories.map((category) => <button type="button" key={category} aria-pressed={active === category} onClick={() => setActive(category)}>{category}</button>)}
      </div>
      <main className="won-scroll won-page won-universal">
        {active === '카드' ? (
          <>
            <section className="won-statement">
              <div className="won-statement-heading">
                <h2>1월 이용대금명세서</h2>
                <Link to="/banking/card/statement" className="won-pill">상세보기</Link>
              </div>
              <p>{formatWon(billTotal)}</p>
              <div className="won-card-art" aria-hidden>
                <i /><b /><span><CreditCard size={26} /></span>
              </div>
              <Link className="won-statement-action" to="/banking/card/payment"><span aria-hidden>₩</span> 즉시결제</Link>
            </section>
            <Link className="won-section-link" to="/banking/card/rewards">실적을 조회해 보세요 <ChevronRight size={20} /></Link>
            <section className="won-panel won-rewards">
              <details open>
                <summary>
                  <span className="won-mini-card"><CreditCard size={16} aria-hidden /></span>
                  <span><small><b>본인</b> 0123</small><strong>카드의정석 Dear, Traveler</strong></span>
                  <ChevronDown size={18} aria-hidden />
                </summary>
                <p>10월에는 12,000원<br />혜택을 받았어요!</p>
              </details>
            </section>
          </>
        ) : (
          <section className="won-panel won-category">
            <h2>{categoriesInfo[active].label}</h2>
            <p className="won-large-amount">{formatWon(categoriesInfo[active].amount)}</p>
            <div className="won-service-list">
              <ServiceRow icon={CreditCard} title="상세 보기" detail={categoriesInfo[active].detail} to={categoriesInfo[active].to} />
            </div>
          </section>
        )}
      </main>
    </>
  );
}

const cardTitles = { statement: '이용대금명세서', payment: '즉시결제', rewards: '카드 실적' };

export function CardDetailsPage() {
  const { view } = useParams();
  if (view !== 'statement' && view !== 'payment' && view !== 'rewards') return <Navigate to="/banking/universal" replace />;
  const rewards = view === 'rewards';

  return (
    <>
      <BankingHeader title={cardTitles[view]} backTo="/banking/universal" centered />
      <main className="won-scroll won-page">
        <section className="won-panel won-account-info">
          <h2>{rewards ? '10월 카드 혜택' : '1월 결제 예정 금액'}</h2>
          <p className="won-large-amount">{formatWon(rewards ? 12_000 : billTotal)}</p>
          {view === 'payment' ? <p className="won-info-note">시연용 결제 화면이에요. 실제 결제는 실행되지 않아요.</p> : (
            <dl className="won-amount-list">
              {(rewards ? [{ title: '카드 할인 혜택', amount: 12_000 }] : bill).map((item) => (
                <div key={item.title}><dt>{item.title}</dt><dd>{formatWon(item.amount)}</dd></div>
              ))}
            </dl>
          )}
        </section>
      </main>
    </>
  );
}
