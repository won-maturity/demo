import { PORTFOLIO_REPORTS, type PortfolioReport } from '../mock/portfolioReports';
import { diagnosisStatus } from '../engine/rules';
import { daysUntil, DEMO_TODAY, exampleInterest, getPersona, type PersonaId } from '../mock/personas';

export type LookupState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

export type MaturityAccount = {
  customerName: string;
  productName: string;
  principal: number;
  annualRate: number;
  estimatedInterest: number;
  maturityDate: string;
  daysToMaturity: number;
  autoRedeposit: boolean;
  checkedAt: string;
  source: 'demo-bank-service';
};

export type InvestmentProfile = {
  riskProfile: ReturnType<typeof getPersona>['riskProfile'];
  diagnosedAt?: string;
  diagnosis: ReturnType<typeof diagnosisStatus>;
  investmentPreference: 'open' | 'declines';
  portfolio: PortfolioReport;
  checkedAt: string;
  source: 'demo-profile-service';
};

async function simulateBankQuery(fail: boolean) {
  await new Promise<void>((resolve) => setTimeout(resolve, 900));
  if (fail) throw new Error('Demo bank query failed');
}

// Read-only demo adapters. Replace these implementations when a bank API is available.
export async function lookupMaturityAccount(input: {
  personaId: PersonaId;
  autoRedeposit: boolean;
  fail?: boolean;
}): Promise<MaturityAccount> {
  await simulateBankQuery(input.fail ?? false);
  const persona = getPersona(input.personaId);
  return {
    customerName: persona.name,
    productName: persona.productName,
    principal: persona.principal,
    annualRate: persona.annualRate,
    estimatedInterest: exampleInterest(persona.principal, persona.annualRate),
    maturityDate: persona.maturityDate,
    daysToMaturity: daysUntil(persona.maturityDate),
    autoRedeposit: input.autoRedeposit,
    checkedAt: DEMO_TODAY,
    source: 'demo-bank-service',
  };
}

export async function lookupInvestmentProfile(input: {
  personaId: PersonaId;
  fail?: boolean;
}): Promise<InvestmentProfile> {
  await simulateBankQuery(input.fail ?? false);
  const persona = getPersona(input.personaId);
  const diagnosedAt = persona.diagnosedAt;
  return {
    riskProfile: persona.riskProfile,
    diagnosedAt,
    diagnosis: diagnosisStatus(diagnosedAt, DEMO_TODAY),
    investmentPreference: persona.investmentPreference,
    portfolio: PORTFOLIO_REPORTS[input.personaId],
    checkedAt: DEMO_TODAY,
    source: 'demo-profile-service',
  };
}
