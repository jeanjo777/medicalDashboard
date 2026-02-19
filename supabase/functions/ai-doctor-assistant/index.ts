import Anthropic from 'npm:@anthropic-ai/sdk@0.52.0';
import { createClient } from 'npm:@supabase/supabase-js@2.76.1';
// ============================================
// CORS & AUTH
// ============================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

// ============================================
// TYPES
// ============================================

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
  stream?: boolean;
}

// ============================================
// THINKING BUDGETS PER MODE
// ============================================

const THINKING_BUDGETS: Record<string, number> = {
  diagnostic: 12000,
  treatment: 12000,
  pharmacology: 10000,
  radiology: 8000,
  literature: 8000,
  general: 6000,
};

// ============================================
// TOOL DEFINITIONS
// ============================================

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'search_patient_records',
    description: 'Rechercher des patients dans la base de donnees. Peut filtrer par nom, pathologie, statut (active, in_treatment, recovered, discharged, critical), ou terme libre. Utiliser quand le medecin demande la liste de patients, cherche un patient, ou filtre par statut/pathologie. Mapping statut francais: retabli/gueri=recovered, en traitement/en cours=in_treatment, actif=active, critique=critical, sorti=discharged.',
    input_schema: {
      type: 'object' as const,
      properties: {
        patient_id: { type: 'string', description: 'UUID du patient (si connu)' },
        search_query: { type: 'string', description: 'Terme de recherche: nom, pathologie, etc.' },
        status: { type: 'string', description: 'Filtrer par statut: active, in_treatment, recovered, discharged, critical. Pour "retabli/gueri" utiliser "recovered", pour "en traitement" utiliser "in_treatment".' },
      },
      required: [],
    },
  },
  {
    name: 'check_drug_interactions',
    description: 'Verifier les interactions medicamenteuses entre une liste de medicaments. Retourne les interactions connues avec niveaux de gravite et recommandations.',
    input_schema: {
      type: 'object' as const,
      properties: {
        medications: {
          type: 'array',
          items: { type: 'string' },
          description: 'Liste des medicaments (DCI) a verifier',
        },
      },
      required: ['medications'],
    },
  },
  {
    name: 'calculate_medical_score',
    description: 'Calculer un score clinique medical: eGFR (CKD-EPI), CHA2DS2-VASc, SOFA, Wells, Glasgow, BMI, Cockcroft-Gault, HEART, qSOFA.',
    input_schema: {
      type: 'object' as const,
      properties: {
        score_name: { type: 'string', description: 'Nom du score: eGFR, CHA2DS2-VASc, SOFA, Wells_PE, Wells_DVT, Glasgow, BMI, Cockcroft, HEART, qSOFA' },
        parameters: {
          type: 'object' as const,
          description: 'Parametres du calcul (age, poids, creatinine, sexe, etc.)',
          properties: {},
        },
      },
      required: ['score_name', 'parameters'],
    },
  },
  {
    name: 'search_recent_labs',
    description: 'Recuperer les resultats de laboratoire et analyses recentes depuis l\'historique des consultations IA d\'un patient.',
    input_schema: {
      type: 'object' as const,
      properties: {
        patient_id: { type: 'string', description: 'UUID du patient' },
        lab_type: { type: 'string', description: 'Type d\'examen recherche (biologie, imagerie, ECG, etc.)' },
      },
      required: ['patient_id'],
    },
  },
  {
    name: 'get_appointment_history',
    description: 'Obtenir l\'historique complet des rendez-vous d\'un patient: dates, types, motifs, statuts.',
    input_schema: {
      type: 'object' as const,
      properties: {
        patient_id: { type: 'string', description: 'UUID du patient' },
        limit: { type: 'number', description: 'Nombre max de RDV (defaut: 20)' },
      },
      required: ['patient_id'],
    },
  },
];

// ============================================
// TOOL EXECUTION FUNCTIONS
// ============================================

async function executeTool(toolName: string, toolInput: Record<string, any>, supabase: any): Promise<string> {
  try {
    switch (toolName) {
      case 'search_patient_records': return await searchPatientRecords(toolInput, supabase);
      case 'check_drug_interactions': return checkDrugInteractions(toolInput);
      case 'calculate_medical_score': return calculateMedicalScore(toolInput);
      case 'search_recent_labs': return await searchRecentLabs(toolInput, supabase);
      case 'get_appointment_history': return await getAppointmentHistory(toolInput, supabase);
      default: return JSON.stringify({ error: `Outil inconnu: ${toolName}` });
    }
  } catch (error) {
    console.error(`Tool ${toolName} error:`, error);
    return JSON.stringify({ error: `Erreur lors de l'execution de ${toolName}: ${(error as Error).message}` });
  }
}

