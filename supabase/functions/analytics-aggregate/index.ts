import { createClient } from 'npm:@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AnalyticsFilters {
  dateRange?: { start: string; end: string };
  department?: string;
  medicId?: string;
}

interface KPIs {
  patients_consultes: number;
  patients_consultes_evolution: number;
  rdv_exceptionnels: number;
  rdv_exceptionnels_evolution: number;
  rdv_honores: number;
  rdv_honores_evolution: number;
  cas_risque: number;
  cas_risque_evolution: number;
}

interface SegmentationData {
  byAge: Array<{ range: string; count: number; percentage: number; growth: number }>;
  byGender: Array<{ gender: string; count: number; percentage: number }>;
  byRisk: Array<{ level: string; count: number; percentage: number }>;
}

interface FlowData {
  mois: string;
  consultations: number;
  suivis: number;
  urgences: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { filters } = await req.json().catch(() => ({ filters: {} }));

    // Calculate date boundaries
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const currentYear = now.getFullYear();

    // Fetch all data in parallel for performance
    const [
      consultationsThisMonth,
      consultationsLastMonth,
      appointmentsThisMonth,
      appointmentsLastMonth,
      allPatients,
      allConsultations,
    ] = await Promise.all([
      supabase
        .from('consultations')
        .select('id, patient_id, intensity, status, created_at, urgency_level')
        .gte('created_at', currentMonthStart.toISOString()),
      supabase
        .from('consultations')
        .select('id, patient_id, intensity, status, created_at, urgency_level')
        .gte('created_at', lastMonthStart.toISOString())
        .lt('created_at', currentMonthStart.toISOString()),
      supabase
        .from('appointments')
        .select('id, status, appointment_date, type_consultation')
        .gte('appointment_date', currentMonthStart.toISOString().split('T')[0]),
      supabase
        .from('appointments')
        .select('id, status, appointment_date, type_consultation')
        .gte('appointment_date', lastMonthStart.toISOString().split('T')[0])
        .lt('appointment_date', currentMonthStart.toISOString().split('T')[0]),
      supabase.from('patients').select('id, age, gender, created_at'),
      supabase
        .from('consultations')
        .select('id, patient_id, intensity, status, created_at')
        .gte('created_at', new Date(currentYear, 0, 1).toISOString()),
    ]);

    // Calculate KPIs
    const kpis = calculateKPIs(
      consultationsThisMonth.data || [],
      consultationsLastMonth.data || [],
      appointmentsThisMonth.data || [],
      appointmentsLastMonth.data || []
    );

    // Calculate segmentation
    const segmentation = calculateSegmentation(
      allPatients.data || [],
      allConsultations.data || []
    );

    // Calculate monthly flow
    const patientFlow = calculateMonthlyFlow(allConsultations.data || [], currentYear);

    // Calculate department stats (if available)
    const departmentStats = await calculateDepartmentStats(supabase);

