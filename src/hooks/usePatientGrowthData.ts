/**
 * usePatientGrowthData - Hook for patient growth chart data
 *
 * Fetches real patient registration data from Supabase and transforms it
 * for chart visualization with support for different time periods.
 *
 * @features
 * - Week view: Daily registrations for the last 7 days
 * - Month view: Daily registrations for the last 30 days
 * - Year view: Monthly registrations for the last 12 months
 * - Intelligent caching with React Query
 * - Auto-refresh every 5 minutes
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import logger from '../utils/logger';
import { getCurrentMedicId } from '../utils/auth';
import { startOfDay, subDays, subMonths, format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

export type TimePeriod = 'semaine' | 'mois' | 'annee';

export interface PatientGrowthDataPoint {
  label: string;
  patients: number;
  date: Date;
}

interface Patient {
  id: string;
  registered_at: string;
  created_at: string;
}

/**
 * Fetch all patients with registration dates
 */
const fetchPatients = async (): Promise<Patient[]> => {
  logger.info('[usePatientGrowthData] Fetching patients for growth chart...');

  const { data, error } = await supabase
    .from('patients')
    .select('id, registered_at, created_at')
    .eq('medic_id', getCurrentMedicId()!)
    .order('registered_at', { ascending: true });

  if (error) {
    logger.error('[usePatientGrowthData] Error fetching patients:', error);
    throw new Error(error.message || 'Failed to fetch patient data');
  }

  logger.info('[usePatientGrowthData] Patients fetched:', data?.length || 0);
  return data || [];
};

/**
 * Transform patient data for week view (last 7 days)
 */
const getWeekData = (patients: Patient[]): PatientGrowthDataPoint[] => {
  const now = new Date();
  const result: PatientGrowthDataPoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = startOfDay(subDays(now, i));
    const nextDay = startOfDay(subDays(now, i - 1));

    const count = patients.filter(p => {
      const regDate = parseISO(p.registered_at || p.created_at);
      return isWithinInterval(regDate, { start: date, end: nextDay });
    }).length;

    result.push({
      label: format(date, 'EEE', { locale: fr }),
      patients: count,
      date,
    });
  }

  return result;
};

/**
 * Transform patient data for month view (last 30 days)
 */
const getMonthData = (patients: Patient[]): PatientGrowthDataPoint[] => {
  const now = new Date();
  const result: PatientGrowthDataPoint[] = [];

  for (let i = 29; i >= 0; i -= 3) {
    const date = startOfDay(subDays(now, i));
    const endDate = startOfDay(subDays(now, Math.max(0, i - 3)));

    const count = patients.filter(p => {
      const regDate = parseISO(p.registered_at || p.created_at);
      return isWithinInterval(regDate, { start: date, end: endDate });
    }).length;

    result.push({
      label: format(date, 'd MMM', { locale: fr }),
      patients: count,
      date,
    });
  }

  return result;
};

/**
 * Transform patient data for year view (last 12 months - cumulative)
 */
const getYearData = (patients: Patient[]): PatientGrowthDataPoint[] => {
  const now = new Date();
  const result: PatientGrowthDataPoint[] = [];
  let cumulativeCount = 0;

  // Get patients registered before the 12-month window
  const twelveMonthsAgo = subMonths(now, 11);
  cumulativeCount = patients.filter(p => {
    const regDate = parseISO(p.registered_at || p.created_at);
    return regDate < startOfMonth(twelveMonthsAgo);
  }).length;

  for (let i = 11; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    const monthCount = patients.filter(p => {
      const regDate = parseISO(p.registered_at || p.created_at);
      return isWithinInterval(regDate, { start: monthStart, end: monthEnd });
    }).length;

    cumulativeCount += monthCount;

    result.push({
      label: format(monthDate, 'MMM', { locale: fr }),
      patients: cumulativeCount,
      date: monthDate,
    });
  }

  return result;
};

/**
 * Main hook for patient growth data
 */
export const usePatientGrowthData = (period: TimePeriod = 'annee') => {
  const query = useQuery({
    queryKey: ['patient-growth', period],
    queryFn: fetchPatients,
    staleTime: 2 * 60 * 1000,        // 2 minutes stale time
    gcTime: 10 * 60 * 1000,          // 10 minutes cache
    refetchInterval: 5 * 60 * 1000,  // Auto-refresh every 5 minutes
    retry: 2,
    select: (patients) => {
      switch (period) {
        case 'semaine':
          return getWeekData(patients);
        case 'mois':
          return getMonthData(patients);
        case 'annee':
        default:
          return getYearData(patients);
      }
    },
  });

  return {
    data: query.data || [],
    loading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
};

export default usePatientGrowthData;
