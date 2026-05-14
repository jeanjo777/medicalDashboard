/**
 * useAppointmentDistribution - Hook for appointment distribution chart data
 *
 * Fetches real appointment data from Supabase and groups it by
 * consultation type for visualization.
 *
 * @features
 * - Groups appointments by type_consultation
 * - Supports time period filtering (week, month, year)
 * - Intelligent caching with React Query
 * - Auto-refresh every 5 minutes
 * - CSV export functionality
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import logger from '../utils/logger';
import { getCurrentMedicId } from '../utils/auth';
import { subDays, subMonths, parseISO, isAfter } from 'date-fns';

export type DistributionPeriod = 'semaine' | 'mois' | 'annee';

export interface DistributionDataPoint {
  type: string;
  count: number;
  percentage: number;
}

interface Appointment {
  id: string;
  type_consultation: string | null;
  appointment_date: string;
  status: string;
}

// French labels for consultation types
const TYPE_LABELS: Record<string, string> = {
  'Consultation': 'Consultation',
  'Contrôle': 'Contrôle',
  'Suivi': 'Suivi',
  'Urgence': 'Urgence',
  'Téléconsultation': 'Téléconsultation',
  'Autre': 'Autre',
};

/**
 * Fetch all appointments with type data
 */
const fetchAppointments = async (): Promise<Appointment[]> => {
  logger.info('[useAppointmentDistribution] Fetching appointments for distribution chart...');

  const { data, error } = await supabase
    .from('appointments')
    .select('id, type_consultation, appointment_date, status')
    .eq('medic_id', getCurrentMedicId()!)
    .neq('status', 'annule')
    .order('appointment_date', { ascending: false });

  if (error) {
    logger.error('[useAppointmentDistribution] Error fetching appointments:', error);
    throw new Error(error.message || 'Failed to fetch appointment data');
  }

  logger.info('[useAppointmentDistribution] Appointments fetched:', data?.length || 0);
  return data || [];
};

/**
 * Filter appointments by time period
 */
const filterByPeriod = (appointments: Appointment[], period: DistributionPeriod): Appointment[] => {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'semaine':
      startDate = subDays(now, 7);
      break;
    case 'mois':
      startDate = subMonths(now, 1);
      break;
    case 'annee':
    default:
      startDate = subMonths(now, 12);
      break;
  }

  return appointments.filter(apt => {
    const aptDate = parseISO(apt.appointment_date);
    return isAfter(aptDate, startDate);
  });
};

/**
 * Group appointments by type and calculate distribution
 */
const calculateDistribution = (appointments: Appointment[]): DistributionDataPoint[] => {
  const typeCounts: Record<string, number> = {};
  const total = appointments.length;

  // Count by type
  appointments.forEach(apt => {
    const type = apt.type_consultation || 'Autre';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  // Convert to array with percentages
  const result: DistributionDataPoint[] = Object.entries(typeCounts)
    .map(([type, count]) => ({
      type: TYPE_LABELS[type] || type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return result;
};

/**
 * Main hook for appointment distribution data
 */
export const useAppointmentDistribution = (period: DistributionPeriod = 'semaine') => {
  const query = useQuery({
    queryKey: ['appointment-distribution', period],
    queryFn: fetchAppointments,
    staleTime: 2 * 60 * 1000,        // 2 minutes stale time
    gcTime: 10 * 60 * 1000,          // 10 minutes cache
    refetchInterval: 5 * 60 * 1000,  // Auto-refresh every 5 minutes
    retry: 2,
    select: (appointments) => {
      const filtered = filterByPeriod(appointments, period);
      return calculateDistribution(filtered);
    },
  });

  // Export to CSV function
  const exportToCSV = () => {
    const data = query.data || [];
    if (data.length === 0) {
      logger.warn('[useAppointmentDistribution] No data to export');
      return;
    }

    const periodLabel = period === 'semaine' ? 'semaine' : period === 'mois' ? 'mois' : 'année';
    const headers = ['Type de consultation', 'Nombre', 'Pourcentage'];
    const rows = data.map(d => [d.type, d.count.toString(), `${d.percentage}%`]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `distribution-rdv-${periodLabel}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    logger.info('[useAppointmentDistribution] CSV exported successfully');
  };

  return {
    data: query.data || [],
    loading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
    totalAppointments: query.data?.reduce((sum, d) => sum + d.count, 0) || 0,
    exportToCSV,
  };
};

export default useAppointmentDistribution;
