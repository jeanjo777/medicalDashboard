-- ════════════════════════════════════════════════════════════
-- TEMPORAL FILTERS - SQL EXAMPLES & QUERIES
-- ════════════════════════════════════════════════════════════
--
-- Collection of SQL queries for temporal filtering and aggregation.
-- These examples demonstrate how to filter data by time periods
-- and perform aggregations directly in PostgreSQL/Supabase.
--
-- NOTE: Most aggregations are better done client-side using the
--       hybrid pattern (server filter + front aggregate).
--       These are provided for reference and advanced use cases.
--
-- ════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════
-- SECTION 1: BASIC FILTERS BY PERIOD
-- ════════════════════════════════════════════════════════════

-- 1.1 Last 7 days (WEEK)
-- ──────────────────────────────────────────────────────────
SELECT
  id,
  name,
  created_at
FROM patients
WHERE created_at >= NOW() - INTERVAL '6 days'
  AND created_at <= NOW()
ORDER BY created_at ASC;

-- 1.2 Last 30 days (MONTH approximate)
-- ──────────────────────────────────────────────────────────
SELECT
  id,
  name,
  created_at
FROM patients
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND created_at <= NOW()
ORDER BY created_at ASC;

-- 1.3 Last 12 months (MONTH exact)
-- ──────────────────────────────────────────────────────────
SELECT
  id,
  name,
  created_at
FROM patients
WHERE created_at >= DATE_TRUNC('month', NOW() - INTERVAL '11 months')
  AND created_at <= NOW()
ORDER BY created_at ASC;

-- 1.4 Last 5 years (YEAR)
-- ──────────────────────────────────────────────────────────
SELECT
  id,
  name,
  created_at
FROM patients
WHERE created_at >= DATE_TRUNC('year', NOW() - INTERVAL '4 years')
  AND created_at <= NOW()
ORDER BY created_at ASC;

-- ════════════════════════════════════════════════════════════
-- SECTION 2: COUNT AGGREGATIONS
-- ════════════════════════════════════════════════════════════

-- 2.1 Total patients in last 7 days
-- ──────────────────────────────────────────────────────────
SELECT COUNT(*) as total_patients
FROM patients
WHERE created_at >= NOW() - INTERVAL '6 days';

-- 2.2 Total appointments this month
-- ──────────────────────────────────────────────────────────
SELECT COUNT(*) as total_appointments
FROM appointments
WHERE appointment_date >= DATE_TRUNC('month', NOW())
  AND appointment_date <= NOW();

-- 2.3 Total consultations this year
-- ──────────────────────────────────────────────────────────
SELECT COUNT(*) as total_consultations
FROM consultations
WHERE created_at >= DATE_TRUNC('year', NOW());

-- ════════════════════════════════════════════════════════════
-- SECTION 3: GROUP BY DAY
-- ════════════════════════════════════════════════════════════

-- 3.1 Patients created per day (last 7 days)
-- ──────────────────────────────────────────────────────────
-- ⚠️ WARNING: Missing days will be absent from results!
-- ⚠️ Better to aggregate client-side with pre-generated buckets
-- ──────────────────────────────────────────────────────────
SELECT
  DATE(created_at) as day,
  COUNT(*) as patient_count
FROM patients
WHERE created_at >= NOW() - INTERVAL '6 days'
GROUP BY DATE(created_at)
ORDER BY day ASC;

-- Expected Result:
--   day         | patient_count
-- --------------+---------------
--   2025-10-27  |      5
--   2025-10-28  |      3
--   2025-10-30  |      8        ← Note: 2025-10-29 missing!
--   2025-10-31  |      2
--   2025-11-01  |      6
--   2025-11-02  |      1

-- 3.2 Appointments per day with status breakdown
-- ──────────────────────────────────────────────────────────
SELECT
  appointment_date as day,
  status,
  COUNT(*) as count
FROM appointments
WHERE appointment_date >= CURRENT_DATE - INTERVAL '6 days'
GROUP BY appointment_date, status
ORDER BY day ASC, status;

-- ════════════════════════════════════════════════════════════
-- SECTION 4: GROUP BY MONTH
-- ════════════════════════════════════════════════════════════

