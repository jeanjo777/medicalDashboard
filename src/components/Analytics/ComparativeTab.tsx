import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Minus, ArrowRight, Sparkles, Target, CheckCircle, AlertTriangle, Lightbulb, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import ExportButton from '../Common/ExportButton';
import { demoComparative, demoComparativeByType } from '../../data/demoData';
import { useComparative } from '../../hooks/useAnalyticsData';

interface ComparativeTabProps {
  filters: any;
  isDemoMode?: boolean;
  demoData?: any;
}

const ComparativeTab: React.FC<ComparativeTabProps> = ({ filters, isDemoMode = false }) => {
  const [comparisonType, setComparisonType] = useState<'month' | 'quarter' | 'year'>('month');
  const { data: apiData, isLoading, isError, refetch } = useComparative(comparisonType);

  const compareData = useMemo(() => {
    if (isDemoMode) return demoComparativeByType[comparisonType] || demoComparative;
    return apiData || demoComparativeByType[comparisonType] || demoComparative;
  }, [isDemoMode, apiData, comparisonType]);

  if (!isDemoMode && isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
          <p className="theme-text-secondary">Chargement de l'analyse comparative...</p>
          <p className="text-xs theme-text-muted mt-2">Comparaison des périodes en cours</p>
        </div>
      </div>
    );
  }

  if (!isDemoMode && isError && !apiData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <p className="theme-text-primary font-medium mb-2">Erreur lors du chargement des données comparatives</p>
          <p className="theme-text-muted text-sm mb-4">Vérifiez votre connexion et réessayez</p>
          <button type="button" onClick={() => refetch()} className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 mx-auto">
            <RefreshCw size={16} /> Réessayer
          </button>
        </div>
      </div>
    );
  }

  const { periods, kpiComparison, timeSeriesComparison, departmentComparison, insights } = compareData;

  // Period labels come directly from data now
  const periodLabel = useMemo(() => {
    return { current: periods.current, previous: periods.previous };
  }, [periods]);

  // Compute summary stats from timeSeriesComparison instead of hardcoded values
  const summaryStats = useMemo(() => {
    if (!timeSeriesComparison || timeSeriesComparison.length === 0) {
      return { avgGrowth: 0, targetGap: 0, consecutivePositive: 0 };
    }
    const totalGrowth = timeSeriesComparison.reduce((sum: number, item: any) => {
      if (item.previous > 0) return sum + ((item.current - item.previous) / item.previous) * 100;
      return sum;
    }, 0);
    const avgGrowth = totalGrowth / timeSeriesComparison.length;

    const totalTargetGap = timeSeriesComparison.reduce((sum: number, item: any) => {
      if (item.target > 0) return sum + ((item.current - item.target) / item.target) * 100;
      return sum;
    }, 0);
    const targetGap = totalTargetGap / timeSeriesComparison.length;

    let consecutive = 0;
    for (let i = timeSeriesComparison.length - 1; i >= 0; i--) {
      if (timeSeriesComparison[i].current > timeSeriesComparison[i].previous) consecutive++;
      else break;
    }

    return { avgGrowth, targetGap, consecutivePositive: consecutive };
  }, [timeSeriesComparison]);

  // Export data
  const exportData = useMemo(() => kpiComparison.map(item => ({
    'Métrique': item.metric,
    'Période Actuelle': item.current,
    'Période Précédente': item.previous,
    'Variation (%)': item.change
  })), [kpiComparison]);

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp size={18} className="text-emerald-500" />;
    if (trend === 'down') return <TrendingDown size={18} className="text-red-500" />;
    return <Minus size={18} className="theme-text-muted" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-emerald-600';
    if (change < 0) return 'text-red-600';
    return 'theme-text-muted';
  };

  const getTrendBg = (change: number) => {
    if (change > 0) return 'bg-emerald-100';
    if (change < 0) return 'bg-red-100';
    return 'bg-gray-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold theme-text-primary">Analyse Comparative</h2>
          <p className="theme-text-muted text-sm mt-1">{periodLabel.current} vs {periodLabel.previous}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[var(--bg-tertiary)] rounded-xl p-1">
            {(['month', 'quarter', 'year'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setComparisonType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  comparisonType === type
                    ? 'bg-[var(--bg-secondary)] theme-text-primary shadow-sm'
                    : 'theme-text-muted hover:theme-text-secondary'
                }`}
              >
                {type === 'month' ? 'Mois' : type === 'quarter' ? 'Trimestre' : 'Année'}
              </button>
            ))}
          </div>
          <ExportButton
            data={exportData}
            filename="analyse-comparative"
            title="Exporter"
            metadata={{ section: 'Comparatif', type: 'analytics' }}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiComparison.map((kpi, index) => (
          <div key={index} className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <p className="theme-text-muted text-sm font-medium">{kpi.metric}</p>
              {getTrendIcon(kpi.trend)}
            </div>
            <p className="text-2xl font-bold theme-text-primary mb-1">{kpi.current}{kpi.unit}</p>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${getTrendBg(kpi.change)} ${getTrendColor(kpi.change)}`}>
                {kpi.change > 0 ? '+' : ''}{kpi.change}%
              </span>
              <span className="text-xs theme-text-muted">vs {kpi.previous}{kpi.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Evolution Chart */}
      <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
          <h3 className="text-lg font-semibold theme-text-primary mb-1">Évolution Comparative</h3>
          <p className="text-sm theme-text-muted">Comparaison période actuelle vs période précédente</p>
        </div>

        <div className="p-5">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={timeSeriesComparison}>
              <defs>
                <linearGradient id="compareCurrentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  color: 'var(--text-primary)'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="current"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#compareCurrentGradient)"
                name="Période actuelle"
                dot={{ r: 5, fill: '#3b82f6', stroke: 'white', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="previous"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: '#94a3b8' }}
                name="Période précédente"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ r: 3, fill: '#10b981' }}
                name="Objectif"
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--border-color)]">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="text-xs text-emerald-600 font-medium mb-1">Croissance moyenne</p>
              <p className="text-2xl font-bold text-emerald-700">{summaryStats.avgGrowth > 0 ? '+' : ''}{summaryStats.avgGrowth.toFixed(1)}%</p>
              <p className="text-xs text-emerald-600 mt-1">vs période précédente</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-xs text-blue-600 font-medium mb-1">Écart à l'objectif</p>
              <p className="text-2xl font-bold text-blue-700">{summaryStats.targetGap > 0 ? '+' : ''}{summaryStats.targetGap.toFixed(1)}%</p>
              <p className="text-xs text-blue-600 mt-1">{summaryStats.targetGap >= 0 ? 'Au-dessus de la cible' : 'En-dessous de la cible'}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-xs text-purple-600 font-medium mb-1">Tendance</p>
              <p className="text-2xl font-bold text-purple-700">{summaryStats.avgGrowth > 0 ? 'Positive' : summaryStats.avgGrowth < 0 ? 'Négative' : 'Stable'}</p>
              <p className="text-xs text-purple-600 mt-1">{summaryStats.consecutivePositive} semaines consécutives</p>
            </div>
          </div>
        </div>
      </div>

      {/* Department Comparison */}
      <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
          <h3 className="text-lg font-semibold theme-text-primary mb-1">Comparaison par Département</h3>
          <p className="text-sm theme-text-muted">Évolution du nombre de patients par service</p>
        </div>

        <div className="p-5">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentComparison} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="department" width={130} stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  color: 'var(--text-primary)'
                }}
              />
              <Legend />
              <Bar dataKey="current" fill="#3b82f6" name="Actuel" radius={[0, 4, 4, 0]} />
              <Bar dataKey="previous" fill="#cbd5e1" name="Précédent" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {departmentComparison.map((dept, index) => (
              <div key={index} className="p-3 bg-[var(--bg-primary)] rounded-xl text-center hover:bg-[var(--bg-tertiary)] transition-colors">
                <p className="text-xs theme-text-muted mb-1 truncate" title={dept.department}>{dept.department}</p>
                <p className="text-lg font-bold theme-text-primary">{dept.current}</p>
                <p className={`text-xs font-medium ${getTrendColor(dept.diff)}`}>
                  {dept.diff > 0 ? '+' : ''}{dept.diff}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl -ml-24 -mb-24" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Sparkles size={24} className="text-yellow-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Insights Comparatifs IA</h3>
              <p className="text-sm text-white/80">Analyse des tendances et recommandations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Positive */}
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={18} className="text-emerald-300" />
                <p className="text-emerald-300 font-semibold">Tendances Positives</p>
              </div>
              <ul className="space-y-2">
                {insights.positive.map((item, i) => (
                  <li key={i} className="text-sm text-white/90 flex items-start gap-2">
                    <span className="text-emerald-300 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Stable */}
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="flex items-center gap-2 mb-3">
                <Target size={18} className="text-blue-300" />
                <p className="text-blue-300 font-semibold">Performance Stable</p>
              </div>
              <ul className="space-y-2">
                {insights.stable.map((item, i) => (
                  <li key={i} className="text-sm text-white/90 flex items-start gap-2">
                    <span className="text-blue-300 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Attention */}
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={18} className="text-amber-300" />
                <p className="text-amber-300 font-semibold">Points d'Attention</p>
              </div>
              <ul className="space-y-2">
                {insights.attention.map((item, i) => (
                  <li key={i} className="text-sm text-white/90 flex items-start gap-2">
                    <span className="text-amber-300 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparativeTab;
