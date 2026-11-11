import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { playChatReply, type ChatView } from './useChatReply';

const before: ChatView = {
  messages: [{ id: 'open', role: 'ai', text: '언제 쓰실 예정이세요?' }],
  chatStep: 'timing',
  interpret: null,
  validationNotes: [],
};

const after: ChatView = {
  ...before,
  messages: [
    ...before.messages,
    { id: 'user', role: 'user', text: '1년 안' },
    { id: 'response', role: 'ai', text: '어디에 쓰실 돈이에요?' },
    { id: 'response-2', role: 'ai', text: '용도를 알려주세요.' },
  ],
  chatStep: 'purpose',
};

describe('chat reply playback', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('echoes the user immediately and streams responses in order before exposing the next step', () => {
    const update = vi.fn();
    playChatReply(before, after, update);

    expect(update.mock.lastCall).toEqual([{ ...before, messages: after.messages.slice(0, 2) }, true]);
    vi.advanceTimersByTime(799);
    expect(update).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    const partial = update.mock.lastCall![0] as ChatView;
    expect(partial.messages.at(-1)?.text).toBe('어디에');
    expect(partial.chatStep).toBe('timing');

    vi.runAllTimers();
    expect(update.mock.lastCall).toEqual([after, false]);
  });

  it('keeps the AI introduction before the automatic customer message during loading', () => {
    const introduction = { id: 'intro', role: 'ai' as const, text: '안녕하세요. 만기 자금 상담 AI입니다.' };
    const withIntroduction: ChatView = { ...after, messages: [...before.messages, introduction, ...after.messages.slice(1)] };
    const update = vi.fn();
    playChatReply(before, withIntroduction, update);
    expect(update.mock.lastCall![0].messages).toEqual([...before.messages, introduction, after.messages[1]]);
    vi.runAllTimers();
    expect(update.mock.lastCall).toEqual([withIntroduction, false]);
  });

  it('cancels pending updates when the page closes or the conversation resets', () => {
    const update = vi.fn();
    const cancel = playChatReply(before, after, update);
    vi.advanceTimersByTime(800);
    cancel();
    const calls = update.mock.calls.length;
    vi.runAllTimers();
    expect(update).toHaveBeenCalledTimes(calls);
  });

  it('shows the loading interval before revealing a result card without an AI message', () => {
    const update = vi.fn();
    const result: ChatView = { ...before, messages: after.messages.slice(0, 2), chatStep: 'interpret' };
    playChatReply(before, result, update);
    expect(update.mock.lastCall![0].chatStep).toBe('timing');
    vi.advanceTimersByTime(800);
    expect(update.mock.lastCall).toEqual([result, false]);
  });

  it('reveals each full message without streaming when reduced motion is requested', () => {
    const update = vi.fn();
    playChatReply(before, after, update, false);
    vi.advanceTimersByTime(800);
    expect(update.mock.lastCall![0].messages.at(-1)?.text).toBe(after.messages[2].text);
    vi.advanceTimersByTime(420);
    expect(update.mock.lastCall).toEqual([after, false]);
  });
});
