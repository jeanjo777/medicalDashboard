import { createClient } from 'npm:@supabase/supabase-js@2.76.1';
import Anthropic from 'npm:@anthropic-ai/sdk@0.30.1';
import { verify } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-secret-key-change-this';

async function verifyJWT(token: string): Promise<any> {
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    return await verify(token, key);
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

interface RequestBody {
  symptoms: string;
  duration?: string;
  intensity?: string;
  otherSigns?: string;
}

interface AIAnalysisResult {
  aiResponse: string;
  diagnosisSummary: string;
  recommendations: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

const MEDICAL_SYSTEM_PROMPT = `Tu es un assistant medical IA professionnel pour une plateforme de sante. Tu aides les patients a comprendre leurs symptomes tout en etant clair sur tes limites.

REGLES IMPORTANTES:
1. Tu NE poses JAMAIS de diagnostic definitif - tu fournis uniquement une analyse preliminaire
2. Tu recommandes TOUJOURS une consultation medicale pour des symptomes graves ou persistants
3. Tu utilises un langage accessible mais precis
4. Tu indiques clairement quand une situation necessite une attention medicale urgente
5. Tu ne prescris JAMAIS de medicaments specifiques

FORMAT DE REPONSE (JSON strict):
{
  "analysis": "Analyse detaillee des symptomes decrits (2-3 paragraphes)",
  "summary": "Resume concis en une phrase",
  "recommendations": "Conseils pratiques et prochaines etapes recommandees",
  "urgency": "low|medium|high|critical"
}

NIVEAUX D'URGENCE:
- low: Symptomes benins, suivi de routine
- medium: Consultation recommandee dans les jours suivants
- high: Consultation rapide necessaire (24-48h)
- critical: Attention medicale immediate requise (urgences)`;

function buildMedicalPrompt(symptoms: string, duration?: string, intensity?: string, otherSigns?: string): string {
  let prompt = `Analyse ces symptomes medicaux:\n\nSYMPTOMES PRINCIPAUX: ${symptoms}`;

  if (duration) {
    prompt += `\nDUREE: ${duration}`;
  }
  if (intensity) {
    prompt += `\nINTENSITE: ${intensity}`;
  }
  if (otherSigns) {
    prompt += `\nAUTRES SIGNES: ${otherSigns}`;
  }

  prompt += '\n\nReponds UNIQUEMENT avec le JSON demande, sans texte supplementaire.';
  return prompt;
}

async function generateAIAnalysis(
  symptoms: string,
  duration?: string,
  intensity?: string,
  otherSigns?: string
): Promise<AIAnalysisResult> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY not configured, using fallback response');
    return generateFallbackResponse(symptoms, intensity);
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: MEDICAL_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: buildMedicalPrompt(symptoms, duration, intensity, otherSigns)
      }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Parse JSON response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      aiResponse: parsed.analysis || 'Analyse en cours.',
      diagnosisSummary: parsed.summary || 'Consultation en attente d\'examen medical',
      recommendations: parsed.recommendations || 'Veuillez consulter un professionnel de sante.',
      urgencyLevel: parsed.urgency || 'medium',
    };
  } catch (error) {
    console.error('Claude API error:', error);
    return generateFallbackResponse(symptoms, intensity);
  }
}

function generateFallbackResponse(symptoms: string, intensity?: string): AIAnalysisResult {
  const urgency = intensity === 'high' ? 'high' : 'medium';

  return {
    aiResponse: `Vos symptomes (${symptoms}) ont ete enregistres avec attention. En raison d'une forte demande, un medecin examinera personnellement votre cas dans les plus brefs delais. ${intensity === 'high' ? 'Etant donne l\'intensite elevee de vos symptomes, votre dossier sera traite en priorite.' : ''}`,
    diagnosisSummary: 'Analyse en attente - Examen medical prioritaire',
    recommendations: intensity === 'high'
      ? 'Si vos symptomes s\'aggravent, rendez-vous aux urgences. Un medecin vous contactera rapidement.'
      : 'Veuillez consulter un professionnel de sante si les symptomes persistent ou s\'aggravent.',
    urgencyLevel: urgency as 'low' | 'medium' | 'high' | 'critical',
  };
}

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

    // Verify authentication with custom JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.substring(7);
    const jwtPayload = await verifyJWT(token);

    if (!jwtPayload) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const user = { id: jwtPayload.sub, username: jwtPayload.username };

    const { symptoms, duration, intensity, otherSigns }: RequestBody = await req.json();

    if (!symptoms || symptoms.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Symptoms are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const patientId = user.id;

    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('id', patientId)
      .maybeSingle();

    if (!patient) {
      return new Response(
        JSON.stringify({ error: 'Patient not found. Please create a patient profile first.' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate AI analysis using Claude API (with fallback)
    const aiAnalysis = await generateAIAnalysis(symptoms, duration, intensity, otherSigns);
    const { aiResponse, diagnosisSummary, recommendations, urgencyLevel } = aiAnalysis;

    // Determine initial status based on AI analysis completion
    const initialStatus = aiAnalysis.aiResponse.includes('forte demande') ? 'pending' : 'ai_analyzed';

    const { data: consultation, error: insertError } = await supabase
      .from('consultations')
      .insert({
        patient_id: patientId,
        symptoms,
        duration: duration || null,
        intensity: intensity || null,
        other_signs: otherSigns || null,
        ai_response: aiResponse,
        diagnosis_summary: diagnosisSummary,
        recommendations: recommendations,
        status: initialStatus,
        urgency_level: urgencyLevel,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create consultation' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    await supabase
      .from('consultation_messages')
      .insert([
        {
          consultation_id: consultation.id,
          sender: 'user',
          message: symptoms,
        },
        {
          consultation_id: consultation.id,
          sender: 'ai',
          message: aiResponse,
        },
      ]);

    return new Response(
      JSON.stringify({
        success: true,
        consultation: {
          id: consultation.id,
          aiResponse,
          diagnosisSummary,
          recommendations,
          urgencyLevel,
          status: initialStatus,
        },
      }),
      {
        status: 201,
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