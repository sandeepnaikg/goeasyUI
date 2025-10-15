import { useEffect, useState } from 'react';
import ImageWithFallback from '../../components/ImageWithFallback';
import { useApp } from '../../context/AppContext';

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
};

// generate sample products for many categories (10+ per user request, but we'll provide 10 items here)
function sampleProductsFor(category: string): Product[] {
  const base = Array.from({ length: 10 }).map((_, i) => ({
    id: `${category.toLowerCase()}-${i + 1}`,
    name: `${category} Item ${i + 1}`,
    category,
    price: Math.floor(499 + Math.random() * 20000),
    image: `https://picsum.photos/seed/${category}-${i}/800/600`,
    description: `High quality ${category} product ${i + 1} designed to meet your needs. Durable, reliable and great value.`
  }));
  return base;
}

export default function ShoppingCategory() {
  const [items, setItems] = useState<Product[]>([]);
  const [category, setCategory] = useState<string>('Category');
  const { setCurrentPage } = useApp();

  useEffect(() => {
    const cat = localStorage.getItem('selectedCategory') || 'All';
    setCategory(cat);
    setItems(sampleProductsFor(cat));
  }, []);

  const open = (p: Product) => {
    localStorage.setItem('selectedProduct', JSON.stringify(p));
    setCurrentPage('shopping-details');
  };

  return (
    <div className="min-h-screen bg-white pb-24 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{category}</h1>
          <button
            onClick={() => setCurrentPage('shopping-home')}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-semibold border border-gray-200 transition-colors"
          >
            <span>Go Back</span>
            <span className="text-xl">→</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p) => (
            <button key={p.id} onClick={() => open(p)} className="bg-white rounded-2xl overflow-hidden text-left border border-gray-200 shadow hover:shadow-lg transition-shadow">
              <div className="relative h-56">
                <ImageWithFallback src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="text-gray-600 text-sm mb-1">{p.category}</div>
                <h3 className="text-gray-900 font-bold mb-1 line-clamp-2">{p.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{p.description}</p>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold text-gray-900">₹{p.price.toLocaleString()}</div>
                  <div className="text-sm text-blue-700">View Details →</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
