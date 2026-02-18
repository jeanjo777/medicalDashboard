import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import logger from '../utils/logger';

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

/**
 * Generate a deterministic alert ID based on type and entity
 * This ensures consistent IDs across refreshes for deduplication
 */
const generateAlertId = (type: string, entityId: string, subType?: string): string => {
  const baseId = `${type}-${entityId}`;
  return subType ? `${baseId}-${subType}` : baseId;
};

/**
 * Extract base ID for acknowledgment matching
 * Returns type-entityId without any suffix
 */
const getBaseAlertId = (alertId: string): string => {
  const parts = alertId.split('-');
  // Alert IDs follow pattern: type-entityId or type-entityId-subType
  // We want to match on type-entityId
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

      // Query 1: High-risk patients (riskScore >= 70)
      const { data: highRiskPatients, error: highRiskError } = await supabase
        .from('patients')
        .select('id, first_name, last_name, riskScore, primary_pathology, status')
        .gte('riskScore', 70)
        .order('riskScore', { ascending: false });

      if (highRiskError) {
        logger.error('[usePatientAlerts] Error fetching high-risk patients:', highRiskError);
      } else if (highRiskPatients) {
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
            metadata: {
              riskScore,
              primary_pathology: patient.primary_pathology,
            },
            created_at: new Date().toISOString(),
            is_acknowledged: false,
          });
        });
      }

      // Query 2: Overdue follow-ups
      const { data: consultationsWithFollowUp, error: followUpError } = await supabase
        .from('consultations')
        .select(`
          id,
          patient_id,
          follow_up_date,
          status,
          patients (
            first_name,
            last_name
          )
        `)
        .lt('follow_up_date', today)
        .not('follow_up_date', 'is', null);

      if (followUpError) {
        logger.error('[usePatientAlerts] Error fetching overdue follow-ups:', followUpError);
      } else if (consultationsWithFollowUp) {
        consultationsWithFollowUp.forEach((consultation) => {
          const daysOverdue = calculateDaysOverdue(consultation.follow_up_date);
          let priority: AlertPriority = 'medium';

          if (daysOverdue > 14) priority = 'critical';
          else if (daysOverdue > 7) priority = 'high';

          const patient = consultation.patients as { first_name?: string; last_name?: string } | null;
          const patientName = patient
            ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim()
            : 'Patient inconnu';

          allAlerts.push({
            id: generateAlertId('overdue_follow_up', consultation.patient_id),
            type: 'overdue_follow_up',
            priority,
            patient_id: consultation.patient_id,
            patient_name: patientName,
            title: 'Suivi en retard',
            message: `Consultation de suivi prévue il y a ${daysOverdue} jour${daysOverdue > 1 ? 's' : ''}`,
            metadata: {
              follow_up_date: consultation.follow_up_date,
              days_overdue: daysOverdue,
            },
            created_at: new Date().toISOString(),
            is_acknowledged: false,
          });
        });
      }

      // Query 3: Patients without recent consultation (> 30 days)
      const { data: allPatients, error: patientsError } = await supabase
        .from('patients')
        .select(`
          id,
          first_name,
          last_name,
          status,
          consultations (
            created_at
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (patientsError) {
        logger.error('[usePatientAlerts] Error fetching patients:', patientsError);
      } else if (allPatients) {
        allPatients.forEach((patient) => {
          const consultations = patient.consultations as { created_at: string }[] | null;

          if (!consultations || consultations.length === 0) {
            // Patient with no consultations at all
            allAlerts.push({
              id: generateAlertId('no_consultation', patient.id),
              type: 'no_recent_consultation',
              priority: 'medium',
              patient_id: patient.id,
              patient_name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Patient inconnu',
              title: 'Aucune consultation',
              message: 'Ce patient n\'a jamais eu de consultation',
              metadata: {},
              created_at: new Date().toISOString(),
              is_acknowledged: false,
            });
          } else {
            // Check last consultation date
            const lastConsultation = consultations.reduce((latest, c) => {
              return new Date(c.created_at) > new Date(latest.created_at) ? c : latest;
            }, consultations[0]);

            const daysSinceLastConsultation = calculateDaysOverdue(lastConsultation.created_at);

            if (daysSinceLastConsultation > 30) {
              allAlerts.push({
                id: generateAlertId('no_recent', patient.id),
                type: 'no_recent_consultation',
                priority: 'medium',
                patient_id: patient.id,
                patient_name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Patient inconnu',
                title: 'Sans consultation récente',
                message: `Dernière consultation il y a ${daysSinceLastConsultation} jours`,
                metadata: {
                  last_consultation_date: lastConsultation.created_at,
                },
                created_at: new Date().toISOString(),
                is_acknowledged: false,
              });
            }
          }
        });
      }

      // Query 4: Missed appointments (last 30 days)
      const { data: missedAppointments, error: missedError } = await supabase
        .from('appointments')
        .select('id, patient_id, patient_name, appointment_date, appointment_time, status')
        .in('status', ['cancelled', 'annule', 'no_show'])
        .gte('appointment_date', thirtyDaysAgo)
        .order('appointment_date', { ascending: false });

      if (missedError) {
        logger.error('[usePatientAlerts] Error fetching missed appointments:', missedError);
      } else if (missedAppointments) {
        missedAppointments.forEach((appointment) => {
          allAlerts.push({
            id: generateAlertId('missed', appointment.id),
            type: 'missed_appointment',
            priority: 'high',
            patient_id: appointment.patient_id,
            patient_name: appointment.patient_name || 'Patient inconnu',
            title: 'Rendez-vous manqué',
            message: `Rendez-vous du ${new Date(appointment.appointment_date).toLocaleDateString('fr-FR')} non honoré`,
            metadata: {
              appointment_date: appointment.appointment_date,
            },
            created_at: new Date().toISOString(),
            is_acknowledged: false,
          });
        });
      }

      // Sort alerts by priority
      const priorityOrder: Record<AlertPriority, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
      };

      const sortedAlerts = allAlerts.sort((a, b) => {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      // Deduplicate alerts by base ID (same type + same entity)
      const deduplicatedAlerts = sortedAlerts.reduce((acc, alert) => {
        const baseId = getBaseAlertId(alert.id);
        if (!acc.some(a => getBaseAlertId(a.id) === baseId)) {
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
  const alertsByPriority = useMemo(() => ({
    critical: alerts.filter((a) => a.priority === 'critical'),
    high: alerts.filter((a) => a.priority === 'high'),
    medium: alerts.filter((a) => a.priority === 'medium'),
    low: alerts.filter((a) => a.priority === 'low'),
  }), [alerts]);

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchAlerts();

    // Refresh every 60 seconds
    const interval = setInterval(fetchAlerts, 60000);

    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('patient-alerts-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'patients' },
        () => {
          logger.info('[usePatientAlerts] Patient change detected, refetching...');
          fetchAlerts();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'consultations' },
        () => {
          logger.info('[usePatientAlerts] Consultation change detected, refetching...');
          fetchAlerts();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          logger.info('[usePatientAlerts] Appointment change detected, refetching...');
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAlerts]);

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
