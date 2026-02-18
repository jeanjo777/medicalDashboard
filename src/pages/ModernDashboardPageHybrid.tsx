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
import UserMenu from '../components/Common/UserMenu';
import ErrorBoundary from '../components/ErrorBoundary';
import { useMedicAuth } from '../hooks/useMedicAuth';

const ModernDashboardPageHybrid: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const { user } = useMedicAuth();

  const userName = user ? `Dr. ${user.prenom} ${user.nom}` : 'Professionnel de santé';
  const userInitials = user
    ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase()
    : 'MD';

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      {/* Dark Sidebar */}
      <MedicalSidebarRefined
        activeItem={activeSection}
        onItemClick={setActiveSection}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content - adjusts margin based on sidebar state */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Dark Header */}
        <header className="bg-[#1e293b] border-b border-[#334155] px-4 lg:px-6 py-3 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            {/* Left: Logo & Nav */}
            <div className="flex items-center gap-6 ml-14 lg:ml-0">
              <span className="text-base font-semibold text-white hidden sm:block">
                MedicalAI
              </span>

            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                <Search className="h-4 w-4 text-gray-300" />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                <Bell className="h-4 w-4 text-gray-300" />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                <HelpCircle className="h-4 w-4 text-gray-300" />
              </button>
              <UserMenu userName={userName} userInitials={userInitials} />
            </div>
          </div>
        </header>

        {/* Light Content Area - UXBooster Style */}
        <main className="flex-1 bg-[#e8e6f0] p-3 sm:p-4 lg:p-6 overflow-auto">
          <div className="mx-auto max-w-[1600px]">
            {/* Main Content Container with rounded corners */}
            <div className="rounded-2xl lg:rounded-3xl bg-[#f5f4f0] p-4 lg:p-6 shadow-xl">

              {/* Content Grid - UXBooster Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">

                {/* Left Column - Overview (4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                  <ErrorBoundary>
                    <MedicalRadarChart />
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <MedicalUpgradeCard />
                  </ErrorBoundary>
                </div>

                {/* Middle Column - Main Content (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Patient Alerts */}
                  <ErrorBoundary>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <PatientAlertsWidget compact />
                    </div>
                  </ErrorBoundary>

                  {/* Upcoming Appointments */}
                  <ErrorBoundary>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <UpcomingAppointments />
                    </div>
                  </ErrorBoundary>

                  {/* AI Reports */}
                  <ErrorBoundary>
                    <MedicalAIReports />
                  </ErrorBoundary>

                  {/* KPI Performance */}
                  <ErrorBoundary>
                    <KPIPerformanceWidget />
                  </ErrorBoundary>
                </div>

                {/* Right Column - Stats (3 cols) */}
                <div className="lg:col-span-3 space-y-4">
                  {/* Flow Cards */}
                  <ErrorBoundary>
                    <MedicalFlowCard
                      title="Taux de présence"
                      value="92%"
                      status="good"
                      trend="up"
                      trendValue="+3%"
                    />
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <MedicalFlowCard
                      title="Temps d'attente moyen"
                      value="18min"
                      status="warning"
                      trend="down"
                      trendValue="-5min"
                      alert="Pic d'activité prévu entre 10h et 12h aujourd'hui."
                    />
                  </ErrorBoundary>

                  {/* Add New Card */}
                  <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-center">
                      <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-50 transition-colors">
                        <Plus className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="rounded-2xl bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-900">Patients aujourd'hui</span>
                      <span className="text-gray-500">24 consultations</span>
                    </div>
                  </div>

                  {/* Passing Rate */}
                  <ErrorBoundary>
                    <MedicalPassingRate
                      complete={72}
                      cancelled={12}
                      pending={16}
                    />
                  </ErrorBoundary>

                  {/* Weekly Overview */}
                  <ErrorBoundary>
                    <WeeklyOverviewWidget />
                  </ErrorBoundary>
                </div>
              </div>

              {/* Bottom Row - Activity */}
              <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ErrorBoundary>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <RecentActivity />
                  </div>
                </ErrorBoundary>

                <ErrorBoundary>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-base font-semibold text-gray-900">
                        Statistiques rapides
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <QuickStat label="Nouveaux patients" value="12" change="+18%" positive />
                      <QuickStat label="Consultations" value="156" change="+5%" positive />
                      <QuickStat label="Annulations" value="8" change="-23%" positive />
                      <QuickStat label="Satisfaction" value="4.8" change="+0.2" positive suffix="/5" />
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
  <div className="rounded-xl bg-gray-50 p-3">
    <div className="text-[10px] text-gray-500 mb-1">{label}</div>
    <div className="flex items-end gap-1">
      <span className="text-xl font-bold text-gray-900">{value}</span>
      {suffix && <span className="text-sm text-gray-500 mb-0.5">{suffix}</span>}
    </div>
    <div className={`text-[10px] font-medium ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
      {change}
    </div>
  </div>
);

export default ModernDashboardPageHybrid;
