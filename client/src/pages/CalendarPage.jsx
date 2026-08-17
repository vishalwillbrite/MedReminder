import React, { useState, useEffect } from 'react';
import { getTodayRemindersApi } from '../services/reminderService';
import { getMedicinesApi } from '../services/medicineService';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pill,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Filter,
  X,
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const CalendarPage = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [medicines, setMedicines] = useState([]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day'
  const [selectedMedicine, setSelectedMedicine] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const loadData = async () => {
    try {
      const [remData, medData] = await Promise.all([
        getTodayRemindersApi(),
        getMedicinesApi(),
      ]);
      setReminders(remData || []);
      setMedicines(medData?.medicines || medData || []);
    } catch (err) {
      console.error('Failed to load calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const changeDate = (amount) => {
    const nextDate = new Date(currentDate);
    if (viewMode === 'month') {
      nextDate.setMonth(nextDate.getMonth() + amount);
    } else if (viewMode === 'week') {
      nextDate.setDate(nextDate.getDate() + amount * 7);
    } else {
      nextDate.setDate(nextDate.getDate() + amount);
    }
    setCurrentDate(nextDate);
  };

  // Helper for calendar grid generation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const filteredReminders = reminders.filter((r) => {
    if (selectedMedicine !== 'ALL' && (r.medicine?._id || r.medicine) !== selectedMedicine) return false;
    if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
    return true;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Taken':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200';
      case 'Missed':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200';
      case 'Snoozed':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200';
      default:
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-200';
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

        <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-7 h-7 text-sky-500" />
                <span>Medication Calendar</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Visual monthly and daily medication schedule planner.
              </p>
            </div>

            {/* View Mode & Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1 shadow-sm">
                <button
                  onClick={() => changeDate(-1)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-4 text-xs font-bold text-slate-900 dark:text-white">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => changeDate(1)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Medicine Filter */}
              <select
                value={selectedMedicine}
                onChange={(e) => setSelectedMedicine(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm"
              >
                <option value="ALL">All Medicines</option>
                {medicines.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm"
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Taken">Taken</option>
                <option value="Missed">Missed</option>
                <option value="Snoozed">Snoozed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton type="table" />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md overflow-hidden p-6">
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-extrabold text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 pt-4 min-h-[420px]">
                {/* Blank days before month start */}
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`blank-${i}`} className="p-2 min-h-[90px] rounded-2xl bg-slate-50/40 dark:bg-slate-900/40 opacity-30" />
                ))}

                {/* Days of current month */}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const isToday =
                    dayNum === new Date().getDate() &&
                    month === new Date().getMonth() &&
                    year === new Date().getFullYear();

                  return (
                    <div
                      key={`day-${dayNum}`}
                      className={`p-2 min-h-[90px] rounded-2xl border transition flex flex-col justify-between ${
                        isToday
                          ? 'border-sky-500 bg-sky-50/30 dark:bg-sky-950/30 shadow-inner'
                          : 'border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                            isToday ? 'bg-sky-600 text-white font-extrabold' : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {dayNum}
                        </span>
                      </div>

                      {/* Display today's dose pills */}
                      <div className="space-y-1 mt-1 overflow-y-auto max-h-16">
                        {isToday &&
                          filteredReminders.map((rem) => (
                            <button
                              key={rem._id}
                              onClick={() => setSelectedEvent(rem)}
                              className={`w-full text-left px-2 py-1 rounded-xl text-[10px] font-bold border truncate transition flex items-center justify-between ${getStatusBadgeClass(
                                rem.status
                              )}`}
                            >
                              <span className="truncate">{rem.medicine?.name || 'Medicine'}</span>
                              <span className="ml-1 opacity-75">{rem.timeSlot}</span>
                            </button>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Event Detail Modal */}
          {selectedEvent && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Pill className="w-5 h-5 text-sky-500" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedEvent.medicine?.name || 'Medication Details'}
                    </h3>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <p><strong>Dosage:</strong> {selectedEvent.dosage || selectedEvent.medicine?.dosage}</p>
                  <p><strong>Timing:</strong> {selectedEvent.foodTiming || selectedEvent.medicine?.foodTiming}</p>
                  <p><strong>Scheduled Time:</strong> {selectedEvent.timeSlot}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${getStatusBadgeClass(selectedEvent.status)}`}>
                      {selectedEvent.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default CalendarPage;
