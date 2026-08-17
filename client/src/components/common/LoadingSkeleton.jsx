import React from 'react';

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const skeletons = Array.from({ length: count });

  if (type === 'table') {
    return (
      <div className="w-full space-y-4 animate-pulse">
        {skeletons.map((_, i) => (
          <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
        ))}
      </div>
    );
  }

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {skeletons.map((_, i) => (
          <div
            key={i}
            className="h-28 bg-slate-200 dark:bg-slate-800/60 rounded-2xl p-4 animate-pulse flex flex-col justify-between"
          >
            <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/2" />
            <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {skeletons.map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse space-y-4"
        >
          <div className="flex justify-between items-center">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
            <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
          <div className="pt-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
