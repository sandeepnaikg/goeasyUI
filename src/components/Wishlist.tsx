import { useMemo } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

type FavItem = {
  key: string;
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
};

export default function Wishlist() {
  const { favorites, setFavorite, setCurrentModule, setCurrentPage } = useApp();

  const items = useMemo<FavItem[]>(() => {
    const result: FavItem[] = [];
    const favEntries = Object.entries(favorites || {}).filter(([, v]) => !!v);
    type Generic = { [k: string]: unknown };
    const getArr = (key: string): Generic[] => {
      try { const raw = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(raw) ? (raw as Generic[]) : []; } catch { return []; }
    };
    const products = getArr('allProducts');
    const restaurants = getArr('allRestaurants');
    const movies = getArr('allMovies');

    for (const [k] of favEntries) {
      const [type, id] = k.includes(':') ? k.split(':', 2) : ['item', k];
      if (type === 'product') {
        const p = products.find((x) => String((x as { id?: unknown }).id) === String(id)) as { name?: string; category?: string; image?: string } | undefined;
        result.push({ key: k, type, id, title: p?.name || `Product ${id}` , subtitle: p?.category, image: p?.image });
      } else if (type === 'restaurant') {
        const r = restaurants.find((x) => String((x as { id?: unknown }).id) === String(id)) as { name?: string; cuisine?: string; image?: string } | undefined;
        result.push({ key: k, type, id, title: r?.name || `Restaurant ${id}`, subtitle: r?.cuisine, image: r?.image });
      } else if (type === 'movie') {
        const m = movies.find((x) => String((x as { id?: unknown }).id) === String(id)) as { title?: string; image?: string } | undefined;
        result.push({ key: k, type, id, title: m?.title || `Movie ${id}`, subtitle: 'Tickets', image: m?.image });
      } else if (type === 'hotel') {
        result.push({ key: k, type, id, title: `Hotel ${id}`, subtitle: 'Travel', image: undefined });
      } else {
        result.push({ key: k, type, id, title: `${type} ${id}`, image: undefined });
      }
    }
    return result;
  }, [favorites]);

  const goTo = (it: FavItem) => {
    if (it.type === 'product') {
      try {
        const products = JSON.parse(localStorage.getItem('allProducts') || '[]') as Array<{ id?: string }>;
        const p = Array.isArray(products) ? products.find((x) => String(x?.id) === String(it.id)) : undefined;
        if (p) localStorage.setItem('selectedProduct', JSON.stringify(p));
      } catch { /* ignore */ }
      setCurrentModule('shopping');
      setCurrentPage('shopping-details');
    } else if (it.type === 'restaurant') {
      try {
        const restaurants = JSON.parse(localStorage.getItem('allRestaurants') || '[]') as Array<{ id?: string }>;
        const r = Array.isArray(restaurants) ? restaurants.find((x) => String(x?.id) === String(it.id)) : undefined;
        if (r) localStorage.setItem('selectedRestaurant', JSON.stringify(r));
      } catch { /* ignore */ }
      setCurrentModule('food');
      setCurrentPage('food-menu');
    } else if (it.type === 'movie') {
      try {
        const movies = JSON.parse(localStorage.getItem('allMovies') || '[]') as Array<{ id?: string; title?: string; image?: string }>;
        const m = Array.isArray(movies) ? movies.find((x) => String(x?.id) === String(it.id)) : undefined;
        if (m && m.id && m.title) localStorage.setItem('selectedMovie', JSON.stringify({ id: m.id, title: m.title, image: m.image, genre: 'Drama', rating: 4.5, votes: '10K', language: 'English', format: '2D, 3D', duration: '2h 20m' }));
      } catch { /* ignore */ }
      setCurrentModule('tickets');
      setCurrentPage('tickets-details');
    } else if (it.type === 'hotel') {
      setCurrentModule('travel');
      setCurrentPage('travel-hotels');
    } else {
      setCurrentPage('home');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white pb-24">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold mb-2">
              <Heart className="w-6 h-6 text-pink-500" /> Your wishlist is empty
            </div>
            <div className="text-gray-600">Browse products, restaurants, and movies to add favorites.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="text-2xl font-bold">Wishlist</div>
          <div className="text-gray-600">{items.length} item(s)</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((it) => (
            <div key={it.key} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-[16/10] bg-gray-100">
                {it.image ? (
                  <img src={it.image} alt={it.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                )}
              </div>
              <div className="p-4">
                <div className="font-semibold text-gray-900 truncate" title={it.title}>{it.title}</div>
                {it.subtitle && <div className="text-sm text-gray-600 truncate">{it.subtitle}</div>}
                <div className="mt-4 flex items-center justify-between">
                  <button onClick={() => goTo(it)} className="px-3 py-1.5 text-sm rounded-lg bg-teal-600 text-white hover:bg-teal-700">View</button>
                  <button onClick={() => setFavorite(it.key, false)} className="px-3 py-1.5 text-sm rounded-lg border text-gray-700 hover:bg-gray-50 flex items-center gap-1">
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
