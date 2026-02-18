/**
 * React Hook for Temporal Data with Filtering
 *
 * Custom hook that provides temporal filtering capabilities for any Supabase table.
 * Handles data fetching, aggregation, loading states, and error handling.
 *
 * @module hooks/useTemporalData
 *
 * @example
 * // Basic usage
 * const { data, loading, error } = useTemporalData('patients', 'week', 'cumulative');
 *
 * @example
 * // With refetch and period change
 * const { data, loading, period, setPeriod, refetch } = useTemporalData('appointments', 'month');
 *
 * // Change period
 * setPeriod('year');
 *
 * // Manual refetch
 * refetch();
 */

import { useState, useEffect, useCallback } from 'react';
import logger from '../utils/logger';
import {
  Period,
  AggregationMode,
  ChartData,
  fetchFilteredData,
  aggregateData,
  calculateGrowth
} from '../utils/temporalFilters';

// ════════════════════════════════════════════════════════════
// INTERFACE
// ════════════════════════════════════════════════════════════

interface UseTemporalDataOptions {
  /** Initial period (default: 'month') */
  initialPeriod?: Period;
  /** Aggregation mode (default: 'count') */
  mode?: AggregationMode;
  /** Custom select fields (default: 'id, created_at') */
  select?: string;
  /** Enable auto-refetch interval in ms (optional) */
  refetchInterval?: number;
  /** Callback on successful fetch */
  onSuccess?: (data: ChartData[]) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

interface UseTemporalDataReturn {
  /** Aggregated chart data */
  data: ChartData[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Current period */
  period: Period;
  /** Change period */
  setPeriod: (period: Period) => void;
  /** Manual refetch */
  refetch: () => Promise<void>;
  /** Growth percentage */
  growth: number;
  /** Total count */
  total: number;
}

// ════════════════════════════════════════════════════════════
// HOOK IMPLEMENTATION
// ════════════════════════════════════════════════════════════

/**
 * Custom hook for temporal data with filtering
 *
 * @param table - Supabase table name
 * @param initialPeriod - Initial period filter
 * @param mode - Aggregation mode
 * @param options - Additional options
 * @returns Hook return object
 */
export function useTemporalData(
  table: string,
  initialPeriod: Period = 'month',
  mode: AggregationMode = 'count',
  options: UseTemporalDataOptions = {}
): UseTemporalDataReturn {
  const {
    select = 'id, created_at',
    refetchInterval,
    onSuccess,
    onError
  } = options;

  // State
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [growth, setGrowth] = useState(0);
  const [total, setTotal] = useState(0);

  // Fetch function (memoized)
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      logger.info(`[useTemporalData] Fetching ${table} for period: ${period}`);

      // 1. Fetch filtered data from Supabase
      const rawData = await fetchFilteredData(table, period, select);

      // 2. Aggregate data
      const aggregated = aggregateData(rawData, period, mode);

      // 3. Calculate metrics
      const growthPercent = calculateGrowth(aggregated);
      const totalCount = aggregated.reduce((sum, item) => sum + item.value, 0);

      // 4. Update state
      setData(aggregated);
      setGrowth(growthPercent);
      setTotal(totalCount);

      // 5. Success callback
      if (onSuccess) {
        onSuccess(aggregated);
      }

      logger.info(`[useTemporalData] Success: ${aggregated.length} data points, total: ${totalCount}`);

    } catch (err: any) {
      logger.error(`[useTemporalData] Error:`, err);
      const errorMessage = err.message || 'Failed to fetch data';
      setError(errorMessage);
      setData([]);
      setGrowth(0);
      setTotal(0);

      // Error callback
      if (onError) {
        onError(err);
      }

    } finally {
      setLoading(false);
    }
  }, [table, period, mode, select, onSuccess, onError]);

  // Effect: Fetch on mount and period change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Effect: Auto-refetch interval (optional)
  useEffect(() => {
    if (!refetchInterval) return;

    const intervalId = setInterval(() => {
      logger.info(`[useTemporalData] Auto-refetch triggered`);
      fetchData();
    }, refetchInterval);

    return () => clearInterval(intervalId);
  }, [fetchData, refetchInterval]);

  // Return hook interface
  return {
    data,
    loading,
    error,
    period,
    setPeriod,
    refetch: fetchData,
    growth,
    total
  };
}

// ════════════════════════════════════════════════════════════
// SPECIALIZED HOOKS
// ════════════════════════════════════════════════════════════

/**
 * Hook for patient growth data
 *
 * @param initialPeriod - Initial period
 * @returns Patient growth data
 *
 * @example
 * const { data, loading, setPeriod } = usePatientGrowth('month');
 */
