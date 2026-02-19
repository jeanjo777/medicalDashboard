import React from 'react';
import { Calendar, LayoutGrid, List } from 'lucide-react';

type ViewMode = 'week' | 'month' | 'list';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  const views: Array<{ id: ViewMode; label: string; icon: React.ReactNode }> = [
    { id: 'week', label: 'Semaine', icon: <Calendar size={16} /> },
    { id: 'month', label: 'Mois', icon: <LayoutGrid size={16} /> },
    { id: 'list', label: 'Liste', icon: <List size={16} /> },
  ];

  return (
    <div className="inline-flex rounded-xl bg-[var(--bg-tertiary)] p-1">
      {views.map((view) => (
        <button
          key={view.id}
          type="button"
          onClick={() => onViewChange(view.id)}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
            currentView === view.id
              ? 'bg-[var(--bg-secondary)] text-primary shadow-sm'
              : 'theme-text-secondary hover:theme-text-primary hover:bg-[var(--bg-secondary)]/50'
          }`}
        >
          {view.icon}
          <span className="hidden sm:inline">{view.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ViewToggle;