async function searchPatientRecords(input: Record<string, any>, supabase: any): Promise<string> {
  // Status mapping: French terms → DB values
  const STATUS_MAP: Record<string, string> = {
    'retabli': 'recovered', 'rétabli': 'recovered', 'gueri': 'recovered', 'guéri': 'recovered', 'recovered': 'recovered',
    'en traitement': 'in_treatment', 'en_treatment': 'in_treatment', 'in_treatment': 'in_treatment', 'en cours': 'in_treatment',
    'actif': 'active', 'active': 'active',
    'critique': 'critical', 'critical': 'critical',
    'sorti': 'discharged', 'discharged': 'discharged',
  };

  let query = supabase.from('patients').select('id, name, first_name, last_name, age, gender, date_of_birth, primary_pathology, riskScore, status, phone, email, address, notes, created_at');

  if (input.patient_id) {
    query = query.eq('id', input.patient_id);
  } else if (input.status) {
    const mappedStatus = STATUS_MAP[input.status.toLowerCase().trim()] || input.status;
    query = query.eq('status', mappedStatus);
  } else if (input.search_query) {
    const sq = input.search_query.toLowerCase().trim();
    // Check if search_query is actually a status term
    if (STATUS_MAP[sq]) {
      query = query.eq('status', STATUS_MAP[sq]);
    } else {
      query = query.or(`name.ilike.%${input.search_query}%,first_name.ilike.%${input.search_query}%,last_name.ilike.%${input.search_query}%,primary_pathology.ilike.%${input.search_query}%,email.ilike.%${input.search_query}%`);
    }
  }

  const { data, error } = await query.limit(20);
  if (error) return JSON.stringify({ error: error.message });
  if (!data || data.length === 0) return JSON.stringify({ message: 'Aucun patient trouve avec ces criteres' });

  // Fetch recent appointments for each patient
  for (const patient of data) {
    const { data: appts } = await supabase
      .from('appointments')
      .select('appointment_date, appointment_time, type_consultation, motif, status')
      .eq('patient_id', patient.id)
      .order('appointment_date', { ascending: false })
      .limit(5);
    patient.recent_appointments = appts || [];
  }

  return JSON.stringify({ patients: data, total: data.length });
}

