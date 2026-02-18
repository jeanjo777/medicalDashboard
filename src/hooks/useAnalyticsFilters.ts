import { useState, useMemo } from 'react';
import type {
  DepartementStats,
  MedecinPerformance,
  FluxPatients,
  PathologieDistribution
} from './useAnalyticsData';

export interface AnalyticsFilters {
  dateRange: {
    start: string;
    end: string;
  };
  department: string;
  medic: string;
  pathology: string;
  severity: string;
  ageRange: [number, number];
}

export const defaultFilters: AnalyticsFilters = {
  dateRange: {
    start: '',
    end: ''
  },
  department: '',
  medic: '',
  pathology: '',
  severity: '',
  ageRange: [0, 100]
};

export function useAnalyticsFilters() {
  const [filters, setFilters] = useState<AnalyticsFilters>(defaultFilters);

  const updateFilter = (key: keyof AnalyticsFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.dateRange.start !== '' ||
      filters.dateRange.end !== '' ||
      filters.department !== '' ||
      filters.medic !== '' ||
      filters.pathology !== '' ||
      filters.severity !== '' ||
      filters.ageRange[0] !== 0 ||
      filters.ageRange[1] !== 100
    );
  }, [filters]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.dateRange.start && filters.dateRange.end) count++;
    if (filters.department) count++;
    if (filters.medic) count++;
    if (filters.pathology) count++;
    if (filters.severity) count++;
    if (filters.ageRange[0] !== 0 || filters.ageRange[1] !== 100) count++;
    return count;
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    activeFiltersCount
  };
}

// Hook pour filtrer les données du département
export function useFilteredDepartements(
  data: DepartementStats[] | undefined,
  filters: AnalyticsFilters
) {
  return useMemo(() => {
    if (!data) return [];

    let filtered = [...data];

    if (filters.department) {
      filtered = filtered.filter(dept =>
        dept.departement.toLowerCase().includes(filters.department.toLowerCase())
      );
    }

    return filtered;
  }, [data, filters]);
}

// Hook pour filtrer les performances des médecins
export function useFilteredMedecins(
  data: MedecinPerformance[] | undefined,
  filters: AnalyticsFilters
) {
  return useMemo(() => {
    if (!data) return [];

    let filtered = [...data];

    if (filters.medic) {
      filtered = filtered.filter(med =>
        med.medecin_name.toLowerCase().includes(filters.medic.toLowerCase())
      );
    }

    return filtered;
  }, [data, filters]);
}

// Hook pour filtrer le flux de patients
export function useFilteredFlux(
  data: FluxPatients[] | undefined,
  filters: AnalyticsFilters
) {
  return useMemo(() => {
    if (!data) return [];

    let filtered = [...data];

    if (filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      const startMonth = startDate.getMonth();
      const endMonth = endDate.getMonth();

      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Jui', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      const allowedMonths = monthNames.slice(startMonth, endMonth + 1);

      filtered = filtered.filter(flux => allowedMonths.includes(flux.mois));
    }

    return filtered;
  }, [data, filters]);
}

// Hook pour filtrer les pathologies
export function useFilteredPathologies(
  data: PathologieDistribution[] | undefined,
  filters: AnalyticsFilters
) {
  return useMemo(() => {
    if (!data) return [];

    let filtered = [...data];

    if (filters.pathology) {
      filtered = filtered.filter(path =>
        path.pathologie.toLowerCase().includes(filters.pathology.toLowerCase())
      );
    }

    return filtered;
  }, [data, filters]);
}
