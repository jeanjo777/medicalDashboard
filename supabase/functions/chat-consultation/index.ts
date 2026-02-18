import { createClient } from 'npm:@supabase/supabase-js@2.76.1';
import Anthropic from 'npm:@anthropic-ai/sdk@0.30.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ChatRequest {
  consultation_id: string;
  message: string;
}

interface ConsultationMessage {
  id: string;
  consultation_id: string;
  sender: 'user' | 'ai';
  message: string;
  created_at: string;
}

interface Consultation {
  id: string;
  patient_id: string;
  symptoms: string;
  duration: string | null;
  intensity: string | null;
  other_signs: string | null;
  status: string;
}

const MEDICAL_CHAT_SYSTEM_PROMPT = `Tu es un assistant medical IA qui poursuit une conversation avec un patient concernant ses symptomes.

CONTEXTE: Le patient a deja decrit ses symptomes initiaux et tu lui as fourni une analyse preliminaire. Cette conversation est un suivi.

REGLES:
1. Ne jamais poser de diagnostic definitif
2. Repondre aux questions de clarification du patient
3. Poser des questions pertinentes pour mieux comprendre la situation
4. Recommander une consultation medicale si necessaire
5. Ne jamais prescrire de medicaments

STYLE:
- Empathique et professionnel
- Reponses claires et concises (2-3 paragraphes max)
- Utiliser un langage accessible`;

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

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { consultation_id, message }: ChatRequest = await req.json();

    if (!consultation_id || !message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'consultation_id and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify consultation belongs to user
    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', consultation_id)
      .eq('patient_id', user.id)
      .single();

    if (consultationError || !consultation) {
      return new Response(
        JSON.stringify({ error: 'Consultation not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get conversation history
    const { data: messages, error: messagesError } = await supabase
      .from('consultation_messages')
      .select('*')
      .eq('consultation_id', consultation_id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch conversation history' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert user message first
    const { error: insertUserError } = await supabase
      .from('consultation_messages')
      .insert({
        consultation_id,
        sender: 'user',
        message: message.trim(),
      });

    if (insertUserError) {
      console.error('Error inserting user message:', insertUserError);
      return new Response(
        JSON.stringify({ error: 'Failed to save message' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate AI response
    const aiResponse = await generateChatResponse(
      consultation as Consultation,
      messages as ConsultationMessage[],
      message.trim()
    );

    // Insert AI response
    const { data: aiMessage, error: insertAiError } = await supabase
      .from('consultation_messages')
      .insert({
        consultation_id,
        sender: 'ai',
        message: aiResponse,
      })
      .select()
      .single();

    if (insertAiError) {
      console.error('Error inserting AI message:', insertAiError);
      return new Response(
        JSON.stringify({ error: 'Failed to save AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: {
          id: aiMessage.id,
          sender: 'ai',
          message: aiResponse,
          created_at: aiMessage.created_at,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateChatResponse(
  consultation: Consultation,
  history: ConsultationMessage[],
  newMessage: string
): Promise<string> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY not configured, using fallback response');
    return generateFallbackChatResponse(newMessage);
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    // Build context with consultation details
    const contextMessage = `CONTEXTE DE LA CONSULTATION:
- Symptomes initiaux: ${consultation.symptoms}
- Duree: ${consultation.duration || 'Non precisee'}
- Intensite: ${consultation.intensity || 'Non precisee'}
- Autres signes: ${consultation.other_signs || 'Aucun'}
- Statut: ${consultation.status}

HISTORIQUE DE LA CONVERSATION:`;

    // Build messages array for Claude
    const claudeMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      { role: 'user', content: contextMessage }
    ];

    // Add conversation history
    for (const msg of history) {
      claudeMessages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.message,
      });
    }

    // Add new user message
    claudeMessages.push({
      role: 'user',
      content: newMessage,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: MEDICAL_CHAT_SYSTEM_PROMPT,
      messages: claudeMessages,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    return content.text;
  } catch (error) {
    console.error('Claude API error:', error);
    return generateFallbackChatResponse(newMessage);
  }
}

function generateFallbackChatResponse(userMessage: string): string {
  // Simple keyword-based fallback responses
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('urgent') || lowerMessage.includes('grave') || lowerMessage.includes('douleur intense')) {
    return "Je comprends votre inquietude concernant l'intensite de vos symptomes. Si votre situation vous semble urgente ou si les symptomes s'aggravent rapidement, je vous recommande fortement de consulter un medecin ou de vous rendre aux urgences. Votre sante est prioritaire.";
  }

  if (lowerMessage.includes('merci') || lowerMessage.includes('ok') || lowerMessage.includes('compris')) {
    return "Je vous en prie. N'hesitez pas si vous avez d'autres questions. Je vous souhaite un prompt retablissement. Si les symptomes persistent ou s'aggravent, consultez un professionnel de sante.";
  }

  if (lowerMessage.includes('medicament') || lowerMessage.includes('traitement')) {
    return "Je ne suis pas en mesure de vous prescrire de medicaments. Pour obtenir un traitement adapte, veuillez consulter un medecin qui pourra evaluer votre situation et vous prescrire les soins necessaires.";
  }

  return "Merci pour ces informations supplementaires. Un medecin examinera votre dossier et prendra en compte tous les elements que vous avez fournis. Si vous avez d'autres questions ou precisions a apporter, n'hesitez pas.";
}
