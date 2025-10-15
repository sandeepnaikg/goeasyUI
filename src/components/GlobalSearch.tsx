import { useEffect, useMemo, useState } from 'react';
import { X, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

type Product = { id: string; name: string; price: number; image?: string };
type Restaurant = { id: string; name: string; cuisine: string; image?: string };
type Movie = { id: string; title: string; image?: string };

export default function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setCurrentModule, setCurrentPage } = useApp();
  const [q, setQ] = useState('');
  type SearchItem = { id: string; type: string; title: string; subtitle?: string; image?: string; action: () => void };
  const data = useMemo((): { products: Product[]; restaurants: Restaurant[]; movies: Movie[] } => {
    try {
      const products = JSON.parse(localStorage.getItem('allProducts') || '[]') as Product[];
      const restaurants = JSON.parse(localStorage.getItem('allRestaurants') || '[]') as Restaurant[];
      const movies = JSON.parse(localStorage.getItem('allMovies') || '[]') as Movie[];
      return { products, restaurants, movies };
    } catch {
      return { products: [], restaurants: [], movies: [] };
    }
  }, []);

  useEffect(() => {
    if (!open) setQ('');
  }, [open]);

  const { items, grouped } = useMemo((): { items: SearchItem[]; grouped: { products: SearchItem[]; restaurants: SearchItem[]; movies: SearchItem[] } } => {
    const term = q.trim().toLowerCase();
    const make = (): SearchItem[] => [];
    if (!term) return { items: make(), grouped: { products: make(), restaurants: make(), movies: make() } };
    const prods: SearchItem[] = data.products
      .filter((p) => p.name.toLowerCase().includes(term))
      .slice(0, 5)
      .map((p) => ({ id: `prod_${p.id}`, type: 'shopping', title: p.name, subtitle: `₹${p.price}`, image: p.image, action: () => { try { localStorage.setItem('selectedProduct', JSON.stringify({ id: p.id, name: p.name, price: p.price, image: p.image, category: '' })); } catch { /* ignore */ } setCurrentModule('shopping'); setCurrentPage('shopping-details'); onClose(); } }));
    const rests: SearchItem[] = data.restaurants
      .filter((r) => (r.name.toLowerCase().includes(term) || r.cuisine.toLowerCase().includes(term)))
      .slice(0, 5)
      .map((r) => ({ id: `rest_${r.id}`, type: 'food', title: r.name, subtitle: r.cuisine, image: r.image, action: () => { try { localStorage.setItem('selectedRestaurant', JSON.stringify({ id: r.id, name: r.name, image: r.image })); } catch { /* ignore */ } setCurrentModule('food'); setCurrentPage('food-menu'); onClose(); } }));
    const movs: SearchItem[] = data.movies
      .filter((m) => m.title.toLowerCase().includes(term))
      .slice(0, 5)
      .map((m) => ({ id: `movie_${m.id}`, type: 'tickets', title: m.title, image: m.image, action: () => { try { localStorage.setItem('selectedMovie', JSON.stringify({ id: m.id, title: m.title, image: m.image, genre: 'Drama', rating: 4.5, votes: '10K', language: 'English', format: '2D, 3D', duration: '2h 20m' })); } catch { /* ignore */ } setCurrentModule('tickets'); setCurrentPage('tickets-details'); onClose(); } }));
    return { items: [...prods, ...rests, ...movs], grouped: { products: prods, restaurants: rests, movies: movs } };
  }, [q, data, setCurrentModule, setCurrentPage, onClose]);

  const chips = useMemo(() => {
    return [
      { id: 'chip_products', label: 'Mobiles', action: () => { setCurrentModule('shopping'); setCurrentPage('shopping-search'); onClose(); } },
      { id: 'chip_food', label: 'Pizza near me', action: () => { setCurrentModule('food'); setCurrentPage('food-home'); onClose(); } },
      { id: 'chip_movies', label: 'Now Showing', action: () => { setCurrentModule('tickets'); setCurrentPage('tickets-home'); onClose(); } },
      { id: 'chip_flights', label: 'Flights to Goa', action: () => { setCurrentModule('travel'); setCurrentPage('travel-results'); onClose(); } }
    ];
  }, [setCurrentModule, setCurrentPage, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] bg-black/40 flex items-start justify-center pt-24">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-5 h-5 text-gray-500" />
          <input value={q} onChange={(e)=> setQ(e.target.value)} placeholder="Search flights, food, products, tickets..." className="flex-1 outline-none" />
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {chips.map(c => (
            <button key={c.id} onClick={c.action} className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-sm">{c.label}</button>
          ))}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 && <div className="p-4 text-gray-500 text-sm">Try searching for a product, restaurant or movie</div>}
          {(['products','restaurants','movies'] as const).map((section) => (
            grouped[section].length > 0 ? (
              <div key={section} className="border-t first:border-t-0 border-gray-100">
                <div className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-gray-500">{section}</div>
                {grouped[section].map(it => (
                  <button key={it.id} onClick={it.action} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left">
                    {it.image ? <img src={it.image} className="w-10 h-10 object-cover rounded"/> : <div className="w-10 h-10 rounded bg-gray-100"/>}
                    <div className="flex-1">
                      <div className="font-semibold">{it.title}</div>
                      {it.subtitle && <div className="text-sm text-gray-500">{it.subtitle}</div>}
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{it.type}</span>
                  </button>
                ))}
              </div>
            ) : null
          ))}
        </div>
      </div>
    </div>
  );
}
