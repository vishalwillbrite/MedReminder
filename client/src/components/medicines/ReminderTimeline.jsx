import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, Utensils, Pill } from 'lucide-react';

const ReminderTimeline = ({ reminders = [], onStatusUpdate }) => {
  if (reminders.length === 0) {
    return (
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm text-center">
        <Pill className="w-8 h-8 text-brand-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Reminders Scheduled Today</p>
        <p className="text-xs text-slate-400 mt-1">All your active medicine doses for today are up to date.</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-500" />
          <span>Today's Live Schedule Timeline</span>
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
          {reminders.length} Doses Scheduled
        </span>
      </div>

      <div className="space-y-3">
        {reminders.map((rem) => {
          const med = rem.medicine || {};
          const isTaken = rem.status === 'Taken';
          const isMissed = rem.status === 'Missed';
          const isPending = rem.status === 'Pending';

          return (
            <div
              key={rem._id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isTaken
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40'
                  : isMissed
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200/60 dark:border-slate-700/60 min-w-[60px]">
                  <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400">
                    {rem.timeSlot}
                  </span>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {med.name || 'Medicine'}
                    </h4>
                    <span className="text-xs text-slate-500 font-medium">({rem.dosage})</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Utensils className="w-3 h-3 text-slate-400" />
                      {rem.foodTiming}
                    </span>
                    {med.medicineType && <span>• {med.medicineType}</span>}
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                {isTaken ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" /> Taken
                  </span>
                ) : isMissed ? (
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                      <XCircle className="w-4 h-4" /> Missed
                    </span>
                    <button
                      onClick={() => onStatusUpdate(rem._id, 'Taken')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    >
                      Take Late
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onStatusUpdate(rem._id, 'Taken')}
                      className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Take Now</span>
                    </button>
                    <button
                      onClick={() => onStatusUpdate(rem._id, 'Skipped')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      Skip
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReminderTimeline;
