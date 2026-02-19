import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, Clock, Star } from 'lucide-react';
import { useDashboardStatsQuery } from '../../hooks/useDashboardStatsQuery';
import { useMedecinPerformance } from '../../hooks/useAnalyticsData';

interface KPI {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

interface KPIPerformanceWidgetProps {
  isDemoMode?: boolean;
}

const demoKpis: KPI[] = [
  {
    label: "Taux d'occupation",
    value: '87%',
    change: '+4.2%',
    trend: 'up',
    icon: <Activity className="h-4 w-4" />,
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    label: 'Revenus du mois',
    value: '12 450 FCFA',
    change: '+12.5%',
    trend: 'up',
    icon: <DollarSign className="h-4 w-4" />,
    color: 'bg-emerald-500/10 text-emerald-600',
  },
  {
    label: 'Satisfaction patients',
    value: '4.8/5',
    change: '+0.3',
    trend: 'up',
    icon: <Star className="h-4 w-4" />,
    color: 'bg-amber-500/10 text-amber-600',
  },
  {
    label: 'Durée moy. consultation',
    value: '22 min',
    change: '-3 min',
    trend: 'down',
    icon: <Clock className="h-4 w-4" />,
    color: 'bg-purple-500/10 text-purple-600',
  },
];

const KPIPerformanceWidget: React.FC<KPIPerformanceWidgetProps> = ({ isDemoMode = true }) => {
  const { stats, loading } = useDashboardStatsQuery();
  const { data: medecins } = useMedecinPerformance();

  const realKpis: KPI[] = useMemo(() => {
    const avgSatisfaction = medecins?.length
      ? (medecins.reduce((s, m) => s + m.satisfaction, 0) / medecins.length).toFixed(1)
      : '0';
    const avgDuration = medecins?.length
      ? Math.round(medecins.reduce((s, m) => s + m.minutes_par_patient, 0) / medecins.length)
      : 0;

    return [
      {
        label: "RDV aujourd'hui",
        value: String(stats.appointmentsToday),
        change: `${stats.appointmentsTodayChange > 0 ? '+' : ''}${stats.appointmentsTodayChange}%`,
        trend: stats.appointmentsTodayChange >= 0 ? 'up' as const : 'down' as const,
        icon: <Activity className="h-4 w-4" />,
        color: 'bg-blue-500/10 text-blue-600',
      },
      {
        label: 'Revenus du mois',
        value: `${stats.totalRevenue.toLocaleString('fr-FR')} FCFA`,
        change: `${stats.totalRevenueChange > 0 ? '+' : ''}${stats.totalRevenueChange}%`,
        trend: stats.totalRevenueChange >= 0 ? 'up' as const : 'down' as const,
        icon: <DollarSign className="h-4 w-4" />,
        color: 'bg-emerald-500/10 text-emerald-600',
      },
      {
        label: 'Satisfaction patients',
        value: `${avgSatisfaction}/5`,
        change: Number(avgSatisfaction) >= 4.5 ? '+0.3' : '-0.1',
        trend: Number(avgSatisfaction) >= 4.5 ? 'up' as const : 'down' as const,
        icon: <Star className="h-4 w-4" />,
        color: 'bg-amber-500/10 text-amber-600',
      },
      {
        label: 'Durée moy. consultation',
        value: `${avgDuration} min`,
        change: avgDuration <= 25 ? `-${25 - avgDuration} min` : `+${avgDuration - 25} min`,
        trend: avgDuration <= 25 ? 'down' as const : 'up' as const,
        icon: <Clock className="h-4 w-4" />,
        color: 'bg-purple-500/10 text-purple-600',
      },
    ];
  }, [stats, medecins]);

  const kpis = isDemoMode ? demoKpis : (loading && !stats.appointmentsToday ? demoKpis : realKpis);

  return (
    <div className="rounded-2xl bg-[var(--bg-secondary)] p-4 shadow-sm transition-colors duration-300">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold theme-text-primary">Indicateurs de performance</h2>
          <p className="text-xs theme-text-muted mt-0.5">Ce mois-ci vs mois précédent</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-[var(--border-color)] p-3 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${kpi.color}`}>
                {kpi.icon}
              </div>
              <span
                className={`flex items-center gap-0.5 text-[10px] font-semibold ${
                  kpi.trend === 'up' ? 'text-emerald-500' : 'text-blue-500'
                }`}
              >
                {kpi.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {kpi.change}
              </span>
            </div>
            <div className="text-lg font-bold theme-text-primary">{kpi.value}</div>
            <div className="text-[10px] theme-text-muted mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KPIPerformanceWidget;
