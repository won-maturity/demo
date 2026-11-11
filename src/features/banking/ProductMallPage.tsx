import { Armchair, Banknote, CarFront, ChevronRight, ChartNoAxesCombined, Coins, CreditCard, FilePenLine, Globe, HeartPulse, House, PiggyBank, ShoppingCart, Store, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CurrentHeader, CurrentService, HeaderLink, WonArt, WonCarousel, type WonSlide } from './WonCurrentUI';

export const productCategories = [
  ['입출금/예적금', PiggyBank, 'pink', '/banking/category/deposits'],
  ['청약', House, 'purple', '/banking/category/housing'],
  ['대출', Banknote, 'blue', '/banking/category/loans'],
  ['펀드', ChartNoAxesCombined, 'indigo', '/banking/category/funds'],
  ['퇴직연금', Armchair, 'brown', '/banking/category/pension'],
  ['신탁', FilePenLine, 'indigo', '/banking/category/trust'],
  ['ISA', Wallet, 'blue', '/banking/category/isa'],
  ['외환', Globe, 'cyan', '/benefits/services/exchange'],
  ['개인사업자', Store, 'cyan', '/banking/category/business'],
  ['보험', HeartPulse, 'mint', '/benefits/services/insurance'],
  ['골드/실버', Coins, 'gold', '/banking/category/metals'],
  ['카드', CreditCard, 'magenta', '/banking/universal'],
] as const;

const mallSlides: WonSlide[] = [
  { title: <>행운의 주인공이 되어주세요<br />최고 연 13.0%</>, detail: <>(기본 연 3.0%, 세전)<br />우리 두근두근 행운적금</>, art: 'clover', tone: 'violet', to: '/banking/category/deposits' },
  { title: '짧게 맡겨도, 계획에 맞게', detail: '우리 369 정기예금', art: 'envelope', tone: 'sky', to: '/banking/category/deposits' },
  { title: '새로운 투자의 시작', detail: '우리투자증권', art: 'stock', tone: 'lilac', to: '/stocks' },
  { title: '내 금융, 더 잘 키울 수 있어요', detail: '자산·소비', art: 'pie', tone: 'sky', to: '/assets' },
  { title: '은행이 만든 착한 알뜰폰 요금제', detail: '우리WON모바일', art: 'mobile', tone: 'cream', to: '/benefits/services/mobile' },
  { title: '만기 자금의 다음 계획', detail: 'WON하는 만기', art: 'house', tone: 'violet', to: '/maturity' },
];

export function ProductMallPage() {
  return <>
    <CurrentHeader title="상품몰" ai>
      <HeaderLink to="/banking/category/cart" label="상품 장바구니"><ShoppingCart size={24} /></HeaderLink>
    </CurrentHeader>
    <main className="won-scroll won-current-page won-mall">
      <section className="won-current-section">
        <WonCarousel label="상품몰 추천 배너" slides={mallSlides} />
        <nav className="won-mall-grid" aria-label="금융상품 카테고리">
          {productCategories.map(([label, Icon, color, to]) => <Link key={label} to={to}>
            <span className={`won-product-icon won-product-icon--${color}`}>{label === 'ISA' ? <b>ISA</b> : <Icon size={27} strokeWidth={2.2} aria-hidden />}</span>
            <strong>{label}</strong>
          </Link>)}
        </nav>
        <Link className="won-mall-group" to="/banking/universal">
          <span className="won-group-tip">보험 상품이 추가됐어요 ✨</span>
          <CarFront size={30} aria-hidden />
          <span><strong>우리금융그룹 상품</strong><small>보험 · 증권 · 캐피탈 · 저축은행</small></span><ChevronRight size={20} aria-hidden />
        </Link>
        <section className="won-mall-consult">
          <h2>전문 <em>AI상담원</em>에게 물어보세요</h2>
          <div>
            {['예적금상담', '대출상담', '청약상담'].map((label) => <Link key={label} to="/maturity/chat" state={{ fromBanking: "/banking" }}><i aria-hidden />{label}</Link>)}
          </div>
        </section>
      </section>
      <section className="won-current-section won-mall-picks">
        <h2>WON PICK 추천</h2>
        <Link className="won-pick won-tone--lilac" to="/banking/category/funds"><span><strong>펀드, 고르기 어려우신가요?</strong><small>우리WON포트폴리오</small></span><WonArt kind="pie" /></Link>
        <Link className="won-pick won-tone--lavender" to="/benefits/services/exchange"><span><strong>외국 갈 땐 든든하게 외화 챙기기</strong><small>환전주머니</small></span><WonArt kind="envelope" /></Link>
        <Link className="won-pick won-tone--sky" to="/benefits/services/mobile"><span><strong>은행이 만든 착한 알뜰폰 요금제</strong><small>우리WON모바일</small></span><WonArt kind="mobile" /></Link>
        <div className="won-current-list">
          <CurrentService title="금융 소외없이 든든한 포용금융" detail="우리포용금융 36.5도" icon={HeartPulse} to="/benefits/services/finance" />
          <CurrentService title="공항라운지 & 여행 카드 모음집" detail="우리카드" icon={CreditCard} to="/banking/card/rewards" />
          <CurrentService title="자동차로 할 수 있는 금융" detail="우리금융캐피탈" icon={CarFront} to="/assets/accounts/hana" />
        </div>
      </section>
    </main>
  </>;
}

export const productLabels = Object.fromEntries(productCategories.map(([label, , , path]) => [path.split('/').at(-1), label]));
