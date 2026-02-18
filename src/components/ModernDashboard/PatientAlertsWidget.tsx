/**
 * PatientAlertsWidget Component
 *
 * Displays patient alerts that require doctor attention.
 * Real-time updates via Supabase subscriptions.
 */

import React, { useState, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  Calendar,
  UserX,
  Check,
  RefreshCw,
  ChevronRight,
  User,
} from 'lucide-react';
import { usePatientAlerts, AlertPriority, AlertType, PatientAlert } from '../../hooks/usePatientAlerts';
import EmptyState from '../EmptyState';
import ErrorState from '../ErrorState';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

// Priority configuration
const getPriorityConfig = (priority: AlertPriority) => {
  const configs = {
    critical: {
      border: 'border-red-500/30',
      bg: 'bg-red-500/10',
      icon: 'text-red-400',
      badge: 'bg-red-500 text-white',
      badgeText: 'CRITIQUE',
    },
    high: {
      border: 'border-orange-500/30',
      bg: 'bg-orange-500/10',
      icon: 'text-orange-400',
      badge: 'bg-orange-500 text-white',
      badgeText: 'URGENT',
    },
    medium: {
      border: 'border-yellow-500/30',
      bg: 'bg-yellow-500/10',
      icon: 'text-yellow-400',
      badge: 'bg-yellow-500 text-black',
      badgeText: 'MOYEN',
    },
    low: {
      border: 'border-gray-500/30',
      bg: 'bg-gray-500/10',
      icon: 'text-gray-400',
      badge: 'bg-gray-500 text-white',
      badgeText: 'FAIBLE',
    },
  };
  return configs[priority];
};

const getAlertIcon = (type: AlertType) => {
  const icons = {
    high_risk_patient: AlertTriangle,
    overdue_follow_up: Clock,
    no_recent_consultation: Calendar,
    missed_appointment: UserX,
  };
  return icons[type];
};

interface AlertItemProps {
  alert: PatientAlert;
  onView: (patientId: string) => void;
  onAcknowledge: (alertId: string) => void;
}

const AlertItem = memo<AlertItemProps>(({ alert, onView, onAcknowledge }) => {
  const config = getPriorityConfig(alert.priority);
  const Icon = getAlertIcon(alert.type);

  const handleView = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onView(alert.patient_id);
  }, [alert.patient_id, onView]);

  const handleAcknowledge = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAcknowledge(alert.id);
  }, [alert.id, onAcknowledge]);

  return (
    <div
      className={`bg-[var(--bg-primary)] rounded-lg border p-3 sm:p-4 ${config.border}
                  hover:border-blue-500/50 transition-all duration-200 group`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0`}>
          <Icon size={18} className={config.icon} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="theme-text-primary font-medium text-sm truncate">{alert.title}</h4>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${config.badge}`}>
              {config.badgeText}
            </span>
          </div>
          <p className="theme-text-muted text-xs sm:text-sm mb-1 line-clamp-2">{alert.message}</p>
          <div className="flex items-center gap-1 text-xs theme-text-muted">
            <User size={12} />
            <span className="truncate">{alert.patient_name}</span>
            <span className="mx-1">-</span>
            <span className="whitespace-nowrap">
              {formatDistanceToNow(new Date(alert.created_at), {
                addSuffix: true,
                locale: fr,
              })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleView}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white
                       rounded-lg text-xs font-medium transition-colors
                       hidden sm:flex items-center gap-1 cursor-pointer"
          >
            Voir
            <ChevronRight size={14} />
          </button>
          <button
            onClick={handleAcknowledge}
            className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors theme-text-muted
                       hover:text-[var(--text-primary)] cursor-pointer"
            title="Marquer comme vu"
          >
            <Check size={16} />
          </button>
        </div>
      </div>
      <button
        onClick={handleView}
        className="w-full mt-3 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white
                   rounded-lg text-xs font-medium transition-colors
                   sm:hidden flex items-center justify-center gap-1 cursor-pointer"
      >
        Voir le patient
        <ChevronRight size={14} />
      </button>
    </div>
  );
});

AlertItem.displayName = 'AlertItem';

type FilterOption = 'all' | 'critical' | 'high' | 'medium';

const filterOptions: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'critical', label: 'Critiques' },
  { value: 'high', label: 'Urgentes' },
  { value: 'medium', label: 'Moyennes' },
];

interface PatientAlertsWidgetProps {
  compact?: boolean;
}

