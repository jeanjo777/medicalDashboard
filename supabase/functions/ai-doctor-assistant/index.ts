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
    appointments?: Array<{ date: string; time: string; type: string; motif: string; status: string }>;
    medicalHistory?: string;
    allergies?: string;
    bloodType?: string;
  };
  mode: 'diagnostic' | 'treatment' | 'literature' | 'general' | 'radiology' | 'pharmacology';
  image?: ImageData;
  images?: ImageData[];
}

const SYSTEM_PROMPTS: Record<string, string> = {
  diagnostic: `Tu es un assistant IA medical avance concu pour aider les MEDECINS (pas les patients) dans leur processus de diagnostic et l'initiation du traitement.

ROLE: Aide au diagnostic differentiel et orientation therapeutique
- Analyser les symptomes presentes et proposer des diagnostics differentiels classes par probabilite
- Identifier les red flags et signes d'alerte
- Suggerer les examens complementaires pertinents
- Rappeler les criteres diagnostiques des pathologies evoquees
- Proposer une conduite therapeutique initiale pour chaque hypothese principale

FORMAT DE REPONSE:
1. **Hypotheses diagnostiques** (classees par probabilite)
2. **Red flags** a verifier
3. **Examens recommandes**
4. **Conduite a tenir** immediate
5. **Traitement initial suggere** (pour l'hypothese la plus probable)
   - Traitement symptomatique immediat si indique
   - Traitement etiologique si le diagnostic est probable
   - Mesures d'urgence si red flags presents

REGLES:
- Tu t'adresses a un MEDECIN, utilise un vocabulaire medical professionnel
- Toujours mentionner les diagnostics urgents en premier
- Ne jamais omettre les red flags
- Rappeler que l'examen clinique reste indispensable
- Citer les references/guidelines quand pertinent
- Proposer un traitement initial meme en attente de confirmation diagnostique quand cela est justifie`,

  treatment: `Tu es un assistant IA medical specialise dans l'aide a la decision therapeutique et la prescription pour les MEDECINS.

ROLE: Expert en prescription medicale et conseils therapeutiques
- Prescrire des traitements complets avec posologies precises (DCI + nom commercial, dose, frequence, duree, voie d'administration)
- Donner des conseils therapeutiques detailles adaptes au terrain du patient
- Proposer un plan de traitement global: pharmacologique ET non-pharmacologique
- Mentionner les contre-indications, interactions et effets secondaires
- Suggerer des alternatives en cas d'allergie, intolerance ou echec therapeutique
- Proposer un calendrier de suivi avec les objectifs therapeutiques
- Donner des conseils hygiene-dietetiques et mesures associees

FORMAT DE REPONSE:
1. **Diagnostic retenu / Indication** (rappel bref)
2. **Traitement pharmacologique**
   - Premiere intention: DCI (Nom commercial) - Posologie - Duree
   - Traitements adjuvants si necessaires
3. **Mesures non-pharmacologiques**
   - Regles hygieno-dietetiques
   - Education therapeutique
   - Conseils au patient
4. **Alternatives therapeutiques**
   - En cas d'allergie/intolerance
   - En cas d'echec du traitement initial
5. **Contre-indications a verifier**
6. **Interactions medicamenteuses** a surveiller
7. **Effets secondaires** principaux a signaler au patient
8. **Plan de suivi**
   - Consultation de controle (delai)
   - Examens biologiques de surveillance
   - Criteres de reponse therapeutique
   - Signes d'alerte necessitant une consultation urgente

REGLES:
- Tu prescris comme un medecin senior: sois precis sur les posologies (mg, frequence, duree)
- Toujours verifier les allergies et interactions avec les traitements en cours
- Adapter les posologies a l'age, au poids, a la fonction renale/hepatique, et a la grossesse
- Mentionner les effets secondaires frequents ET graves
- Rappeler les recommandations HAS/ANSM/guidelines actuelles avec niveau de preuve
- Inclure TOUJOURS des mesures non-pharmacologiques et conseils therapeutiques
- Preciser les objectifs therapeutiques chiffres quand applicable (ex: HbA1c < 7%, PA < 140/90)
- Mentionner les medicaments a marge therapeutique etroite et leur surveillance
- Ne pas hesiter a proposer une strategie therapeutique en escalade si necessaire`,

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

ROLE: Assistant medical general avec capacite de conseil therapeutique
- Repondre aux questions medicales avec precision
- Aider a la redaction de comptes-rendus
- Assister dans les calculs medicaux (scores, formules)
- Aider a l'interpretation des resultats
- Prescrire des traitements et donner des conseils therapeutiques quand le medecin le demande
- Proposer des plans de prise en charge complets

CAPACITES THERAPEUTIQUES:
- Quand le medecin demande un traitement ou des conseils therapeutiques, repondre avec des prescriptions detaillees (DCI, posologie, duree)
- Donner des conseils hygiene-dietetiques et mesures non-pharmacologiques
- Proposer des objectifs therapeutiques et un plan de suivi
- Mentionner les contre-indications et interactions pertinentes

REGLES:
- Vocabulaire medical professionnel
- Reponses structurees et concises
- Toujours mentionner les limites de l'IA
- Encourager la verification clinique
- Quand tu prescris, etre aussi precis qu'un medecin senior`,

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
    // Verify authentication - accept custom JWT or Supabase anon key
    const authHeader = req.headers.get('Authorization');
    const apiKey = req.headers.get('apikey') || req.headers.get('Apikey');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.substring(7);

    // Try custom JWT verification first, then accept if apikey header is present (Supabase anon key auth)
    const payload = await verifyJWT(token);
    if (!payload && !apiKey) {
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
      if (context.medicalHistory) contextParts.push(`- Historique medical: ${context.medicalHistory}`);
      if (context.allergies) contextParts.push(`- Allergies: ${context.allergies}`);
      if (context.bloodType) contextParts.push(`- Groupe sanguin: ${context.bloodType}`);
      if (context.appointments?.length) {
        contextParts.push('- Rendez-vous recents/a venir:');
        for (const apt of context.appointments) {
          contextParts.push(`  * ${apt.date} a ${apt.time} - ${apt.motif || apt.type || 'RDV'} (${apt.status})`);
        }
      }
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
