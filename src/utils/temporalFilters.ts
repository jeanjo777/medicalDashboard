/**
 * Temporal Filters Utility Functions
 *
 * Collection of helper functions for handling temporal filtering,
 * date range calculations, and data aggregation by time periods.
 *
 * @module utils/temporalFilters
 *
 * @example
 * import { getDateRange, aggregateData, fetchFilteredData } from '@/utils/temporalFilters';
 *
 * const { start, end } = getDateRange('week');
 * const patients = await fetchFilteredData('patients', 'month');
 * const chartData = aggregateData(patients, 'week', 'cumulative');
 */

import { supabase } from '../lib/supabase';
import logger from './logger';

// ════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ════════════════════════════════════════════════════════════

export type Period = 'week' | 'month' | 'year';
export type AggregationMode = 'count' | 'cumulative';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ChartData {
  name: string;
  value: number;
  date: Date;
}

export interface TemporalData {
  created_at: string;
  [key: string]: any;
}

// ════════════════════════════════════════════════════════════
// DATE RANGE CALCULATOR
// ════════════════════════════════════════════════════════════

/**
 * Calculate date range for a given period
 *
 * @param period - 'week' | 'month' | 'year'
 * @returns { start, end } - Inclusive date range
 *
 * @example
 * const { start, end } = getDateRange('week');
 * // Today: 2025-11-02
 * // Returns: { start: 2025-10-27 00:00:00, end: 2025-11-02 23:59:59 }
 */
export function getDateRange(period: Period): DateRange {
  const now = new Date();

  // End = now, end of day
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  // Start = period ago, start of day
  const start = new Date(now);

  switch (period) {
    case 'week':
      // Last 7 days (including today)
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      break;

    case 'month':
      // Last 12 months
      start.setMonth(now.getMonth() - 11);
      start.setDate(1); // First day of month
      start.setHours(0, 0, 0, 0);
      break;

    case 'year':
      // Last 5 years
      start.setFullYear(now.getFullYear() - 4);
      start.setMonth(0); // January
      start.setDate(1); // 1st
      start.setHours(0, 0, 0, 0);
      break;
  }

  return { start, end };
}

// ════════════════════════════════════════════════════════════
// SUPABASE QUERY BUILDER
// ════════════════════════════════════════════════════════════

/**
 * Fetch filtered data from Supabase by period
 *
 * @param table - Table name
 * @param period - Time period to filter
 * @param select - Columns to select (default: 'id, created_at')
 * @returns Promise<Array> - Filtered data
 *
 * @throws Error if query fails
 *
 * @example
 * const patients = await fetchFilteredData('patients', 'week');
 * const appointments = await fetchFilteredData('appointments', 'month', 'id, patient_name, appointment_date');
 */
export async function fetchFilteredData(
  table: string,
  period: Period,
  select: string = 'id, created_at'
): Promise<any[]> {
  const { start, end } = getDateRange(period);

  logger.info(`[fetchFilteredData] ${table} - Period: ${period}`);
  logger.info(`[fetchFilteredData] Range: ${start.toISOString()} → ${end.toISOString()}`);

  const { data, error } = await supabase
    .from(table)
    .select(select)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    logger.error(`[fetchFilteredData] Error:`, error);
    throw new Error(`Failed to fetch ${table}: ${error.message}`);
  }

  logger.info(`[fetchFilteredData] Success: ${data?.length || 0} rows`);
  return data || [];
}

// ════════════════════════════════════════════════════════════
// AGGREGATION BY DAY (WEEK)
// ════════════════════════════════════════════════════════════

/**
 * Aggregate data by day for 'week' period
 *
 * @param data - Raw data from Supabase (must have created_at)
 * @param mode - 'count' (new per day) | 'cumulative' (total growing)
 * @returns ChartData[] - 7 data points (one per day)
 *
 * @example
 * const dailyData = aggregateByDay(patients, 'count');
 * // Returns: [{ name: 'Lun', value: 5, date: ... }, ...]
 */
