import { useState } from 'react';
import { Bell, CalendarCheck, ChevronRight, CircleDollarSign, CreditCard, Globe, House, Landmark, Settings, Smartphone, Ticket, Users, Wallet, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { daysUntil } from '../../mock/personas';
import { AccountCard } from '../banking/AccountCards';
import { useBankingCustomer, useOpenMaturity } from '../banking/BankingShell';
import { CurrentHeader, CurrentService, WonArt, WonCarousel, type WonSlide } from '../banking/WonCurrentUI';
import { getAccounts } from '../banking/data';

const homeSlides: WonSlide[] = [
  { title: '이번 행운은 내차례일지도..', detail: '우리 두근두근 행운적금', art: 'clover', tone: 'violet', to: '/banking' },
  { title: '만기 자금의 다음 계획', detail: 'WON하는 만기', art: 'house', tone: 'sky', to: '/maturity' },
  { title: '은행이 만든 착한 알뜰폰 요금제', detail: '우리WON모바일', art: 'mobile', tone: 'sky', to: '/benefits/services/mobile' },
  { title: '외국 갈 땐 든든하게 외화 챙기기', detail: '환전주머니', art: 'pie', tone: 'lilac', to: '/benefits/services/exchange' },
  { title: '고르는 재미에 받는 설렘까지!', detail: '「다 함께 포트폴리~Oh!」', art: 'presents', tone: 'cream', to: '/banking' },
  { title: '내 금융, 더 잘 키울 수 있어요', detail: '자산·소비', art: 'pie', tone: 'sky', to: '/assets' },
  { title: '여행의 즐거움을 더해요', detail: '카드 혜택 둘러보기', art: 'envelope', tone: 'cream', to: '/banking/card/rewards' },
  { title: '새로운 투자의 시작', detail: '우리투자증권', art: 'stock', tone: 'sky', to: '/stocks' },
  { title: '한곳에서 확인하는 내 계좌', detail: '전체계좌보기', art: 'house', tone: 'lilac', to: '/assets/accounts' },
  { title: '일상에 더하는 작은 행운', detail: '혜택 둘러보기', art: 'presents', tone: 'cream', to: '/benefits' },
];

export function HomePage() {
  const { name, persona } = useBankingCustomer();
  const openMaturity = useOpenMaturity();
  const [easy, setEasy] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [showPromo, setShowPromo] = useState(true);
  const [showTransfer, setShowTransfer] = useState(true);
  const [showConnect, setShowConnect] = useState(true);
  const [scene, setScene] = useState(0);
  const days = daysUntil(persona.maturityDate);
  const featured = getAccounts(persona)[0];
  const sceneLinks = [
    { to: '/banking', title: '이번 행운은 내차례일지도..', detail: '우리두근두근행운적금 만나러가기' },
    { to: '/maturity', title: 'WON하는 만기', detail: `${persona.productName} 만기까지 ${days}일` },
    { to: '/assets', title: '내 금융, 더 잘 키울 수 있어요', detail: '자산·소비 관리 시작하기' },
    { to: '/stocks', title: '주식도 안심하고 시작하세요', detail: '우리투자증권 둘러보기' },
    { to: '/benefits', title: '오늘의 혜택을 확인해 보세요', detail: '혜택 둘러보기' },
  ];

  return <>
    <CurrentHeader title="홈" wallet ai bell leading={
      <div className="won-home-mode" role="group" aria-label="홈 화면 모드">
        <button type="button" aria-pressed={!easy} onClick={() => setEasy(false)}>일반홈</button>
        <button type="button" aria-pressed={easy} onClick={() => setEasy(true)}>쉬운</button>
      </div>
    } />
    <main className={`won-scroll won-current-home${easy ? ' won-current-home--easy' : ''}`}>
      <section className="won-home-accounts">
        {!easy && showPromo && <div className="won-home-promo">
          <Link to={sceneLinks[scene].to}>
            <span className="won-home-promo-bell"><Bell size={23} fill="currentColor" /></span>
            <strong>{sceneLinks[scene].title}<br />{sceneLinks[scene].detail}</strong>
          </Link>
          <button type="button" onClick={() => setShowPromo(false)} aria-label="추천 배너 닫기"><X size={18} /></button>
        </div>}
        <div className="won-home-scene">
          {!easy && <>
            <div className="won-dots" role="group" aria-label="홈 추천 배너">
              {sceneLinks.map((entry, index) => <button key={entry.to} type="button" aria-label={entry.title} aria-pressed={scene === index} onClick={() => { setScene(index); setShowPromo(true); }} />)}
            </div>
            <WonArt kind="room" />
          </>}
          <div className="won-home-account-tools">
            <Link to="/assets/accounts"><Settings size={16} fill="currentColor" />홈계좌설정</Link>
            <button type="button" aria-pressed={hideBalance} onClick={() => setHideBalance(!hideBalance)}>잔액숨김 <i /></button>
          </div>
        </div>
        {!easy && showTransfer && <div className="won-home-transfer">
          <Link to="/assets/accounts/kb?action=1">
            <span className="won-home-kb">KB</span>
            <span><strong>국민은행 12345678901234</strong><small>이 계좌로 이체하기 <ChevronRight size={17} /></small></span>
          </Link>
          <button type="button" aria-label="이체 카드 닫기" onClick={() => setShowTransfer(false)}><X size={17} /></button>
        </div>}
        {!easy && showConnect && <div className="won-home-connect">
          <button type="button" className="won-home-dismiss" aria-label="다른 은행 계좌 안내 닫기" onClick={() => setShowConnect(false)}><X size={17} /></button>
          <div className="won-bank-stack" aria-hidden><i>B</i><i>W</i><i>KB</i><i>하</i><i>•••</i></div>
          <p>다른 은행 계좌도 홈에서 확인할 수 있어요<br />필요한 계좌를 홈에 추가해 보세요</p>
          <Link to="/assets" className="won-blue-pill">+ 다른 은행 계좌 추가</Link>
        </div>}
        <AccountCard account={featured} hideBalance={hideBalance} hideAction />
        <Link className="won-home-all" to="/assets/accounts">전체계좌보기</Link>
      </section>
      <section className="won-current-section won-home-more">
        <button type="button" className="won-maturity-entry" onClick={openMaturity}>
          <span><small>{name}님 · 만기까지 {days}일</small><strong>WON하는 만기</strong></span><ChevronRight size={21} aria-hidden />
        </button>
        <WonCarousel slides={homeSlides} start={4} label="홈 추천 상품" />
        <h2>추천서비스</h2>
        <div className="won-horizontal won-home-recommend">
          <div>
            <CurrentService title="우리WON모바일" detail="우리은행이 만든 알뜰한 통신" to="/benefits/services/mobile" icon={Smartphone} />
            <CurrentService title="환전주머니" detail="여행 환전을 손쉽게 준비하기" to="/benefits/services/exchange" icon={Globe} />
            <CurrentService title="우리WON지갑" detail="국민비서 등 유용한 생활 서비스" to="/benefits/services/wallet" icon={Wallet} />
          </div>
          <div>
            <CurrentService title="우리포용금융" detail="든든한 포용금융" to="/benefits/services/finance" icon={CircleDollarSign} />
            <CurrentService title="카드 혜택" detail="나의 카드 혜택" to="/banking/card/rewards" icon={CreditCard} />
            <CurrentService title="ATM/영업점" detail="계좌 정보 확인" to="/assets/accounts" icon={Landmark} />
          </div>
        </div>
        <h2>우리금융그룹 서비스</h2>
        <div className="won-horizontal won-home-group">
          <Link to="/benefits/services/insurance"><strong>보험</strong><span>나를 지켜주는<br />든든한 보장</span></Link>
          <Link to="/assets/accounts/hana"><strong>캐피탈</strong><span>내 자동차<br />대출 한도</span></Link>
          <Link to="/stocks"><strong>증권</strong><span>새로운<br />투자의 시작</span></Link>
        </div>
      </section>
      {!easy && <section className="won-current-section won-home-explore">
        <h2>상품 둘러보기</h2>
        <div className="won-horizontal won-product-peek">
          <Link to="/banking"><small>매월 추첨을 통해 우대금리를<br />드리는 특별한 적금</small><strong>우리 두근두근 행운적금</strong><WonArt kind="envelope" /></Link>
          <Link to="/maturity"><small>짧게 맡겨도, 계획에 맞게</small><strong>우리 369 정기예금</strong><WonArt kind="house" /></Link>
        </div>
        <h2>서비스 둘러보기</h2>
        <div className="won-current-list">
          <CurrentService title="우리은행 대학 학생증 카드" detail="도서관/체크/교통카드까지 한 번에" to="/benefits/services/student" icon={CreditCard} />
          <CurrentService title="우리WON지갑" detail="국민비서/전자증명서 디지털 지갑" to="/benefits/services/wallet" icon={Wallet} />
          <CurrentService title="우리WON모바일" detail="우리은행이 만든 알뜰한 통신" to="/benefits/services/mobile" icon={Smartphone} />
          <CurrentService title="WON하는 부동산" detail="나를 위한 부동산 길잡이" to="/benefits/services/estate" icon={House} />
          <CurrentService title="내 삶의 맞춤 금융 서비스" detail="지금 당신에게 필요한 금융 서비스" to="/maturity" icon={Users} />
        </div>
        <h2>혜택 둘러보기</h2>
        <div className="won-current-list">
          <CurrentService title="출석체크" detail="출석체크하고 꿀머니 받기" to="/benefits/services/check-in" icon={CalendarCheck} />
          <CurrentService title="데일리 럭키박스" detail="럭키박스 열고 랜덤 경품 받기" to="/benefits/services/lucky-box" icon={Wallet} />
          <CurrentService title="행운 복권" detail="복권 긁고 꿀머니 받기" to="/benefits/services/ticket" icon={Ticket} />
        </div>
      </section>}
    </main>
  </>;
}