function checkDrugInteractions(input: Record<string, any>): string {
  const medications: string[] = (input.medications || []).map((m: string) => m.toLowerCase().trim());
  if (medications.length < 2) return JSON.stringify({ message: 'Minimum 2 medicaments pour verifier les interactions' });

  // Database of common critical drug interactions
  const INTERACTIONS: Array<{ drugs: string[][]; severity: string; description: string; recommendation: string }> = [
    { drugs: [['warfarine', 'coumadine', 'fluindione', 'previscan', 'acenocoumarol'], ['aspirine', 'ibuprofene', 'diclofenac', 'naproxene', 'ketoprofene', 'piroxicam', 'meloxicam', 'celecoxib']], severity: 'MAJEURE', description: 'Anticoagulants + AINS: risque hemorragique majeur', recommendation: 'Association contre-indiquee. Utiliser paracetamol comme antalgique.' },
    { drugs: [['metformine'], ['produit de contraste iode', 'iode']], severity: 'MAJEURE', description: 'Metformine + Iode: risque d\'acidose lactique', recommendation: 'Arreter la metformine 48h avant et apres injection d\'iode.' },
    { drugs: [['iec', 'ramipril', 'enalapril', 'perindopril', 'lisinopril', 'captopril'], ['spironolactone', 'eplerenone', 'amiloride']], severity: 'MAJEURE', description: 'IEC/ARA2 + Diuretiques epargneurs de potassium: risque d\'hyperkaliemie', recommendation: 'Surveillance etroite de la kaliemie. Ajuster les doses.' },
    { drugs: [['methotrexate'], ['trimethoprime', 'bactrim', 'sulfamethoxazole']], severity: 'MAJEURE', description: 'Methotrexate + Trimethoprime: toxicite hematologique', recommendation: 'Association contre-indiquee. Risque de pancytopenie.' },
    { drugs: [['lithium'], ['ibuprofene', 'diclofenac', 'naproxene', 'ketoprofene', 'piroxicam', 'celecoxib']], severity: 'MAJEURE', description: 'Lithium + AINS: augmentation de la lithiemie', recommendation: 'Association deconseillee. Surveiller la lithiemie. Preferer paracetamol.' },
    { drugs: [['statine', 'simvastatine', 'atorvastatine', 'rosuvastatine', 'pravastatine'], ['erythromycine', 'clarithromycine', 'azithromycine']], severity: 'MODEREE', description: 'Statines + Macrolides: risque de rhabdomyolyse', recommendation: 'Suspendre la statine pendant le traitement macrolide ou utiliser azithromycine (moindre risque).' },
    { drugs: [['digoxine'], ['amiodarone']], severity: 'MODEREE', description: 'Digoxine + Amiodarone: augmentation de la digoxinemie', recommendation: 'Reduire la dose de digoxine de 50%. Surveiller la digoxinemie.' },
    { drugs: [['clopidogrel', 'plavix'], ['omeprazole', 'esomeprazole']], severity: 'MODEREE', description: 'Clopidogrel + IPP (omeprazole): reduction de l\'efficacite antiplaquettaire', recommendation: 'Preferer pantoprazole ou rabeprazole si IPP necessaire.' },
    { drugs: [['fluoxetine', 'paroxetine', 'sertraline', 'citalopram', 'escitalopram', 'venlafaxine'], ['tramadol']], severity: 'MODEREE', description: 'ISRS/IRSNA + Tramadol: risque de syndrome serotoninergique', recommendation: 'Association a eviter. Surveillance clinique si necessaire. Signes: agitation, tremblements, hyperthermie.' },
    { drugs: [['potassium', 'kcl'], ['spironolactone', 'eplerenone', 'amiloride', 'triamterene']], severity: 'MAJEURE', description: 'Potassium + Diuretiques epargneurs de K+: hyperkaliemie severe', recommendation: 'Association contre-indiquee sauf carence avere avec surveillance kaliemie.' },
    { drugs: [['insuline'], ['betabloquant', 'propranolol', 'atenolol', 'bisoprolol', 'metoprolol', 'carvedilol']], severity: 'MODEREE', description: 'Insuline + Betabloquants: masquage des signes d\'hypoglycemie', recommendation: 'Surveillance glycemique renforcee. Eduquer le patient sur les signes atypiques.' },
    { drugs: [['warfarine', 'fluindione', 'acenocoumarol'], ['amoxicilline', 'augmentin', 'ciprofloxacine', 'metronidazole', 'fluconazole']], severity: 'MODEREE', description: 'AVK + Antibiotiques/Antifongiques: augmentation de l\'INR', recommendation: 'Controler INR a J3-J4 du debut de l\'antibiotique. Ajuster la dose AVK.' },
    { drugs: [['dabigatran', 'rivaroxaban', 'apixaban', 'edoxaban'], ['ketoconazole', 'itraconazole', 'voriconazole', 'posaconazole']], severity: 'MAJEURE', description: 'AOD + Antifongiques azoles: augmentation des concentrations d\'AOD', recommendation: 'Association contre-indiquee avec ketoconazole/itraconazole. Prudence avec les autres.' },
    { drugs: [['colchicine'], ['clarithromycine', 'erythromycine', 'cyclosporine']], severity: 'MAJEURE', description: 'Colchicine + inhibiteurs CYP3A4: toxicite de la colchicine', recommendation: 'Reduire la dose de colchicine ou suspendre temporairement.' },
  ];

  const foundInteractions: Array<{ severity: string; description: string; recommendation: string; drugs_involved: string[] }> = [];

  for (let i = 0; i < medications.length; i++) {
    for (let j = i + 1; j < medications.length; j++) {
      for (const interaction of INTERACTIONS) {
        const match1in0 = interaction.drugs[0].some(d => medications[i].includes(d) || d.includes(medications[i]));
        const match2in1 = interaction.drugs[1].some(d => medications[j].includes(d) || d.includes(medications[j]));
        const match1in1 = interaction.drugs[1].some(d => medications[i].includes(d) || d.includes(medications[i]));
        const match2in0 = interaction.drugs[0].some(d => medications[j].includes(d) || d.includes(medications[j]));

        if ((match1in0 && match2in1) || (match1in1 && match2in0)) {
          foundInteractions.push({
            severity: interaction.severity,
            description: interaction.description,
            recommendation: interaction.recommendation,
            drugs_involved: [medications[i], medications[j]],
          });
        }
      }
    }
  }

  if (foundInteractions.length === 0) {
    return JSON.stringify({ message: 'Aucune interaction majeure connue detectee entre ces medicaments. Verifier sur Vidal/Theriaque pour confirmation.' });
  }

  return JSON.stringify({ interactions: foundInteractions, total: foundInteractions.length });
}

