import { createClient } from 'npm:@supabase/supabase-js@2.76.1';
import Anthropic from 'npm:@anthropic-ai/sdk@0.30.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AIAlert {
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

interface AlertContext {
  consultations: {
    total: number;
    pending: number;
    highIntensity: number;
    critical: number;
    avgPerDay: number;
  };
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    completionRate: number;
  };
  patients: {
    total: number;
    newThisMonth: number;
    atRisk: number;
  };
  trends: {
    consultationChange: number;
    appointmentChange: number;
    patientGrowth: number;
  };
}

const AI_ALERTS_SYSTEM_PROMPT = `Tu es un assistant IA specialise dans l'analyse des donnees medicales et la detection d'anomalies pour un cabinet medical.

Ton role est d'analyser les metriques fournies et de generer des alertes pertinentes pour aider les gestionnaires a prendre des decisions eclairees.

CATEGORIES D'ALERTES:
- capacity: Problemes de capacite (surcharge, sous-utilisation)
- risk: Patients a risque, cas critiques
- performance: Performance operationnelle (taux de completion, annulations)
- compliance: Conformite et respect des delais
- trend: Tendances significatives (croissance, baisse)

NIVEAUX DE SEVERITE:
- critical: Action immediate requise
- high: Attention urgente dans les 24h
- medium: A traiter dans la semaine
- low: Information, surveillance

REGLES:
1. Generer entre 2 et 5 alertes maximum
2. Chaque alerte doit etre actionnable
3. Prioriser les problemes concrets
4. Fournir des recommandations specifiques
5. Eviter les alertes redondantes

FORMAT DE REPONSE (JSON strict):
{
  "alerts": [
    {
      "title": "Titre court et explicite",
      "description": "Description detaillee du probleme detecte",
      "severity": "critical|high|medium|low",
      "category": "capacity|risk|performance|compliance|trend",
      "recommendations": ["Action 1", "Action 2"],
      "affectedMetric": "nom_de_la_metrique"
    }
  ]
}`;

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

    // Gather analytics context
    const context = await gatherAlertContext(supabase);

    // Generate AI alerts
    const alerts = await generateAIAlerts(context);

    return new Response(
      JSON.stringify({
        alerts,
        context: {
          generatedAt: new Date().toISOString(),
          dataWindow: '7 derniers jours',
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('AI Alerts error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function gatherAlertContext(supabase: any): Promise<AlertContext> {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    recentConsultations,
    previousWeekConsultations,
    recentAppointments,
    previousWeekAppointments,
    allPatients,
    newPatients,
  ] = await Promise.all([
    // This week's consultations
    supabase
      .from('consultations')
      .select('id, intensity, status, urgency_level, created_at')
      .gte('created_at', oneWeekAgo.toISOString()),
    // Previous week's consultations
    supabase
      .from('consultations')
      .select('id')
      .gte('created_at', twoWeeksAgo.toISOString())
      .lt('created_at', oneWeekAgo.toISOString()),
    // This week's appointments
    supabase
      .from('appointments')
      .select('id, status, appointment_date')
      .gte('appointment_date', oneWeekAgo.toISOString().split('T')[0]),
    // Previous week's appointments
    supabase
      .from('appointments')
      .select('id')
      .gte('appointment_date', twoWeeksAgo.toISOString().split('T')[0])
      .lt('appointment_date', oneWeekAgo.toISOString().split('T')[0]),
    // All patients
    supabase.from('patients').select('id'),
    // New patients this month
    supabase
      .from('patients')
      .select('id')
      .gte('created_at', oneMonthAgo.toISOString()),
  ]);

  const consultations = recentConsultations.data || [];
  const appointments = recentAppointments.data || [];

  // Calculate consultation stats
  const pendingConsultations = consultations.filter((c: any) => c.status === 'pending').length;
  const highIntensityConsultations = consultations.filter((c: any) => c.intensity === 'high').length;
  const criticalConsultations = consultations.filter((c: any) => c.urgency_level === 'critical').length;

  // Calculate appointment stats
  const completedAppointments = appointments.filter((a: any) =>
    ['termine', 'completed'].includes(a.status)
  ).length;
  const cancelledAppointments = appointments.filter((a: any) => a.status === 'annule').length;
  const noShowAppointments = appointments.filter((a: any) => a.status === 'absent').length;
  const totalAppointments = appointments.length || 1;

  // Calculate trends
  const prevWeekConsultations = previousWeekConsultations.data?.length || 1;
  const prevWeekAppointments = previousWeekAppointments.data?.length || 1;
  const totalPatients = allPatients.data?.length || 0;
  const newPatientsCount = newPatients.data?.length || 0;

  return {
    consultations: {
      total: consultations.length,
      pending: pendingConsultations,
      highIntensity: highIntensityConsultations,
      critical: criticalConsultations,
      avgPerDay: Math.round((consultations.length / 7) * 10) / 10,
    },
    appointments: {
      total: totalAppointments,
      completed: completedAppointments,
      cancelled: cancelledAppointments,
      noShow: noShowAppointments,
      completionRate: Math.round((completedAppointments / totalAppointments) * 100),
    },
    patients: {
      total: totalPatients,
      newThisMonth: newPatientsCount,
      atRisk: highIntensityConsultations, // Simplified: patients with high intensity consultations
    },
    trends: {
      consultationChange: Math.round(
        ((consultations.length - prevWeekConsultations) / prevWeekConsultations) * 100
      ),
      appointmentChange: Math.round(
        ((appointments.length - prevWeekAppointments) / prevWeekAppointments) * 100
      ),
      patientGrowth: totalPatients > 0 ? Math.round((newPatientsCount / totalPatients) * 100) : 0,
    },
  };
}

async function generateAIAlerts(context: AlertContext): Promise<AIAlert[]> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

  // If no API key, use rule-based fallback
  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY not configured, using fallback alerts');
    return generateFallbackAlerts(context);
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const userPrompt = `Analyse ces metriques medicales et genere des alertes appropriees:

CONSULTATIONS (7 derniers jours):
- Total: ${context.consultations.total}
- En attente: ${context.consultations.pending}
- Haute intensite: ${context.consultations.highIntensity}
- Critiques: ${context.consultations.critical}
- Moyenne par jour: ${context.consultations.avgPerDay}

RENDEZ-VOUS (7 derniers jours):
- Total: ${context.appointments.total}
- Completes: ${context.appointments.completed}
- Annules: ${context.appointments.cancelled}
- Absents: ${context.appointments.noShow}
- Taux de completion: ${context.appointments.completionRate}%

PATIENTS:
- Total: ${context.patients.total}
- Nouveaux ce mois: ${context.patients.newThisMonth}
- A risque: ${context.patients.atRisk}

TENDANCES (vs semaine precedente):
- Consultations: ${context.trends.consultationChange > 0 ? '+' : ''}${context.trends.consultationChange}%
- Rendez-vous: ${context.trends.appointmentChange > 0 ? '+' : ''}${context.trends.appointmentChange}%
- Croissance patients: ${context.trends.patientGrowth}%

Genere entre 2 et 5 alertes basees sur ces donnees. Reponds UNIQUEMENT avec le JSON demande.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: AI_ALERTS_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Parse JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Add metadata to alerts
    return parsed.alerts.map((alert: any, index: number) => ({
      id: `ai-alert-${Date.now()}-${index}`,
      ...alert,
      dataContext: {
        consultations: context.consultations.total,
        appointments: context.appointments.total,
        atRiskPatients: context.patients.atRisk,
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      acknowledged: false,
    }));
  } catch (error) {
    console.error('Claude API error:', error);
    return generateFallbackAlerts(context);
  }
}

function generateFallbackAlerts(context: AlertContext): AIAlert[] {
  const alerts: AIAlert[] = [];
  const now = new Date();

  // Critical consultations alert
  if (context.consultations.critical > 0) {
    alerts.push({
      id: `fallback-critical-${now.getTime()}`,
      title: 'Consultations critiques detectees',
      description: `${context.consultations.critical} consultation(s) marquee(s) comme critique(s) necessitent une attention immediate.`,
      severity: 'critical',
      category: 'risk',
      recommendations: [
        'Contacter les patients concernes en priorite',
        'Verifier que les cas sont assignes a un medecin',
        'Preparer les ressources necessaires',
      ],
      affectedMetric: 'consultations_critiques',
      dataContext: { critical: context.consultations.critical },
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(),
      acknowledged: false,
    });
  }

  // Pending consultations backlog
  if (context.consultations.pending > 5) {
    alerts.push({
      id: `fallback-pending-${now.getTime()}`,
      title: 'Retard dans le traitement des consultations',
      description: `${context.consultations.pending} consultations sont en attente de traitement, depassant le seuil recommande.`,
      severity: context.consultations.pending > 10 ? 'high' : 'medium',
      category: 'performance',
      recommendations: [
        'Prioriser les consultations en attente',
        'Redistribuer la charge entre les medecins',
        'Envisager des heures supplementaires si necessaire',
      ],
      affectedMetric: 'consultations_en_attente',
      dataContext: { pending: context.consultations.pending },
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      acknowledged: false,
    });
  }

  // High cancellation rate
  const cancellationRate = (context.appointments.cancelled / context.appointments.total) * 100;
  if (cancellationRate > 15) {
    alerts.push({
      id: `fallback-cancellation-${now.getTime()}`,
      title: 'Taux d\'annulation eleve',
      description: `Le taux d'annulation des rendez-vous (${Math.round(cancellationRate)}%) depasse le seuil acceptable de 15%.`,
      severity: cancellationRate > 25 ? 'high' : 'medium',
      category: 'performance',
      recommendations: [
        'Analyser les raisons des annulations',
        'Mettre en place des rappels automatiques',
        'Revoir la politique d\'annulation',
      ],
      affectedMetric: 'taux_annulation',
      dataContext: { cancelled: context.appointments.cancelled, total: context.appointments.total },
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      acknowledged: false,
    });
  }

  // Growth trend
  if (context.trends.consultationChange > 30) {
    alerts.push({
      id: `fallback-growth-${now.getTime()}`,
      title: 'Forte croissance de l\'activite',
      description: `Les consultations ont augmente de ${context.trends.consultationChange}% par rapport a la semaine precedente.`,
      severity: 'medium',
      category: 'capacity',
      recommendations: [
        'Verifier la capacite d\'accueil',
        'Anticiper les besoins en ressources',
        'Optimiser la planification',
      ],
      affectedMetric: 'croissance_consultations',
      dataContext: { change: context.trends.consultationChange },
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
      acknowledged: false,
    });
  }

  // Success alert
  if (context.appointments.completionRate >= 85 && alerts.length === 0) {
    alerts.push({
      id: `fallback-success-${now.getTime()}`,
      title: 'Excellent taux de completion',
      description: `Le taux de completion des rendez-vous (${context.appointments.completionRate}%) est superieur a l'objectif de 85%.`,
      severity: 'low',
      category: 'performance',
      recommendations: [
        'Maintenir les bonnes pratiques',
        'Partager les methodes avec l\'equipe',
      ],
      affectedMetric: 'taux_completion',
      dataContext: { completionRate: context.appointments.completionRate },
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(),
      acknowledged: false,
    });
  }

  // Ensure at least 2 alerts
  if (alerts.length < 2) {
    alerts.push({
      id: `fallback-status-${now.getTime()}`,
      title: 'Rapport d\'activite hebdomadaire',
      description: `${context.consultations.total} consultations et ${context.appointments.total} rendez-vous traites cette semaine.`,
      severity: 'low',
      category: 'trend',
      recommendations: [
        'Continuer le suivi regulier des metriques',
      ],
      affectedMetric: 'activite_globale',
      dataContext: {
        consultations: context.consultations.total,
        appointments: context.appointments.total,
      },
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(),
      acknowledged: false,
    });
  }

  return alerts;
}
