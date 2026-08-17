import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const PwaInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted PWA installation');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-slate-900 text-white p-4 rounded-3xl shadow-2xl border border-slate-800 flex items-center justify-between space-x-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center space-x-3">
        <img src="/logo.svg" alt="MedReminder App" className="w-10 h-10 rounded-xl" />
        <div>
          <h4 className="text-xs font-bold text-sky-400">Install MedReminder PWA</h4>
          <p className="text-[11px] text-slate-400">Get offline access & instant background alerts</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-400 hover:to-teal-300 text-white text-xs font-bold flex items-center space-x-1 shadow-md"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="p-1 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;
