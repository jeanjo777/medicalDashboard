/**
 * PatientGrowthChart Component
 *
 * Displays patient registration trends over time using a line chart.
 * Supports multiple time views (week, month, year) with smooth transitions.
 * Connected to real Supabase data via usePatientGrowthData hook.
 *
 * @component
 * @example
 * <PatientGrowthChart />
 *
 * @accessibility
 * - Keyboard navigable view toggles
 * - High contrast chart colors
 * - Tooltip for precise data reading
 * - Loading skeleton for better UX
 * - Error and empty states
 *
 * @usage
 * - Dashboard analytics section
 * - Patient growth monitoring
 * - Registration trend analysis
 *
 * @features
 * - Time period filters (week/month/year)
 * - Real-time data from Supabase
 * - Responsive chart sizing
 * - Smooth animations
 * - Error handling with retry
 * - Empty state for no data
 */

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw } from 'lucide-react';
import EmptyState from '../EmptyState';
import ErrorState from '../ErrorState';
import { usePatientGrowthData, TimePeriod } from '../../hooks/usePatientGrowthData';

const PatientGrowthChart: React.FC = () => {
  const [activeView, setActiveView] = useState<TimePeriod>('annee');
  const { data, loading, error, refetch, isRefetching } = usePatientGrowthData(activeView);

  const chartData = data.map(d => ({
    label: d.label,
    patients: d.patients,
  }));

  const hasData = chartData.length > 0 && chartData.some(d => d.patients > 0);

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
          title="Aucune donnée de croissance"
          message="Les statistiques de croissance apparaîtront une fois que vous aurez des patients enregistrés."
          type="generic"
          className="py-12"
        />
      </div>
    );
  }

  const getPeriodLabel = () => {
    switch (activeView) {
      case 'semaine': return 'Évolution sur 7 jours';
      case 'mois': return 'Évolution sur 30 jours';
      case 'annee': return 'Évolution sur 12 mois';
    }
  };

  return (
    <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white text-lg font-semibold mb-1">Croissance des Patients</h3>
          <p className="text-gray-400 text-sm">{getPeriodLabel()}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 bg-[#0f172a] hover:bg-[#334155] text-gray-400 hover:text-white rounded-lg transition-colors disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
          </button>
          <div className="flex items-center gap-2 bg-[#0f172a] rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveView('semaine')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'semaine'
                  ? 'bg-[#1e293b] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Semaine
            </button>
            <button
              type="button"
              onClick={() => setActiveView('mois')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'mois'
                  ? 'bg-[#1e293b] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mois
            </button>
            <button
              type="button"
              onClick={() => setActiveView('annee')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'annee'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Année
            </button>
        </div>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#334155' }}
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
            />
            <Line
              type="monotone"
              dataKey="patients"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PatientGrowthChart;