function calculateMedicalScore(input: Record<string, any>): string {
  const { score_name, parameters: p } = input;

  switch (score_name?.toLowerCase()) {
    case 'bmi': {
      const bmi = p.weight / ((p.height / 100) ** 2);
      let interpretation = '';
      if (bmi < 18.5) interpretation = 'Insuffisance ponderale';
      else if (bmi < 25) interpretation = 'Poids normal';
      else if (bmi < 30) interpretation = 'Surpoids';
      else if (bmi < 35) interpretation = 'Obesite classe I';
      else if (bmi < 40) interpretation = 'Obesite classe II';
      else interpretation = 'Obesite classe III (morbide)';
      return JSON.stringify({ score: 'BMI', value: Math.round(bmi * 10) / 10, unit: 'kg/m2', interpretation });
    }

    case 'egfr': {
      // CKD-EPI 2021 (sans ethnie)
      const { creatinine, age, sex } = p;
      const cr = creatinine; // mg/dL
      const isFemale = sex === 'F' || sex === 'female' || sex === 'feminin';
      const kappa = isFemale ? 0.7 : 0.9;
      const alpha = isFemale ? -0.241 : -0.302;
      const multi = isFemale ? 1.012 : 1.0;
      const minCr = Math.min(cr / kappa, 1);
      const maxCr = Math.max(cr / kappa, 1);
      const egfr = 142 * Math.pow(minCr, alpha) * Math.pow(maxCr, -1.200) * Math.pow(0.9938, age) * multi;
      let stade = '';
      if (egfr >= 90) stade = 'G1 - Fonction renale normale ou augmentee';
      else if (egfr >= 60) stade = 'G2 - Insuffisance renale legere';
      else if (egfr >= 45) stade = 'G3a - IR moderee';
      else if (egfr >= 30) stade = 'G3b - IR moderee a severe';
      else if (egfr >= 15) stade = 'G4 - IR severe';
      else stade = 'G5 - IR terminale';
      return JSON.stringify({ score: 'eGFR (CKD-EPI 2021)', value: Math.round(egfr), unit: 'mL/min/1.73m2', interpretation: stade });
    }

    case 'cockcroft': {
      const { creatinine, age, sex, weight } = p;
      const isFemale = sex === 'F' || sex === 'female' || sex === 'feminin';
      const clcr = ((140 - age) * weight) / (creatinine * 7.2) * (isFemale ? 0.85 : 1);
      return JSON.stringify({ score: 'Cockcroft-Gault', value: Math.round(clcr), unit: 'mL/min', interpretation: clcr > 90 ? 'Normal' : clcr > 60 ? 'IR legere' : clcr > 30 ? 'IR moderee' : clcr > 15 ? 'IR severe' : 'IR terminale' });
    }

    case 'cha2ds2-vasc': {
      let score = 0;
      if (p.chf) score += 1;
      if (p.hypertension) score += 1;
      if (p.age >= 75) score += 2;
      else if (p.age >= 65) score += 1;
      if (p.diabetes) score += 1;
      if (p.stroke_tia) score += 2;
      if (p.vascular_disease) score += 1;
      if (p.sex === 'F' || p.female) score += 1;
      let risk = '';
      if (score === 0) risk = 'Risque faible - Pas d\'anticoagulation';
      else if (score === 1) risk = 'Risque modere - Anticoagulation a considerer';
      else risk = `Risque eleve - Anticoagulation recommandee (risque AVC ~${[0, 1.3, 2.2, 3.2, 4.0, 6.7, 9.8, 9.6, 12.5, 15.2][Math.min(score, 9)]}%/an)`;
      return JSON.stringify({ score: 'CHA2DS2-VASc', value: score, max: 9, interpretation: risk });
    }

    case 'glasgow': {
      const eye = p.eye || 0;     // 1-4
      const verbal = p.verbal || 0; // 1-5
      const motor = p.motor || 0;   // 1-6
      const total = eye + verbal + motor;
      let severity = '';
      if (total <= 8) severity = 'Coma grave - Intubation a considerer';
      else if (total <= 12) severity = 'Coma modere';
      else if (total <= 14) severity = 'Alterations legeres';
      else severity = 'Normal';
      return JSON.stringify({ score: 'Glasgow Coma Scale', value: total, max: 15, components: { eye, verbal, motor }, interpretation: severity });
    }

    case 'wells_pe': {
      let score = 0;
      if (p.clinical_dvt) score += 3;
      if (p.pe_most_likely) score += 3;
      if (p.heart_rate_over_100) score += 1.5;
      if (p.immobilization_surgery) score += 1.5;
      if (p.previous_dvt_pe) score += 1.5;
      if (p.hemoptysis) score += 1;
      if (p.cancer) score += 1;
      let risk = '';
      if (score <= 1) risk = 'Faible probabilite EP';
      else if (score <= 6) risk = 'Probabilite intermediaire EP';
      else risk = 'Forte probabilite EP';
      return JSON.stringify({ score: 'Wells (EP)', value: score, interpretation: risk });
    }

    case 'sofa': {
      let score = 0;
      // PaO2/FiO2
      const pf = p.pao2_fio2 || 400;
      if (pf < 100) score += 4; else if (pf < 200) score += 3; else if (pf < 300) score += 2; else if (pf < 400) score += 1;
      // Platelets (x10^3/uL)
      const plt = p.platelets || 150;
      if (plt < 20) score += 4; else if (plt < 50) score += 3; else if (plt < 100) score += 2; else if (plt < 150) score += 1;
      // Bilirubin (mg/dL)
      const bili = p.bilirubin || 1;
      if (bili >= 12) score += 4; else if (bili >= 6) score += 3; else if (bili >= 2) score += 2; else if (bili >= 1.2) score += 1;
      // MAP or vasopressors
      if (p.vasopressors_high) score += 4; else if (p.vasopressors_low) score += 3; else if (p.dopamine_low) score += 2; else if (p.map_below_70) score += 1;
      // GCS
      const gcs = p.gcs || 15;
      if (gcs < 6) score += 4; else if (gcs < 10) score += 3; else if (gcs < 13) score += 2; else if (gcs < 15) score += 1;
      // Creatinine (mg/dL)
      const cr = p.creatinine || 1;
      if (cr >= 5) score += 4; else if (cr >= 3.5) score += 3; else if (cr >= 2) score += 2; else if (cr >= 1.2) score += 1;
      const mortality = score <= 6 ? '<10%' : score <= 9 ? '15-20%' : score <= 12 ? '40-50%' : score <= 14 ? '50-60%' : '>80%';
      return JSON.stringify({ score: 'SOFA', value: score, max: 24, interpretation: `Mortalite estimee: ${mortality}` });
    }

    case 'qsofa': {
      let score = 0;
      if (p.respiratory_rate >= 22) score += 1;
      if (p.systolic_bp <= 100) score += 1;
      if (p.altered_mentation) score += 1;
      return JSON.stringify({ score: 'qSOFA', value: score, max: 3, interpretation: score >= 2 ? 'Haut risque de sepsis - Evaluation SOFA complete recommandee' : 'Faible risque - Continuer surveillance' });
    }

    default:
      return JSON.stringify({ error: `Score inconnu: ${score_name}. Scores disponibles: BMI, eGFR, Cockcroft, CHA2DS2-VASc, Glasgow, Wells_PE, SOFA, qSOFA` });
  }
}

