import { useCallback, useEffect, useRef, useState } from 'react';
import { useDemoStore, type ChatMessage } from '../../store/useDemoStore';

export type ChatView = Pick<
  ReturnType<typeof useDemoStore.getState>,
  'messages' | 'chatStep' | 'interpret' | 'validationNotes'
>;

// Animate a completed demo response without delaying the underlying conversation state.
export function playChatReply(
  before: ChatView,
  after: ChatView,
  update: (view: ChatView, replying: boolean) => void,
  stream = true,
) {
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout>;
  const incoming = after.messages.slice(before.messages.length);
  const lastUserIndex = incoming.map((message) => message.role).lastIndexOf('user');
  const base = after.messages.slice(0, before.messages.length + lastUserIndex + 1);
  const responses = incoming.slice(lastUserIndex + 1).filter((message) => message.role === 'ai');
  const completed: ChatMessage[] = [];
  let responseIndex = 0;
  let characterCount = 0;

  function schedule(callback: () => void, delay: number) {
    timer = setTimeout(() => {
      if (!cancelled) callback();
    }, delay);
  }

  function reveal() {
    const message = responses[responseIndex];
    if (!message) {
      update(after, false);
      return;
    }

    const characters = Array.from(message.text);
    characterCount = stream ? Math.min(characters.length, characterCount + 3) : characters.length;
    update({
      ...before,
      messages: [...base, ...completed, { ...message, text: characters.slice(0, characterCount).join('') }],
    }, true);

    if (characterCount < characters.length) {
      schedule(reveal, 30);
    } else {
      completed.push(message);
      responseIndex++;
      characterCount = 0;
      if (responseIndex < responses.length) schedule(reveal, 420);
      else update(after, false);
    }
  }

  update({ ...before, messages: base }, true);
  schedule(reveal, 800);

  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}

export function useChatReply() {
  const messages = useDemoStore((state) => state.messages);
  const chatStep = useDemoStore((state) => state.chatStep);
  const interpret = useDemoStore((state) => state.interpret);
  const validationNotes = useDemoStore((state) => state.validationNotes);
  const [view, setView] = useState<ChatView | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const busy = useRef(false);
  const generation = useRef(0);
  const cancelPlayback = useRef<(() => void) | null>(null);

  const cancelReply = useCallback(() => {
    generation.current++;
    cancelPlayback.current?.();
    cancelPlayback.current = null;
    busy.current = false;
    setView(null);
    setIsReplying(false);
  }, []);

  // Customer changes and "처음으로" replace the opening message, even for the same customer.
  useEffect(() => {
    cancelReply();
    return () => cancelPlayback.current?.();
  }, [messages[0], cancelReply]);

  const reply = useCallback((action: () => void | Promise<void>) => {
    if (busy.current) return;
    const request = ++generation.current;
    const before = useDemoStore.getState();
    busy.current = true;
    let result: void | Promise<void>;
    try {
      result = action();
    } catch {
      busy.current = false;
      setView(null);
      setIsReplying(false);
      useDemoStore.getState().showToast('답변을 준비하지 못했어요. 다시 시도해 주세요.');
      return;
    }
    // Async tool actions expose their introduction and query status immediately.
    const waiting = result ? useDemoStore.getState() : before;

    const complete = () => {
      if (request !== generation.current || before.messages[0] !== useDemoStore.getState().messages[0]) return;
      const after = useDemoStore.getState();
      if (waiting.messages === after.messages && waiting.chatStep === after.chatStep && waiting.interpret === after.interpret) {
        busy.current = false;
        setView(null);
        setIsReplying(false);
        return;
      }
      cancelPlayback.current?.();
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      cancelPlayback.current = playChatReply(waiting, after, (nextView, replying) => {
        busy.current = replying;
        setView(replying ? nextView : null);
        setIsReplying(replying);
      }, !reduceMotion);
    };

    if (result) {
      setView(null);
      setIsReplying(true);
      void result.then(complete, () => {
        if (request !== generation.current) return;
        busy.current = false;
        setView(null);
        setIsReplying(false);
        useDemoStore.getState().showToast('답변을 준비하지 못했어요. 다시 시도해 주세요.');
      });
    } else {
      complete();
    }
  }, []);
  return {
    ...(view ?? { messages, chatStep, interpret, validationNotes }),
    isReplying,
    reply,
    cancelReply,
  };
}
