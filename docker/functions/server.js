const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'medicare-pro-jwt-secret-2026-production-key!!';
const REGISTRATION_SECRET = process.env.REGISTRATION_SECRET || 'MEDICARE2026';

const pool = new Pool({
  host: 'db',
  port: 5432,
  database: 'medicare',
  user: 'medicare',
  password: process.env.DB_PASSWORD || 'MediCarePg2026',
});

// Helper: extract and verify JWT from Authorization header
function verifyAuth(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const token = auth.replace('Bearer ', '');
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// ============================================================
// AUTH LOGIN
// ============================================================
app.post('/functions/v1/auth-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username et password requis' });
    }

    const result = await pool.query(
      'SELECT * FROM medics WHERE username = $1 AND is_active = true',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Identifiant ou mot de passe incorrect' });
    }

    const user = result.rows[0];

    // Check password (bcrypt hash or plain text fallback)
    let valid = false;
    if (user.password_hash) {
      valid = await bcrypt.compare(password, user.password_hash);
    }
    if (!valid && user.password === password) {
      valid = true;
    }

    if (!valid) {
      // Increment login attempts
      await pool.query('UPDATE medics SET login_attempts = login_attempts + 1 WHERE id = $1', [user.id]);
      return res.status(401).json({ success: false, error: 'Identifiant ou mot de passe incorrect' });
    }

    // Generate JWT
    const token = jwt.sign(
      { role: 'authenticated', iss: 'medicare-pro', sub: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last_login
    await pool.query('UPDATE medics SET last_login = NOW(), login_attempts = 0 WHERE id = $1', [user.id]);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        nom: user.nom,
        prenom: user.prenom,
        specialite: user.specialite,
        email: user.email,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    console.error('auth-login error:', err);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// ============================================================
// VERIFY TOKEN
// ============================================================
app.post('/functions/v1/verify-token', async (req, res) => {
  const claims = verifyAuth(req);
  if (!claims) {
    return res.status(401).json({ valid: false, error: 'Token invalide' });
  }

  try {
    const result = await pool.query(
      'SELECT id, username, nom, prenom, specialite, email, avatar_url FROM medics WHERE id = $1 AND is_active = true',
      [claims.sub]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ valid: false, error: 'Utilisateur introuvable' });
    }

    res.json({ valid: true, user: result.rows[0] });
  } catch (err) {
    console.error('verify-token error:', err);
    res.status(500).json({ valid: false, error: 'Erreur serveur' });
  }
});

