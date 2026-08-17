import React, { useState, useEffect } from 'react';
import { getTodayRemindersApi } from '../services/reminderService';
import { getMedicinesApi } from '../services/medicineService';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Calendar,
  Pill,
  Download,
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

const HistoryPage = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [historyItems, setHistoryItems] = useState([]);
  const [medicines, setMedicines] = useState([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [medicineFilter, setMedicineFilter] = useState('ALL');

  const loadHistory = async () => {
    try {
      const [remData, medData] = await Promise.all([
        getTodayRemindersApi(),
        getMedicinesApi(),
      ]);
      setHistoryItems(remData || []);
      setMedicines(medData?.medicines || medData || []);
    } catch (err) {
      console.error('Failed to load medication history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredItems = historyItems.filter((item) => {
    const medName = item.medicine?.name || '';
    const matchesSearch = medName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesMedicine = medicineFilter === 'ALL' || (item.medicine?._id || item.medicine) === medicineFilter;
    return matchesSearch && matchesStatus && matchesMedicine;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Taken':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Taken</span>
          </span>
        );
      case 'Missed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Missed</span>
          </span>
        );
      case 'Snoozed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Snoozed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
            <Clock className="w-3.5 h-3.5" />
            <span>{status || 'Pending'}</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-7 h-7 text-sky-500" />
              <span>Medication Adherence History</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Audit log of completed, missed, and snoozed medication doses.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicine name..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <select
                value={medicineFilter}
                onChange={(e) => setMedicineFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">All Medicines</option>
                {medicines.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">All Statuses</option>
                <option value="Taken">Taken</option>
                <option value="Missed">Missed</option>
                <option value="Snoozed">Snoozed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* History Table */}
          {loading ? (
            <LoadingSkeleton type="table" />
          ) : filteredItems.length === 0 ? (
            <EmptyState
              title="No Medication Logs Found"
              description="No medication history entries match your selected search filters."
              actionLabel="Reset Filters"
              onAction={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setMedicineFilter('ALL');
              }}
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Medicine & Dosage</th>
                      <th className="px-6 py-4">Scheduled Slot</th>
                      <th className="px-6 py-4">Food Timing</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredItems.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                          <Pill className="w-4 h-4 text-sky-500" />
                          <span>{item.medicine?.name || 'Paracetamol'}</span>
                          <span className="text-slate-400 font-normal">({item.dosage || item.medicine?.dosage})</span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">{item.timeSlot}</td>
                        <td className="px-6 py-4 text-slate-500">{item.foodTiming || item.medicine?.foodTiming || 'After Food'}</td>
                        <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                        <td className="px-6 py-4 text-slate-400 font-medium">{item.dateString || new Date().toISOString().split('T')[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default HistoryPage;
