import { useEffect, useState, type ReactNode } from 'react';
import { Bell, ChevronLeft, ChevronRight, CircleHelp, Menu, MessageCircle, Pause, Play, Wallet, type LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './won-current.css';

export type WonArtKind = 'clover' | 'envelope' | 'house' | 'stock' | 'presents' | 'room' | 'mobile' | 'pie';

export function WonArt({ kind }: { kind: WonArtKind }) {
  return <span className={`won-art won-art--${kind}`} aria-hidden />;
}

export function AiIcon() {
  return <span className="won-ai-icon" aria-hidden><MessageCircle size={23} strokeWidth={2.2} /><b>AI</b><i /></span>;
}

export function HeaderLink({ to, label, children, fromBanking }: { to: string; label: string; children: ReactNode; fromBanking?: string }) {
  return <Link to={to} state={fromBanking ? { fromBanking } : undefined} className="won-icon-button" aria-label={label}>{children}</Link>;
}

export function CurrentHeader({ title, leading, wallet = false, ai = false, bell = false, children }: {
  title: string; leading?: ReactNode; wallet?: boolean; ai?: boolean; bell?: boolean; children?: ReactNode;
}) {
  const { pathname } = useLocation();
  return (
    <header className="won-header won-current-header">
      <h1 className={leading ? 'sr-only' : undefined}>{title}</h1>
      {leading}
      <div className="won-header-actions">
        {wallet && <HeaderLink to="/benefits/services/wallet" label="우리WON지갑"><Wallet size={23} /></HeaderLink>}
        {ai && <HeaderLink to="/maturity/chat" label="AI챗봇" fromBanking={pathname}><AiIcon /></HeaderLink>}
        {bell && <HeaderLink to="/notifications" label="알림"><Bell size={23} /></HeaderLink>}
        {children}
        <HeaderLink to="/menu" label="전체 메뉴"><Menu size={24} /></HeaderLink>
      </div>
    </header>
  );
}

export type WonSlide = { title: ReactNode; detail: ReactNode; art: WonArtKind; tone: string; to: string };

export function WonCarousel({ slides, start = 0, label }: { slides: WonSlide[]; start?: number; label: string }) {
  const [active, setActive] = useState(start);
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [interacting, setInteracting] = useState(false);
  const slide = slides[active];

  useEffect(() => {
    if (!playing || interacting) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % slides.length), 7000);
    return () => window.clearInterval(timer);
  }, [playing, interacting, slides.length, active]);

  const change = (delta: number) => setActive((index) => (index + delta + slides.length) % slides.length);

  return (
    <section className={`won-carousel won-tone--${slide.tone}`} aria-label={label}
      onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
      onFocus={() => setInteracting(true)} onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
      }}>
      <Link to={slide.to} className="won-carousel-slide">
        <span><strong>{slide.title}</strong><small>{slide.detail}</small></span>
        <WonArt kind={slide.art} />
      </Link>
      <div className="won-carousel-controls">
        <div>
          <button type="button" aria-label="이전 배너" onClick={() => change(-1)}><ChevronLeft size={16} /></button>
          <span aria-live={playing ? 'off' : 'polite'}>{active + 1} / {slides.length}</span>
          <button type="button" aria-label="다음 배너" onClick={() => change(1)}><ChevronRight size={16} /></button>
        </div>
        <button type="button" aria-label={playing ? '자동 넘기기 일시정지' : '자동 넘기기 재생'} onClick={() => setPlaying(!playing)}>
          {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
        </button>
      </div>
    </section>
  );
}

export function CurrentService({ title, detail, to, icon: Icon = CircleHelp }: {
  title: string; detail: string; to: string; icon?: LucideIcon;
}) {
  return <Link className="won-current-service" to={to}>
    <span className="won-current-service-icon"><Icon size={24} aria-hidden /></span>
    <span><strong>{title}</strong><small>{detail}</small></span>
  </Link>;
}
