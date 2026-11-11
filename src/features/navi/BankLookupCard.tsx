import { CheckCircle2, Landmark, LoaderCircle, TriangleAlert } from 'lucide-react';
import { formatDotDate, formatWon } from '../../lib/format';
import { useDemoStore } from '../../store/useDemoStore';

export function BankLookupCard({ type, onRetry }: { type: 'maturity' | 'investment'; onRetry: () => void }) {
  const maturity = useDemoStore((state) => state.maturityLookup);
  const investment = useDemoStore((state) => state.investmentLookup);
  const lookup = type === 'maturity' ? maturity : investment;
  const title = type === 'maturity' ? '은행 조회 정보' : '투자성향 조회 정보';
  const label = type === 'maturity' ? '만기 상품 정보를 확인하고 있어요' : '등록된 투자성향을 확인하고 있어요';
  return (
    <section className="won-bank-lookup" aria-label={title}>
      <header><Landmark size={17} aria-hidden /><h2>{title}</h2><small>시연 데이터</small></header>
      {(lookup.status === 'loading' || lookup.status === 'idle') && (
        <p className="won-bank-lookup-status" role="status"><LoaderCircle className="won-bank-lookup-spinner" size={17} aria-hidden />{label}</p>
      )}
      {lookup.status === 'error' && (
        <div className="won-bank-lookup-error">
          <p role="alert"><TriangleAlert size={17} aria-hidden />{lookup.message}</p>
          <button type="button" onClick={onRetry}>다시 조회하기</button>
        </div>
      )}
      {type === 'maturity' && maturity.status === 'success' && (
        <>
          <p className="won-bank-lookup-product"><CheckCircle2 size={15} aria-hidden />{maturity.data.productName}</p>
          <dl>
            <div><dt>원금</dt><dd>{formatWon(maturity.data.principal)}</dd></div>
            <div><dt>예상 이자<small>1년 단순 계산 · 예시</small></dt><dd>{formatWon(maturity.data.estimatedInterest)}</dd></div>
            <div><dt>현재 금리<small>예시</small></dt><dd>연 {(maturity.data.annualRate * 100).toFixed(2)}%</dd></div>
            <div><dt>만기일</dt><dd>{formatDotDate(maturity.data.maturityDate)} · D-{maturity.data.daysToMaturity}</dd></div>
            <div><dt>자동 재예치</dt><dd>{maturity.data.autoRedeposit ? '켜짐' : '꺼짐'}</dd></div>
          </dl>
          <p className="won-bank-lookup-source">조회 기준 {formatDotDate(maturity.data.checkedAt)}</p>
        </>
      )}
      {type === 'investment' && investment.status === 'success' && (
        <>
          <dl>
            <div><dt>등록된 투자성향</dt><dd>{investment.data.riskProfile}</dd></div>
            <div><dt>진단일</dt><dd>{investment.data.diagnosedAt ? formatDotDate(investment.data.diagnosedAt) : '미진단'}</dd></div>
            <div><dt>진단 상태</dt><dd>{investment.data.diagnosis.label}</dd></div>
          </dl>
          {investment.data.diagnosis.state !== 'valid' && <p className="won-bank-lookup-source">투자 상품을 진행하기 전에 재진단이 필요해요.</p>}
        </>
      )}
    </section>
  );
}
