# ⚡ QUICK START - Filtres Temporels

Guide de démarrage rapide pour utiliser les filtres temporels dans votre dashboard.

---

## 📦 FICHIERS CRÉÉS

```
project/
├── TEMPORAL_FILTERS_GUIDE.md          ← Documentation complète
├── SQL_EXAMPLES_TEMPORAL.sql           ← Exemples SQL
├── src/
│   ├── utils/
│   │   └── temporalFilters.ts          ← Fonctions utilitaires
│   └── hooks/
│       └── useTemporalData.ts          ← React hooks
```

---

## 🚀 UTILISATION RAPIDE

### Option 1: Hook React (Recommandé)

```typescript
import { useTemporalData } from '@/hooks/useTemporalData';

function MyChart() {
  const { data, loading, error, period, setPeriod } = useTemporalData(
    'patients',  // Table Supabase
    'month',     // Période initiale
    'cumulative' // Mode agrégation
  );

  if (loading) return <Skeleton />;
  if (error) return <Error message={error} />;

  return (
    <div>
      {/* Filtres */}
      <button onClick={() => setPeriod('week')}>Week</button>
      <button onClick={() => setPeriod('month')}>Month</button>
      <button onClick={() => setPeriod('year')}>Year</button>

      {/* Chart */}
      <LineChart data={data}>
        <Line dataKey="value" />
      </LineChart>
    </div>
  );
}
```

### Option 2: Fonctions Utilitaires

```typescript
import {
  getDateRange,
  fetchFilteredData,
  aggregateData
} from '@/utils/temporalFilters';

async function loadData(period: 'week' | 'month' | 'year') {
  // 1. Calculer range de dates
  const { start, end } = getDateRange(period);
  console.log(`Range: ${start} → ${end}`);

  // 2. Fetch data filtrée (server-side)
  const rawData = await fetchFilteredData('patients', period);

  // 3. Agréger par buckets (front-end)
  const chartData = aggregateData(rawData, period, 'cumulative');

  return chartData;
}
```

---

## 📊 HOOKS SPÉCIALISÉS

### Patient Growth

```typescript
import { usePatientGrowth } from '@/hooks/useTemporalData';

function PatientGrowthChart() {
  const { data, loading, growth } = usePatientGrowth('month');

  return (
    <div>
      <h3>Patient Growth: {growth >= 0 ? '+' : ''}{growth}%</h3>
      <LineChart data={data} />
    </div>
  );
}
```

### Appointment Distribution

```typescript
import { useAppointmentDistribution } from '@/hooks/useTemporalData';

function AppointmentChart() {
  const { data, total } = useAppointmentDistribution('week');

  return (
    <div>
      <h3>Total Appointments: {total}</h3>
      <BarChart data={data} />
    </div>
  );
}
```

### Dashboard Complet

```typescript
import { useDashboardData } from '@/hooks/useTemporalData';

function Dashboard() {
  const {
    patients,
    appointments,
    consultations,
    period,
    setPeriod
  } = useDashboardData('month');

  return (
    <div>
      {/* Filtres globaux */}
      <PeriodSelector period={period} onChange={setPeriod} />

      {/* Charts synchronisés */}
      <PatientChart data={patients.data} />
      <AppointmentChart data={appointments.data} />
      <ConsultationChart data={consultations.data} />
    </div>
  );
}
```

---

## 🗄️ REQUÊTES SQL

### Query Basique (Supabase)

```typescript
// Derniers 7 jours
const { data } = await supabase
  .from('patients')
  .select('*')
  .gte('created_at', sevenDaysAgo.toISOString())
  .lte('created_at', now.toISOString());
```

### Count Simple

```typescript
// Total patients cette semaine
const { count } = await supabase
  .from('patients')
  .select('*', { count: 'exact', head: true })
  .gte('created_at', startOfWeek.toISOString());

console.log(`${count} patients this week`);
```

### Avec Helper Function

```typescript
import { getCountForPeriod } from '@/utils/temporalFilters';

const weekCount = await getCountForPeriod('patients', 'week');
const monthCount = await getCountForPeriod('patients', 'month');
const yearCount = await getCountForPeriod('patients', 'year');
```

---

## 🎨 COMPOSANTS UI

### Boutons de Filtre

```typescript
function PeriodSelector({ period, onChange }) {
  const periods = [
    { value: 'week', label: 'Semaine' },
    { value: 'month', label: 'Mois' },
    { value: 'year', label: 'Année' }
  ];

  return (
    <div className="flex gap-2">
      {periods.map(p => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`
            px-4 py-2 rounded-lg
            ${period === p.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300'
            }
          `}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
```

### Label Range de Dates

```typescript
import { getDateRange, formatDateRange } from '@/utils/temporalFilters';

function DateRangeLabel({ period }) {
  const { start, end } = getDateRange(period);
  const rangeStr = formatDateRange(start, end);

  return (
    <p className="text-sm text-gray-500">
      {rangeStr}
    </p>
  );
}
```

### Indicateur de Growth

```typescript
function GrowthIndicator({ growth }) {
  const isPositive = growth >= 0;
  const color = isPositive ? 'text-green-500' : 'text-red-500';
  const arrow = isPositive ? '↑' : '↓';

  return (
    <span className={`font-semibold ${color}`}>
      {arrow} {Math.abs(growth)}%
    </span>
  );
}
```

