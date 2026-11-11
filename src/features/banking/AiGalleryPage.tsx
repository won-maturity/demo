import { useEffect, useState } from 'react';
import { Banknote, Calculator, ChartCandlestick, ChartPie, ChevronRight, ChevronUp, FileChartColumn, House, PiggyBank, TrendingUp, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Screen } from '../../components/ui/Screen';
import { formatWon } from '../../lib/format';
import { useDemoStore } from '../../store/useDemoStore';
import { BankLookupCard } from '../navi/BankLookupCard';
import './ai-gallery.css';

const groups = [
  { id: 'consult', accent: '금융상담', title: '이 필요할 때', detail: '일반 금융 상담부터 상품 전문 상담까지', items: [
    { label: 'AI대출상담원', icon: Banknote, color: 'cyan', to: '/banking/category/loans' },
    { label: 'AI예적금상담원', icon: PiggyBank, color: 'pink', to: '/navi/chat' },
    { label: 'AI청약상담원', icon: House, color: 'purple', to: '/banking/category/housing' },
  ] },
  { id: 'analysis', accent: '자산점검', title: '이 필요할 때', detail: '자산/소득 정보로 재무 현황 살펴보기', items: [
    { label: 'AI재무진단', icon: FileChartColumn, color: 'blue', to: '/assets' },
    { label: 'AI투자진단', icon: TrendingUp, color: 'blue', to: '/ai-gallery/investment' },
    { label: 'AI목표진단', icon: ChartPie, color: 'indigo', to: '/savings' },
    { label: 'AI시장진단', icon: ChartCandlestick, color: 'orange', to: '/stocks' },
  ] },
  { id: 'light', accent: '가볍게 써보는 AI', title: '', detail: 'AI로 금융 계산부터 성향 테스트까지', items: [
    { label: 'AI대출계산기', icon: Calculator, color: 'gray', to: '/ai-gallery/loan-calculator' },
    { label: 'AI금융MBTI', icon: ChartPie, color: 'mint', to: '/ai-gallery/investment' },
  ] },
];

export function AiGalleryPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const returnTo = state?.returnTo === '/navi/chat' ? '/navi/chat' : '/home';
  const returnState = state?.returnState;
  return (
    <div className="won-ai-gallery">
      <header className="won-ai-gallery-header">
        <h1>AI갤러리</h1>
        <button type="button" aria-label="AI갤러리 닫기" onClick={() => navigate(returnTo, { replace: true, state: returnState })}><X size={26} /></button>
      </header>
      <main className="won-ai-gallery-content">
        {groups.map((group) => <details key={group.id} className="won-ai-gallery-group" open>
          <summary><span><strong><em>{group.accent}</em>{group.title}</strong><small>{group.detail}</small></span><ChevronUp size={20} aria-hidden /></summary>
          <nav aria-label={group.accent}>
            {group.items.map(({ label, icon: Icon, color, to }) => <Link key={label} to={to} state={to === '/navi/chat' ? returnState : undefined}>
              <span className={`won-ai-gallery-icon won-ai-gallery-icon--${color}`}><Icon size={23} aria-hidden /></span>
              <span>{label}</span><ChevronRight size={20} aria-hidden />
            </Link>)}
          </nav>
        </details>)}
      </main>
    </div>
  );
}

export function GalleryInvestmentPage() {
  const navigate = useNavigate();
  const lookup = useDemoStore((state) => state.investmentLookup);
  const fetchProfile = useDemoStore((state) => state.fetchInvestmentContext);
  useEffect(() => {
    if (lookup.status === 'idle') void fetchProfile();
  }, [lookup.status, fetchProfile]);
  return <Screen title="기존 진단·분석 결과" onBack={() => navigate(-1)}>
    <p className="mb-3 text-sm leading-6 text-textBody">기존 서비스의 진단과 분석 결과를 가져옵니다.</p>
    <BankLookupCard type="investment" onRetry={() => void fetchProfile()} />
  </Screen>;
}

export function GalleryLoanCalculatorPage() {
  const navigate = useNavigate();
  const [principal, setPrincipal] = useState(30_000_000);
  const [rate, setRate] = useState(4);
  const [months, setMonths] = useState(36);
  const monthlyRate = rate / 1200;
  const payment = monthlyRate === 0 ? principal / months : principal * monthlyRate / (1 - (1 + monthlyRate) ** -months);
  const valid = principal > 0 && rate >= 0 && months > 0 && Number.isInteger(months) && Number.isFinite(payment);
  return <Screen title="AI대출계산기" onBack={() => navigate(-1)}>
    <div className="space-y-4 rounded-card bg-surface p-4">
      <h2 className="text-lg font-bold">원리금균등 상환 계산</h2>
      <label className="block text-sm">대출금액 (원)<input className="mt-1 min-h-tap w-full rounded-button border border-line px-3" type="number" min="1" value={principal} onChange={(event) => setPrincipal(event.target.valueAsNumber || 0)} /></label>
      <label className="block text-sm">연 이자율 (%)<input className="mt-1 min-h-tap w-full rounded-button border border-line px-3" type="number" min="0" step="0.1" value={rate} onChange={(event) => setRate(event.target.valueAsNumber || 0)} /></label>
      <label className="block text-sm">상환기간 (개월)<input className="mt-1 min-h-tap w-full rounded-button border border-line px-3" type="number" min="1" step="1" value={months} onChange={(event) => setMonths(event.target.valueAsNumber || 0)} /></label>
      <p role="status" className="text-primary">{valid ? `월 상환액 약 ${formatWon(payment)}` : '금액, 금리와 기간을 확인해 주세요.'}</p>
      <p className="text-xs leading-5 text-textBody">입력값으로 계산한 예시입니다. 수수료·납입일 차이 등은 포함하지 않습니다.</p>
    </div>
  </Screen>;
}
