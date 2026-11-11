export type PersonaId = 'A' | 'B' | 'C' | 'D';

export type RiskProfile = '안정형' | '안정추구형' | '적극투자형' | '미진단';

export type Persona = {
  id: PersonaId;
  name: string;
  age: number;
  riskProfile: RiskProfile;
  investmentPreference: 'open' | 'declines';
  diagnosedAt?: string;
  productName: string;
  principal: number;
  maturityDate: string;
  annualRate: number;
  autoRedeposit: boolean;
  outcome: string;
};

export const DEMO_TODAY = '2026-10-22';
export const DEFAULT_PERSONA_ID = 'D';

export const PERSONAS: Persona[] = [
  {
    id: DEFAULT_PERSONA_ID,
    name: '양대건',
    age: 39,
    riskProfile: '안정형',
    investmentPreference: 'declines',
    diagnosedAt: '2026-08-01',
    productName: '정기예금',
    principal: 30_000_000,
    maturityDate: '2026-11-21',
    annualRate: 0.031,
    autoRedeposit: true,
    outcome: '투자를 원하지 않아요. 학비와 이사 자금은 쓰는 날에 맞춰 예금으로만 나눠요.',
  },
  {
    id: 'A',
    name: '김재원',
    age: 34,
    riskProfile: '적극투자형',
    investmentPreference: 'open',
    diagnosedAt: '2026-04-02',
    productName: '정기예금',
    principal: 30_000_000,
    maturityDate: '2026-11-21',
    annualRate: 0.031,
    autoRedeposit: true,
    outcome: '적극적으로 투자해요. 중장기 여유자금이면 우리투자증권 RP형 CMA와 우리자산운용 ETF도 비교해요.',
  },
  {
    id: 'B',
    name: '소원',
    age: 45,
    riskProfile: '안정형',
    investmentPreference: 'open',
    diagnosedAt: '2025-09-01',
    productName: '정기예금',
    principal: 50_000_000,
    maturityDate: '2026-11-21',
    annualRate: 0.031,
    autoRedeposit: true,
    outcome: '안정형 투자자예요. 기존 진단과 포트폴리오를 확인하고 예금 위주로 비교해요.',
  },
  {
    id: 'C',
    name: '박영자',
    age: 72,
    riskProfile: '미진단',
    investmentPreference: 'open',
    productName: '정기예금',
    principal: 20_000_000,
    maturityDate: '2026-11-21',
    annualRate: 0.031,
    autoRedeposit: true,
    outcome: '투자 상품을 물으면 영업점 PB나 상담원에게 연결돼요.',
  },
];

export function getPersona(id: PersonaId): Persona {
  const found = PERSONAS.find((persona) => persona.id === id);
  if (!found) throw new Error(`unknown persona ${id}`);
  return found;
}

export function daysUntil(iso: string, today = DEMO_TODAY): number {
  const ms = Date.parse(`${iso}T00:00:00`) - Date.parse(`${today}T00:00:00`);
  return Math.round(ms / 86_400_000);
}

export function exampleInterest(principal: number, annualRate: number): number {
  return Math.round(principal * annualRate);
}