async function searchRecentLabs(input: Record<string, any>, supabase: any): Promise<string> {
  const { patient_id, lab_type } = input;

  // Get consultations for this patient
  const { data: consultations } = await supabase
    .from('consultations')
    .select('id')
    .eq('patient_id', patient_id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!consultations || consultations.length === 0) {
    return JSON.stringify({ message: 'Aucune consultation trouvee pour ce patient' });
  }

  const consultationIds = consultations.map((c: any) => c.id);

  let query = supabase
    .from('consultation_messages')
    .select('message, sender, created_at, metadata')
    .in('consultation_id', consultationIds)
    .eq('sender', 'ai')
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: messages } = await query;

  if (!messages || messages.length === 0) {
    return JSON.stringify({ message: 'Aucun resultat d\'analyse trouve dans l\'historique' });
  }

  // Filter by lab type if specified
  let filtered = messages;
  if (lab_type) {
    const keywords = lab_type.toLowerCase().split(/\s+/);
    filtered = messages.filter((m: any) => keywords.some((kw: string) => m.message.toLowerCase().includes(kw)));
  }

  return JSON.stringify({
    results: filtered.slice(0, 5).map((m: any) => ({
      date: m.created_at,
      mode: m.metadata?.mode,
      excerpt: m.message.substring(0, 500),
    })),
  });
}

async function getAppointmentHistory(input: Record<string, any>, supabase: any): Promise<string> {
  const { patient_id, limit: maxResults } = input;

  const { data, error } = await supabase
    .from('appointments')
    .select('appointment_date, appointment_time, type_consultation, motif, status, duration, priority, notes')
    .eq('patient_id', patient_id)
    .order('appointment_date', { ascending: false })
    .limit(maxResults || 20);

  if (error) return JSON.stringify({ error: error.message });
  if (!data || data.length === 0) return JSON.stringify({ message: 'Aucun rendez-vous trouve' });

  return JSON.stringify({ appointments: data, total: data.length });
}

// ============================================
// SYSTEM PROMPTS
// ============================================

