/**
 * Modern Dashboard Page - Medical Professional Edition
 *
 * Dashboard optimisé pour professionnels de santé.
 * Fonctionnalités:
 * - Statistiques patients en temps réel
 * - Vue des prochains rendez-vous
 * - Graphiques d'activité médicale
 * - Activité récente
 * - Navigation optimisée
 */

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import MedicalSidebarRefined from '../components/MedicalSidebarRefined';
import DashboardStatsCards from '../components/DashboardStatsCards';
import PatientGrowthChart from '../components/PatientGrowthChart';
import AppointmentDistributionChart from '../components/AppointmentDistributionChart';
import RecentActivity from '../components/ModernDashboard/RecentActivity';
import UpcomingAppointments from '../components/ModernDashboard/UpcomingAppointments';
import PatientAlertsWidget from '../components/ModernDashboard/PatientAlertsWidget';
import UserMenu from '../components/Common/UserMenu';
import ErrorBoundary from '../components/ErrorBoundary';
import { useMedicAuth } from '../hooks/useMedicAuth';

const ModernDashboardPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const { isLoading: authLoading } = useMedicAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-gray-400 text-lg">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      {/* Sidebar */}
      <MedicalSidebarRefined
        activeItem={activeSection}
        onItemClick={setActiveSection}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content - adjusts margin based on sidebar state */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top Header */}
        <header className="bg-[#1e293b] border-b border-[#334155] px-3 sm:px-4 lg:px-8 py-3 sm:py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            {/* Left: Title - with left padding for hamburger menu on mobile */}
            <div className="min-w-0 flex-1 lg:ml-0 ml-14">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Tableau de Bord Médical</h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1 truncate">Bienvenue</p>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-8 overflow-auto">
          <ErrorBoundary>
            {/* Stat Cards - Real Data from Supabase */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <DashboardStatsCards />
            </div>

            {/* Patient Alerts */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <ErrorBoundary>
                <PatientAlertsWidget />
              </ErrorBoundary>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
              <div className="lg:col-span-2">
                <ErrorBoundary>
                  <PatientGrowthChart />
                </ErrorBoundary>
              </div>
              <div className="lg:col-span-1">
                <ErrorBoundary>
                  <RecentActivity />
                </ErrorBoundary>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
              <ErrorBoundary>
                <AppointmentDistributionChart />
              </ErrorBoundary>
              <ErrorBoundary>
                <UpcomingAppointments />
              </ErrorBoundary>
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default ModernDashboardPage;