---

## ⚡ PERFORMANCE

### 1. Créer Index DB (CRITIQUE!)

```sql
-- Exécuter UNE FOIS dans Supabase SQL Editor
CREATE INDEX IF NOT EXISTS idx_patients_created_at
ON patients(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_date
ON appointments(appointment_date DESC);

CREATE INDEX IF NOT EXISTS idx_consultations_created_at
ON consultations(created_at DESC);
```

### 2. Cache avec React Query (Optionnel)

```typescript
// Installation: npm install @tanstack/react-query

import { useQuery } from '@tanstack/react-query';
import { fetchFilteredData, aggregateData } from '@/utils/temporalFilters';

function useOptimizedData(table, period) {
  return useQuery({
    queryKey: [table, 'temporal', period],
    queryFn: async () => {
      const data = await fetchFilteredData(table, period);
      return aggregateData(data, period, 'cumulative');
    },
    staleTime: 5 * 60 * 1000,  // Cache 5 minutes
    cacheTime: 10 * 60 * 1000  // Keep 10 minutes
  });
}
```

---

## 🔧 TROUBLESHOOTING

### Problème: Dates incorrectes

```typescript
// ❌ ERREUR: Date en string sans timezone
const date = '2025-11-02';

// ✅ CORRECT: Utiliser toISOString()
const date = new Date('2025-11-02T00:00:00Z');
await supabase.gte('created_at', date.toISOString());
```

### Problème: Buckets manquants

```typescript
// ❌ GROUP BY SQL → jours sans données absents
SELECT DATE(created_at), COUNT(*)
FROM patients
GROUP BY DATE(created_at);

// ✅ Aggregate front-end → tous les jours présents
const chartData = aggregateByDay(data, 'count');
// Résultat: 7 points même si certains jours = 0
```

### Problème: Cumulative incorrect

```typescript
// ❌ ERREUR: Fetch seulement période actuelle
const last7Days = await fetchFilteredData('patients', 'week');
const cumulative = aggregateData(last7Days, 'week', 'cumulative');
// Résultat: Compte seulement patients des 7 derniers jours

// ✅ CORRECT: Fetch ALL historical
const allPatients = await supabase
  .from('patients')
  .select('id, created_at')
  .order('created_at');

const cumulative = aggregateData(allPatients, 'week', 'cumulative');
// Résultat: Compte TOUS les patients jusqu'à chaque jour
```

---

## 📚 RESSOURCES

- **Documentation complète:** `TEMPORAL_FILTERS_GUIDE.md`
- **Exemples SQL:** `SQL_EXAMPLES_TEMPORAL.sql`
- **Utilitaires:** `src/utils/temporalFilters.ts`
- **Hooks:** `src/hooks/useTemporalData.ts`

---

## ✅ CHECKLIST IMPLÉMENTATION

```
SETUP INITIAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Créer index DB sur created_at
✅ Vérifier RLS policies permettent filtrage par date
✅ Importer utils et hooks dans components

COMPOSANT CHART
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Utiliser useTemporalData hook
✅ Ajouter boutons filtres période
✅ Implémenter loading skeleton
✅ Gérer erreurs avec retry
✅ Afficher label range de dates
✅ Montrer growth percentage

UI/UX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ État actif visible sur bouton filtre
✅ Loading spinner pendant fetch
✅ Transition smooth entre périodes
✅ Tooltip enrichi avec contexte période
✅ Empty state si pas de données

TESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Tester avec dataset vide
✅ Tester avec >1000 rows
✅ Vérifier tous les buckets présents
✅ Valider calculs growth corrects
✅ Tester changements période rapides
```

---

## 🎯 EXEMPLE COMPLET

```typescript
// src/components/MyChart.tsx

import { useTemporalData } from '@/hooks/useTemporalData';
import { formatDateRange, getDateRange } from '@/utils/temporalFilters';
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export function MyChart() {
  const {
    data,
    loading,
    error,
    period,
    setPeriod,
    growth,
    refetch
  } = useTemporalData('patients', 'month', 'cumulative');

  const { start, end } = getDateRange(period);
  const rangeStr = formatDateRange(start, end);

  if (loading) {
    return <div className="animate-pulse h-64 bg-gray-700 rounded" />;
  }

  if (error) {
    return (
      <div className="text-red-400">
        <p>{error}</p>
        <button onClick={refetch}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="bg-[#1e293b] rounded-xl p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-white text-lg font-semibold">
            Patient Growth
          </h3>
          <p className="text-gray-400 text-sm">{rangeStr}</p>
        </div>
        <div className={growth >= 0 ? 'text-green-500' : 'text-red-500'}>
          {growth >= 0 ? '+' : ''}{growth}%
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['week', 'month', 'year'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p as any)}
            className={`
              px-4 py-2 rounded-lg text-sm
              ${period === p
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400'
              }
            `}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Chart */}
      <LineChart width={600} height={300} data={data}>
        <XAxis dataKey="name" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#3b82f6"
          strokeWidth={2}
        />
      </LineChart>
    </div>
  );
}
```

---

**Prêt à utiliser!** 🚀

Pour plus de détails, consultez `TEMPORAL_FILTERS_GUIDE.md`.