-- 4.1 Patients created per month (last 12 months)
-- ──────────────────────────────────────────────────────────
SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as patient_count
FROM patients
WHERE created_at >= DATE_TRUNC('month', NOW() - INTERVAL '11 months')
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month ASC;

-- 4.2 Appointments per month with average per day
-- ──────────────────────────────────────────────────────────
SELECT
  DATE_TRUNC('month', appointment_date::timestamp) as month,
  COUNT(*) as total_appointments,
  ROUND(COUNT(*)::numeric / EXTRACT(DAY FROM DATE_TRUNC('month', appointment_date::timestamp) + INTERVAL '1 month' - INTERVAL '1 day'), 2) as avg_per_day
FROM appointments
WHERE appointment_date >= DATE_TRUNC('month', NOW() - INTERVAL '11 months')::date
GROUP BY DATE_TRUNC('month', appointment_date::timestamp)
ORDER BY month ASC;

-- ════════════════════════════════════════════════════════════
-- SECTION 5: GROUP BY YEAR
-- ════════════════════════════════════════════════════════════

-- 5.1 Patients created per year (last 5 years)
-- ──────────────────────────────────────────────────────────
SELECT
  EXTRACT(YEAR FROM created_at) as year,
  COUNT(*) as patient_count
FROM patients
WHERE created_at >= DATE_TRUNC('year', NOW() - INTERVAL '4 years')
GROUP BY EXTRACT(YEAR FROM created_at)
ORDER BY year ASC;

-- 5.2 Year-over-year growth
-- ──────────────────────────────────────────────────────────
WITH yearly_counts AS (
  SELECT
    EXTRACT(YEAR FROM created_at) as year,
    COUNT(*) as count
  FROM patients
  GROUP BY EXTRACT(YEAR FROM created_at)
)
SELECT
  year,
  count,
  LAG(count) OVER (ORDER BY year) as previous_year_count,
  CASE
    WHEN LAG(count) OVER (ORDER BY year) IS NOT NULL AND LAG(count) OVER (ORDER BY year) > 0
    THEN ROUND(((count - LAG(count) OVER (ORDER BY year))::numeric / LAG(count) OVER (ORDER BY year)) * 100, 2)
    ELSE NULL
  END as growth_percent
FROM yearly_counts
ORDER BY year ASC;

-- Expected Result:
--  year  | count | previous_year_count | growth_percent
-- -------+-------+---------------------+----------------
--  2021  |  120  |        NULL         |      NULL
--  2022  |  150  |        120          |      25.00
--  2023  |  180  |        150          |      20.00
--  2024  |  210  |        180          |      16.67
--  2025  |  50   |        210          |     -76.19

-- ════════════════════════════════════════════════════════════
-- SECTION 6: CUMULATIVE COUNTS (Advanced)
-- ════════════════════════════════════════════════════════════

