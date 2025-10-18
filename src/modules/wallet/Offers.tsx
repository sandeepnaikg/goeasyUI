import { ArrowLeft, CheckCircle, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useState } from 'react';

type Offer = {
  id: string;
  title: string;
  detail: string;
  tag: string;
  code: string; // promo code to apply in checkout
  module: 'travel' | 'food' | 'tickets' | 'shopping';
  route: string; // destination page
};

const offers: Offer[] = [
  { id: 'o1', title: '₹100 Wallet Cashback', detail: 'Pay with GOZY Wallet on Food and get ₹100 cashback on orders over ₹499 (Code: WALLET100)', tag: 'Wallet', code: 'WALLET100', module: 'food', route: 'food-home' },
  { id: 'o2', title: '20% OFF on Movies', detail: 'Use code MOVIE20 on Tickets to get 20% OFF (max ₹150)', tag: 'Tickets', code: 'MOVIE20', module: 'tickets', route: 'tickets-home' },
  { id: 'o3', title: 'Bank Offer: HDFC', detail: '10% instant discount on HDFC Credit Cards on Shopping (min ₹2999) • Code: HDFC10', tag: 'Bank', code: 'HDFC10', module: 'shopping', route: 'shopping-home' },
  // new offers
  { id: 'o4', title: 'Flight Saver ₹300 OFF', detail: 'Flat ₹300 OFF on Flights on min fare ₹2500 (Code: GOFLY300)', tag: 'Travel', code: 'GOFLY300', module: 'travel', route: 'travel-home' },
  { id: 'o5', title: 'Hotel Deal 20% OFF', detail: 'Get 20% OFF on Hotels up to ₹500 (Code: STAY20)', tag: 'Hotel', code: 'STAY20', module: 'travel', route: 'travel-home' },
  { id: 'o6', title: 'Bus Saver ₹50 OFF', detail: 'Flat ₹50 OFF on Bus tickets on min fare ₹400 (Code: BUS50)', tag: 'Bus', code: 'BUS50', module: 'travel', route: 'travel-home' },
];

export default function Offers() {
  const { setCurrentModule, setCurrentPage } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [justApplied, setJustApplied] = useState<string | null>(null);

  const applyOffer = (offer: Offer) => {
    // Persist the selected promo code; PaymentPage will auto-apply and show papercut
    localStorage.setItem('selectedOfferCode', offer.code);
    // Navigate to respective module home
    setCurrentModule(offer.module);
    setCurrentPage(offer.route);
    setJustApplied(offer.id);
    // brief feedback; auto clear
    setTimeout(() => setJustApplied(null), 1800);
  };
  return (
    <div className="min-h-screen bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button onClick={() => { setCurrentModule('wallet'); setCurrentPage('wallet-home'); }} className="p-2 rounded-full hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-2xl font-bold ml-2">Offers & Deals</h1>
        </div>
        <div className="space-y-4">
          {offers.map(o => (
            <div key={o.id} className={`bg-white border-2 ${expandedId===o.id ? 'border-teal-300' : 'border-gray-100'} rounded-2xl p-5 hover:border-teal-200 transition-colors`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-teal-700 bg-teal-50 inline-flex items-center space-x-1 px-2 py-0.5 rounded-full mb-2">
                    <Tag className="w-3 h-3" />
                    <span>{o.tag}</span>
                  </div>
                  <div className="font-semibold text-gray-900">{o.title}</div>
                </div>
                <button aria-label="expand offer" onClick={() => setExpandedId(expandedId===o.id ? null : o.id)} className={`p-2 rounded-full ${expandedId===o.id ? 'text-teal-600 bg-teal-50' : 'text-gray-500 hover:text-teal-600 hover:bg-teal-50'}`}>
                  <CheckCircle className="w-6 h-6" />
                </button>
              </div>

              {expandedId===o.id && (
                <div className="mt-3 text-sm text-gray-700">
                  <div className="mb-3">{o.detail}</div>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Valid on {o.tag} • Promo: <span className="font-semibold text-gray-900">{o.code}</span></li>
                    <li>Apply at checkout to see instant savings</li>
                    <li>One code per order • Limited time</li>
                  </ul>
                  <div className="mt-4 flex items-center space-x-3">
                    <button onClick={() => applyOffer(o)} className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold">Apply & Go</button>
                    {justApplied===o.id && <span className="text-emerald-700 font-semibold">Added! Head to checkout →</span>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
