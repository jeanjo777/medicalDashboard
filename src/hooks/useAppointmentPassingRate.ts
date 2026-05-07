import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface PassingRate {
  complete: number;
  cancelled: number;
  pending: number;
}

export function useAppointmentPassingRate() {
  return useQuery({
    queryKey: ['appointment-passing-rate'],
    queryFn: async (): Promise<PassingRate> => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('appointments')
        .select('status')
        .gte('appointment_date', startOfMonth);

      if (error) throw error;

      const appointments = data || [];
      const total = appointments.length;
      if (total === 0) return { complete: 0, cancelled: 0, pending: 0 };

      const completed = appointments.filter(a =>
        ['completed', 'termine', 'honore', 'confirmed', 'in_progress'].includes(a.status)
      ).length;
      const cancelled = appointments.filter(a =>
        ['cancelled', 'annule', 'no_show'].includes(a.status)
      ).length;
      const pendingCount = total - completed - cancelled;

      return {
        complete: Math.round((completed / total) * 100),
        cancelled: Math.round((cancelled / total) * 100),
        pending: Math.round((pendingCount / total) * 100),
      };
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
