import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import logger from '../utils/logger';

const POLL_INTERVAL = 30_000; // 30 seconds

/**
 * Hook that polls to keep appointment data fresh.
 * Replaces Supabase Realtime subscriptions with periodic query invalidation.
 */
export function useAppointmentsRealtime(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(() => {
      logger.debug('Polling: invalidating appointment queries');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['today-patient-stats'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment-passing-rate'] });
    }, POLL_INTERVAL);

    return () => clearInterval(id);
  }, [enabled, queryClient]);
}

export function useConsultationsRealtime(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(() => {
      logger.debug('Polling: invalidating consultation queries');
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['patient-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dynamic-analytics'] });
    }, POLL_INTERVAL);

    return () => clearInterval(id);
  }, [enabled, queryClient]);
}

export function usePatientsRealtime(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(() => {
      logger.debug('Polling: invalidating patient queries');
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dynamic-analytics'] });
    }, POLL_INTERVAL);

    return () => clearInterval(id);
  }, [enabled, queryClient]);
}

export function useMedicalDataRealtime(enabled = true) {
  useAppointmentsRealtime(enabled);
  useConsultationsRealtime(enabled);
  usePatientsRealtime(enabled);
}

export default useAppointmentsRealtime;
