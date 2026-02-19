/**
 * Modern Dashboard Page - Hybrid Theme (UXBooster + Medical)
 *
 * Combines:
 * - Dark header/sidebar for professional look
 * - Light content area with UXBooster aesthetic
 * - Medical-focused metrics and visualizations
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, HelpCircle, Bell, Plus } from 'lucide-react';
import MedicalSidebarRefined from '../components/MedicalSidebarRefined';
import MedicalRadarChart from '../components/ModernDashboard/MedicalRadarChart';
import MedicalFlowCard from '../components/ModernDashboard/MedicalFlowCard';
import MedicalUpgradeCard from '../components/ModernDashboard/MedicalUpgradeCard';
import MedicalAIReports from '../components/ModernDashboard/MedicalAIReports';
import MedicalPassingRate from '../components/ModernDashboard/MedicalPassingRate';
import RecentActivity from '../components/ModernDashboard/RecentActivity';
import UpcomingAppointments from '../components/ModernDashboard/UpcomingAppointments';
import PatientAlertsWidget from '../components/ModernDashboard/PatientAlertsWidget';
import KPIPerformanceWidget from '../components/ModernDashboard/KPIPerformanceWidget';
import WeeklyOverviewWidget from '../components/ModernDashboard/WeeklyOverviewWidget';
import TodayPatientsWidget from '../components/ModernDashboard/TodayPatientsWidget';
import QuickActionsWidget from '../components/ModernDashboard/QuickActionsWidget';
import NotificationsWidget from '../components/ModernDashboard/NotificationsWidget';
import UserMenu from '../components/Common/UserMenu';
import { GlobalSearch } from '../components/Common/GlobalSearch';
import { NotificationCenter } from '../components/Common/NotificationCenter';
import DemoModeToggle, { DemoModeBanner } from '../components/Common/DemoModeToggle';
import ErrorBoundary from '../components/ErrorBoundary';
import { useMedicAuth } from '../hooks/useMedicAuth';
import { useToast } from '../components/Common/Toast';
import { useDemoMode } from '../hooks/useDemoMode';
import { useMedicalDataRealtime } from '../hooks/useAppointmentsRealtime';
import { useDashboardStatsQuery } from '../hooks/useDashboardStatsQuery';

const ModernDashboardPageHybrid: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showSearch, setShowSearch] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const { user } = useMedicAuth();
  const { showToast } = useToast();
  const { isDemoMode, toggleDemoMode, disableDemoMode } = useDemoMode();
  const { stats: dashStats } = useDashboardStatsQuery();
  useMedicalDataRealtime(!isDemoMode);

  const userName = user
    ? `Dr. ${user.prenom || ''} ${user.nom || ''}`.trim() || 'Professionnel de santé'
    : 'Professionnel de santé';
  const userInitials = user
    ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() || 'MD'
    : 'MD';

  return (
    <div className="flex min-h-screen theme-bg-primary transition-colors duration-300">
      {/* Sidebar */}
      <MedicalSidebarRefined
        activeItem={activeSection}
        onItemClick={setActiveSection}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content - adjusts margin based on sidebar state */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="theme-bg-secondary border-b theme-border px-4 lg:px-6 py-3 sticky top-0 z-30 transition-colors duration-300">
          <div className="flex items-center justify-between">
            {/* Left: Logo & Nav */}
            <div className="flex items-center gap-6 ml-14 lg:ml-0">
              <span className="text-base font-semibold theme-text-primary hidden sm:block">
                MedicalAI
              </span>

            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {showSearch ? (
                <GlobalSearch />
              ) : (
                <button type="button" onClick={() => setShowSearch(true)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer" aria-label="Rechercher">
                  <Search className="h-4 w-4 theme-text-secondary" />
                </button>
              )}
              <NotificationCenter />
              <DemoModeToggle isDemoMode={isDemoMode} onToggle={toggleDemoMode} size="sm" />
              <button type="button" onClick={() => showToast({ type: 'info', title: 'Aide', message: 'Pour toute assistance, contactez support@medicalai.fr ou consultez la documentation.' })} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer" aria-label="Aide">
                <HelpCircle className="h-4 w-4 theme-text-secondary" />
              </button>
              <UserMenu userName={userName} userInitials={userInitials} />
            </div>
          </div>
        </header>

        {/* Demo Mode Banner */}
        <DemoModeBanner isDemoMode={isDemoMode} onDisable={disableDemoMode} />

        {/* Content Area */}
        <main className="flex-1 bg-[var(--bg-primary)] p-2 sm:p-3 lg:p-4 overflow-auto transition-colors duration-300">
          <div className="mx-auto max-w-[1600px]">
            {/* Main Content Container with rounded corners */}
            <div className="rounded-2xl lg:rounded-3xl bg-[var(--bg-secondary)] p-3 lg:p-4 shadow-card transition-colors duration-300">

              {/* Content Grid - UXBooster Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">

                {/* Left Column - Overview (4 cols) */}
                <div className="lg:col-span-4 space-y-3">
                  <ErrorBoundary>
                    <MedicalRadarChart isDemoMode={isDemoMode} />
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <MedicalUpgradeCard onUpgrade={() => navigate('/ai-assistant')} />
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <TodayPatientsWidget isDemoMode={isDemoMode} />
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <QuickActionsWidget />
                  </ErrorBoundary>
                </div>

                {/* Middle Column - Main Content (5 cols) */}
                <div className="lg:col-span-5 space-y-3">
                  {/* Patient Alerts */}
                  <ErrorBoundary>
                    <div className="rounded-2xl theme-bg-secondary p-4 shadow-sm border theme-border transition-colors duration-300">
                      <PatientAlertsWidget compact />
                    </div>
                  </ErrorBoundary>

                  {/* Upcoming Appointments */}
                  <ErrorBoundary>
                    <div className="rounded-2xl theme-bg-secondary p-4 shadow-sm border theme-border transition-colors duration-300">
                      <UpcomingAppointments />
                    </div>
                  </ErrorBoundary>

                  {/* AI Reports */}
                  <ErrorBoundary>
                    <MedicalAIReports isDemoMode={isDemoMode} />
                  </ErrorBoundary>

                  {/* KPI Performance */}
                  <ErrorBoundary>
                    <KPIPerformanceWidget isDemoMode={isDemoMode} />
                  </ErrorBoundary>
                </div>

                {/* Right Column - Stats (3 cols) */}
                <div className="lg:col-span-3 space-y-3">
                  {/* Flow Cards */}
                  <ErrorBoundary>
                    <MedicalFlowCard
                      title="Taux de présence"
                      value={isDemoMode ? '92%' : `${Math.round(dashStats.patientsInTreatment)}%`}
                      status="good"
                      trend="up"
                      trendValue={isDemoMode ? '+3%' : `${dashStats.patientsInTreatmentChange > 0 ? '+' : ''}${dashStats.patientsInTreatmentChange}%`}
                    />
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <MedicalFlowCard
                      title="Nouveaux patients"
                      value={isDemoMode ? '12' : String(dashStats.newPatientsThisMonth)}
                      status={dashStats.newPatientsThisMonthChange >= 0 ? 'good' : 'warning'}
                      trend={dashStats.newPatientsThisMonthChange >= 0 ? 'up' : 'down'}
                      trendValue={isDemoMode ? '+18%' : `${dashStats.newPatientsThisMonthChange > 0 ? '+' : ''}${dashStats.newPatientsThisMonthChange}%`}
                    />
                  </ErrorBoundary>

                  {/* Add New Card */}
                  <div className="rounded-2xl border-2 border-dashed border-[var(--border-color)] theme-bg-secondary p-4 shadow-sm transition-colors duration-300">
                    <div className="flex items-center justify-center">
                      <button type="button" onClick={() => showToast({ type: 'info', title: 'Fonctionnalite a venir', message: 'L\'ajout de widgets personnalises sera disponible prochainement.' })} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer" aria-label="Ajouter un widget">
                        <Plus className="h-5 w-5 theme-text-muted" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="rounded-2xl theme-bg-secondary p-3 shadow-sm transition-colors duration-300">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium theme-text-primary">Patients aujourd'hui</span>
                      <span className="theme-text-secondary">{isDemoMode ? '24' : dashStats.appointmentsToday} consultations</span>
                    </div>
                  </div>

                  {/* Passing Rate */}
                  <ErrorBoundary>
                    <MedicalPassingRate isDemoMode={isDemoMode} />
                  </ErrorBoundary>

                  {/* Weekly Overview */}
                  <ErrorBoundary>
                    <WeeklyOverviewWidget isDemoMode={isDemoMode} />
                  </ErrorBoundary>

                  {/* Notifications */}
                  <ErrorBoundary>
                    <NotificationsWidget />
                  </ErrorBoundary>
                </div>
              </div>

              {/* Bottom Row - Activity */}
              <div className="mt-3 lg:mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                <ErrorBoundary>
                  <div className="rounded-2xl theme-bg-secondary p-3 sm:p-4 shadow-sm border theme-border transition-colors duration-300">
                    <RecentActivity />
                  </div>
                </ErrorBoundary>

                <ErrorBoundary>
                  <div className="rounded-2xl theme-bg-secondary p-3 sm:p-4 shadow-sm border theme-border transition-colors duration-300">
                    <div className="mb-3 sm:mb-4 flex items-center justify-between">
                      <h2 className="text-sm sm:text-base font-semibold theme-text-primary">
                        Statistiques rapides
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <QuickStat label="Nouveaux patients" value={isDemoMode ? '12' : String(dashStats.newPatientsThisMonth)} change={isDemoMode ? '+18%' : `${dashStats.newPatientsThisMonthChange > 0 ? '+' : ''}${dashStats.newPatientsThisMonthChange}%`} positive={isDemoMode ? true : dashStats.newPatientsThisMonthChange >= 0} />
                      <QuickStat label="RDV aujourd'hui" value={isDemoMode ? '24' : String(dashStats.appointmentsToday)} change={isDemoMode ? '+5%' : `${dashStats.appointmentsTodayChange > 0 ? '+' : ''}${dashStats.appointmentsTodayChange}%`} positive={isDemoMode ? true : dashStats.appointmentsTodayChange >= 0} />
                      <QuickStat label="Revenus" value={isDemoMode ? '45 000' : dashStats.totalRevenue.toLocaleString('fr-FR')} change={isDemoMode ? '+12%' : `${dashStats.totalRevenueChange > 0 ? '+' : ''}${dashStats.totalRevenueChange}%`} positive={isDemoMode ? true : dashStats.totalRevenueChange >= 0} suffix=" FCFA" />
                      <QuickStat label="En traitement" value={isDemoMode ? '15%' : `${dashStats.patientsInTreatment}%`} change={isDemoMode ? '+2%' : `${dashStats.patientsInTreatmentChange > 0 ? '+' : ''}${dashStats.patientsInTreatmentChange}%`} positive={isDemoMode ? true : dashStats.patientsInTreatmentChange >= 0} />
                    </div>
                  </div>
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

interface QuickStatProps {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  suffix?: string;
}

const QuickStat: React.FC<QuickStatProps> = ({ label, value, change, positive, suffix }) => (
  <div className="rounded-xl bg-[var(--bg-primary)] p-2 sm:p-3 transition-colors duration-300">
    <div className="text-[10px] sm:text-xs theme-text-muted mb-1">{label}</div>
    <div className="flex items-end gap-1">
      <span className="text-lg sm:text-xl font-bold theme-text-primary">{value}</span>
      {suffix && <span className="text-xs sm:text-sm theme-text-secondary mb-0.5">{suffix}</span>}
    </div>
    <div className={`text-[10px] sm:text-xs font-medium ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
      {change}
    </div>
  </div>
);

export default ModernDashboardPageHybrid;
