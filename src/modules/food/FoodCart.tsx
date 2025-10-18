import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const menuItems = [
  { id: '1', name: 'Paneer Butter Masala', price: 280 },
  { id: '2', name: 'Butter Naan', price: 40 },
  { id: '3', name: 'Dal Makhani', price: 220 },
  { id: '4', name: 'Chicken Biryani', price: 320 },
  { id: '5', name: 'Garlic Naan', price: 50 },
  { id: '6', name: 'Gulab Jamun', price: 80 },
];

type CartData = { restaurant?: { id: string; name: string }; items: Record<string, number> } | null;

export default function FoodCart() {
  const [cartData, setCartData] = useState<CartData>(null);
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [tip, setTip] = useState<number>(0);
  const { setCurrentPage } = useApp();

  useEffect(() => {
    const data = localStorage.getItem('foodCart');
    if (data) {
      setCartData(JSON.parse(data));
    }
  }, []);

  const getItemDetails = (itemId: string) => {
    return menuItems.find(item => item.id === itemId);
  };

  const getSubtotal = () => {
    if (!cartData) return 0;
    return (Object.entries(cartData.items) as [string, number][]).reduce((sum: number, [itemId, qty]) => {
      const item = getItemDetails(itemId);
      return sum + (item?.price || 0) * qty;
    }, 0);
  };

  const deliveryFee = 40;
  const tax = Math.round(getSubtotal() * 0.05);
  const total = getSubtotal() + deliveryFee + tax + tip;

  const handleCheckout = () => {
    localStorage.setItem('foodOrderDetails', JSON.stringify({
      address,
      instructions,
      total,
      tip
    }));
    setCurrentPage('food-payment');
  };

  const updateCart = (newItems: Record<string, number>) => {
    if (!cartData) return;
    const updated = { ...cartData, items: newItems };
    setCartData(updated);
    localStorage.setItem('foodCart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const increase = (itemId: string) => {
    if (!cartData) return;
    const items = { ...cartData.items };
    items[itemId] = (items[itemId] || 0) + 1;
    updateCart(items);
  };

  const decrease = (itemId: string) => {
    if (!cartData) return;
    const items = { ...cartData.items };
    if (!items[itemId]) return;
    if (items[itemId] > 1) items[itemId]--;
    else delete items[itemId];
    updateCart(items);
  };

  const handleReorder = () => {
    try {
      const last = localStorage.getItem('lastFoodOrder');
      if (!last) return;
      const order = JSON.parse(last);
      const items = order.items || {};
      const restaurant = order.restaurant || null;
      localStorage.setItem('foodCart', JSON.stringify({ items, restaurant }));
      window.dispatchEvent(new Event('cart-updated'));
      setCurrentPage('food-cart');
    } catch {/* ignore */}
  };

  if (!cartData || !cartData.items || Object.keys(cartData.items).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-6">
          <div className="text-2xl font-bold mb-2">Your cart is empty</div>
          <div className="text-gray-600 mb-4">Add delicious items from the menu. Click Add on any dish to add it to your cart. When you're ready, review your cart and proceed to pay.</div>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setCurrentPage('food-home')} className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl">Browse Menu</button>
            {localStorage.getItem('lastFoodOrder') && (
              <button onClick={handleReorder} className="px-6 py-3 bg-gray-900 text-white rounded-xl">Add items again</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
  <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

        {/* Stack content vertically and make each section full width */}
        <div className="space-y-6">
          {/* Items list */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Items from {cartData.restaurant?.name}</h2>
            <div className="space-y-4">
              {(Object.entries(cartData.items) as [string, number][]).map(([itemId, qty]) => {
                const item = getItemDetails(itemId);
                if (!item) return null;
                return (
                  <div key={itemId} className="flex justify-between items-center border-b border-gray-200 pb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-gray-600">Qty: {qty}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => decrease(itemId)} className="px-3 py-1 bg-gray-100 rounded">-</button>
                      <div className="text-lg font-bold text-gray-900">₹{(item.price * qty).toLocaleString()}</div>
                      <button onClick={() => increase(itemId)} className="px-3 py-1 bg-gray-100 rounded">+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery address */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Address</h2>
            <div className="relative mb-4">
              <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your complete address"
                rows={3}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none resize-none"
              />
            </div>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Delivery instructions (optional)"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Bill summary moved below and full width */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Bill Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Item Total</span>
                <span>₹{getSubtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Taxes</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center gap-2">Tip <span className="text-xs text-gray-500">(supports your delivery partner)</span></span>
                <div className="flex items-center gap-2">
                  {[0,10,20,40].map(v => (
                    <button key={v} onClick={()=> setTip(v)} className={`px-3 py-1.5 rounded-full border text-xs ${tip===v? 'bg-rose-600 text-white border-rose-600':'border-gray-300 hover:border-rose-400'}`}>{v===0? 'No Tip': `₹${v}`}</button>
                  ))}
                </div>
              </div>
              <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            {getSubtotal() > 0 && (
              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-xl font-bold rounded-xl hover:from-rose-500 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
              >
                Proceed to Pay ₹{total.toLocaleString()}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
