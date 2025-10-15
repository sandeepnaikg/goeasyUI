import { LifeBuoy } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SupportFab() {
  const { setCurrentPage } = useApp();
  return (
    <button
      onClick={() => setCurrentPage('help-center')}
      className="fixed bottom-6 right-6 z-40 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-2xl hover:from-teal-600 hover:to-cyan-700 transition-all w-14 h-14 flex items-center justify-center"
      aria-label="Help and Support"
    >
      <LifeBuoy className="w-6 h-6" />
    </button>
  );
}
