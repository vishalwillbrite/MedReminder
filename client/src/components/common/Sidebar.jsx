import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  PlusCircle,
  Calendar as CalendarIcon,
  History,
  FileText,
  User,
  Settings,
  X,
  Bell,
  Download,
  HeartPulse,
} from 'lucide-react';
import { downloadMedicinesCSV } from '../../utils/exportUtils';
import { toast } from 'react-hot-toast';

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Medicines', path: '/medicines', icon: Pill },
    { name: 'Add Medicine', path: '/add-medicine', icon: PlusCircle },
    { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
    { name: 'Adherence History', path: '/history', icon: History },
    { name: 'Export Reports', path: '/export', icon: FileText },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Health Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleExportCSV = async () => {
    try {
      await downloadMedicinesCSV();
      toast.success('Downloaded prescription CSV export!');
    } catch (err) {
      toast.error('Failed to export CSV file');
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Close button for mobile */}
            <div className="flex items-center justify-between md:hidden pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Navigation</span>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-bold shadow-sm border border-sky-200/50 dark:border-sky-800/50'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* CSV Export Button */}
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition shadow-xs"
            >
              <Download className="w-4 h-4 text-sky-500" />
              <span>Export Prescriptions CSV</span>
            </button>

            {/* Sidebar widget / banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-500/10 via-teal-500/10 to-cyan-500/10 border border-sky-200/40 dark:border-sky-900/40">
              <div className="flex items-center space-x-2 text-sky-600 dark:text-sky-400 mb-1">
                <HeartPulse className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Web Push & PWA</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Background cron syncs every minute with browser Web Push notifications.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
