import type { ReactNode } from 'react';

export function ChatBubble({ role, children }: { role: 'ai' | 'user'; children: ReactNode }) {
  return (
    <p className={`won-chat-message won-chat-message--${role}`}>
      <span className="sr-only">{role === 'ai' ? 'AI챗봇: ' : '고객: '}</span>
      {children}
    </p>
  );
}
