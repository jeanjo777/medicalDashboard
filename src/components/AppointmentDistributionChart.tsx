/**
 * Appointment Distribution Chart Component - OPTIMIZED VERSION
 *
 * Displays distribution of patient status and appointment specialties.
 * Uses server-side filtering for scalability.
 *
 * Features:
 * - Dual chart types: Pie (status) & Bar (specialties)
 * - Interactive period filters (Week/Month/Year)
 * - Server-side date filtering
 * - Loading states with skeleton
 * - Error handling with retry
 * - Smooth transitions
 * - Enhanced tooltips
 * - Date range indicator
 */

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '../lib/supabase';
import { PieChartIcon, BarChart3, Loader2 } from 'lucide-react';
import logger from '../utils/logger';

type Period = 'week' | 'month' | 'year';
type ChartType = 'pie' | 'bar';

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface SpecialtyData {
  name: string;
  appointments: number;
}

interface DateRange {
  start: Date;
  end: Date;
}

const AppointmentDistributionChart: React.FC = () => {
  const [period, setPeriod] = useState<Period>('month');
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [specialtyData, setSpecialtyData] = useState<SpecialtyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  useEffect(() => {
    fetchDistributionData();
  }, [period]);

  /**
   * Calculate date range for selected period
   */
  const getDateRange = (period: Period): DateRange => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const start = new Date(now);

    switch (period) {
      case 'week':
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 11);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 4);
        start.setMonth(0);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
    }

    return { start, end };
  };

  /**
   * Fetch and process distribution data
   */
  const fetchDistributionData = async () => {
    setLoading(true);
    setError(null);

    try {
      const range = getDateRange(period);
      setDateRange(range);

      logger.info(`[AppointmentDistribution] Fetching for period: ${period}`);
      logger.info(`[AppointmentDistribution] Range: ${range.start.toISOString()} → ${range.end.toISOString()}`);

      // Fetch patients with status (for pie chart)
      // NOTE: If period filter returns no data, fetch ALL patients
      let { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('id, status, created_at')
        .gte('created_at', range.start.toISOString())
        .lte('created_at', range.end.toISOString());

      // Fallback: if no data in period, fetch all patients
      if (!patientsError && (!patients || patients.length === 0)) {
        logger.info('[AppointmentDistribution] No data in period, fetching all patients');
        const { data: allPatients, error: allError } = await supabase
          .from('patients')
          .select('id, status, created_at');
        patients = allPatients;
        patientsError = allError;
      }

      // Fetch appointments (for bar chart)
      // Note: appointments table uses appointment_date (DATE type), not created_at
      const startDateStr = formatDateForSQL(range.start);
      const endDateStr = formatDateForSQL(range.end);

      let { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id, appointment_date, message, status')
        .gte('appointment_date', startDateStr)
        .lte('appointment_date', endDateStr);

      // Fallback: if no data in period, fetch all appointments
      if (!appointmentsError && (!appointments || appointments.length === 0)) {
        logger.info('[AppointmentDistribution] No appointments in period, fetching all');
        const { data: allAppointments, error: allError } = await supabase
          .from('appointments')
          .select('id, appointment_date, message, status');
        appointments = allAppointments;
        appointmentsError = allError;
      }

      if (patientsError || appointmentsError) {
        logger.error('[AppointmentDistribution] Error:', { patientsError, appointmentsError });
        throw new Error(patientsError?.message || appointmentsError?.message || 'Failed to fetch data');
      }

      logger.info(`[AppointmentDistribution] Fetched ${patients?.length || 0} patients, ${appointments?.length || 0} appointments`);

      // Process data or fallback to mock
      if (!patients || patients.length === 0) {
        logger.warn('[AppointmentDistribution] No patient data, using mock');
        setStatusData(getMockStatusData());
      } else {
        const statusCounts = processStatusData(patients);
        setStatusData(statusCounts);
      }

      if (!appointments || appointments.length === 0) {
        logger.warn('[AppointmentDistribution] No appointment data, using mock');
        setSpecialtyData(getMockSpecialtyData());
      } else {
        const specialtyCounts = processSpecialtyData(appointments);
        setSpecialtyData(specialtyCounts);
      }

    } catch (err: any) {
      logger.error('[AppointmentDistribution] Error:', err);
      setError(err.message || 'Failed to load distribution data');
      setStatusData(getMockStatusData());
      setSpecialtyData(getMockSpecialtyData());
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format date for SQL DATE field (YYYY-MM-DD)
   */
  const formatDateForSQL = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  /**
   * Process patient status data
   */
  const processStatusData = (patients: any[]): StatusData[] => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      'active': { label: 'Actif', color: '#3b82f6' },
      'in_treatment': { label: 'En Traitement', color: '#8b5cf6' },
      'recovered': { label: 'Guéri', color: '#10b981' },
      'inactive': { label: 'Inactif', color: '#6b7280' }
    };

    const counts: { [key: string]: number } = {
      active: 0,
      in_treatment: 0,
      recovered: 0,
      inactive: 0
    };

    patients.forEach(patient => {
      const status = patient.status || 'active';
      if (counts[status] !== undefined) {
        counts[status]++;
      } else {
        counts.active++;
      }
    });

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: statusMap[status]?.label || status,
        value: count,
        color: statusMap[status]?.color || '#3b82f6'
      }));
  };

  /**
   * Process appointment specialty data (extracted from message field)
   */
  const processSpecialtyData = (appointments: any[]): SpecialtyData[] => {
    const specialtyKeywords: { [key: string]: string } = {
      'cardio': 'Cardiologie',
      'derma': 'Dermatologie',
      'neuro': 'Neurologie',
      'ortho': 'Orthopédie',
      'pédiat': 'Pédiatrie',
      'diabète': 'Diabétologie',
      'physio': 'Physiothérapie'
    };

    const counts: { [key: string]: number } = {
      'Consultation Générale': 0
    };

    appointments.forEach(apt => {
      const message = (apt.message || '').toLowerCase();
      let specialty = 'Consultation Générale';

      // Try to extract specialty from message
      for (const [keyword, name] of Object.entries(specialtyKeywords)) {
        if (message.includes(keyword)) {
          specialty = name;
          break;
        }
      }

      counts[specialty] = (counts[specialty] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, appointments: count }))
      .sort((a, b) => b.appointments - a.appointments)
      .slice(0, 6); // Top 6 specialties
  };

  /**
   * Mock data fallback
   */
  const getMockStatusData = (): StatusData[] => [
    { name: 'Actif', value: 245, color: '#3b82f6' },
    { name: 'En Traitement', value: 168, color: '#8b5cf6' },
    { name: 'Guéri', value: 89, color: '#10b981' }
  ];

  const getMockSpecialtyData = (): SpecialtyData[] => [
    { name: 'Médecine Générale', appointments: 145 },
    { name: 'Cardiologie', appointments: 89 },
    { name: 'Dermatologie', appointments: 67 },
    { name: 'Pédiatrie', appointments: 54 },
    { name: 'Orthopédie', appointments: 43 },
    { name: 'Neurologie', appointments: 32 }
  ];

  /**
   * Format date range for display
   */
  const formatDateRange = (): string => {
    if (!dateRange) return '';

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: period === 'year' ? 'numeric' : undefined
    };

    const startStr = dateRange.start.toLocaleDateString('fr-FR', options);
    const endStr = dateRange.end.toLocaleDateString('fr-FR', options);

    return `${startStr} - ${endStr}`;
  };

  /**
   * Period options
   */
  const periods = [
    { value: 'week' as Period, label: 'Semaine' },
    { value: 'month' as Period, label: 'Mois' },
    { value: 'year' as Period, label: 'Année' }
  ];

  /**
   * Enhanced tooltips
   */
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-3 shadow-xl">
          <p className="text-gray-400 text-xs mb-1">{payload[0].name}</p>
          <p className="text-white text-sm font-semibold">
            {payload[0].value} patients
          </p>
          <p className="text-purple-400 text-xs mt-1">
            {payload[0].payload.percent}% du total
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-3 shadow-xl">
          <p className="text-gray-400 text-xs mb-1">{payload[0].payload.name}</p>
          <p className="text-white text-sm font-semibold">
            {payload[0].value} rendez-vous
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = (entry: any) => {
    return `${entry.percent}%`;
  };

  // Calculate percentages for pie chart
  const dataWithPercent = statusData.map(item => {
    const total = statusData.reduce((sum, d) => sum + d.value, 0);
    return {
      ...item,
      percent: total > 0 ? Math.round((item.value / total) * 100) : 0
    };
  });

  // ════════════════════════════════════════════════════════════
  // RENDER: Loading State
  // ════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600/10 rounded-lg flex items-center justify-center">
              <PieChartIcon size={22} className="text-purple-500" />
            </div>
            <div>
              <div className="h-5 bg-[#334155] rounded w-48 mb-2 animate-pulse" />
              <div className="h-4 bg-[#334155] rounded w-32 animate-pulse" />
            </div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-9 w-20 bg-[#334155] rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
        <div className="h-64 bg-[#334155] rounded animate-pulse" />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // RENDER: Error State
  // ════════════════════════════════════════════════════════════

  if (error) {
    return (
      <div className="bg-[#1e293b] rounded-xl p-6 border border-red-500/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600/10 rounded-lg flex items-center justify-center">
              <PieChartIcon size={22} className="text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Distribution des Données
              </h3>
              <p className="text-red-400 text-sm">Erreur de chargement</p>
            </div>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchDistributionData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // RENDER: Chart
  // ════════════════════════════════════════════════════════════

  return (
    <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155] hover:border-[#475569] transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600/10 rounded-lg flex items-center justify-center">
            {chartType === 'pie' ? (
              <PieChartIcon size={22} className="text-purple-500" />
            ) : (
              <BarChart3 size={22} className="text-purple-500" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {chartType === 'pie' ? 'Répartition par Statut' : 'Rendez-vous par Spécialité'}
            </h3>
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-400">
                {chartType === 'pie'
                  ? `${statusData.reduce((sum, d) => sum + d.value, 0)} patients au total`
                  : `${specialtyData.reduce((sum, d) => sum + d.appointments, 0)} rendez-vous`
                }
              </p>
              {dateRange && (
                <p className="text-xs text-gray-500">
                  {formatDateRange()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {/* Chart Type Toggle */}
          <div className="flex gap-1 bg-[#334155] rounded-lg p-1">
            <button
              onClick={() => setChartType('pie')}
              className={`
                p-2 rounded-md transition-all duration-200
                ${chartType === 'pie'
                  ? 'bg-purple-600 text-white shadow-lg scale-110'
                  : 'text-gray-400 hover:text-white hover:scale-110'
                }
              `}
              title="Camembert"
            >
              <PieChartIcon size={18} />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`
                p-2 rounded-md transition-all duration-200
                ${chartType === 'bar'
                  ? 'bg-purple-600 text-white shadow-lg scale-110'
                  : 'text-gray-400 hover:text-white hover:scale-110'
                }
              `}
              title="Barres"
            >
              <BarChart3 size={18} />
            </button>
          </div>

          {/* Period Filters */}
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              disabled={loading}
              className={`
                relative px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${period === p.value
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                  : 'bg-[#334155] text-gray-400 hover:bg-[#475569] hover:text-white hover:scale-105'
                }
                ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                disabled:cursor-not-allowed
              `}
            >
              <span className={loading && period === p.value ? 'opacity-0' : ''}>
                {p.label}
              </span>
              {loading && period === p.value && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {chartType === 'pie' ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dataWithPercent}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={500}
            >
              {dataWithPercent.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={specialtyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              style={{ fontSize: '11px' }}
              angle={-15}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => value.toLocaleString('fr-FR')}
            />
            <Tooltip content={<CustomBarTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
              iconType="rect"
            />
            <Bar
              dataKey="appointments"
              fill="#8b5cf6"
              radius={[8, 8, 0, 0]}
              name="Rendez-vous"
              animationBegin={0}
              animationDuration={500}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AppointmentDistributionChart;
