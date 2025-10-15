import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import ImageWithFallback from '../../components/ImageWithFallback';

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type Cart = {
  items: CartItem[];
  total: number;
};

export default function ShoppingCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const { setCurrentPage } = useApp();

  useEffect(() => {
    const data = localStorage.getItem('shoppingCart');
    if (data) setCart(JSON.parse(data) as Cart);
  }, []);

  if (!cart || cart.items.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-6">
        <div className="text-2xl font-bold mb-2">Your cart is empty</div>
        <div className="text-gray-600">There are no items in your shopping cart right now. Browse categories or search for products and add them to your cart. Click any product to see full description and offers.</div>
        <div className="mt-6">
          <button onClick={() => setCurrentPage('shopping-home')} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl">Browse Products</button>
        </div>
      </div>
    </div>
  );

  const handleCheckout = () => {
    localStorage.setItem('shoppingOrder', JSON.stringify({ items: cart.items, total: cart.total }));
    setCurrentPage('shopping-payment');
  };

  const updateLocalCart = (updated: Cart) => {
    setCart(updated);
    localStorage.setItem('shoppingCart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const increase = (index: number) => {
    const items = [...cart.items];
    const it = items[index];
    items[index] = { ...it };
    // convert to quantity by duplicating entries is not ideal; instead keep as list and allow duplicates
    items.push(it);
    const total = items.reduce((s, it) => s + it.price, 0);
    updateLocalCart({ items, total });
  };

  const removeAt = (index: number) => {
    const items = cart.items.filter((_, i) => i !== index);
    const total = items.reduce((s, it) => s + it.price, 0);
    updateLocalCart({ items, total });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Cart</h1>
        <div className="space-y-4 mb-6">
          {cart.items.map((it, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 shadow flex items-center space-x-4">
              <ImageWithFallback src={it.image} alt={it.name} className="w-20 h-20 object-cover rounded-md" />
              <div className="flex-1">
                <div className="font-semibold">{it.name}</div>
                <div className="text-sm text-gray-600">₹{it.price.toLocaleString()}</div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => increase(idx)} className="px-3 py-1 bg-gray-100 rounded">+</button>
                <button onClick={() => removeAt(idx)} className="px-3 py-1 bg-red-100 text-red-600 rounded">Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow">
          {/* Savings summary and coupon */}
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
            You saved ₹{Math.min(200, Math.round(cart.total*0.05))} today. <button onClick={()=> { localStorage.setItem('selectedOfferCode','GOZY50'); }} className="underline font-semibold">Apply coupon</button> at payment.
          </div>
          {/* Free delivery threshold */}
          <div className="mb-4">
            <div className="text-sm text-gray-700">Free delivery at ₹1499</div>
            {(() => { const cap = 1499; const pct = Math.min(100, Math.round((cart.total/cap)*100)); return (
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                <div className="h-2 bg-gradient-to-r from-orange-500 to-red-600" style={{ width: `${pct}%` }} />
              </div>
            ); })()}
            {cart.total < 1499 && (
              <div className="text-xs text-gray-600 mt-1">Add ₹{(1499 - cart.total).toLocaleString()} more for free delivery</div>
            )}
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold">Total</div>
            <div className="text-2xl font-bold">₹{cart.total.toLocaleString()}</div>
          </div>
          <button onClick={handleCheckout} className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl">Proceed to Pay</button>
        </div>
      </div>
    </div>
  );
}
