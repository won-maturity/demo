export type ProductKind = 'redeposit' | 'deposit' | 'invest';

export type CatalogProduct = {
  id: string;
  name: string;
  summary: string;
  annualRate: number | null;
  rateText: string;
  isExample: boolean;
  officialUrl?: string;
  officialCheckedAt?: string;
  ticker?: string;
  feeText?: string;
  principalGuaranteed: boolean;
  riskLabel: string;
  riskTone: 'safe' | 'caution' | 'danger';
  kind: ProductKind;
  provider?: string;
};

export const REDEPOSIT_ID = 'redeposit';
export const INVEST_ID = 'woori-securities-rp-cma';
export const ETF_PORTFOLIO_ID = 'won-sp500-etf';

export const PRODUCTS: CatalogProduct[] = [
  {
    id: ETF_PORTFOLIO_ID,
    name: 'WON 미국S&P500',
    provider: '우리자산운용',
    ticker: '444490',
    officialUrl: 'https://www.wooriam.kr/investment/etf-view/6acWapbyV1JaJ7do',
    officialCheckedAt: '2026-11-11',
    summary: '미국 S&P 500 지수(원화환산)의 움직임을 따르는 주식형 ETF예요. 주가와 환율에 따라 손실이 날 수 있어요.',
    annualRate: null,
    rateText: '시장 가격에 따라 변동',
    isExample: false,
    principalGuaranteed: false,
    riskLabel: '높은 위험',
    riskTone: 'danger',
    kind: 'invest',
    feeText: '공식 안내상 총보수는 연 0.05%예요. 기타비용과 매매수수료가 추가될 수 있어 최신 투자설명서와 거래 증권사의 조건을 확인해 주세요.',
  },
  {
    id: REDEPOSIT_ID,
    name: '지금 예금 그대로 재예치',
    summary: '만기일에 지금과 같은 조건으로 다시 맡겨요.',
    annualRate: 0.031,
    rateText: '연 3.10%',
    isExample: true,
    principalGuaranteed: true,
    riskLabel: '매우낮음',
    riskTone: 'safe',
    kind: 'redeposit',
  },
  {
    id: 'super-deposit',
    name: '우리 SUPER 정기예금',
    summary: '만기일을 일·월 단위로 자유롭게 고를 수 있어요.',
    annualRate: 0.032,
    rateText: '연 3.20%',
    isExample: true,
    principalGuaranteed: true,
    riskLabel: '매우낮음',
    riskTone: 'safe',
    kind: 'deposit',
  },
  {
    id: 'won-plus',
    name: 'WON 플러스 예금',
    summary: '시장금리 변동을 적시에 반영해요.',
    annualRate: 0.0305,
    rateText: '연 3.05%',
    isExample: true,
    principalGuaranteed: true,
    riskLabel: '매우낮음',
    riskTone: 'safe',
    kind: 'deposit',
  },
  {
    id: 'duruduru',
    name: '두루두루정기예금',
    summary: '회전복리식이라 이자가 다음 이자의 밑천이 돼요.',
    annualRate: 0.0325,
    rateText: '연 3.25%',
    isExample: true,
    principalGuaranteed: true,
    riskLabel: '매우낮음',
    riskTone: 'safe',
    kind: 'deposit',
  },
  {
    id: INVEST_ID,
    name: 'RP형 CMA',
    provider: '우리투자증권',
    officialUrl: 'https://fundsupermarket.wooriib.com/repository/fok/contractTerms/2026030619cc2c4ad48150.pdf',
    officialCheckedAt: '2026-11-11',
    summary: '계좌 예탁금으로 RP를 자동 매수하는 수시입출금 상품이에요. 예금이 아니며 원금 손실이 날 수 있어요.',
    annualRate: null,
    rateText: '회사 고시 약정수익률 · 변동 가능',
    isExample: false,
    principalGuaranteed: false,
    riskLabel: '5등급 · 낮은 위험',
    riskTone: 'caution',
    kind: 'invest',
    feeText: '공식 RP 상품설명서상 거래에 따른 별도 비용은 부과되지 않아요.',
  },
];

export const AFFILIATE_PRODUCTS = PRODUCTS.filter((product) => Boolean(product.officialUrl));

export const HOUSING_INFO = [
  {
    id: 'housing-subscription',
    name: '주택청약종합저축',
    summary: '내 집 마련이 목표면 청약 저축을 함께 살펴볼 수 있어요. 가입 조건은 상품 안내를 확인해요.',
  },
  {
    id: 'youth-housing-dream',
    name: '청년 주택드림 청약통장',
    summary: '청년의 주택 마련 자금을 모으는 청약 통장이에요. 가입 조건은 상품 안내를 확인해요.',
  },
] as const;

export const PIPELINE_PRODUCT = {
  id: 'first-prefer-deposit',
  name: '우리 첫거래우대 정기예금',
  note: '3단계(타행 만기 자금) 연결 예정 상품',
} as const;

export function getProduct(id: string): CatalogProduct {
  const found = PRODUCTS.find((product) => product.id === id);
  if (!found) throw new Error(`unknown product ${id}`);
  return found;
}
