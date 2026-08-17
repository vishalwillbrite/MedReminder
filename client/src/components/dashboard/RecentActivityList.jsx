import React from 'react';
import { Activity, CheckCircle2, XCircle, PlusCircle, Edit3, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const getIconForAction = (action) => {
  if (action.includes('TAKEN')) {
    return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  }
  if (action.includes('MISSED')) {
    return <XCircle className="w-4 h-4 text-rose-500" />;
  }
  if (action.includes('ADDED')) {
    return <PlusCircle className="w-4 h-4 text-brand-500" />;
  }
  if (action.includes('UPDATED')) {
    return <Edit3 className="w-4 h-4 text-amber-500" />;
  }
  return <Activity className="w-4 h-4 text-indigo-500" />;
};

const RecentActivityList = ({ activities = [] }) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-500" />
          <span>Recent System Activity</span>
        </h3>
        <span className="text-xs text-slate-400">Live Log</span>
      </div>

      {activities.length === 0 ? (
        <p className="text-xs text-center text-slate-400 py-6">No recent activity logged yet.</p>
      ) : (
        <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
          {activities.map((act) => (
            <div
              key={act._id}
              className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60"
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1.5 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200/60 dark:border-slate-700/60">
                  {getIconForAction(act.action)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    {act.details}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {act.createdAt ? formatDistanceToNow(new Date(act.createdAt), { addSuffix: true }) : 'Recently'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivityList;
