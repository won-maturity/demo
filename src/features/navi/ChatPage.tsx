import { useEffect, useRef, useState } from 'react';
import { Bot, ChevronLeft, EyeOff, MessagesSquare, Plus, RotateCcw, Send } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChatBubble } from '../../components/ui/ChatBubble';
import { Chip } from '../../components/ui/Chip';
import { PrimaryButton, SecondaryButton } from '../../components/ui/Buttons';
import { WonArt } from '../banking/WonCurrentUI';
import './won-chat.css';
import { EXAMPLE_UTTERANCES } from '../../engine/interpret';
import { needsHandoff } from '../../engine/rules';
import { BankLookupCard } from './BankLookupCard';
import { InterpretCard } from './InterpretCard';
import { useChatReply } from './useChatReply';
import {
  DATE_CHIPS,
  PURPOSE_CHIPS,
  PURPOSE_LABEL,
  TIMING_CHIPS,
  TIMING_LABEL,
  purposeNeedsDate,
  type PurposeId,
  type TimingId,
} from '../../mock/chatScripts';
import { DEMO_TODAY, getPersona } from '../../mock/personas';
import { useDemoStore } from '../../store/useDemoStore';

export function ChatPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const backTo = ['/home', '/banking', '/menu'].includes(state?.fromBanking) ? state.fromBanking : '/navi/summary';
  const bottomRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLElement>(null);
  const followReply = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const [examples, setExamples] = useState(false);
  const personaId = useDemoStore((state) => state.personaId);
  const { messages, chatStep, interpret, validationNotes, isReplying, reply: runReply, cancelReply } = useChatReply();
  const appendMessage = useDemoStore((state) => state.appendMessage);
  const setChatStep = useDemoStore((state) => state.setChatStep);
  const setAnswers = useDemoStore((state) => state.setAnswers);
  const setHandoff = useDemoStore((state) => state.setHandoff);
  const submitUtterance = useDemoStore((state) => state.submitUtterance);
  const answerIntentDate = useDemoStore((state) => state.answerIntentDate);
  const answerIntentTiming = useDemoStore((state) => state.answerIntentTiming);
  const confirmIntent = useDemoStore((state) => state.confirmIntent);
  const reviseIntent = useDemoStore((state) => state.reviseIntent);
  const openingMessage = useDemoStore((state) => state.messages[0]);
  const maturityLookup = useDemoStore((state) => state.maturityLookup);
  const investmentLookup = useDemoStore((state) => state.investmentLookup);
  const maturityEntry = state?.fromMaturity === true || messages.some((message) => message.kind === 'maturity-lookup');
  const [draft, setDraft] = useState('');
  const [pickingIndex, setPickingIndex] = useState<number | null>(null);

  useEffect(() => {
    const feed = feedRef.current;
    if (feed && followReply.current && (messages.length > 2 || chatStep !== 'timing' || isReplying)) {
      feed.scrollTop = feed.scrollHeight;
    }
  }, [messages, chatStep, interpret, isReplying, maturityLookup, investmentLookup]);

  useEffect(() => {
    if (!state?.fromMaturity) return;
    const timer = window.setTimeout(() => runReply(useDemoStore.getState().startMaturityChat), 0);
    return () => window.clearTimeout(timer);
  }, [state?.fromMaturity, openingMessage, runReply]);

  if (!personaId) return null;
  const persona = getPersona(personaId);

  const reply = (action: () => void | Promise<void>) => {
    followReply.current = true;
    runReply(action);
  };

  const finish = () => useDemoStore.getState().prepareChatOptions();

  const askInvest = () => reply(() => {
    appendMessage('user', '투자 상품이 궁금해요');
    const decision = needsHandoff(persona, 0, { investInquiry: true });
    if (decision.handoff && decision.reason) {
      setHandoff(decision.reason);
      appendMessage(
        'ai',
        '투자 상품 문의는 나이 기준 규칙에 따라 영업점 PB나 상담원에게 연결돼요. 저는 상품을 대신 고르지 않아요.',
      );
      setChatStep('handoff');
      return;
    }
    appendMessage(
      'ai',
      '투자 상품은 자금 기간과 투자성향이 맞을 때만 선택지에 나와요. 언제 쓸 돈인지부터 알려 주실래요?',
    );
  });

  const onTiming = (id: TimingId) => reply(() => {
    appendMessage('user', TIMING_LABEL[id]);
    setAnswers({ timing: id });
    appendMessage('ai', '어디에 쓰실 돈이에요?');
    setChatStep('purpose');
  });

  const onPurpose = (id: PurposeId) => reply(() => {
    appendMessage('user', PURPOSE_LABEL[id]);
    setAnswers({ purpose: id });
    if (purposeNeedsDate(id)) {
      appendMessage('ai', '정해진 날짜가 있으면 골라 주세요.');
      setChatStep('date');
      return;
    }
    return finish();
  });

  const onDate = (id: string) => reply(() => {
    const chip = DATE_CHIPS.find((item) => item.id === id);
    appendMessage('user', chip?.label ?? id);
    setAnswers({ useDate: id === 'unknown' ? undefined : id });
    return finish();
  });

  const sendDraft = () => {
    const text = draft.trim();
    if (!text || isReplying || (maturityEntry && maturityLookup.status !== 'success') || investmentLookup.status === 'error') return;
    setDraft('');
    setPickingIndex(null);
    reply(() => submitUtterance(text));
  };

  const acceptIntent = () => reply(() => {
    const ok = confirmIntent();
    if (!ok) return;
    setPickingIndex(null);
    return finish();
  });

  const querying = maturityLookup.status === 'loading' || investmentLookup.status === 'loading';
  const blocked = isReplying || (maturityEntry && maturityLookup.status !== 'success') || investmentLookup.status === 'error';
  const needsConfirm = interpret?.items.some((item) => item.certainty === 'NEEDS_CONFIRM') ?? true;
  const showSpeech = chatStep === 'timing' || chatStep === 'purpose' || chatStep === 'date';

  return (
    <div className="won-chat">
      <header className="won-chat-header">
        <button type="button" onClick={() => navigate(backTo)} aria-label="뒤로 가기"><ChevronLeft size={26} /></button>
        <h1>AI챗봇과 대화중</h1>
        <span className="won-chat-orb" aria-hidden />
      </header>
      <nav className="won-chat-tools" aria-label="상담 메뉴">
        <button type="button" onClick={() => navigate('/navi/handoff')}><MessagesSquare size={17} aria-hidden />톡상담</button>
        <button type="button" onClick={() => navigate('/home')}><EyeOff size={17} aria-hidden />상담숨기기</button>
        <button type="button" onClick={() => {
          cancelReply();
          followReply.current = true;
          useDemoStore.getState().selectPersona(personaId);
          setPickingIndex(null);
          setDraft('');
          setExamples(false);
          bottomRef.current?.closest('.won-chat-feed')?.scrollTo(0, 0);
        }}><RotateCcw size={17} aria-hidden />처음으로</button>
      </nav>
      <main className="won-chat-feed" ref={feedRef} onScroll={(event) => {
        const feed = event.currentTarget;
        followReply.current = feed.scrollHeight - feed.scrollTop - feed.clientHeight < 70;
      }}>
        <div className="won-chat-date"><time dateTime={DEMO_TODAY}>{DEMO_TODAY.replaceAll('-', '.')}</time></div>
        <p className="won-chat-connected">AI챗봇과 연결하였습니다</p>
        {!maturityEntry && <section className="won-chat-greeting">
          <span className="won-chat-bot"><Bot size={24} aria-hidden /></span>
          <h2>{persona.name} 고객님, 안녕하세요.<br />우리은행 AI챗봇입니다.</h2>
          <p>{messages[1]?.text ?? '만기 자금을 어떻게 쓰실 계획인가요?'}</p>
        </section>}
        <div className="won-chat-messages" aria-live="polite" aria-busy={isReplying}>
          {messages.slice(2).map((message) => message.kind ? (
            <BankLookupCard key={message.id} type={message.kind === 'maturity-lookup' ? 'maturity' : 'investment'}
              onRetry={() => reply(message.kind === 'maturity-lookup'
                ? useDemoStore.getState().startMaturityChat
                : useDemoStore.getState().prepareChatOptions)} />
          ) : <ChatBubble key={message.id} role={message.role}>{message.text}</ChatBubble>)}
          {chatStep === 'interpret' && interpret && (
            <fieldset disabled={blocked} className="min-w-0">
              <InterpretCard
                items={interpret.items}
                notes={validationNotes}
                pickingIndex={pickingIndex}
                onPickDate={(index, date) => {
                  answerIntentDate(index, date);
                  setPickingIndex(null);
                }}
                onPickTiming={answerIntentTiming}
                onAskCustomDate={setPickingIndex}
              />
            </fieldset>
          )}
        </div>
        {isReplying && !querying && (
          <div className="won-chat-typing" role="status">
            <span className="won-chat-typing-dots" aria-hidden="true"><i /><i /><i /></span>
            <span>답변을 작성하고 있어요</span>
          </div>
        )}
        {showSpeech && (
          <fieldset disabled={blocked} className="won-chat-chips min-w-0">
            {chatStep === 'timing' && TIMING_CHIPS.map((chip) => <Chip key={chip.id} label={chip.label} onClick={() => onTiming(chip.id as TimingId)} />)}
            {chatStep === 'purpose' && PURPOSE_CHIPS.map((chip) => <Chip key={chip.id} label={chip.label} onClick={() => onPurpose(chip.id as PurposeId)} />)}
            {chatStep === 'date' && DATE_CHIPS.map((chip) => <Chip key={chip.id} label={chip.label} onClick={() => onDate(chip.id)} />)}
            {persona.id !== 'A' && persona.id !== 'D' && chatStep !== 'date' && <Chip label="투자 상품이 궁금해요" onClick={askInvest} />}
          </fieldset>
        )}
        {!maturityEntry && !isReplying && chatStep === 'timing' && messages.length <= 2 && (
          <section className="won-chat-guide">
            <h3><em>만기 자금</em>에 대해<br />궁금한 내용이 있으신가요?</h3>
            <p>{messages[0]?.text ?? '쓰실 날짜와 용도를 이야기해 보세요!'}</p>
            <WonArt kind="house" />
            <PrimaryButton onClick={() => inputRef.current?.focus()}>AI챗봇과 만기 상담하기</PrimaryButton>
          </section>
        )}
        <div ref={bottomRef} />
      </main>
      <footer className="won-chat-footer">
        {chatStep === 'closing' ? (
          <PrimaryButton disabled={blocked} onClick={() => navigate('/navi/options')}>선택지 보기</PrimaryButton>
        ) : chatStep === 'handoff' ? (
          <PrimaryButton disabled={blocked} onClick={() => navigate('/navi/handoff')}>전문가에게 연결</PrimaryButton>
        ) : chatStep === 'interpret' ? (
          <div className="space-y-2">
            <PrimaryButton disabled={blocked || needsConfirm} onClick={acceptIntent}>이대로 맞아요</PrimaryButton>
            <SecondaryButton disabled={blocked} onClick={() => reply(() => {
              reviseIntent();
              setPickingIndex(null);
              appendMessage('ai', '다시 말씀해 주시거나 아래에서 골라 주세요.');
            })}>고칠게요</SecondaryButton>
          </div>
        ) : (
          <>
            {examples && <fieldset disabled={blocked} className="won-chat-chips won-chat-examples min-w-0">
              {['학비 반, 나머지는 이사', '내년 봄쯤 이사', '몇 년 묵혀 둘 돈'].map((label, index) => (
                <Chip key={label} label={label} onClick={() => {
                  setDraft(EXAMPLE_UTTERANCES[index] ?? '');
                  setExamples(false);
                  inputRef.current?.focus();
                }} />
              ))}
            </fieldset>}
            <form className="won-chat-composer" onSubmit={(event) => {
              event.preventDefault();
              sendDraft();
              setExamples(false);
            }}>
              <button type="button" disabled={blocked} aria-label="예시 메시지" aria-expanded={examples} onClick={() => setExamples(!examples)}><Plus size={24} /></button>
              <div>
                <input ref={inputRef} readOnly={blocked} value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="직접 말하기" placeholder="메시지를 입력해 주세요" />
                <button type="submit" disabled={blocked || !draft.trim()} aria-label="보내기"><Send size={19} /></button>
              </div>
            </form>
          </>
        )}
      </footer>
    </div>
  );
}
