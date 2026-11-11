import type { ReactNode } from 'react';
import { BatteryFull, Signal, Wifi } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function PhoneFrame({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const whiteStatusBar = pathname === '/savings' || pathname === '/banking' || pathname.startsWith('/navi/');

  return (
    <div className="min-h-dvh bg-stage frame:flex frame:min-h-dvh frame:items-center frame:justify-center frame:p-5">
      <div className="mx-auto flex h-dvh w-full flex-col frame:h-[min(844px,calc(100dvh-40px))] frame:w-[400px] frame:rounded-[38px] frame:bg-[#20262D] frame:p-[7px] frame:shadow-phone">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-bg frame:rounded-[31px]">
          {pathname !== '/demo/phone' && (
            <div aria-hidden="true" className={`hidden h-7 shrink-0 items-center justify-between px-[19px] text-xs font-bold text-textStrong frame:flex ${whiteStatusBar ? 'bg-surface' : 'bg-bg'}`}>
              <span>9:30</span>
              <span className="flex items-center gap-0.5">
                <Wifi size={13} />
                <Signal size={12} />
                <BatteryFull size={15} />
              </span>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
