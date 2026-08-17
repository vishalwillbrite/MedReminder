import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotificationContext } from '../context/NotificationContext';
import { getDashboardDataApi } from '../services/dashboardService';
import { getTodayRemindersApi, updateReminderStatusApi } from '../services/reminderService';
import { toast } from 'react-hot-toast';
import {
  Pill,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  PlusCircle,
  TrendingUp,
  Bell,
  Volume2,
  ShieldCheck,
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
  const { subscriptionStatus, permissionStatus, subscribeToPush, loading: pushLoading } = useNotificationContext();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState(null);
  const [todayReminders, setTodayReminders] = useState([]);

  const loadData = async () => {
    try {
      const [dash, reminders] = await Promise.all([
        getDashboardDataApi(),
        getTodayRemindersApi(),
      ]);
      setDashData(dash);
      setTodayReminders(reminders);
    } catch (err) {
      console.error('Failed to load dashboard payload:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 30000);

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
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Good day, {user?.name || 'Patient'} 👋
              </h1>
              <p className="text-xs sm:text-sm text-sky-100 mt-1">
                Your live medication schedule and adherence analytics dashboard.
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 text-xs font-bold">
              <TrendingUp className="w-4 h-4 text-emerald-300" />
              <span>Adherence Rate: {summary.adherenceRate || 100}%</span>
            </div>
          </div>

          {/* Professional Notification Permission Card */}
          {!subscriptionStatus && permissionStatus !== 'denied' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                  <Bell className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Never miss a medicine reminder</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Enable notifications to receive reminders even when MedReminder isn't open.
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

          {loading ? (
            <LoadingSkeleton type="stat" count={5} />
          ) : (
            <>
              {/* Dashboard Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                  title="Today's Doses"
                  value={summary.todayTotal || 0}
                  icon={Clock}
                  color="brand"
                  subtext="Scheduled for today"
                />
                <StatCard
                  title="Upcoming"
                  value={summary.todayUpcoming || 0}
                  icon={Pill}
                  color="amber"
                  subtext="Pending doses"
                />
                <StatCard
                  title="Taken Today"
                  value={summary.todayTaken || 0}
                  icon={CheckCircle2}
                  color="emerald"
                  subtext="Completed doses"
                />
                <StatCard
                  title="Missed Doses"
                  value={summary.todayMissed || 0}
                  icon={AlertTriangle}
                  color="rose"
                  subtext="Requires attention"
                />
                <StatCard
                  title="Total Prescriptions"
                  value={summary.totalMedicines || 0}
                  icon={Activity}
                  color="indigo"
                  subtext={`${summary.activeMedicines || 0} active course(s)`}
                />
              </div>

              {/* Today's Schedule Timeline */}
              <ReminderTimeline
                reminders={todayReminders}
                onStatusUpdate={handleReminderStatusUpdate}
              />

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <WeeklyProgressChart data={dashData?.charts?.weeklyProgress || []} />
                <CompletionChart data={dashData?.charts?.typeDistribution || []} />
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
