import { useEffect, useRef, useState } from 'react';
import { Bot, ChevronLeft, EyeOff, MessagesSquare, Plus, RotateCcw, Send } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChatBubble } from '../../components/ui/ChatBubble';
import { Chip } from '../../components/ui/Chip';
import { PrimaryButton, SecondaryButton } from '../../components/ui/Buttons';
import { WonArt } from '../banking/WonCurrentUI';
import './won-chat.css';
import { EXAMPLE_UTTERANCES } from '../../engine/interpret';
import { estimateHorizon, getEligibleOptions, needsHandoff } from '../../engine/rules';
import { InterpretCard } from './InterpretCard';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [examples, setExamples] = useState(false);
  const personaId = useDemoStore((state) => state.personaId);
  const messages = useDemoStore((state) => state.messages);
  const chatStep = useDemoStore((state) => state.chatStep);
  const appendMessage = useDemoStore((state) => state.appendMessage);
  const setChatStep = useDemoStore((state) => state.setChatStep);
  const setAnswers = useDemoStore((state) => state.setAnswers);
  const setHandoff = useDemoStore((state) => state.setHandoff);
  const interpret = useDemoStore((state) => state.interpret);
  const validationNotes = useDemoStore((state) => state.validationNotes);
  const submitUtterance = useDemoStore((state) => state.submitUtterance);
  const answerIntentDate = useDemoStore((state) => state.answerIntentDate);
  const answerIntentTiming = useDemoStore((state) => state.answerIntentTiming);
  const confirmIntent = useDemoStore((state) => state.confirmIntent);
  const reviseIntent = useDemoStore((state) => state.reviseIntent);
  const [draft, setDraft] = useState('');
  const [pickingIndex, setPickingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (messages.length > 2 || chatStep !== 'timing') bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, chatStep, interpret]);

  if (!personaId) return null;
  const persona = getPersona(personaId);

  const finish = () => {
    const latest = useDemoStore.getState().answers;
    const estimated = estimateHorizon(latest);
    const choice = getEligibleOptions(persona, estimated.horizon, estimated.useDate, { purpose: latest.purpose });
    appendMessage('ai', '말씀해 주신 내용으로 선택지를 골랐어요. 고르는 기준은 투자성향과 자금 기간이에요.');
    appendMessage('ai', `${choice.heard} ${choice.decision}`);
    setChatStep('closing');
  };

  const askInvest = () => {
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
  };

  const onTiming = (id: TimingId) => {
    appendMessage('user', TIMING_LABEL[id]);
    setAnswers({ timing: id });
    appendMessage('ai', '어디에 쓰실 돈이에요?');
    setChatStep('purpose');
  };

  const onPurpose = (id: PurposeId) => {
    appendMessage('user', PURPOSE_LABEL[id]);
    setAnswers({ purpose: id });
    if (purposeNeedsDate(id)) {
      appendMessage('ai', '정해진 날짜가 있으면 골라 주세요.');
      setChatStep('date');
      return;
    }
    finish();
  };

  const onDate = (id: string) => {
    const chip = DATE_CHIPS.find((item) => item.id === id);
    appendMessage('user', chip?.label ?? id);
    setAnswers({ useDate: id === 'unknown' ? undefined : id });
    finish();
  };

  const sendDraft = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    setPickingIndex(null);
    submitUtterance(text);
  };

  const acceptIntent = () => {
    const ok = confirmIntent();
    if (!ok) return;
    setPickingIndex(null);
    finish();
  };

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
          useDemoStore.getState().selectPersona(personaId);
          setPickingIndex(null);
          setDraft('');
          setExamples(false);
          bottomRef.current?.closest('.won-chat-feed')?.scrollTo(0, 0);
        }}><RotateCcw size={17} aria-hidden />처음으로</button>
      </nav>
      <main className="won-chat-feed">
        <div className="won-chat-date"><time dateTime={DEMO_TODAY}>{DEMO_TODAY.replaceAll('-', '.')}</time></div>
        <p className="won-chat-connected">AI챗봇과 연결하였습니다</p>
        <section className="won-chat-greeting">
          <span className="won-chat-bot"><Bot size={24} aria-hidden /></span>
          <h2>{persona.name} 고객님, 안녕하세요.<br />우리은행 AI챗봇입니다.</h2>
          <p>{messages[1]?.text ?? '만기 자금을 어떻게 쓰실 계획인가요?'}</p>
        </section>
        <div className="won-chat-messages" aria-live="polite">
          {messages.slice(2).map((message) => <ChatBubble key={message.id} role={message.role}>{message.text}</ChatBubble>)}
          {chatStep === 'interpret' && interpret && (
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
          )}
        </div>
        {showSpeech && (
          <div className="won-chat-chips">
            {chatStep === 'timing' && TIMING_CHIPS.map((chip) => <Chip key={chip.id} label={chip.label} onClick={() => onTiming(chip.id as TimingId)} />)}
            {chatStep === 'purpose' && PURPOSE_CHIPS.map((chip) => <Chip key={chip.id} label={chip.label} onClick={() => onPurpose(chip.id as PurposeId)} />)}
            {chatStep === 'date' && DATE_CHIPS.map((chip) => <Chip key={chip.id} label={chip.label} onClick={() => onDate(chip.id)} />)}
            {persona.id !== 'A' && persona.id !== 'D' && chatStep !== 'date' && <Chip label="투자 상품이 궁금해요" onClick={askInvest} />}
          </div>
        )}
        {chatStep === 'timing' && messages.length <= 2 && (
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
          <PrimaryButton onClick={() => navigate('/navi/options')}>선택지 보기</PrimaryButton>
        ) : chatStep === 'handoff' ? (
          <PrimaryButton onClick={() => navigate('/navi/handoff')}>전문가에게 연결</PrimaryButton>
        ) : chatStep === 'interpret' ? (
          <div className="space-y-2">
            <PrimaryButton disabled={needsConfirm} onClick={acceptIntent}>이대로 맞아요</PrimaryButton>
            <SecondaryButton onClick={() => {
              reviseIntent();
              setPickingIndex(null);
              appendMessage('ai', '다시 말씀해 주시거나 아래에서 골라 주세요.');
            }}>고칠게요</SecondaryButton>
          </div>
        ) : (
          <>
            {examples && <div className="won-chat-chips won-chat-examples">
              {['학비 반, 나머지는 이사', '내년 봄쯤 이사', '몇 년 묵혀 둘 돈'].map((label, index) => (
                <Chip key={label} label={label} onClick={() => {
                  setDraft(EXAMPLE_UTTERANCES[index] ?? '');
                  setExamples(false);
                  inputRef.current?.focus();
                }} />
              ))}
            </div>}
            <form className="won-chat-composer" onSubmit={(event) => {
              event.preventDefault();
              sendDraft();
              setExamples(false);
            }}>
              <button type="button" aria-label="예시 메시지" aria-expanded={examples} onClick={() => setExamples(!examples)}><Plus size={24} /></button>
              <div>
                <input ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="직접 말하기" placeholder="메시지를 입력해 주세요" />
                <button type="submit" disabled={!draft.trim()} aria-label="보내기"><Send size={19} /></button>
              </div>
            </form>
          </>
        )}
      </footer>
    </div>
  );
}
