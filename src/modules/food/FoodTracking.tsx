import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Clock, Truck, MapPin, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function FoodTracking() {
  const [status, setStatus] = useState<'preparing' | 'on_the_way' | 'delivered'>('preparing');
  const [progress, setProgress] = useState(0);
  const { setCurrentModule, setCurrentPage } = useApp();
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [editing, setEditing] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStatus('on_the_way');
      setProgress(50);
    }, 3000);

    const timer2 = setTimeout(() => {
      setStatus('delivered');
      setProgress(100);
    }, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Load saved address/instructions and last known coordinates (runs once)
  useEffect(() => {
    try {
      const detailsRaw = localStorage.getItem('foodOrderDetails');
      if (detailsRaw) {
        const d = JSON.parse(detailsRaw);
        if (d.address) setAddress(d.address);
        if (d.instructions) setInstructions(d.instructions);
      }
      const locRaw = localStorage.getItem('foodDeliveryLocation');
      if (locRaw) {
        const l = JSON.parse(locRaw);
        if (typeof l.lat === 'number') setLat(l.lat);
        if (typeof l.lon === 'number') setLon(l.lon);
        if (l.address) setAddress(l.address);
        if (l.instructions) setInstructions(l.instructions);
      }
    } catch {/* ignore */}
  }, []);

  // Build map URL with marker from coordinates
  const mapUrl = useMemo(() => {
    if (lat == null || lon == null) return 'https://www.openstreetmap.org/export/embed.html?bbox=77.55%2C12.90%2C77.65%2C13.00&layer=mapnik';
    const delta = 0.02;
    const minLon = (lon - delta).toFixed(5);
    const minLat = (lat - delta).toFixed(5);
    const maxLon = (lon + delta).toFixed(5);
    const maxLat = (lat + delta).toFixed(5);
    const bbox = `${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
  }, [lat, lon]);

  // Geocode address using Nominatim
  const geocodeAddress = async (addr: string) => {
    if (!addr) return;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat: la, lon: lo } = data[0];
        const nlat = parseFloat(la);
        const nlon = parseFloat(lo);
        if (!Number.isNaN(nlat) && !Number.isNaN(nlon)) {
          setLat(nlat);
          setLon(nlon);
          localStorage.setItem('foodDeliveryLocation', JSON.stringify({ lat: nlat, lon: nlon, address: addr, instructions }));
        }
      }
    } catch {/* ignore network errors */}
  };

  const saveAddress = async () => {
    localStorage.setItem('foodOrderDetails', JSON.stringify({ address, instructions }));
    await geocodeAddress(address);
    setEditing(false);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setLat(latitude);
      setLon(longitude);
      localStorage.setItem('foodDeliveryLocation', JSON.stringify({ lat: latitude, lon: longitude, address, instructions }));
    });
  };

  const handleBackHome = () => {
    setCurrentModule(null);
    setCurrentPage('home');
  };

  return (
  <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-pink-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Order Tracking</h1>
            <p className="text-red-50">
              {status === 'preparing' && 'Your order is being prepared'}
              {status === 'on_the_way' && 'Your order is on the way'}
              {status === 'delivered' && 'Order delivered successfully!'}
            </p>
          </div>

          <div className="p-8">
            <div className="relative mb-12">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-pink-600 transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="flex justify-between mt-8">
                <div className={`flex flex-col items-center ${status === 'preparing' || status === 'on_the_way' || status === 'delivered' ? 'text-red-600' : 'text-gray-400'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${status === 'preparing' || status === 'on_the_way' || status === 'delivered' ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <Clock className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold">Preparing</span>
                </div>

                <div className={`flex flex-col items-center ${status === 'on_the_way' || status === 'delivered' ? 'text-red-600' : 'text-gray-400'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${status === 'on_the_way' || status === 'delivered' ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <Truck className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold">On the Way</span>
                </div>

                <div className={`flex flex-col items-center ${status === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${status === 'delivered' ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold">Delivered</span>
                </div>
              </div>
            </div>

            {status === 'delivered' ? (
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Delivered!</h2>
                <p className="text-gray-600">Thank you for ordering with GOZY</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Delivery Partner</div>
                    <div className="text-sm text-gray-600">Rajesh Kumar</div>
                  </div>
                </div>
                <button className="flex items-center space-x-2 text-red-600 font-semibold hover:text-red-700 transition-colors">
                  <Phone className="w-4 h-4" />
                  <span>Call Delivery Partner</span>
                </button>
                <div className="mt-6 rounded-2xl overflow-hidden border">
                  <iframe
                    title="food-delivery-map"
                    src={mapUrl}
                    style={{ width: '100%', height: 260, border: 0 }}
                  />
                  <div className="text-xs text-gray-500 p-2">Live delivery location (mocked)</div>
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <div className="flex items-start space-x-3 text-gray-700">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold">Delivery Address</div>
                    {!editing ? (
                      <div className="space-x-2">
                        <button onClick={()=> setEditing(true)} className="text-sm text-red-600 font-semibold">Edit</button>
                        <button onClick={useCurrentLocation} className="text-sm text-gray-600 hover:text-gray-800">Use current location</button>
                      </div>
                    ) : null}
                  </div>

                  {!editing ? (
                    <div className="text-sm">
                      <div>{address || 'Add your delivery address'}</div>
                      {instructions && <div className="text-gray-500 mt-1">Instruction: {instructions}</div>}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <textarea value={address} onChange={e=> setAddress(e.target.value)} rows={3} placeholder="Enter full address" className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-red-500 outline-none" />
                      <input value={instructions} onChange={e=> setInstructions(e.target.value)} placeholder="Delivery instructions (optional)" className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-red-500 outline-none" />
                      <div className="space-x-2">
                        <button onClick={saveAddress} className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold">Save</button>
                        <button onClick={()=> setEditing(false)} className="px-4 py-2 border-2 border-gray-300 rounded-xl">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {status === 'delivered' && (
              <button
                onClick={handleBackHome}
                className="w-full mt-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xl font-bold rounded-xl hover:from-red-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
              >
                Back to Home
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
