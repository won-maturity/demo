import { useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CurrentHeader, WonArt, WonCarousel, type WonSlide } from './WonCurrentUI';

const indices = [
  ['코스피', '5,211.43', '−0.53%'], ['코스닥', '686.98', '+2.90%'],
  ['코스피200', '808.55', '−0.71%'], ['S&P500 선물', '7,544.25', '−0.40%'],
];
const samples = ['삼성전자', 'SK하이닉스', '우리금융지주', '현대차'];
const stockSlides: WonSlide[] = [
  { title: <>돈으로 살 수 없는<br />AT마드리드 원정대 모집</>, detail: '우리투자증권 고객 응모 가능', art: 'presents', tone: 'sky', to: '/benefits/services/securities' },
  { title: '새로운 투자의 시작', detail: '우리투자증권', art: 'stock', tone: 'lilac', to: '/benefits/services/securities' },
  { title: '포트폴리오를 살펴보세요', detail: '우리WON포트폴리오', art: 'pie', tone: 'sky', to: '/banking/category/funds' },
  { title: '자산·소비 한눈에 보기', detail: '예시 자산 연결', art: 'house', tone: 'lilac', to: '/assets' },
];

export function StocksPage() {
  const [query, setQuery] = useState('');
  const visible = samples.filter((item) => item.toLowerCase().includes(query.trim().toLowerCase()));
  return <>
    <CurrentHeader title="주식" />
    <main className="won-scroll won-current-page">
      <section className="won-current-section won-stocks">
        <div className="won-horizontal won-stock-indices" aria-label="예시 시장 지수">
          {indices.map(([name, amount, change]) => <div key={name}>
            <small>{name}</small><strong>{amount}</strong><span className={change.startsWith('+') ? 'won-up' : 'won-down'}>{change}</span>
          </div>)}
        </div>
        <section className="won-stock-start">
          <p>내가 쓰는 은행이니까,</p><h2>주식도 안심하고 시작하세요!</h2>
          <WonArt kind="stock" />
          <Link className="won-current-primary" to="/benefits/services/securities">주식 시작하기</Link>
        </section>
        <WonCarousel slides={stockSlides} label="우리투자증권 추천 배너" />
        <label className="won-current-search"><Search size={21} aria-hidden /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="원하는 종목을 검색해보세요" aria-label="예시 종목 검색" /></label>
        <div className="won-current-list won-stock-results">
          {visible.map((item) => <Link key={item} to="/benefits/services/securities">{item}<ChevronRight size={17} aria-hidden /></Link>)}
          {!visible.length && <p>검색 결과가 없어요.</p>}
        </div>
      </section>
    </main>
  </>;
}
