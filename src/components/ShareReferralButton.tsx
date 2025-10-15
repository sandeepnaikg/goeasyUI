import { Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ShareReferralButton({ variant = 'chip' }: { variant?: 'chip' | 'button' }) {
  const { referral } = useApp();
  const code = referral?.myCode || 'GOZYFRIEND';

  const share = async () => {
    const text = `Try GOZY and earn rewards with my code ${code}. Download now: ${window.location.origin}`;
    try {
      const navShare = (navigator as unknown as { share?: (data: ShareData) => Promise<void> }).share;
      if (navShare) {
        await navShare({ title: 'Invite & Earn • GOZY', text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(text);
        alert('Invite text copied! Share it with your friends.');
      }
    } catch {
      try { await navigator.clipboard.writeText(text); alert('Invite text copied!'); } catch { /* ignore */ }
    }
  };

  if (variant === 'button') {
    return (
      <button onClick={share} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold shadow hover:from-amber-500 hover:to-orange-600">
        <Share2 className="w-4 h-4" /> Invite & Earn
      </button>
    );
  }

  return (
    <button onClick={share} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200">
      <Share2 className="w-3 h-3" />
      <span>Invite • {code}</span>
    </button>
  );
}
