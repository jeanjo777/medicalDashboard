import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, CalendarPlus, FileText, Brain, Stethoscope, BarChart3 } from 'lucide-react';

const QuickActionsWidget: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    { label: 'Nouveau patient', icon: <UserPlus className="h-4 w-4" />, color: 'bg-blue-500', route: '/patients-enhanced' },
    { label: 'Rendez-vous', icon: <CalendarPlus className="h-4 w-4" />, color: 'bg-emerald-500', route: '/appointments' },
    // { label: 'Consultation', icon: <Stethoscope className="h-4 w-4" />, color: 'bg-purple-500', route: '/consultation' }, // Hidden for now
    { label: 'Rapport', icon: <FileText className="h-4 w-4" />, color: 'bg-orange-500', route: '/reports' },
    { label: 'Assistant IA', icon: <Brain className="h-4 w-4" />, color: 'bg-pink-500', route: '/ai-assistant' },
    { label: 'Statistiques', icon: <BarChart3 className="h-4 w-4" />, color: 'bg-cyan-500', route: '/analytics-advanced' },
  ];

  return (
    <div className="rounded-2xl bg-[var(--bg-secondary)] p-4 shadow-sm transition-colors duration-300">
      <h2 className="text-base font-semibold theme-text-primary mb-3">Actions rapides</h2>
      <div className="grid grid-cols-3 gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.route)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-all group cursor-pointer"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color} text-white shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all`}>
              {action.icon}
            </div>
            <span className="text-[10px] font-medium theme-text-secondary text-center leading-tight">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsWidget;
