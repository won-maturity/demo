import { ExternalLink } from 'lucide-react';

export function OfficialProductSource({ url, provider, checkedAt }: {
  url?: string;
  provider?: string;
  checkedAt?: string;
}) {
  if (!url) return null;
  return <div className="mt-3 border-t border-line pt-3">
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-tap items-center gap-2 text-sm font-semibold text-primary">
      {provider} 공식 상품 안내 <ExternalLink size={15} aria-hidden /><span className="sr-only">새 창</span>
    </a>
    <p className="text-xs leading-5 text-textBody">상품 정보 확인 {checkedAt} · 최신 조건과 가입 가능 여부는 공식 안내에서 확인해 주세요.</p>
  </div>;
}
