import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plane, UtensilsCrossed, Ticket, ShoppingBag } from 'lucide-react';

type TabKey = 'all' | 'travel' | 'food' | 'tickets' | 'shopping';

export default function RecentActivity({ max = 12, showTitle = true, showViewAll = true }: { max?: number; showTitle?: boolean; showViewAll?: boolean }) {
  const { recentlyViewed, setCurrentModule, setCurrentPage } = useApp();
  const [tab, setTab] = useState<TabKey>('all');

  const filtered = useMemo(() => {
    const items = tab === 'all' ? recentlyViewed : recentlyViewed.filter((r) => r.type === tab);
    // already stored newest-first; just slice
    return items.slice(0, max);
  }, [recentlyViewed, tab, max]);

  const go = (type: 'travel' | 'food' | 'tickets' | 'shopping') => {
    setCurrentModule(type);
    setCurrentPage(`${type}-home`);
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'travel', label: 'Travel' },
    { key: 'food', label: 'Food' },
    { key: 'tickets', label: 'Tickets' },
    { key: 'shopping', label: 'Shopping' },
  ];

  if (!recentlyViewed || recentlyViewed.length === 0) return null;

  return (
    <section className="mt-10">
      {showTitle && (
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-bold text-gray-900">Recently Viewed</h2>
          {showViewAll && (
            <button onClick={() => setCurrentPage('recently-viewed')} className="text-teal-600 hover:text-teal-700 text-sm font-semibold">
              View All →
            </button>
          )}
        </div>
      )}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors whitespace-nowrap ${
              tab === t.key
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filtered.map((v) => (
          <button
            key={`${v.type}-${v.id}`}
            onClick={() => go(v.type as 'travel' | 'food' | 'tickets' | 'shopping')}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all text-left"
          >
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              {v.image ? (
                <img src={v.image} alt={v.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {v.type === 'travel' && <Plane className="w-6 h-6 text-teal-600" />}
                  {v.type === 'food' && <UtensilsCrossed className="w-6 h-6 text-rose-600" />}
                  {v.type === 'tickets' && <Ticket className="w-6 h-6 text-purple-600" />}
                  {v.type === 'shopping' && <ShoppingBag className="w-6 h-6 text-orange-600" />}
                </div>
              )}
            </div>
            <div className="p-2">
              <div className="font-semibold text-sm truncate">{v.title}</div>
              <div className="text-[11px] text-gray-500">{new Date(v.when).toLocaleDateString()}</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
