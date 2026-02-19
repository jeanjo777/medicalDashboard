/**
 * Medical AI Reports - UXBooster Style
 *
 * Displays AI-generated medical reports with circular progress indicators
 */

import React, { useMemo } from 'react';
import { Copy, FileText, Activity, Users, Calendar } from 'lucide-react';
import { useAnalyticsStats } from '../../hooks/useAnalyticsData';
import { useDashboardStatsQuery } from '../../hooks/useDashboardStatsQuery';

interface ReportItem {
  icon: 'patients' | 'diagnostics' | 'planning';
  label: string;
  progress: number;
}

interface MedicalAIReportsProps {
  reports?: ReportItem[];
  onCopy?: () => void;
}

const defaultReports: ReportItem[] = [
  { icon: 'patients', label: 'Patients à risque', progress: 0 },
  { icon: 'diagnostics', label: 'Diagnostics IA', progress: 0 },
  { icon: 'planning', label: 'Planning optimal', progress: 0 },
];

const MedicalAIReports: React.FC<MedicalAIReportsProps> = ({
  reports: reportsProp,
  onCopy,
}) => {
  const { data: analyticsStats } = useAnalyticsStats();
  const { stats: dashStats } = useDashboardStatsQuery();

  const realReports = useMemo((): ReportItem[] | null => {
    if (!analyticsStats) return null;

    const casRisque = analyticsStats.cas_risque ?? 0;
    const rdvHonores = analyticsStats.rdv_honores ?? 0;
    const appointmentsToday = dashStats.appointmentsToday ?? 0;

    return [
      {
        icon: 'patients' as const,
        label: 'Patients à risque',
        progress: Math.min(100, Math.max(0, casRisque > 0 ? Math.round(100 - casRisque * 5) : 85)),
      },
      {
        icon: 'diagnostics' as const,
        label: 'Diagnostics IA',
        progress: Math.min(100, Math.max(0, Math.round(rdvHonores))),
      },
      {
        icon: 'planning' as const,
        label: 'Planning optimal',
        progress: Math.min(100, Math.max(0, appointmentsToday > 0 ? Math.round((appointmentsToday / 30) * 100) : 0)),
      },
    ];
  }, [analyticsStats, dashStats]);

  const reports = reportsProp ?? (realReports || defaultReports);

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
      return;
    }
    const text = reports.map(r => `${r.label}: ${r.progress}%`).join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="rounded-2xl bg-[var(--bg-secondary)] p-4 shadow-sm transition-colors duration-300">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold theme-text-primary">Rapports IA</h2>
        <button
          onClick={handleCopy}
          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
          title="Copier les donnees"
        >
          <Copy className="h-3.5 w-3.5 theme-text-muted" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {reports.map((report, index) => (
          <ReportCircle key={index} {...report} />
        ))}
      </div>
    </div>
  );
};

interface ReportCircleProps {
  icon: 'patients' | 'diagnostics' | 'planning';
  label: string;
  progress: number;
}

const ReportCircle: React.FC<ReportCircleProps> = ({ icon, label, progress }) => {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (progress / 100) * circumference;

  const renderIcon = () => {
    const iconClass = "h-5 w-5 theme-text-secondary";
    switch (icon) {
      case 'patients':
        return <Users className={iconClass} />;
      case 'diagnostics':
        return <Activity className={iconClass} />;
      case 'planning':
        return <Calendar className={iconClass} />;
      default:
        return <FileText className={iconClass} />;
    }
  };

  return (
    <div className="text-center group cursor-pointer">
      <div className="relative mx-auto mb-2 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center">
        {/* Circular progress */}
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="3"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="relative z-10 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-[var(--bg-secondary)] shadow-sm group-hover:shadow-md transition-shadow">
          {renderIcon()}
        </div>
      </div>
      <div className="text-[10px] sm:text-xs font-medium theme-text-secondary">{label}</div>
      <div className="text-[10px] text-emerald-600 font-semibold">{progress}%</div>
    </div>
  );
};

export default MedicalAIReports;
