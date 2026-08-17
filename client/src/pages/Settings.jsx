import React, { useState } from 'react';
import { changePasswordApi, updateProfileApi } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useNotificationContext } from '../context/NotificationContext';
import { toast } from 'react-hot-toast';
import { Settings as SettingsIcon, Lock, Bell, Moon, Sun, Shield, Volume2, Smartphone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';

const Settings = () => {
  const { user, updateUserState } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const {
    permissionStatus,
    subscriptionStatus,
    subscribeToPush,
    unsubscribeFromPush,
    loading: pushLoading,
  } = useNotificationContext();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // User Notification Settings preferences state
  const initialSettings = user?.notificationSettings || {
    enableReminders: true,
    enableMissedDoseAlerts: true,
    enableDailySummary: true,
    enableSound: true,
    defaultSnoozeDuration: 10,
  };

  const [settings, setSettings] = useState(initialSettings);
  const [prefLoading, setPrefLoading] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match!');
    }
    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters!');
    }

    setPassLoading(true);
    try {
      await changePasswordApi({ currentPassword, newPassword });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setPrefLoading(true);
    try {
      const formData = new FormData();
      Object.keys(settings).forEach((key) => {
        formData.append(`notificationSettings[${key}]`, settings[key]);
      });
      const updatedUser = await updateProfileApi(formData);
      updateUserState(updatedUser);
      toast.success('Notification preferences saved!');
    } catch (err) {
      toast.error('Failed to save notification preferences');
    } finally {
      setPrefLoading(false);
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

        <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto w-full">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <SettingsIcon className="w-7 h-7 text-sky-500" />
              <span>Account & Notification Settings</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure Web Push alerts, snooze durations, security options, and theme preferences.
            </p>
          </div>

          {/* Section 1: Push Subscription Status & Device Registration */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-sky-500" />
                <span>Browser Push Notifications & Devices</span>
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Push Subscription Status:</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      subscriptionStatus
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {subscriptionStatus ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Browser permission: <strong className="capitalize">{permissionStatus}</strong>
                </p>
              </div>

              {subscriptionStatus ? (
                <button
                  onClick={unsubscribeFromPush}
                  disabled={pushLoading}
                  className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition"
                >
                  Unsubscribe Device
                </button>
              ) : (
                <button
                  onClick={subscribeToPush}
                  disabled={pushLoading}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  Enable Push Notifications
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Detailed Notification Preferences */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-teal-500" />
                <span>Notification Preferences</span>
              </h3>
            </div>

            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Enable Medication Reminders</h4>
                  <p className="text-xs text-slate-500">Send push alarms when dose time matches current clock</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableReminders}
                  onChange={(e) => setSettings({ ...settings, enableReminders: e.target.checked })}
                  className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Enable Missed-Dose Alerts</h4>
                  <p className="text-xs text-slate-500">Alert me if a scheduled dose is overdue by 30 minutes</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableMissedDoseAlerts}
                  onChange={(e) => setSettings({ ...settings, enableMissedDoseAlerts: e.target.checked })}
                  className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Enable Morning Daily Summary</h4>
                  <p className="text-xs text-slate-500">Receive morning summary push at 08:00 AM</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableDailySummary}
                  onChange={(e) => setSettings({ ...settings, enableDailySummary: e.target.checked })}
                  className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Default Snooze Duration</h4>
                  <p className="text-xs text-slate-500">Delay time when clicking "Snooze" on dose notifications</p>
                </div>
                <select
                  value={settings.defaultSnoozeDuration}
                  onChange={(e) => setSettings({ ...settings, defaultSnoozeDuration: Number(e.target.value) })}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  <option value={10}>10 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>1 Hour</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Dark Theme Mode</h4>
                  <p className="text-xs text-slate-500">Toggle dark visual aesthetic</p>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={prefLoading}
                className="px-6 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {prefLoading ? 'Saving Preferences...' : 'Save Notification Preferences'}
              </button>
            </div>
          </div>

          {/* Section 3: Change Password */}
          <form onSubmit={handlePasswordSubmit} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-sky-500" />
                <span>Change Password</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={passLoading}
                className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {passLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Settings;
