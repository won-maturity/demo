import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { OfficialProductSource } from '../../components/ui/OfficialProductSource';
import { Screen } from '../../components/ui/Screen';
import { AFFILIATE_PRODUCTS } from '../../mock/products';

export function AffiliateProductsPage() {
  const navigate = useNavigate();
  return <Screen title="우리금융그룹 상품" onBack={() => navigate(-1)}>
    <h2 className="text-xl font-bold text-textStrong">계열사 상품도 함께 살펴보세요</h2>
    <p className="mb-4 mt-2 text-sm leading-6 text-textBody">공식 자료에서 확인한 상품 정보예요. 만기 상담에서는 등록된 투자성향과 사용 시점에 맞는 상품을 비교해 드려요.</p>
    <div className="space-y-4">
      {AFFILIATE_PRODUCTS.map((product) => <Card key={product.id}>
        <p className="text-sm font-semibold text-primary">{product.provider}</p>
        <h3 className="mt-1 text-lg font-bold text-textStrong">{product.name}</h3>
        {product.ticker && <p className="mt-1 text-sm text-textBody">종목코드 {product.ticker} · ETF</p>}
        <p className="mt-2 text-sm leading-6 text-textBody">{product.summary}</p>
        <p className="mt-2 text-sm font-semibold text-textStrong">{product.rateText}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone={product.riskTone}>{product.riskLabel}</Badge>
          <Badge tone="danger">원금비보장</Badge>
          <Badge tone="caution">예금자보호 없음</Badge>
        </div>
        <p className="mt-3 text-sm leading-6 text-textBody">{product.feeText}</p>
        <OfficialProductSource url={product.officialUrl} provider={product.provider} checkedAt={product.officialCheckedAt} />
      </Card>)}
    </div>
    <p className="mt-4 text-xs leading-5 text-textBody">실제 계열사 상품을 소개하는 데모 화면이에요. 실제 가입·매매는 해당 금융회사의 절차를 따라야 해요.</p>
  </Screen>;
}
