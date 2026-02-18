import React from 'react';
import { UserCheck, UserX, Clock, Users } from 'lucide-react';

const TodayPatientsWidget: React.FC = () => {
  const stats = [
    { label: 'Total prévus', value: 24, icon: <Users className="h-4 w-4" />, color: 'text-blue-500 bg-blue-50' },
    { label: 'Consultés', value: 16, icon: <UserCheck className="h-4 w-4" />, color: 'text-emerald-500 bg-emerald-50' },
    { label: 'En attente', value: 5, icon: <Clock className="h-4 w-4" />, color: 'text-amber-500 bg-amber-50' },
    { label: 'Absents', value: 3, icon: <UserX className="h-4 w-4" />, color: 'text-red-500 bg-red-50' },
  ];

  const progress = Math.round((16 / 24) * 100);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Patients du jour</h2>
        <span className="text-xs text-gray-400">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500">Progression</span>
          <span className="text-xs font-bold text-gray-900">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 leading-none">{stat.value}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodayPatientsWidget;
