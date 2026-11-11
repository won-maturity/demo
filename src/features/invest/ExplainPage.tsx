import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { OfficialProductSource } from '../../components/ui/OfficialProductSource';
import { getProduct } from '../../mock/products';
import { useDemoStore } from '../../store/useDemoStore';

const rows = [
  { key: 'loss' as const, label: '원금 손실이 날 수 있어요' },
  { key: 'protect' as const, label: '예금자보호가 적용되지 않아요' },
  { key: 'fee' as const, label: '보수·수수료 조건을 확인했어요' },
];

export function ExplainPage() {
  const navigate = useNavigate();
  const personaId = useDemoStore((state) => state.personaId);
  const selectedProductId = useDemoStore((state) => state.selectedProductId);
  const checked = useDemoStore((state) => state.explainChecked);
  const toggleExplain = useDemoStore((state) => state.toggleExplain);
  const markInvest = useDemoStore((state) => state.markInvest);
  const addConsent = useDemoStore((state) => state.addConsent);
  if (!personaId) return null;
  const product = getProduct(selectedProductId);
  const ready = rows.every((row) => checked[row.key]);

  return (
    <Screen
      title="핵심 설명"
      onBack={() => navigate('/navi/invest/profile')}
      footer={
        <PrimaryButton
          disabled={!ready}
          onClick={() => {
            rows.forEach((row) => addConsent(`${row.label}를 확인했어요.`));
            markInvest('explain');
            navigate('/navi/invest/quiz');
          }}
        >
          이해도 확인하기
        </PrimaryButton>
      }
    >
      <div className="rounded-card bg-danger/10 px-4 py-3 text-sm font-semibold leading-6 text-dangerText">
        원금 손실이 날 수 있고, 예금자보호가 적용되지 않아요.
      </div>
      <Card className="mt-3">
        <h2 className="text-lg font-bold text-textStrong">{product.name}</h2>
        {product.provider && <p className="text-sm text-textBody">연결 서비스 · {product.provider}</p>}
        <p className="mt-2 text-sm leading-6 text-textBody">{product.summary}</p>
        <p className="mt-3 text-sm leading-6 text-textBody">원금의 일부 또는 전부를 잃을 수 있어요. 손실 한도나 미래 수익률을 약속하는 상품이 아니에요.</p>
        <p className="mt-3 text-sm leading-6 text-textBody">{product.feeText}</p>
        <OfficialProductSource url={product.officialUrl} provider={product.provider} checkedAt={product.officialCheckedAt} />
        <p className="mt-3 text-xs leading-5 text-textBody">이후 이해도 확인과 다음 날 승인은 데모의 시연 절차예요. 실제 가입·매매 조건은 해당 금융회사에서 확인해 주세요.</p>
      </Card>
      <p className="mb-2 mt-4 text-sm font-bold text-textStrong">확인하고 체크해 주세요</p>
      <div className="space-y-2">
        {rows.map((row) => (
          <button
            key={row.key}
            type="button"
            aria-pressed={checked[row.key]}
            onClick={() => toggleExplain(row.key)}
            className="flex min-h-tap w-full items-center gap-3 rounded-card bg-surface px-4 text-left shadow-card"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-md border text-xs font-bold ${
                checked[row.key] ? 'border-primary bg-primary text-white' : 'border-line'
              }`}
            >
              {checked[row.key] ? '✓' : ''}
            </span>
            <span className="text-sm font-semibold text-textStrong">{row.label}</span>
          </button>
        ))}
      </div>
    </Screen>
  );
}
