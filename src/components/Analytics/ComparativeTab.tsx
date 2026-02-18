import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Minus, ArrowRight, Sparkles, Target, CheckCircle, AlertTriangle, Lightbulb, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import ExportButton from '../Common/ExportButton';
import { demoComparative } from '../../data/demoData';
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
    if (isDemoMode) return demoComparative;
    return apiData || demoComparative;
  }, [isDemoMode, apiData]);

  if (!isDemoMode && isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Chargement de l'analyse comparative...</p>
          <p className="text-xs text-gray-500 mt-2">Comparaison des périodes en cours</p>
        </div>
      </div>
    );
  }

  if (!isDemoMode && isError && !apiData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-gray-800 font-medium mb-2">Erreur lors du chargement des données comparatives</p>
          <p className="text-gray-500 text-sm mb-4">Vérifiez votre connexion et réessayez</p>
          <button type="button" onClick={() => refetch()} className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 mx-auto">
            <RefreshCw size={16} /> Réessayer
          </button>
        </div>
      </div>
    );
  }

  const { periods, kpiComparison, timeSeriesComparison, departmentComparison, insights } = compareData;

  // Compute period labels based on selector
  const periodLabel = useMemo(() => {
    switch (comparisonType) {
      case 'month': return { current: periods.current, previous: periods.previous };
      case 'quarter': return { current: 'T1 2026', previous: 'T4 2025' };
      case 'year': return { current: '2026', previous: '2025' };
    }
  }, [comparisonType, periods]);

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
    return <Minus size={18} className="text-gray-400" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-emerald-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
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
          <h2 className="text-xl font-bold text-gray-800">Analyse Comparative</h2>
          <p className="text-gray-500 text-sm mt-1">{periodLabel.current} vs {periodLabel.previous}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {(['month', 'quarter', 'year'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setComparisonType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  comparisonType === type
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
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
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <p className="text-gray-500 text-sm font-medium">{kpi.metric}</p>
              {getTrendIcon(kpi.trend)}
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-1">{kpi.current}{kpi.unit}</p>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${getTrendBg(kpi.change)} ${getTrendColor(kpi.change)}`}>
                {kpi.change > 0 ? '+' : ''}{kpi.change}%
              </span>
              <span className="text-xs text-gray-400">vs {kpi.previous}{kpi.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Evolution Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Évolution Comparative</h3>
          <p className="text-sm text-gray-500">Comparaison période actuelle vs période précédente</p>
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
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
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
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Comparaison par Département</h3>
          <p className="text-sm text-gray-500">Évolution du nombre de patients par service</p>
        </div>

        <div className="p-5">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentComparison} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="department" width={130} stroke="#6b7280" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="current" fill="#3b82f6" name="Actuel" radius={[0, 4, 4, 0]} />
              <Bar dataKey="previous" fill="#cbd5e1" name="Précédent" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {departmentComparison.map((dept, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors">
                <p className="text-xs text-gray-500 mb-1 truncate" title={dept.department}>{dept.department}</p>
                <p className="text-lg font-bold text-gray-800">{dept.current}</p>
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
