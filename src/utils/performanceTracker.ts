/**
 * Performance Tracker - KPIs pour le système de rendez-vous
 *
 * Objectifs:
 * - Temps de création d'un RDV < 2 secondes
 * - Temps de chargement de la liste < 1 seconde
 * - Taux d'erreur < 1%
 * - Taux d'utilisation des actions (voir/modifier/annuler)
 */
import logger from './logger';


interface PerformanceMetric {
  action: string;
  duration: number;
  timestamp: number;
  success: boolean;
  errorMessage?: string;
}

class PerformanceTracker {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 100;

  startTracking(action: string): number {
    const startTime = performance.now();
    logger.info(`[PerformanceTracker] Started: ${action}`);
    return startTime;
  }

  endTracking(action: string, startTime: number, success: boolean = true, errorMessage?: string) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    const metric: PerformanceMetric = {
      action,
      duration,
      timestamp: Date.now(),
      success,
      errorMessage
    };

    this.metrics.push(metric);

    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    const status = success ? '✓' : '✗';
    const durationFormatted = duration.toFixed(2);
    logger.info(`[PerformanceTracker] ${status} ${action}: ${durationFormatted}ms`);

    if (duration > 2000) {
      logger.warn(`[PerformanceTracker] ⚠️ Slow operation: ${action} took ${durationFormatted}ms (> 2s)`);
    }

    return duration;
  }

  getMetrics(action?: string): PerformanceMetric[] {
    if (action) {
      return this.metrics.filter(m => m.action === action);
    }
    return this.metrics;
  }

  getAverageDuration(action?: string): number {
    const relevantMetrics = this.getMetrics(action);
    if (relevantMetrics.length === 0) return 0;

    const total = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / relevantMetrics.length;
  }

  getSuccessRate(action?: string): number {
    const relevantMetrics = this.getMetrics(action);
    if (relevantMetrics.length === 0) return 100;

    const successCount = relevantMetrics.filter(m => m.success).length;
    return (successCount / relevantMetrics.length) * 100;
  }

  getActionUsage(): Record<string, number> {
    const usage: Record<string, number> = {};
    this.metrics.forEach(m => {
      usage[m.action] = (usage[m.action] || 0) + 1;
    });
    return usage;
  }

  getReport(): {
    totalActions: number;
    averageDuration: number;
    successRate: number;
    actionBreakdown: Record<string, {
      count: number;
      avgDuration: number;
      successRate: number;
    }>;
  } {
    const actions = new Set(this.metrics.map(m => m.action));
    const actionBreakdown: Record<string, any> = {};

    actions.forEach(action => {
      const metrics = this.getMetrics(action);
      actionBreakdown[action] = {
        count: metrics.length,
        avgDuration: this.getAverageDuration(action),
        successRate: this.getSuccessRate(action)
      };
    });

    return {
      totalActions: this.metrics.length,
      averageDuration: this.getAverageDuration(),
      successRate: this.getSuccessRate(),
      actionBreakdown
    };
  }

  logReport() {
    const report = this.getReport();
    console.group('[PerformanceTracker] 📊 Rapport de Performance');
    logger.info(`Total d'actions: ${report.totalActions}`);
    logger.info(`Durée moyenne: ${report.averageDuration.toFixed(2)}ms`);
    logger.info(`Taux de succès: ${report.successRate.toFixed(1)}%`);
    logger.info('\nDétail par action:');
    Object.entries(report.actionBreakdown).forEach(([action, stats]) => {
      logger.info(`  ${action}:`);
      logger.info(`    - Utilisations: ${stats.count}`);
      logger.info(`    - Durée moy: ${stats.avgDuration.toFixed(2)}ms`);
      logger.info(`    - Succès: ${stats.successRate.toFixed(1)}%`);
    });
    console.groupEnd();
  }

  clear() {
    this.metrics = [];
    logger.info('[PerformanceTracker] Metrics cleared');
  }
}

export const performanceTracker = new PerformanceTracker();

export const trackAction = async <T>(
  action: string,
  fn: () => Promise<T>
): Promise<T> => {
  const startTime = performanceTracker.startTracking(action);
  try {
    const result = await fn();
    performanceTracker.endTracking(action, startTime, true);
    return result;
  } catch (error) {
    performanceTracker.endTracking(
      action,
      startTime,
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
};
