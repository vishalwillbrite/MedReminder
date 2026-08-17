import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = ({ onFinish }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onFinish) onFinish();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-sky-950 to-slate-950 text-white"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="w-24 h-24 rounded-3xl p-1 bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl shadow-sky-500/20 flex items-center justify-center">
              <img src="/logo.svg" alt="MedReminder Logo" className="w-full h-full object-contain" />
            </div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl font-extrabold bg-gradient-to-r from-sky-400 via-teal-300 to-cyan-200 bg-clip-text text-transparent tracking-tight"
            >
              MedReminder
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-sky-200/70 uppercase tracking-widest font-semibold"
            >
              Smart Prescription & Health Tracker
            </motion.p>
          </motion.div>

          <div className="absolute bottom-12 flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span className="text-xs text-sky-300/80 font-medium">Initializing PWA Engine...</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
