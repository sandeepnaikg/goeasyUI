import { useEffect, useState } from 'react';
import { Tag, X } from 'lucide-react';

type Offer = { code: string; label: string };

export default function OffersStrip({ offers, storageKey = 'selectedOfferCode' }: { offers: Offer[]; storageKey?: string }) {
  const [visible, setVisible] = useState(true);
  const [applied, setApplied] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setApplied(saved);
    } catch { /* ignore */ }
  }, [storageKey]);

  if (!visible || offers.length === 0) return null;

  const apply = (code: string) => {
    try { localStorage.setItem(storageKey, code); setApplied(code); } catch { /* ignore */ }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-3 mb-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="w-4 h-4 text-teal-600" />
          <div className="flex gap-2 flex-wrap">
            {offers.map(o => (
              <button
                key={o.code}
                onClick={() => apply(o.code)}
                className={`text-xs px-2 py-1 rounded-full border-2 transition-colors ${applied === o.code ? 'border-teal-600 text-teal-700 bg-teal-50' : 'border-gray-200 text-gray-700 hover:border-teal-500'}`}
                title={o.label}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => setVisible(false)} className="p-1 rounded hover:bg-gray-100" aria-label="Dismiss">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      {applied && (
        <div className="mt-2 text-xs text-emerald-700">Applied: {applied}. It will auto-apply at checkout.</div>
      )}
    </div>
  );
}
