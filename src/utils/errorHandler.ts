/**
 * Global Error Handler
 *
 * Provides centralized error handling with:
 * - Global error interception (window.onerror)
 * - Unhandled promise rejection handling
 * - Network error detection
 * - Error reporting to monitoring services
 * - User-friendly error messages
 */

import logger from './logger';

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  context?: Record<string, unknown>;
  timestamp: string;
  handled: boolean;
}

// Error callbacks
type ErrorCallback = (error: AppError) => void;
const errorCallbacks: ErrorCallback[] = [];

/**
 * Subscribe to global errors
 */
export const onError = (callback: ErrorCallback): (() => void) => {
  errorCallbacks.push(callback);
  return () => {
    const index = errorCallbacks.indexOf(callback);
    if (index > -1) {
      errorCallbacks.splice(index, 1);
    }
  };
};

/**
 * Notify all error subscribers
 */
const notifySubscribers = (error: AppError): void => {
  errorCallbacks.forEach(callback => {
    try {
      callback(error);
    } catch (e) {
      console.error('Error in error callback:', e);
    }
  });
};

/**
 * Classify error type based on error characteristics
 */
const classifyError = (error: Error | string): ErrorType => {
  const message = typeof error === 'string' ? error : error.message;
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
    return ErrorType.NETWORK;
  }
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('401') || lowerMessage.includes('token')) {
    return ErrorType.AUTH;
  }
  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
    return ErrorType.VALIDATION;
  }
  if (lowerMessage.includes('500') || lowerMessage.includes('server')) {
    return ErrorType.SERVER;
  }

  return ErrorType.UNKNOWN;
};

/**
 * Get user-friendly message for error type
 */
export const getUserMessage = (type: ErrorType): string => {
  const messages: Record<ErrorType, string> = {
    [ErrorType.NETWORK]: 'Problème de connexion. Vérifiez votre connexion internet.',
    [ErrorType.AUTH]: 'Votre session a expiré. Veuillez vous reconnecter.',
    [ErrorType.VALIDATION]: 'Les données saisies sont invalides.',
    [ErrorType.SERVER]: 'Le serveur a rencontré une erreur. Réessayez plus tard.',
    [ErrorType.CLIENT]: 'Une erreur est survenue dans l\'application.',
    [ErrorType.UNKNOWN]: 'Une erreur inattendue est survenue.',
  };
  return messages[type];
};

/**
 * Create standardized AppError
 */
export const createAppError = (
  error: Error | string,
  context?: Record<string, unknown>
): AppError => {
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  const type = classifyError(errorObj);

  return {
    type,
    message: errorObj.message,
    originalError: errorObj,
    context,
    timestamp: new Date().toISOString(),
    handled: false,
  };
};

/**
 * Handle and log an error
 */
export const handleError = (
  error: Error | string,
  context?: Record<string, unknown>
): AppError => {
  const appError = createAppError(error, context);
  appError.handled = true;

  // Log the error
  logger.error(appError.message, appError.originalError, {
    component: 'errorHandler',
    errorType: appError.type,
    ...context,
  });

  // Notify subscribers
  notifySubscribers(appError);

  return appError;
};

/**
 * Initialize global error handlers
 */
export const initGlobalErrorHandlers = (): void => {
  // Handle uncaught errors
  window.onerror = (message, source, lineno, colno, error) => {
    const appError = createAppError(
      error || String(message),
      { source, lineno, colno }
    );

    logger.error('Uncaught error', error || new Error(String(message)), {
      component: 'globalErrorHandler',
      source,
      lineno,
      colno,
    });

    notifySubscribers(appError);

    // Return false to allow default browser handling
    return false;
  };

  // Handle unhandled promise rejections
  window.onunhandledrejection = (event: PromiseRejectionEvent) => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));

    const appError = createAppError(error, { type: 'unhandledRejection' });

    logger.error('Unhandled promise rejection', error, {
      component: 'globalErrorHandler',
      reason: event.reason,
    });

    notifySubscribers(appError);
  };

  // Handle network errors (offline detection)
  window.addEventListener('offline', () => {
    const appError: AppError = {
      type: ErrorType.NETWORK,
      message: 'Connection lost',
      timestamp: new Date().toISOString(),
      handled: true,
    };

    logger.warn('Network offline', { component: 'globalErrorHandler' });
    notifySubscribers(appError);
  });

  window.addEventListener('online', () => {
    logger.info('Network online', { component: 'globalErrorHandler' });
  });

  logger.info('Global error handlers initialized', { component: 'globalErrorHandler' });
};

/**
 * Wrap async function with error handling
 */
export const withErrorHandling = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: Record<string, unknown>
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error as Error, context);
      throw error;
    }
  }) as T;
};

/**
 * Try-catch wrapper for sync functions
 */
export const tryCatch = <T>(
  fn: () => T,
  fallback: T,
  context?: Record<string, unknown>
): T => {
  try {
    return fn();
  } catch (error) {
    handleError(error as Error, context);
    return fallback;
  }
};

/**
 * Async try-catch wrapper
 */
export const tryCatchAsync = async <T>(
  fn: () => Promise<T>,
  fallback: T,
  context?: Record<string, unknown>
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    handleError(error as Error, context);
    return fallback;
  }
};

export default {
  handleError,
  createAppError,
  getUserMessage,
  onError,
  initGlobalErrorHandlers,
  withErrorHandling,
  tryCatch,
  tryCatchAsync,
  ErrorType,
};