-- 6.1 Cumulative patient count by day
-- ──────────────────────────────────────────────────────────
-- ⚠️ WARNING: This only counts patients WITHIN the period!
-- ⚠️ For true cumulative, need to count ALL historical patients
-- ──────────────────────────────────────────────────────────
WITH daily_counts AS (
  SELECT
    DATE(created_at) as day,
    COUNT(*) as daily_count
  FROM patients
  WHERE created_at >= NOW() - INTERVAL '6 days'
  GROUP BY DATE(created_at)
)
SELECT
  day,
  daily_count,
  SUM(daily_count) OVER (ORDER BY day ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as cumulative_count
FROM daily_counts
ORDER BY day ASC;

-- Expected Result (INCORRECT for true cumulative):
--   day         | daily_count | cumulative_count
-- --------------+-------------+------------------
--   2025-10-27  |      5      |        5         ← Should include historical!
--   2025-10-28  |      3      |        8
--   2025-10-30  |      8      |       16
--   2025-11-01  |      2      |       18
--   2025-11-02  |      1      |       19

-- 6.2 TRUE cumulative count (all historical data)
-- ──────────────────────────────────────────────────────────
-- ✅ CORRECT: Counts ALL patients up to each date
-- ──────────────────────────────────────────────────────────
WITH date_series AS (
  SELECT generate_series(
    (NOW() - INTERVAL '6 days')::date,
    NOW()::date,
    '1 day'::interval
  )::date as day
),
cumulative_counts AS (
  SELECT
    ds.day,
    COUNT(p.id) as cumulative_count
  FROM date_series ds
  LEFT JOIN patients p ON p.created_at::date <= ds.day
  GROUP BY ds.day
)
SELECT
  day,
  cumulative_count,
  cumulative_count - LAG(cumulative_count) OVER (ORDER BY day) as new_today
FROM cumulative_counts
ORDER BY day ASC;

-- Expected Result (CORRECT):
--   day         | cumulative_count | new_today
-- --------------+------------------+-----------
--   2025-10-27  |      1520        |    NULL
--   2025-10-28  |      1523        |      3
--   2025-10-29  |      1523        |      0
--   2025-10-30  |      1531        |      8
--   2025-10-31  |      1533        |      2
--   2025-11-01  |      1539        |      6
--   2025-11-02  |      1540        |      1

-- ════════════════════════════════════════════════════════════
-- SECTION 7: STATUS DISTRIBUTION (Pie Chart Data)
-- ════════════════════════════════════════════════════════════

-- 7.1 Patient status distribution (current period)
-- ──────────────────────────────────────────────────────────
SELECT
  COALESCE(status, 'active') as status,
  COUNT(*) as count,
  ROUND((COUNT(*)::numeric / SUM(COUNT(*)) OVER ()) * 100, 2) as percentage
FROM patients
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY status
ORDER BY count DESC;

-- Expected Result:
--    status     | count | percentage
-- --------------+-------+------------
--   active      |  150  |    60.00
--   in_treatment|   50  |    20.00
--   recovered   |   30  |    12.00
--   inactive    |   20  |     8.00

-- 7.2 Appointment status distribution
-- ──────────────────────────────────────────────────────────
SELECT
  COALESCE(status, 'pending') as status,
  COUNT(*) as count
FROM appointments
WHERE appointment_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY status
ORDER BY count DESC;

-- ════════════════════════════════════════════════════════════
-- SECTION 8: COMPARISON QUERIES (Current vs Previous)
-- ════════════════════════════════════════════════════════════

-- 8.1 This week vs last week
-- ──────────────────────────────────────────────────────────
WITH this_week AS (
  SELECT COUNT(*) as count
  FROM patients
  WHERE created_at >= NOW() - INTERVAL '6 days'
),
last_week AS (
  SELECT COUNT(*) as count
  FROM patients
  WHERE created_at >= NOW() - INTERVAL '13 days'
    AND created_at < NOW() - INTERVAL '6 days'
)
SELECT
  tw.count as this_week_count,
  lw.count as last_week_count,
  tw.count - lw.count as difference,
  CASE
    WHEN lw.count > 0
    THEN ROUND(((tw.count - lw.count)::numeric / lw.count) * 100, 2)
    ELSE 0
  END as growth_percent
FROM this_week tw, last_week lw;

-- Expected Result:
--  this_week_count | last_week_count | difference | growth_percent
-- -----------------+-----------------+------------+----------------
--        28        |        25       |     3      |      12.00

-- 8.2 This month vs last month
-- ──────────────────────────────────────────────────────────
WITH this_month AS (
  SELECT COUNT(*) as count
  FROM patients
  WHERE created_at >= DATE_TRUNC('month', NOW())
),
last_month AS (
  SELECT COUNT(*) as count
  FROM patients
  WHERE created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
    AND created_at < DATE_TRUNC('month', NOW())
)
SELECT
  tm.count as this_month_count,
  lm.count as last_month_count,
  tm.count - lm.count as difference,
  CASE
    WHEN lm.count > 0
    THEN ROUND(((tm.count - lm.count)::numeric / lm.count) * 100, 2)
    ELSE 0
  END as growth_percent
FROM this_month tm, last_month lm;

-- ════════════════════════════════════════════════════════════
-- SECTION 9: ADVANCED ANALYTICS
-- ════════════════════════════════════════════════════════════

-- 9.1 Moving average (7-day rolling)
-- ──────────────────────────────────────────────────────────
WITH daily_counts AS (
  SELECT
    DATE(created_at) as day,
    COUNT(*) as count
  FROM patients
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY DATE(created_at)
)
SELECT
  day,
  count,
  ROUND(AVG(count) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 2) as moving_avg_7d
FROM daily_counts
ORDER BY day ASC;

-- 9.2 Peak hours for appointments
-- ──────────────────────────────────────────────────────────
-- ⚠️ Note: appointment_time is TEXT, parsing needed
-- ──────────────────────────────────────────────────────────
SELECT
  SUBSTRING(appointment_time FROM 1 FOR 2) as hour,
  COUNT(*) as appointment_count
FROM appointments
WHERE appointment_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY SUBSTRING(appointment_time FROM 1 FOR 2)
ORDER BY appointment_count DESC
LIMIT 10;

-- 9.3 Busiest days of week
-- ──────────────────────────────────────────────────────────
SELECT
  TO_CHAR(appointment_date, 'Day') as day_of_week,
  EXTRACT(DOW FROM appointment_date) as day_number,
  COUNT(*) as appointment_count
FROM appointments
WHERE appointment_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY TO_CHAR(appointment_date, 'Day'), EXTRACT(DOW FROM appointment_date)
ORDER BY day_number;

-- Expected Result:
--  day_of_week | day_number | appointment_count
-- -------------+------------+-------------------
--   Sunday     |     0      |        45
--   Monday     |     1      |        120
--   Tuesday    |     2      |        135
--   Wednesday  |     3      |        128
--   Thursday   |     4      |        142
--   Friday     |     5      |        138
--   Saturday   |     6      |        52

-- ════════════════════════════════════════════════════════════
-- SECTION 10: PERFORMANCE INDEXES (CRITICAL!)
-- ════════════════════════════════════════════════════════════

-- 10.1 Create indexes for optimal query performance
-- ────────────────────────────────────────────────────────────
-- ✅ RUN THESE ONCE to speed up temporal queries significantly
-- ────────────────────────────────────────────────────────────

-- Patients: created_at index (DESC for recent queries)
CREATE INDEX IF NOT EXISTS idx_patients_created_at
ON patients(created_at DESC);

-- Appointments: appointment_date index
CREATE INDEX IF NOT EXISTS idx_appointments_date
ON appointments(appointment_date DESC);

-- Appointments: composite index (date + status)
CREATE INDEX IF NOT EXISTS idx_appointments_date_status
ON appointments(appointment_date DESC, status);

-- Consultations: created_at index
CREATE INDEX IF NOT EXISTS idx_consultations_created_at
ON consultations(created_at DESC);

-- Consultations: composite index (created_at + status)
CREATE INDEX IF NOT EXISTS idx_consultations_created_status
ON consultations(created_at DESC, status);

-- 10.2 Verify indexes exist
-- ────────────────────────────────────────────────────────────
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('patients', 'appointments', 'consultations')
ORDER BY tablename, indexname;

-- 10.3 Analyze query performance (EXPLAIN ANALYZE)
-- ────────────────────────────────────────────────────────────
EXPLAIN ANALYZE
SELECT COUNT(*)
FROM patients
WHERE created_at >= NOW() - INTERVAL '30 days';

-- Without index: Seq Scan on patients (cost=0.00..X.XX)
-- With index:    Index Scan using idx_patients_created_at (cost=0.00..X.XX)

-- ════════════════════════════════════════════════════════════
-- SECTION 11: UTILITY FUNCTIONS (Optional)
-- ════════════════════════════════════════════════════════════

-- 11.1 Create helper function for date range generation
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_date_series(
  start_date date,
  end_date date,
  step interval DEFAULT '1 day'
)
RETURNS TABLE (date_value date) AS $$
BEGIN
  RETURN QUERY
  SELECT generate_series(start_date, end_date, step)::date;
END;
$$ LANGUAGE plpgsql;

-- Usage:
SELECT * FROM generate_date_series(
  CURRENT_DATE - INTERVAL '7 days',
  CURRENT_DATE
);

-- ════════════════════════════════════════════════════════════
-- END OF SQL EXAMPLES
-- ════════════════════════════════════════════════════════════
--
-- REMEMBER:
-- 1. Most aggregations are better done client-side (hybrid pattern)
-- 2. Always use indexes on temporal columns
-- 3. Be aware of missing buckets in GROUP BY queries
-- 4. Test queries with EXPLAIN ANALYZE for performance
-- 5. Use Supabase JS for flexibility, SQL for complex analytics
--
-- ════════════════════════════════════════════════════════════
