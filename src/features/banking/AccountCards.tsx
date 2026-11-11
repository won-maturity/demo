import { Copy, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatWon } from '../../lib/format';
import { useDemoStore } from '../../store/useDemoStore';
import { useOpenMaturity } from './BankingShell';
import type { Account } from './data';

const bankLabels = { woori: '', ibk: 'IBK', kakao: 'B', hana: '하나' };

export function BankMark({ brand }: { brand: Account['brand'] }) {
  return <span className={`won-bank-mark won-bank-mark--${brand}`} aria-hidden>{bankLabels[brand]}</span>;
}

export function AccountCard({ account, notice }: { account: Account; notice?: string }) {
  const openMaturity = useOpenMaturity();
  const showToast = useDemoStore((state) => state.showToast);
  const accountPath = `/assets/accounts/${account.id}`;

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(account.number);
      showToast('예시 계좌번호를 복사했어요.');
    } catch {
      showToast(`예시 계좌번호: ${account.number}`);
    }
  }

  return (
    <article className="won-account">
      <div className="won-account-main">
        <BankMark brand={account.brand} />
        <div className="won-account-content">
          <div className="won-account-title">
            <Link to={accountPath}>{account.name}</Link>
            <Link to={accountPath} aria-label={`${account.name} 상세`} className="won-account-more"><MoreVertical size={19} aria-hidden /></Link>
          </div>
          <button type="button" onClick={copyNumber} aria-label={`${account.name} 예시 계좌번호 ${account.number} 복사`} className="won-copy">
            {account.number}<Copy size={14} aria-hidden />
          </button>
          {account.detail && <p className="won-account-detail">{account.detail}</p>}
          <div className="won-account-bottom">
            <strong>{formatWon(account.amount)}</strong>
            {account.id === 'maturity'
              ? <button type="button" className="won-pill" onClick={openMaturity}>{account.action}</button>
              : <Link className="won-pill" to={account.action === '상세' ? accountPath : `${accountPath}?action=1`} aria-label={`${account.name} ${account.action}`}>{account.action}</Link>}
          </div>
        </div>
      </div>
      {notice && <button type="button" className="won-account-notice" onClick={openMaturity}><span aria-hidden>↪</span>{notice}</button>}
    </article>
  );
}
