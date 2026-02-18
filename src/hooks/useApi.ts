/**
 * useApi Hook
 *
 * Custom hook for API calls with:
 * - Integration with React Query
 * - Automatic error handling
 * - Loading states
 * - Toast notifications
 * - Type safety
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import api, { ApiResponse, ApiError, RequestConfig } from '../services/api';
import { handleError, getUserMessage, ErrorType } from '../utils/errorHandler';
import { useToast } from '../components/Common/Toast';

// Types
interface UseApiQueryOptions<T> extends Omit<UseQueryOptions<T, ApiError>, 'queryKey' | 'queryFn'> {
  showErrorToast?: boolean;
}

interface UseApiMutationOptions<TData, TVariables> extends Omit<UseMutationOptions<TData, ApiError, TVariables>, 'mutationFn'> {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

interface ApiState<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
}

/**
 * Hook for GET requests with React Query
 */
export function useApiQuery<T>(
  queryKey: string[],
  endpoint: string,
  config?: RequestConfig,
  options?: UseApiQueryOptions<T>
) {
  const { showErrorToast = true, ...queryOptions } = options || {};
  const { showToast } = useToast();

  return useQuery<T, ApiError>({
    queryKey,
    queryFn: async () => {
      const response = await api.get<T>(endpoint, config);

      if (response.error) {
        if (showErrorToast) {
          showToast({
            title: getUserMessage(response.error.code as ErrorType) || response.error.message,
            type: 'error'
          });
        }
        throw response.error;
      }

      return response.data as T;
    },
    ...queryOptions,
  });
}

/**
 * Hook for mutations (POST, PUT, DELETE) with React Query
 */
export function useApiMutation<TData, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: UseApiMutationOptions<TData, TVariables>
) {
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Opération réussie',
    ...mutationOptions
  } = options || {};
  const { showToast } = useToast();

  return useMutation<TData, ApiError, TVariables>({
    mutationFn: async (variables) => {
      const response = await mutationFn(variables);

      if (response.error) {
        if (showErrorToast) {
          showToast({
            title: getUserMessage(response.error.code as ErrorType) || response.error.message,
            type: 'error'
          });
        }
        throw response.error;
      }

      if (showSuccessToast) {
        showToast({ title: successMessage, type: 'success' });
      }

      return response.data as TData;
    },
    ...mutationOptions,
  });
}

/**
 * Hook for simple API calls without React Query
 */
export function useApiCall<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });
  const { showToast } = useToast();

  const execute = useCallback(async (
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    endpoint: string,
    body?: unknown,
    config?: RequestConfig & { showErrorToast?: boolean; showSuccessToast?: boolean; successMessage?: string }
  ): Promise<ApiResponse<T>> => {
    const { showErrorToast = true, showSuccessToast = false, successMessage = 'Opération réussie', ...apiConfig } = config || {};

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let response: ApiResponse<T>;

      switch (method) {
        case 'get':
          response = await api.get<T>(endpoint, apiConfig);
          break;
        case 'post':
          response = await api.post<T>(endpoint, body, apiConfig);
          break;
        case 'put':
          response = await api.put<T>(endpoint, body, apiConfig);
          break;
        case 'patch':
          response = await api.patch<T>(endpoint, body, apiConfig);
          break;
        case 'delete':
          response = await api.delete<T>(endpoint, apiConfig);
          break;
      }

      if (response.error) {
        setState({ data: null, error: response.error, isLoading: false });
        if (showErrorToast) {
          showToast({
            title: getUserMessage(response.error.code as ErrorType) || response.error.message,
            type: 'error'
          });
        }
        handleError(response.error.message, { endpoint, method });
      } else {
        setState({ data: response.data, error: null, isLoading: false });
        if (showSuccessToast) {
          showToast({ title: successMessage, type: 'success' });
        }
      }

      return response;
    } catch (error) {
      const apiError: ApiError = {
        message: (error as Error).message,
        code: 'UNKNOWN_ERROR',
        status: 0,
      };
      setState({ data: null, error: apiError, isLoading: false });
      handleError(error as Error, { endpoint, method });
      return { data: null, error: apiError, status: 0 };
    }
  }, [showToast]);

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return {
    ...state,
    execute,
    reset,
    get: (endpoint: string, config?: RequestConfig) => execute('get', endpoint, undefined, config),
    post: (endpoint: string, body?: unknown, config?: RequestConfig) => execute('post', endpoint, body, config),
    put: (endpoint: string, body?: unknown, config?: RequestConfig) => execute('put', endpoint, body, config),
    patch: (endpoint: string, body?: unknown, config?: RequestConfig) => execute('patch', endpoint, body, config),
    del: (endpoint: string, config?: RequestConfig) => execute('delete', endpoint, undefined, config),
  };
}

/**
 * Hook for calling Supabase Edge Functions
 */
export function useEdgeFunction<TData, TVariables = unknown>(
  functionName: string,
  options?: UseApiMutationOptions<TData, TVariables>
) {
  return useApiMutation<TData, TVariables>(
    (variables) => api.callFunction<TData>(functionName, variables),
    options
  );
}

/**
 * Prefetch data for a query
 */
export function usePrefetch() {
  const queryClient = useQueryClient();

  return useCallback(async <T>(
    queryKey: string[],
    endpoint: string,
    config?: RequestConfig
  ) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        const response = await api.get<T>(endpoint, config);
        if (response.error) throw response.error;
        return response.data;
      },
    });
  }, [queryClient]);
}

/**
 * Invalidate queries by key
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return useCallback((queryKey: string[]) => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient]);
}
