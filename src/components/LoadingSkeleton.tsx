import React from 'react';

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="glass backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gray-300 dark:bg-gray-700" />
        <div className="w-20 h-10 bg-gray-300 dark:bg-gray-700 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  );
};

export const StatGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="glass backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>
      </div>
      <div className="h-[300px] bg-gray-300 dark:bg-gray-700 rounded-lg" />
      <div className="flex items-center justify-between mt-4">
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="glass backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 overflow-hidden animate-pulse">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {[1, 2, 3, 4, 5].map((i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {[1, 2, 3, 4, 5].map((row) => (
              <tr key={row}>
                {[1, 2, 3, 4, 5].map((col) => (
                  <td key={col} className="px-6 py-4">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const AlertsPanelSkeleton: React.FC = () => {
  return (
    <div className="glass backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-40" />
        </div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-48" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3" />
                  </div>
                  <div className="h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded-full" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2" />
                      <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AnalysisSummarySkeleton: React.FC = () => {
  return (
    <div className="glass backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-violet-300 to-pink-300 dark:from-violet-700 dark:to-pink-700 rounded-xl" />
          <div>
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-40 mb-2" />
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-32" />
          </div>
        </div>
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-lg" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CalendarSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="bg-gradient-to-r from-blue-300 to-violet-300 dark:from-blue-700 dark:to-violet-700 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 bg-white/30 rounded w-48" />
            <div className="h-4 bg-white/20 rounded w-36" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg" />
            <div className="h-6 bg-white/30 rounded w-32" />
            <div className="w-10 h-10 bg-white/20 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-8 gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          ))}
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="grid grid-cols-8 gap-2">
            {[...Array(8)].map((_, j) => (
              <div key={j} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const PatientCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full" />
          <div className="space-y-2">
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-32" />
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24" />
          </div>
        </div>
        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full" />
      </div>

      <div className="space-y-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
      </div>

      <div className="flex gap-2 mt-4">
        <div className="h-9 bg-gray-300 dark:bg-gray-700 rounded-lg flex-1" />
        <div className="h-9 bg-gray-300 dark:bg-gray-700 rounded-lg flex-1" />
      </div>
    </div>
  );
};

export const DashboardLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 animate-pulse" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-48 animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
      </div>

      <AnalysisSummarySkeleton />

      <AlertsPanelSkeleton />

      <StatGridSkeleton />

      <ChartSkeleton />

      <TableSkeleton />
    </div>
  );
};

const LoadingSkeleton = {
  StatCard: StatCardSkeleton,
  StatGrid: StatGridSkeleton,
  Chart: ChartSkeleton,
  Table: TableSkeleton,
  AlertsPanel: AlertsPanelSkeleton,
  AnalysisSummary: AnalysisSummarySkeleton,
  Calendar: CalendarSkeleton,
  PatientCard: PatientCardSkeleton,
  Dashboard: DashboardLoadingSkeleton,
};

export default LoadingSkeleton;
