import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, CheckCheck, Clock, AlertTriangle, ShieldCheck, Volume2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';

const NotificationsPage = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    pushEnabled,
    enablePushNotifications,
    markAsRead,
    markAllAsRead,
    snooze,
  } = useNotifications();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-7 h-7 text-sky-500" />
                <span>Notification Center</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Full historical log of medicine alarms, missed doses, and push notifications.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center space-x-1 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50"
                >
                  <CheckCheck className="w-4 h-4 text-sky-500" />
                  <span>Mark All Read</span>
                </button>
              )}
            </div>
          </div>

          {/* Web Push Banner */}
          {!pushEnabled && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-600 to-teal-500 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  <span>Web Push Notifications Disconnected</span>
                </h3>
                <p className="text-xs text-sky-100 mt-1">
                  Enable browser push permissions to get dose alarms even when MedReminder is closed.
                </p>
              </div>

              <button
                onClick={enablePushNotifications}
                className="px-5 py-2.5 rounded-2xl bg-white text-sky-700 font-extrabold text-xs shadow-md hover:bg-sky-50"
              >
                Enable Push Alerts
              </button>
            </div>
          )}

          {/* Notifications Log */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            {notifications.length === 0 ? (
              <p className="text-xs text-center text-slate-400 py-12">No notifications found.</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => markAsRead(notif._id)}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    notif.isRead
                      ? 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'
                      : 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-sky-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {notif.type === 'reminder' && notif.medicine && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          snooze(notif.medicine._id, 10);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      >
                        ⏱ Snooze 10m
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default NotificationsPage;
