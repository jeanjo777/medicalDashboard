import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Types pour les données analytics
export interface AnalyticsStats {
  id: string;
  date: string;
  patients_consultes: number;
  patients_consultes_evolution: number;
  rdv_exceptionnels: number;
  rdv_exceptionnels_evolution: number;
  rdv_honores: number;
  rdv_honores_evolution: number;
  cas_risque: number;
  cas_risque_evolution: number;
}

export interface DepartementStats {
  id: string;
  departement: string;
  patients_count: number;
  croissance: number;
  date: string;
}

export interface MedecinPerformance {
  id: string;
  medecin_name: string;
  consultations: number;
  minutes_par_patient: number;
  satisfaction: number;
  date: string;
}

export interface FluxPatients {
  id: string;
  mois: string;
  consultations: number;
  suivis: number;
  urgences: number;
  annee: number;
}

export interface PathologieDistribution {
  id: string;
  pathologie: string;
  pourcentage: number;
  count: number;
}

export interface TauxRecuperation {
  id: string;
  semaine: number;
  taux_reel: number;
  objectif: number;
  annee: number;
}

export interface SystemeSante {
  id: string;
  systeme: string;
  score: number;
  date: string;
}

// Hook pour récupérer les KPI stats
export function useAnalyticsStats() {
  return useQuery({
    queryKey: ['analytics-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_stats')
        .select('*')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as AnalyticsStats | null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook pour récupérer les stats par département
export function useDepartementStats() {
  return useQuery({
    queryKey: ['analytics-departement'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_departement')
        .select('*')
        .order('patients_count', { ascending: false });

      if (error) throw error;
      return data as DepartementStats[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook pour récupérer les performances des médecins
export function useMedecinPerformance() {
  return useQuery({
    queryKey: ['analytics-medecins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_medecins')
        .select('*')
        .order('consultations', { ascending: false });

      if (error) throw error;
      return data as MedecinPerformance[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook pour récupérer le flux de patients
export function useFluxPatients() {
  return useQuery({
    queryKey: ['analytics-flux-patients'],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const { data, error } = await supabase
        .from('analytics_flux_patients')
        .select('*')
        .eq('annee', currentYear)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as FluxPatients[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook pour récupérer la distribution des pathologies
export function usePathologiesDistribution() {
  return useQuery({
    queryKey: ['analytics-pathologies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_pathologies')
        .select('*')
        .order('pourcentage', { ascending: false });

      if (error) throw error;
      return data as PathologieDistribution[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook pour récupérer le taux de récupération
export function useTauxRecuperation() {
  return useQuery({
    queryKey: ['analytics-recuperation'],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const { data, error } = await supabase
        .from('analytics_recuperation')
        .select('*')
        .eq('annee', currentYear)
        .order('semaine', { ascending: true });

      if (error) throw error;
      return data as TauxRecuperation[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook pour récupérer les scores des systèmes
export function useSystemesSante() {
  return useQuery({
    queryKey: ['analytics-systemes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_systemes')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return data as SystemeSante[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook combiné pour toutes les données analytics
export function useAllAnalyticsData() {
  const stats = useAnalyticsStats();
  const departements = useDepartementStats();
  const medecins = useMedecinPerformance();
  const flux = useFluxPatients();
  const pathologies = usePathologiesDistribution();
  const recuperation = useTauxRecuperation();
  const systemes = useSystemesSante();

  return {
    stats,
    departements,
    medecins,
    flux,
    pathologies,
    recuperation,
    systemes,
    isLoading:
      stats.isLoading ||
      departements.isLoading ||
      medecins.isLoading ||
      flux.isLoading ||
      pathologies.isLoading ||
      recuperation.isLoading ||
      systemes.isLoading,
    isError:
      stats.isError ||
      departements.isError ||
      medecins.isError ||
      flux.isError ||
      pathologies.isError ||
      recuperation.isError ||
      systemes.isError,
  };
}

// ============================================
// NEW DYNAMIC ANALYTICS HOOKS (Edge Functions)
// ============================================

export interface DynamicKPIs {
  patients_consultes: number;
  patients_consultes_evolution: number;
  rdv_exceptionnels: number;
  rdv_exceptionnels_evolution: number;
  rdv_honores: number;
  rdv_honores_evolution: number;
  cas_risque: number;
  cas_risque_evolution: number;
}

export interface SegmentationData {
  byAge: Array<{ range: string; count: number; percentage: number; growth: number }>;
  byGender: Array<{ gender: string; count: number; percentage: number }>;
  byRisk: Array<{ level: string; count: number; percentage: number }>;
}

export interface DynamicAnalyticsResponse {
  kpis: DynamicKPIs;
  segmentation: SegmentationData;
  patientFlow: Array<{ mois: string; consultations: number; suivis: number; urgences: number }>;
  departmentStats: Array<{ department: string; medics: number; patients: number; growth: number }>;
  meta: {
    calculatedAt: string;
    currentMonth: string;
    dataPoints: { consultationsThisMonth: number; appointmentsThisMonth: number; totalPatients: number };
  };
}

/**
 * Hook pour recuperer les analytics dynamiques calculees en temps reel
 */
export function useDynamicAnalytics(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['dynamic-analytics', filters],
    queryFn: async (): Promise<DynamicAnalyticsResponse> => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-aggregate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ filters }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch dynamic analytics');
      }

      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}

export interface PredictionPoint {
  month: string;
  actual: number | null;
  predicted: number;
  lower: number;
  upper: number;
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable';
  strength: number;
  description: string;
}

export interface PredictionsResponse {
  forecast: PredictionPoint[];
  confidence: number;
  insights: string[];
  alerts: Array<{ type: 'warning' | 'info' | 'success'; message: string }>;
  trends: TrendAnalysis;
  model: {
    type: string;
    parameters: { alpha: number; beta: number };
    accuracy: number;
    lastTrainedAt: string;
  };
}

/**
 * Hook pour recuperer les predictions ML
 */
export function usePredictions(horizonMonths: number = 3, metric: string = 'consultations') {
  return useQuery({
    queryKey: ['predictions', horizonMonths, metric],
    queryFn: async (): Promise<PredictionsResponse> => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-predictions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ horizonMonths, metric }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch predictions');
      }

      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (predictions don't change often)
  });
}

export interface AIAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'capacity' | 'risk' | 'performance' | 'compliance' | 'trend';
  recommendations: string[];
  affectedMetric?: string;
  dataContext?: Record<string, number>;
  createdAt: string;
  expiresAt: string;
  acknowledged: boolean;
}

export interface AIAlertsResponse {
  alerts: AIAlert[];
  context: {
    generatedAt: string;
    dataWindow: string;
  };
}

/**
 * Hook pour recuperer les alertes IA generees par Claude
 */
export function useAIAlerts() {
  return useQuery({
    queryKey: ['ai-alerts'],
    queryFn: async (): Promise<AIAlertsResponse> => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-alerts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch AI alerts');
      }

      return response.json();
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 30 * 60 * 1000, // Refresh every 30 minutes
  });
}

// ============================================
// CORRELATIONS & COMPARATIVE HOOKS
// ============================================

export interface CorrelationScatterPoint {
  x: number;
  y: number;
  name: string;
  satisfaction: number;
}

export interface CorrelationPair {
  metric1: string;
  metric2: string;
  coefficient: number;
  type: 'positive' | 'negative';
  description: string;
  insight: string;
}

export interface CorrelationInsight {
  value: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
}

export interface CorrelationsResponse {
  scatterData: CorrelationScatterPoint[];
  correlationPairs: CorrelationPair[];
  insights: CorrelationInsight[];
}

/**
 * Hook pour recuperer les correlations entre metriques medicales
 */
export function useCorrelations() {
  return useQuery({
    queryKey: ['analytics-correlations'],
    queryFn: async (): Promise<CorrelationsResponse> => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-correlations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch correlations');
      }

      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export interface ComparativeKPI {
  metric: string;
  current: number;
  previous: number;
  change: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

export interface ComparativeTimeSeries {
  month: string;
  current: number;
  previous: number;
  target: number;
}

export interface ComparativeDepartment {
  department: string;
  current: number;
  previous: number;
  diff: number;
}

export interface ComparativeResponse {
  periods: { current: string; previous: string };
  kpiComparison: ComparativeKPI[];
  timeSeriesComparison: ComparativeTimeSeries[];
  departmentComparison: ComparativeDepartment[];
  insights: {
    positive: string[];
    stable: string[];
    attention: string[];
  };
}

/**
 * Hook pour recuperer l'analyse comparative periode par periode
 */
export function useComparative(comparisonType: 'month' | 'quarter' | 'year' = 'month') {
  return useQuery({
    queryKey: ['analytics-comparative', comparisonType],
    queryFn: async (): Promise<ComparativeResponse> => {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-comparative`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ comparisonType }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch comparative data');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