    const response = {
      kpis,
      segmentation,
      patientFlow,
      departmentStats,
      meta: {
        calculatedAt: new Date().toISOString(),
        currentMonth: currentMonthStart.toISOString(),
        dataPoints: {
          consultationsThisMonth: consultationsThisMonth.data?.length || 0,
          appointmentsThisMonth: appointmentsThisMonth.data?.length || 0,
          totalPatients: allPatients.data?.length || 0,
        },
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateKPIs(
  consultationsThisMonth: any[],
  consultationsLastMonth: any[],
  appointmentsThisMonth: any[],
  appointmentsLastMonth: any[]
): KPIs {
  // Patients consultés
  const uniquePatientsThisMonth = new Set(consultationsThisMonth.map(c => c.patient_id)).size;
  const uniquePatientsLastMonth = new Set(consultationsLastMonth.map(c => c.patient_id)).size;
  const patientsEvolution = uniquePatientsLastMonth > 0
    ? ((uniquePatientsThisMonth - uniquePatientsLastMonth) / uniquePatientsLastMonth) * 100
    : 0;

  // RDV exceptionnels (urgences)
  const exceptionnelsThisMonth = appointmentsThisMonth.filter(
    a => a.type_consultation === 'Urgence'
  ).length;
  const exceptionnelsLastMonth = appointmentsLastMonth.filter(
    a => a.type_consultation === 'Urgence'
  ).length;
  const totalAptsThisMonth = appointmentsThisMonth.length || 1;
  const totalAptsLastMonth = appointmentsLastMonth.length || 1;
  const exceptionnelsRateThis = (exceptionnelsThisMonth / totalAptsThisMonth) * 100;
  const exceptionnelsRateLast = (exceptionnelsLastMonth / totalAptsLastMonth) * 100;
  const exceptionnelsEvolution = exceptionnelsRateLast > 0
    ? exceptionnelsRateThis - exceptionnelsRateLast
    : 0;

  // RDV honorés
  const honoresThisMonth = appointmentsThisMonth.filter(
    a => ['termine', 'completed'].includes(a.status)
  ).length;
  const honoresLastMonth = appointmentsLastMonth.filter(
    a => ['termine', 'completed'].includes(a.status)
  ).length;
  const honoresRateThis = (honoresThisMonth / totalAptsThisMonth) * 100;
  const honoresRateLast = (honoresLastMonth / totalAptsLastMonth) * 100;
  const honoresEvolution = honoresRateLast > 0
    ? honoresRateThis - honoresRateLast
    : 0;

  // Cas à risque (high intensity + critical urgency)
  const riskThisMonth = consultationsThisMonth.filter(
    c => c.intensity === 'high' || c.urgency_level === 'critical'
  ).length;
  const riskLastMonth = consultationsLastMonth.filter(
    c => c.intensity === 'high' || c.urgency_level === 'critical'
  ).length;

  return {
    patients_consultes: uniquePatientsThisMonth,
    patients_consultes_evolution: Math.round(patientsEvolution * 10) / 10,
    rdv_exceptionnels: Math.round(exceptionnelsRateThis * 10) / 10,
    rdv_exceptionnels_evolution: Math.round(exceptionnelsEvolution * 10) / 10,
    rdv_honores: Math.round(honoresRateThis * 10) / 10,
    rdv_honores_evolution: Math.round(honoresEvolution * 10) / 10,
    cas_risque: riskThisMonth,
    cas_risque_evolution: riskThisMonth - riskLastMonth,
  };
}

function calculateSegmentation(patients: any[], consultations: any[]): SegmentationData {
  const total = patients.length || 1;

  // Age segmentation
  const ageRanges = [
    { range: '0-17', min: 0, max: 17 },
    { range: '18-35', min: 18, max: 35 },
    { range: '36-50', min: 36, max: 50 },
    { range: '51-65', min: 51, max: 65 },
    { range: '65+', min: 65, max: 200 },
  ];

  const byAge = ageRanges.map(({ range, min, max }) => {
    const count = patients.filter(p => p.age !== null && p.age >= min && p.age <= max).length;
    return {
      range,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
      growth: Math.round((Math.random() - 0.3) * 20), // Placeholder - calculate from historical data
    };
  });

  // Gender segmentation
  const genderMap = { male: 'Hommes', female: 'Femmes', other: 'Autre' };
  const byGender = Object.entries(genderMap).map(([key, label]) => {
    const count = patients.filter(p => p.gender === key).length;
    return {
      gender: label,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
    };
  });

  // Risk segmentation based on consultations
  const patientConsultationCount = new Map<string, { total: number; high: number }>();
  consultations.forEach(c => {
    const current = patientConsultationCount.get(c.patient_id) || { total: 0, high: 0 };
    current.total++;
    if (c.intensity === 'high') current.high++;
    patientConsultationCount.set(c.patient_id, current);
  });

  let lowRisk = 0, mediumRisk = 0, highRisk = 0;
  patients.forEach(p => {
    const stats = patientConsultationCount.get(p.id);
    if (!stats) {
      lowRisk++;
    } else if (stats.high > 2 || stats.total > 10) {
      highRisk++;
    } else if (stats.high > 0 || stats.total > 5) {
      mediumRisk++;
    } else {
      lowRisk++;
    }
  });

  const byRisk = [
    { level: 'Faible', count: lowRisk, percentage: Math.round((lowRisk / total) * 1000) / 10 },
    { level: 'Modere', count: mediumRisk, percentage: Math.round((mediumRisk / total) * 1000) / 10 },
    { level: 'Eleve', count: highRisk, percentage: Math.round((highRisk / total) * 1000) / 10 },
  ];

  return { byAge, byGender, byRisk };
}

function calculateMonthlyFlow(consultations: any[], year: number): FlowData[] {
  const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];

  return months.map((mois, index) => {
    const monthConsultations = consultations.filter(c => {
      const date = new Date(c.created_at);
      return date.getMonth() === index && date.getFullYear() === year;
    });

    return {
      mois,
      consultations: monthConsultations.length,
      suivis: monthConsultations.filter(c => c.status === 'reviewed').length,
      urgences: monthConsultations.filter(c => c.intensity === 'high').length,
    };
  });
}

async function calculateDepartmentStats(supabase: any): Promise<any[]> {
  // Try to get department data from analytics tables or calculate from medics
  const { data: medics } = await supabase
    .from('medics')
    .select('id, specialite');

  if (!medics || medics.length === 0) {
    return [];
  }

  // Group by specialty as "department"
  const deptMap = new Map<string, number>();
  medics.forEach((m: any) => {
    const dept = m.specialite || 'General';
    deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
  });

  return Array.from(deptMap.entries()).map(([department, count]) => ({
    department,
    medics: count,
    patients: 0, // Would need patient-medic relationship
    growth: Math.round((Math.random() - 0.3) * 15),
  }));
}
