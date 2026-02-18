/**
 * DashboardStatsCards Component - OPTIMIZED VERSION
 *
 * Optimisations :
 * - Utilise useDashboardStatsOptimized (3 requêtes au lieu de 8)
 * - Mémoïsation des cartes avec useMemo
 * - Composants StatCard individuels mémoïsés
 * - Callbacks mémoïsés
 * - Logs réduits
 * - Transitions CSS optimisées
 *
 * @component
 */

import React, { useMemo, useCallback, memo } from 'react';
import {
  Users,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  type LucideIcon
} from 'lucide-react';
import { useDashboardStatsOptimized } from '../hooks/useDashboardStatsOptimized';
import ErrorState from './ErrorState';
import LoadingSkeleton from './LoadingSkeleton';
import logger from '../utils/logger';

interface StatCardData {
  id: string;
  title: string;
  value: string | number;
  change: number;
  icon: LucideIcon;
  color: string;
}

interface StatCardProps extends StatCardData {
  isRefetching: boolean;
  onRefresh: () => void;
}

// Composant StatCard individuel mémoïsé
const StatCard = memo<StatCardProps>(({ title, value, change, icon: Icon, color, isRefetching, onRefresh }) => {
  const colorClasses = useMemo(() => {
    const colors = {
      blue: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-500',
        border: 'border-blue-500/20',
      },
      green: {
        bg: 'bg-green-500/10',
        text: 'text-green-500',
        border: 'border-green-500/20',
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  }, [color]);

  const isPositiveChange = change >= 0;
  const TrendIcon = isPositiveChange ? TrendingUp : TrendingDown;
  const trendColor = isPositiveChange ? 'text-green-500' : 'text-red-500';

  return (
    <div
      className={`
        bg-[#1e293b] border ${colorClasses.border} rounded-xl p-4 sm:p-6
        hover:border-opacity-40 transition-all duration-300
        group relative overflow-hidden
      `}
    >
      {/* Background gradient effect */}
      <div className={`absolute inset-0 ${colorClasses.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className={`p-2 sm:p-3 rounded-lg ${colorClasses.bg}`}>
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClasses.text}`} strokeWidth={2} />
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isRefetching}
            className={`
              p-2 rounded-lg hover:bg-white/5 transition-colors
              ${isRefetching ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
            title="Rafraîchir"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-400 ${isRefetching ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        {/* Value */}
        <div className="mb-2">
          <h3 className="text-xs sm:text-sm text-gray-400 font-medium mb-1">{title}</h3>
          <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
        </div>

        {/* Change */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">{Math.abs(change)}%</span>
          </div>
          <span className="text-xs text-gray-500">vs période précédente</span>
        </div>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

/**
 * Main Component - DashboardStatsCardsOptimized
 */
const DashboardStatsCardsOptimized: React.FC = () => {
  const { data: dashboardStats, isLoading, error, refetch, isRefetching } = useDashboardStatsOptimized();

  // Mémoïser le callback de refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Mémoïser les cartes
  const statsCards: StatCardData[] = useMemo(() => {
    if (!dashboardStats) return [];

    return [
      {
        id: 'appointments-today',
        title: "Rendez-vous Aujourd'hui",
        value: dashboardStats.appointmentsToday,
        change: dashboardStats.appointmentsTodayChange,
        icon: Calendar,
        color: 'blue',
      },
      {
        id: 'patients-in-treatment',
        title: 'Patients en Traitement',
        value: `${dashboardStats.patientsInTreatment}%`,
        change: dashboardStats.patientsInTreatmentChange,
        icon: Activity,
        color: 'green',
      },
      {
        id: 'total-revenue',
        title: 'Consultations Semaine',
        value: Math.round(dashboardStats.totalRevenue / 150),
        change: dashboardStats.totalRevenueChange,
        icon: TrendingUp,
        color: 'blue',
      },
      {
        id: 'new-patients-month',
        title: 'Nouveaux Patients Ce Mois',
        value: dashboardStats.newPatientsThisMonth,
        change: dashboardStats.newPatientsThisMonthChange,
        icon: Users,
        color: 'green',
      },
    ];
  }, [dashboardStats]);

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {[...Array(4)].map((_, i) => (
          <LoadingSkeleton.StatCard key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    logger.error('Failed to load dashboard stats', error, { component: 'DashboardStatsCards' });
    return (
      <ErrorState
        title="Erreur de chargement"
        message="Impossible de charger les statistiques du tableau de bord"
        onRetry={handleRefresh}
      />
    );
  }

  // Main render
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {statsCards.map((card) => (
        <StatCard
          key={card.id}
          {...card}
          isRefetching={isRefetching}
          onRefresh={handleRefresh}
        />
      ))}
    </div>
  );
};

// Export avec display name
DashboardStatsCardsOptimized.displayName = 'DashboardStatsCardsOptimized';

export default memo(DashboardStatsCardsOptimized);
