import { ArrowRight, Bell, ChevronRight, Menu, MessageCircleMore } from 'lucide-react';
import { Link } from 'react-router-dom';
import { daysUntil } from '../../mock/personas';
import { AccountCard } from '../banking/AccountCards';
import { useBankingCustomer, useOpenMaturity } from '../banking/BankingShell';
import { getAccounts } from '../banking/data';

export function HomePage() {
  const { name, persona } = useBankingCustomer();
  const openMaturity = useOpenMaturity();
  const days = daysUntil(persona.maturityDate);

  return (
    <>
      <header className="won-header won-home-header">
        <h1><Link to="/demo" aria-label={`${name}님, 시연 고객 변경`}>{name}님</Link></h1>
        <div className="won-header-actions">
          <button type="button" onClick={openMaturity} className="won-icon-button" aria-label="WON하는 만기 상담"><MessageCircleMore size={23} aria-hidden /></button>
          <Link to="/notifications" className="won-icon-button won-notification-icon" aria-label="새 알림"><Bell size={23} aria-hidden /></Link>
          <Link to="/menu" className="won-icon-button" aria-label="전체 메뉴"><Menu size={23} aria-hidden /></Link>
        </div>
      </header>
      <main className="won-scroll won-home">
        <section className="won-home-feature" aria-label="만기 알림">
          <button type="button" className="won-hero-link" onClick={openMaturity} aria-label="WON하는 만기 시작">
            <span className="won-hero-copy">
              <strong className="won-hero-accent">{persona.productName} 만기</strong>가<br />
              {days}일 남았어요.<br />
              <strong className="won-hero-accent">만기 자금</strong>을 확인해보세요 <ArrowRight size={24} aria-hidden />
            </span>
            <span className="won-alert-art" aria-hidden>!</span>
          </button>
          <div className="won-hero-actions">
            <button className="won-pill won-pill-primary" type="button" onClick={openMaturity}>WON하는 만기</button>
            <Link to="/notifications" className="won-pill">더보기</Link>
          </div>
        </section>
        <section className="won-account-list" aria-label="내 계좌">
          {getAccounts(persona).slice(0, 4).map((account, index) => (
            <AccountCard key={account.id} account={account} notice={index === 0 ? `${persona.productName} 만기가 ${days}일 남았어요` : undefined} />
          ))}
        </section>
        <Link to="/assets" className="won-section-link">전체 계좌 보기 <ChevronRight size={18} aria-hidden /></Link>
      </main>
    </>
  );
}
