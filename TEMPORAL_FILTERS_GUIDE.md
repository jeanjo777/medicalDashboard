# 📅 GUIDE COMPLET - FILTRES TEMPORELS & REQUÊTES SQL PARAMÉTRÉES

## 📋 TABLE DES MATIÈRES

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture des Filtres](#architecture-des-filtres)
3. [Patterns TypeScript](#patterns-typescript)
4. [Requêtes SQL Paramétrées](#requêtes-sql-paramétrées)
5. [Exemples Complets](#exemples-complets)
6. [Optimisations](#optimisations)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 VUE D'ENSEMBLE

### Types de Filtres Temporels

```typescript
// Types de périodes supportées
type Period = 'week' | 'month' | 'year';

// Modes d'agrégation
type AggregationMode = 'count' | 'cumulative';

// Structure données chart
interface ChartData {
  name: string;      // Label axe X (Lun, Jan, 2024)
  value: number;     // Valeur métrique
  date: Date;        // Date référence pour tri/calcul
}

// Range de dates
interface DateRange {
  start: Date;       // Début période (inclusif)
  end: Date;         // Fin période (inclusif)
}
```

### Stratégies de Filtrage

| Stratégie | Où ? | Avantages | Inconvénients | Recommandé pour |
|-----------|------|-----------|---------------|-----------------|
| **Front-End Only** | Client | Simple, pas de requête multiple | Fetch ALL data, lent >1000 rows | Petits datasets (<1000) |
| **Server-Side Only** | DB | Scalable, rapide | Moins flexible, requires SQL | Gros datasets (>10k) |
| **Hybrid** | DB + Client | Optimal: filter DB, aggregate front | Plus complexe | **Production** (recommandé) |

---

## 🏗️ ARCHITECTURE DES FILTRES

### Pattern Hybrid (Recommandé)

```
┌────────────────────────────────────────────────────────────┐
│                   USER INTERACTION                         │
│  Clique "Week" / "Month" / "Year" button                   │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│              1. CALCULATE DATE RANGE                       │
│  getDateRange(period) → { start, end }                     │
│                                                            │
│  Examples:                                                 │
│  - Week:  2025-10-27 → 2025-11-02                         │
│  - Month: 2024-12-02 → 2025-11-02                         │
│  - Year:  2020-11-02 → 2025-11-02                         │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│           2. FETCH FILTERED DATA (SERVER)                  │
│  Supabase Query:                                           │
│    .from('patients')                                       │
│    .select('id, created_at')                               │
│    .gte('created_at', start.toISOString())                 │
│    .lte('created_at', end.toISOString())                   │
│                                                            │
│  ✅ ONLY data within range                                 │
│  ✅ DB index on created_at (fast)                          │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│        3. AGGREGATE BY BUCKET (CLIENT)                     │
│  aggregateData(data, period, mode)                         │
│                                                            │
│  Week  → aggregateByDay()    → 7 points                   │
│  Month → aggregateByMonth()  → 12 points                  │
│  Year  → aggregateByYear()   → 5 points                   │
│                                                            │
│  Count Mode:      New items per bucket                     │
│  Cumulative Mode: Total items up to bucket                 │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│              4. RENDER CHART                               │
│  <LineChart data={chartData} />                            │
│                                                            │
│  With:                                                     │
│  - Loading skeleton                                        │
│  - Error handling                                          │
│  - Smooth transitions                                      │
└────────────────────────────────────────────────────────────┘
```

---

## 💻 PATTERNS TYPESCRIPT

### 1. Date Range Calculator

```typescript
/**
 * Calcule la plage de dates pour une période donnée
 *
 * @param period - 'week' | 'month' | 'year'
 * @returns { start, end } - Dates inclusives
 *
 * @example
 * // Aujourd'hui: 2025-11-02 14:30:00
 * getDateRange('week')
 * // → { start: 2025-10-27 00:00:00, end: 2025-11-02 23:59:59 }
 *
 * getDateRange('month')
 * // → { start: 2024-12-01 00:00:00, end: 2025-11-02 23:59:59 }
 */
function getDateRange(period: Period): DateRange {
  const now = new Date();

  // End = maintenant, fin de journée
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  // Start = période avant, début de journée
  const start = new Date(now);

  switch (period) {
    case 'week':
      // 7 derniers jours (incluant aujourd'hui)
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      break;

    case 'month':
      // 12 derniers mois (12 points)
      start.setMonth(now.getMonth() - 11);
      start.setDate(1); // Premier jour du mois
      start.setHours(0, 0, 0, 0);
      break;

    case 'year':
      // 5 dernières années (5 points)
      start.setFullYear(now.getFullYear() - 4);
      start.setMonth(0); // Janvier
      start.setDate(1); // 1er janvier
      start.setHours(0, 0, 0, 0);
      break;
  }

  return { start, end };
}

// ════════════════════════════════════════════════════════════
// TESTS UNITAIRES
// ════════════════════════════════════════════════════════════

// Test Week
const weekRange = getDateRange('week');
console.assert(
  weekRange.end.getTime() - weekRange.start.getTime() === 6 * 24 * 60 * 60 * 1000,
  'Week range should be 7 days'
);

// Test Month
const monthRange = getDateRange('month');
console.assert(
  monthRange.start.getDate() === 1,
  'Month range should start on 1st day'
);

// Test Year
const yearRange = getDateRange('year');
console.assert(
  yearRange.start.getMonth() === 0,
  'Year range should start in January'
);
```

### 2. Supabase Query Builder

```typescript
/**
 * Fetch données filtrées par période depuis Supabase
 *
 * @param table - Nom de la table
 * @param period - Période de filtrage
 * @param select - Colonnes à sélectionner
 * @returns Promise<Array> - Données filtrées
 *
 * @throws Error si query échoue
 *
 * @example
 * const patients = await fetchFilteredData('patients', 'week', 'id, created_at');
 * // Retourne patients créés dans les 7 derniers jours
 */
async function fetchFilteredData(
  table: string,
  period: Period,
  select: string = '*'
): Promise<any[]> {
  const { start, end } = getDateRange(period);

  console.log(`[fetchFilteredData] ${table} - Period: ${period}`);
  console.log(`[fetchFilteredData] Range: ${start.toISOString()} → ${end.toISOString()}`);

  const { data, error } = await supabase
    .from(table)
    .select(select)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error(`[fetchFilteredData] Error:`, error);
    throw new Error(`Failed to fetch ${table}: ${error.message}`);
  }

  console.log(`[fetchFilteredData] Success: ${data?.length || 0} rows`);
  return data || [];
}

// ════════════════════════════════════════════════════════════
// USAGE EXAMPLES
// ════════════════════════════════════════════════════════════

// Exemple 1: Patients de la semaine
const weekPatients = await fetchFilteredData('patients', 'week');

// Exemple 2: Appointments du mois (colonnes spécifiques)
const monthAppts = await fetchFilteredData(
  'appointments',
  'month',
  'id, patient_name, appointment_date, status'
);

// Exemple 3: Consultations de l'année
const yearConsults = await fetchFilteredData('consultations', 'year');
```

### 3. Agrégation par Jour (Week)

```typescript
/**
 * Agrège données par jour pour période "week"
 *
 * @param data - Données brutes de Supabase (must have created_at)
 * @param mode - 'count' (nouveaux/jour) | 'cumulative' (total croissant)
 * @returns ChartData[] - 7 points (un par jour)
 *
 * @example
 * // Mode COUNT: combien de nouveaux patients chaque jour
 * aggregateByDay(patients, 'count')
 * // → [{ name: 'Lun', value: 5 }, { name: 'Mar', value: 3 }, ...]
 *
 * // Mode CUMULATIVE: total patients jusqu'à cette date
 * aggregateByDay(patients, 'cumulative')
 * // → [{ name: 'Lun', value: 100 }, { name: 'Mar', value: 103 }, ...]
 */
function aggregateByDay(
  data: any[],
  mode: 'count' | 'cumulative' = 'count'
): ChartData[] {
  const now = new Date();
  const buckets: ChartData[] = [];

  // Labels jours en français
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  // Boucle sur les 7 derniers jours
  for (let i = 6; i >= 0; i--) {
    // Date cible (ex: il y a 6 jours, 5 jours, ..., aujourd'hui)
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0); // Début de journée

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999); // Fin de journée

    let value: number;

    if (mode === 'count') {
      // COUNT: Nouveaux items CE jour précisément
      value = data.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= date && itemDate <= endOfDay;
      }).length;

    } else {
      // CUMULATIVE: Total items jusqu'à la fin de CE jour (inclusif)
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
// EXEMPLE RÉSULTATS
// ════════════════════════════════════════════════════════════

// Dataset exemple:
// Patients créés: 27/10, 27/10, 28/10, 30/10, 30/10, 30/10, 01/11

// MODE COUNT:
// [
//   { name: 'Lun', value: 2, date: 2025-10-27 },  // 2 nouveaux
//   { name: 'Mar', value: 1, date: 2025-10-28 },  // 1 nouveau
//   { name: 'Mer', value: 0, date: 2025-10-29 },  // 0 nouveau
//   { name: 'Jeu', value: 3, date: 2025-10-30 },  // 3 nouveaux
//   { name: 'Ven', value: 0, date: 2025-10-31 },  // 0 nouveau
//   { name: 'Sam', value: 1, date: 2025-11-01 },  // 1 nouveau
//   { name: 'Dim', value: 0, date: 2025-11-02 }   // 0 nouveau
// ]

// MODE CUMULATIVE:
// [
//   { name: 'Lun', value: 2, date: 2025-10-27 },  // Total: 2
//   { name: 'Mar', value: 3, date: 2025-10-28 },  // Total: 3
//   { name: 'Mer', value: 3, date: 2025-10-29 },  // Total: 3 (pas de nouveau)
//   { name: 'Jeu', value: 6, date: 2025-10-30 },  // Total: 6
//   { name: 'Ven', value: 6, date: 2025-10-31 },  // Total: 6
//   { name: 'Sam', value: 7, date: 2025-11-01 },  // Total: 7
//   { name: 'Dim', value: 7, date: 2025-11-02 }   // Total: 7
// ]
```

### 4. Agrégation par Mois (Month)

```typescript
/**
 * Agrège données par mois pour période "month"
 *
 * @param data - Données brutes de Supabase
 * @param mode - 'count' | 'cumulative'
 * @returns ChartData[] - 12 points (un par mois)
 *
 * @example
 * aggregateByMonth(patients, 'count')
 * // → [{ name: 'Déc', value: 50 }, { name: 'Jan', value: 45 }, ...]
 */
function aggregateByMonth(
  data: any[],
  mode: 'count' | 'cumulative' = 'count'
): ChartData[] {
  const now = new Date();
  const buckets: ChartData[] = [];

  // Labels mois en français
  const monthNames = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
    'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
  ];

  // Boucle sur les 12 derniers mois
  for (let i = 11; i >= 0; i--) {
    // Premier jour du mois cible
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    date.setHours(0, 0, 0, 0);

    // Dernier jour du mois cible
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    let value: number;

    if (mode === 'count') {
      // COUNT: Nouveaux items CE mois
      value = data.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= date && itemDate <= endOfMonth;
      }).length;

    } else {
      // CUMULATIVE: Total items jusqu'à la fin de CE mois
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
// EDGE CASES GÉRÉS
// ════════════════════════════════════════════════════════════

// 1. Changement d'année
// Aujourd'hui: 2025-11-02
// 12 mois arrière: 2024-12-01 → Correct ✅

// 2. Mois avec différents nombres de jours
// Février (28/29 jours), Mois 30 jours, Mois 31 jours → Tous gérés ✅

// 3. Année bissextile
// new Date(year, month + 1, 0) retourne automatiquement dernier jour ✅
```

### 5. Agrégation par Année (Year)

```typescript
/**
 * Agrège données par année pour période "year"
 *
 * @param data - Données brutes de Supabase
 * @param mode - 'count' | 'cumulative'
 * @returns ChartData[] - 5 points (un par année)
 *
 * @example
 * aggregateByYear(patients, 'count')
 * // → [{ name: '2021', value: 120 }, { name: '2022', value: 150 }, ...]
 */
function aggregateByYear(
  data: any[],
  mode: 'count' | 'cumulative' = 'count'
): ChartData[] {
  const now = new Date();
  const buckets: ChartData[] = [];

  // Boucle sur les 5 dernières années
  for (let i = 4; i >= 0; i--) {
    const year = now.getFullYear() - i;

    // 1er janvier de l'année cible
    const date = new Date(year, 0, 1);
    date.setHours(0, 0, 0, 0);

    // 31 décembre de l'année cible
    const endOfYear = new Date(year, 11, 31);
    endOfYear.setHours(23, 59, 59, 999);

    let value: number;

    if (mode === 'count') {
      // COUNT: Nouveaux items CETTE année
      value = data.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= date && itemDate <= endOfYear;
      }).length;

    } else {
      // CUMULATIVE: Total items jusqu'à la fin de CETTE année
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
```

### 6. Master Aggregation Function

```typescript
/**
 * Fonction principale d'agrégation
 * Dispatch automatique vers aggregateByDay/Month/Year
 *
 * @param data - Données brutes
 * @param period - Période ('week' | 'month' | 'year')
 * @param mode - Mode agrégation ('count' | 'cumulative')
 * @returns ChartData[] - Points pour chart
 *
 * @example
 * const chartData = aggregateData(patients, 'month', 'cumulative');
 */
function aggregateData(
  data: any[],
  period: Period,
  mode: 'count' | 'cumulative' = 'count'
): ChartData[] {
  console.log(`[aggregateData] Period: ${period}, Mode: ${mode}, Rows: ${data.length}`);

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
      console.error(`[aggregateData] Unknown period: ${period}`);
      return [];
  }

  console.log(`[aggregateData] Generated ${result.length} points`);
  return result;
}
```

---

## 🗄️ REQUÊTES SQL PARAMÉTRÉES

### 1. Filter by Period (Base Pattern)

```sql
-- ════════════════════════════════════════════════════════════
-- PATTERN: Filtrage par période avec bornes inclusives
-- ════════════════════════════════════════════════════════════

-- Variables (à remplacer dynamiquement)
-- @start_date : Date de début (YYYY-MM-DD HH:MM:SS)
-- @end_date   : Date de fin (YYYY-MM-DD HH:MM:SS)

SELECT *
FROM patients
WHERE created_at >= @start_date
  AND created_at <= @end_date
ORDER BY created_at ASC;

-- ════════════════════════════════════════════════════════════
-- SUPABASE JS EQUIVALENT
-- ════════════════════════════════════════════════════════════

const { data } = await supabase
  .from('patients')
  .select('*')
  .gte('created_at', startDate.toISOString())
  .lte('created_at', endDate.toISOString())
  .order('created_at', { ascending: true });
```

### 2. Week Filter (7 derniers jours)

```sql
-- ════════════════════════════════════════════════════════════
-- WEEK: 7 derniers jours (incluant aujourd'hui)
-- ════════════════════════════════════════════════════════════

-- PostgreSQL (Supabase)
SELECT
  id,
  name,
  created_at
FROM patients
WHERE created_at >= NOW() - INTERVAL '6 days'
  AND created_at <= NOW()
ORDER BY created_at ASC;

-- Explanation:
-- NOW() - INTERVAL '6 days' = Il y a 6 jours (+ aujourd'hui = 7 total)
-- NOW() = Maintenant (fin de période)

-- ════════════════════════════════════════════════════════════
-- SUPABASE JS
-- ════════════════════════════════════════════════════════════

const now = new Date();
const start = new Date(now);
start.setDate(start.getDate() - 6);
start.setHours(0, 0, 0, 0);

const end = new Date(now);
end.setHours(23, 59, 59, 999);

const { data } = await supabase
  .from('patients')
  .select('id, name, created_at')
  .gte('created_at', start.toISOString())
  .lte('created_at', end.toISOString())
  .order('created_at', { ascending: true });

-- ════════════════════════════════════════════════════════════
-- RÉSULTAT ATTENDU
-- ════════════════════════════════════════════════════════════
-- Si aujourd'hui = 2025-11-02:
-- Range: 2025-10-27 00:00:00 → 2025-11-02 23:59:59
-- Retourne: Tous patients créés dans ce range
```

### 3. Month Filter (12 derniers mois)

```sql
-- ════════════════════════════════════════════════════════════
-- MONTH: 12 derniers mois complets
-- ════════════════════════════════════════════════════════════

-- PostgreSQL
SELECT
  id,
  name,
  created_at
FROM patients
WHERE created_at >= DATE_TRUNC('month', NOW() - INTERVAL '11 months')
  AND created_at <= NOW()
ORDER BY created_at ASC;

-- Explanation:
-- DATE_TRUNC('month', X) = Premier jour du mois de X
-- NOW() - INTERVAL '11 months' = Il y a 11 mois (+ mois actuel = 12 total)

-- Exemple:
-- Aujourd'hui: 2025-11-02
-- DATE_TRUNC('month', 2024-12-02) = 2024-12-01 00:00:00
-- Range: 2024-12-01 → 2025-11-02

-- ════════════════════════════════════════════════════════════
-- SUPABASE JS
-- ════════════════════════════════════════════════════════════

const now = new Date();
const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
start.setHours(0, 0, 0, 0);

const end = new Date(now);
end.setHours(23, 59, 59, 999);

const { data } = await supabase
  .from('patients')
  .select('id, name, created_at')
  .gte('created_at', start.toISOString())
  .lte('created_at', end.toISOString())
  .order('created_at', { ascending: true });
```

### 4. Year Filter (5 dernières années)

```sql
-- ════════════════════════════════════════════════════════════
-- YEAR: 5 dernières années complètes
-- ════════════════════════════════════════════════════════════

-- PostgreSQL
SELECT
  id,
  name,
  created_at
FROM patients
WHERE created_at >= DATE_TRUNC('year', NOW() - INTERVAL '4 years')
  AND created_at <= NOW()
ORDER BY created_at ASC;

-- Explanation:
-- DATE_TRUNC('year', X) = 1er janvier de l'année de X
-- NOW() - INTERVAL '4 years' = Il y a 4 ans (+ année actuelle = 5 total)

-- Exemple:
-- Aujourd'hui: 2025-11-02
-- DATE_TRUNC('year', 2021-11-02) = 2021-01-01 00:00:00
-- Range: 2021-01-01 → 2025-11-02

-- ════════════════════════════════════════════════════════════
-- SUPABASE JS
-- ════════════════════════════════════════════════════════════

const now = new Date();
const start = new Date(now.getFullYear() - 4, 0, 1);
start.setHours(0, 0, 0, 0);

const end = new Date(now);
end.setHours(23, 59, 59, 999);

const { data } = await supabase
  .from('patients')
  .select('id, name, created_at')
  .gte('created_at', start.toISOString())
  .lte('created_at', end.toISOString())
  .order('created_at', { ascending: true });
```

### 5. Count Aggregation (Server-Side)

```sql
-- ════════════════════════════════════════════════════════════
-- COUNT TOTAL par période
-- ════════════════════════════════════════════════════════════

-- Week
SELECT COUNT(*) as total
FROM patients
WHERE created_at >= NOW() - INTERVAL '6 days';

-- Month
SELECT COUNT(*) as total
FROM patients
WHERE created_at >= DATE_TRUNC('month', NOW() - INTERVAL '11 months');

-- Year
SELECT COUNT(*) as total
FROM patients
WHERE created_at >= DATE_TRUNC('year', NOW() - INTERVAL '4 years');

-- ════════════════════════════════════════════════════════════
-- SUPABASE JS (count exact)
-- ════════════════════════════════════════════════════════════

const { count, error } = await supabase
  .from('patients')
  .select('*', { count: 'exact', head: true })
  .gte('created_at', start.toISOString())
  .lte('created_at', end.toISOString());

console.log(`Total patients: ${count}`);
```

### 6. Group By Day (Advanced)

```sql
-- ════════════════════════════════════════════════════════════
-- GROUP BY DAY - Patients par jour (7 derniers jours)
-- ════════════════════════════════════════════════════════════

SELECT
  DATE(created_at) as day,
  COUNT(*) as count
FROM patients
WHERE created_at >= NOW() - INTERVAL '6 days'
GROUP BY DATE(created_at)
ORDER BY day ASC;

-- Résultat:
--   day         | count
-- --------------+-------
--   2025-10-27  |   5
--   2025-10-28  |   3
--   2025-10-29  |   0    ← Jour sans nouveaux (absent du résultat)
--   2025-10-30  |   8
--   2025-11-01  |   2
--   2025-11-02  |   1

-- ⚠️ PROBLÈME: Jours sans données absents!
-- ⚠️ Supabase JS ne supporte pas GROUP BY directement

-- SOLUTION: Fetch data + aggregate côté front (pattern hybrid)
```

### 7. Group By Month (Advanced)

```sql
-- ════════════════════════════════════════════════════════════
-- GROUP BY MONTH - Patients par mois (12 derniers mois)
-- ════════════════════════════════════════════════════════════

SELECT
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as count
FROM patients
WHERE created_at >= DATE_TRUNC('month', NOW() - INTERVAL '11 months')
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month ASC;

-- Résultat:
--      month       | count
-- -----------------+-------
--   2024-12-01     |   15
--   2025-01-01     |   22
--   2025-02-01     |   0   ← Mois sans nouveaux (absent)
--   2025-03-01     |   18
--   ...

-- ⚠️ MÊME PROBLÈME: Mois sans données absents
-- SOLUTION: Aggregate côté front avec buckets pré-générés
```

### 8. Cumulative Count (Window Function)

```sql
-- ════════════════════════════════════════════════════════════
-- CUMULATIVE COUNT - Total croissant par jour
-- ════════════════════════════════════════════════════════════

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
  SUM(daily_count) OVER (ORDER BY day ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as cumulative
FROM daily_counts
ORDER BY day ASC;

-- Résultat:
--   day         | daily_count | cumulative
-- --------------+-------------+------------
--   2025-10-27  |      5      |     5
--   2025-10-28  |      3      |     8
--   2025-10-30  |      8      |    16
--   2025-11-01  |      2      |    18
--   2025-11-02  |      1      |    19

-- ⚠️ PROBLÈMES:
-- 1. Jours absents (29, 31 oct)
-- 2. Cumulative ne compte pas patients AVANT période
-- 3. Window function complexe
-- 4. Pas supporté Supabase JS

-- SOLUTION OPTIMALE: Fetch ALL historical + filter front
```

### 9. RPC Function (Server-Side Aggregation)

```sql
-- ════════════════════════════════════════════════════════════
-- CRÉER FONCTION SQL STOCKÉE (à exécuter une fois)
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_patients_by_period(
  period_type text,  -- 'week' | 'month' | 'year'
  mode text          -- 'count' | 'cumulative'
)
RETURNS TABLE(
  label text,
  value bigint,
  date_ref timestamp
) AS $$
BEGIN
  -- Implementation SQL complexe ici
  -- (trop long pour ce guide, utiliser pattern hybrid à la place)

  RETURN QUERY SELECT 'TODO'::text, 0::bigint, NOW()::timestamp;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════════
-- APPEL DEPUIS SUPABASE JS
-- ════════════════════════════════════════════════════════════

const { data, error } = await supabase
  .rpc('get_patients_by_period', {
    period_type: 'week',
    mode: 'count'
  });

-- ⚠️ COMPLEXE: Nécessite SQL avancé + maintenance
-- ✅ RECOMMANDÉ: Pattern Hybrid (plus simple, flexible)
```

---

## 📦 EXEMPLES COMPLETS

### Exemple 1: Patient Growth Chart (Complete)

```typescript
// src/hooks/usePatientGrowth.ts

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type Period = 'week' | 'month' | 'year';

interface ChartData {
  name: string;
  patients: number;
  date: Date;
}

export function usePatientGrowth(period: Period) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Calculate date range
      const { start, end } = getDateRange(period);

      // 2. Fetch filtered data from Supabase
      const { data: patients, error: fetchError } = await supabase
        .from('patients')
        .select('id, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // 3. Aggregate data
      const aggregated = aggregateData(patients || [], period, 'cumulative');
      setData(aggregated);

    } catch (err: any) {
      console.error('[usePatientGrowth] Error:', err);
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchData };
}

// Helper functions (from patterns above)
function getDateRange(period: Period) { /* ... */ }
function aggregateData(data: any[], period: Period, mode: string) { /* ... */ }
```

### Exemple 2: Appointment Distribution Chart

```typescript
// src/hooks/useAppointmentDistribution.ts

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface StatusData {
  name: string;
  value: number;
  color: string;
}

export function useAppointmentDistribution(period: Period) {
  const [data, setData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const { start, end } = getDateRange(period);

      // Fetch appointments dans la période
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('id, status, appointment_date')
        .gte('appointment_date', start.toISOString().split('T')[0])
        .lte('appointment_date', end.toISOString().split('T')[0]);

      if (error) throw error;

      // Agrégation par status
      const statusMap: Record<string, number> = {
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0
      };

      appointments?.forEach(apt => {
        const status = apt.status || 'pending';
        if (status in statusMap) {
          statusMap[status]++;
        }
      });

      // Format pour PieChart
      const formatted: StatusData[] = [
        { name: 'En Attente', value: statusMap.pending, color: '#f59e0b' },
        { name: 'Confirmé', value: statusMap.confirmed, color: '#3b82f6' },
        { name: 'Complété', value: statusMap.completed, color: '#10b981' },
        { name: 'Annulé', value: statusMap.cancelled, color: '#6b7280' }
      ];

      setData(formatted);

    } catch (err) {
      console.error('[useAppointmentDistribution] Error:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading };
}
```

---

## ⚡ OPTIMISATIONS

### 1. React Query (Cache Management)

```typescript
// Installation: npm install @tanstack/react-query

import { useQuery } from '@tanstack/react-query';

export function usePatientGrowthOptimized(period: Period) {
  return useQuery({
    queryKey: ['patients', 'growth', period],
    queryFn: () => fetchPatientGrowth(period),
    staleTime: 5 * 60 * 1000,      // Cache 5 minutes
    cacheTime: 10 * 60 * 1000,     // Keep cache 10 minutes
    refetchOnWindowFocus: true,    // Refetch si user revient
    refetchInterval: 60 * 1000,    // Auto-refetch 1min (optionnel)
  });
}

async function fetchPatientGrowth(period: Period) {
  const { start, end } = getDateRange(period);

  const { data } = await supabase
    .from('patients')
    .select('id, created_at')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString());

  return aggregateData(data || [], period, 'cumulative');
}
```

### 2. Database Index (Performance)

```sql
-- ════════════════════════════════════════════════════════════
-- CRÉER INDEX sur created_at (CRITIQUE pour performance)
-- ════════════════════════════════════════════════════════════

-- Patients
CREATE INDEX IF NOT EXISTS idx_patients_created_at
ON patients(created_at DESC);

-- Appointments
CREATE INDEX IF NOT EXISTS idx_appointments_date
ON appointments(appointment_date DESC);

-- Consultations
CREATE INDEX IF NOT EXISTS idx_consultations_created_at
ON consultations(created_at DESC);

-- ════════════════════════════════════════════════════════════
-- VÉRIFIER INDEX EXISTANTS
-- ════════════════════════════════════════════════════════════

SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('patients', 'appointments', 'consultations')
ORDER BY tablename, indexname;
```

---

## 🔧 TROUBLESHOOTING

### Problème 1: Timezone Mismatch

```typescript
// ❌ PROBLÈME: Dates en heure locale vs UTC
const start = new Date('2025-11-02'); // Interprété en heure locale
await supabase.gte('created_at', start.toString()); // Mauvais format!

// ✅ SOLUTION: Toujours utiliser toISOString()
const start = new Date('2025-11-02T00:00:00Z'); // UTC explicite
await supabase.gte('created_at', start.toISOString()); // Format ISO8601
```

### Problème 2: Buckets manquants (jours/mois sans data)

```typescript
// ❌ PROBLÈME: GROUP BY SQL retourne seulement jours avec data
// Résultat: [{ day: '2025-10-27', count: 5 }, { day: '2025-10-29', count: 3 }]
// Manque: 2025-10-28

// ✅ SOLUTION: Pré-générer tous les buckets côté front
function aggregateByDay(data: any[]) {
  const buckets = [];

  // Pré-générer 7 jours (même si count = 0)
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const count = data.filter(/* ... */);

    buckets.push({
      name: formatDay(date),
      value: count,  // Peut être 0!
      date
    });
  }

  return buckets;
}
```

### Problème 3: Performance avec gros datasets

```typescript
// ❌ LENT: Fetch ALL + filter front (>10k rows)
const { data: allPatients } = await supabase.from('patients').select('*');
const filtered = allPatients.filter(p => /* date filter */);

// ✅ RAPIDE: Filter server-side
const { data } = await supabase
  .from('patients')
  .select('id, created_at')  // Colonnes minimales
  .gte('created_at', start.toISOString())
  .lte('created_at', end.toISOString());
```

### Problème 4: Cumulative count incorrect

```typescript
// ❌ ERREUR: Cumulative compte seulement items dans période
const { data } = await supabase
  .from('patients')
  .select('id')
  .gte('created_at', last7Days); // Fetch seulement 7 jours

// Cumulative au jour 7 = count de ces 7 jours seulement (ex: 15)
// Mais le VRAI total patients = 1000 (inclus historique)

// ✅ SOLUTION: Pour cumulative, fetch ALL historical data
const { data: allPatients } = await supabase
  .from('patients')
  .select('id, created_at')
  .order('created_at');

// Puis filter côté front pour période d'affichage
const chartData = aggregateByDay(allPatients, 'cumulative');
```

---

## 📚 RÉFÉRENCES

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Date/Time Functions](https://www.postgresql.org/docs/current/functions-datetime.html)
- [Recharts Documentation](https://recharts.org/)
- [React Query Guide](https://tanstack.com/query/latest)

---

## ✅ CONCLUSION

**Patterns Documentés:**
- ✅ Date Range Calculator
- ✅ Supabase Query Builder
- ✅ Aggregation Functions (Day/Month/Year)
- ✅ Front-End vs Server-Side filtering

**SQL Paramétrées:**
- ✅ Week/Month/Year filters
- ✅ Count aggregation
- ✅ Group By patterns
- ✅ Cumulative counts

**Prêt pour Production:**
- ✅ Error handling complet
- ✅ Loading states
- ✅ TypeScript types
- ✅ Performance optimizations
- ✅ Troubleshooting guide

**Next Steps:**
- Implémenter React Query pour cache
- Créer indexes DB sur created_at
- Tester avec gros datasets (>10k rows)
