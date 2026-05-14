import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Download,
  Filter,
  ChevronDown,
  BarChart3,
  Brain,
  GitBranch,
  PieChart,
  Bell,
  ArrowLeftRight,
  FileText
} from 'lucide-react';
import MedicalSidebarRefined from '../components/MedicalSidebarRefined';
import AdvancedFilters from '../components/Analytics/AdvancedFilters';
import OverviewTab from '../components/Analytics/OverviewTab';
import PredictionsTab from '../components/Analytics/PredictionsTab';
import CorrelationsTab from '../components/Analytics/CorrelationsTab';
import SegmentationTab from '../components/Analytics/SegmentationTab';
import AIAlertsTab from '../components/Analytics/AIAlertsTab';
import ComparativeTab from '../components/Analytics/ComparativeTab';
import ReportsTab from '../components/Analytics/ReportsTab';
import NotificationCenter from '../components/Common/NotificationCenter';
import ErrorBoundary from '../components/ErrorBoundary';
import logger from '../utils/logger';
import { exportData, ExportFormat, flattenData } from '../utils/exportUtils';
import { supabase } from '../lib/supabase';
import { getCurrentMedicId } from '../utils/auth';

const PAGE_CONFIG: Record<string, { title: string; subtitle: string; icon: React.ElementType; sidebarId: string }> = {
  '/analytics-advanced': { title: 'Analytics & Statistiques', subtitle: "Vue d'ensemble de l'activité et rapports détaillés", icon: BarChart3, sidebarId: 'statistics' },
  '/predictions': { title: 'Prédictions IA', subtitle: 'Analyses prédictives et tendances futures', icon: Brain, sidebarId: 'predictions' },
  '/correlations': { title: 'Corrélations', subtitle: 'Relations entre variables et indicateurs médicaux', icon: GitBranch, sidebarId: 'correlations' },
  '/segmentation': { title: 'Segmentation', subtitle: 'Répartition et classification des patients', icon: PieChart, sidebarId: 'segmentation' },
  '/ai-alerts': { title: 'Alertes IA', subtitle: 'Notifications intelligentes et détection d\'anomalies', icon: Bell, sidebarId: 'ai-alerts' },
  '/comparative': { title: 'Comparatif', subtitle: 'Comparaisons entre périodes et indicateurs', icon: ArrowLeftRight, sidebarId: 'comparative' },
  '/reports': { title: 'Rapports', subtitle: 'Génération et gestion des rapports médicaux', icon: FileText, sidebarId: 'reports' },
};

