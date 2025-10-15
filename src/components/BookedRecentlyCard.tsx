import { useMemo } from 'react';
import { Plane, UtensilsCrossed, Ticket, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';

type Module = 'travel' | 'food' | 'tickets' | 'shopping';

export default function BookedRecentlyCard({ module }: { module: Module }) {
  const { setCurrentModule, setCurrentPage } = useApp();

  const data = useMemo(() => {
    const safeParse = (raw: string | null): unknown => {
      try { return JSON.parse(raw || '[]'); } catch { return []; }
    };
    const asObj = (v: unknown): Record<string, unknown> | null => (v && typeof v === 'object' ? (v as Record<string, unknown>) : null);
    const s = (obj: Record<string, unknown> | null | undefined, key: string): string | undefined => {
      if (!obj) return undefined;
      const v = obj[key];
      return typeof v === 'string' ? v : undefined;
    };
    const n = (obj: Record<string, unknown> | null | undefined, key: string): number | undefined => {
      if (!obj) return undefined;
      const v = obj[key];
      return typeof v === 'number' ? v : undefined;
    };

    try {
      if (module === 'travel') {
        const arrRaw = safeParse(localStorage.getItem('travelOrderHistory'));
        const arr = Array.isArray(arrRaw) ? arrRaw : [];
        const last = arr.length > 0 ? arr[0] as unknown : null;
        const L = asObj(last);
        if (!L) return null;
        const type = s(L, 'type') || 'trip';
        const item = asObj(L['item']) || {};
        const title = type.charAt(0).toUpperCase() + type.slice(1);
        const sub = s(item, 'airline') || s(item, 'operator') || s(item, 'name') || 'Recent booking';
        const total = n(L, 'total') || 0;
        const rawImage = s(item, 'image');
        const defaultMap: Record<string, string> = {
          train: '/images/train.jpg',
          bus: '/images/bus.jpg',
          hotel: '/images/hotel.jpg',
        };
        let image = rawImage;
        try {
          if (type && type.toLowerCase().includes('train')) {
            image = rawImage || defaultMap.train;
          } else if (type && type.toLowerCase().includes('bus')) {
            image = rawImage || defaultMap.bus;
          } else if (type && type.toLowerCase().includes('hotel')) {
            image = rawImage || defaultMap.hotel;
          } else {
            // flight, metro or unknown: prefer icon only
            image = rawImage || undefined;
          }
        } catch {
          image = rawImage || undefined;
        }
        return { icon: <Plane className="w-5 h-5 text-teal-600" />, title: `${title} booked`, sub, total, image };
      }
      if (module === 'food') {
        const arrRaw = safeParse(localStorage.getItem('foodOrderHistory'));
        const arr = Array.isArray(arrRaw) ? arrRaw : [];
        const last = arr.length > 0 ? arr[0] as unknown : null;
        const L = asObj(last);
        if (!L) return null;
        const restaurant = asObj(L['restaurant']) || {};
        const sub = s(restaurant, 'name') || 'Food order';
        const total = n(L, 'total') || 0;
        const image = s(restaurant, 'image');
        return { icon: <UtensilsCrossed className="w-5 h-5 text-rose-600" />, title: 'Food ordered', sub, total, image };
      }
      if (module === 'tickets') {
        const arrRaw = safeParse(localStorage.getItem('ticketOrderHistory'));
        const arr = Array.isArray(arrRaw) ? arrRaw : [];
        const last = arr.length > 0 ? arr[0] as unknown : null;
        const L = asObj(last);
        if (!L) return null;
        const show = asObj(L['show']) || {};
        const movie = asObj(show['movie']) || {};
        const sub = s(movie, 'title') || 'Tickets booking';
        const total = n(L, 'total') || 0;
        const image = s(movie, 'image');
        return { icon: <Ticket className="w-5 h-5 text-purple-600" />, title: 'Tickets booked', sub, total, image };
      }
      // shopping
      const arrRaw = safeParse(localStorage.getItem('shoppingOrderHistory'));
      const arr = Array.isArray(arrRaw) ? arrRaw : [];
      const last = arr.length > 0 ? arr[0] as unknown : null;
      const L = asObj(last);
      if (!L) return null;
      const itemsRaw = L['items'];
      const items = Array.isArray(itemsRaw) ? (itemsRaw as unknown[]) : [];
      const sub = `${items.length} item(s)`;
      const total = n(L, 'total') || 0;
      const first = items[0];
      const firstObj = asObj(first);
      const product = asObj(firstObj ? firstObj['product'] : undefined);
      const image = product ? s(product, 'image') : undefined;
      return { icon: <ShoppingBag className="w-5 h-5 text-orange-600" />, title: 'Order placed', sub, total, image };
    } catch {
      return null;
    }
  }, [module]);

  if (!data) return null;

  const go = () => {
    setCurrentModule(module);
    setCurrentPage(`${module}-home`);
  };

  const repeat = () => {
    try {
      if (module === 'food') {
        // read last order and prefill foodCart
        const raw = localStorage.getItem('foodOrderHistory');
        const arr = raw ? JSON.parse(raw) : [];
        if (Array.isArray(arr) && arr.length > 0) {
          const last = arr[0];
          if (last && last.items) {
            localStorage.setItem('foodCart', JSON.stringify({ items: last.items }));
            window.dispatchEvent(new Event('cart-updated'));
            setCurrentModule('food');
            setCurrentPage('food-cart');
            return;
          }
        }
      }
      if (module === 'shopping') {
        const raw = localStorage.getItem('shoppingOrderHistory');
        const arr = raw ? JSON.parse(raw) : [];
        if (Array.isArray(arr) && arr.length > 0) {
          const last = arr[0];
          if (last && Array.isArray(last.items)) {
            localStorage.setItem('shoppingCart', JSON.stringify({ items: last.items }));
            window.dispatchEvent(new Event('cart-updated'));
            setCurrentModule('shopping');
            setCurrentPage('shopping-cart');
            return;
          }
        }
      }
      if (module === 'tickets') {
        setCurrentModule('tickets');
        setCurrentPage('tickets-details');
        return;
      }
      if (module === 'travel') {
        // try to re-open last travel search or results
        setCurrentModule('travel');
        setCurrentPage('travel-results');
        return;
      }
    } catch {
      // fallback: go to module home
      setCurrentModule(module);
      setCurrentPage(`${module}-home`);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow hover:shadow-md transition-all">
      <button onClick={go} className="w-full text-left">
      <div className="flex gap-4 p-4 items-center">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
          {data.image ? (
            <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
          ) : (
            data.icon
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 truncate">{data.title}</div>
          <div className="text-gray-600 text-sm truncate">{data.sub}</div>
        </div>
        <div className="text-cyan-700 font-extrabold">₹{data.total.toLocaleString()}</div>
      </div>
      </button>
      <div className="p-3 border-t border-gray-100 flex justify-end">
        <button onClick={repeat} className="text-sm px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Repeat</button>
      </div>
    </div>
  );
}
