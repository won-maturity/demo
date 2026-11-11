import { useState } from 'react';
import { Bell, CalendarDays, ChartNoAxesCombined, CircleHelp, CreditCard, FileText, Gift, Landmark, Search, ShieldPlus, SlidersHorizontal, Smartphone, Sparkles, Wallet } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { daysUntil } from '../../mock/personas';
import { BankingHeader, ServiceRow, useBankingCustomer, useOpenMaturity } from './BankingShell';
import { maturityNotificationCopy, sendDemoNotification } from './demoNotifications';

const recommended = [
  { id: 'pay', title: '우리WON 페이', icon: CreditCard, detail: '우리카드와 연결해 간편결제를 이용할 수 있는 서비스예요.' },
  { id: 'insurance', title: '놓친 보험금 찾기', icon: Search, detail: '찾지 않은 보험금이 있는지 확인하는 서비스예요.' },
  { id: 'claims', title: '실손보험 빠른 청구', icon: ShieldPlus, detail: '진료 내역으로 실손보험금을 청구하는 서비스예요.' },
  { id: 'wallet', title: '원더월렛', icon: Wallet, detail: '자주 쓰는 결제수단을 모아 관리하는 서비스예요.' },
];

const conveniences = [
  { id: 'safe', title: '디지털 금고', detail: '내 정보를 안전하게 보관', icon: Landmark },
  { id: 'documents', title: '전자문서지갑', detail: '손쉽게 증명서 발급 및 제출', icon: FileText },
  { id: 'securities', title: '주식/채권 매매 서비스', detail: '앱 설치 없이 간편하게', icon: ChartNoAxesCombined },
  { id: 'car', title: '우리 WON카', detail: '자동차 금융 알아보기', icon: Wallet },
];

export function BenefitsPage() {
  const [section, setSection] = useState<'event' | 'life'>('life');
  const openMaturity = useOpenMaturity();

  return (
    <>
      <BankingHeader title="혜택" />
      <div className="won-top-tabs won-top-tabs--bold" role="group" aria-label="혜택 구분">
        <button type="button" aria-pressed={section === 'event'} onClick={() => setSection('event')}>혜택·이벤트</button>
        <button type="button" aria-pressed={section === 'life'} onClick={() => setSection('life')}>생활편의</button>
      </div>
      <main className="won-scroll won-page won-benefits">
        {section === 'life' ? (
          <>
            <section>
              <h2>추천서비스</h2>
              <div className="won-recommended">
                {recommended.map(({ id, title, icon: Icon }) => (
                  <Link key={id} to={`/benefits/services/${id}`}>
                    <span className="won-tile-art"><Icon size={27} aria-hidden /></span>
                    <span>{title}</span>
                  </Link>
                ))}
              </div>
            </section>
            <section className="won-conveniences">
              <h2>편리한 생활 서비스</h2>
              <div className="won-service-list">
                {conveniences.map(({ id, title, icon, detail }) => <ServiceRow key={id} icon={icon} title={title} detail={detail} to={`/benefits/services/${id}`} />)}
              </div>
            </section>
          </>
        ) : (
          <div className="won-service-list">
            <ServiceRow icon={Gift} title="내 카드 혜택" detail="이번 달 받은 혜택 확인하기" to="/banking/card/rewards" />
            <ServiceRow icon={Sparkles} title="WON하는 만기" detail="만기 자금 관리하기" onClick={openMaturity} />
          </div>
        )}
      </main>
    </>
  );
}

export function BenefitDetailsPage() {
  const { serviceId } = useParams();
  const service = [...recommended, ...conveniences].find((item) => item.id === serviceId);
  if (!service) return <Navigate to="/benefits" replace />;
  const Icon = service.icon;

  return (
    <>
      <BankingHeader title={service.title} backTo="/benefits" centered />
      <main className="won-scroll won-page">
        <section className="won-panel won-account-info">
          <span className="won-service-icon"><Icon size={26} aria-hidden /></span>
          <h2>{service.title}</h2>
          <p>{service.detail}</p>
          <p className="won-info-note">시연용 서비스 안내예요.</p>
        </section>
      </main>
    </>
  );
}

export function MenuPage() {
  const openMaturity = useOpenMaturity();

  return (
    <>
      <BankingHeader title="전체 메뉴" />
      <main className="won-scroll won-page won-menu">
        <section className="won-service-list" aria-label="뱅킹 서비스">
          <ServiceRow icon={Sparkles} title="WON하는 만기" detail="만기 자금의 다음 계획 세우기" onClick={openMaturity} />
          <ServiceRow icon={Wallet} title="전체 계좌" to="/assets" />
          <ServiceRow icon={ChartNoAxesCombined} title="저축진단" to="/savings" />
          <ServiceRow icon={CalendarDays} title="소비" to="/spending" />
          <ServiceRow icon={CreditCard} title="유니버설뱅킹" to="/banking" />
          <ServiceRow icon={Gift} title="혜택" to="/benefits" />
        </section>
        <h2>시연 메뉴</h2>
        <section className="won-service-list" aria-label="시연 메뉴">
          <ServiceRow icon={Smartphone} title="바탕화면 알림 시연" to="/demo/phone" />
          <ServiceRow icon={SlidersHorizontal} title="시연 고객 및 엔진 패널" to="/demo" />
          <ServiceRow icon={ChartNoAxesCombined} title="수익성 시뮬레이터" to="/simulator" />
          <ServiceRow icon={CircleHelp} title="무응답 시뮬레이션" to="/navi/no-response" />
        </section>
      </main>
    </>
  );
}

export function NotificationsPage() {
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');
  const { persona } = useBankingCustomer();
  const openMaturity = useOpenMaturity();
  const days = daysUntil(persona.maturityDate);

  async function notify() {
    setSending(true);
    setFeedback('');
    try {
      const notice = maturityNotificationCopy(persona.productName, days);
      const result = await sendDemoNotification(`${notice.title}. ${notice.body}`);
      setFeedback(result === 'shown'
        ? '기기에 시연 알림을 보냈어요.'
        : result === 'denied'
          ? '브라우저의 알림 권한을 허용한 뒤 다시 눌러주세요. 위의 앱 알림은 바로 열 수 있어요.'
          : '이 환경에서는 기기 알림을 지원하지 않아요. 위의 앱 알림에서 같은 화면을 열 수 있어요.');
    } catch {
      setFeedback('기기에 알림을 보내지 못했어요. 위의 앱 알림에서 같은 화면을 열 수 있어요.');
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <BankingHeader title="알림" backTo="/home" centered />
      <main className="won-scroll won-page">
        <section className="won-service-list" aria-label="뱅킹 알림">
          <ServiceRow icon={Bell} title={`${persona.productName} 만기까지 ${days}일`} detail="WON하는 만기에서 확인해보세요." onClick={openMaturity} />
          <ServiceRow icon={CreditCard} title="카드 이용대금명세서가 나왔어요" detail="결제 예정 금액을 확인해보세요." to="/banking/card/statement" />
        </section>
        <section className="won-panel won-notification-demo">
          <h2>시연 알림</h2>
          <p>스마트폰 바탕화면에서 만기 알림을 받고 눌러보세요.</p>
          <Link className="won-main-action" to="/demo/phone"><span className="inline-flex items-center gap-2"><Smartphone size={17} aria-hidden />바탕화면 알림 시연</span></Link>
          <button type="button" className="won-pill" onClick={notify} disabled={sending}>
            {sending ? '알림 보내는 중' : '시연 알림 보내기'}
          </button>
          <p className="won-muted" role="status">{feedback}</p>
        </section>
      </main>
    </>
  );
}
