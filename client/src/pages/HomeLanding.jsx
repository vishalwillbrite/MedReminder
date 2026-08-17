import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, ShieldCheck, Clock, Activity, ArrowRight, CheckCircle, Zap } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const HomeLanding = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 lg:py-28">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-500/20 to-teal-400/20 blur-3xl rounded-full pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-xs font-semibold shadow-xs">
              <Zap className="w-3.5 h-3.5" />
              <span>Smart Minute-Precision Reminder Engine</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
              Never Miss a Prescription. <br />
              <span className="bg-gradient-to-r from-brand-600 via-teal-500 to-sky-500 bg-clip-text text-transparent">
                Intelligent Health & Medication Tracker.
              </span>
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              MedReminder empowers patients and caregivers to schedule complex dosage routines, receive automated cron-backed reminders, log adherence progress, and manage emergency health profiles.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-white font-bold text-base shadow-xl shadow-brand-500/25 flex items-center justify-center space-x-2 transition transform hover:-translate-y-0.5"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-base shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Sign In to Dashboard
              </Link>
            </div>

            {/* Value Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 max-w-5xl mx-auto">
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm text-left space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Precision Cron Schedule</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Automated background cron runs every minute to verify medicine alarm slots and auto-flag missed doses.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm text-left space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Adherence Analytics</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Visual breakdown charts for weekly intake compliance, medicine categories, and active pill inventory.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm text-left space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Emergency Profile</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Keep critical medical conditions, food intake instructions, and primary caregiver contacts securely organized.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomeLanding;
