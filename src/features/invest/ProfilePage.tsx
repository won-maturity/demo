import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { ChatBubble } from '../../components/ui/ChatBubble';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { estimateHorizon, getEligibleOptions } from '../../engine/rules';
import { formatDotDate } from '../../lib/format';
import { getPersona } from '../../mock/personas';
import { useDemoStore } from '../../store/useDemoStore';

export function ProfilePage() {
  const navigate = useNavigate();
  const personaId = useDemoStore((state) => state.personaId);
  const lookup = useDemoStore((state) => state.investmentLookup);
  const fetchProfile = useDemoStore((state) => state.fetchInvestmentContext);
  const markInvest = useDemoStore((state) => state.markInvest);
  const addConsent = useDemoStore((state) => state.addConsent);
  const answers = useDemoStore((state) => state.answers);
  const selectedProductId = useDemoStore((state) => state.selectedProductId);

  useEffect(() => {
    if (lookup.status === 'idle') void fetchProfile();
  }, [lookup.status, fetchProfile]);

  if (!personaId) return null;
  const persona = getPersona(personaId);
  const estimated = estimateHorizon(answers);
  const profile = lookup.status === 'success' ? lookup.data : null;
  const chosen = profile ? getEligibleOptions({
    ...persona, riskProfile: profile.riskProfile, investmentPreference: profile.investmentPreference,
  }, estimated.horizon, estimated.useDate, { purpose: answers.purpose }).options.find((option) => option.productId === selectedProductId) : undefined;
  const blocked = !profile || profile.diagnosis.state !== 'valid' || chosen?.kind !== 'invest';

  return (
    <Screen title="기존 투자성향 확인" onBack={() => navigate('/navi/options')}
      footer={<PrimaryButton disabled={blocked} onClick={() => {
        if (!profile) return;
        addConsent(`외부에서 가져온 투자성향 ${profile.riskProfile} 결과를 확인했어요.`);
        markInvest('profile');
        navigate('/navi/invest/explain');
      }}>조회한 성향을 확인했어요</PrimaryButton>}>
      <ChatBubble role="ai">기존 고객 진단 결과를 가져왔어요. 이 화면에서는 새로운 성향 진단을 하지 않아요.</ChatBubble>
      {profile ? <Card className="mt-3">
        <p className="text-sm text-textBody">등록된 진단 결과</p>
        <h2 className="mt-1 text-2xl font-bold text-textStrong">{profile.riskProfile}</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone={profile.diagnosis.state === 'valid' ? 'safe' : 'caution'}>{profile.diagnosis.label}</Badge>
          <span className="text-sm text-textBody">진단일 {profile.diagnosedAt ? formatDotDate(profile.diagnosedAt) : '없음'}</span>
        </div>
        {profile.diagnosis.state !== 'valid' && <p className="mt-3 text-sm leading-6 text-textBody">외부 진단 서비스에서 진단을 갱신한 뒤 결과를 다시 가져와야 투자 상품을 진행할 수 있어요.</p>}
        {chosen?.guide && <p className="mt-3 text-sm leading-6 text-textBody">{chosen.guide}</p>}
      </Card> : <Card className="mt-3"><p role="status">{lookup.status === 'error' ? lookup.message : '기존 투자성향을 가져오고 있어요.'}</p></Card>}
      {lookup.status === 'error' && <div className="mt-3"><PrimaryButton onClick={() => void fetchProfile()}>다시 가져오기</PrimaryButton></div>}
    </Screen>
  );
}