const TOOLS_INSTRUCTION = `

OUTILS DISPONIBLES:
Tu disposes d'outils pour acceder a la base de donnees medicale. Utilise-les quand necessaire:
- search_patient_records: Chercher le dossier complet d'un patient
- check_drug_interactions: Verifier les interactions entre medicaments
- calculate_medical_score: Calculer des scores cliniques (eGFR, CHA2DS2-VASc, SOFA, Wells, Glasgow, BMI, Cockcroft, qSOFA)
- search_recent_labs: Trouver les resultats d'analyses recents
- get_appointment_history: Consulter l'historique des rendez-vous

N'hesite pas a utiliser ces outils AUTOMATIQUEMENT quand la question du medecin le justifie, sans attendre qu'on te le demande explicitement.`;

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

REGLES:
- Tu t'adresses a un MEDECIN, utilise un vocabulaire medical professionnel
- Toujours mentionner les diagnostics urgents en premier
- Ne jamais omettre les red flags
- Rappeler que l'examen clinique reste indispensable
- Citer les references/guidelines quand pertinent
- Proposer un traitement initial meme en attente de confirmation diagnostique quand cela est justifie` + TOOLS_INSTRUCTION,

  treatment: `Tu es un assistant IA medical specialise dans l'aide a la decision therapeutique et la prescription pour les MEDECINS.

ROLE: Expert en prescription medicale et conseils therapeutiques
- Prescrire des traitements complets avec posologies precises (DCI + nom commercial, dose, frequence, duree, voie d'administration)
- Donner des conseils therapeutiques detailles adaptes au terrain du patient
- Proposer un plan de traitement global: pharmacologique ET non-pharmacologique
- Mentionner les contre-indications, interactions et effets secondaires

FORMAT DE REPONSE:
1. **Diagnostic retenu / Indication** (rappel bref)
2. **Traitement pharmacologique** - DCI (Nom commercial) - Posologie - Duree
3. **Mesures non-pharmacologiques**
4. **Alternatives therapeutiques**
5. **Contre-indications a verifier**
6. **Interactions medicamenteuses** a surveiller
7. **Effets secondaires** principaux
8. **Plan de suivi**

REGLES:
- Tu prescris comme un medecin senior: sois precis sur les posologies (mg, frequence, duree)
- Toujours verifier les allergies et interactions avec les traitements en cours
- Adapter les posologies a l'age, au poids, a la fonction renale/hepatique, et a la grossesse
- Utilise l'outil check_drug_interactions quand tu prescris a un patient qui a deja des traitements` + TOOLS_INSTRUCTION,

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
- Indiquer les limites des connaissances actuelles` + TOOLS_INSTRUCTION,

  general: `Tu es un assistant IA medical polyvalent destine aux MEDECINS et professionnels de sante.

ROLE: Assistant medical general avec capacite de conseil therapeutique
- Repondre aux questions medicales avec precision
- Aider a la redaction de comptes-rendus
- Assister dans les calculs medicaux (scores, formules)
- Aider a l'interpretation des resultats
- Prescrire des traitements et donner des conseils therapeutiques quand le medecin le demande

REGLES:
- Vocabulaire medical professionnel
- Reponses structurees et concises
- Toujours mentionner les limites de l'IA
- Encourager la verification clinique
- Quand tu prescris, etre aussi precis qu'un medecin senior` + TOOLS_INSTRUCTION,

  radiology: `Tu es un assistant IA specialise en IMAGERIE MEDICALE concu pour aider les MEDECINS dans l'interpretation d'images medicales.

ROLE: Aide a l'interpretation d'imagerie medicale
- Analyser les images medicales fournies (radiographies, scanners CT, IRM, echographies, etc.)
- Identifier les anomalies visibles et les decrire avec la terminologie radiologique appropriee
- Proposer des diagnostics differentiels bases sur les anomalies observees

FORMAT DE REPONSE:
1. **Type d'examen et region** identifiee
2. **Qualite de l'image**
3. **Description systematique** des structures visibles
4. **Anomalies identifiees**
5. **Diagnostics differentiels** classes par probabilite
6. **Recommandations**

REGLES:
- Terminologie radiologique professionnelle
- Decrire systematiquement avant d'interpreter
- Toujours mentionner les limites de l'interpretation IA vs radiologue
- Signaler les urgences radiologiques en priorite
- Ne jamais poser un diagnostic definitif` + TOOLS_INSTRUCTION,

  pharmacology: `Tu es un assistant IA specialise en PHARMACOLOGIE MEDICALE concu pour aider les MEDECINS dans la gestion medicamenteuse.

ROLE: Expert en pharmacologie clinique et aide a la prescription
- Recommander des medicaments adaptes a la pathologie et au terrain du patient
- Verifier les interactions medicamenteuses et contre-indications
- Proposer des posologies precises selon les guidelines actuelles

FORMAT DE REPONSE:
1. **Medicaments recommandes** (DCI + nom commercial si pertinent)
2. **Mecanisme d'action** (resume)
3. **Contre-indications** principales
4. **Interactions medicamenteuses** a surveiller
5. **Effets indesirables** frequents et graves
6. **Surveillance** requise
7. **Alternatives** therapeutiques

REGLES:
- Toujours utiliser la DCI
- Adapter les posologies au terrain (age, poids, insuffisance renale/hepatique, grossesse)
- Utilise SYSTEMATIQUEMENT l'outil check_drug_interactions pour verifier les interactions
- Utilise calculate_medical_score pour calculer eGFR/Cockcroft si besoin d'adaptation posologique
- Mentionner le niveau de preuve et les guidelines (HAS, ANSM, EMA)` + TOOLS_INSTRUCTION,
};

