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
import KPICards from '../components/Analytics/KPICards';
import NotificationCenter from '../components/Common/NotificationCenter';
import DemoModeToggle, { DemoModeBanner } from '../components/Common/DemoModeToggle';
import { useDemoMode } from '../hooks/useDemoMode';
import { demoAnalyticsData, demoChartData } from '../data/demoData';
import ErrorBoundary from '../components/ErrorBoundary';
import logger from '../utils/logger';

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
  const { isDemoMode, toggleDemoMode } = useDemoMode();
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
    isDemoMode,
    demoData: isDemoMode ? { analytics: demoAnalyticsData, charts: demoChartData } : undefined
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

  const handleExport = (format: string) => {
    logger.info(`Exporting data as ${format}`);
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
    <div className="flex h-screen bg-[#0f172a] overflow-hidden">
      <MedicalSidebarRefined activeItem={pageConfig.sidebarId} onCollapsedChange={setSidebarCollapsed} />

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <header className="bg-[#1e293b] border-b border-[#334155] px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="min-w-0 ml-12 lg:ml-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${
                  currentTab === 'overview'
                    ? 'bg-gradient-to-br from-cyan-500 to-teal-600 shadow-cyan-500/25'
                    : 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-purple-500/25'
                }`}>
                  <PageIcon size={18} className="text-white" strokeWidth={2.5} />
                </div>
                {pageConfig.title}
              </h1>
              <p className="text-xs md:text-sm text-gray-400 mt-1 truncate">
                {pageConfig.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <DemoModeToggle isDemoMode={isDemoMode} onToggle={toggleDemoMode} size="sm" />
              <NotificationCenter />

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`
                  px-3 py-2 rounded-xl border transition-all flex items-center gap-2 text-sm font-medium
                  ${showFilters
                    ? 'bg-cyan-600 border-cyan-500 text-white'
                    : 'bg-[#334155] border-[#475569] text-gray-300 hover:border-cyan-500'
                  }
                `}
              >
                <Filter size={15} />
                <span className="hidden sm:inline">Filtres</span>
                {showFilters && <span className="text-[10px] bg-cyan-400 px-1.5 py-0.5 rounded-full font-bold">ON</span>}
              </button>

              <div className="relative group">
                <button type="button" className="px-3 md:px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-xl transition-all flex items-center gap-2 text-sm font-semibold shadow-lg shadow-cyan-600/25">
                  <Download size={16} />
                  <span className="hidden sm:inline">Exporter</span>
                  <ChevronDown size={14} />
                </button>

                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button type="button" onClick={() => handleExport('csv')} className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 transition-colors rounded-t-xl text-sm font-medium">
                    Export CSV
                  </button>
                  <button type="button" onClick={() => handleExport('json')} className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
                    Export JSON
                  </button>
                  <button type="button" onClick={() => handleExport('txt')} className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
                    Export TXT
                  </button>
                  <button type="button" onClick={() => handleExport('clipboard')} className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 transition-colors rounded-b-xl text-sm font-medium">
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

        <DemoModeBanner isDemoMode={isDemoMode} onDisable={toggleDemoMode} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f5f4f0]">
          <ErrorBoundary>
            {currentTab !== 'overview' && (
              <KPICards isDemoMode={isDemoMode} />
            )}
            <div className={currentTab !== 'overview' ? 'mt-4 md:mt-6' : ''}>
              {renderContent()}
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsPageAdvanced;
