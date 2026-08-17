import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, AlertOctagon, Home } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <AlertOctagon className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">404 - Page Not Found</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              The page or prescription route you are trying to view does not exist or has been moved.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md transition"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
