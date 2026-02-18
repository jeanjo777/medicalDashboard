import { createClient } from 'npm:@supabase/supabase-js@2.76.1';
import Anthropic from 'npm:@anthropic-ai/sdk@0.30.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ImageData {
  base64: string;
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
}

interface AssistantRequest {
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: {
    patientId?: string;
    patientName?: string;
    patientAge?: number;
    patientSex?: string;
    antecedents?: string[];
    currentMedications?: string[];
    primaryPathology?: string;
    riskScore?: number;
  };
  mode: 'diagnostic' | 'treatment' | 'literature' | 'general' | 'radiology' | 'pharmacology';
  image?: ImageData;
  images?: ImageData[];
}

const SYSTEM_PROMPTS: Record<string, string> = {
  diagnostic: `Tu es un assistant IA medical avance concu pour aider les MEDECINS (pas les patients) dans leur processus de diagnostic.

ROLE: Aide au diagnostic differentiel
- Analyser les symptomes presentes et proposer des diagnostics differentiels classes par probabilite
- Identifier les red flags et signes d'alerte
- Suggerer les examens complementaires pertinents
- Rappeler les criteres diagnostiques des pathologies evoquees

FORMAT DE REPONSE:
1. **Hypotheses diagnostiques** (classees par probabilite)
2. **Red flags** a verifier
3. **Examens recommandes**
4. **Conduite a tenir** immediate

REGLES:
- Tu t'adresses a un MEDECIN, utilise un vocabulaire medical professionnel
- Toujours mentionner les diagnostics urgents en premier
- Ne jamais omettre les red flags
- Rappeler que l'examen clinique reste indispensable
- Citer les references/guidelines quand pertinent`,

  treatment: `Tu es un assistant IA medical specialise dans l'aide a la decision therapeutique pour les MEDECINS.

ROLE: Aide a la prescription et au plan de traitement
- Proposer des options therapeutiques basees sur les recommandations actuelles
- Mentionner les posologies standard, contre-indications et interactions
- Suggerer des alternatives en cas d'allergie ou d'intolerance
- Rappeler les mesures non-pharmacologiques

FORMAT:
1. **Traitement de premiere intention**
2. **Alternatives**
3. **Contre-indications a verifier**
4. **Suivi recommande**

REGLES:
- Toujours verifier les allergies et interactions
- Adapter les posologies a l'age et au terrain
- Mentionner les effets secondaires principaux
- Rappeler les recommandations HAS/guidelines actuelles`,

  literature: `Tu es un assistant IA specialise dans la recherche de litterature medicale pour les MEDECINS.

ROLE: Synthese de connaissances medicales
- Resumer les donnees actuelles sur une pathologie ou un traitement
- Citer les etudes et guidelines de reference
- Expliquer les mecanismes physiopathologiques
- Comparer les approches therapeutiques

FORMAT:
1. **Resume** de la connaissance actuelle
2. **Evidence** (niveau de preuve)
3. **Guidelines** applicables
4. **Points de controverse** ou recherche en cours

REGLES:
- Preciser le niveau de preuve des recommandations
- Mentionner les dates des guidelines citees
- Indiquer les limites des connaissances actuelles`,

  general: `Tu es un assistant IA medical polyvalent destine aux MEDECINS et professionnels de sante.

ROLE: Assistant medical general
- Repondre aux questions medicales avec precision
- Aider a la redaction de comptes-rendus
- Assister dans les calculs medicaux (scores, formules)
- Aider a l'interpretation des resultats

REGLES:
- Vocabulaire medical professionnel
- Reponses structurees et concises
- Toujours mentionner les limites de l'IA
- Encourager la verification clinique`,

  radiology: `Tu es un assistant IA specialise en IMAGERIE MEDICALE concu pour aider les MEDECINS dans l'interpretation d'images medicales.

ROLE: Aide a l'interpretation d'imagerie medicale
- Analyser les images medicales fournies (radiographies, scanners CT, IRM, echographies, etc.)
- Identifier les anomalies visibles et les decrire avec la terminologie radiologique appropriee
- Proposer des diagnostics differentiels bases sur les anomalies observees
- Suggerer des examens d'imagerie complementaires si necessaire
- Comparer avec les patterns normaux attendus

FORMAT DE REPONSE:
1. **Type d'examen et region** identifiee
2. **Qualite de l'image** (adequate pour interpretation, limites techniques)
3. **Description systematique** des structures visibles
4. **Anomalies identifiees** (localisation, taille, morphologie, densite/signal)
5. **Diagnostics differentiels** classes par probabilite
6. **Recommandations** (examens complementaires, suivi)

REGLES:
- Tu t'adresses a un MEDECIN, utilise la terminologie radiologique professionnelle
- Decrire systematiquement avant d'interpreter
- Toujours mentionner les limites de l'interpretation IA vs radiologue
- Signaler les urgences radiologiques en priorite (pneumothorax, fracture instable, AVC, etc.)
- Mentionner si la qualite de l'image limite l'interpretation
- Rappeler que la correlation clinique est indispensable
- Ne jamais poser un diagnostic definitif - toujours formuler comme "aspect evocateur de" ou "compatible avec"`,

  pharmacology: `Tu es un assistant IA specialise en PHARMACOLOGIE MEDICALE concu pour aider les MEDECINS dans la gestion medicamenteuse.

ROLE: Expert en pharmacologie clinique et aide a la prescription
- Recommander des medicaments adaptes a la pathologie et au terrain du patient
- Verifier les interactions medicamenteuses et contre-indications
- Proposer des posologies precises selon les guidelines actuelles
- Informer sur la pharmacocinetique et pharmacodynamie pertinente
- Alerter sur les effets indesirables importants et la pharmacovigilance

FORMAT DE REPONSE:
1. **Medicaments recommandes** (DCI + nom commercial si pertinent)
   - Classe therapeutique
   - Posologie (dose, frequence, duree)
   - Voie d'administration
2. **Mecanisme d'action** (resume)
3. **Contre-indications** principales
4. **Interactions medicamenteuses** a surveiller
5. **Effets indesirables** frequents et graves
6. **Surveillance** requise (biologique, clinique)
7. **Alternatives** therapeutiques

REGLES:
- Toujours utiliser la DCI (Denomination Commune Internationale)
- Adapter les posologies au terrain (age, poids, insuffisance renale/hepatique, grossesse)
- Verifier les interactions avec les traitements en cours du patient si le contexte est fourni
- Mentionner le niveau de preuve et les guidelines de reference (HAS, ANSM, EMA)
- Alerter sur les medicaments a marge therapeutique etroite
- Rappeler les regles de prescription des stupefiants et psychotropes
- Preciser les adaptations posologiques necessaires (clairance renale, etc.)
- Toujours encourager la verification sur les bases de donnees officielles (Vidal, Theriaque)`,
};

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

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, history = [], context, mode = 'general', image, images }: AssistantRequest = await req.json();

    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use images array if provided, otherwise fall back to single image
    const allImages = images && images.length > 0 ? images : (image ? [image] : []);

    const aiResponse = await generateAssistantResponse(message.trim(), history, context, mode, allImages);

    return new Response(
      JSON.stringify({
        success: true,
        response: aiResponse,
        mode,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('AI Assistant error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateAssistantResponse(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  context: AssistantRequest['context'],
  mode: string,
  images: ImageData[]
): Promise<string> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY not configured, using fallback');
    return generateFallbackResponse(message, mode);
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    // Build messages array
    const claudeMessages: Array<{ role: 'user' | 'assistant'; content: any }> = [];

    // Add patient context if provided (enhanced with more fields)
    if (context && (context.patientName || context.patientAge || context.patientSex || context.antecedents?.length || context.currentMedications?.length || context.primaryPathology || context.riskScore)) {
      const contextParts = ['CONTEXTE PATIENT:'];
      if (context.patientName) contextParts.push(`- Nom: ${context.patientName}`);
      if (context.patientAge) contextParts.push(`- Age: ${context.patientAge} ans`);
      if (context.patientSex) contextParts.push(`- Sexe: ${context.patientSex}`);
      if (context.primaryPathology) contextParts.push(`- Pathologie principale: ${context.primaryPathology}`);
      if (context.riskScore != null) contextParts.push(`- Score de risque: ${context.riskScore}%`);
      if (context.antecedents?.length) contextParts.push(`- Antecedents: ${context.antecedents.join(', ')}`);
      if (context.currentMedications?.length) contextParts.push(`- Traitements en cours: ${context.currentMedications.join(', ')}`);
      claudeMessages.push({ role: 'user', content: contextParts.join('\n') });
      claudeMessages.push({ role: 'assistant', content: 'Contexte patient note. Je suis pret a vous aider avec toutes les informations disponibles.' });
    }

    // Add conversation history (last 20 messages max)
    const recentHistory = history.slice(-20);
    for (const msg of recentHistory) {
      claudeMessages.push({ role: msg.role, content: msg.content });
    }

    // Build current message content (text + optional images)
    if (images.length > 0) {
      // Multimodal message with one or more images
      const contentBlocks: any[] = [];
      for (const img of images) {
        contentBlocks.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: img.mediaType,
            data: img.base64,
          },
        });
      }
      contentBlocks.push({
        type: 'text',
        text: images.length > 1
          ? `${message}\n\n[${images.length} images fournies pour analyse]`
          : message,
      });
      claudeMessages.push({ role: 'user', content: contentBlocks });
    } else {
      claudeMessages.push({ role: 'user', content: message });
    }

    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.general;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: claudeMessages,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    return content.text;
  } catch (error) {
    console.error('Claude API error:', error);
    return generateFallbackResponse(message, mode);
  }
}

function generateFallbackResponse(message: string, mode: string): string {
  const modeLabels: Record<string, string> = {
    diagnostic: 'aide au diagnostic',
    treatment: 'aide therapeutique',
    literature: 'recherche medicale',
    general: 'assistance medicale',
    radiology: 'analyse d\'imagerie medicale',
    pharmacology: 'aide pharmacologique',
  };

  return `Je suis desole, le service d'${modeLabels[mode] || 'assistance medicale'} IA n'est pas disponible pour le moment.

**Votre question:** "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"

En attendant, voici quelques ressources utiles:
- **HAS** (Haute Autorite de Sante): recommandations officielles
- **Vidal**: base de donnees medicamenteuses
- **PubMed**: recherche de litterature scientifique
- **UpToDate**: syntheses cliniques

Le service sera retabli des que possible. Si votre question est urgente, veuillez consulter ces references directement.`;
}
