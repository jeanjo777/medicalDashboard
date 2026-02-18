/**
 * useSupabaseQuery - Custom hook for data fetching with cache
 *
 * Features:
 * - In-memory cache with TTL
 * - Automatic refetch on interval
 * - Manual refetch function
 * - Cache invalidation
 * - Loading & error states
 * - Optimistic updates support
 *
 * Usage:
 * ```typescript
 * const { data, loading, error, refetch, invalidate } = useSupabaseQuery(
 *   () => supabase.from('patients').select('*'),
 *   {
 *     cacheKey: 'all-patients',
 *     cacheDuration: 5 * 60 * 1000, // 5 minutes
 *     refetchInterval: 30 * 1000     // Refetch every 30s
 *   }
 * );
 * ```
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import logger from '../utils/logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  duration: number;
}

interface UseSupabaseQueryOptions {
  cacheKey: string;
  cacheDuration?: number;
  refetchInterval?: number;
  enabled?: boolean;
}

interface UseSupabaseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
  isStale: boolean;
}

// Global cache storage
const cache = new Map<string, CacheEntry<any>>();

// Cache event subscribers
const subscribers = new Map<string, Set<Function>>();

/**
 * Get cached data if valid
 */
function getCachedData<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > entry.duration;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Set cached data
 */
function setCachedData<T>(key: string, data: T, duration: number) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    duration
  });

  // Notify subscribers
  notifySubscribers(key, data);
}

/**
 * Invalidate cache entry
 */
function invalidateCache(key: string) {
  cache.delete(key);
  notifySubscribers(key, null);
}

/**
 * Subscribe to cache changes
 */
function subscribeToCache(key: string, callback: Function) {
  if (!subscribers.has(key)) {
    subscribers.set(key, new Set());
  }
  subscribers.get(key)!.add(callback);

  return () => {
    subscribers.get(key)?.delete(callback);
  };
}

/**
 * Notify all subscribers
 */
function notifySubscribers(key: string, data: any) {
  subscribers.get(key)?.forEach(callback => callback(data));
}

/**
 * Main hook
 */
export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: UseSupabaseQueryOptions
): UseSupabaseQueryResult<T> {
  const {
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // Default: 5 minutes
    refetchInterval,
    enabled = true
  } = options;

  const [data, setData] = useState<T | null>(() => getCachedData<T>(cacheKey));
  const [loading, setLoading] = useState<boolean>(!data);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);

  const isMountedRef = useRef(true);
  const refetchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Fetch data from Supabase
   */
  const fetchData = useCallback(async (skipCache = false) => {
    if (!enabled) return;

    // Check cache first
    if (!skipCache) {
      const cached = getCachedData<T>(cacheKey);
      if (cached) {
        logger.info(`[useSupabaseQuery] Cache HIT: ${cacheKey}`);
        if (isMountedRef.current) {
          setData(cached);
          setLoading(false);
          setIsStale(false);
        }
        return;
      }
    }

    logger.info(`[useSupabaseQuery] Cache MISS: ${cacheKey} - Fetching...`);

    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const { data: fetchedData, error: fetchError } = await queryFn();

      if (!isMountedRef.current) return;

      if (fetchError) {
        throw new Error(fetchError.message || 'Failed to fetch data');
      }

      // Update cache
      if (fetchedData !== null) {
        setCachedData(cacheKey, fetchedData, cacheDuration);
      }

      setData(fetchedData);
      setIsStale(false);

    } catch (err: any) {
      logger.error(`[useSupabaseQuery] Error: ${cacheKey}`, err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to fetch data');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [cacheKey, queryFn, cacheDuration, enabled]);

  /**
   * Manual refetch (bypass cache)
   */
  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  /**
   * Invalidate cache
   */
  const invalidate = useCallback(() => {
    invalidateCache(cacheKey);
    setIsStale(true);
  }, [cacheKey]);

  /**
   * Initial fetch
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Setup refetch interval
   */
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    refetchIntervalRef.current = setInterval(() => {
      logger.info(`[useSupabaseQuery] Auto-refetch: ${cacheKey}`);
      fetchData(true);
    }, refetchInterval);

    return () => {
      if (refetchIntervalRef.current) {
        clearInterval(refetchIntervalRef.current);
      }
    };
  }, [refetchInterval, fetchData, enabled]);

  /**
   * Subscribe to cache changes
   */
  useEffect(() => {
    const unsubscribe = subscribeToCache(cacheKey, (newData: T | null) => {
      if (isMountedRef.current && newData !== null) {
        setData(newData);
        setIsStale(false);
      }
    });

    return unsubscribe;
  }, [cacheKey]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
    isStale
  };
}

/**
 * Global cache utilities
 */
export const cacheUtils = {
  /**
   * Clear all cache
   */
  clearAll: () => {
    logger.info('[cacheUtils] Clearing all cache');
    cache.clear();
  },

  /**
   * Get cache size
   */
  getSize: () => cache.size,

  /**
   * Get all cache keys
   */
  getKeys: () => Array.from(cache.keys()),

  /**
   * Get cache stats
   */
  getStats: () => {
    const entries = Array.from(cache.entries());
    const now = Date.now();

    return entries.map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      ttl: entry.duration - (now - entry.timestamp),
      expired: now - entry.timestamp > entry.duration
    }));
  },

  /**
   * Prefetch data
   */
  prefetch: async <T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    cacheKey: string,
    cacheDuration: number = 5 * 60 * 1000
  ) => {
    logger.info(`[cacheUtils] Prefetching: ${cacheKey}`);

    try {
      const { data, error } = await queryFn();

      if (error) {
        logger.error(`[cacheUtils] Prefetch error: ${cacheKey}`, error);
        return;
      }

      if (data !== null) {
        setCachedData(cacheKey, data, cacheDuration);
      }
    } catch (err) {
      logger.error(`[cacheUtils] Prefetch error: ${cacheKey}`, err);
    }
  }
};

export default useSupabaseQuery;
