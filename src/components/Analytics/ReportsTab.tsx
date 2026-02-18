import React, { useState, useCallback, useMemo } from 'react';
import { Download, FileText, Calendar, CheckCircle, Clock, TrendingUp, Users, Activity, BarChart3, Mail, Printer } from 'lucide-react';
import { exportData } from '../../utils/exportUtils';
import { useDynamicAnalytics, usePredictions, useAIAlerts } from '../../hooks/useAnalyticsData';

interface ReportsTabProps {
  filters: any;
  isDemoMode?: boolean;
  demoData?: any;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ filters, isDemoMode = false }) => {
  const { data: dynamicData } = useDynamicAnalytics(filters);
  const { data: predictionsData } = usePredictions();
  const { data: alertsData } = useAIAlerts();
  const [selectedReportType, setSelectedReportType] = useState('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState('2026-02');
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTemplates = [
    {
      id: 'performance',
      title: 'Rapport de Performance',
      description: 'Analyse complète des KPIs et métriques de performance',
      icon: TrendingUp,
      color: 'emerald',
      metrics: ['Patients consultés', 'Taux satisfaction', 'Temps moyen', 'Taux récupération']
    },
    {
      id: 'patients',
      title: 'Rapport Patients',
      description: 'Statistiques détaillées sur les patients et consultations',
      icon: Users,
      color: 'blue',
      metrics: ['Nouveaux patients', 'Suivis', 'Répartition âge', 'Pathologies']
    },
    {
      id: 'activity',
      title: 'Rapport d\'Activité',
      description: 'Vue d\'ensemble de toutes les activités médicales',
      icon: Activity,
      color: 'purple',
      metrics: ['Consultations', 'Urgences', 'Hospitalisations', 'Examens']
    },
    {
      id: 'analytics',
      title: 'Rapport Analytique',
      description: 'Analyses approfondies et prédictions IA',
      icon: BarChart3,
      color: 'orange',
      metrics: ['Tendances', 'Corrélations', 'Prédictions', 'Alertes']
    }
  ];

  const savedReports = [
    {
      id: 1,
      name: 'Rapport Mensuel - Janvier 2026',
      type: 'Performance',
      date: '2026-02-01',
      size: '2.4 MB',
      format: 'PDF',
      status: 'completed',
      downloads: 12
    },
    {
      id: 2,
      name: 'Statistiques Trimestrielles Q4 2025',
      type: 'Patients',
      date: '2026-01-15',
      size: '3.8 MB',
      format: 'PDF',
      status: 'completed',
      downloads: 8
    },
    {
      id: 3,
      name: 'Analyse Activité - Décembre 2025',
      type: 'Activité',
      date: '2026-01-05',
      size: '1.9 MB',
      format: 'Excel',
      status: 'completed',
      downloads: 15
    },
    {
      id: 4,
      name: 'Rapport Analytique Q1 2026',
      type: 'Analytique',
      date: '2026-02-10',
      size: '4.2 MB',
      format: 'PDF',
      status: 'pending',
      downloads: 0
    }
  ];

  const scheduledReports = [
    { name: 'Rapport Mensuel Automatique', frequency: 'Mensuel', nextRun: '2026-03-01', recipients: 3 },
    { name: 'Statistiques Hebdomadaires', frequency: 'Hebdomadaire', nextRun: '2026-02-24', recipients: 5 },
    { name: 'Analyse Trimestrielle', frequency: 'Trimestriel', nextRun: '2026-04-01', recipients: 2 }
  ];

  const reportData = useMemo(() => {
    if (isDemoMode || !dynamicData) {
      return [
        { Métrique: 'Patients consultés', Valeur: 247, Évolution: '+12%' },
        { Métrique: 'Consultations totales', Valeur: 520, Évolution: '+9.5%' },
        { Métrique: 'Satisfaction moyenne', Valeur: '4.7/5', Évolution: '+4.4%' },
        { Métrique: 'Taux récupération', Valeur: '85%', Évolution: '+4.9%' },
      ];
    }
    const kpis = dynamicData.kpis;
    const rows: Array<Record<string, string | number>> = [
      { Métrique: 'Patients consultés', Valeur: kpis.patients_consultes, Évolution: `${kpis.patients_consultes_evolution >= 0 ? '+' : ''}${kpis.patients_consultes_evolution}%` },
      { Métrique: 'RDV honorés', Valeur: `${kpis.rdv_honores}%`, Évolution: `${kpis.rdv_honores_evolution >= 0 ? '+' : ''}${kpis.rdv_honores_evolution}%` },
      { Métrique: 'Cas à risque', Valeur: kpis.cas_risque, Évolution: `${kpis.cas_risque_evolution >= 0 ? '+' : ''}${kpis.cas_risque_evolution}%` },
      { Métrique: 'RDV exceptionnels', Valeur: kpis.rdv_exceptionnels, Évolution: `${kpis.rdv_exceptionnels_evolution >= 0 ? '+' : ''}${kpis.rdv_exceptionnels_evolution}%` },
    ];
    if (predictionsData?.forecast) {
      const nextPrediction = predictionsData.forecast.find(f => f.actual == null);
      if (nextPrediction) {
        rows.push({ Métrique: 'Prédiction prochaine période', Valeur: nextPrediction.predicted, Évolution: `Confiance: ${predictionsData.confidence}%` });
      }
    }
    if (alertsData?.alerts) {
      rows.push({ Métrique: 'Alertes IA actives', Valeur: alertsData.alerts.length, Évolution: `${alertsData.alerts.filter(a => a.severity === 'critical').length} critiques` });
    }
    return rows;
  }, [isDemoMode, dynamicData, predictionsData, alertsData]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);

    setTimeout(() => {
      exportData(reportData, selectedFormat as 'csv' | 'json' | 'txt', {
        filename: `rapport_${selectedReportType}_${selectedPeriod}`,
        title: `Rapport ${selectedReportType}`,
        metadata: {
          period: selectedPeriod,
          generated: new Date().toISOString()
        }
      });

      setIsGenerating(false);
    }, 2000);
  };

  const handleDownloadReport = useCallback((report: typeof savedReports[0]) => {
    const mockData = [
      { Métrique: 'Patients consultés', Valeur: 247, Évolution: '+12%' },
      { Métrique: 'Consultations totales', Valeur: 520, Évolution: '+9.5%' },
    ];
    exportData(mockData, report.format === 'Excel' ? 'csv' : 'csv', {
      filename: report.name.replace(/\s+/g, '_'),
      title: report.name,
      metadata: { generated: report.date }
    });
  }, []);

  const handlePrintReport = useCallback((report: typeof savedReports[0]) => {
    window.print();
  }, []);

  const handleEmailReport = useCallback((report: typeof savedReports[0]) => {
    window.location.href = `mailto:?subject=${encodeURIComponent(report.name)}&body=${encodeURIComponent(`Rapport: ${report.name}\nDate: ${report.date}\nFormat: ${report.format}`)}`;
  }, []);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; icon: string; iconBg: string }> = {
      emerald: { bg: 'bg-white', border: 'border-emerald-200', icon: 'text-white', iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
      blue: { bg: 'bg-white', border: 'border-blue-200', icon: 'text-white', iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
      purple: { bg: 'bg-white', border: 'border-purple-200', icon: 'text-white', iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600' },
      orange: { bg: 'bg-white', border: 'border-orange-200', icon: 'text-white', iconBg: 'bg-gradient-to-br from-orange-500 to-red-600' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Générateur de Rapports</h2>
          <p className="text-gray-500 text-sm mt-1">Créez et gérez vos rapports analytiques</p>
        </div>
      </div>

      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTemplates.map((template) => {
          const Icon = template.icon;
          const colorClasses = getColorClasses(template.color);
          return (
            <div
              key={template.id}
              className={`${colorClasses.bg} rounded-xl border ${colorClasses.border} p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer`}
            >
              <div className={`p-3 ${colorClasses.iconBg} rounded-lg w-fit mb-4`}>
                <Icon size={24} className={colorClasses.icon} />
              </div>
              <h3 className="text-gray-800 font-semibold mb-2">{template.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{template.description}</p>
              <div className="space-y-1">
                {template.metrics.slice(0, 3).map((metric, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle size={12} className="text-emerald-500" />
                    <span>{metric}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Generate Report Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg font-semibold text-gray-800">Générer un nouveau rapport</h3>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label htmlFor="report-type" className="block text-sm text-gray-600 mb-2 font-medium">Type de rapport</label>
              <select
                id="report-type"
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                aria-label="Type de rapport"
              >
                <option value="monthly">Rapport Mensuel</option>
                <option value="quarterly">Rapport Trimestriel</option>
                <option value="annual">Rapport Annuel</option>
                <option value="custom">Personnalisé</option>
              </select>
            </div>

            <div>
              <label htmlFor="report-period" className="block text-sm text-gray-600 mb-2 font-medium">Période</label>
              <input
                id="report-period"
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                aria-label="Période du rapport"
                title="Sélectionner la période"
              />
            </div>

            <div>
              <label htmlFor="report-format" className="block text-sm text-gray-600 mb-2 font-medium">Format</label>
              <select
                id="report-format"
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                aria-label="Format d'export"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="txt">TXT</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className={`w-full px-6 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  isGenerating
                    ? 'bg-blue-400 text-white cursor-wait'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Clock size={18} className="animate-spin" />
                    <span>Génération...</span>
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    <span>Générer</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <CheckCircle size={18} className="text-blue-500" />
            <p className="text-sm text-blue-700">
              Le rapport sera généré avec les données actuelles et téléchargé automatiquement
            </p>
          </div>
        </div>
      </div>

      {/* Recent Reports and Scheduled */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Rapports Récents</h3>
              <span className="text-sm text-gray-500">{savedReports.length} rapports</span>
            </div>
          </div>

          <div className="p-5 space-y-3">
            {savedReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium mb-1">{report.name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(report.date).toLocaleDateString('fr-FR')}
                      </span>
                      <span>•</span>
                      <span>{report.size}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 bg-gray-200 rounded text-gray-600">
                        {report.format}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Download size={12} />
                        {report.downloads}
                      </span>
                    </div>
                  </div>
                  {report.status === 'completed' ? (
                    <CheckCircle size={18} className="text-emerald-500" />
                  ) : (
                    <Clock size={18} className="text-amber-500 animate-pulse" />
                  )}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                  <button
                    type="button"
                    onClick={() => handleDownloadReport(report)}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                    aria-label="Télécharger"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrintReport(report)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"
                    aria-label="Imprimer"
                  >
                    <Printer size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEmailReport(report)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"
                    aria-label="Envoyer par email"
                  >
                    <Mail size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Reports */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <h3 className="text-lg font-semibold text-gray-800">Rapports Planifiés</h3>
          </div>

          <div className="p-5 space-y-4">
            {scheduledReports.map((schedule, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-800 font-medium text-sm">{schedule.name}</p>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                    Actif
                  </span>
                </div>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>Fréquence:</span>
                    <span className="text-gray-700 font-medium">{schedule.frequency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Prochaine exécution:</span>
                    <span className="text-gray-700 font-medium">{new Date(schedule.nextRun).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Destinataires:</span>
                    <span className="text-gray-700 font-medium">{schedule.recipients} personnes</span>
                  </div>
                </div>
              </div>
            ))}

            <button type="button" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg transition-all text-sm font-medium">
              + Planifier un nouveau rapport
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-all">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg w-fit mb-3">
            <FileText size={24} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-1">24</p>
          <p className="text-sm text-gray-500">Rapports générés ce mois</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-all">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg w-fit mb-3">
            <Download size={24} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-1">156</p>
          <p className="text-sm text-gray-500">Téléchargements totaux</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-all">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg w-fit mb-3">
            <Clock size={24} className="text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-1">3</p>
          <p className="text-sm text-gray-500">Rapports planifiés actifs</p>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;
