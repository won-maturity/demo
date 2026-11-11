import type { PersonaId } from './personas';

export type PortfolioReport = {
  analyzedAt: string;
  source: string;
  allocations: { label: string; percent: number }[];
  summary: string;
};

// Previously produced reports supplied by a mock external portfolio service.
// The chat and rule engine retrieve these records without performing a new diagnosis.
export const PORTFOLIO_REPORTS: Record<PersonaId, PortfolioReport> = {
  A: {
    analyzedAt: '2026-10-15',
    source: 'WON 포트폴리오 · 모의 외부 분석',
    allocations: [{ label: '주식·ETF', percent: 65 }, { label: '채권', percent: 15 }, { label: '예금·현금', percent: 20 }],
    summary: '주식·ETF 비중이 높습니다. 추가 투자 시 기존 주식 노출과 시장·지역 분산을 함께 검토하도록 분석되어 있어요.',
  },
  B: {
    analyzedAt: '2026-10-15',
    source: 'WON 포트폴리오 · 모의 외부 분석',
    allocations: [{ label: '예금·현금', percent: 75 }, { label: '채권', percent: 20 }, { label: '주식·ETF', percent: 5 }],
    summary: '예금·현금 중심의 보수적인 구성입니다. 단기 지출 자금과 장기 보유 자금을 구분하도록 분석되어 있어요.',
  },
  C: {
    analyzedAt: '2026-10-15',
    source: 'WON 포트폴리오 · 모의 외부 분석',
    allocations: [{ label: '예금·현금', percent: 90 }, { label: '채권', percent: 10 }],
    summary: '예금·현금 비중이 높습니다. 투자 상품 문의 시 등록된 진단 여부를 확인하고 전문가 상담을 이어가도록 분석되어 있어요.',
  },
  D: {
    analyzedAt: '2026-10-15',
    source: 'WON 포트폴리오 · 모의 외부 분석',
    allocations: [{ label: '예금·현금', percent: 100 }],
    summary: '예금·현금으로 구성되어 있습니다. 투자를 원하지 않는 등록 의사에 따라 예금 범위에서 만기를 계획하도록 분석되어 있어요.',
  },
};
