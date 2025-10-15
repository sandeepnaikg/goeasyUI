import { useState, useEffect, useMemo } from 'react';
import { Clock, Briefcase, Coffee, Shield, BadgePercent, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TrustBadges from '../../components/TrustBadges';

type Flight = { airline: string; flightNumber: string; departure: string; arrival: string; duration: string; price: number };

export default function TravelDetails() {
  const [flight, setFlight] = useState<Flight | null>(null);
  const [queuedCode, setQueuedCode] = useState<string | null>(null);
  const [offerPreview, setOfferPreview] = useState<{ code: string; discount: number; newTotal: number } | null>(null);
  const { setCurrentPage } = useApp();
  const [chosenFare, setChosenFare] = useState<'Basic'|'Value'|'Flex'>('Value');

  // Build fare families derived from base flight price
  const fareFamilies = useMemo(() => {
    const base = flight?.price || 0;
    return [
      { family: 'Basic' as const, price: base, perks: ['7kg cabin bag'], rules: ['No free changes', 'No refund on cancellation'] },
      { family: 'Value' as const, price: Math.max(0, base + 800), perks: ['7kg cabin bag', '15kg check-in'], rules: ['1 date change (₹500)', 'Partial refund'] },
      { family: 'Flex' as const, price: Math.max(0, base + 1800), perks: ['7kg cabin bag', '25kg check-in', 'Preferred seat'], rules: ['Free date change ≥24h', 'Full refund ≥48h'] },
    ];
  }, [flight]);

  useEffect(() => {
    const data = localStorage.getItem('selectedFlight');
    if (data) {
      const f = JSON.parse(data);
      setFlight(f);
      // restore chosen fare if already selected earlier in flow
      if (f && typeof f.chosenFare === 'string' && ['Basic','Value','Flex'].includes(f.chosenFare)) {
        setChosenFare(f.chosenFare);
      }
    }
    const saved = localStorage.getItem('selectedOfferCode');
    if (saved) setQueuedCode(saved);
  }, []);

  useEffect(() => {
    if (!flight || !queuedCode) { setOfferPreview(null); return; }
    const amount = Number(flight.price || 0);
    let discount = 0;
    if (queuedCode === 'GOFLY300') {
      discount = amount >= 2500 ? 300 : 0;
    } else {
      discount = 0; // other codes not applicable to flights here
    }
    if (discount > 0) setOfferPreview({ code: queuedCode, discount, newTotal: Math.max(0, amount - discount) });
    else setOfferPreview(null);
  }, [flight, queuedCode]);

  const handleBook = () => {
    // persist chosen fare into selectedFlight for payment computation
    try {
      const data = JSON.parse(localStorage.getItem('selectedFlight') || '{}');
      const fares = fareFamilies.map(f => ({ family: f.family, price: f.price }));
      const updated = { ...data, fares, chosenFare };
      localStorage.setItem('selectedFlight', JSON.stringify(updated));
      localStorage.setItem('bookingType', 'flight');
    } catch { /* ignore */ }
    setCurrentPage('travel-booking');
  };

  if (!flight) return null;

  const currentFare = fareFamilies.find(f => f.family === chosenFare) || fareFamilies[1];
  const displayPrice = currentFare?.price || flight.price;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">{flight.airline}</h1>
            <p className="text-teal-50">Flight {flight.flightNumber}</p>
          </div>

          <div className="p-8">
            {/* Fare families */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><BadgePercent className="w-5 h-5 text-teal-600" /> Choose Fare Family</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fareFamilies.map(ff => (
                  <button
                    key={ff.family}
                    onClick={() => setChosenFare(ff.family)}
                    className={`text-left p-5 rounded-2xl border-2 transition-all ${chosenFare===ff.family ? 'border-teal-600 bg-teal-50' : 'border-gray-200 hover:border-teal-400'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xl font-bold text-gray-900">{ff.family}</div>
                      <div className="text-teal-700 font-semibold">₹{ff.price.toLocaleString()}</div>
                    </div>
                    <ul className="text-sm text-gray-700 space-y-1 mb-2">
                      {ff.perks.map(p => <li key={p}>• {p}</li>)}
                    </ul>
                    <div className="text-xs text-gray-500">{ff.rules.join(' • ')}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 mb-8">
              <div>
                <div className="text-sm text-gray-600 mb-1">Departure</div>
                <div className="text-3xl font-bold text-gray-900">{flight.departure}</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <Clock className="w-6 h-6 text-gray-400 mb-2" />
                <div className="text-lg font-semibold text-gray-700">{flight.duration}</div>
                <div className="text-sm text-teal-600">Non-stop</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Arrival</div>
                <div className="text-3xl font-bold text-gray-900">{flight.arrival}</div>
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-teal-600" />
                  <span className="text-sm">7kg Cabin Bag</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-teal-600" />
                  <span className="text-sm">15kg Check-in</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Coffee className="w-5 h-5 text-teal-600" />
                  <span className="text-sm">Meals Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-teal-600" />
                  <span className="text-sm">Travel Insurance</span>
                </div>
              </div>
            </div>

            {/* Fee badges preview */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 items-center text-xs">
                <span className="px-2 py-1 rounded-full bg-gray-100 border text-gray-700">Govt. taxes included</span>
                <span className="px-2 py-1 rounded-full bg-gray-100 border text-gray-700">Convenience fee at payment</span>
                <span className="px-2 py-1 rounded-full bg-gray-100 border text-gray-700">Reschedule fee {chosenFare==='Flex' ? 'Free ≥24h' : '₹500'}</span>
              </div>
              <div className="mt-2 text-xs text-gray-500 flex items-center gap-1"><Info className="w-4 h-4 text-gray-400" /> Final payable shown before payment.</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Cancellation Policy</h3>
              <div className="space-y-2 text-gray-700">
                <p>• Free cancellation up to 24 hours before departure</p>
                <p>• 50% refund between 24-6 hours before departure</p>
                <p>• 25% refund within 6 hours of departure</p>
                <p>• Date change allowed with ₹500 fee</p>
              </div>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Earn Rewards</h3>
              <p className="text-gray-700">
                Book this flight and earn <span className="font-bold text-teal-600">450 reward points</span> (₹450 value) that you can use on your next booking!
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">Total Price</div>
                <div className="text-4xl font-bold text-teal-600">₹{displayPrice.toLocaleString()}</div>
                {offerPreview && (
                  <div className="mt-2 text-sm text-gray-700">
                    <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded">{offerPreview.code}</span>
                    <span className="ml-2">−₹{offerPreview.discount} • New total: <span className="font-semibold text-gray-900">₹{offerPreview.newTotal.toLocaleString()}</span></span>
                  </div>
                )}
              </div>
              <button
                onClick={handleBook}
                className="px-12 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-xl font-bold rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
              >
                Continue to Book
              </button>
            </div>

            <div className="mt-8">
              <TrustBadges context="detail" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
