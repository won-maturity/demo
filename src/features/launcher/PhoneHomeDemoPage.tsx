import { useEffect, useState } from 'react';
import { BatteryFull, BellRing, CalendarDays, ChevronRight, RotateCcw, Settings2, Signal, Wallet, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';
import { daysUntil, DEMO_TODAY } from '../../mock/personas';
import { BankMark } from '../banking/AccountCards';
import { useBankingCustomer, useOpenMaturity } from '../banking/BankingShell';
import { maturityNotificationCopy } from '../banking/demoNotifications';
import './phone-home-demo.css';

const arrivalDelay = 1400;
const demoDateLabel = new Intl.DateTimeFormat('ko-KR', {
  month: 'long',
  day: 'numeric',
  weekday: 'long',
  timeZone: 'Asia/Seoul',
}).format(new Date(DEMO_TODAY + 'T09:30:00+09:00'));

export function PhoneHomeDemoPage() {
  const { persona } = useBankingCustomer();
  const openMaturity = useOpenMaturity();
  const [arrival, setArrival] = useState(0);
  const [visible, setVisible] = useState(false);
  const notice = maturityNotificationCopy(persona.productName, daysUntil(persona.maturityDate));

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), arrivalDelay);
    return () => window.clearTimeout(timer);
  }, [arrival]);

  function replay() {
    setVisible(false);
    setArrival((count) => count + 1);
  }

  return (
    <main className="phone-home" aria-label="스마트폰 바탕화면 시연">
      <div className="phone-home-status" aria-hidden="true">
        <span>9:30{visible && <BellRing size={12} />}</span>
        <span><Wifi size={15} /><Signal size={14} /><BatteryFull size={19} /></span>
      </div>

      <div className="phone-home-notice-slot">
        <div className="sr-only" role="status">{visible ? `우리WON뱅킹 알림. ${notice.title}` : ''}</div>
        {visible && (
          <button type="button" className="phone-home-notice" onClick={openMaturity}>
            <span className="phone-home-notice-meta">
              <BankMark brand="woori" />
              <span>우리WON뱅킹</span>
              <span className="phone-home-notice-time">지금</span>
            </span>
            <strong>{notice.title}</strong>
            <span className="phone-home-notice-body">{notice.body}</span>
            <ChevronRight className="phone-home-notice-arrow" size={18} aria-hidden />
          </button>
        )}
      </div>

      <div className="phone-home-widget">
        <h1>9:30</h1>
        <p>{demoDateLabel}</p>
      </div>

      <nav className="phone-home-apps" aria-label="바탕화면 앱">
        <Link to="/home">
          <span className="phone-home-app-icon phone-home-app-icon--won"><BankMark brand="woori" /></span>
          <span>우리WON뱅킹</span>
        </Link>
        <Link to="/spending">
          <span className="phone-home-app-icon phone-home-app-icon--calendar"><CalendarDays size={26} aria-hidden /></span>
          <span>달력</span>
        </Link>
        <Link to="/assets">
          <span className="phone-home-app-icon phone-home-app-icon--wallet"><Wallet size={26} aria-hidden /></span>
          <span>자산</span>
        </Link>
        <Link to="/demo">
          <span className="phone-home-app-icon phone-home-app-icon--settings"><Settings2 size={26} aria-hidden /></span>
          <span>시연 설정</span>
        </Link>
      </nav>

      <footer className="phone-home-controls">
        <Link to="/notifications">앱 알림으로</Link>
        <button type="button" onClick={replay} disabled={!visible}>
          <RotateCcw size={15} aria-hidden />{visible ? '알림 다시 받기' : '알림 기다리는 중'}
        </button>
      </footer>
      <div className="phone-home-gesture" aria-hidden="true" />
    </main>
  );
}
