/**
 * AppointmentDistributionChart Component
 *
 * Displays appointment distribution by consultation type using a bar chart.
 * Connected to real Supabase data via useAppointmentDistribution hook.
 * Includes export functionality and time period filtering.
 *
 * @component
 * @example
 * <AppointmentDistributionChart />
 *
 * @accessibility
 * - High contrast chart colors
 * - Rotated axis labels for readability
 * - Export button with icon and label
 * - Loading skeleton for better UX
 * - Error and empty states with recovery
 *
 * @usage
 * - Dashboard analytics section
 * - Consultation type workload analysis
 * - Appointment volume monitoring
 *
 * @features
 * - Bar chart with rounded corners
 * - CSV export functionality
 * - Time period filtering (week/month/year)
 * - Responsive sizing
 * - Green accent color scheme
 * - Real-time data from Supabase
 */

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Download, RefreshCw } from 'lucide-react';
import EmptyState from '../EmptyState';
import ErrorState from '../ErrorState';
import { useAppointmentDistribution, DistributionPeriod } from '../../hooks/useAppointmentDistribution';

const AppointmentDistributionChart: React.FC = () => {
  const [activePeriod, setActivePeriod] = useState<DistributionPeriod>('semaine');
  const { data, loading, error, refetch, isRefetching, totalAppointments, exportToCSV } = useAppointmentDistribution(activePeriod);

  const chartData = data.map(d => ({
    type: d.type,
    count: d.count,
  }));

  const hasData = chartData.length > 0;

  if (loading) {
    return (
      <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#334155] rounded w-1/3" />
          <div className="h-[280px] bg-[#334155] rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1e293b] rounded-xl border border-[#334155]">
        <ErrorState
          type="network"
          message={error.message}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="bg-[#1e293b] rounded-xl border border-[#334155]">
        <EmptyState
          title="Aucune donnée de distribution"
          message="Les statistiques de rendez-vous par département apparaîtront ici."
          type="appointments"
          className="py-12"
        />
      </div>
    );
  }

  const getPeriodLabel = () => {
    switch (activePeriod) {
      case 'semaine': return 'Cette semaine';
      case 'mois': return 'Ce mois';
      case 'annee': return 'Cette année';
    }
  };

  return (
    <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white text-lg font-semibold mb-1">Distribution des Rendez-vous</h3>
          <p className="text-gray-400 text-sm">
            Par type de consultation · {getPeriodLabel()} · {totalAppointments} RDV
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#0f172a] rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActivePeriod('semaine')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activePeriod === 'semaine'
                  ? 'bg-[#1e293b] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sem.
            </button>
            <button
              type="button"
              onClick={() => setActivePeriod('mois')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activePeriod === 'mois'
                  ? 'bg-[#1e293b] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mois
            </button>
            <button
              type="button"
              onClick={() => setActivePeriod('annee')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activePeriod === 'annee'
                  ? 'bg-[#1e293b] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Année
            </button>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 bg-[#0f172a] hover:bg-[#334155] text-gray-400 hover:text-white rounded-lg transition-colors disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={exportToCSV}
            disabled={!hasData}
            className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] hover:bg-[#334155] text-gray-300 rounded-lg transition-colors text-sm disabled:opacity-50"
          >
            <Download size={16} />
            <span>CSV</span>
          </button>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey="type"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#334155' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: number) => [`${value} RDV`, 'Nombre']}
            />
            <Bar
              dataKey="count"
              fill="#10b981"
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AppointmentDistributionChart;
