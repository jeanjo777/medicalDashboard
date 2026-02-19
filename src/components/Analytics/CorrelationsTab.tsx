import React, { useMemo, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Area, AreaChart, ComposedChart, Bar } from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles, Target, Lightbulb, GitBranch, Activity, Zap } from 'lucide-react';
import ExportButton from '../Common/ExportButton';
import { demoCorrelations } from '../../data/demoData';
import { useCorrelations } from '../../hooks/useAnalyticsData';

interface CorrelationsTabProps {
  filters: any;
  isDemoMode?: boolean;
  demoData?: any;
}

const CorrelationsTab: React.FC<CorrelationsTabProps> = ({ filters, isDemoMode = false }) => {
  const [selectedCorrelation, setSelectedCorrelation] = useState<number>(0);
  const { data: apiData } = useCorrelations();

  const correlationData = useMemo(() => {
    if (isDemoMode) return demoCorrelations;
    return apiData || demoCorrelations;
  }, [isDemoMode, apiData]);

  const scatterData = useMemo(() => correlationData.scatterData, [correlationData]);
  const correlationPairs = useMemo(() => correlationData.correlationPairs, [correlationData]);
  const insights = useMemo(() => correlationData.insights, [correlationData]);

  // Données pour export
  const exportData = useMemo(() => correlationPairs.map(c => ({
    'Métrique 1': c.metric1,
    'Métrique 2': c.metric2,
    'Coefficient': c.coefficient,
    'Type': c.type === 'positive' ? 'Positive' : 'Négative',
    'Description': c.description,
    'Recommandation': c.insight
  })), [correlationPairs]);

  // Stats rapides
  const stats = useMemo(() => ({
    positiveCount: correlationPairs.filter(c => c.type === 'positive').length,
    negativeCount: correlationPairs.filter(c => c.type === 'negative').length,
    strongCount: correlationPairs.filter(c => Math.abs(c.coefficient) >= 0.7).length,
    avgCoefficient: (correlationPairs.reduce((acc, c) => acc + Math.abs(c.coefficient), 0) / correlationPairs.length).toFixed(2)
  }), [correlationPairs]);

  const getCorrelationStrength = (coefficient: number) => {
    const abs = Math.abs(coefficient);
    if (abs >= 0.8) return { label: 'Très forte', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (abs >= 0.6) return { label: 'Forte', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (abs >= 0.4) return { label: 'Modérée', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { label: 'Faible', color: 'theme-text-secondary', bg: 'bg-gray-100' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold theme-text-primary">Analyse des Corrélations</h2>
          <p className="theme-text-muted text-sm mt-1">Relations entre les différentes métriques</p>
        </div>
        <ExportButton
          data={exportData}
          filename="correlations-analytics"
          title="Exporter"
          metadata={{ section: 'Corrélations', type: 'analytics' }}
        />
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
              <ArrowUpRight size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs theme-text-muted">Corrélations +</p>
              <p className="text-xl font-bold text-emerald-600">{stats.positiveCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg">
              <ArrowDownRight size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs theme-text-muted">Corrélations -</p>
              <p className="text-xl font-bold text-red-600">{stats.negativeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs theme-text-muted">Fortes</p>
              <p className="text-xl font-bold text-purple-600">{stats.strongCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs theme-text-muted">Coefficient Moy.</p>
              <p className="text-xl font-bold text-blue-600">{stats.avgCoefficient}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scatter Chart */}
      <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
          <h3 className="text-lg font-semibold theme-text-primary mb-1">Corrélation: Consultations vs Satisfaction</h3>
          <p className="text-sm theme-text-muted">Coefficient de corrélation: 0.78 (forte corrélation positive)</p>
        </div>

        <div className="p-5">
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <defs>
                <linearGradient id="correlScatterGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.6}/>
                </linearGradient>
                <linearGradient id="correlScatterBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis
                type="number"
                dataKey="x"
                name="Consultations"
                stroke="var(--text-muted)"
                tick={{ fontSize: 12 }}
                label={{ value: 'Nombre de consultations', position: 'insideBottom', offset: -10, fill: 'var(--text-muted)', fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Satisfaction"
                stroke="var(--text-muted)"
                tick={{ fontSize: 12 }}
                label={{ value: 'Satisfaction (%)', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 shadow-xl">
                        <p className="theme-text-primary font-semibold mb-2">{data.name}</p>
                        <div className="space-y-1">
                          <p className="text-sm theme-text-secondary">Consultations: <span className="font-medium theme-text-primary">{data.x}</span></p>
                          <p className="text-sm theme-text-secondary">Satisfaction: <span className="font-medium theme-text-primary">{data.y}%</span></p>
                          <p className="text-sm text-emerald-600 mt-2 font-medium">Note: {data.satisfaction}/5</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={scatterData} fill="#3b82f6">
                {scatterData.map((entry, index) => (
                  <Cell
                    key={`correl-scatter-cell-${index}`}
                    fill={entry.satisfaction >= 4.7 ? 'url(#correlScatterGreen)' : 'url(#correlScatterBlue)'}
                    r={8}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 rounded-full" />
              <span className="text-sm theme-text-secondary">Satisfaction &ge; 4.7</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full" />
              <span className="text-sm theme-text-secondary">Satisfaction &lt; 4.7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Correlation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {correlationPairs.map((corr, index) => {
          const strength = getCorrelationStrength(corr.coefficient);
          return (
            <div
              key={index}
              className={`bg-[var(--bg-secondary)] rounded-xl border-2 p-5 transition-all hover:shadow-lg cursor-pointer ${
                selectedCorrelation === index
                  ? corr.type === 'positive' ? 'border-emerald-300' : 'border-red-300'
                  : 'border-gray-200 hover:border-indigo-200'
              }`}
              onClick={() => setSelectedCorrelation(index)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-lg ${corr.type === 'positive' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                      {corr.type === 'positive' ? (
                        <ArrowUpRight size={18} className="text-emerald-600" />
                      ) : (
                        <ArrowDownRight size={18} className="text-red-600" />
                      )}
                    </div>
                    <h3 className="theme-text-primary font-semibold">{corr.metric1} ↔ {corr.metric2}</h3>
                  </div>
                  <p className="text-sm theme-text-muted leading-relaxed">{corr.description}</p>
                </div>
                <div className={`
                  px-3 py-1.5 rounded-full text-sm font-bold
                  ${corr.type === 'positive' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}
                `}>
                  {corr.coefficient > 0 ? '+' : ''}{corr.coefficient}
                </div>
              </div>

              {/* Insight */}
              <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl mb-4">
                <div className="flex items-start gap-2">
                  <Lightbulb size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-indigo-600 font-semibold mb-1">Recommandation IA</p>
                    <p className="text-sm theme-text-secondary">{corr.insight}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs theme-text-muted">Force de corrélation</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${strength.bg} ${strength.color}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      corr.type === 'positive'
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                        : 'bg-gradient-to-r from-red-400 to-red-600'
                    }`}
                    style={{ width: `${Math.abs(corr.coefficient) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights Summary */}
      <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl -ml-24 -mb-24" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Sparkles size={24} className="text-yellow-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Résumé des Insights IA</h3>
              <p className="text-sm text-white/80">Actions prioritaires basées sur les corrélations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <p className={`text-3xl font-bold mb-2 ${
                  insight.type === 'positive' ? 'text-emerald-300' :
                  insight.type === 'negative' ? 'text-red-300' :
                  'text-blue-300'
                }`}>
                  {insight.value}
                </p>
                <p className="text-sm text-white/90 leading-relaxed">{insight.description}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-yellow-300" />
              <p className="text-sm font-medium text-white/90">Actions recommandées</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                Optimiser temps consultation
              </span>
              <span className="px-3 py-1.5 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                Réduire délais d'attente
              </span>
              <span className="px-3 py-1.5 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                Augmenter fréquence suivis
              </span>
              <span className="px-3 py-1.5 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                Évaluer recrutement
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Correlation Matrix */}
      <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <GitBranch size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold theme-text-primary">Matrice de Corrélation</h3>
            <p className="text-sm theme-text-muted">Vue d'ensemble des relations entre métriques</p>
          </div>
        </div>

        {(() => {
          // Build matrix from correlation pairs
          const metricSet = new Set<string>();
          correlationPairs.forEach(c => { metricSet.add(c.metric1); metricSet.add(c.metric2); });
          const metrics = Array.from(metricSet);
          const coeffMap = new Map<string, number>();
          correlationPairs.forEach(c => {
            coeffMap.set(`${c.metric1}|${c.metric2}`, c.coefficient);
            coeffMap.set(`${c.metric2}|${c.metric1}`, c.coefficient);
          });

          return (
            <div className="overflow-x-auto">
              <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))` }}>
                {metrics.map((metric, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xs theme-text-muted mb-2 truncate" title={metric}>{metric.length > 10 ? metric.slice(0, 10) + '.' : metric}</div>
                    {metrics.map((metric2, j) => {
                      const val = i === j ? 1 : (coeffMap.get(`${metric}|${metric2}`) ?? 0);
                      const intensity = Math.abs(val);
                      const isPositive = val > 0;
                      return (
                        <div
                          key={j}
                          className={`h-10 rounded-lg flex items-center justify-center text-xs font-medium mb-1 ${
                            i === j
                              ? 'bg-gray-800 text-white'
                              : val === 0
                              ? 'bg-[var(--bg-primary)] text-gray-400'
                              : isPositive
                              ? intensity > 0.6 ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-50 text-emerald-600'
                              : intensity > 0.4 ? 'bg-red-100 text-red-700' : 'bg-red-50 text-red-600'
                          }`}
                          title={`${metric} ↔ ${metric2}`}
                        >
                          {i === j ? '1.00' : val === 0 ? '—' : val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default CorrelationsTab;
