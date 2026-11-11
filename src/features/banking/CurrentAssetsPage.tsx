import { useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatWon } from '../../lib/format';
import { useBankingCustomer } from './BankingShell';
import { getAccounts } from './data';
import { CurrentHeader } from './WonCurrentUI';

export function CurrentAssetsPage() {
  const [connected, setConnected] = useState(false);
  const { persona } = useBankingCustomer();
  const accounts = getAccounts(persona);
  const loans = accounts.filter(({ id }) => id === 'hana' || id === 'kakao');
  const deposits = accounts.filter((account) => !loans.includes(account));
  const total = (items: typeof accounts) => formatWon(items.reduce((amount, account) => amount + account.amount, 0));
  const rows = [
    ['입출금/저축', total(deposits)],
    ['투자', '0원'], ['연금/보험', '0원'], ['부동산/자동차', '미포함'],
    ['대출', total(loans)],
  ];
  return <>
    <CurrentHeader title="자산·소비">
      <button type="button" className="won-assets-connect-small" onClick={() => setConnected(!connected)} aria-pressed={connected}>{connected ? '연결해제' : '+자산연결'}</button>
    </CurrentHeader>
    <main className="won-scroll won-current-assets">
      <section className="won-current-section">
        <section className="won-assets-hero">
          <p>자산 분석부터 투자·지출까지 한 번에 관리해보세요</p>
          <h2>내 금융, 더 잘 키울 수 있어요</h2>
          <div className="won-assets-mini">
            <div className="won-assets-mini-heading"><span>총 자산</span><span>금액숨김 <i /></span></div>
            <div className="won-assets-mini-total"><i>₩</i><strong>{connected ? rows[0][1] : <>**,<em>***,**</em>*원</>}</strong><ChevronRight size={17} /></div>
            <dl>{rows.map(([label, amount], index) => <div key={label}>
              <dt>{label}{index === 3 && <small>미포함</small>}</dt>
              <dd>{connected ? amount : index === 4 ? <em>금액확인</em> : '*,***,***원'} <ChevronRight size={13} /></dd>
            </div>)}</dl>
            <div className="won-assets-mini-note">{connected ? '시연 자산이 연결됐어요' : '연결 안 된 자산(4개)를 연결해보세요'}</div>
          </div>
          {connected ? <Link className="won-assets-link" to="/assets/accounts">전체 계좌 확인하기</Link> :
            <button className="won-assets-link" type="button" onClick={() => setConnected(true)}>+자산 연결하고 시작하기</button>}
        </section>
        <section className="won-assets-compare">
          <h2>비슷한 사람들과 비교해<br />내 자산 수준을 확인할 수 있어요</h2>
          <div className="won-assets-gauge" aria-hidden>
            <svg viewBox="0 0 220 120">
              <path d="M 9 107 A 101 101 0 0 1 211 107" pathLength="100" fill="none" stroke="#dde7f1" strokeWidth="11" strokeLinecap="round" />
              <path d="M 9 107 A 101 101 0 0 1 211 107" pathLength="100" fill="none" stroke="#40a3f2" strokeWidth="11" strokeLinecap="round" strokeDasharray="23 5 21 5 21 50" />
            </svg>
            <div><small>상위 **%</small><strong>*억 *,***만원</strong></div>
          </div>
          {connected ? <Link className="won-assets-compare-link" to="/savings">저축진단으로 확인하기 <ArrowRight size={17} /></Link> :
            <button type="button" className="won-assets-compare-link" onClick={() => setConnected(true)}>자산 연결하고 확인해보세요 <ArrowRight size={17} /></button>}
        </section>
        <div className="won-assets-shortcuts">
          <Link to="/assets/accounts">전체계좌보기 <ChevronRight size={17} /></Link>
          <Link to="/spending">소비 내역 <ChevronRight size={17} /></Link>
          <Link to="/savings">저축진단 <ChevronRight size={17} /></Link>
        </div>
      </section>
    </main>
  </>;
}
