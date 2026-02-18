import React from 'react';
import { Users, TrendingUp, Calendar, AlertTriangle, ArrowUp, ArrowDown, Brain } from 'lucide-react';
import { useAnalyticsStats } from '../../hooks/useAnalyticsData';
import { demoKPIStats } from '../../data/demoData';
import ChartLoader from './ChartLoader';
import ChartError from './ChartError';

interface KPICardsProps {
  isDemoMode?: boolean;
  demoData?: typeof demoKPIStats;
}

const KPICards: React.FC<KPICardsProps> = ({ isDemoMode = false, demoData }) => {
  const { data: stats, isLoading, isError, refetch } = useAnalyticsStats();

  // Utiliser les données démo si le mode démo est actif
  const displayStats = isDemoMode
    ? (demoData || demoKPIStats)
    : stats;

  if (!isDemoMode && isLoading) {
    return <ChartLoader />;
  }

  if (!isDemoMode && (isError || !stats)) {
    return <ChartError message="Erreur lors du chargement des statistiques" onRetry={() => refetch()} />;
  }

  if (!displayStats) {
    return <ChartLoader />;
  }

  const kpis = [
    {
      title: 'Patients Consultés',
      value: displayStats.patients_consultes.toString(),
      change: `${displayStats.patients_consultes_evolution > 0 ? '+' : ''}${displayStats.patients_consultes_evolution}%`,
      isPositive: displayStats.patients_consultes_evolution >= 0,
      icon: Users,
      bgGradient: 'from-emerald-500/10 to-emerald-600/10',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
      hoverBorder: 'hover:border-emerald-500/50'
    },
    {
      title: 'Rendez-vous Exceptionnels',
      value: `${displayStats.rdv_exceptionnels}%`,
      change: `${displayStats.rdv_exceptionnels_evolution > 0 ? '+' : ''}${displayStats.rdv_exceptionnels_evolution}%`,
      isPositive: displayStats.rdv_exceptionnels_evolution >= 0,
      icon: Calendar,
      bgGradient: 'from-blue-500/10 to-blue-600/10',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
      hoverBorder: 'hover:border-blue-500/50'
    },
    {
      title: 'Rendez-vous Honorés',
      value: `${displayStats.rdv_honores}%`,
      change: `${displayStats.rdv_honores_evolution > 0 ? '+' : ''}${displayStats.rdv_honores_evolution}%`,
      isPositive: displayStats.rdv_honores_evolution >= 0,
      icon: TrendingUp,
      bgGradient: 'from-purple-500/10 to-purple-600/10',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/20',
      hoverBorder: 'hover:border-purple-500/50'
    },
    {
      title: 'Cas à Risque Détectés',
      value: displayStats.cas_risque.toString(),
      change: `${displayStats.cas_risque_evolution > 0 ? '+' : ''}${displayStats.cas_risque_evolution}`,
      isPositive: displayStats.cas_risque_evolution <= 0,
      icon: AlertTriangle,
      bgGradient: 'from-orange-500/10 to-orange-600/10',
      iconColor: 'text-orange-400',
      borderColor: 'border-orange-500/20',
      hoverBorder: 'hover:border-orange-500/50',
      badge: 'Alerte IA'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const TrendIcon = kpi.isPositive ? ArrowUp : ArrowDown;

        return (
          <div
            key={index}
            className={`
              relative bg-gradient-to-br ${kpi.bgGradient}
              backdrop-blur-sm border ${kpi.borderColor} ${kpi.hoverBorder} rounded-xl p-5
              hover:scale-[1.02] transition-all duration-300 ease-out
              group cursor-pointer shadow-lg hover:shadow-xl
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 bg-[#0f172a]/80 rounded-xl ${kpi.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} />
                </div>
                {kpi.badge && (
                  <span className="px-2.5 py-1 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-medium rounded-full flex items-center gap-1.5 animate-pulse">
                    <Brain size={12} />
                    {kpi.badge}
                  </span>
                )}
              </div>

              <h3 className="text-gray-400 text-sm font-medium mb-2">{kpi.title}</h3>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-white tracking-tight">{kpi.value}</p>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${kpi.isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  <TrendIcon size={14} />
                  <span className="text-sm font-semibold">{kpi.change}</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/50 rounded-b-xl overflow-hidden">
              <div
                className={`h-full ${kpi.isPositive ? 'bg-emerald-500' : 'bg-red-500'} transition-all duration-1000 ease-out`}
                style={{ width: `${Math.min(Math.abs(parseFloat(kpi.change)), 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;