const AnalyticsPageAdvanced: React.FC = () => {
  const location = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    department: '',
    medic: '',
    pathology: '',
    severity: '',
    ageRange: [0, 100]
  });

  const pageConfig = PAGE_CONFIG[location.pathname] || PAGE_CONFIG['/analytics-advanced'];
  const PageIcon = pageConfig.icon;

  const analyticsProps = {
    filters,
  };

  const currentTab = useMemo(() => {
    switch (location.pathname) {
      case '/predictions': return 'predictions';
      case '/correlations': return 'correlations';
      case '/segmentation': return 'segmentation';
      case '/ai-alerts': return 'alerts';
      case '/comparative': return 'comparative';
      case '/reports': return 'reports';
      default: return 'overview';
    }
  }, [location.pathname]);

  const handleExport = async (format: string) => {
    logger.info(`Exporting data as ${format}`);

    // Build overview dataset from real Supabase data
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const todayStr = now.toISOString().split('T')[0]; // yyyy-MM-dd

    const [
      patientsRes,
      newPatientsRes,
      appointmentsRes,
      todayAppointmentsRes,
      completedConsultationsRes,
      analyticsStatsRes,
    ] = await Promise.all([
      supabase.from('patients').select('id', { count: 'exact', head: true }).eq('medic_id', getCurrentMedicId()!),
      supabase.from('patients').select('id', { count: 'exact', head: true }).eq('medic_id', getCurrentMedicId()!).gte('created_at', startOfThisMonth),
      supabase.from('appointments').select('id', { count: 'exact', head: true }),
      supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('appointment_date', todayStr),
      supabase.from('consultations').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('analytics_stats').select('cas_risque, rdv_honores').order('created_at', { ascending: false }).limit(1),
    ]);

    const totalPatients = patientsRes.count || 0;
    const newPatientsThisMonth = newPatientsRes.count || 0;
    const totalAppointments = appointmentsRes.count || 0;
    const todayAppointments = todayAppointmentsRes.count || 0;
    const completedConsultations = completedConsultationsRes.count || 0;
    const latestStats = analyticsStatsRes.data?.[0];
    const casRisque = latestStats?.cas_risque ?? 0;
    const rdvHonores = latestStats?.rdv_honores ?? 0;

    const overviewData = [
      { Metric: 'Total Patients', Value: totalPatients, Period: 'Actuel' },
      { Metric: 'Nouveaux patients (ce mois)', Value: newPatientsThisMonth, Period: 'Ce mois' },
      { Metric: 'Total Rendez-vous', Value: totalAppointments, Period: 'Actuel' },
      { Metric: "Rendez-vous aujourd'hui", Value: todayAppointments, Period: "Aujourd'hui" },
      { Metric: 'Consultations terminées', Value: completedConsultations, Period: 'Actuel' },
      { Metric: 'Cas à risque', Value: casRisque, Period: 'Dernier relevé' },
      { Metric: 'RDV honorés', Value: rdvHonores, Period: 'Dernier relevé' },
      { Metric: 'Onglet actif', Value: currentTab, Period: 'Actuel' },
      { Metric: 'Date export', Value: new Date().toLocaleDateString('fr-FR'), Period: 'Actuel' },
    ];

    const exportFormat = format as ExportFormat;
    const options = {
      filename: `analytics_${currentTab}`,
      title: `MediCare Pro - ${pageConfig.title}`,
      metadata: {
        tab: currentTab,
        exportedAt: new Date().toISOString(),
      },
    };

    try {
      await exportData(flattenData(overviewData), exportFormat, options);
    } catch (err: any) {
      logger.error('[AnalyticsPageAdvanced] Export error:', err);
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'predictions':
        return <PredictionsTab {...analyticsProps} />;
      case 'correlations':
        return <CorrelationsTab {...analyticsProps} />;
      case 'segmentation':
        return <SegmentationTab {...analyticsProps} />;
      case 'alerts':
        return <AIAlertsTab {...analyticsProps} />;
      case 'comparative':
        return <ComparativeTab {...analyticsProps} />;
      case 'reports':
        return <ReportsTab {...analyticsProps} />;
      default:
        return <OverviewTab {...analyticsProps} />;
    }
  };

  return (
    <div className="flex min-h-screen theme-bg-primary transition-colors duration-300">
      <MedicalSidebarRefined activeItem={pageConfig.sidebarId} onCollapsedChange={setSidebarCollapsed} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <header className="theme-bg-secondary border-b theme-border px-3 sm:px-4 md:px-6 py-3 sm:py-4 transition-colors duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="min-w-0 ml-12 lg:ml-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold theme-text-primary flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${
                  currentTab === 'overview'
                    ? 'bg-gradient-to-br from-cyan-500 to-teal-600 shadow-cyan-500/25'
                    : 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-purple-500/25'
                }`}>
                  <PageIcon size={18} className="text-white" strokeWidth={2.5} />
                </div>
                {pageConfig.title}
              </h1>
              <p className="text-xs md:text-sm theme-text-muted mt-1 truncate">
                {pageConfig.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <NotificationCenter />

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`
                  px-3 py-2 rounded-xl border transition-all flex items-center gap-2 text-sm font-medium
                  ${showFilters
                    ? 'bg-cyan-600 border-cyan-500 text-white'
                    : 'bg-[var(--bg-tertiary)] border-[var(--border-color)] theme-text-secondary hover:border-cyan-500'
                  }
                `}
              >
                <Filter size={15} />
                <span className="hidden sm:inline">Filtres</span>
                {showFilters && <span className="text-[10px] bg-cyan-400 px-1.5 py-0.5 rounded-full font-bold text-white">ON</span>}
              </button>

              <div className="relative group">
                <button type="button" className="px-3 md:px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-xl transition-all flex items-center gap-2 text-sm font-semibold shadow-lg shadow-cyan-600/25">
                  <Download size={16} />
                  <span className="hidden sm:inline">Exporter</span>
                  <ChevronDown size={14} />
                </button>

                <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button type="button" onClick={() => handleExport('csv')} className="w-full px-4 py-2.5 text-left theme-text-secondary hover:bg-[var(--bg-tertiary)] transition-colors rounded-t-xl text-sm font-medium">
                    Export CSV
                  </button>
                  <button type="button" onClick={() => handleExport('json')} className="w-full px-4 py-2.5 text-left theme-text-secondary hover:bg-[var(--bg-tertiary)] transition-colors text-sm font-medium">
                    Export JSON
                  </button>
                  <button type="button" onClick={() => handleExport('txt')} className="w-full px-4 py-2.5 text-left theme-text-secondary hover:bg-[var(--bg-tertiary)] transition-colors text-sm font-medium">
                    Export TXT
                  </button>
                  <button type="button" onClick={() => handleExport('clipboard')} className="w-full px-4 py-2.5 text-left theme-text-secondary hover:bg-[var(--bg-tertiary)] transition-colors rounded-b-xl text-sm font-medium">
                    Copier
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {showFilters && (
          <AdvancedFilters
            filters={filters}
            setFilters={setFilters}
            onClose={() => setShowFilters(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[var(--bg-primary)] transition-colors duration-300">
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsPageAdvanced;
