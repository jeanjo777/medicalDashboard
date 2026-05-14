import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { getCurrentMedicId } from '../utils/auth';

export interface PatientStats {
  activeCount: number;
  inTreatmentCount: number;
  recoveredCount: number;
  highRiskCount: number;
}

export function usePatientStats() {
  return useQuery({
    queryKey: ['patient-stats'],
    queryFn: async (): Promise<PatientStats> => {
      // Fetch all patients' status and riskScore (lightweight query)
      const { data, error } = await supabase
        .from('patients')
        .select('status, riskScore')
        .eq('medic_id', getCurrentMedicId()!);

      if (error) throw error;

      const patients = data || [];
      const activeCount = patients.filter(p => p.status === 'active').length;
      const inTreatmentCount = patients.filter(p => p.status === 'in_treatment').length;
      const recoveredCount = patients.filter(p => p.status === 'recovered').length;
      const highRiskCount = patients.filter(p => (p.riskScore ?? 0) > 60).length;

      return { activeCount, inTreatmentCount, recoveredCount, highRiskCount };
    },
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}
