import React from 'react';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { SearchFilters as Filters } from '../../hooks/useAdvancedSearch';

interface SearchFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Partial<Filters>) => void;
  onReset: () => void;
  statusOptions?: { value: string; label: string }[];
  sortOptions?: { value: string; label: string }[];
  showDateFilter?: boolean;
  showStatusFilter?: boolean;
  showSortFilter?: boolean;
  placeholder?: string;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  statusOptions = [
    { value: 'all', label: 'Tous' },
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Sorti' },
  ],
  sortOptions = [
    { value: 'created_at', label: 'Date de création' },
    { value: 'name', label: 'Nom' },
  ],
  showDateFilter = true,
  showStatusFilter = true,
  showSortFilter = true,
  placeholder = 'Rechercher...',
}) => {
  const hasActiveFilters =
    filters.query ||
    (filters.status && filters.status !== 'all') ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl p-4 sm:p-5 lg:p-6 border border-[var(--border-color)] mb-4 sm:mb-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <Filter size={18} className="theme-text-muted flex-shrink-0" />
        <h3 className="theme-text-primary text-base sm:text-lg font-semibold">Filtres & Recherche</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="ml-auto text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 px-2 py-1 hover:bg-blue-500/10 rounded-lg"
          >
            <X size={14} />
            Réinitialiser
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="lg:col-span-2">
          <label className="block theme-text-muted text-sm font-medium mb-2">
            Recherche
          </label>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
            />
            <input
              type="text"
              value={filters.query || ''}
              onChange={(e) => onFiltersChange({ query: e.target.value })}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-2.5 sm:py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
          </div>
        </div>

        {showStatusFilter && (
          <div>
            <label className="block theme-text-muted text-sm font-medium mb-2">
              Statut
            </label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => onFiltersChange({ status: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {showSortFilter && (
          <div>
            <label className="block theme-text-muted text-sm font-medium mb-2">
              Trier par
            </label>
            <div className="flex gap-2">
              <select
                value={filters.sortBy || 'created_at'}
                onChange={(e) => onFiltersChange({ sortBy: e.target.value })}
                className="flex-1 px-4 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  onFiltersChange({
                    sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
                  })
                }
                className="px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] hover:border-blue-500/50 transition-colors"
                title={filters.sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        )}
      </div>

      {showDateFilter && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block theme-text-muted text-sm font-medium mb-2 flex items-center gap-2">
              <Calendar size={14} />
              Date de début
            </label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => onFiltersChange({ dateFrom: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
          </div>
          <div>
            <label className="block theme-text-muted text-sm font-medium mb-2 flex items-center gap-2">
              <Calendar size={14} />
              Date de fin
            </label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => onFiltersChange({ dateTo: e.target.value })}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] text-sm sm:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