export function aggregateByDay(
  data: TemporalData[],
  mode: AggregationMode = 'count'
): ChartData[] {
  const now = new Date();
  const buckets: ChartData[] = [];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  // Loop over last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    let value: number;

    if (mode === 'count') {
      // COUNT: New items THIS day only
      value = data.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= date && itemDate <= endOfDay;
      }).length;

    } else {
      // CUMULATIVE: Total items up to THIS day (inclusive)
      value = data.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate <= endOfDay;
      }).length;
    }

    buckets.push({
      name: dayNames[date.getDay()],
      value,
      date
    });
  }

  return buckets;
}

// ════════════════════════════════════════════════════════════
// AGGREGATION BY MONTH
// ════════════════════════════════════════════════════════════

/**
 * Aggregate data by month for 'month' period
 *
 * @param data - Raw data from Supabase
 * @param mode - 'count' | 'cumulative'
 * @returns ChartData[] - 12 data points (one per month)
 *
 * @example
 * const monthlyData = aggregateByMonth(patients, 'cumulative');
 * // Returns: [{ name: 'Jan', value: 120, date: ... }, ...]
 */
export function aggregateByMonth(
  data: TemporalData[],
  mode: AggregationMode = 'count'
): ChartData[] {
  const now = new Date();
  const buckets: ChartData[] = [];

  const monthNames = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
    'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
  ];

  // Loop over last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    date.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    let value: number;

    if (mode === 'count') {
      value = data.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= date && itemDate <= endOfMonth;
      }).length;

    } else {
      value = data.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate <= endOfMonth;
      }).length;
    }

    buckets.push({
      name: monthNames[date.getMonth()],
      value,
      date
    });
  }

  return buckets;
}

// ════════════════════════════════════════════════════════════
// AGGREGATION BY YEAR
// ════════════════════════════════════════════════════════════

/**
 * Aggregate data by year for 'year' period
 *
 * @param data - Raw data from Supabase
 * @param mode - 'count' | 'cumulative'
 * @returns ChartData[] - 5 data points (one per year)
 *
 * @example
 * const yearlyData = aggregateByYear(patients, 'count');
 * // Returns: [{ name: '2021', value: 150, date: ... }, ...]
 */
export function aggregateByYear(
  data: TemporalData[],
  mode: AggregationMode = 'count'
): ChartData[] {
  const now = new Date();
  const buckets: ChartData[] = [];

  // Loop over last 5 years
  for (let i = 4; i >= 0; i--) {
    const year = now.getFullYear() - i;
    const date = new Date(year, 0, 1);
    date.setHours(0, 0, 0, 0);

    const endOfYear = new Date(year, 11, 31);
    endOfYear.setHours(23, 59, 59, 999);

    let value: number;

    if (mode === 'count') {
      value = data.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= date && itemDate <= endOfYear;
      }).length;

    } else {
      value = data.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate <= endOfYear;
      }).length;
    }

    buckets.push({
      name: year.toString(),
      value,
      date
    });
  }

  return buckets;
}

// ════════════════════════════════════════════════════════════
// MASTER AGGREGATION FUNCTION
// ════════════════════════════════════════════════════════════

/**
 * Master aggregation function - dispatches to appropriate aggregator
 *
 * @param data - Raw data from Supabase
 * @param period - Time period ('week' | 'month' | 'year')
 * @param mode - Aggregation mode ('count' | 'cumulative')
 * @returns ChartData[] - Aggregated data points
 *
 * @example
 * const chartData = aggregateData(patients, 'month', 'cumulative');
 */
export function aggregateData(
  data: TemporalData[],
  period: Period,
  mode: AggregationMode = 'count'
): ChartData[] {
  logger.info(`[aggregateData] Period: ${period}, Mode: ${mode}, Rows: ${data.length}`);

  let result: ChartData[];

  switch (period) {
    case 'week':
      result = aggregateByDay(data, mode);
      break;
    case 'month':
      result = aggregateByMonth(data, mode);
      break;
    case 'year':
      result = aggregateByYear(data, mode);
      break;
    default:
      logger.error(`[aggregateData] Unknown period: ${period}`);
      return [];
  }

  logger.info(`[aggregateData] Generated ${result.length} points`);
  return result;
}

