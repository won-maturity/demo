import type { Persona } from '../../mock/personas';
import { formatDotDate } from '../../lib/format';

export type Account = {
  id: string;
  name: string;
  amount: number;
  number: string;
  brand: 'woori' | 'ibk' | 'kakao' | 'hana';
  action: string;
  detail?: string;
};

export function getAccounts(persona: Persona): Account[] {
  return [
    { id: 'won', name: '우리WON 통장', amount: 3_560_000, number: '1234-567-891011', brand: 'woori', action: '이체' },
    { id: 'ibk', name: '기업 좋은 정기적금', amount: 1_700_000, number: '1234-567-891022', brand: 'ibk', action: '이체' },
    { id: 'kakao', name: '카카오뱅크 중금리 대출', amount: 57_000_000, number: '1234-567-891033', brand: 'kakao', action: '추가입금', detail: '금리 5.1%' },
    { id: 'hana', name: '하나 중고차 다이렉트', amount: 8_400_000, number: '1234-567-891044', brand: 'hana', action: '상세', detail: '금리 3.9%' },
    { id: 'maturity', name: `우리은행 ${persona.productName}`, amount: persona.principal, number: '1234-567-891055', brand: 'woori', action: '만기 관리', detail: `만기일 ${formatDotDate(persona.maturityDate)}` },
  ];
}

export const monthlySavings = [
  { label: '5월', amount: 5_940_000 }, { label: '6월', amount: 6_280_000 },
  { label: '7월', amount: 6_650_000 }, { label: '8월', amount: 7_020_000 },
  { label: '9월', amount: 7_300_000 }, { label: '10월', amount: 7_690_000 },
  { label: '11월', amount: 8_000_000 }, { label: '12월', amount: 8_320_000 },
  { label: '1월', amount: 8_960_000 }, { label: '2월', amount: 9_470_000 },
  { label: '3월', amount: 10_740_000 }, { label: '4월', amount: 11_060_000 },
  { label: '당월', amount: 11_500_000 },
];

export type Expense = { day: number; name: string; category: string; amount: number };

export const expensesByMonth: Record<number, Expense[]> = {
  8: [
    { day: 2, name: '생활용품', category: '쇼핑', amount: 188_200 },
    { day: 6, name: '대중교통', category: '교통', amount: 67_800 },
    { day: 14, name: '식비', category: '식비', amount: 356_000 },
    { day: 24, name: '온라인 쇼핑', category: '쇼핑', amount: 412_000 },
    { day: 27, name: '관리비', category: '생활', amount: 508_000 },
  ],
  9: [
    { day: 1, name: '카페', category: '식비', amount: 11_880 },
    { day: 2, name: '장보기', category: '생활', amount: 89_350 },
    { day: 3, name: '점심', category: '식비', amount: 11_900 },
    { day: 4, name: '교통카드 충전', category: '교통', amount: 85_600 },
    { day: 5, name: '외식', category: '식비', amount: 37_800 },
    { day: 6, name: '카페', category: '식비', amount: 12_100 },
    { day: 7, name: '생활용품', category: '쇼핑', amount: 78_990 },
    { day: 8, name: '장보기', category: '생활', amount: 46_410 },
    { day: 9, name: '쇼핑', category: '쇼핑', amount: 223_100 },
    { day: 10, name: '점심', category: '식비', amount: 16_900 },
    { day: 11, name: '주유', category: '교통', amount: 41_360 },
    { day: 12, name: '배달', category: '식비', amount: 18_460 },
    { day: 14, name: '생활용품', category: '생활', amount: 77_770 },
    { day: 15, name: '식비', category: '식비', amount: 40_560 },
    { day: 16, name: '온라인 쇼핑', category: '쇼핑', amount: 70_000 },
    { day: 17, name: '교통', category: '교통', amount: 27_500 },
    { day: 19, name: '외식', category: '식비', amount: 50_950 },
    { day: 20, name: '카페', category: '식비', amount: 12_700 },
    { day: 21, name: '생활비', category: '생활', amount: 43_390 },
    { day: 22, name: '쇼핑', category: '쇼핑', amount: 40_000 },
    { day: 24, name: '외식', category: '식비', amount: 55_620 },
    { day: 25, name: '교통', category: '교통', amount: 19_300 },
    { day: 26, name: '카페', category: '식비', amount: 9_690 },
    { day: 27, name: '생활용품', category: '생활', amount: 16_690 },
    { day: 28, name: '점심', category: '식비', amount: 17_610 },
    { day: 29, name: '장보기', category: '생활', amount: 11_400 },
    { day: 31, name: '편의점', category: '생활', amount: 2_060 },
  ],
};
