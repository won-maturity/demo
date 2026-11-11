import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Menu, type LucideIcon } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BottomTabBar } from '../../components/ui/BottomTabBar';
import { DEFAULT_PERSONA_ID, getPersona } from '../../mock/personas';
import { useDemoStore } from '../../store/useDemoStore';
import './banking.css';

export function useBankingCustomer() {
  const id = useDemoStore((state) => state.personaId);
  const persona = getPersona(id ?? DEFAULT_PERSONA_ID);
  return { name: persona.name, persona };
}

export function useOpenMaturity() {
  const navigate = useNavigate();
  return () => {
    const { personaId, selectPersona } = useDemoStore.getState();
    if (!personaId) selectPersona(DEFAULT_PERSONA_ID);
    navigate('/navi/summary');
  };
}

export function BankingShell() {
  const { pathname } = useLocation();
  const showNavigation = ['/home', '/assets', '/banking', '/benefits', '/menu', '/spending', '/notifications'].includes(pathname);
  return (
    <div className="won-shell">
      <Outlet />
      {showNavigation && <BottomTabBar />}
    </div>
  );
}

export function BankingHeader({
  title,
  backTo,
  centered = false,
  children,
}: {
  title: string;
  backTo?: string;
  centered?: boolean;
  children?: ReactNode;
}) {
  return (
    <header className={`won-header${centered ? ' won-header--centered' : ''}`}>
      {backTo && <Link to={backTo} className="won-icon-button won-header-back" aria-label="뒤로 가기"><ChevronLeft size={25} /></Link>}
      <h1>{title}</h1>
      <div className="won-header-actions">
        {children ?? (!backTo && title !== '전체 메뉴' ? <Link to="/menu" className="won-icon-button" aria-label="전체 메뉴"><Menu size={23} /></Link> : null)}
      </div>
    </header>
  );
}

export function ServiceRow({ icon: Icon, title, detail, to, onClick }: {
  icon: LucideIcon;
  title: string;
  detail?: string;
} & ({ to: string; onClick?: never } | { to?: never; onClick: () => void })) {
  const content = (
    <>
      <span className="won-service-icon"><Icon size={24} aria-hidden /></span>
      <span className="won-row-copy"><strong>{title}</strong>{detail && <small>{detail}</small>}</span>
      <ChevronRight className="won-row-chevron" size={17} aria-hidden />
    </>
  );

  return to
    ? <Link className="won-service-row" to={to}>{content}</Link>
    : <button className="won-service-row" type="button" onClick={onClick}>{content}</button>;
}

export function Segmented<T extends string | number>({ label, options, value, onChange }: {
  label: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="won-segment" role="group" aria-label={label}>
      {options.map((option) => (
        <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  );
}
