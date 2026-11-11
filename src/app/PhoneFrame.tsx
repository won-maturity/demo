import type { ReactNode } from 'react';
import { Signal } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function PhoneFrame({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const whiteStatusBar = pathname === '/savings' || pathname === '/menu' || pathname.startsWith('/ai-gallery') || pathname.startsWith('/navi/');

  return (
    <div className="min-h-dvh bg-stage frame:flex frame:min-h-dvh frame:items-center frame:justify-center frame:p-5">
      <div className="mx-auto flex h-dvh w-full flex-col frame:h-[min(844px,calc(100dvh-40px))] frame:w-[400px] frame:rounded-[38px] frame:bg-[#20262D] frame:p-[7px] frame:shadow-phone">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-bg frame:rounded-[31px]">
          {pathname !== '/demo/phone' && (
            <div aria-hidden="true" className={`hidden h-[45px] shrink-0 items-center justify-between px-[39px] text-base font-bold text-black frame:flex ${whiteStatusBar ? 'bg-surface' : 'bg-bg'}`}>
              <span>09:39</span>
              <span className="flex items-center gap-1 text-sm">
                <Signal size={17} strokeWidth={3} />
                <span>LTE</span>
                <span className="rounded-[5px] bg-black px-1.5 text-[11px] leading-[14px] text-white">78</span>
              </span>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
