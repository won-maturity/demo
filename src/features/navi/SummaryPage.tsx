import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AmountText } from '../../components/ui/AmountText';
import { ExampleValue } from '../../components/ui/AmountText';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { formatDotDate } from '../../lib/format';
import { daysUntil, exampleInterest, getPersona } from '../../mock/personas';
import { REDEPOSIT_ID } from '../../mock/products';
import { useDemoStore } from '../../store/useDemoStore';

const POST_MATURITY_RATES = [
  { period: '1개월 이내', ratio: 0.5 },
  { period: '1개월 초과 ~ 6개월', ratio: 0.3 },
  { period: '6개월 초과', ratio: 0.2 },
];

const choiceButton =
  'min-h-tap rounded-button border px-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export function SummaryPage() {
  const navigate = useNavigate();
  const personaId = useDemoStore((state) => state.personaId);
  const autoRedeposit = useDemoStore((state) => state.autoRedeposit);
  const selectProduct = useDemoStore((state) => state.selectProduct);
  const addConsent = useDemoStore((state) => state.addConsent);
  const [open, setOpen] = useState(false);
  if (!personaId) return null;
  const persona = getPersona(personaId);
  const interest = exampleInterest(persona.principal, persona.annualRate);

  return (
    <Screen
      title="만기 상품 요약"
      onBack={() => navigate('/home')}
      footer={
        <>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="inline-flex min-h-tap w-full items-center justify-center rounded-button px-4 text-[15px] font-semibold text-textWeak transition active:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            이번에는 괜찮아요
          </button>
        </>
      }
    >
      <p className="text-sm leading-6 text-textBody">
        안전한 기본값이에요. 응답이 없어도 미리 동의한 재예치만 실행돼요.
      </p>
      <Card className="mt-3 space-y-3">
        <div>
          <p className="text-[13px] text-textBody">원금</p>
          <AmountText value={persona.principal} />
        </div>
        <div>
          <p className="text-[13px] text-textBody">예상 이자 · 1년 단순 계산</p>
          <AmountText value={interest} example />
        </div>
        <div>
          <p className="text-[13px] text-textBody">현재 금리</p>
          <ExampleValue>{`연 ${(persona.annualRate * 100).toFixed(2)}%`}</ExampleValue>
        </div>
        <div>
          <p className="text-[13px] text-textBody">만기일</p>
          <p className="text-lg font-bold text-textStrong">
            {formatDotDate(persona.maturityDate)} · D-{daysUntil(persona.maturityDate)}
          </p>
        </div>
      </Card>
      <Card className="mt-3">
        <p className="text-[15px] font-bold text-textStrong">사전 동의된 자동 재예치</p>
        <p className="mt-1 text-[13px] leading-5 text-textBody">자동 재예치를 고르면 만기일에 같은 조건으로 다시 맡겨요.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              selectProduct(REDEPOSIT_ID);
              addConsent('만기 요약에서 자동 재예치를 골랐어요.');
              navigate('/navi/confirm-deposit', { state: { fromSummary: true } });
            }}
            className={`${choiceButton} border-primary bg-primary text-white active:bg-primaryPressed`}
          >
            자동 재예치
          </button>
          <button
            type="button"
            onClick={() => navigate('/navi/chat', { state: { fromMaturity: true } })}
            className={`${choiceButton} border-line bg-surface text-textStrong active:bg-bg`}
          >
            다른 상품도 궁금해요
          </button>
        </div>
      </Card>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mt-3 flex min-h-tap w-full items-center justify-between rounded-card bg-surface px-4 text-left shadow-card"
        aria-expanded={open}
      >
        <span className="text-sm font-bold text-textStrong">아무것도 하지 않으면 어떻게 되나요?</span>
        <ChevronDown size={18} className={`text-textWeak ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open ? (
        <div className="mt-2 rounded-card bg-surface px-4 py-3 text-sm leading-6 text-textBody shadow-card">
          <p>
            만기일이 지나도 찾지 않고 두시면 만기 후 이율이 적용돼 이자가 줄어요. 지금 금리
            {` 연 ${(persona.annualRate * 100).toFixed(2)}%`}를 기준으로 하면 이렇게 돼요.
          </p>
          <ul className="mt-2 divide-y divide-line">
            {POST_MATURITY_RATES.map((tier) => (
              <li key={tier.period} className="flex items-center justify-between py-2">
                <span className="text-textStrong">{tier.period}</span>
                <span>
                  약정 금리의 <strong className="text-textStrong">{tier.ratio * 100}%</strong>
                  {` · 연 ${(persona.annualRate * tier.ratio * 100).toFixed(2)}%`}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[13px] text-textWeak">
            {autoRedeposit
              ? '자동 재예치가 켜져 있으면 만기일에 같은 조건으로 다시 맡겨요. 이자 손해가 없어요.'
              : '자동 재예치가 꺼져 있어요. 만기일 이후 찾지 않으면 위 이율이 적용돼요.'}
          </p>
          <p className="mt-1 text-[12px] text-textWeak">시연용 예시 계산이에요.</p>
        </div>
      ) : null}
    </Screen>
  );
}
