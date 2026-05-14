import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import logger from '../utils/logger';
import { getCurrentMedicId } from '../utils/auth';

// Types
export type AlertPriority = 'critical' | 'high' | 'medium' | 'low';
export type AlertType =
  | 'high_risk_patient'
  | 'overdue_follow_up'
  | 'no_recent_consultation'
  | 'missed_appointment';

export interface PatientAlert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  patient_id: string;
  patient_name: string;
  title: string;
  message: string;
  metadata: {
    riskScore?: number;
    follow_up_date?: string;
    last_consultation_date?: string;
    appointment_date?: string;
    days_overdue?: number;
    primary_pathology?: string;
  };
  created_at: string;
  is_acknowledged: boolean;
}

export interface UsePatientAlertsResult {
  alerts: PatientAlert[];
  alertsByPriority: {
    critical: PatientAlert[];
    high: PatientAlert[];
    medium: PatientAlert[];
    low: PatientAlert[];
  };
  totalCount: number;
  criticalCount: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => void;
}

// Helper functions
const getDateString = (daysAgo: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const calculateDaysOverdue = (dateStr: string): number => {
  const date = new Date(dateStr);
  const today = new Date();
  const diffTime = today.getTime() - date.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const generateAlertId = (type: string, entityId: string, subType?: string): string => {
  const baseId = `${type}-${entityId}`;
  return subType ? `${baseId}-${subType}` : baseId;
};

const getBaseAlertId = (alertId: string): string => {
  const parts = alertId.split('-');
  if (parts.length >= 2) {
    return `${parts[0]}-${parts[1]}`;
  }
  return alertId;
};

export const usePatientAlerts = (): UsePatientAlertsResult => {
  const [alerts, setAlerts] = useState<PatientAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());

  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      logger.info('[usePatientAlerts] Fetching patient alerts...');

      const today = getDateString(0);
      const thirtyDaysAgo = getDateString(30);
      const allAlerts: PatientAlert[] = [];

      // Run all queries in parallel, each one handles its own errors
      const results = await Promise.allSettled([
        // Query 1: High-risk patients (riskScore >= 70)
        supabase
          .from('patients')
          .select('id, first_name, last_name, riskScore, primary_pathology, status')
          .eq('medic_id', getCurrentMedicId()!)
          .gte('riskScore', 70)
          .order('riskScore', { ascending: false }),

        // Query 2: Pending consultations without AI response (needs attention)
        supabase
          .from('consultations')
          .select('id, patient_id, symptoms, status, created_at')
          .eq('status', 'pending')
          .is('ai_response', null),

        // Query 3: Patients with status 'active' and their consultations
        supabase
          .from('patients')
          .select('id, first_name, last_name, status, created_at')
          .eq('medic_id', getCurrentMedicId()!)
          .order('created_at', { ascending: false }),

        // Query 4: Missed/cancelled appointments (last 30 days)
        supabase
          .from('appointments')
          .select('id, patient_id, patient_name, appointment_date, appointment_time, status')
          .in('status', ['cancelled', 'annule', 'no_show'])
          .gte('appointment_date', thirtyDaysAgo)
          .order('appointment_date', { ascending: false }),

        // Query 5: Unacknowledged analytics alerts
        supabase
          .from('analytics_alerts')
          .select('id, title, message, severity, created_at, is_acknowledged')
          .eq('is_acknowledged', false)
          .order('created_at', { ascending: false }),
      ]);

      // Process Query 1: High-risk patients
      if (results[0].status === 'fulfilled') {
        const { data: highRiskPatients, error: err } = results[0].value;
        if (!err && highRiskPatients) {
          highRiskPatients.forEach((patient) => {
            const riskScore = patient.riskScore || 70;
            const priority: AlertPriority = riskScore >= 85 ? 'critical' : 'high';
            allAlerts.push({
              id: generateAlertId('high_risk', patient.id),
              type: 'high_risk_patient',
              priority,
              patient_id: patient.id,
              patient_name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Patient inconnu',
              title: priority === 'critical' ? 'Patient à risque critique' : 'Patient à risque élevé',
              message: `Score de risque: ${riskScore}${patient.primary_pathology ? ` - ${patient.primary_pathology}` : ''}`,
              metadata: { riskScore, primary_pathology: patient.primary_pathology },
              created_at: new Date().toISOString(),
              is_acknowledged: false,
            });
          });
        }
      }

      // Process Query 2: Pending consultations without AI response
      if (results[1].status === 'fulfilled') {
        const { data: pendingConsults, error: err } = results[1].value;
        if (!err && pendingConsults) {
          pendingConsults.forEach((consultation) => {
            const daysOld = calculateDaysOverdue(consultation.created_at);
            let priority: AlertPriority = 'medium';
            if (daysOld > 7) priority = 'critical';
            else if (daysOld > 3) priority = 'high';

            allAlerts.push({
              id: generateAlertId('pending_consult', consultation.id),
              type: 'overdue_follow_up',
              priority,
              patient_id: consultation.patient_id || 'unknown',
              patient_name: 'Consultation en attente',
              title: 'Consultation sans réponse IA',
              message: consultation.symptoms
                ? `Symptômes: "${consultation.symptoms}" - en attente depuis ${daysOld > 0 ? `${daysOld} jour${daysOld > 1 ? 's' : ''}` : "aujourd'hui"}`
                : `Consultation en attente depuis ${daysOld > 0 ? `${daysOld} jour${daysOld > 1 ? 's' : ''}` : "aujourd'hui"}`,
              metadata: { days_overdue: daysOld },
              created_at: consultation.created_at,
              is_acknowledged: false,
            });
          });
        }
      }

      // Process Query 3: Patients without recent consultation (cross-reference with consultations)
      if (results[2].status === 'fulfilled') {
        const { data: allPatients, error: err } = results[2].value;
        if (!err && allPatients && allPatients.length > 0) {
          // Only check patients created more than 30 days ago
          const oldPatients = allPatients.filter(p => calculateDaysOverdue(p.created_at) > 30);
          if (oldPatients.length > 0) {
            // Fetch recent consultations to avoid false positives
            const { data: recentConsultations } = await supabase
              .from('consultations')
              .select('patient_id')
              .gte('created_at', thirtyDaysAgo);
            const recentPatientIds = new Set((recentConsultations || []).map(c => c.patient_id));

            oldPatients.forEach((patient) => {
              if (!recentPatientIds.has(patient.id)) {
                const daysSinceCreation = calculateDaysOverdue(patient.created_at);
                allAlerts.push({
                  id: generateAlertId('no_recent', patient.id),
                  type: 'no_recent_consultation',
                  priority: 'medium',
                  patient_id: patient.id,
                  patient_name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Patient inconnu',
                  title: 'Patient sans activité récente',
                  message: `Aucune consultation depuis ${daysSinceCreation} jours`,
                  metadata: {},
                  created_at: new Date().toISOString(),
                  is_acknowledged: false,
                });
              }
            });
          }
        }
      }

      // Process Query 4: Missed appointments
      if (results[3].status === 'fulfilled') {
        const { data: missedAppointments, error: err } = results[3].value;
        if (!err && missedAppointments) {
          missedAppointments.forEach((appointment) => {
            allAlerts.push({
              id: generateAlertId('missed', appointment.id),
              type: 'missed_appointment',
              priority: 'high',
              patient_id: appointment.patient_id || 'unknown',
              patient_name: appointment.patient_name || 'Patient inconnu',
              title: 'Rendez-vous manqué',
              message: `Rendez-vous du ${new Date(appointment.appointment_date).toLocaleDateString('fr-FR')} non honoré`,
              metadata: { appointment_date: appointment.appointment_date },
              created_at: new Date().toISOString(),
              is_acknowledged: false,
            });
          });
        }
      }

      // Process Query 5: Unacknowledged analytics alerts
      if (results[4].status === 'fulfilled') {
        const { data: analyticsAlerts, error: err } = results[4].value;
        if (!err && analyticsAlerts) {
          analyticsAlerts.forEach((alert) => {
            const severityMap: Record<string, AlertPriority> = {
              critical: 'critical',
              high: 'high',
              warning: 'medium',
              info: 'low',
            };
            const priority = severityMap[alert.severity] || 'medium';

            allAlerts.push({
              id: generateAlertId('analytics', alert.id),
              type: 'high_risk_patient',
              priority,
              patient_id: 'system',
              patient_name: 'Système IA',
              title: alert.title || 'Alerte IA',
              message: alert.message || 'Alerte analytique nécessitant votre attention',
              metadata: {},
              created_at: alert.created_at,
              is_acknowledged: false,
            });
          });
        }
      }

      // Sort alerts by priority
      const priorityOrder: Record<AlertPriority, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
      };

      const sortedAlerts = allAlerts.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );

      // Deduplicate alerts by base ID
      const deduplicatedAlerts = sortedAlerts.reduce((acc, alert) => {
        const baseId = getBaseAlertId(alert.id);
        if (!acc.some((a) => getBaseAlertId(a.id) === baseId)) {
          acc.push(alert);
        }
        return acc;
      }, [] as PatientAlert[]);

      // Filter out acknowledged alerts
      const filteredAlerts = deduplicatedAlerts.filter(
        (alert) => !acknowledgedIds.has(getBaseAlertId(alert.id))
      );

      logger.info('[usePatientAlerts] Alerts fetched:', {
        total: filteredAlerts.length,
        critical: filteredAlerts.filter((a) => a.priority === 'critical').length,
        high: filteredAlerts.filter((a) => a.priority === 'high').length,
        medium: filteredAlerts.filter((a) => a.priority === 'medium').length,
      });

      setAlerts(filteredAlerts);
    } catch (err) {
      logger.error('[usePatientAlerts] Error:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [acknowledgedIds]);

  // Acknowledge an alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    const baseId = getBaseAlertId(alertId);
    logger.info('[usePatientAlerts] Acknowledging alert:', baseId);
    setAcknowledgedIds((prev) => new Set([...prev, baseId]));
    setAlerts((prev) => prev.filter((a) => getBaseAlertId(a.id) !== baseId));
  }, []);

  // Group alerts by priority
  const alertsByPriority = useMemo(
    () => ({
      critical: alerts.filter((a) => a.priority === 'critical'),
      high: alerts.filter((a) => a.priority === 'high'),
      medium: alerts.filter((a) => a.priority === 'medium'),
      low: alerts.filter((a) => a.priority === 'low'),
    }),
    [alerts]
  );

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Realtime removed — polling interval above covers live updates

  return {
    alerts,
    alertsByPriority,
    totalCount: alerts.length,
    criticalCount: alertsByPriority.critical.length,
    isLoading,
    error,
    refetch: fetchAlerts,
    acknowledgeAlert,
  };
};
