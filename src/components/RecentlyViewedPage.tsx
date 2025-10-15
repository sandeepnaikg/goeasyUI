import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plane, UtensilsCrossed, Ticket, ShoppingBag } from 'lucide-react';

const allowedTypes = ['travel', 'food', 'tickets', 'shopping'] as const;
type ViewType = typeof allowedTypes[number];
type TabKey = 'all' | ViewType;

function isViewType(x: string): x is ViewType {
  return (allowedTypes as readonly string[]).includes(x);
}

export default function RecentlyViewedPage() {
  const { recentlyViewed, setCurrentPage, setCurrentModule } = useApp();
  const [tab, setTab] = useState<TabKey>('all');
  const items = useMemo(() => (tab==='all'? recentlyViewed : recentlyViewed.filter(r=> r.type===tab)), [recentlyViewed, tab]);

  const go = (type: ViewType) => {
    setCurrentModule(type);
    setCurrentPage(`${type}-home`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Recently Viewed</h1>
        <button onClick={()=> setCurrentPage('home')} className="text-sm underline text-gray-700 hover:text-gray-900">Back to Home</button>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {(['all','travel','food','tickets','shopping'] as TabKey[]).map(key => (
          <button key={key} onClick={()=> setTab(key)} className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors whitespace-nowrap ${tab===key? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>{key[0].toUpperCase()+key.slice(1)}</button>
        ))}
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-gray-600">No items yet.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map(v => (
            <button key={`${v.type}-${v.id}`} onClick={()=> { if (isViewType(v.type)) go(v.type); else setCurrentPage('home'); }} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all text-left">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                {v.image ? (
                  <img src={v.image} alt={v.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {v.type==='travel' && <Plane className="w-6 h-6 text-teal-600"/>}
                    {v.type==='food' && <UtensilsCrossed className="w-6 h-6 text-rose-600"/>}
                    {v.type==='tickets' && <Ticket className="w-6 h-6 text-purple-600"/>}
                    {v.type==='shopping' && <ShoppingBag className="w-6 h-6 text-orange-600"/>}
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
      )}
    </div>
  );
}
