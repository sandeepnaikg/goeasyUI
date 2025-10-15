import { useEffect, useState } from 'react';
import { Truck, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

type Order = {
  id: string;
  items: { id: string; name: string; price: number }[];
  total: number;
  status: string;
  trackingNumber?: string;
};

export default function ShoppingTracking() {
  const [order, setOrder] = useState<Order | null>(null);
  const [progress, setProgress] = useState(25);
  const { setCurrentModule, setCurrentPage } = useApp();

  useEffect(() => {
    const data = localStorage.getItem('lastShoppingOrder');
    if (data) setOrder(JSON.parse(data));

    const t1 = setTimeout(() => setProgress(50), 2000);
    const t2 = setTimeout(() => setProgress(75), 5000);
    const t3 = setTimeout(() => setProgress(100), 9000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const backHome = () => {
    setCurrentModule(null);
    setCurrentPage('home');
  };

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Order</div>
              <div className="font-bold">{order.id}</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <div className="mb-4">
                <div className="text-sm text-gray-500">Current Status</div>
                <div className="font-semibold">{progress < 50 ? 'Processing' : progress < 100 ? 'Shipped' : 'Out for Delivery'}</div>
              </div>
              {/* Explicit stages */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                {['Packed','Shipped','Out for delivery','Delivered'].map((s, idx) => (
                  <div key={s} className={`p-3 rounded-xl border text-sm ${progress >= (idx+1)*25 ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200'}`}>
                    <div className="font-semibold">{s}</div>
                    <div className="text-xs text-gray-600">{new Date(Date.now() + idx*3600000).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <MapPin className="inline-block w-4 h-4 mr-2" />
                Estimated delivery in 2-3 days
              </div>

              <div className="rounded-2xl overflow-hidden border">
                <iframe
                  title="delivery-map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=77.55%2C12.90%2C77.65%2C13.00&layer=mapnik"
                  style={{ width: '100%', height: 260, border: 0 }}
                />
                <div className="text-xs text-gray-500 p-2">Live delivery location (mocked)</div>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Tracking Number</div>
              <div className="font-bold">{order.trackingNumber}</div>
              <div className="mt-6 p-4 border rounded-2xl bg-white">
                <div className="font-semibold mb-1">Easy Returns</div>
                <div className="text-sm text-gray-700">Return within 7 days of delivery. Instant pickup and refund to original method.</div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button onClick={backHome} className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl">Back to Home</button>
            <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl">Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  );
}
