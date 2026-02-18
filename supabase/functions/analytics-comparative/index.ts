import { createClient } from 'npm:@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const WEEKS_FR = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];

interface ComparativeResponse {
  periods: { current: string; previous: string };
  kpiComparison: Array<{
    metric: string;
    current: number;
    previous: number;
    change: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
  }>;
  timeSeriesComparison: Array<{
    month: string;
    current: number;
    previous: number;
    target: number;
  }>;
  departmentComparison: Array<{
    department: string;
    current: number;
    previous: number;
    diff: number;
  }>;
  insights: {
    positive: string[];
    stable: string[];
    attention: string[];
  };
}

function getDateBoundaries(comparisonType: string): {
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
  previousEnd: Date;
} {
  const now = new Date();

  if (comparisonType === 'quarter') {
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const currentStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
    const currentEnd = new Date(now.getFullYear(), currentQuarter * 3 + 3, 0);
    const previousStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
    const previousEnd = new Date(now.getFullYear(), currentQuarter * 3, 0);
    return { currentStart, currentEnd, previousStart, previousEnd };
  }

  if (comparisonType === 'year') {
    const currentStart = new Date(now.getFullYear(), 0, 1);
    const currentEnd = now;
    const previousStart = new Date(now.getFullYear() - 1, 0, 1);
    const previousEnd = new Date(now.getFullYear() - 1, 11, 31);
    return { currentStart, currentEnd, previousStart, previousEnd };
  }

  // Default: month
  const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentEnd = now;
  const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  return { currentStart, currentEnd, previousStart, previousEnd };
}

