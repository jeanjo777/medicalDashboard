/**
 * Custom Logger Utility - Enhanced Version
 *
 * Provides intelligent logging that:
 * - Only logs in development mode (except errors)
 * - Supports multiple log levels
 * - Can be integrated with monitoring services (Sentry, DataDog, etc.)
 * - Provides structured logging with context
 * - Session tracking for better debugging
 * - Batch storage for production logs
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  userId?: string;
  action?: string;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  sessionId: string;
}

// Generate unique session ID
const getSessionId = (): string => {
  if (typeof sessionStorage === 'undefined') return 'server';
  const stored = sessionStorage.getItem('log_session_id');
  if (stored) return stored;
  const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  sessionStorage.setItem('log_session_id', newId);
  return newId;
};

class Logger {
  private isDevelopment: boolean;
  private enabledLevels: Set<LogLevel>;
  private sessionId: string;
  private logBuffer: LogEntry[] = [];
  private readonly maxBufferSize = 100;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.enabledLevels = new Set(['debug', 'info', 'warn', 'error']);
    this.sessionId = getSessionId();
  }

  /**
   * Debug level - Only in development
   * Use for detailed debugging information
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment && this.enabledLevels.has('debug')) {
      if (context) {
        console.log(
          `%c[DEBUG] ${message}`,
          'color: #9CA3AF; font-weight: normal;',
          { ...context, timestamp: new Date().toISOString() }
        );
      } else {
        console.log(`%c[DEBUG] ${message}`, 'color: #9CA3AF; font-weight: normal;');
      }
    }
  }

  /**
   * Info level - Only in development
   * Use for general informational messages
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment && this.enabledLevels.has('info')) {
      if (context) {
        console.log(
          `%c[INFO] ${message}`,
          'color: #3B82F6; font-weight: bold;',
          { ...context, timestamp: new Date().toISOString() }
        );
      } else {
        console.log(`%c[INFO] ${message}`, 'color: #3B82F6; font-weight: bold;');
      }
    }
  }

  /**
   * Warning level - Always logs
   * Use for potentially harmful situations
   */
  warn(message: string, context?: LogContext): void {
    if (this.enabledLevels.has('warn')) {
      const contextData = context ? { ...context, timestamp: new Date().toISOString() } : undefined;

      if (contextData) {
        console.warn(`[WARN] ${message}`, contextData);
      } else {
        console.warn(`[WARN] ${message}`);
      }

      // In production, send to monitoring service
      if (!this.isDevelopment) {
        this.sendToMonitoring('warn', message, context);
      }
    }
  }

  /**
   * Error level - Always logs and reports
   * Use for error conditions
   */
  error(message: string, error?: Error, context?: LogContext): void {
    if (this.enabledLevels.has('error')) {
      const errorContext = {
        ...context,
        timestamp: new Date().toISOString(),
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : undefined,
      };

      console.error(`[ERROR] ${message}`, errorContext);

      // Always send errors to monitoring service in production
      if (!this.isDevelopment) {
        this.sendToMonitoring('error', message, errorContext);
      }
    }
  }

  /**
   * Group related logs together
   */
  group(label: string, callback: () => void): void {
    if (this.isDevelopment) {
      console.group(`%c${label}`, 'color: #8B5CF6; font-weight: bold;');
      callback();
      console.groupEnd();
    }
  }

  /**
   * Log a table of data - Only in development
   */
  table(data: unknown[], columns?: string[]): void {
    if (this.isDevelopment) {
      if (columns) {
        console.table(data, columns);
      } else {
        console.table(data);
      }
    }
  }

  /**
   * Performance timing - Only in development
   */
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  /**
   * Add log to buffer for batch sending
   */
  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flushBuffer();
    }
  }

  /**
   * Flush log buffer to storage/server
   */
  flushBuffer(): void {
    if (this.logBuffer.length === 0) return;

    try {
      const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      const allLogs = [...existingLogs, ...this.logBuffer];

      // Keep only last 100 logs
      const trimmedLogs = allLogs.slice(-100);
      localStorage.setItem('error_logs', JSON.stringify(trimmedLogs));

      this.logBuffer = [];
    } catch {
      // Fail silently
    }
  }

  /**
   * Send logs to external monitoring service
   * This is where you'd integrate Sentry, DataDog, etc.
   */
  private sendToMonitoring(
    level: LogLevel,
    message: string,
    context?: unknown
  ): void {
    // Prepare the data structure
    const logData: LogEntry = {
      level,
      message,
      context: context as LogContext,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    };

    // Add to buffer instead of immediate storage
    this.addToBuffer(logData);

    // TODO: Integrate with monitoring service
    // Example for Sentry:
    // if (window.Sentry) {
    //   window.Sentry.captureMessage(message, {
    //     level: level as any,
    //     extra: context,
    //   });
    // }
  }

  /**
   * Disable specific log level
   */
  disableLevel(level: LogLevel): void {
    this.enabledLevels.delete(level);
  }

  /**
   * Enable specific log level
   */
  enableLevel(level: LogLevel): void {
    this.enabledLevels.add(level);
  }

  /**
   * Get all stored error logs (useful for debugging)
   */
  getStoredLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('error_logs') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear stored error logs
   */
  clearStoredLogs(): void {
    try {
      localStorage.removeItem('error_logs');
      this.logBuffer = [];
    } catch {
      // Fail silently
    }
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
}

// Create singleton instance
const logger = new Logger();

// Export as default
export default logger;

// Also export as named export for flexibility
export { logger };

// Export types
export type { LogLevel, LogContext, LogEntry };
