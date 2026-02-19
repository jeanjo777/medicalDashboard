import React from 'react';
import { UserCheck, UserX, Clock, Users } from 'lucide-react';
import { useTodayPatientStats } from '../../hooks/useTodayPatientStats';

interface TodayPatientsWidgetProps {
  isDemoMode?: boolean;
}

const demoStats = { total: 24, seen: 16, waiting: 5, absent: 3 };

const TodayPatientsWidget: React.FC<TodayPatientsWidgetProps> = ({ isDemoMode = true }) => {
  const { data: todayData } = useTodayPatientStats();

  const s = isDemoMode ? demoStats : (todayData || demoStats);

  const stats = [
    { label: 'Total prévus', value: s.total, icon: <Users className="h-4 w-4" />, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Consultés', value: s.seen, icon: <UserCheck className="h-4 w-4" />, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'En attente', value: s.waiting, icon: <Clock className="h-4 w-4" />, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Absents', value: s.absent, icon: <UserX className="h-4 w-4" />, color: 'text-red-500 bg-red-500/10' },
  ];

  const progress = s.total > 0 ? Math.round((s.seen / s.total) * 100) : 0;

  return (
    <div className="rounded-2xl bg-[var(--bg-secondary)] p-4 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold theme-text-primary">Patients du jour</h2>
        <span className="text-xs theme-text-muted">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs theme-text-muted">Progression</span>
          <span className="text-xs font-bold theme-text-primary">{progress}%</span>
        </div>
        <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--bg-input)]">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-lg font-bold theme-text-primary leading-none">{stat.value}</div>
              <div className="text-[10px] theme-text-muted mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodayPatientsWidget;
