import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotificationContext } from '../../context/NotificationContext';
import { Bell, CheckCheck, Trash2, X, Volume2, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    subscriptionStatus,
    permissionStatus,
    subscribeToPush,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    snooze,
  } = useNotificationContext();

  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState('ALL');

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'UNREAD') return !n.read;
    return n.type === filterType;
  });

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        aria-label="Open notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-sky-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Web Push Banner if not enabled */}
          {!subscriptionStatus && permissionStatus !== 'denied' && (
            <div className="m-3 p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-sky-900 dark:text-sky-200">
                <Volume2 className="w-4 h-4 text-sky-500" />
                <span>Enable Push Alerts</span>
              </div>
              <button
                onClick={subscribeToPush}
                className="px-2.5 py-1 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px]"
              >
                Enable
              </button>
            </div>
          )}

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-[11px]">
            {['ALL', 'UNREAD', 'MEDICINE_REMINDER', 'MISSED_DOSE'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  filterType === t
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {t === 'ALL' ? 'All' : t === 'UNREAD' ? 'Unread' : t === 'MEDICINE_REMINDER' ? 'Reminders' : 'Missed'}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto px-2 space-y-2 py-2">
            {filteredNotifications.length === 0 ? (
              <p className="text-xs text-center text-slate-400 py-6">No notification logs found.</p>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => markAsRead(notif._id)}
                  className={`p-3 rounded-2xl border transition cursor-pointer relative group ${
                    notif.read
                      ? 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/50'
                      : 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-200/80 dark:border-sky-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug pr-4">
                      {notif.title}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif._id);
                      }}
                      className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/40 dark:border-slate-800 text-[10px] text-slate-400">
                    <span>{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</span>

                    {notif.medicine && (
                      <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        <Link
                          to={`/medicines/${notif.medicine._id || notif.medicine}`}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center space-x-1 text-sky-600 dark:text-sky-400 font-semibold hover:underline"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={() => snooze(notif.medicine._id || notif.medicine, 10)}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                        >
                          Snooze 10m
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
