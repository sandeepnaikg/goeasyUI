import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function TermsConditions() {
  const { setCurrentPage, prevPage } = useApp();
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentPage(prevPage || 'profile')} className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-teal-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold">Terms & Conditions</h1>
          <div className="w-24" />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow space-y-6">
          <div className="text-sm text-gray-500">Last updated: 12 Oct 2025</div>
          <nav className="text-sm">
            <ul className="list-disc pl-5 space-y-1 text-teal-700">
              <li><a href="#general" className="underline">General</a></li>
              <li><a href="#promo-terms" className="underline">Promotions & Offer Terms</a></li>
              <li><a href="#payments" className="underline">Payments</a></li>
            </ul>
          </nav>
          <section id="general" className="space-y-2">
            <h2 className="text-lg font-bold">General</h2>
            <p className="text-gray-700 text-sm">These Terms govern your use of GOZY apps and services. This is demo content.</p>
          </section>
          <section id="promo-terms" className="space-y-2">
            <h2 className="text-lg font-bold">Promotions & Offer Terms</h2>
            <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
              <li>Total savings cap may apply on stacked offers (e.g., 40% of order value).</li>
              <li>FIRST100 is limited to first order per user.</li>
              <li>Bank offers like HDFC10 may be card-only and not eligible for stacking.</li>
              <li>Wallet cashback (e.g., WALLET100) may credit post-payment; for demo we treat as instant savings.</li>
            </ul>
          </section>
          <section id="payments" className="space-y-2">
            <h2 className="text-lg font-bold">Payments</h2>
            <p className="text-gray-700 text-sm">Your payment information is processed securely. This is demo data; do not enter real PAN/CVV.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
