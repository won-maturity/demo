import { Gift, House, LayoutGrid, Menu, Wallet } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const tabs = [
  { to: '/home', label: '홈', icon: House },
  { to: '/assets', label: '자산', icon: Wallet },
  { to: '/banking', label: '상품', icon: LayoutGrid },
  { to: '/benefits', label: '혜택', icon: Gift },
  { to: '/menu', label: '전체', icon: Menu },
] as const;

export function BottomTabBar() {
  const { pathname } = useLocation();
  return (
    <nav className="won-tabs" aria-label="앱 하단 메뉴">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} end
          className={to === '/assets' && pathname === '/spending' ? 'won-tab-context' : undefined}
          aria-current={to === '/assets' && pathname === '/spending' ? 'true' : undefined}
        >
          <Icon size={21} aria-hidden />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
