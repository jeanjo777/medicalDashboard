import React from 'react';
import { Filter, X, Calendar, User, Activity, AlertTriangle } from 'lucide-react';

interface FilterState {
  ageRange: string;
  gender: string;
  riskLevel: string;
  consultationStatus: string;
  dateRange: string;
}

interface PatientFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  activeFiltersCount: number;
}

const PatientFilters: React.FC<PatientFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  activeFiltersCount,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="glass backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-xl border border-white/50 dark:border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 font-bold text-gray-900 dark:text-white hover:text-primary dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            <Filter size={20} />
            Filtres avancés
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-primary text-white text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            <X size={16} />
            Réinitialiser
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <User size={16} />
              Tranche d'âge
            </label>
            <select
              value={filters.ageRange}
              onChange={(e) => handleChange('ageRange', e.target.value)}
              className="w-full px-4 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-all duration-300"
            >
              <option value="">Tous les âges</option>
              <option value="0-18">0-18 ans</option>
              <option value="19-35">19-35 ans</option>
              <option value="36-50">36-50 ans</option>
              <option value="51-65">51-65 ans</option>
              <option value="66+">66+ ans</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <User size={16} />
              Sexe
            </label>
            <select
              value={filters.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full px-4 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-all duration-300"
            >
              <option value="">Tous</option>
              <option value="male">Homme</option>
              <option value="female">Femme</option>
              <option value="child">Enfant</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <AlertTriangle size={16} />
              Niveau de risque
            </label>
            <select
              value={filters.riskLevel}
              onChange={(e) => handleChange('riskLevel', e.target.value)}
              className="w-full px-4 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-all duration-300"
            >
              <option value="">Tous</option>
              <option value="low">Faible (0-39)</option>
              <option value="medium">Élevé (40-69)</option>
              <option value="high">Critique (70+)</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Activity size={16} />
              Statut consultations
            </label>
            <select
              value={filters.consultationStatus}
              onChange={(e) => handleChange('consultationStatus', e.target.value)}
              className="w-full px-4 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-all duration-300"
            >
              <option value="">Tous</option>
              <option value="pending">En attente</option>
              <option value="completed">Traitées</option>
              <option value="none">Aucune</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Calendar size={16} />
              Période d'inscription
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleChange('dateRange', e.target.value)}
              className="w-full px-4 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-all duration-300"
            >
              <option value="">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois-ci</option>
              <option value="year">Cette année</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientFilters;
