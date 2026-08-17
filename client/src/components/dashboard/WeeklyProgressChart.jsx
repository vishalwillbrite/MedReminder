import React from 'react';
import { Calendar } from 'lucide-react';

const WeeklyProgressChart = ({ data = [] }) => {
  const maxTotal = Math.max(...data.map((d) => d.total || 0), 1);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-500" />
            <span>Weekly Adherence Progress</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Doses taken vs missed over the last 7 days
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-600 dark:text-slate-400">Taken</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span className="text-slate-600 dark:text-slate-400">Missed</span>
          </div>
        </div>
      </div>

      <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
        {data.map((item, index) => {
          const takenHeight = (item.taken / maxTotal) * 100;
          const missedHeight = (item.missed / maxTotal) * 100;

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2 group relative">
              {/* Tooltip */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded-lg pointer-events-none z-10 whitespace-nowrap shadow-lg">
                {item.date}: {item.taken} taken, {item.missed} missed
              </div>

              {/* Bar container */}
              <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800/60 rounded-xl h-44 flex flex-col justify-end p-1 space-y-1">
                {item.missed > 0 && (
                  <div
                    style={{ height: `${Math.max(missedHeight, 8)}%` }}
                    className="w-full bg-rose-500 rounded-lg transition-all duration-500"
                  />
                )}
                {item.taken > 0 && (
                  <div
                    style={{ height: `${Math.max(takenHeight, 8)}%` }}
                    className="w-full bg-emerald-500 rounded-lg transition-all duration-500"
                  />
                )}
                {item.total === 0 && (
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/50 rounded" />
                )}
              </div>

              {/* Day Label */}
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyProgressChart;
