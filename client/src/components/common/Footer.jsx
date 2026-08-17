import React from 'react';
import { Pill, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
        <div className="flex items-center space-x-2">
          <Pill className="w-4 h-4 text-brand-500" />
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>Designed with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>for better healthcare adherence.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
