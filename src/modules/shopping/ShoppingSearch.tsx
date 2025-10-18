import { useState } from 'react';
import { Search, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ImageWithFallback from '../../components/ImageWithFallback';

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description?: string;
};

const products: Product[] = (JSON.parse(localStorage.getItem('allProducts') || 'null') || []) as Product[];

export default function ShoppingSearch() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const { setCurrentPage, favorites, setFavorite, addRecentlyViewed } = useApp();

  const q = query.trim().toLowerCase();
  const filtered = products.filter((p) => {
    if (category !== 'All' && p.category !== category) return false;
    if (!q) return true;
    // prefix match: startsWith for better search suggestions
    const name = p.name.toLowerCase();
    return name.startsWith(q) || name.includes(` ${q}`) || p.category.toLowerCase().startsWith(q);
  });

  const suggestions = q ? products.filter(p => p.name.toLowerCase().startsWith(q)).slice(0, 6) : [];

  const handleClick = (product: Product) => {
    localStorage.setItem('selectedProduct', JSON.stringify(product));
    addRecentlyViewed({ id: product.id, type: 'shopping', title: product.name, image: product.image });
    setCurrentPage('shopping-details');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
  <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              placeholder="Search products, brands and more"
            />
          </div>

          <div className="mt-4 flex items-center space-x-3">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-2 border-2 border-gray-200 rounded-xl">
              <option>All</option>
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Home</option>
              <option>Beauty</option>
              <option>Accessories</option>
            </select>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="mb-4 bg-white rounded-xl shadow p-2">
            {suggestions.map(s => (
              <button key={s.id} onClick={() => handleClick(s)} className="w-full text-left p-2 hover:bg-gray-100 rounded">{s.name} <span className="text-sm text-gray-500"> - {s.category}</span></button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <button key={p.id} onClick={() => handleClick(p)} className="bg-white rounded-2xl shadow-md overflow-hidden text-left p-4 relative group">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFavorite(`product:${p.id}`, !favorites[`product:${p.id}`]); }}
                className={`absolute top-3 right-3 p-2 rounded-full ${favorites[`product:${p.id}`] ? 'bg-rose-500 text-white' : 'bg-white/90 hover:bg-white text-gray-700'} z-10`}
                aria-label="Toggle favorite"
              >
                <Heart className={`w-4 h-4 ${favorites[`product:${p.id}`] ? 'fill-white' : ''}`} />
              </button>
              <ImageWithFallback src={p.image} alt={p.name} className="w-full h-40 object-cover rounded-lg mb-3" />
              <div className="font-semibold text-gray-900">{p.name}</div>
              <div className="text-sm text-gray-600">{p.category}</div>
              <div className="text-lg font-bold mt-2">₹{p.price.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-2">{p.description || ''}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
