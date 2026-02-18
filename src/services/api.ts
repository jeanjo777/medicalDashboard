/**
 * Service API Centralisé
 *
 * Gère toutes les requêtes HTTP avec:
 * - Gestion automatique des tokens
 * - Retry logic avec backoff exponentiel
 * - Timeout configurable
 * - Intercepteurs de requêtes/réponses
 * - Gestion d'erreurs uniformisée
 */

import { getAuthToken, logout } from '../utils/auth';
import logger from '../utils/logger';

// Types
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  status: number;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: unknown;
}

export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  requireAuth?: boolean;
  headers?: Record<string, string>;
}

// Configuration par défaut
const DEFAULT_CONFIG: Required<RequestConfig> = {
  timeout: 30000,
  retries: 2,
  retryDelay: 1000,
  requireAuth: true,
  headers: {},
};

// URL de base de l'API
const getBaseUrl = (): string => {
  return import.meta.env.VITE_SUPABASE_URL || '';
};

/**
 * Crée une erreur API standardisée
 */
const createApiError = (
  message: string,
  code: string,
  status: number,
  details?: unknown
): ApiError => ({
  message,
  code,
  status,
  details,
});

/**
 * Gère les erreurs de réponse HTTP
 */
const handleResponseError = async (response: Response): Promise<ApiError> => {
  let errorMessage = 'Une erreur est survenue';
  let errorDetails: unknown;

  try {
    const errorData = await response.json();
    errorMessage = errorData.message || errorData.error || errorMessage;
    errorDetails = errorData;
  } catch {
    errorMessage = response.statusText || errorMessage;
  }

  // Codes d'erreur spécifiques
  const errorCodes: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    429: 'RATE_LIMITED',
    500: 'SERVER_ERROR',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE',
  };

  return createApiError(
    errorMessage,
    errorCodes[response.status] || 'UNKNOWN_ERROR',
    response.status,
    errorDetails
  );
};

/**
 * Délai avec backoff exponentiel
 */
const delay = (ms: number, attempt: number): Promise<void> => {
  const backoffMs = ms * Math.pow(2, attempt - 1);
  return new Promise(resolve => setTimeout(resolve, backoffMs));
};

/**
 * Vérifie si l'erreur est récupérable (retry possible)
 */
const isRetryableError = (status: number): boolean => {
  return [408, 429, 500, 502, 503, 504].includes(status);
};

/**
 * Classe principale du service API
 */
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getBaseUrl();
  }

  /**
   * Méthode générique pour les requêtes
   */
  async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    body?: unknown,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    const { timeout, retries, retryDelay, requireAuth, headers } = mergedConfig;

    // Construire les headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Ajouter le token si requis
    if (requireAuth) {
      const token = getAuthToken();
      if (!token) {
        logger.warn('Token manquant pour requête authentifiée', {
          component: 'api',
          action: 'request',
        });
        return {
          data: null,
          error: createApiError('Non authentifié', 'UNAUTHORIZED', 401),
          status: 401,
        };
      }
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Fonction de tentative de requête
    const attemptRequest = async (attempt: number): Promise<ApiResponse<T>> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const url = endpoint.startsWith('http')
          ? endpoint
          : `${this.baseUrl}${endpoint}`;

        logger.debug(`API ${method} ${endpoint}`, {
          component: 'api',
          action: method,
        });

        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Gestion de la déconnexion automatique
        if (response.status === 401 && requireAuth) {
          logger.warn('Session expirée, déconnexion', { component: 'api' });
          logout();
          return {
            data: null,
            error: createApiError('Session expirée', 'SESSION_EXPIRED', 401),
            status: 401,
          };
        }

        // Gestion des erreurs
        if (!response.ok) {
          const error = await handleResponseError(response);

          // Retry si possible
          if (isRetryableError(response.status) && attempt < retries) {
            logger.debug(`Retry ${attempt}/${retries} pour ${endpoint}`, {
              component: 'api',
            });
            await delay(retryDelay, attempt);
            return attemptRequest(attempt + 1);
          }

          logger.error(`Erreur API: ${error.message}`, undefined, {
            component: 'api',
            action: method,
            status: response.status,
          });

          return { data: null, error, status: response.status };
        }

        // Succès
        const data = response.status === 204 ? null : await response.json();
        return { data, error: null, status: response.status };

      } catch (error) {
        clearTimeout(timeoutId);

        // Timeout
        if (error instanceof Error && error.name === 'AbortError') {
          if (attempt < retries) {
            logger.debug(`Timeout, retry ${attempt}/${retries}`, { component: 'api' });
            await delay(retryDelay, attempt);
            return attemptRequest(attempt + 1);
          }

          return {
            data: null,
            error: createApiError('Délai d\'attente dépassé', 'TIMEOUT', 408),
            status: 408,
          };
        }

        // Erreur réseau
        if (attempt < retries) {
          logger.debug(`Erreur réseau, retry ${attempt}/${retries}`, { component: 'api' });
          await delay(retryDelay, attempt);
          return attemptRequest(attempt + 1);
        }

        logger.error('Erreur réseau', error as Error, { component: 'api' });

        return {
          data: null,
          error: createApiError('Erreur de connexion', 'NETWORK_ERROR', 0),
          status: 0,
        };
      }
    };

    return attemptRequest(1);
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, config);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', body, config);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', body, config);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PATCH', body, config);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE', undefined, config);
  }

  /**
   * Appel aux Edge Functions Supabase
   */
  async callFunction<T>(
    functionName: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.post<T>(`/functions/v1/${functionName}`, body, config);
  }
}

// Instance singleton
const api = new ApiService();

export default api;
export { api };
