import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('installPromptDismissed') === '1';
    const handler = (e: Event) => {
      e.preventDefault();
      const evt = e as BeforeInstallPromptEvent;
      setDeferred(evt);
      if (!dismissed && window.matchMedia('(min-width: 768px)').matches) {
        setShow(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!show) return null;

  return (
    <div className="hidden md:block fixed bottom-6 right-6 z-[90]">
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-4 w-80 animate-[slideUp_220ms_ease-out]">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-xl bg-blue-50 text-blue-600 p-2">
            <Download className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">Install Gozy</div>
            <div className="text-sm text-gray-600">Add Gozy to your dock to launch quickly like an app.</div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={async () => {
                  try {
                    if (deferred) {
                      await deferred.prompt();
                      setShow(false);
                    }
                  } catch {
                    setShow(false);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm"
              >Install</button>
              <button
                onClick={() => { localStorage.setItem('installPromptDismissed','1'); setShow(false); }}
                className="px-3 py-1.5 rounded-lg border text-sm"
              >Not now</button>
            </div>
          </div>
          <button onClick={() => { localStorage.setItem('installPromptDismissed','1'); setShow(false); }} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }`}</style>
    </div>
  );
}
