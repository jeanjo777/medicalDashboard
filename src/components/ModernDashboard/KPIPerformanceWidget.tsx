import React from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, Clock, Star } from 'lucide-react';

interface KPI {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

const KPIPerformanceWidget: React.FC = () => {
  const kpis: KPI[] = [
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
      value: '12 450€',
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

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Indicateurs de performance</h2>
          <p className="text-xs text-gray-500 mt-0.5">Ce mois-ci vs mois précédent</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-gray-100 p-3 hover:border-gray-200 hover:shadow-sm transition-all"
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
            <div className="text-lg font-bold text-gray-900">{kpi.value}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KPIPerformanceWidget;
