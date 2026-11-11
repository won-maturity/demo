import type { ReactNode } from 'react';
import { AppHeader } from './AppHeader';

export function Screen({
  title,
  onBack,
  children,
  footer,
  overlay,
}: {
  title: string;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  overlay?: ReactNode;
}) {
  return (
    <div className="relative flex h-full min-h-0 flex-col bg-bg">
      <AppHeader title={title} onBack={onBack} />
      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-4">{children}</div>
      {footer ? (
        <div className="shrink-0 space-y-2 border-t border-line bg-surface px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          {footer}
        </div>
      ) : null}
      {overlay}
    </div>
  );
}
