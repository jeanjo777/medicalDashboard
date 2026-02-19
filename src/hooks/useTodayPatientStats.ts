import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface TodayPatientStats {
  total: number;
  seen: number;
  waiting: number;
  absent: number;
}

export function useTodayPatientStats() {
  return useQuery({
    queryKey: ['today-patient-stats'],
    queryFn: async (): Promise<TodayPatientStats> => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('appointments')
        .select('status')
        .eq('appointment_date', today);

      if (error) throw error;

      const appointments = data || [];
      const total = appointments.length;
      const seen = appointments.filter(a =>
        ['completed', 'termine', 'honore'].includes(a.status)
      ).length;
      const absent = appointments.filter(a =>
        ['cancelled', 'no_show', 'annule'].includes(a.status)
      ).length;
      const waiting = total - seen - absent;

      return { total, seen, waiting, absent };
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}
