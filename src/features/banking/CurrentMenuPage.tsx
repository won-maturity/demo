import { useState } from 'react';
import { BadgeCheck, Banknote, ChevronLeft, CreditCard, FileBadge2, Search, Shield, UserCircle, X } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { BankingHeader, useBankingCustomer } from './BankingShell';
import { productCategories, productLabels } from './ProductMallPage';

const quick = [
  ['인증/보안', Shield, '/menu/service/security'],
  ['증명서/서류', FileBadge2, '/benefits/services/documents'],
  ['환전주머니', Banknote, '/benefits/services/exchange'],
  ['전담직원', UserCircle, '/menu/service/staff'],
] as const;

const sections = [
  { label: '이체/출금', icon: Banknote, links: [
    ['즉시/예약이체', '/assets/accounts/won?action=1'], ['다건이체', '/menu/service/multi-transfer'], ['자동이체 등록/관리', '/menu/service/auto-transfer'],
    ['이체내역조회', '/menu/service/history'], ['이체관리', '/menu/service/transfers'], ['더치페이', '/menu/service/split-pay'],
    ['ATM/영업점 출금', '/menu/service/withdraw'], ['착오송금반환', '/menu/service/return-transfer'],
  ] },
  { label: '계좌조회/관리', icon: CreditCard, links: [
    ['전체계좌조회', '/assets/accounts'], ['자산·소비', '/assets'], ['저축진단', '/savings'], ['소비 내역', '/spending'],
  ] },
  { label: '금융상품/상담', icon: BadgeCheck, links: [
    ['상품몰', '/banking'], ['우리금융그룹 상품', '/banking/affiliates'], ['주식', '/stocks'], ['혜택', '/benefits'], ['유니버설뱅킹', '/banking/universal'],
    ['AI챗봇', '/maturity/chat'], ['WON하는 만기', '/maturity'], ['알림', '/notifications'],
  ] },
  { label: '시연 메뉴', icon: UserCircle, links: [
    ['바탕화면 알림 시연', '/demo/phone'], ['시연 고객 및 엔진 패널', '/demo'], ['수익성 시뮬레이터', '/simulator'], ['무응답 시뮬레이션', '/navi/no-response'],
  ] },
];

export function CurrentMenuPage() {
  const [query, setQuery] = useState('');
  const { name } = useBankingCustomer();
  const normalized = (text: string) => text.toLowerCase().replace(/\s+/g, '');
  const groups = query.trim() ? [
    ...sections,
    { label: '빠른 메뉴', icon: Shield, links: quick.map(([label, , to]) => [label, to]) },
    { label: '상품 카테고리', icon: CreditCard, links: productCategories.map(([label, , , to]) => [label, to]) },
  ] : sections;
  const matches = groups.map((section) => ({ ...section, links: section.links.filter(([label]) => normalized(label).includes(normalized(query))) }));
  return (
    <main className="won-scroll won-current-menu">
      <header className="won-current-menu-top">
        <div className="won-current-menu-heading">
          <Link to="/home" aria-label="뒤로 가기"><ChevronLeft size={24} /></Link>
          <h1><Link to="/demo" aria-label={`${name}님, 시연 고객 선택`}>로그인해 주세요</Link></h1>
        </div>
        <label className="won-current-search"><Search size={22} aria-hidden /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="메뉴, 상품 등을 검색해 보세요" aria-label="메뉴 검색" />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="검색어 지우기"><X size={17} /></button>}
        </label>
        {!query.trim() && <nav className="won-current-menu-quick" aria-label="빠른 메뉴">
          {quick.map(([label, Icon, to]) => <Link key={label} to={to}><Icon size={22} aria-hidden /><span>{label}</span></Link>)}
        </nav>}
      </header>
      <div className="won-current-menu-list">
        {matches.filter((section) => section.links.length).map(({ label, icon: Icon, links }) => <section key={label}>
          <h2><Icon size={18} aria-hidden />{label}</h2>
          <ul>{links.map(([title, to]) => <li key={title}><Link to={to} state={to === '/maturity/chat' ? { fromBanking: '/menu' } : undefined}>{title}</Link></li>)}</ul>
        </section>)}
        {!matches.some((section) => section.links.length) && <p className="py-5 text-textWeak">검색 결과가 없어요.</p>}
      </div>
    </main>
  );
}

export function CatalogInfoPage({ kind }: { kind: 'menu' | 'product' }) {
  const { item } = useParams();
  const isProduct = kind === 'product';
  const back = isProduct ? '/banking' : '/menu';
  const quickLink = quick.find(([, , path]) => path === `/menu/service/${item}`);
  const label = isProduct ? (item === 'cart' ? '상품 장바구니' : productLabels[item ?? ''])
    : (quickLink?.[0] ?? sections.flatMap((section) => section.links).find(([, path]) => path === `/menu/service/${item}`)?.[0]);
  if (!label) return <Navigate to={back} replace />;
  return <>
    <BankingHeader title={label} backTo={back} centered />
    <main className="won-scroll won-page">
      <section className="won-panel won-account-info">
        <h2>{label}</h2>
        <p className="won-info-note">{item === 'cart' ? '담아둔 시연 상품이 없어요.' : '이 메뉴는 시연용 안내 화면입니다.'}</p>
        {item === 'deposits' && <Link className="won-current-primary" to="/maturity">WON하는 만기</Link>}
      </section>
    </main>
  </>;
}
