import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotificationContext } from '../context/NotificationContext';
import { getDashboardAnalyticsApi } from '../services/dashboardService';
import { updateReminderStatusApi } from '../services/reminderService';
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
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import StatCard from '../components/dashboard/StatCard';
import WeeklyProgressChart from '../components/dashboard/WeeklyProgressChart';
import CompletionChart from '../components/dashboard/CompletionChart';
import RecentActivityList from '../components/dashboard/RecentActivityList';
import ReminderTimeline from '../components/medicines/ReminderTimeline';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

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

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardAnalyticsApi();
      setDashData(data);
    } catch (err) {
      console.error('Failed to load dashboard payload:', err);
      setError('Unable to load dashboard data. Please verify database connection.');
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

  const handleReminderStatusUpdate = async (id, status) => {
    try {
      await updateReminderStatusApi(id, status);
      toast.success(`Dose marked as ${status}`);
      loadData();
    } catch (err) {
      toast.error('Failed to update dose status');
    }
  };

  const summary = dashData?.summary || {};
  const todayReminders = dashData?.today || [];
  const upcomingReminders = dashData?.upcoming || [];
  const streak = dashData?.streak || { currentStreak: 0, bestStreak: 0 };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Welcome Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-sky-600 via-teal-600 to-brand-600 text-white shadow-xl shadow-sky-500/15">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                <span>Good day, {user?.name || 'Patient'} 👋</span>
              </h1>
              <p className="text-xs sm:text-sm text-sky-100 mt-1">
                Your live medication schedule and adherence analytics hub.
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
                <span>View Calendar</span>
              </Link>
              <Link
                to="/history"
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition"
              >
                <History className="w-4 h-4 text-teal-500" />
                <span>View History</span>
              </Link>
              <Link
                to="/export"
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition"
              >
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Export PDF/CSV</span>
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
          {!subscriptionStatus && permissionStatus !== 'denied' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                  <Bell className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Never miss a medicine reminder</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Enable Web Push notifications to receive alarms even when MedReminder isn't open.
                  </p>
                </div>
              </div>

              <button
                onClick={subscribeToPush}
                disabled={pushLoading}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-400 hover:to-teal-300 text-white font-extrabold text-xs shadow-md shadow-sky-500/20 whitespace-nowrap transition disabled:opacity-50"
              >
                {pushLoading ? 'Enabling...' : 'Enable Notifications'}
              </button>
            </div>
          )}

          {error && (
            <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-between">
              <div className="flex items-center space-x-3 text-rose-800 dark:text-rose-200 text-xs font-semibold">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>{error}</span>
              </div>
              <button
                onClick={loadData}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Retry
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
                  title="Total Prescriptions"
                  value={summary.totalMedicines || 0}
                  icon={Pill}
                  color="brand"
                  subtext={`${summary.activeMedicines || 0} active course(s)`}
                />
                <StatCard
                  title="Today's Doses"
                  value={summary.todayTotal || 0}
                  icon={Clock}
                  color="amber"
                  subtext="Scheduled for today"
                />
                <StatCard
                  title="Completed Today"
                  value={summary.completedToday || 0}
                  icon={CheckCircle2}
                  color="emerald"
                  subtext="Doses taken today"
                />
                <StatCard
                  title="Missed Today"
                  value={summary.missedToday || 0}
                  icon={AlertTriangle}
                  color="rose"
                  subtext="Requires attention"
                />
                <StatCard
                  title="Upcoming Today"
                  value={summary.upcomingToday || 0}
                  icon={Zap}
                  color="indigo"
                  subtext="Pending dose slots"
                />
                <StatCard
                  title="Adherence Rate"
                  value={`${summary.adherenceRate || 100}%`}
                  icon={TrendingUp}
                  color="emerald"
                  subtext="Overall completion"
                />
                <StatCard
                  title="Current Streak"
                  value={`${streak.currentStreak || 0} Days`}
                  icon={Flame}
                  color="amber"
                  subtext={`Best: ${streak.bestStreak || 0} days`}
                />
                <StatCard
                  title="Total Reminders"
                  value={summary.totalReminders || 0}
                  icon={Award}
                  color="sky"
                  subtext="Historical count"
                />
              </div>

              {/* Next Upcoming Reminders Countdown Widget */}
              {upcomingReminders.length > 0 && (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Medication Countdown</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {upcomingReminders.map((item) => (
                      <div
                        key={item._id}
                        className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{item.medicineName}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.dosage} at {item.timeSlot}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-white font-extrabold text-[10px]">
                          {item.timeRemaining}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Today's Schedule Timeline */}
              <ReminderTimeline
                reminders={todayReminders}
                onStatusUpdate={handleReminderStatusUpdate}
              />

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <WeeklyProgressChart data={dashData?.weekly || []} />
                <CompletionChart data={dashData?.typeDistribution || []} />
              </div>

              {/* Recent System Activity */}
              <RecentActivityList activities={dashData?.recentActivity || []} />
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
