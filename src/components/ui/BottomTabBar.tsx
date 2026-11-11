import { ChartNoAxesCombined, ChartPie, House, ShoppingBag, Smile } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { to: '/banking', label: '상품', icon: ShoppingBag },
  { to: '/assets', label: '자산·소비', icon: ChartPie },
  { to: '/home', label: '홈', icon: House },
  { to: '/stocks', label: '주식', icon: ChartNoAxesCombined },
  { to: '/benefits', label: '혜택', icon: Smile },
] as const;

export function BottomTabBar() {
  const { pathname } = useLocation();
  return (
    <nav className="won-tabs won-current-tabs" aria-label="앱 하단 메뉴">
      {tabs.map(({ to, label, icon: Icon }) => {
        const active = pathname === to || (to === '/assets' && pathname === '/spending');
        return <Link key={to} to={to} aria-current={active ? 'page' : undefined}>
          <span className="won-current-tab-icon"><Icon size={24} strokeWidth={2.05} aria-hidden /></span>
          <span>{label}</span>
        </Link>;
      })}
    </nav>
  );
}