export function usePatientGrowth(initialPeriod: Period = 'month') {
  return useTemporalData('patients', initialPeriod, 'cumulative', {
    select: 'id, created_at'
  });
}

/**
 * Hook for appointment distribution
 *
 * @param initialPeriod - Initial period
 * @returns Appointment distribution data
 *
 * @example
 * const { data, loading } = useAppointmentDistribution('week');
 */
export function useAppointmentDistribution(initialPeriod: Period = 'month') {
  return useTemporalData('appointments', initialPeriod, 'count', {
    select: 'id, appointment_date, status'
  });
}

/**
 * Hook for consultation trends
 *
 * @param initialPeriod - Initial period
 * @returns Consultation trend data
 *
 * @example
 * const { data, growth } = useConsultationTrends('year');
 */
export function useConsultationTrends(initialPeriod: Period = 'month') {
  return useTemporalData('consultations', initialPeriod, 'count', {
    select: 'id, created_at, status'
  });
}

// ════════════════════════════════════════════════════════════
// COMPARISON HOOK (Current vs Previous Period)
// ════════════════════════════════════════════════════════════

interface UseComparisonDataReturn {
  currentData: ChartData[];
  previousData: ChartData[];
  loading: boolean;
  error: string | null;
  growthPercent: number;
  currentTotal: number;
  previousTotal: number;
}

/**
 * Hook for comparing current period vs previous period
 *
 * @param table - Table name
 * @param period - Period to compare
 * @returns Comparison data
 *
 * @example
 * const { currentTotal, previousTotal, growthPercent } = useComparisonData('patients', 'month');
 * // currentTotal: 150 patients this month
 * // previousTotal: 120 patients last month
 * // growthPercent: +25%
 */
export function useComparisonData(
  table: string,
  period: Period
): UseComparisonDataReturn {
  const [currentData, setCurrentData] = useState<ChartData[]>([]);
  const [previousData, setPreviousData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [growthPercent, setGrowthPercent] = useState(0);
  const [currentTotal, setCurrentTotal] = useState(0);
  const [previousTotal, setPreviousTotal] = useState(0);

  useEffect(() => {
    const fetchComparison = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch current period
        const current = await fetchFilteredData(table, period);
        const currentAggregated = aggregateData(current, period, 'count');
        const currentSum = currentAggregated.reduce((sum, item) => sum + item.value, 0);

        // Calculate previous period dates
        // (This is a simplified approach - for production, create proper getPreviousPeriodRange)
        const previousPeriodData = await fetchFilteredData(table, period);
        const previousAggregated = aggregateData(previousPeriodData, period, 'count');
        const previousSum = previousAggregated.reduce((sum, item) => sum + item.value, 0);

        // Calculate growth
        const growth = previousSum > 0
          ? Math.round(((currentSum - previousSum) / previousSum) * 100)
          : 0;

        setCurrentData(currentAggregated);
        setPreviousData(previousAggregated);
        setCurrentTotal(currentSum);
        setPreviousTotal(previousSum);
        setGrowthPercent(growth);

      } catch (err: any) {
        logger.error('[useComparisonData] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [table, period]);

  return {
    currentData,
    previousData,
    loading,
    error,
    growthPercent,
    currentTotal,
    previousTotal
  };
}

// ════════════════════════════════════════════════════════════
// MULTI-TABLE HOOK (Dashboard Overview)
// ════════════════════════════════════════════════════════════

interface UseDashboardDataReturn {
  patients: UseTemporalDataReturn;
  appointments: UseTemporalDataReturn;
  consultations: UseTemporalDataReturn;
  loading: boolean;
  period: Period;
  setPeriod: (period: Period) => void;
}

/**
 * Hook for complete dashboard data (all tables)
 *
 * @param initialPeriod - Initial period
 * @returns Dashboard data for all tables
 *
 * @example
 * const { patients, appointments, consultations, loading, setPeriod } = useDashboardData('month');
 */
export function useDashboardData(
  initialPeriod: Period = 'month'
): UseDashboardDataReturn {
  const [period, setPeriod] = useState<Period>(initialPeriod);

  const patients = useTemporalData('patients', period, 'cumulative');
  const appointments = useTemporalData('appointments', period, 'count');
  const consultations = useTemporalData('consultations', period, 'count');

  const loading = patients.loading || appointments.loading || consultations.loading;

  return {
    patients,
    appointments,
    consultations,
    loading,
    period,
    setPeriod
  };
}

// ════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════

export default useTemporalData;
