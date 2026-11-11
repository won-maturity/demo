import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { SecondaryButton } from '../../components/ui/Buttons';
import { PERSONAS } from '../../mock/personas';
import { useDemoStore } from '../../store/useDemoStore';

const principles = [
  ['안전한 기본값', '무응답이면 재예치'],
  ['위험할수록 절차', '투자는 숙려까지'],
  ['AI는 해석', '판단은 규칙'],
  ['취약 고객', '사람에게 연결'],
];

export function LauncherPage() {
  const navigate = useNavigate();
  const selectPersona = useDemoStore((state) => state.selectPersona);
  const engineOn = useDemoStore((state) => state.enginePanelEnabled);
  const setEngine = useDemoStore((state) => state.setEnginePanelEnabled);
  const lookupFailureOnce = useDemoStore((state) => state.lookupFailureOnce);
  const setLookupFailureOnce = useDemoStore((state) => state.setLookupFailureOnce);

  return (
    <div className="h-full overflow-y-auto bg-bg px-5 py-5">
      <div className="flex min-h-tap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-primary">우리WON뱅킹</p>
        <Link to="/home" className="inline-flex min-h-tap items-center text-sm font-semibold text-primary">홈으로</Link>
      </div>
      <h1 className="mt-1 text-[26px] font-bold leading-8 text-textStrong">WON하는 만기</h1>
      <p className="mt-2 text-sm leading-6 text-textBody">쓸 날짜와 목표에 맞춰 내 만기 자금이 한 번 더 일하게</p>
      <ul className="mt-4 grid grid-cols-2 gap-2">
        {principles.map(([title, detail]) => (
          <li key={title} className="rounded-card bg-surface px-3 py-2 shadow-card">
            <p className="text-[13px] font-bold text-textStrong">{title}</p>
            <p className="text-xs text-textBody">{detail}</p>
          </li>
        ))}
      </ul>
      <h2 className="mb-2 mt-5 text-sm font-bold text-textStrong">시연할 고객</h2>
      <div className="space-y-3">
        {PERSONAS.map((persona) => (
          <Card key={persona.id} className="p-0">
            <button
              type="button"
              className="w-full p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              onClick={() => {
                selectPersona(persona.id);
                navigate('/home');
              }}
            >
              <div className="flex items-center gap-2">
                <Badge tone="neutral">페르소나 {persona.id}</Badge>
                {persona.id === 'D' ? <Badge tone="ai">추천 시연</Badge> : null}
                <span className="text-[15px] font-bold text-textStrong">
                  {persona.name} · {persona.age}세
                </span>
              </div>
              <p className="mt-1 text-[13px] text-textBody">{persona.riskProfile} · 정기예금</p>
              <p className="mt-2 text-sm leading-6 text-textStrong">{persona.outcome}</p>
              <span className="mt-3 inline-flex min-h-tap items-center text-sm font-bold text-primary">이 고객으로 시작</span>
            </button>
          </Card>
        ))}
      </div>
      <div className="mt-4 space-y-2 pb-4">
        <label className="block rounded-card bg-surface p-4 text-sm font-semibold text-textStrong">
          조회 실패 시연
          <select className="mt-2 min-h-tap w-full rounded-button border border-line px-3"
            value={lookupFailureOnce}
            onChange={(event) => setLookupFailureOnce(event.target.value as 'none' | 'maturity' | 'investment')}>
            <option value="none">정상 조회</option>
            <option value="maturity">다음 만기 조회 1회 실패</option>
            <option value="investment">다음 투자성향 조회 1회 실패</option>
          </select>
          <span className="mt-2 block text-xs font-normal text-textBody">설정 후 시연 고객을 다시 선택하면 새 조회로 시작합니다.</span>
        </label>
        <SecondaryButton onClick={() => navigate('/simulator', { state: { fromDemo: true } })}>수익성 시뮬레이터 보기</SecondaryButton>
        <SecondaryButton onClick={() => navigate('/navi/no-response', { state: { fromDemo: true } })}>무응답이면 어떻게 되나요</SecondaryButton>
        <button
          type="button"
          aria-pressed={engineOn}
          onClick={() => setEngine(!engineOn)}
          className="flex min-h-tap w-full items-center justify-between rounded-button border border-line bg-surface px-4 text-sm font-semibold text-textStrong"
        >
          <span>엔진 패널 {engineOn ? '끄기' : '켜기'}</span>
          <span className={`relative h-6 w-11 rounded-chip ${engineOn ? 'bg-primary' : 'bg-line'}`}>
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface transition ${engineOn ? 'left-5' : 'left-0.5'}`}
            />
          </span>
        </button>
      </div>
    </div>
  );
}
