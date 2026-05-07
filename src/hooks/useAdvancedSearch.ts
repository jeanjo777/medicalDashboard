import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import logger from '../utils/logger';

export interface SearchFilters {
  query?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

interface UseAdvancedSearchOptions<T> {
  table: string;
  searchFields?: string[];
  selectFields?: string;
  defaultFilters?: SearchFilters;
  onSuccess?: (result: SearchResult<T>) => void;
}

interface UseAdvancedSearchResult<T> {
  results: T[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: Error | null;
  filters: SearchFilters;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  search: () => Promise<void>;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
}

const defaultSearchFilters: SearchFilters = {
  query: '',
  status: '',
  dateFrom: '',
  dateTo: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
  page: 1,
  limit: 20,
};

export function useAdvancedSearch<T = any>({
  table,
  searchFields = ['name', 'email'],
  selectFields = '*',
  defaultFilters = {},
  onSuccess,
}: UseAdvancedSearchOptions<T>): UseAdvancedSearchResult<T> {
  const [results, setResults] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFiltersState] = useState<SearchFilters>({
    ...defaultSearchFilters,
    ...defaultFilters,
  });

  const search = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from(table).select(selectFields, { count: 'exact' });

      if (filters.query && filters.query.trim()) {
        const searchConditions = searchFields
          .map((field) => `${field}.ilike.%${filters.query}%`)
          .join(',');
        query = query.or(searchConditions);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', toDate.toISOString());
      }

      if (filters.sortBy) {
        query = query.order(filters.sortBy, {
          ascending: filters.sortOrder === 'asc',
        });
      }

      const limit = filters.limit || 20;
      const page = filters.page || 1;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to);

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      setResults((data as T[]) || []);
      setTotal(totalCount);

      const result = {
        data: (data as T[]) || [],
        total: totalCount,
        page,
        totalPages,
      };

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      logger.error('Search error:', err);
      setError(err as Error);
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [table, selectFields, searchFields, filters, onSuccess]);

  const setFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFiltersState((prev) => {
      const isNewQuery = newFilters.query !== undefined && newFilters.query !== prev.query;
      return {
        ...prev,
        ...newFilters,
        ...(isNewQuery ? { page: 1 } : {}),
      };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState({ ...defaultSearchFilters, ...defaultFilters });
  }, [defaultFilters]);

  const nextPage = useCallback(() => {
    const limit = filters.limit || 20;
    const maxPages = Math.ceil(total / limit);
    if (filters.page && filters.page < maxPages) {
      setFilters({ page: filters.page + 1 });
    }
  }, [filters.page, filters.limit, total, setFilters]);

  const prevPage = useCallback(() => {
    if (filters.page && filters.page > 1) {
      setFilters({ page: filters.page - 1 });
    }
  }, [filters.page, setFilters]);

  const goToPage = useCallback(
    (page: number) => {
      const limit = filters.limit || 20;
      const maxPages = Math.ceil(total / limit);
      if (page >= 1 && page <= maxPages) {
        setFilters({ page });
      }
    },
    [filters.limit, total, setFilters]
  );

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.query, filters.status, filters.dateFrom, filters.dateTo, filters.sortBy, filters.sortOrder, filters.page, filters.limit]);

  const limit = filters.limit || 20;
  const totalPages = Math.ceil(total / limit);

  return {
    results,
    total,
    page: filters.page || 1,
    totalPages,
    loading,
    error,
    filters,
    setFilters,
    resetFilters,
    search,
    nextPage,
    prevPage,
    goToPage,
  };
}
