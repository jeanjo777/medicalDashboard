import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { ToastProvider } from './components/Common/Toast.tsx';
import { queryClient } from './lib/queryClient.ts';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { initGlobalErrorHandlers } from './utils/errorHandler.ts';
import './index.css';

// Initialize global error handlers
initGlobalErrorHandlers();

// Main pages - imported directly for instant navigation
import ModernDashboardPage from './pages/ModernDashboardPageHybrid.tsx';
import AppointmentsPage from './pages/AppointmentsPage.tsx';
import CalendarViewPage from './pages/CalendarViewPage.tsx';
import PatientsViewPageEnhanced from './pages/PatientsViewPageEnhanced.tsx';
import AnalyticsPageAdvanced from './pages/AnalyticsPageAdvanced.tsx';
import ReportsPage from './pages/ReportsPage.tsx';

// Secondary pages - lazy loaded
const App = lazy(() => import('./App.tsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.tsx'));
const QuickRDVLoginPage = lazy(() => import('./pages/QuickRDVLoginPage.tsx'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage.tsx'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage.tsx'));
const PatientDashboardPage = lazy(() => import('./pages/PatientDashboardPage.tsx'));
const PatientRegisterPage = lazy(() => import('./pages/PatientRegisterPage.tsx'));
const MedicRegisterPage = lazy(() => import('./pages/MedicRegisterPage.tsx'));
const PatientTreatmentPage = lazy(() => import('./pages/PatientTreatmentPage.tsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.tsx'));
const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage.tsx'));
const EmailPage = lazy(() => import('./pages/EmailPage.tsx'));

const PageLoader = () => (
  <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-gray-400 text-sm">Chargement...</span>
    </div>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
              <Route path="/" element={<App />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/rdv-login" element={<QuickRDVLoginPage />} />
              <Route path="/register" element={<MedicRegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><ModernDashboardPage /></ProtectedRoute>} />
              <Route path="/patient-dashboard" element={<ProtectedRoute><PatientDashboardPage /></ProtectedRoute>} />
              <Route path="/patients-enhanced" element={<ProtectedRoute><PatientsViewPageEnhanced /></ProtectedRoute>} />
              <Route path="/patients" element={<Navigate to="/patients-enhanced" replace />} />
              <Route path="/register-patient" element={<ProtectedRoute><PatientRegisterPage /></ProtectedRoute>} />
              <Route path="/treatment/:patientId" element={<ProtectedRoute><PatientTreatmentPage /></ProtectedRoute>} />
              <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><CalendarViewPage /></ProtectedRoute>} />
              <Route path="/analytics-advanced" element={<ProtectedRoute><AnalyticsPageAdvanced /></ProtectedRoute>} />
              <Route path="/predictions" element={<ProtectedRoute><AnalyticsPageAdvanced /></ProtectedRoute>} />
              <Route path="/correlations" element={<ProtectedRoute><AnalyticsPageAdvanced /></ProtectedRoute>} />
              <Route path="/segmentation" element={<ProtectedRoute><AnalyticsPageAdvanced /></ProtectedRoute>} />
              <Route path="/ai-alerts" element={<ProtectedRoute><AnalyticsPageAdvanced /></ProtectedRoute>} />
              <Route path="/comparative" element={<ProtectedRoute><AnalyticsPageAdvanced /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<Navigate to="/analytics-advanced" replace />} />
              <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/email" element={<ProtectedRoute><EmailPage /></ProtectedRoute>} />
            </Routes>
          </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
