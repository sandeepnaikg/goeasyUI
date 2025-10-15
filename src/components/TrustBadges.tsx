import { ShieldCheck, BadgeIndianRupee, CheckCircle2 } from 'lucide-react';

type Props = { context?: 'payment'|'detail' };

export default function TrustBadges({ context = 'detail' }: Props) {
  return (
    <div className={`flex flex-wrap gap-2 ${context==='payment'?'text-xs':'text-sm'}`}>
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <BadgeIndianRupee className="w-3 h-3" /> Best price
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
        <CheckCircle2 className="w-3 h-3" /> Refund guaranteed
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-800 border border-gray-200">
        <ShieldCheck className="w-3 h-3" /> Safe checkout
      </span>
    </div>
  );
}
