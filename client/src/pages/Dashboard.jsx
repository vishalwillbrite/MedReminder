import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotificationContext } from '../context/NotificationContext';
import { getDashboardAnalyticsApi } from '../services/dashboardService';
import { updateReminderStatusApi, snoozeReminderApi } from '../services/reminderService';
import { toast } from 'react-hot-toast';
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  PlusCircle,
  TrendingUp,
  Flame,
  Bell,
  Calendar as CalendarIcon,
  History,
  FileText,
  Settings as SettingsIcon,
  RefreshCw,
  Award,
  Zap,
  Check,
  RotateCcw,
  FastForward,
  ExternalLink,
  ChevronRight,
  Eye,
  Edit,
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import StatCard from '../components/dashboard/StatCard';
import WeeklyProgressChart from '../components/dashboard/WeeklyProgressChart';
import CompletionChart from '../components/dashboard/CompletionChart';
import RecentActivityList from '../components/dashboard/RecentActivityList';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatTodayDate = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const Dashboard = () => {
  const { user } = useAuth();
  const {
    subscriptionStatus,
    permissionStatus,
    subscribeToPush,
    loading: pushLoading,
  } = useNotificationContext();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashData, setDashData] = useState(null);
  const [analyticsTab, setAnalyticsTab] = useState('weekly'); // 'weekly' | 'monthly'

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardAnalyticsApi();
      setDashData(data);
    } catch (err) {
      console.error('Failed to load dashboard payload:', err);
      setError('Unable to load your dashboard metrics. Please verify server connection.');
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateReminderStatusApi(id, status);
      toast.success(`Dose marked as ${status}`);
      loadData();
    } catch (err) {
      toast.error('Failed to update dose status');
    }
  };

  const handleSnooze = async (id) => {
    try {
      await snoozeReminderApi(id, 10);
      toast.success('Reminder snoozed for 10 minutes');
      loadData();
    } catch (err) {
      toast.error('Failed to snooze reminder');
    }
  };

  const summary = dashData?.summary || {};
  const todaySchedule = dashData?.todaySchedule || [];
  const nextReminder = dashData?.nextReminder;
  const streak = dashData?.streak || { currentStreak: 0, bestStreak: 0 };
  const activeMedicines = dashData?.activeMedicines || [];
  const upcomingReminders = dashData?.upcomingReminders || [];
  const recentActivity = dashData?.recentActivity || [];
  const monthlyAdherence = dashData?.monthlyAdherence || { totalScheduled: 0, totalTaken: 0, totalMissed: 0, adherenceRate: 100, weeks: [] };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Taken':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>TAKEN</span>
          </span>
        );
      case 'Missed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>MISSED</span>
          </span>
        );
      case 'Snoozed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>SNOOZED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
            <Clock className="w-3.5 h-3.5" />
            <span>UPCOMING</span>
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
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-sky-600 via-teal-600 to-brand-600 text-white shadow-xl shadow-sky-500/15">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {getGreeting()}, {user?.name || 'Patient'} 👋
              </h1>
              <p className="text-xs sm:text-sm text-sky-100 mt-1">
                Here's your medication overview for today — {formatTodayDate()}.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/30 text-xs font-bold">
                <Flame className="w-4 h-4 text-amber-300 animate-bounce" />
                <span>Streak: {streak.currentStreak} Days</span>
              </div>

              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/30 text-xs font-bold">
                <TrendingUp className="w-4 h-4 text-emerald-300" />
                <span>Adherence: {summary.adherenceRate || 100}%</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between overflow-x-auto gap-3">
            <div className="flex items-center space-x-2 min-w-max">
              <Link
                to="/add-medicine"
                className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add Medicine</span>
              </Link>
              <Link
                to="/calendar"
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition"
              >
                <CalendarIcon className="w-4 h-4 text-sky-500" />
                <span>📅 View Calendar</span>
              </Link>
              <Link
                to="/history"
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition"
              >
                <History className="w-4 h-4 text-teal-500" />
                <span>📋 View History</span>
              </Link>
              <Link
                to="/export"
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition"
              >
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>📤 Export Report</span>
              </Link>
              <Link
                to="/settings"
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition"
              >
                <Bell className="w-4 h-4 text-amber-500" />
                <span>🔔 Notification Settings</span>
              </Link>
            </div>

            <button
              onClick={loadData}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition ml-auto"
              title="Refresh Dashboard"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Web Push Notification Status Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-2xl ${subscriptionStatus ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'}`}>
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {subscriptionStatus ? '🔔 Notifications Enabled' : '🔔 Notifications Disabled'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {subscriptionStatus
                    ? "You're ready to receive real-time medication reminders."
                    : 'Enable notifications so you don\'t miss your medication doses.'}
                </p>
              </div>
            </div>

            {!subscriptionStatus && permissionStatus !== 'denied' && (
              <button
                onClick={subscribeToPush}
                disabled={pushLoading}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-400 hover:to-teal-300 text-white font-extrabold text-xs shadow-md shadow-sky-500/20 whitespace-nowrap transition disabled:opacity-50"
              >
                {pushLoading ? 'Enabling...' : 'Enable Notifications'}
              </button>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-between">
              <div className="flex items-center space-x-3 text-rose-800 dark:text-rose-200 text-xs font-semibold">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>Unable to load your dashboard.</span>
              </div>
              <button
                onClick={loadData}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Try Again
              </button>
            </div>
          )}

          {loading ? (
            <LoadingSkeleton type="stat" count={8} />
          ) : (
            <>
              {/* 8 Summary Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="TOTAL MEDICINES"
                  value={summary.totalMedicines || 0}
                  icon={Pill}
                  color="brand"
                  subtext={`${summary.activeMedicines || 0} active medications`}
                />
                <StatCard
                  title="TODAY'S REMINDERS"
                  value={summary.todayReminders || 0}
                  icon={Clock}
                  color="amber"
                  subtext="Scheduled today"
                />
                <StatCard
                  title="TAKEN TODAY"
                  value={summary.takenToday || 0}
                  icon={CheckCircle2}
                  color="emerald"
                  subtext={`${summary.todayReminders > 0 ? Math.round((summary.takenToday / summary.todayReminders) * 100) : 100}% completed`}
                />
                <StatCard
                  title="MISSED TODAY"
                  value={summary.missedToday || 0}
                  icon={AlertTriangle}
                  color="rose"
                  subtext={summary.missedToday > 0 ? 'Needs attention' : 'All clear'}
                />
                <StatCard
                  title="UPCOMING"
                  value={summary.upcomingToday || 0}
                  icon={Zap}
                  color="indigo"
                  subtext="Pending dose slots"
                />
                <StatCard
                  title="ADHERENCE"
                  value={`${summary.adherenceRate || 100}%`}
                  icon={TrendingUp}
                  color="emerald"
                  subtext="Overall completion rate"
                />
                <StatCard
                  title="CURRENT STREAK"
                  value={`${streak.currentStreak || 0} Days`}
                  icon={Flame}
                  color="amber"
                  subtext={streak.currentStreak > 0 ? '🔥 Keep it going!' : 'Start today'}
                />
                <StatCard
                  title="BEST STREAK"
                  value={`${streak.bestStreak || 0} Days`}
                  icon={Award}
                  color="sky"
                  subtext="Personal record"
                />
              </div>

              {/* Next Upcoming Reminder Highlighted Card */}
              {nextReminder && (
                <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-sky-500/10 border border-amber-300/60 dark:border-amber-800/60 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3.5 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                      <Zap className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Next Reminder
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                        💊 {nextReminder.medicineName} ({nextReminder.dosage})
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Scheduled at <strong>{nextReminder.formattedTime}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 px-4 py-2.5 rounded-2xl font-black text-sm border border-amber-300 dark:border-amber-800">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>{nextReminder.timeRemaining}</span>
                  </div>
                </div>
              )}

              {/* Today's Medication Schedule */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-sky-500" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Today's Schedule</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{todaySchedule.length} Dose Slot(s)</span>
                </div>

                {todaySchedule.length === 0 ? (
                  <EmptyState
                    title="No Reminders Scheduled Today"
                    description="You have no medication doses scheduled for today."
                    actionLabel="+ Add Medicine"
                    onAction={() => window.location.href = '/add-medicine'}
                  />
                ) : (
                  <div className="space-y-3">
                    {todaySchedule.map((rem) => (
                      <div
                        key={rem._id}
                        className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:shadow-sm"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-lg overflow-hidden flex-shrink-0">
                            {rem.image ? (
                              <img src={rem.image} alt={rem.medicineName} className="w-full h-full object-cover" />
                            ) : (
                              <Pill className="w-6 h-6" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                💊 {rem.medicineName}
                              </h4>
                              {getStatusBadge(rem.status)}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {rem.dosage} • {rem.foodTiming} • <strong>{rem.formattedTime}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                          {rem.status !== 'Taken' && (
                            <button
                              onClick={() => handleStatusUpdate(rem._id, 'Taken')}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center space-x-1 transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Take</span>
                            </button>
                          )}
                          {rem.status === 'Pending' && (
                            <button
                              onClick={() => handleSnooze(rem._id)}
                              className="px-3.5 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-200 font-bold text-xs border border-amber-200 dark:border-amber-800 transition"
                            >
                              Snooze
                            </button>
                          )}
                          {rem.status !== 'Skipped' && rem.status !== 'Taken' && (
                            <button
                              onClick={() => handleStatusUpdate(rem._id, 'Skipped')}
                              className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 transition"
                            >
                              Skip
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Adherence Analytics Section (Weekly & Monthly Toggle) */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Medication Adherence</h3>
                  </div>

                  {/* Toggle Tabs */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs font-bold">
                    <button
                      onClick={() => setAnalyticsTab('weekly')}
                      className={`px-3 py-1.5 rounded-lg transition ${analyticsTab === 'weekly' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => setAnalyticsTab('monthly')}
                      className={`px-3 py-1.5 rounded-lg transition ${analyticsTab === 'monthly' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                {analyticsTab === 'weekly' ? (
                  <WeeklyProgressChart data={dashData?.weeklyAdherence || []} />
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                      <div>
                        <span className="text-xs text-slate-400 font-bold uppercase">30-Day Scheduled</span>
                        <p className="text-lg font-extrabold text-slate-900 dark:text-white">{monthlyAdherence.totalScheduled}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 font-bold uppercase">Taken Doses</span>
                        <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{monthlyAdherence.totalTaken}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 font-bold uppercase">Missed Doses</span>
                        <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400">{monthlyAdherence.totalMissed}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 font-bold uppercase">Monthly Adherence</span>
                        <p className="text-lg font-extrabold text-sky-600 dark:text-sky-400">{monthlyAdherence.adherenceRate}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(monthlyAdherence.weeks || []).map((w) => (
                        <div key={w.week} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
                          <span className="text-xs font-bold text-slate-500">{w.week}</span>
                          <p className="text-base font-black text-sky-600 dark:text-sky-400">{w.adherence}%</p>
                          <span className="text-[10px] text-slate-400">{w.taken} / {w.scheduled} taken</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Prescriptions Overview */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Pill className="w-5 h-5 text-sky-500" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Prescriptions</h3>
                  </div>
                  <Link to="/medicines" className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline">
                    View All Medicines →
                  </Link>
                </div>

                {activeMedicines.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No active medicines found.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activeMedicines.map((m) => (
                      <div
                        key={m._id}
                        className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">💊 {m.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{m.dosage} • {m.foodTiming}</p>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Link
                            to={`/edit-medicine/${m._id}`}
                            className="p-2 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                            title="Edit Medicine"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Reminders List & Recent Activity Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Reminders List */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Reminders</h3>
                  </div>

                  {upcomingReminders.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No upcoming pending reminders.</p>
                  ) : (
                    <div className="space-y-2">
                      {upcomingReminders.map((item) => (
                        <div
                          key={item._id}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">💊 {item.medicineName}</span>
                            <span className="text-slate-400 ml-2">({item.dosage})</span>
                          </div>
                          <span className="font-semibold text-amber-600 dark:text-amber-400">{item.formattedTime} ({item.timeRemaining})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Activity Feed */}
                <RecentActivityList activities={recentActivity} />
              </div>
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
