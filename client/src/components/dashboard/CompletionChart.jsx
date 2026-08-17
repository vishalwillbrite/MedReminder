import React from 'react';
import { PieChart } from 'lucide-react';

const CompletionChart = ({ data = [] }) => {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  const colors = [
    'bg-brand-500 text-brand-500',
    'bg-teal-500 text-teal-500',
    'bg-amber-500 text-amber-500',
    'bg-indigo-500 text-indigo-500',
    'bg-rose-500 text-rose-500',
  ];

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PieChart className="w-5 h-5 text-teal-500" />
          <span>Medicine Breakdown</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Distribution by pharmaceutical type
        </p>
      </div>

      <div className="my-6 space-y-3">
        {data.length === 0 ? (
          <p className="text-xs text-center text-slate-400 py-6">No medicine categories registered yet.</p>
        ) : (
          data.map((item, idx) => {
            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
            const barColor = colors[idx % colors.length].split(' ')[0];

            return (
              <div key={item.type} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{item.type}</span>
                  <span>
                    {item.count} ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${percentage}%` }}
                    className={`h-full ${barColor} rounded-full transition-all duration-500`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
        <span>Total Active Pills & Prescriptions</span>
        <span className="font-bold text-slate-800 dark:text-slate-200">{total} Items</span>
      </div>
    </div>
  );
};

export default CompletionChart;
