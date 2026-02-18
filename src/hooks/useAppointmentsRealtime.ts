import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import logger from '../utils/logger';

/**
 * Hook to subscribe to real-time appointment changes
 * Automatically invalidates appointment queries when changes occur
 */
export function useAppointmentsRealtime(enabled: boolean = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel('appointments-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        (payload) => {
          logger.debug('Appointment change detected:', payload.eventType);

          // Invalidate all appointment-related queries
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['upcoming-appointments'] });

          // Log the specific change for debugging
          if (payload.eventType === 'INSERT') {
            logger.info('New appointment created');
          } else if (payload.eventType === 'UPDATE') {
            logger.info('Appointment updated');
          } else if (payload.eventType === 'DELETE') {
            logger.info('Appointment deleted');
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.debug('Subscribed to appointments realtime channel');
        }
      });

    return () => {
      logger.debug('Unsubscribing from appointments realtime channel');
      supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);
}

/**
 * Hook to subscribe to real-time consultation changes
 */
export function useConsultationsRealtime(enabled: boolean = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel('consultations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consultations',
        },
        (payload) => {
          logger.debug('Consultation change detected:', payload.eventType);

          // Invalidate consultation-related queries
          queryClient.invalidateQueries({ queryKey: ['consultations'] });
          queryClient.invalidateQueries({ queryKey: ['patient-alerts'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['dynamic-analytics'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);
}

/**
 * Hook to subscribe to real-time patient changes
 */
export function usePatientsRealtime(enabled: boolean = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel('patients-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients',
        },
        (payload) => {
          logger.debug('Patient change detected:', payload.eventType);

          queryClient.invalidateQueries({ queryKey: ['patients'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          queryClient.invalidateQueries({ queryKey: ['dynamic-analytics'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);
}

/**
 * Combined hook to subscribe to all medical data changes
 */
export function useMedicalDataRealtime(enabled: boolean = true) {
  useAppointmentsRealtime(enabled);
  useConsultationsRealtime(enabled);
  usePatientsRealtime(enabled);
}

export default useAppointmentsRealtime;