// ============================================================
// REGISTER PATIENT
// ============================================================
app.post('/functions/v1/register-patient', async (req, res) => {
  try {
    const { email, name, age, gender } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }

    const result = await pool.query(
      `INSERT INTO patients (email, name, age, gender) VALUES ($1, $2, $3, $4) RETURNING id`,
      [email || null, name, age || null, gender || 'male']
    );

    res.json({ success: true, patientId: result.rows[0].id });
  } catch (err) {
    console.error('register-patient error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Un patient avec cet email existe deja' });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// REGISTER MEDIC
// ============================================================
app.post('/functions/v1/register-medic', async (req, res) => {
  try {
    const { username, password, secretCode } = req.body;

    if (secretCode !== REGISTRATION_SECRET) {
      return res.status(403).json({ error: 'Code secret invalide' });
    }

    if (!username || !password || password.length < 8) {
      return res.status(400).json({ error: 'Username et mot de passe (8+ caracteres) requis' });
    }

    const existing = await pool.query('SELECT id FROM medics WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Ce nom d\'utilisateur existe deja' });
    }

    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      `INSERT INTO medics (username, password, password_hash, nom, prenom, specialite, is_active) VALUES ($1, $2, $3, $1, '', 'Medecin', true)`,
      [username, password, hash]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('register-medic error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// MANAGE PATIENTS (GET / POST / PUT / DELETE)
// ============================================================
app.get('/functions/v1/manage-patients', async (req, res) => {
  const claims = verifyAuth(req);
  if (!claims) return res.status(401).json({ error: 'Non autorise' });

  try {
    const result = await pool.query('SELECT * FROM patients ORDER BY created_at DESC');
    res.json({ patients: result.rows });
  } catch (err) {
    console.error('manage-patients GET error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/functions/v1/manage-patients', async (req, res) => {
  const claims = verifyAuth(req);
  if (!claims) return res.status(401).json({ error: 'Non autorise' });

  try {
    const { email, name, age, gender, profilePic } = req.body;
    const result = await pool.query(
      `INSERT INTO patients (email, name, age, gender, profile_pic) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [email || null, name, age || null, gender || 'male', profilePic || null]
    );
    res.json({ success: true, patient: result.rows[0] });
  } catch (err) {
    console.error('manage-patients POST error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/functions/v1/manage-patients', async (req, res) => {
  const claims = verifyAuth(req);
  if (!claims) return res.status(401).json({ error: 'Non autorise' });

  try {
    const { patientId, email, name, age, gender, profilePic } = req.body;
    if (!patientId) return res.status(400).json({ error: 'patientId requis' });

    await pool.query(
      `UPDATE patients SET email = $1, name = $2, age = $3, gender = $4, profile_pic = $5, updated_at = NOW() WHERE id = $6`,
      [email || null, name, age || null, gender || 'male', profilePic || null, patientId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('manage-patients PUT error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/functions/v1/manage-patients', async (req, res) => {
  const claims = verifyAuth(req);
  if (!claims) return res.status(401).json({ error: 'Non autorise' });

  try {
    const patientId = req.query.patientId;
    if (!patientId) return res.status(400).json({ error: 'patientId requis' });

    await pool.query('DELETE FROM patients WHERE id = $1', [patientId]);
    res.json({ success: true });
  } catch (err) {
    console.error('manage-patients DELETE error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// GET PATIENT SUMMARY
// ============================================================
app.post('/functions/v1/get-patient-summary', async (req, res) => {
  const claims = verifyAuth(req);
  if (!claims) return res.status(401).json({ error: 'Non autorise' });

  try {
    const { patientId } = req.body;
    if (!patientId) return res.status(400).json({ error: 'patientId requis' });

    const patient = await pool.query('SELECT * FROM patients WHERE id = $1', [patientId]);
    if (patient.rows.length === 0) return res.status(404).json({ error: 'Patient introuvable' });

    const appointments = await pool.query(
      'SELECT * FROM appointments WHERE patient_id = $1 ORDER BY date DESC LIMIT 10', [patientId]
    );
    const consultations = await pool.query(
      'SELECT * FROM consultations WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 10', [patientId]
    );

    res.json({
      patient: patient.rows[0],
      appointments: appointments.rows,
      consultations: consultations.rows,
    });
  } catch (err) {
    console.error('get-patient-summary error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// SEND EMAIL (stub - returns success)
// ============================================================
app.post('/functions/v1/send-email', async (req, res) => {
  const claims = verifyAuth(req);
  if (!claims) return res.status(401).json({ error: 'Non autorise' });
  // TODO: Integrate with N8N or SMTP
  res.json({ success: true, message: 'Email envoye (stub)' });
});

// ============================================================
// PASSWORD RESET (stubs)
// ============================================================
app.post('/functions/v1/send-reset-password', async (req, res) => {
  res.json({ success: true, message: 'Email de reinitialisation envoye' });
});

app.post('/functions/v1/validate-reset-token', async (req, res) => {
  res.json({ valid: false, error: 'Fonctionnalite non disponible en mode self-hosted' });
});

// ============================================================
// AI DOCTOR ASSISTANT (Claude API with SSE streaming)
// ============================================================
const Anthropic = require('@anthropic-ai/sdk');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

const MODE_PROMPTS = {
  general: "Tu es un assistant medical IA generaliste. Reponds aux questions medicales de maniere claire et professionnelle.",
  diagnostic: "Tu es un assistant specialise en diagnostic medical. Aide le medecin a analyser les symptomes, proposer des diagnostics differentiels et suggerer des examens complementaires.",
  treatment: "Tu es un assistant specialise en therapeutique. Aide le medecin a elaborer des plans de traitement, choisir les medicaments adaptes et planifier le suivi.",
  literature: "Tu es un assistant specialise en recherche medicale. Fournis des references a la litterature scientifique, des guidelines et des etudes recentes.",
  radiology: "Tu es un assistant specialise en imagerie medicale. Aide a interpreter les images, decrire les anomalies et suggerer des diagnostics radiologiques.",
  pharmacology: "Tu es un assistant specialise en pharmacologie. Aide a verifier les interactions medicamenteuses, les posologies et les contre-indications.",
};

function buildSystemPrompt(mode, patientContext, doctorName) {
  let prompt = `Tu es l'Assistant Medical IA de MediCare Pro, un outil d'aide a la decision clinique pour les professionnels de sante.\n\n`;
  prompt += `Medecin: ${doctorName || 'Medecin'}\n\n`;
  prompt += `${MODE_PROMPTS[mode] || MODE_PROMPTS.general}\n\n`;
  prompt += `REGLES IMPORTANTES:\n`;
  prompt += `- Reponds TOUJOURS en francais\n`;
  prompt += `- Tu assistes un medecin qualifie, pas un patient\n`;
  prompt += `- Fournis des informations detaillees et techniques appropriees pour un professionnel\n`;
  prompt += `- Mentionne toujours les red flags et signes d'alarme\n`;
  prompt += `- Suggere des examens complementaires quand c'est pertinent\n`;
  prompt += `- Precise quand un avis specialise est recommande\n`;
  prompt += `- N'hesite pas a utiliser la terminologie medicale\n`;
  prompt += `- Structure tes reponses avec des titres et listes pour la lisibilite\n`;

  if (patientContext) {
    prompt += `\n--- CONTEXTE PATIENT ---\n`;
    if (patientContext.patientName) prompt += `Nom: ${patientContext.patientName}\n`;
    if (patientContext.patientAge) prompt += `Age: ${patientContext.patientAge} ans\n`;
    if (patientContext.patientSex) prompt += `Sexe: ${patientContext.patientSex}\n`;
    if (patientContext.bloodType) prompt += `Groupe sanguin: ${patientContext.bloodType}\n`;
    if (patientContext.primaryPathology) prompt += `Pathologie principale: ${patientContext.primaryPathology}\n`;
    if (patientContext.antecedents?.length) prompt += `Antecedents: ${patientContext.antecedents.join(', ')}\n`;
    if (patientContext.currentMedications?.length) prompt += `Medicaments actuels: ${patientContext.currentMedications.join(', ')}\n`;
    if (patientContext.allergies) prompt += `Allergies: ${patientContext.allergies}\n`;
    if (patientContext.medicalHistory) prompt += `Historique medical: ${patientContext.medicalHistory}\n`;
    if (patientContext.riskScore !== undefined) prompt += `Score de risque: ${patientContext.riskScore}/100\n`;
    if (patientContext.appointments?.length) {
      prompt += `Derniers RDV:\n`;
      patientContext.appointments.slice(0, 5).forEach(a => {
        prompt += `  - ${a.date} ${a.time}: ${a.type} (${a.motif}) [${a.status}]\n`;
      });
    }
    prompt += `--- FIN CONTEXTE ---\n`;
  }

  return prompt;
}

app.post('/functions/v1/ai-doctor-assistant', async (req, res) => {
  const claims = verifyAuth(req);
  if (!claims) return res.status(401).json({ error: 'Non autorise' });

  if (!ANTHROPIC_API_KEY) {
    return res.json({
      success: true,
      response: "L'assistant IA n'est pas configure. La cle API Anthropic (ANTHROPIC_API_KEY) n'est pas definie.",
    });
  }

  try {
    const { message, history = [], context, mode = 'general', stream = false, doctorName, images } = req.body;

    if (!message && (!images || images.length === 0)) {
      return res.status(400).json({ error: 'Message requis' });
    }

    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
    const systemPrompt = buildSystemPrompt(mode, context, doctorName);

    // Build messages array from history
    const claudeMessages = [];
    for (const msg of history.slice(-20)) {
      claudeMessages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      });
    }

    // Build current message content (text + images)
    const currentContent = [];
    if (images && images.length > 0) {
      for (const img of images) {
        currentContent.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: img.mediaType || 'image/jpeg',
            data: img.base64,
          },
        });
      }
    }
    currentContent.push({ type: 'text', text: message || 'Analyse cette image.' });
    claudeMessages.push({ role: 'user', content: currentContent });

    if (stream) {
      // ===== SSE STREAMING =====
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });

      let fullResponse = '';

      const streamResponse = await anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: claudeMessages,
      });

      streamResponse.on('text', (text) => {
        fullResponse += text;
        res.write(`event: text\ndata: ${JSON.stringify({ text })}\n\n`);
      });

      streamResponse.on('end', () => {
        res.write(`event: done\ndata: ${JSON.stringify({ full_response: fullResponse })}\n\n`);
        res.end();
      });

      streamResponse.on('error', (err) => {
        console.error('Claude stream error:', err);
        res.write(`event: error\ndata: ${JSON.stringify({ error: err.message || 'Erreur de streaming' })}\n\n`);
        res.end();
      });

      // Handle client disconnect
      req.on('close', () => {
        streamResponse.abort();
      });

    } else {
      // ===== NON-STREAMING =====
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: claudeMessages,
      });

      const textContent = response.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('\n');

      res.json({ success: true, response: textContent, mode });
    }
  } catch (err) {
    console.error('ai-doctor-assistant error:', err);
    const errorMsg = err.status === 401
      ? 'Cle API Anthropic invalide'
      : err.status === 429
      ? 'Limite de requetes atteinte. Reessayez dans quelques instants.'
      : `Erreur: ${err.message || 'Erreur inconnue'}`;
    res.status(500).json({ error: errorMsg });
  }
});

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy' });
  } catch {
    res.status(500).json({ status: 'unhealthy' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Medicare Functions service running on port ${PORT}`);
});
