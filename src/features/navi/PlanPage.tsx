import { Navigate, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { formatDotDate } from '../../lib/format';
import { daysUntil } from '../../mock/personas';
import { useDemoStore } from '../../store/useDemoStore';
import { PlanCard } from './PlanCard';

export function PlanPage() {
  const navigate = useNavigate();
  const plan = useDemoStore((state) => state.plan);
  const planHistory = useDemoStore((state) => state.planHistory);
  const startPlanRevision = useDemoStore((state) => state.startPlanRevision);
  if (!plan) return <Navigate to="/navi/summary" replace />;

  return (
    <Screen
      title="내 만기 계획"
      onBack={() => navigate('/home')}
      footer={
        <>
          <PrimaryButton
            onClick={() => {
              startPlanRevision();
              navigate('/navi/chat', { state: { revising: true } });
            }}
          >
            AI와 계획 고치기
          </PrimaryButton>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="inline-flex min-h-tap w-full items-center justify-center rounded-button px-4 text-[15px] font-semibold text-textWeak transition active:bg-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            이대로 둘게요
          </button>
        </>
      }
    >
      <p className="text-sm leading-6 text-textBody">
        {formatDotDate(plan.executeOn)}(D-{daysUntil(plan.executeOn)})에 아래 계획대로 실행돼요. 만기일 전이라 날짜나 금액을 바꿔도 중도해지 손해가 없어요.
      </p>
      <div className="mt-3">
        <PlanCard plan={plan} />
      </div>
      {planHistory.length > 0 && (
        <Card className="mt-3">
          <p className="text-sm font-bold text-textStrong">바꾼 기록</p>
          <ul className="mt-2 space-y-2">
            {planHistory.map((change, index) => (
              <li key={`${change.at}-${index}`} className="text-[13px] leading-5 text-textBody">
                <span className="block text-textWeak">{change.at.replace(/-/g, '.')}</span>
                {change.lines.join(' / ')}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </Screen>
  );
}
