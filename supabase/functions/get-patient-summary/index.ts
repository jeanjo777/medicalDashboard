import { createClient } from 'npm:@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { patientId } = await req.json();

    if (!patientId) {
      return new Response(
        JSON.stringify({ error: 'patientId is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .maybeSingle();

    if (patientError || !patient) {
      return new Response(
        JSON.stringify({ error: 'Patient not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: consultations, error: consultError } = await supabase
      .from('consultations')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (consultError) {
      console.error('Consultation error:', consultError);
    }

    const totalConsultations = consultations?.length || 0;
    const pendingConsultations = consultations?.filter(c => c.status === 'pending').length || 0;
    const reviewedConsultations = consultations?.filter(c => c.status === 'reviewed').length || 0;
    const highIntensityCount = consultations?.filter(c => c.intensity === 'high').length || 0;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let riskScore = 0;

    if (totalConsultations > 10) riskScore += 20;
    if (pendingConsultations > 3) riskScore += 30;
    if (highIntensityCount > 2) riskScore += 25;
    if (totalConsultations > 0 && reviewedConsultations / totalConsultations < 0.5) riskScore += 15;

    if (riskScore >= 60) riskLevel = 'high';
    else if (riskScore >= 30) riskLevel = 'medium';

    const recentConsultations = consultations?.slice(0, 5) || [];
    const symptomsMap: { [key: string]: number } = {};
    recentConsultations.forEach(c => {
      const symptoms = c.symptoms.toLowerCase();
      const words = symptoms.split(' ').filter(w => w.length > 5);
      words.forEach(word => {
        symptomsMap[word] = (symptomsMap[word] || 0) + 1;
      });
    });

    const topSymptoms = Object.entries(symptomsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([symptom]) => symptom);

    const calculateAge = (dateOfBirth: string | null): number | null => {
      if (!dateOfBirth) return null;
      const birthDate = new Date(dateOfBirth);
      if (isNaN(birthDate.getTime())) return null;
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 0 ? age : null;
    };

    const patientAge = calculateAge(patient.date_of_birth);
    const ageDisplay = patientAge !== null ? `${patientAge} ans` : 'âge inconnu';

    const summary = `Patient ${patient.name}, ${ageDisplay}. Total de ${totalConsultations} consultation(s) enregistrée(s). ${pendingConsultations} consultation(s) en attente de traitement. ${reviewedConsultations} consultation(s) traitée(s). Symptômes récurrents: ${topSymptoms.length > 0 ? topSymptoms.join(', ') : 'aucun'}. ${highIntensityCount > 0 ? `${highIntensityCount} consultation(s) de haute intensité signalée(s).` : ''}`;

    const recommendations: string[] = [];

    if (pendingConsultations > 0) {
      recommendations.push(`Traiter les ${pendingConsultations} consultation(s) en attente en priorité`);
    }

    if (highIntensityCount > 2) {
      recommendations.push('Envisager un suivi rapproché en raison de symptômes de haute intensité récurrents');
    }

    if (totalConsultations > 10) {
      recommendations.push('Patient avec historique medical étendu - examiner les tendances et connexions entre consultations');
    }

    if (topSymptoms.length > 0) {
      recommendations.push(`Symptômes récurrents détectés (${topSymptoms.join(', ')}) - envisager une évaluation approfondie`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Patient en bonne santé apparente - continuer le suivi de routine');
    }

    let nextSteps = '';
    if (pendingConsultations > 0) {
      nextSteps = `Traiter immédiatement les ${pendingConsultations} consultation(s) en attente. `;
    }
    if (riskLevel === 'high') {
      nextSteps += 'Programmer un rendez-vous de suivi sous 7 jours. Surveillance accrue recommandée.';
    } else if (riskLevel === 'medium') {
      nextSteps += 'Programmer un rendez-vous de suivi sous 14 jours.';
    } else {
      nextSteps += 'Suivi de routine mensuel ou trimestriel.';
    }

    let trends = '';
    if (consultations && consultations.length > 1) {
      const recentCount = consultations.slice(0, 3).length;
      const olderCount = consultations.slice(3, 6).length;
      
      if (recentCount > olderCount && olderCount > 0) {
        trends = 'Tendance à la hausse des consultations - surveillance recommandée.';
      } else if (recentCount < olderCount && recentCount > 0) {
        trends = 'Diminution des consultations - amélioration possible de l\'état de santé.';
      } else {
        trends = 'Fréquence de consultation stable.';
      }

      if (highIntensityCount > 0) {
        trends += ` ${highIntensityCount} cas de haute intensité observé(s).`;
      }
    } else {
      trends = 'Données insuffisantes pour identifier des tendances.';
    }

    const patientWithAge = {
      ...patient,
      age: patientAge
    };

    const analysis = {
      patientId,
      patient: patientWithAge,
      consultations: recentConsultations,
      summary,
      riskLevel,
      recommendations,
      nextSteps,
      trends,
    };

    return new Response(
      JSON.stringify(analysis),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});