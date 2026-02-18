/**
 * Medical AI Reports - UXBooster Style
 *
 * Displays AI-generated medical reports with circular progress indicators
 */

import React from 'react';
import { Copy, FileText, Activity, Users, Calendar } from 'lucide-react';

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
  { icon: 'patients', label: 'Patients à risque', progress: 75 },
  { icon: 'diagnostics', label: 'Diagnostics IA', progress: 82 },
  { icon: 'planning', label: 'Planning optimal', progress: 68 },
];

const MedicalAIReports: React.FC<MedicalAIReportsProps> = ({
  reports = defaultReports,
  onCopy,
}) => {
  return (
    <div className="rounded-2xl bg-[var(--bg-secondary)] p-4 shadow-sm transition-colors duration-300">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold theme-text-primary">Rapports IA</h2>
        <button
          onClick={onCopy}
          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
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