// ============================================
// BUILD MESSAGES HELPER
// ============================================

function buildClaudeMessages(
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  context: AssistantRequest['context'],
  images: ImageData[]
): Array<{ role: 'user' | 'assistant'; content: any }> {
  const claudeMessages: Array<{ role: 'user' | 'assistant'; content: any }> = [];

  // Add patient context
  if (context && (context.patientName || context.patientAge || context.patientSex || context.antecedents?.length || context.currentMedications?.length || context.primaryPathology || context.riskScore)) {
    const contextParts = ['CONTEXTE PATIENT:'];
    if (context.patientName) contextParts.push(`- Nom: ${context.patientName}`);
    if (context.patientId) contextParts.push(`- ID: ${context.patientId}`);
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

  // Add conversation history (last 20 messages)
  const recentHistory = history.slice(-20);
  for (const msg of recentHistory) {
    claudeMessages.push({ role: msg.role, content: msg.content });
  }

  // Build current message (text + optional images)
  if (images.length > 0) {
    const contentBlocks: any[] = [];
    for (const img of images) {
      contentBlocks.push({
        type: 'image',
        source: { type: 'base64', media_type: img.mediaType, data: img.base64 },
      });
    }
    contentBlocks.push({
      type: 'text',
      text: images.length > 1 ? `${message}\n\n[${images.length} images fournies pour analyse]` : message,
    });
    claudeMessages.push({ role: 'user', content: contentBlocks });
  } else {
    claudeMessages.push({ role: 'user', content: message });
  }

  return claudeMessages;
}

// ============================================
// STREAMING SSE RESPONSE
// ============================================

function createStreamingResponse(
  anthropic: Anthropic,
  systemPrompt: string,
  claudeMessages: Array<{ role: 'user' | 'assistant'; content: any }>,
  mode: string,
  supabase: any
): Response {
  const encoder = new TextEncoder();
  const thinkingBudget = THINKING_BUDGETS[mode] || 6000;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: any) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch { /* stream closed */ }
      };

      try {
        let fullText = '';
        let thinkingText = '';
        let toolIteration = 0;
        const MAX_TOOL_ITERATIONS = 3;
        let currentMessages = [...claudeMessages];

        // Recursive function for tool use loop
        const runStream = async (messages: any[]) => {
          const response = await anthropic.messages.create({
            model: 'claude-opus-4-6',
            max_tokens: 16000,
            system: systemPrompt,
            messages,
            tools: TOOLS,
            thinking: { type: 'enabled', budget_tokens: thinkingBudget },
            stream: true,
          });

          let currentToolUseId = '';
          let currentToolName = '';
          let currentToolInput = '';
          const toolUseBlocks: Array<{ id: string; name: string; input: any }> = [];
          let hasText = false;

          for await (const event of response as any) {
            if (event.type === 'content_block_start') {
              if (event.content_block?.type === 'thinking') {
                send('thinking_start', {});
              } else if (event.content_block?.type === 'tool_use') {
                currentToolUseId = event.content_block.id;
                currentToolName = event.content_block.name;
                currentToolInput = '';
                send('tool_use', { tool: currentToolName, status: 'calling' });
              }
            } else if (event.type === 'content_block_delta') {
              if (event.delta?.type === 'thinking_delta') {
                thinkingText += event.delta.thinking;
                send('thinking', { text: event.delta.thinking });
              } else if (event.delta?.type === 'text_delta') {
                fullText += event.delta.text;
                hasText = true;
                send('text', { text: event.delta.text });
              } else if (event.delta?.type === 'input_json_delta') {
                currentToolInput += event.delta.partial_json;
              }
            } else if (event.type === 'content_block_stop') {
              if (currentToolUseId && currentToolName) {
                let parsedInput = {};
                try { parsedInput = JSON.parse(currentToolInput); } catch { /* empty */ }
                toolUseBlocks.push({ id: currentToolUseId, name: currentToolName, input: parsedInput });
                currentToolUseId = '';
                currentToolName = '';
                currentToolInput = '';
              }
            }
          }

          // Handle tool use results
          if (toolUseBlocks.length > 0 && toolIteration < MAX_TOOL_ITERATIONS) {
            toolIteration++;

            // Execute all tools
            const toolResults: any[] = [];
            for (const tool of toolUseBlocks) {
              const result = await executeTool(tool.name, tool.input, supabase);
              send('tool_result', { tool: tool.name, result: result.substring(0, 300) });
              toolResults.push({
                type: 'tool_result',
                tool_use_id: tool.id,
                content: result,
              });
            }

            // Build follow-up messages with assistant response + tool results
            const assistantContent: any[] = [];
            if (thinkingText) {
              assistantContent.push({ type: 'thinking', thinking: thinkingText });
            }
            if (fullText) {
              assistantContent.push({ type: 'text', text: fullText });
            }
            for (const tool of toolUseBlocks) {
              assistantContent.push({ type: 'tool_use', id: tool.id, name: tool.name, input: tool.input });
            }

            const newMessages = [
              ...messages,
              { role: 'assistant', content: assistantContent },
              ...toolResults.map(tr => ({ role: 'user', content: [tr] })),
            ];

            // Reset text for follow-up response (keep thinking from first pass)
            fullText = '';
            await runStream(newMessages);
          }
        };

        await runStream(currentMessages);

        send('done', {
          full_response: fullText,
          thinking: thinkingText ? thinkingText.substring(0, 2000) : null,
          mode,
          model: 'claude-opus-4-6',
          timestamp: new Date().toISOString(),
        });

        controller.close();
      } catch (error) {
        console.error('Streaming error:', error);
        send('error', { error: (error as Error).message || 'Erreur interne' });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// ============================================
// NON-STREAMING FALLBACK
// ============================================

async function generateNonStreamingResponse(
  anthropic: Anthropic,
  systemPrompt: string,
  claudeMessages: Array<{ role: 'user' | 'assistant'; content: any }>,
  mode: string,
  supabase: any
): Promise<string> {
  const thinkingBudget = THINKING_BUDGETS[mode] || 6000;

  let currentMessages = [...claudeMessages];
  let toolIteration = 0;
  const MAX_TOOL_ITERATIONS = 3;

  while (toolIteration <= MAX_TOOL_ITERATIONS) {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 16000,
      system: systemPrompt,
      messages: currentMessages,
      tools: TOOLS,
      thinking: { type: 'enabled', budget_tokens: thinkingBudget },
    });

    // Check for tool use
    const toolUseBlocks = response.content.filter((b: any) => b.type === 'tool_use');
    const textBlocks = response.content.filter((b: any) => b.type === 'text');

    if (toolUseBlocks.length === 0 || toolIteration >= MAX_TOOL_ITERATIONS) {
      return textBlocks.map((b: any) => b.text).join('\n') || 'Pas de reponse generee.';
    }

    // Execute tools and continue
    toolIteration++;
    const toolResults: any[] = [];
    for (const tool of toolUseBlocks) {
      const result = await executeTool((tool as any).name, (tool as any).input, supabase);
      toolResults.push({
        type: 'tool_result',
        tool_use_id: (tool as any).id,
        content: result,
      });
    }

    currentMessages = [
      ...currentMessages,
      { role: 'assistant', content: response.content },
      ...toolResults.map(tr => ({ role: 'user' as const, content: [tr] })),
    ];
  }

  return 'Nombre maximum d\'iterations d\'outils atteint.';
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

