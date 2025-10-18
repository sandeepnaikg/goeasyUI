import { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, Star, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ImageWithFallback from '../../components/ImageWithFallback';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  rating: number;
}

const menuItems: MenuItem[] = [
  { id: '1', name: 'Paneer Butter Masala', description: 'Rich and creamy paneer curry', price: 280, category: 'Main Course', isVeg: true, rating: 4.5 },
  { id: '2', name: 'Butter Naan', description: 'Soft bread with butter', price: 40, category: 'Breads', isVeg: true, rating: 4.3 },
  { id: '3', name: 'Dal Makhani', description: 'Creamy black lentils', price: 220, category: 'Main Course', isVeg: true, rating: 4.6 },
  { id: '4', name: 'Chicken Biryani', description: 'Aromatic rice with chicken', price: 320, category: 'Main Course', isVeg: false, rating: 4.7 },
  { id: '5', name: 'Garlic Naan', description: 'Naan with garlic topping', price: 50, category: 'Breads', isVeg: true, rating: 4.4 },
  { id: '6', name: 'Gulab Jamun', description: 'Sweet dumplings in syrup', price: 80, category: 'Desserts', isVeg: true, rating: 4.5 },
];

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  price: number;
  image?: string;
  offer?: string;
}

export default function FoodMenu() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [activeTab, setActiveTab] = useState<'info'|'menu'|'ratings'>('menu');
  const { setCurrentPage } = useApp();

  useEffect(() => {
    const data = localStorage.getItem('selectedRestaurant');
    if (data) {
      setRestaurant(JSON.parse(data));
    }
  }, []);

  // initialize cart from localStorage if present
  useEffect(() => {
    try {
      const fc = localStorage.getItem('foodCart');
      if (fc) {
        const parsed = JSON.parse(fc);
        if (parsed && parsed.items) setCart(parsed.items);
      }
    } catch (e) {
      // ignore localStorage errors
      void e;
    }
  }, []);

  const addToCart = (itemId: string) => {
    const newCart = { ...cart, [itemId]: (cart[itemId] || 0) + 1 };
    setCart(newCart);
    try {
      localStorage.setItem('foodCart', JSON.stringify({ items: newCart, restaurant }));
      window.dispatchEvent(new Event('cart-updated'));
    } catch (e) {
      // ignore localStorage errors
      void e;
    }
  };

  const removeFromCart = (itemId: string) => {
    const newCart = { ...cart };
    if (newCart[itemId] > 1) {
      newCart[itemId]--;
    } else {
      delete newCart[itemId];
    }
    setCart(newCart);
    try {
      localStorage.setItem('foodCart', JSON.stringify({ items: newCart, restaurant }));
      window.dispatchEvent(new Event('cart-updated'));
    } catch (e) {
      // ignore localStorage write errors
      void e;
    }
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((sum, [itemId, qty]) => {
      const item = menuItems.find(i => i.id === itemId);
      return sum + (item?.price || 0) * qty;
    }, 0);
  };

  const handleViewCart = () => {
    localStorage.setItem('foodCart', JSON.stringify({ items: cart, restaurant }));
    setCurrentPage('food-cart');
  };

  const categories = [...new Set(menuItems.map(item => item.category))];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
  <div className="max-w-7xl mx-auto px-4 py-8">
        {restaurant && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
            <div className="relative h-64">
              <ImageWithFallback
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
                <p className="text-lg">{restaurant.cuisine}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{restaurant.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-5 h-5" />
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="inline-flex bg-gray-100 rounded-xl p-1">
            {(
              [
                { key: 'info', label: 'Info' },
                { key: 'menu', label: 'Menu' },
                { key: 'ratings', label: 'Ratings' },
              ] as const
            ).map(t => (
              <button key={t.key} onClick={()=> setActiveTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-semibold ${activeTab===t.key? 'bg-white shadow': 'text-gray-600'}`}>{t.label}</button>
            ))}
          </div>
        </div>

        {activeTab==='info' && (
          <div className="bg-white rounded-2xl shadow p-6 mb-8 text-gray-700">
            <h2 className="text-xl font-bold text-gray-900 mb-2">About</h2>
            <p>{restaurant?.name} serves {restaurant?.cuisine}. Timings: 10:00 AM - 11:00 PM. Hygienic kitchen, contactless delivery available.</p>
            <div className="mt-3 text-sm text-gray-600">Address: 123, Food Street, City</div>
          </div>
        )}

        {activeTab==='menu' && (
          <>
            {categories.map((category) => (
              <div key={category} className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{category}</h2>
                <div className="space-y-4">
                  {menuItems
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className={`w-4 h-4 border-2 ${item.isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center`}>
                                <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                              </div>
                              <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                            </div>
                            <p className="text-gray-600 mb-3">{item.description}</p>
                            <div className="flex items-center space-x-4">
                              <div className="text-2xl font-bold text-gray-900">₹{item.price}</div>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <span className="text-sm font-semibold">{item.rating}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            {cart[item.id] ? (
                              <div className="flex items-center space-x-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl px-4 py-2">
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="hover:scale-110 transition-transform"
                                >
                                  <Minus className="w-5 h-5" />
                                </button>
                                <span className="text-lg font-bold min-w-[20px] text-center">
                                  {cart[item.id]}
                                </span>
                                <button
                                  onClick={() => addToCart(item.id)}
                                  className="hover:scale-110 transition-transform"
                                >
                                  <Plus className="w-5 h-5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(item.id)}
                                className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                              >
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab==='ratings' && (
          <div className="bg-white rounded-2xl shadow p-6 text-gray-700">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ratings & Reviews</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-4xl font-bold text-gray-900">{restaurant?.rating}<span className="text-base text-gray-600">/5</span></div>
                <div className="text-sm text-gray-600">Based on recent orders</div>
              </div>
              <ul className="space-y-2 text-sm">
                <li>• Great taste and fresh ingredients</li>
                <li>• Quick delivery and neat packaging</li>
                <li>• Must try: Paneer Butter Masala and Biryani</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {getTotalItems() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">{getTotalItems()} items</div>
                <div className="text-2xl font-bold text-gray-900">₹{getTotalPrice().toLocaleString()}</div>
              </div>
              <button
                onClick={handleViewCart}
                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xl font-bold rounded-xl hover:from-red-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
              >
                <ShoppingCart className="w-6 h-6" />
                <span>View Cart</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
