import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { getCurrentMedicId } from '../utils/auth';

export interface WeeklyData {
  counts: number[];
  total: number;
}

export function useWeeklyAppointments() {
  return useQuery({
    queryKey: ['weekly-appointments'],
    queryFn: async (): Promise<WeeklyData> => {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const mondayStr = monday.toISOString().split('T')[0];
      const sundayStr = sunday.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_date')
        .eq('medic_id', getCurrentMedicId()!)
        .gte('appointment_date', mondayStr)
        .lte('appointment_date', sundayStr);

      if (error) throw error;

      // Mon=0 .. Sun=6
      const counts = [0, 0, 0, 0, 0, 0, 0];
      (data || []).forEach(row => {
        const d = new Date(row.appointment_date + 'T00:00:00');
        const idx = d.getDay() === 0 ? 6 : d.getDay() - 1;
        counts[idx]++;
      });

      return { counts, total: counts.reduce((a, b) => a + b, 0) };
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