Le service sera retabli des que possible.`;
}

// ============================================
// MAIN SERVER
// ============================================

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Verify authentication
    // Supabase API gateway already validates the JWT in the Authorization header
    // before the request reaches this Edge Function, so we just check it exists.
    const authHeader = req.headers.get('Authorization');
    const apiKey = req.headers.get('apikey') || req.headers.get('Apikey');

    if (!authHeader && !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, history = [], context, mode = 'general', image, images, stream = true }: AssistantRequest = await req.json();

    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      console.warn('ANTHROPIC_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: true, response: generateFallbackResponse(message, mode), mode, timestamp: new Date().toISOString() }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const anthropic = new Anthropic({ apiKey: anthropicApiKey });
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const allImages = images && images.length > 0 ? images : (image ? [image] : []);
    const claudeMessages = buildClaudeMessages(message.trim(), history, context, allImages);
    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.general;

    // Streaming response
    if (stream) {
      return createStreamingResponse(anthropic, systemPrompt, claudeMessages, mode, supabase);
    }

    // Non-streaming response (backward compatibility)
    const aiResponse = await generateNonStreamingResponse(anthropic, systemPrompt, claudeMessages, mode, supabase);
    return new Response(
      JSON.stringify({ success: true, response: aiResponse, mode, timestamp: new Date().toISOString() }),
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
