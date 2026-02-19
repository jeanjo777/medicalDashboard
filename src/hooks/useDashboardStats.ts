import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import logger from '../utils/logger';

export interface DashboardStats {
  appointmentsToday: number;
  appointmentsTodayChange: number;
  patientsInTreatment: number;
  patientsInTreatmentChange: number;
  totalRevenue: number;
  totalRevenueChange: number;
  newPatientsThisMonth: number;
  newPatientsThisMonthChange: number;
}

interface UseDashboardStatsResult {
  stats: DashboardStats;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const getDateString = (daysAgo: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const useDashboardStats = (): UseDashboardStatsResult => {
  const [stats, setStats] = useState<DashboardStats>({
    appointmentsToday: 0,
    appointmentsTodayChange: 0,
    patientsInTreatment: 0,
    patientsInTreatmentChange: 0,
    totalRevenue: 0,
    totalRevenueChange: 0,
    newPatientsThisMonth: 0,
    newPatientsThisMonthChange: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      logger.info('[useDashboardStats] Fetching dashboard stats...');

      const today = getDateString(0);
      const yesterday = getDateString(1);
      const lastWeek = getDateString(7);
      const twoWeeksAgo = getDateString(14);

      // Calculate month boundaries
      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

      logger.info('[useDashboardStats] Date ranges:', { today, yesterday, lastWeek, twoWeeksAgo });

      const [
        appointmentsTodayResult,
        appointmentsYesterdayResult,
        patientsInTreatmentResult,
        patientsInTreatmentLastWeekResult,
        consultationsThisWeekResult,
        consultationsLastWeekResult,
        newPatientsThisMonthResult,
        newPatientsLastMonthResult,
      ] = await Promise.all([
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('appointment_date', today),

        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('appointment_date', yesterday),

        supabase
          .from('patients')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'in-treatment'),

        supabase
          .from('patients')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'in-treatment')
          .lte('updated_at', lastWeek),

        supabase
          .from('consultations')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', lastWeek),

        supabase
          .from('consultations')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', twoWeeksAgo)
          .lt('created_at', lastWeek),

        // New patients this month
        supabase
          .from('patients')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startOfThisMonth),

        // New patients last month
        supabase
          .from('patients')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startOfLastMonth)
          .lt('created_at', startOfThisMonth),
      ]);

      const appointmentsToday = appointmentsTodayResult.count || 0;
      const appointmentsYesterday = appointmentsYesterdayResult.count || 0;
      const patientsInTreatment = patientsInTreatmentResult.count || 0;
      const patientsInTreatmentLastWeek = patientsInTreatmentLastWeekResult.count || 0;
      const consultationsThisWeek = consultationsThisWeekResult.count || 0;
      const consultationsLastWeek = consultationsLastWeekResult.count || 0;
      const newPatientsThisMonth = newPatientsThisMonthResult.count || 0;
      const newPatientsLastMonth = newPatientsLastMonthResult.count || 0;

      const totalPatientsResult = await supabase
        .from('patients')
        .select('id', { count: 'exact', head: true });

      const totalPatients = totalPatientsResult.count || 0;
      const treatmentPercentage = totalPatients > 0
        ? Number(((patientsInTreatment / totalPatients) * 100).toFixed(1))
        : 0;

      const treatmentPercentageLastWeek = totalPatients > 0
        ? Number(((patientsInTreatmentLastWeek / totalPatients) * 100).toFixed(1))
        : 0;

      logger.info('[useDashboardStats] Stats calculated:', {
        appointmentsToday,
        patientsInTreatment: treatmentPercentage,
        consultationsThisWeek,
        totalPatients,
        newPatientsThisMonth,
        newPatientsLastMonth
      });

      // Calculate revenue based on consultations (150 FCFA per consultation)
      const baseRevenue = 45000;
      const revenueThisWeek = baseRevenue + (consultationsThisWeek * 150);
      const revenueLastWeek = baseRevenue + (consultationsLastWeek * 150);

      const finalStats = {
        appointmentsToday,
        appointmentsTodayChange: calculatePercentageChange(
          appointmentsToday,
          appointmentsYesterday
        ),
        patientsInTreatment: treatmentPercentage,
        patientsInTreatmentChange: calculatePercentageChange(
          treatmentPercentage,
          treatmentPercentageLastWeek
        ),
        totalRevenue: revenueThisWeek,
        totalRevenueChange: calculatePercentageChange(
          revenueThisWeek,
          revenueLastWeek
        ),
        newPatientsThisMonth,
        newPatientsThisMonthChange: calculatePercentageChange(
          newPatientsThisMonth,
          newPatientsLastMonth
        ),
      };

      logger.info('[useDashboardStats] Final stats:', finalStats);
      setStats(finalStats);
    } catch (err) {
      logger.error('[useDashboardStats] Error fetching stats:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
      logger.info('[useDashboardStats] Loading complete');
    }
  };

  useEffect(() => {
    fetchStats();

    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};
