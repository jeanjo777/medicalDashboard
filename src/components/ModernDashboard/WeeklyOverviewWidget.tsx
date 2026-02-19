import React from 'react';
import { Calendar } from 'lucide-react';
import { useWeeklyAppointments } from '../../hooks/useWeeklyAppointments';

interface WeeklyOverviewWidgetProps {
  isDemoMode?: boolean;
}

const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const demoData = [18, 24, 15, 28, 22, 8, 4];

const WeeklyOverviewWidget: React.FC<WeeklyOverviewWidgetProps> = ({ isDemoMode = true }) => {
  const { data: weeklyData } = useWeeklyAppointments();

  const hasRealData = weeklyData?.counts && weeklyData.counts.some(v => v > 0);
  const data = isDemoMode ? demoData : (hasRealData ? weeklyData.counts : demoData);
  const maxVal = Math.max(...data, 1);
  const total = data.reduce((a, b) => a + b, 0);

  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;

  return (
    <div className="rounded-2xl bg-[var(--bg-secondary)] p-4 shadow-sm transition-colors duration-300">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold theme-text-primary">Aperçu semaine</h2>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg">
          <Calendar className="h-3.5 w-3.5 theme-text-muted" />
        </div>
      </div>

      <div className="flex items-end justify-between gap-1 sm:gap-1.5 h-20 sm:h-24 mb-2">
        {data.map((val, i) => {
          const height = (val / maxVal) * 100;
          const isToday = i === todayIndex;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] font-medium theme-text-muted">{val}</span>
              <div
                className={`w-full rounded-t-md transition-all duration-300 ${
                  isToday
                    ? 'bg-gradient-to-t from-cyan-500 to-cyan-400'
                    : 'bg-[var(--bg-tertiary)] hover:opacity-80'
                }`}
                style={{ height: `${height}%`, minHeight: '4px' }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between gap-1.5">
        {days.map((day, i) => (
          <span
            key={day}
            className={`flex-1 text-center text-[10px] font-medium ${
              i === todayIndex ? 'text-cyan-600' : 'theme-text-muted'
            }`}
          >
            {day}
          </span>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
        <span className="text-[10px] theme-text-muted">Total semaine</span>
        <span className="text-xs sm:text-sm font-bold theme-text-primary">{total} consultations</span>
      </div>
    </div>
  );
};

export default WeeklyOverviewWidget;
