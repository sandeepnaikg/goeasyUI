import { useEffect, useMemo, useState } from 'react';
import { Smartphone, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function OpenOnPhone() {
  const { setCurrentPage } = useApp();
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    const loc = window.location;
    const suggested = `${loc.protocol}//${loc.host}`;
    setUrl(suggested);
  }, []);

  const qrSrc = useMemo(() => {
    const target = url?.trim() || window.location.href;
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(target)}`;
  }, [url]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Smartphone className="w-6 h-6 text-gray-900" />
            <h1 className="text-2xl font-bold text-gray-900">Open on your phone</h1>
          </div>
          <p className="text-gray-700 mb-4">
            Scan this QR on your iPhone to open the app in Safari. For development on the same Wi‑Fi, run the dev server with host enabled and use your Mac’s IP.
          </p>

          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="flex items-center justify-center">
              {/* Using public QR generation API to avoid extra deps */}
              <img src={qrSrc} alt="QR to open app" className="rounded-xl border" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Target URL</label>
              <input value={url} onChange={(e)=> setUrl(e.target.value)} placeholder="http://192.168.1.10:5173" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none" />
              <div className="mt-4 p-3 rounded-xl bg-gray-50 border text-sm text-gray-700 flex items-start space-x-3">
                <Info className="w-4 h-4 text-gray-600 mt-0.5" />
                <div>
                  <div className="font-semibold mb-1">Tips</div>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Start dev server with host enabled so phones can reach it.</li>
                    <li>Replace localhost with your Mac’s IP (e.g., http://192.168.x.x:5173).</li>
                    <li>Both devices must be on the same Wi‑Fi network.</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button onClick={()=> setUrl(window.location.origin)} className="px-4 py-2 border-2 border-gray-300 rounded-xl hover:border-teal-500">Use current origin</button>
                <button onClick={()=> setCurrentPage('home')} className="px-4 py-2 bg-teal-600 text-white rounded-xl">Back to Home</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
