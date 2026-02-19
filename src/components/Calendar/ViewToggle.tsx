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
    <div className="inline-flex rounded-xl bg-gray-100 p-1">
      {views.map((view) => (
        <button
          key={view.id}
          type="button"
          onClick={() => onViewChange(view.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
            currentView === view.id
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
