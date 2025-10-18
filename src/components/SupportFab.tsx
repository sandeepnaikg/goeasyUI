import { LifeBuoy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useEffect, useState } from 'react';

export default function SupportFab() {
  const { setCurrentPage } = useApp();
  const [visible, setVisible] = useState<boolean>(() => {
    try { return localStorage.getItem('helpFabVisible') === '1'; } catch { return false; }
  });

  useEffect(() => {
    const onShow = () => setVisible(true);
    const onHide = () => setVisible(false);
    window.addEventListener('help-fab-show', onShow);
    window.addEventListener('help-fab-hide', onHide);
    return () => {
      window.removeEventListener('help-fab-show', onShow);
      window.removeEventListener('help-fab-hide', onHide);
    };
  }, []);

  if (!visible) return null;
  return (
    <button
      onClick={() => setCurrentPage('help-center')}
      className="fixed bottom-6 left-6 z-40 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-2xl hover:from-teal-600 hover:to-cyan-700 transition-all w-14 h-14 flex items-center justify-center"
      aria-label="Help and Support"
    >
      <LifeBuoy className="w-6 h-6" />
    </button>
  );
}
