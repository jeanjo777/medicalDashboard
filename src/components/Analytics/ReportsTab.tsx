import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Download, FileText, Calendar, CheckCircle, Clock, TrendingUp, Users, Activity, BarChart3, Mail, Printer } from 'lucide-react';
import { exportData } from '../../utils/exportUtils';
import { useDynamicAnalytics, usePredictions, useAIAlerts } from '../../hooks/useAnalyticsData';
import { supabase } from '../../lib/supabase';
import { getCurrentMedicId } from '../../utils/auth';
import { generateReportPDF, type ReportData } from '../../utils/reportPdfGenerator';

interface ReportsTabProps {
  filters: any;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ filters }) => {
  const { data: dynamicData } = useDynamicAnalytics(filters);
  const { data: predictionsData } = usePredictions();
  const { data: alertsData } = useAIAlerts();
  const [selectedReportType, setSelectedReportType] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState(() => Math.ceil((new Date().getMonth() + 1) / 3));
  const selectedPeriod = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [isGenerating, setIsGenerating] = useState(false);
  const generateFormRef = useRef<HTMLDivElement>(null);

  const scrollToGenerateForm = () => {
    generateFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleTemplateClick = (templateId: string) => {
    setSelectedReportType(templateId);
    scrollToGenerateForm();
  };

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

  const savedReports: { id: number; name: string; type: string; date: string; size: string; format: string; status: string; downloads: number }[] = [];
  const scheduledReports: { name: string; frequency: string; nextRun: string; recipients: number }[] = [];

  const reportData = useMemo(() => {
    if (!dynamicData) {
      return [];
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
  }, [dynamicData, predictionsData, alertsData]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);

    if (selectedFormat === 'pdf') {
      try {
        const medicId = getCurrentMedicId();
        const [year, month] = selectedPeriod.split('-');
        const startDate = `${year}-${month}-01`;
        const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];

        // Fetch patients
        const { data: patients } = await supabase
          .from('patients')
          .select('name, date_of_birth, gender, status, created_at, primary_pathology')
          .eq('medic_id', medicId!)
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59');

        // Fetch all patients for totals
        const { data: allPatients } = await supabase
          .from('patients')
          .select('status, gender')
          .eq('medic_id', medicId!);

        // Fetch appointments
        const { data: appointments } = await supabase
          .from('appointments')
          .select('patient_name, appointment_date, appointment_time, status, type_consultation')
          .eq('medic_id', medicId!)
          .gte('appointment_date', startDate)
          .lte('appointment_date', endDate)
          .order('appointment_date', { ascending: true });

        // Fetch consultations count
        const { count: consultCount } = await supabase
          .from('consultations')
          .select('id', { count: 'exact', head: true })
          .eq('medic_id', medicId!)
          .gte('created_at', startDate);

        const all = allPatients || [];
        const appts = appointments || [];

        const reportData: ReportData = {
          period: selectedPeriod,
          reportType: selectedReportType,
          stats: {
            totalPatients: all.length,
            newPatients: (patients || []).length,
            activePatients: all.filter(p => p.status === 'active').length,
            inTreatment: all.filter(p => p.status === 'in_treatment').length,
            recovered: all.filter(p => p.status === 'recovered').length,
            totalAppointments: appts.length,
            completedAppointments: appts.filter(a => a.status === 'termine').length,
            cancelledAppointments: appts.filter(a => a.status === 'annule').length,
            pendingAppointments: appts.filter(a => a.status === 'a_venir').length,
            totalConsultations: consultCount || 0,
            maleCount: all.filter(p => p.gender === 'male' || p.gender === 'M').length,
            femaleCount: all.filter(p => p.gender === 'female' || p.gender === 'F').length,
          },
          patients: (patients || []).map(p => ({ ...p, name: p.name || '', date_of_birth: p.date_of_birth || '', gender: p.gender || '', status: p.status || '', created_at: p.created_at || '', primary_pathology: p.primary_pathology || '' })),
          appointments: appts.map(a => ({ ...a, patient_name: a.patient_name || '', appointment_date: a.appointment_date || '', appointment_time: a.appointment_time || '', status: a.status || '', type_consultation: a.type_consultation || '' })),
        };

        generateReportPDF(reportData);
      } catch (err) {
        // Fallback: generate with minimal data
        generateReportPDF({
          period: selectedPeriod,
          reportType: selectedReportType,
          stats: { totalPatients: 0, newPatients: 0, activePatients: 0, inTreatment: 0, recovered: 0, totalAppointments: 0, completedAppointments: 0, cancelledAppointments: 0, pendingAppointments: 0, totalConsultations: 0, maleCount: 0, femaleCount: 0 },
          patients: [],
          appointments: [],
        });
      }
      setIsGenerating(false);
    } else {
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
    }
  };

  const handleDownloadReport = useCallback((report: typeof savedReports[0]) => {
    // Re-export with the same data that was generated
    const reportData = [
      { Métrique: 'Rapport', Valeur: report.name, Période: report.date },
      { Métrique: 'Format', Valeur: report.format, Période: 'Généré automatiquement' },
    ];
    exportData(reportData, report.format === 'Excel' ? 'csv' : 'csv', {
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
      emerald: { bg: 'bg-[var(--bg-secondary)]', border: 'border-emerald-500/20', icon: 'text-white', iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
      blue: { bg: 'bg-[var(--bg-secondary)]', border: 'border-blue-500/20', icon: 'text-white', iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
      purple: { bg: 'bg-[var(--bg-secondary)]', border: 'border-purple-500/20', icon: 'text-white', iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600' },
      orange: { bg: 'bg-[var(--bg-secondary)]', border: 'border-orange-500/20', icon: 'text-white', iconBg: 'bg-gradient-to-br from-orange-500 to-red-600' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold theme-text-primary">Générateur de Rapports</h2>
          <p className="theme-text-muted text-sm mt-1">Créez et gérez vos rapports analytiques</p>
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
              onClick={() => handleTemplateClick(template.id)}
              className={`${colorClasses.bg} rounded-xl border ${colorClasses.border} p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer ${
                selectedReportType === template.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
            >
              <div className={`p-3 ${colorClasses.iconBg} rounded-lg w-fit mb-4`}>
                <Icon size={24} className={colorClasses.icon} />
              </div>
              <h3 className="theme-text-primary font-semibold mb-2">{template.title}</h3>
              <p className="text-sm theme-text-muted mb-4">{template.description}</p>
              <div className="space-y-1">
                {template.metrics.slice(0, 3).map((metric, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs theme-text-muted">
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
      <div ref={generateFormRef} className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
          <h3 className="text-lg font-semibold theme-text-primary">Générer un nouveau rapport</h3>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label htmlFor="report-type" className="block text-sm theme-text-secondary mb-2 font-medium">Type de rapport</label>
              <select
                id="report-type"
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                aria-label="Type de rapport"
              >
                <option value="monthly">Rapport Mensuel</option>
                <option value="quarterly">Rapport Trimestriel</option>
                <option value="annual">Rapport Annuel</option>
                <option value="custom">Personnalisé</option>
                <option value="performance">Rapport de Performance</option>
                <option value="patients">Rapport Patients</option>
                <option value="activity">Rapport d'Activité</option>
                <option value="analytics">Rapport Analytique</option>
              </select>
            </div>

            <div>
              <label className="block text-sm theme-text-secondary mb-2 font-medium">Période</label>
              <div className="flex gap-2">
                {/* Mensuel / Performance / Patients / Activity / Analytics / Custom → Mois + Année */}
                {!['quarterly', 'annual'].includes(selectedReportType) && (
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="flex-1 px-3 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                    aria-label="Mois"
                    title="Mois"
                  >
                    {['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'].map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                )}

                {/* Trimestriel → Trimestre + Année */}
                {selectedReportType === 'quarterly' && (
                  <select
                    value={selectedQuarter}
                    onChange={(e) => { setSelectedQuarter(parseInt(e.target.value)); setSelectedMonth((parseInt(e.target.value) - 1) * 3 + 1); }}
                    className="flex-1 px-3 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                    aria-label="Trimestre"
                    title="Trimestre"
                  >
                    <option value={1}>T1 (Jan – Mar)</option>
                    <option value={2}>T2 (Avr – Juin)</option>
                    <option value={3}>T3 (Juil – Sep)</option>
                    <option value={4}>T4 (Oct – Déc)</option>
                  </select>
                )}

                {/* Année — toujours visible */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className={`${selectedReportType === 'annual' ? 'flex-1' : 'w-24'} px-3 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all`}
                  aria-label="Année"
                  title="Année"
                >
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="report-format" className="block text-sm theme-text-secondary mb-2 font-medium">Format</label>
              <select
                id="report-format"
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                aria-label="Format d'export"
              >
                <option value="pdf">PDF (Rapport SIFCA)</option>
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

          <div className="flex items-center gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <CheckCircle size={18} className="text-blue-500" />
            <p className="text-sm text-blue-500">
              Le rapport sera généré avec les données actuelles et téléchargé automatiquement
            </p>
          </div>
        </div>
      </div>

      {/* Recent Reports and Scheduled */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports */}
        <div className="lg:col-span-2 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold theme-text-primary">Rapports Récents</h3>
              <span className="text-sm theme-text-muted">{savedReports.length} rapports</span>
            </div>
          </div>

          <div className="p-5 space-y-3">
            {savedReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <FileText size={20} className="text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="theme-text-primary font-medium mb-1">{report.name}</p>
                    <div className="flex items-center gap-3 text-xs theme-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(report.date).toLocaleDateString('fr-FR')}
                      </span>
                      <span>•</span>
                      <span>{report.size}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 bg-[var(--bg-tertiary)] rounded theme-text-secondary">
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
                    className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors text-blue-500"
                    aria-label="Télécharger"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrintReport(report)}
                    className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors theme-text-muted"
                    aria-label="Imprimer"
                  >
                    <Printer size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEmailReport(report)}
                    className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors theme-text-muted"
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
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
            <h3 className="text-lg font-semibold theme-text-primary">Rapports Planifiés</h3>
          </div>

          <div className="p-5 space-y-4">
            {scheduledReports.map((schedule, index) => (
              <div key={index} className="p-4 bg-[var(--bg-primary)] rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <p className="theme-text-primary font-medium text-sm">{schedule.name}</p>
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-xs rounded-full font-medium">
                    Actif
                  </span>
                </div>
                <div className="space-y-2 text-xs theme-text-muted">
                  <div className="flex items-center justify-between">
                    <span>Fréquence:</span>
                    <span className="theme-text-secondary font-medium">{schedule.frequency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Prochaine exécution:</span>
                    <span className="theme-text-secondary font-medium">{new Date(schedule.nextRun).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Destinataires:</span>
                    <span className="theme-text-secondary font-medium">{schedule.recipients} personnes</span>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                scrollToGenerateForm();
              }}
              className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-blue-500/30 hover:bg-blue-500/10 theme-text-secondary hover:text-blue-500 rounded-lg transition-all text-sm font-medium cursor-pointer"
            >
              + Planifier un nouveau rapport
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] shadow-sm p-5 hover:shadow-md transition-all">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg w-fit mb-3">
            <FileText size={24} className="text-white" />
          </div>
          <p className="text-2xl font-bold theme-text-primary mb-1">{savedReports.length}</p>
          <p className="text-sm theme-text-muted">Rapports générés ce mois</p>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] shadow-sm p-5 hover:shadow-md transition-all">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg w-fit mb-3">
            <Download size={24} className="text-white" />
          </div>
          <p className="text-2xl font-bold theme-text-primary mb-1">{savedReports.reduce((sum, r) => sum + r.downloads, 0)}</p>
          <p className="text-sm theme-text-muted">Téléchargements totaux</p>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] shadow-sm p-5 hover:shadow-md transition-all">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg w-fit mb-3">
            <Clock size={24} className="text-white" />
          </div>
          <p className="text-2xl font-bold theme-text-primary mb-1">{scheduledReports.length}</p>
          <p className="text-sm theme-text-muted">Rapports planifiés actifs</p>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;
