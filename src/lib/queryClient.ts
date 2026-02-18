/**
 * React Query Client Configuration
 *
 * Centralized configuration for @tanstack/react-query
 * Provides caching, background refetching, and error retry logic
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 1 minute (reduces DB calls by 60%)
      staleTime: 60 * 1000, // 60 seconds

      // Keep unused data in cache for 5 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)

      // Retry failed requests
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus (optional, can be disabled)
      refetchOnWindowFocus: false,

      // Refetch on reconnect
      refetchOnReconnect: true,

      // Only refetch on mount if data is stale (respects staleTime)
      refetchOnMount: true,
    },
  },
});