function formatPeriodLabel(date: Date, comparisonType: string): string {
  if (comparisonType === 'quarter') {
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return `T${quarter} ${date.getFullYear()}`;
  }
  if (comparisonType === 'year') {
    return `${date.getFullYear()}`;
  }
  return `${MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { comparisonType = 'month' } = await req.json().catch(() => ({}));
    const bounds = getDateBoundaries(comparisonType);

    // Fetch data for both periods in parallel
    const [
      consultationsCurrent,
      consultationsPrevious,
      appointmentsCurrent,
      appointmentsPrevious,
      patientsCurrent,
      patientsPrevious,
      medicsResult,
    ] = await Promise.all([
      supabase
        .from('consultations')
        .select('id, patient_id, intensity, status, created_at, duration')
        .gte('created_at', bounds.currentStart.toISOString())
        .lte('created_at', bounds.currentEnd.toISOString()),
      supabase
        .from('consultations')
        .select('id, patient_id, intensity, status, created_at, duration')
        .gte('created_at', bounds.previousStart.toISOString())
        .lte('created_at', bounds.previousEnd.toISOString()),
      supabase
        .from('appointments')
        .select('id, patient_id, medic_id, status, appointment_date, type_consultation, duration')
        .gte('appointment_date', bounds.currentStart.toISOString().split('T')[0])
        .lte('appointment_date', bounds.currentEnd.toISOString().split('T')[0]),
      supabase
        .from('appointments')
        .select('id, patient_id, medic_id, status, appointment_date, type_consultation, duration')
        .gte('appointment_date', bounds.previousStart.toISOString().split('T')[0])
        .lte('appointment_date', bounds.previousEnd.toISOString().split('T')[0]),
      supabase
        .from('patients')
        .select('id, created_at')
        .gte('created_at', bounds.currentStart.toISOString())
        .lte('created_at', bounds.currentEnd.toISOString()),
      supabase
        .from('patients')
        .select('id, created_at')
        .gte('created_at', bounds.previousStart.toISOString())
        .lte('created_at', bounds.previousEnd.toISOString()),
      supabase.from('medics').select('id, specialite'),
    ]);

    const curConsultations = consultationsCurrent.data || [];
    const prevConsultations = consultationsPrevious.data || [];
    const curAppointments = appointmentsCurrent.data || [];
    const prevAppointments = appointmentsPrevious.data || [];
    const curPatients = patientsCurrent.data || [];
    const prevPatients = patientsPrevious.data || [];
    const medics = medicsResult.data || [];

    // KPI Comparison
    const uniquePatientsCur = new Set(curConsultations.map(c => c.patient_id)).size;
    const uniquePatientsPrev = new Set(prevConsultations.map(c => c.patient_id)).size;
    const patientChange = uniquePatientsPrev > 0
      ? Math.round(((uniquePatientsCur - uniquePatientsPrev) / uniquePatientsPrev) * 1000) / 10
      : 0;

    const completedCur = curAppointments.filter(a => ['termine', 'completed'].includes(a.status)).length;
    const completedPrev = prevAppointments.filter(a => ['termine', 'completed'].includes(a.status)).length;
    const completionRateCur = curAppointments.length > 0 ? Math.round((completedCur / curAppointments.length) * 1000) / 10 : 0;
    const completionRatePrev = prevAppointments.length > 0 ? Math.round((completedPrev / prevAppointments.length) * 1000) / 10 : 0;
    const completionChange = completionRatePrev > 0
      ? Math.round((completionRateCur - completionRatePrev) * 10) / 10
      : 0;

    const riskCur = curConsultations.filter(c => c.intensity === 'high').length;
    const riskPrev = prevConsultations.filter(c => c.intensity === 'high').length;
    const riskChange = riskPrev > 0
      ? Math.round(((riskCur - riskPrev) / riskPrev) * 1000) / 10
      : 0;

    const newPatientChange = prevPatients.length > 0
      ? Math.round(((curPatients.length - prevPatients.length) / prevPatients.length) * 1000) / 10
      : 0;

    const kpiComparison = [
      {
        metric: 'Patients consultés',
        current: uniquePatientsCur,
        previous: uniquePatientsPrev,
        change: patientChange,
        unit: '',
        trend: patientChange > 0 ? 'up' as const : patientChange < 0 ? 'down' as const : 'stable' as const,
      },
      {
        metric: 'Taux complétion RDV',
        current: completionRateCur,
        previous: completionRatePrev,
        change: completionChange,
        unit: '%',
        trend: completionChange > 0 ? 'up' as const : completionChange < 0 ? 'down' as const : 'stable' as const,
      },
      {
        metric: 'Cas à risque',
        current: riskCur,
        previous: riskPrev,
        change: riskChange,
        unit: '',
        trend: riskChange > 0 ? 'up' as const : riskChange < 0 ? 'down' as const : 'stable' as const,
      },
      {
        metric: 'Nouveaux patients',
        current: curPatients.length,
        previous: prevPatients.length,
        change: newPatientChange,
        unit: '',
        trend: newPatientChange > 0 ? 'up' as const : newPatientChange < 0 ? 'down' as const : 'stable' as const,
      },
    ];

    // Time series comparison (weekly breakdown)
    const timeSeriesComparison = WEEKS_FR.map((weekLabel, weekIdx) => {
      const curWeekConsults = curConsultations.filter(c => {
        const day = new Date(c.created_at).getDate();
        return Math.floor((day - 1) / 7) === weekIdx;
      }).length;

      const prevWeekConsults = prevConsultations.filter(c => {
        const day = new Date(c.created_at).getDate();
        return Math.floor((day - 1) / 7) === weekIdx;
      }).length;

      const target = Math.round(prevWeekConsults * 1.05); // 5% growth target

      return {
        month: weekLabel,
        current: curWeekConsults,
        previous: prevWeekConsults,
        target,
      };
    });

    // Department comparison
    const specialtyMap = new Map<string, string>();
    medics.forEach((m: any) => {
      if (m.specialite) specialtyMap.set(m.id, m.specialite);
    });

    const deptCurrent = new Map<string, number>();
    const deptPrevious = new Map<string, number>();

    curAppointments.forEach((a: any) => {
      const dept = specialtyMap.get(a.medic_id) || 'Général';
      deptCurrent.set(dept, (deptCurrent.get(dept) || 0) + 1);
    });

    prevAppointments.forEach((a: any) => {
      const dept = specialtyMap.get(a.medic_id) || 'Général';
      deptPrevious.set(dept, (deptPrevious.get(dept) || 0) + 1);
    });

    const allDepts = new Set([...deptCurrent.keys(), ...deptPrevious.keys()]);
    const departmentComparison = [...allDepts].map(dept => {
      const cur = deptCurrent.get(dept) || 0;
      const prev = deptPrevious.get(dept) || 0;
      return {
        department: dept,
        current: cur,
        previous: prev,
        diff: cur - prev,
      };
    }).sort((a, b) => b.current - a.current);

    // Generate insights
    const positive: string[] = [];
    const stable: string[] = [];
    const attention: string[] = [];

    if (patientChange > 5) positive.push(`+${patientChange}% de patients consultés`);
    else if (patientChange >= -5) stable.push('Volume de patients stable');
    else attention.push(`Baisse de ${Math.abs(patientChange)}% des patients consultés`);

    if (completionChange > 2) positive.push(`Taux de complétion RDV en hausse (+${completionChange}%)`);
    else if (completionChange >= -2) stable.push('Taux de complétion maintenu');
    else attention.push(`Taux de complétion en baisse (${completionChange}%)`);

    if (riskChange < -5) positive.push('Réduction des cas à risque');
    else if (riskChange <= 5) stable.push('Cas à risque stables');
    else attention.push(`Augmentation de ${riskChange}% des cas à risque`);

    if (newPatientChange > 10) positive.push('Forte croissance de nouveaux patients');
    else if (newPatientChange >= 0) stable.push('Croissance organique des patients');
    else attention.push('Diminution des nouvelles inscriptions');

    // Ensure at least one item in each category
    if (positive.length === 0) positive.push('Continuité des soins assurée');
    if (stable.length === 0) stable.push('Métriques dans les normes');
    if (attention.length === 0) attention.push('Aucun point d\'attention majeur');

    const response: ComparativeResponse = {
      periods: {
        current: formatPeriodLabel(bounds.currentStart, comparisonType),
        previous: formatPeriodLabel(bounds.previousStart, comparisonType),
      },
      kpiComparison,
      timeSeriesComparison,
      departmentComparison,
      insights: { positive, stable, attention },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Comparative error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