// ════════════════════════════════════════════════════════════
// DATE FORMATTING UTILITIES
// ════════════════════════════════════════════════════════════

/**
 * Format date for SQL (YYYY-MM-DD)
 *
 * @param date - JavaScript Date object
 * @returns string - SQL DATE format
 *
 * @example
 * formatDateForSQL(new Date('2025-11-02'))
 * // Returns: "2025-11-02"
 */
export function formatDateForSQL(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date range as human-readable string
 *
 * @param start - Start date
 * @param end - End date
 * @param locale - Locale string (default: 'fr-FR')
 * @returns string - Formatted range
 *
 * @example
 * formatDateRange(start, end)
 * // Returns: "27 oct 2025 - 02 nov 2025"
 */
export function formatDateRange(
  start: Date,
  end: Date,
  locale: string = 'fr-FR'
): string {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  };

  const startStr = start.toLocaleDateString(locale, options);
  const endStr = end.toLocaleDateString(locale, options);

  return `${startStr} - ${endStr}`;
}

/**
 * Format period label for tooltip
 *
 * @param date - Date to format
 * @param period - Period type
 * @returns string - Formatted label
 *
 * @example
 * formatPeriodLabel(date, 'week')
 * // Returns: "lundi 27 octobre 2025"
 */
export function formatPeriodLabel(date: Date, period: Period): string {
  switch (period) {
    case 'week':
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    case 'month':
      return date.toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric'
      });
    case 'year':
      return date.getFullYear().toString();
    default:
      return date.toLocaleDateString('fr-FR');
  }
}

// ════════════════════════════════════════════════════════════
// GROWTH CALCULATION
// ════════════════════════════════════════════════════════════

/**
 * Calculate growth percentage between first and last data point
 *
 * @param data - Chart data array
 * @returns number - Growth percentage (rounded)
 *
 * @example
 * calculateGrowth(chartData)
 * // Returns: 12 (meaning +12%)
 */
export function calculateGrowth(data: ChartData[]): number {
  if (data.length < 2) return 0;

  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;

  if (firstValue === 0) return 0;

  return Math.round(((lastValue - firstValue) / firstValue) * 100);
}

/**
 * Calculate growth between two periods
 *
 * @param currentValue - Current period value
 * @param previousValue - Previous period value
 * @returns number - Growth percentage
 *
 * @example
 * calculatePeriodGrowth(150, 120)
 * // Returns: 25 (meaning +25%)
 */
export function calculatePeriodGrowth(
  currentValue: number,
  previousValue: number
): number {
  if (previousValue === 0) return currentValue > 0 ? 100 : 0;
  return Math.round(((currentValue - previousValue) / previousValue) * 100);
}

// ════════════════════════════════════════════════════════════
// COUNT HELPERS
// ════════════════════════════════════════════════════════════

/**
 * Get total count for period (server-side COUNT)
 *
 * @param table - Table name
 * @param period - Period to count
 * @returns Promise<number> - Total count
 *
 * @example
 * const count = await getCountForPeriod('patients', 'week');
 * logger.info(`${count} patients this week`);
 */
export async function getCountForPeriod(
  table: string,
  period: Period
): Promise<number> {
  const { start, end } = getDateRange(period);

  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString());

  if (error) {
    logger.error(`[getCountForPeriod] Error:`, error);
    return 0;
  }

  return count || 0;
}

/**
 * Get count for today
 *
 * @param table - Table name
 * @returns Promise<number> - Today's count
 *
 * @example
 * const todayCount = await getTodayCount('appointments');
 */
export async function getTodayCount(table: string): Promise<number> {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString());

  if (error) {
    logger.error(`[getTodayCount] Error:`, error);
    return 0;
  }

  return count || 0;
}

// ════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════

export default {
  // Core functions
  getDateRange,
  fetchFilteredData,
  aggregateData,
  aggregateByDay,
  aggregateByMonth,
  aggregateByYear,

  // Formatting
  formatDateForSQL,
  formatDateRange,
  formatPeriodLabel,

  // Calculations
  calculateGrowth,
  calculatePeriodGrowth,

  // Count helpers
  getCountForPeriod,
  getTodayCount
};
