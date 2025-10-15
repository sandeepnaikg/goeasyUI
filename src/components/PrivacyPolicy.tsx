import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PrivacyPolicy() {
  const { setCurrentPage, prevPage } = useApp();
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentPage(prevPage || 'profile')} className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-teal-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
          <div className="w-24" />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow space-y-6">
          <div className="text-sm text-gray-500">Last updated: 12 Oct 2025</div>
          <nav className="text-sm">
            <ul className="list-disc pl-5 space-y-1 text-teal-700">
              <li><a href="#collection" className="underline">Data Collection</a></li>
              <li><a href="#usage" className="underline">Usage</a></li>
              <li><a href="#controls" className="underline">Your Controls</a></li>
            </ul>
          </nav>
          <section id="collection" className="space-y-2">
            <h2 className="text-lg font-bold">Data Collection</h2>
            <p className="text-gray-700 text-sm">We collect minimal data to provide the service. This is demo content.</p>
          </section>
          <section id="usage" className="space-y-2">
            <h2 className="text-lg font-bold">Usage</h2>
            <p className="text-gray-700 text-sm">We use preferences to personalize offers locally. Analytics are stubbed/off by default.</p>
          </section>
          <section id="controls" className="space-y-2">
            <h2 className="text-lg font-bold">Your Controls</h2>
            <p className="text-gray-700 text-sm">You can download data and delete your demo account from Privacy & Security.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
