import { useEffect, useState } from 'react';
import { Train, Clock, MapPin, Ticket } from 'lucide-react';
import { useApp } from '../../context/AppContext';

type Metro = { id: string; line: string; departure: string; arrival: string; duration: string; price: number; rating?: number };

export default function TravelMetroDetails() {
  const { setCurrentPage } = useApp();
  const [metro, setMetro] = useState<Metro | null>(null);
  const [search, setSearch] = useState<{ fromLocation?: string; toLocation?: string; departureDate?: string } | null>(null);

  useEffect(() => {
    try { const m = JSON.parse(localStorage.getItem('selectedMetro') || 'null'); setMetro(m); } catch {/* ignore */}
    try { const s = JSON.parse(localStorage.getItem('travelSearch') || 'null'); setSearch(s); } catch {/* ignore */}
  }, []);

  if (!metro) return null;

  const fare = metro.price ?? 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-1">Metro Journey</h1>
            <p className="text-white/80">{metro.line}</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-indigo-600 mt-1" />
                <div>
                  <div className="text-sm text-gray-600">From</div>
                  <div className="text-2xl font-bold text-gray-900">{search?.fromLocation}</div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <Clock className="w-6 h-6 text-gray-400 mb-1" />
                <div className="text-lg font-semibold text-gray-700">{metro.duration}</div>
                <div className="text-sm text-indigo-700">Frequent service</div>
              </div>
              <div className="flex items-start justify-end space-x-2">
                <div className="text-right">
                  <div className="text-sm text-gray-600">To</div>
                  <div className="text-2xl font-bold text-gray-900">{search?.toLocation}</div>
                </div>
                <MapPin className="w-5 h-5 text-indigo-600 mt-1" />
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 mb-8 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Ticket className="w-6 h-6 text-indigo-600" />
                <div>
                  <div className="text-sm text-gray-600">Estimated Fare</div>
                  <div className="text-3xl font-bold text-indigo-700">₹{fare.toLocaleString()}</div>
                </div>
              </div>
              <Train className="w-10 h-10 text-indigo-500" />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => { localStorage.setItem('bookingType','metro'); setCurrentPage('travel-payment'); }}
                className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xl font-bold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                Proceed to Pay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
