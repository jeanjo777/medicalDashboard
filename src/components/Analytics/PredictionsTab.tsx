import React, { useMemo } from 'react';
import { Brain, TrendingUp, TrendingDown, Minus, AlertCircle, Loader, RefreshCw, Sparkles, Target, Zap, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, RadialBarChart, RadialBar, Legend } from 'recharts';
import { usePredictions } from '../../hooks/useAnalyticsData';
import { demoPredictions } from '../../data/demoData';

interface PredictionsTabProps {
  filters: any;
  isDemoMode?: boolean;
  demoData?: any;
}

const PredictionsTab: React.FC<PredictionsTabProps> = ({ filters, isDemoMode = false }) => {
  const { data: apiData, isLoading, isError, refetch } = usePredictions(3, 'consultations');

  // Utiliser les données démo ou les données API
  const data = useMemo(() => {
    if (isDemoMode) {
      return demoPredictions;
    }
    return apiData;
  }, [isDemoMode, apiData]);

  // En mode démo, pas d'état de chargement
  if (!isDemoMode && isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Calcul des prédictions en cours...</p>
          <p className="text-xs text-gray-500 mt-2">Analyse des données historiques avec ML</p>
        </div>
      </div>
    );
  }

  // En mode démo, pas d'erreur
  if (!isDemoMode && (isError || !data)) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-gray-800 font-medium mb-2">Erreur lors du chargement des prédictions</p>
          <p className="text-gray-500 text-sm mb-4">Vérifiez votre connexion et réessayez</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 mx-auto"
            aria-label="Réessayer le chargement des prédictions"
          >
            <RefreshCw size={16} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { forecast, confidence, insights, alerts, trends, model } = data;

  // Get future predictions (where actual is null)
  const futurePredictions = forecast.filter((p: any) => p.actual == null);

  const getTrendIcon = () => {
    switch (trends.direction) {
      case 'increasing':
        return <TrendingUp size={20} className="text-emerald-400" />;
      case 'decreasing':
        return <TrendingDown size={20} className="text-red-400" />;
      default:
        return <Minus size={20} className="text-gray-400" />;
    }
  };

  const getConfidenceColor = () => {
    if (confidence >= 80) return 'text-emerald-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceLabel = () => {
    if (confidence >= 80) return 'Très haute précision';
    if (confidence >= 60) return 'Bonne précision';
    return 'Précision modérée';
  };

  const getConfidenceBgColor = () => {
    if (confidence >= 80) return 'from-emerald-500 to-teal-500';
    if (confidence >= 60) return 'from-yellow-500 to-amber-500';
    return 'from-red-500 to-orange-500';
  };

  // Données pour le graphique de confiance radial
  const confidenceRadialData = [
    { name: 'Confiance', value: confidence, fill: '#10b981' }
  ];

  // Calculer les variations prédites
  const predictedGrowth = useMemo(() => {
    if (futurePredictions.length >= 2) {
      const first = futurePredictions[0].predicted;
      const last = futurePredictions[futurePredictions.length - 1].predicted;
      return ((last - first) / first * 100).toFixed(1);
    }
    return '0';
  }, [futurePredictions]);

  return (
    <div className="space-y-6">
      {/* Mini Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Brain size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Modèle IA</p>
              <p className="text-sm font-semibold text-gray-800">ARIMA + RF</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
              <Target size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Précision</p>
              <p className={`text-sm font-semibold ${getConfidenceColor()}`}>{confidence}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Croissance prévue</p>
              <p className="text-sm font-semibold text-purple-600">+{predictedGrowth}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
              <Calendar size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Horizon</p>
              <p className="text-sm font-semibold text-gray-800">{futurePredictions.length} mois</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl -ml-24 -mb-24" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
              <Brain size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Prédictions IA Avancées
                <Sparkles size={18} className="text-yellow-300" />
              </h3>
              <p className="text-sm text-blue-100 mt-1">{model.type}</p>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs text-blue-200">Dernière mise à jour</p>
            <p className="text-sm text-white font-medium">
              {model.lastTrainedAt ? new Date(model.lastTrainedAt).toLocaleString('fr-FR') : 'En cours...'}
            </p>
          </div>
        </div>

        {/* Confidence Indicator */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getConfidenceBgColor()} rounded-full transition-all duration-1000`}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <div className="text-right">
            <p className={`text-lg font-bold ${confidence >= 80 ? 'text-emerald-300' : confidence >= 60 ? 'text-yellow-300' : 'text-red-300'}`}>
              {confidence}%
            </p>
            <p className="text-xs text-blue-200">{getConfidenceLabel()}</p>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Prévision du Flux de Patients</h3>
          <p className="text-sm text-gray-500">
            Prédiction sur les {futurePredictions.length} prochains mois avec intervalles de confiance
          </p>
        </div>

        <div className="p-6">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={forecast}>
              <defs>
                <linearGradient id="predictionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
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
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    actual: 'Réel',
                    predicted: 'Prédit',
                    upper: 'Borne haute',
                    lower: 'Borne basse',
                  };
                  return [value + ' patients', labels[name] || name];
                }}
              />
              <Area
                type="monotone"
                dataKey="upper"
                stroke="none"
                fill="url(#confidenceGradient)"
                fillOpacity={1}
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke="none"
                fill="white"
                fillOpacity={1}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#actualGradient)"
                dot={{ r: 6, fill: '#10b981', stroke: 'white', strokeWidth: 2 }}
                name="Réel"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#3b82f6"
                strokeWidth={3}
                strokeDasharray="8 4"
                dot={{ r: 5, fill: '#3b82f6', stroke: 'white', strokeWidth: 2 }}
                name="Prédit"
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-emerald-500 rounded-full" />
              <span className="text-sm text-gray-600">Données réelles</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-blue-500 rounded-full border-dashed" style={{ borderStyle: 'dashed' }} />
              <span className="text-sm text-gray-600">Prédictions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-purple-100 rounded" />
              <span className="text-sm text-gray-600">Intervalle de confiance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {futurePredictions.slice(0, 3).map((pred: any, idx: number) => {
          const colors = [
            { border: 'border-emerald-200', bg: 'from-emerald-50 to-teal-50', text: 'text-emerald-600', icon: 'bg-emerald-500' },
            { border: 'border-blue-200', bg: 'from-blue-50 to-indigo-50', text: 'text-blue-600', icon: 'bg-blue-500' },
            { border: 'border-purple-200', bg: 'from-purple-50 to-pink-50', text: 'text-purple-600', icon: 'bg-purple-500' }
          ];
          const color = colors[idx % colors.length];

          return (
            <div
              key={pred.month}
              className={`p-5 bg-gradient-to-br ${color.bg} rounded-xl border ${color.border} hover:shadow-lg transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-medium ${color.text}`}>{pred.month}</span>
                <div className={`p-1.5 ${color.icon} rounded-lg`}>
                  <Calendar size={14} className="text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {pred.predicted}
              </p>
              <p className="text-sm text-gray-500 mt-1">patients prévus</p>
              <div className="mt-3 pt-3 border-t border-gray-200/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Intervalle</span>
                  <span className={`font-medium ${color.text}`}>{pred.lower} - {pred.upper}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insights */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center gap-3">
              {getTrendIcon()}
              <h3 className="font-semibold text-gray-800">Insights IA</h3>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {insights.length > 0 ? (
              insights.map((insight: string, idx: number) => {
                const colors = ['bg-emerald-400', 'bg-blue-400', 'bg-purple-400', 'bg-amber-400'];
                return (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 ${colors[idx % colors.length]}`} />
                    <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
                  </div>
                );
              })
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl text-gray-500 text-sm">
                Aucun insight disponible pour le moment
              </div>
            )}

            {/* Trend description */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2" />
              <div>
                <p className="text-sm font-medium text-indigo-800">Tendance globale</p>
                <p className="text-xs text-indigo-600 mt-1 leading-relaxed">{trends.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-amber-500" />
              <h3 className="font-semibold text-gray-800">Alertes Préventives</h3>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert: any, idx: number) => {
                const styles = {
                  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: '⚠️' },
                  success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: '✓' },
                  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'ℹ️' }
                };
                const style = styles[alert.type as keyof typeof styles] || styles.info;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border ${style.bg} ${style.border} hover:shadow-sm transition-all`}
                  >
                    <p className={`font-medium mb-2 ${style.text} flex items-center gap-2`}>
                      <span>{style.icon}</span>
                      {alert.type === 'warning' ? 'Attention requise' : alert.type === 'success' ? 'Bonne nouvelle' : 'Information'}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">{alert.message}</p>
                  </div>
                );
              })
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-emerald-700 font-medium mb-2 flex items-center gap-2">
                  <span>✓</span> Aucune alerte
                </p>
                <p className="text-sm text-emerald-600">
                  Les prédictions sont stables et conformes aux attentes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Model Performance Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles size={18} className="text-yellow-400" />
            Performance du Modèle IA
          </h3>
          <span className="text-xs text-indigo-200">Métriques temps réel</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-xs text-indigo-200 mb-1">Type</p>
            <p className="text-sm font-medium">Ensemble ML</p>
          </div>
          <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-xs text-indigo-200 mb-1">Algorithmes</p>
            <p className="text-sm font-medium">ARIMA + RF</p>
          </div>
          <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-xs text-indigo-200 mb-1">Accuracy</p>
            <p className="text-sm font-medium text-emerald-300">{(model.accuracy * 100).toFixed(0)}%</p>
          </div>
          <div className="bg-white/15 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-xs text-indigo-200 mb-1">Horizon</p>
            <p className="text-sm font-medium">{futurePredictions.length} mois</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionsTab;