const PatientAlertsWidget: React.FC<PatientAlertsWidgetProps> = ({ compact = false }) => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all');
  const {
    alerts,
    alertsByPriority,
    criticalCount,
    isLoading,
    error,
    refetch,
    acknowledgeAlert,
  } = usePatientAlerts();

  const filteredAlerts = selectedFilter === 'all'
    ? alerts
    : alertsByPriority[selectedFilter as AlertPriority] || [];

  const handleViewPatient = useCallback((patientId: string) => {
    navigate(`/treatment/${patientId}`);
  }, [navigate]);

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-6">
          <div>
            <h3 className="theme-text-primary text-base sm:text-lg font-semibold mb-0.5 sm:mb-1">
              Alertes Patients
            </h3>
            <p className="theme-text-muted text-xs sm:text-sm">Chargement...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--bg-primary)] rounded-lg p-4 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/2" />
                  <div className="h-3 bg-[var(--bg-tertiary)] rounded w-3/4" />
                  <div className="h-3 bg-[var(--bg-tertiary)] rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-4 sm:mb-5 lg:mb-6">
          <h3 className="theme-text-primary text-base sm:text-lg font-semibold mb-0.5 sm:mb-1">
            Alertes Patients
          </h3>
          <p className="theme-text-muted text-xs sm:text-sm">Erreur de chargement</p>
        </div>
        <ErrorState
          type="network"
          message={error.message}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (compact) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold theme-text-primary">
            Alertes Patients
          </h3>
          <button
            onClick={() => refetch()}
            className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors theme-text-muted cursor-pointer"
            title="Actualiser"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {filteredAlerts.length === 0 ? (
          <p className="text-xs theme-text-muted py-4 text-center">
            Aucune alerte active
          </p>
        ) : (
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {filteredAlerts.slice(0, 5).map((alert) => {
              const config = getPriorityConfig(alert.priority);
              const Icon = getAlertIcon(alert.type);
              return (
                <div
                  key={alert.id}
                  onClick={() => handleViewPatient(alert.patient_id)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--bg-tertiary)] cursor-pointer transition-colors"
                >
                  <div className={`p-1.5 rounded-md ${
                    alert.priority === 'critical' ? 'bg-red-500/15' :
                    alert.priority === 'high' ? 'bg-orange-500/15' : 'bg-yellow-500/15'
                  }`}>
                    <Icon size={14} className={
                      alert.priority === 'critical' ? 'text-red-500' :
                      alert.priority === 'high' ? 'text-orange-500' : 'text-yellow-500'
                    } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium theme-text-primary truncate">{alert.patient_name}</p>
                    <p className="text-[10px] theme-text-muted truncate">{alert.title}</p>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${config.badge}`}>
                    {config.badgeText}
                  </span>
                </div>
              );
            })}
            {filteredAlerts.length > 5 && (
              <p className="text-[10px] theme-text-muted text-center py-1">
                +{filteredAlerts.length - 5} autres
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-5 lg:mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="theme-text-primary text-base sm:text-lg font-semibold mb-0.5 sm:mb-1">
              Alertes Patients
            </h3>
            <p className="theme-text-muted text-xs sm:text-sm">
              {criticalCount > 0 ? (
                <span className="text-red-400">
                  {criticalCount} alerte{criticalCount > 1 ? 's' : ''} critique{criticalCount > 1 ? 's' : ''}
                </span>
              ) : (
                'Aucune alerte critique'
              )}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors theme-text-muted hover:text-[var(--text-primary)] cursor-pointer"
            title="Actualiser"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="flex bg-[var(--bg-primary)] rounded-lg p-1 overflow-x-auto">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedFilter(option.value)}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedFilter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'theme-text-muted hover:text-[var(--text-primary)]'
              }`}
            >
              {option.label}
              {option.value !== 'all' && alertsByPriority[option.value as AlertPriority]?.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                  {alertsByPriority[option.value as AlertPriority].length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <EmptyState
          title="Aucune alerte"
          message={
            selectedFilter === 'all'
              ? "Tous vos patients sont en bonne voie. Aucune alerte n'a besoin de votre attention."
              : `Aucune alerte de niveau "${filterOptions.find(f => f.value === selectedFilter)?.label.toLowerCase()}" pour le moment.`
          }
          type="generic"
          className="py-8 sm:py-12"
        />
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {filteredAlerts.slice(0, 10).map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onView={handleViewPatient}
              onAcknowledge={acknowledgeAlert}
            />
          ))}

          {filteredAlerts.length > 10 && (
            <p className="text-center theme-text-muted text-sm py-2">
              Et {filteredAlerts.length - 10} autres alertes...
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(PatientAlertsWidget);
