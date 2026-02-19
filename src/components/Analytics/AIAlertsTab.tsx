import React, { useState, useMemo, useCallback } from 'react';
import {
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
  Shield,
  Users,
  Activity,
  Package,
  CheckCircle,
  XCircle,
  ChevronRight,
  Filter,
  RefreshCw,
  Sparkles,
  Zap,
  Eye,
  EyeOff,
  Building2
} from 'lucide-react';
import { demoAIAlerts, AIAlert } from '../../data/demoData';
import { useAIAlerts } from '../../hooks/useAnalyticsData';

interface AIAlertsTabProps {
  filters: any;
  isDemoMode?: boolean;
  demoData?: any;
}

const AIAlertsTab: React.FC<AIAlertsTabProps> = ({ filters, isDemoMode = false }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showReadAlerts, setShowReadAlerts] = useState(true);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [readAlertIds, setReadAlertIds] = useState<Set<string>>(new Set());
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());
  const [handledAlertIds, setHandledAlertIds] = useState<Set<string>>(new Set());

  const { data: apiAlertsData, isLoading, isError, refetch } = useAIAlerts();

  // Map API alerts to the AIAlert shape used by this component
  const rawAlerts: AIAlert[] = useMemo(() => {
    if (isDemoMode) return demoAIAlerts;
    if (!apiAlertsData?.alerts) return demoAIAlerts;

    return apiAlertsData.alerts.map((a) => {
      const categoryMap: Record<string, AIAlert['category']> = {
        risk: 'patient',
        compliance: 'quality',
        capacity: 'capacity',
        performance: 'performance',
        trend: 'resource',
      };
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        severity: (['critical', 'high', 'medium', 'low'].includes(a.severity) ? a.severity : 'low') as AIAlert['severity'],
        category: categoryMap[a.category] || 'capacity',
        timestamp: a.createdAt,
        isRead: a.acknowledged,
        actionRequired: a.severity === 'critical' || a.severity === 'high',
        recommendations: a.recommendations,
        affectedDepartments: a.affectedMetric ? [a.affectedMetric] : undefined,
        metrics: a.dataContext ? {
          current: Object.values(a.dataContext)[0] || 0,
          threshold: Object.values(a.dataContext)[1] || 100,
          trend: 'stable' as const,
        } : undefined,
      };
    });
  }, [isDemoMode, apiAlertsData]);

  // Apply local state overrides
  const alerts = useMemo(() => {
    return rawAlerts
      .filter(a => !dismissedAlertIds.has(a.id))
      .map(a => ({
        ...a,
        isRead: a.isRead || readAlertIds.has(a.id),
      }));
  }, [rawAlerts, readAlertIds, dismissedAlertIds]);

  // Filtrer les alertes
  const filteredAlerts = useMemo(() => {
    let filtered = alerts;

    if (selectedFilter !== 'all') {
      if (selectedFilter === 'unread') {
        filtered = filtered.filter(a => !a.isRead);
      } else if (selectedFilter === 'action') {
        filtered = filtered.filter(a => a.actionRequired);
      } else {
        filtered = filtered.filter(a => a.severity === selectedFilter);
      }
    }

    if (!showReadAlerts) {
      filtered = filtered.filter(a => !a.isRead);
    }

    return filtered;
  }, [alerts, selectedFilter, showReadAlerts]);

  // Stats rapides
  const stats = useMemo(() => ({
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    unread: alerts.filter(a => !a.isRead).length,
    actionRequired: alerts.filter(a => a.actionRequired).length
  }), [alerts]);

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          icon: 'bg-red-500',
          text: 'text-red-500',
          badge: 'bg-red-500/15 text-red-500 border-red-500/30',
          label: 'Critique'
        };
      case 'high':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/30',
          icon: 'bg-orange-500',
          text: 'text-orange-500',
          badge: 'bg-orange-500/15 text-orange-500 border-orange-500/30',
          label: 'Haute'
        };
      case 'medium':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          icon: 'bg-amber-500',
          text: 'text-amber-500',
          badge: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
          label: 'Moyenne'
        };
      case 'low':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          icon: 'bg-blue-500',
          text: 'text-blue-500',
          badge: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
          label: 'Faible'
        };
      default:
        return {
          bg: 'bg-[var(--bg-primary)]',
          border: 'border-[var(--border-color)]',
          icon: 'bg-gray-500',
          text: 'theme-text-secondary',
          badge: 'bg-[var(--bg-tertiary)] theme-text-secondary border-[var(--border-color)]',
          label: 'Info'
        };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'capacity': return Building2;
      case 'performance': return Activity;
      case 'patient': return Users;
      case 'resource': return Package;
      case 'quality': return Shield;
      default: return Bell;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'capacity': return 'Capacité';
      case 'performance': return 'Performance';
      case 'patient': return 'Patient';
      case 'resource': return 'Ressources';
      case 'quality': return 'Qualité';
      default: return 'Général';
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp size={14} className="text-red-500" />;
      case 'down': return <TrendingDown size={14} className="text-emerald-500" />;
      default: return <Minus size={14} className="text-gray-400" />;
    }
  };

  const handleMarkAsRead = useCallback((alertId: string) => {
    setReadAlertIds(prev => new Set(prev).add(alertId));
  }, []);

  const handleDismiss = useCallback((alertId: string) => {
    setDismissedAlertIds(prev => new Set(prev).add(alertId));
    setExpandedAlert(null);
  }, []);

  const handleTakeCharge = useCallback((alertId: string) => {
    setHandledAlertIds(prev => new Set(prev).add(alertId));
    setReadAlertIds(prev => new Set(prev).add(alertId));
  }, []);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${diffDays}j`;
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Bell size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs theme-text-muted">Total Alertes</p>
              <p className="text-xl font-bold theme-text-primary">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-red-500/20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg">
              <AlertTriangle size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs theme-text-muted">Critiques</p>
              <p className="text-xl font-bold text-red-600">{stats.critical}</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-orange-500/20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs theme-text-muted">Priorité haute</p>
              <p className="text-xl font-bold text-orange-600">{stats.high}</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-blue-500/20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Eye size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs theme-text-muted">Non lues</p>
              <p className="text-xl font-bold text-blue-600">{stats.unread}</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-purple-500/20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <CheckCircle size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs theme-text-muted">Actions requises</p>
              <p className="text-xl font-bold text-purple-600">{stats.actionRequired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={16} className="text-gray-400" />
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedFilter === 'all'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-[var(--bg-tertiary)] theme-text-secondary hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              Toutes ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('critical')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedFilter === 'critical'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
              }`}
            >
              Critiques ({stats.critical})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('high')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedFilter === 'high'
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'
              }`}
            >
              Hautes ({stats.high})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('unread')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedFilter === 'unread'
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
              }`}
            >
              Non lues ({stats.unread})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('action')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedFilter === 'action'
                  ? 'bg-purple-500 text-white'
                  : 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
              }`}
            >
              Actions ({stats.actionRequired})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowReadAlerts(!showReadAlerts)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                showReadAlerts ? 'bg-[var(--bg-tertiary)] theme-text-secondary' : 'bg-indigo-500/10 text-indigo-500'
              }`}
            >
              {showReadAlerts ? <Eye size={14} /> : <EyeOff size={14} />}
              {showReadAlerts ? 'Masquer lues' : 'Afficher lues'}
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                isLoading ? 'bg-blue-500/10 text-blue-500' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] theme-text-secondary'
              }`}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              {isLoading ? 'Chargement...' : 'Actualiser'}
            </button>
          </div>
        </div>
      </div>

      {/* Liste des alertes */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-[var(--bg-secondary)] rounded-2xl p-12 text-center border border-[var(--border-color)]">
            <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold theme-text-primary mb-2">Aucune alerte</h3>
            <p className="theme-text-muted text-sm">Toutes les alertes ont été traitées ou filtrées.</p>
          </div>
        ) : (
          filteredAlerts.map((alert: AIAlert) => {
            const config = getSeverityConfig(alert.severity);
            const CategoryIcon = getCategoryIcon(alert.category);
            const isExpanded = expandedAlert === alert.id;

            return (
              <div
                key={alert.id}
                className={`bg-[var(--bg-secondary)] rounded-xl border ${config.border} overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  !alert.isRead ? 'ring-2 ring-indigo-500/20' : ''
                }`}
              >
                {/* Header de l'alerte */}
                <div className={`p-5 ${config.bg}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 ${config.icon} rounded-xl shadow-lg`}>
                      <AlertTriangle size={24} className="text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {!alert.isRead && (
                              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                            )}
                            <h3 className="font-semibold text-[var(--text-primary)]">{alert.title}</h3>
                          </div>
                          <p className="text-sm theme-text-secondary mb-3">{alert.description}</p>

                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${config.badge}`}>
                              {config.label}
                            </span>
                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-tertiary)] rounded-full text-xs theme-text-secondary">
                              <CategoryIcon size={12} />
                              {getCategoryLabel(alert.category)}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs theme-text-muted">
                              <Clock size={12} />
                              {formatTimeAgo(alert.timestamp)}
                            </span>
                            {alert.actionRequired && (
                              <span className="flex items-center gap-1 px-2.5 py-1 bg-purple-500/10 text-purple-500 rounded-full text-xs font-medium">
                                <Zap size={12} />
                                Action requise
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                          className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-all"
                          aria-label={isExpanded ? 'Réduire les détails' : 'Voir les détails'}
                        >
                          <ChevronRight
                            size={20}
                            className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenu étendu */}
                {isExpanded && (
                  <div className="p-5 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Métriques */}
                      {alert.metrics && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold theme-text-primary flex items-center gap-2">
                            <Activity size={14} className="text-indigo-500" />
                            Métriques
                          </h4>
                          <div className="bg-[var(--bg-primary)] rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm theme-text-secondary">Valeur actuelle</span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold theme-text-primary">{alert.metrics.current}</span>
                                {getTrendIcon(alert.metrics.trend)}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm theme-text-secondary">Seuil d'alerte</span>
                              <span className="text-lg font-bold text-red-500">{alert.metrics.threshold}</span>
                            </div>
                            <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  alert.metrics.current > alert.metrics.threshold ? 'bg-red-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min((alert.metrics.current / alert.metrics.threshold) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Départements affectés */}
                      {alert.affectedDepartments && alert.affectedDepartments.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold theme-text-primary flex items-center gap-2">
                            <Building2 size={14} className="text-indigo-500" />
                            Départements concernés
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {alert.affectedDepartments.map((dept, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg text-sm font-medium"
                              >
                                {dept}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommandations */}
                      {alert.recommendations && alert.recommendations.length > 0 && (
                        <div className="md:col-span-2 space-y-3">
                          <h4 className="text-sm font-semibold theme-text-primary flex items-center gap-2">
                            <Sparkles size={14} className="text-indigo-500" />
                            Recommandations IA
                          </h4>
                          <div className="space-y-2">
                            {alert.recommendations.map((rec, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-3 p-3 bg-[var(--bg-primary)] rounded-lg border border-indigo-500/20"
                              >
                                <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                  {idx + 1}
                                </div>
                                <p className="text-sm theme-text-secondary">{rec}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[var(--border-color)]">
                      <button
                        type="button"
                        onClick={() => handleTakeCharge(alert.id)}
                        disabled={handledAlertIds.has(alert.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          handledAlertIds.has(alert.id)
                            ? 'bg-emerald-500/10 text-emerald-500 cursor-default'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25'
                        }`}
                      >
                        {handledAlertIds.has(alert.id) ? 'Prise en charge' : 'Prendre en charge'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(alert.id)}
                        disabled={alert.isRead}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          alert.isRead ? 'bg-[var(--bg-primary)] text-gray-400 cursor-default' : 'bg-[var(--bg-tertiary)] theme-text-secondary hover:bg-[var(--bg-tertiary)]'
                        }`}
                      >
                        {alert.isRead ? 'Lu' : 'Marquer comme lu'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDismiss(alert.id)}
                        className="px-4 py-2 theme-text-muted hover:text-red-600 text-sm transition-all"
                      >
                        Ignorer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer avec infos IA */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={20} className="text-yellow-400" />
          <h3 className="font-semibold">Système d'Alertes IA</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-xs text-indigo-200 mb-1">Modèle</p>
            <p className="text-sm font-medium">Détection anomalies</p>
          </div>
          <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-xs text-indigo-200 mb-1">Précision</p>
            <p className="text-sm font-medium text-emerald-300">94.2%</p>
          </div>
          <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-xs text-indigo-200 mb-1">Sources analysées</p>
            <p className="text-sm font-medium">12 flux</p>
          </div>
          <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-xs text-indigo-200 mb-1">Actualisation</p>
            <p className="text-sm font-medium">Temps réel</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAlertsTab;
