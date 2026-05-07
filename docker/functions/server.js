const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// CORS: restrict to known origins
const ALLOWED_ORIGINS = [
  'https://medical.simpliceake.com',
  'http://localhost:5173',
  'http://localhost:4173',
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, mobile apps)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));

// ============================================================
// RATE LIMITING (in-memory, per IP)
// ============================================================
const loginAttempts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_LOGIN_ATTEMPTS = 5;

function checkRateLimit(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return true;
  if (now - record.firstAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.delete(ip);
    return true;
  }
  return record.count < MAX_LOGIN_ATTEMPTS;
}

function recordLoginAttempt(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now - record.firstAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
  } else {
    record.count++;
  }
}

// Fail fast if required secrets are missing
const { Resend } = require('resend');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required');
  process.exit(1);
}
const DB_PASSWORD = process.env.DB_PASSWORD;
if (!DB_PASSWORD) {
  console.error('FATAL: DB_PASSWORD environment variable is required');
  process.exit(1);
}
const REGISTRATION_SECRET = process.env.REGISTRATION_SECRET || 'MEDICARE2026';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'MediCare Pro <onboarding@resend.dev>';
const APP_URL = process.env.APP_URL || 'https://medical.simpliceake.com';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const pool = new Pool({
  host: 'db',
  port: 5432,
  database: 'medicare',
  user: 'medicare',
  password: DB_PASSWORD,
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

    // Rate limiting
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({ success: false, error: 'Trop de tentatives. Réessayez dans 15 minutes.' });
    }

    const result = await pool.query(
      'SELECT * FROM medics WHERE username = $1 AND is_active = true',
      [username]
    );

    if (result.rows.length === 0) {
      recordLoginAttempt(clientIp);
      return res.status(401).json({ success: false, error: 'Identifiant ou mot de passe incorrect' });
    }

    const user = result.rows[0];

    // Check password (bcrypt only - no plaintext fallback)
    let valid = false;
    if (user.password_hash) {
      valid = await bcrypt.compare(password, user.password_hash);
    }

    if (!valid) {
      recordLoginAttempt(clientIp);
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
      `INSERT INTO medics (username, password_hash, nom, prenom, specialite, is_active) VALUES ($1, $2, $1, '', 'Medecin', true)`,
      [username, hash]
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
// SEND EMAIL (via Resend)
// ============================================================
app.post('/functions/v1/send-email', async (req, res) => {
  const claims = verifyAuth(req);
  if (!claims) return res.status(401).json({ error: 'Non autorise' });

  if (!resend) {
    return res.status(503).json({ error: 'Service email non configure (RESEND_API_KEY manquant)' });
  }

  try {
    const { to, subject, html, text } = req.body;
    if (!to || !subject) {
      return res.status(400).json({ error: 'Destinataire (to) et sujet (subject) requis' });
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: html || `<p>${text || ''}</p>`,
    });

    if (error) {
      await pool.query(
        `INSERT INTO emails (to_email, subject, body, status, error_message) VALUES ($1, $2, $3, 'failed', $4)`,
        [Array.isArray(to) ? to[0] : to, subject, html || text || '', error.message]
      );
      return res.status(500).json({ error: 'Echec envoi email', details: error.message });
    }

    await pool.query(
      `INSERT INTO emails (to_email, subject, body, status, resend_id, sent_at) VALUES ($1, $2, $3, 'sent', $4, NOW())`,
      [Array.isArray(to) ? to[0] : to, subject, html || text || '', data.id]
    );

    res.json({ success: true, messageId: data.id });
  } catch (err) {
    console.error('send-email error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// PASSWORD RESET (real implementation with Resend)
// ============================================================
app.post('/functions/v1/send-reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    // Rate limit: max 3 reset attempts per email per hour
    const recentAttempts = await pool.query(
      `SELECT count(*)::int AS c FROM password_reset_attempts
       WHERE email = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
      [email]
    );
    if (recentAttempts.rows[0].c >= 3) {
      return res.status(429).json({ error: 'Trop de tentatives. Reessayez dans 1 heure.' });
    }

    // Log attempt
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    await pool.query(
      `INSERT INTO password_reset_attempts (email, ip_address, user_agent, success) VALUES ($1, $2, $3, false)`,
      [email, clientIp, req.headers['user-agent'] || '']
    );

    // Find user (check medics)
    const userResult = await pool.query(
      'SELECT id, username, email FROM medics WHERE email = $1 AND is_active = true',
      [email]
    );

    // Always return success to prevent email enumeration
    if (userResult.rows.length === 0) {
      return res.json({ success: true, message: 'Si cet email existe, un lien de reinitialisation a ete envoye.' });
    }

    const user = userResult.rows[0];

    // Generate secure token
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate previous tokens for this user
    await pool.query(
      'UPDATE password_reset_tokens SET used = true WHERE user_id = $1 AND used = false',
      [user.id]
    );

    // Store token
    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, user_type, token, email, expires_at)
       VALUES ($1, 'medic', $2, $3, $4)`,
      [user.id, token, email, expiresAt]
    );

    // Send email
    if (resend) {
      const resetLink = `${APP_URL}/reset-password?token=${token}`;
      await resend.emails.send({
        from: EMAIL_FROM,
        to: [email],
        subject: 'Reinitialisation de votre mot de passe - MediCare Pro',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1e293b;">Reinitialisation de mot de passe</h2>
            <p>Bonjour <strong>${user.username}</strong>,</p>
            <p>Vous avez demande la reinitialisation de votre mot de passe MediCare Pro.</p>
            <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
            <a href="${resetLink}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
              Reinitialiser mon mot de passe
            </a>
            <p style="color: #64748b; font-size: 14px;">Ce lien expire dans 1 heure.</p>
            <p style="color: #64748b; font-size: 14px;">Si vous n'avez pas demande cette reinitialisation, ignorez cet email.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px;">MediCare Pro - Centre Medical SIFCA</p>
          </div>
        `,
      });
    }

    // Mark attempt as successful
    await pool.query(
      `UPDATE password_reset_attempts SET success = true
       WHERE email = $1 ORDER BY created_at DESC LIMIT 1`,
      [email]
    );

    res.json({ success: true, message: 'Si cet email existe, un lien de reinitialisation a ete envoye.' });
  } catch (err) {
    console.error('send-reset-password error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/functions/v1/validate-reset-token', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token) {
      return res.status(400).json({ valid: false, error: 'Token requis' });
    }

    // Find valid token
    const tokenResult = await pool.query(
      `SELECT * FROM password_reset_tokens
       WHERE token = $1 AND used = false AND expires_at > NOW()`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ valid: false, error: 'Token invalide ou expire' });
    }

    const resetToken = tokenResult.rows[0];

    // If no newPassword provided, just validate the token
    if (!newPassword) {
      return res.json({ valid: true, email: resetToken.email });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({ valid: false, error: 'Le mot de passe doit contenir au moins 8 caracteres' });
    }

    // Hash and update password
    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      'UPDATE medics SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hash, resetToken.user_id]
    );

    // Mark token as used
    await pool.query(
      'UPDATE password_reset_tokens SET used = true, used_at = NOW() WHERE id = $1',
      [resetToken.id]
    );

    res.json({ valid: true, message: 'Mot de passe reinitialise avec succes' });
  } catch (err) {
    console.error('validate-reset-token error:', err);
    res.status(500).json({ valid: false, error: 'Erreur serveur' });
  }
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

// Fetch a global clinical summary from the database for the AI
async function fetchClinicSummary() {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [
      totalPatientsRes,
      highRiskRes,
      todayApptsRes,
      statsRes,
      alertsRes,
      recentConsRes,
      pathologiesRes,
      departmentsRes,
    ] = await Promise.all([
      pool.query('SELECT count(*)::int AS total FROM patients'),
      pool.query(
        `SELECT first_name, last_name, name, "riskScore", primary_pathology
         FROM patients WHERE "riskScore" >= 70
         ORDER BY "riskScore" DESC LIMIT 10`
      ),
      pool.query(
        `SELECT patient_name, appointment_time, type_consultation, motif, status
         FROM appointments WHERE appointment_date = $1
         ORDER BY appointment_time`,
        [today]
      ),
      pool.query(
        'SELECT * FROM analytics_stats ORDER BY date DESC LIMIT 1'
      ),
      pool.query(
        `SELECT title, description, severity FROM analytics_alerts
         WHERE is_acknowledged = false ORDER BY created_at DESC LIMIT 5`
      ),
      pool.query(
        `SELECT count(*)::int AS total FROM consultations
         WHERE created_at >= NOW() - INTERVAL '7 days'`
      ),
      pool.query(
        'SELECT pathologie, pourcentage FROM analytics_pathologies ORDER BY pourcentage DESC LIMIT 5'
      ),
      pool.query(
        'SELECT departement, patients_count, croissance FROM analytics_departement ORDER BY patients_count DESC LIMIT 5'
      ),
    ]);

    const totalPatients = totalPatientsRes.rows[0]?.total || 0;
    const highRisk = highRiskRes.rows;
    const todayAppts = todayApptsRes.rows;
    const stats = statsRes.rows[0];
    const alerts = alertsRes.rows;
    const recentCons = recentConsRes.rows[0]?.total || 0;
    const topPatho = pathologiesRes.rows;
    const topDepts = departmentsRes.rows;

    let summary = `\n--- CONTEXTE GLOBAL CLINIQUE (donnees en temps reel) ---\n`;
    summary += `Date du jour: ${today}\n`;
    summary += `Patients total: ${totalPatients}\n`;
    summary += `Consultations cette semaine: ${recentCons}\n`;

    if (stats) {
      summary += `\nStatistiques recentes:\n`;
      summary += `  - Patients consultes: ${stats.patients_consultes} (${stats.patients_consultes_evolution > 0 ? '+' : ''}${stats.patients_consultes_evolution}%)\n`;
      summary += `  - RDV honores: ${stats.rdv_honores} (${stats.rdv_honores_evolution > 0 ? '+' : ''}${stats.rdv_honores_evolution}%)\n`;
      summary += `  - Cas a risque: ${stats.cas_risque}\n`;
    }

    if (todayAppts.length > 0) {
      summary += `\nRDV aujourd'hui (${todayAppts.length}):\n`;
      todayAppts.forEach(a => {
        summary += `  - ${a.appointment_time} : ${a.patient_name} - ${a.type_consultation || ''} (${a.motif || ''}) [${a.status}]\n`;
      });
    } else {
      summary += `\nAucun RDV aujourd'hui.\n`;
    }

    if (highRisk.length > 0) {
      summary += `\nPatients a risque eleve (${highRisk.length}):\n`;
      highRisk.forEach(p => {
        const name = p.first_name && p.last_name ? `${p.first_name} ${p.last_name}` : p.name;
        const score = p.riskScore || p.risk_score;
        summary += `  - ${name}: score ${score}/100 - ${p.primary_pathology || 'non precise'}\n`;
      });
    }

    if (topPatho.length > 0) {
      summary += `\nPathologies les plus frequentes:\n`;
      topPatho.forEach(p => {
        summary += `  - ${p.pathologie}: ${p.pourcentage}%\n`;
      });
    }

    if (topDepts.length > 0) {
      summary += `\nDepartements (top 5):\n`;
      topDepts.forEach(d => {
        summary += `  - ${d.departement}: ${d.patients_count} patients (${d.croissance > 0 ? '+' : ''}${d.croissance}%)\n`;
      });
    }

    if (alerts.length > 0) {
      summary += `\nAlertes actives (${alerts.length}):\n`;
      alerts.forEach(a => {
        summary += `  - [${a.severity}] ${a.title}: ${a.description}\n`;
      });
    }

    summary += `--- FIN CONTEXTE GLOBAL ---\n`;
    return summary;
  } catch (err) {
    console.error('fetchClinicSummary error:', err.message);
    return '';
  }
}

function buildSystemPrompt(mode, patientContext, doctorName, clinicSummary) {
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
  prompt += `- Tu as acces aux donnees en temps reel de la clinique. Utilise-les pour repondre aux questions sur les patients, les rendez-vous, les statistiques et les alertes.\n`;

  // Global clinic context (auto-fetched from DB)
  if (clinicSummary) {
    prompt += clinicSummary;
  }

  // Individual patient context (from frontend selection)
  if (patientContext) {
    prompt += `\n--- CONTEXTE PATIENT SELECTIONNE ---\n`;
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
    prompt += `--- FIN CONTEXTE PATIENT ---\n`;
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
    const clinicSummary = await fetchClinicSummary();
    const systemPrompt = buildSystemPrompt(mode, context, doctorName, clinicSummary);

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
      const origin = req.headers.origin;
      const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': allowedOrigin,
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
// PDF REPORT GENERATION
// ============================================================
const PDFDocument = require('pdfkit');

const SIFCA = {
  capital: 'S.A au capital de 4 002 935 000',
  address: '01 BP 1289 ABIDJAN 01 - RC: ABIDJAN N\u00b04254',
  tel: 'Tel: (225) 27 21 75 75 75 - Fax: (225) 27 21 75 75 99',
};

function drawSifcaHeader(doc) {
  doc.fontSize(28).font('Helvetica-Bold').text('SIFCA', 50, 50);
  doc.moveTo(50, 82).lineTo(130, 82).lineWidth(2).stroke();
  doc.moveTo(50, 86).lineTo(130, 86).lineWidth(1).stroke();
  doc.fontSize(7).font('Helvetica')
    .text(SIFCA.capital, 50, 95)
    .text(SIFCA.address, 50, 105)
    .text(SIFCA.tel, 50, 115);
}

function drawPdfTitle(doc, title, y) {
  const w = doc.widthOfString(title) + 30;
  const x = (doc.page.width - w) / 2;
  doc.lineWidth(1.5).rect(x, y, w, 28).stroke();
  doc.fontSize(14).font('Helvetica-Bold').text(title, 0, y + 7, { align: 'center', width: doc.page.width });
  return y + 50;
}

function drawPdfDate(doc, date) {
  doc.fontSize(10).font('Helvetica').text('Date ' + (date || '.......... / .......... / ..........'), 350, 55, { width: 200, align: 'right' });
}

function drawPdfField(doc, label, value, x, y, lw) {
  lw = lw || 430;
  doc.fontSize(11).font('Helvetica-Bold').text(label, x, y);
  const lWidth = doc.widthOfString(label);
  const val = value || '';
  if (val) doc.font('Helvetica').text(val, x + lWidth + 5, y);
  const lineY = y + 14;
  const startX = x + lWidth + 5 + (val ? doc.widthOfString(val) + 5 : 0);
  const endX = x + lw;
  if (startX < endX) {
    for (let dx = startX; dx < endX; dx += 4) doc.circle(dx, lineY, 0.5).fill('#000');
  }
  return y + 30;
}

function drawDots(doc, x, y, width) {
  for (let dx = x; dx < x + width; dx += 4) doc.circle(dx, y, 0.5).fill('#000');
  return y + 25;
}

const PDF_GENERATORS = {
  'certificat-tension': (doc, d) => {
    drawSifcaHeader(doc);
    let y = drawPdfTitle(doc, 'CERTIFICAT DE PRISE DE TENSION', 145);
    y += 15;
    y = drawPdfField(doc, 'Je soussign\u00e9 (e), Docteur :', d.docteur, 50, y);
    y += 5;
    y = drawPdfField(doc, 'Certifie que l\u2019\u00e9tat de sant\u00e9 de M/ Mme/ Mlle ', d.patient, 50, y);
    y = drawDots(doc, 50, y, 430);
    y += 10;
    doc.fontSize(11).font('Helvetica-Bold').text('Est satisfaisant.', 50, y); y += 35;
    doc.fontSize(11).font('Helvetica-Bold').text('Sa tension art\u00e9rielle de ce jour est :', 50, y); y += 35;
    y = drawPdfField(doc, 'Tension art\u00e9rielle bras droit :', d.tensionDroit || '', 50, y);
    y += 10;
    y = drawPdfField(doc, 'Tension art\u00e9rielle bras gauche :', d.tensionGauche || '', 50, y);
    y += 40;
    doc.fontSize(11).font('Helvetica-Bold').text('Fait \u00e0 Abidjan, le ', 250, y);
    drawDots(doc, 370, y + 14, 150); y += 45;
    doc.fontSize(12).font('Helvetica-Bold').text('M\u00e9decin :', 250, y);
  },
  'certificat-medical': (doc, d) => {
    drawSifcaHeader(doc);
    drawPdfDate(doc, d.date);
    let y = drawPdfTitle(doc, 'CERTIFICAT MEDICAL', 145);
    y += 15;
    y = drawPdfField(doc, 'Je soussign\u00e9 Dr ', d.docteur, 50, y);
    y += 5;
    doc.fontSize(11).font('Helvetica-Bold').text('Certifie avoir examin\u00e9', 50, y); y += 25;
    y = drawPdfField(doc, 'l\u2019enfant ', d.patient, 50, y);
    y = drawDots(doc, 50, y, 430);
    y += 30;
    doc.fontSize(11).font('Helvetica-Bold').text('Atteste qu\u2019il ou elle est en bonne sant\u00e9.', 50, y); y += 40;
    doc.fontSize(11).font('Helvetica').text('En foi de quoi je d\u00e9livre ce certificat pour servir et valoir ce que de droit.', 100, y); y += 50;
    doc.fontSize(13).font('Helvetica-Bold').text('LE MEDECIN', 350, y);
  },
  'arret-travail': (doc, d) => {
    drawSifcaHeader(doc);
    let y = drawPdfTitle(doc, 'ARRET DE TRAVAIL', 145);
    y += 15;
    y = drawPdfField(doc, 'Je soussign\u00e9 (e), Docteur :', d.docteur, 50, y);
    y += 5;
    y = drawPdfField(doc, 'Certifie que l\u2019\u00e9tat de sant\u00e9 de :', d.patient, 50, y);
    y = drawDots(doc, 50, y, 430);
    y += 10;
    y = drawPdfField(doc, 'Matricule :', d.matricule || '', 50, y, 180);
    doc.fontSize(11).font('Helvetica-Bold').text('Direction :', 280, y - 30);
    drawDots(doc, 340, y - 30 + 14, 140);
    y += 10;
    y = drawPdfField(doc, '1) n\u00e9cessite un arr\u00eat de travail de :', d.arret || '', 50, y);
    y += 10;
    y = drawPdfField(doc, '2) n\u00e9cessite une prolongation de travail de :', d.prolongation || '', 50, y);
    y += 10;
    y = drawPdfField(doc, 'Sauf complication \u00e0 dater du :', d.dateComplication || '', 50, y);
    y += 40;
    doc.fontSize(11).font('Helvetica-Bold').text('Fait \u00e0 Abidjan, le ', 250, y);
    drawDots(doc, 370, y + 14, 150); y += 45;
    doc.fontSize(12).font('Helvetica-Bold').text('M\u00e9decin :', 250, y);
  },
  'certificat-grossesse': (doc, d) => {
    drawSifcaHeader(doc);
    let y = drawPdfTitle(doc, 'CERTIFICAT DE GROSSESSE', 145);
    y += 15;
    y = drawPdfField(doc, 'Je soussign\u00e9, Docteur :', d.docteur, 50, y);
    y += 5;
    y = drawPdfField(doc, 'Certifie que Madame :', d.patient, 50, y);
    y += 5;
    y = drawPdfField(doc, 'Est actuellement en cours d\u2019une grossesse de :', d.dureeGrossesse || '', 50, y);
    y += 5;
    y = drawPdfField(doc, 'Dont le terme est fix\u00e9 le :', d.terme || '', 50, y);
    y += 30;
    doc.fontSize(11).font('Helvetica-Bold').text('Fait \u00e0 Abidjan, le ', 280, y);
    drawDots(doc, 390, y + 14, 130); y += 40;
    doc.fontSize(11).font('Helvetica-Bold').text('Le M\u00e9decin :', 50, y);
    drawDots(doc, 140, y + 14, 380);
  },
  'ordonnance-medicale': (doc, d) => {
    drawSifcaHeader(doc);
    drawPdfDate(doc, d.date);
    let y = drawPdfTitle(doc, 'ORDONNANCE MEDICALE', 145);
    y += 10;
    doc.fontSize(11).font('Helvetica-Bold').text('Docteur', 50, y);
    if (d.docteur) doc.font('Helvetica').text(d.docteur, 100, y);
    y += 25;
    if (d.patient) { doc.fontSize(10).font('Helvetica').text('Patient: ' + d.patient, 50, y); y += 20; }
    if (d.prescriptions && d.prescriptions.length > 0) {
      y += 10;
      d.prescriptions.forEach((rx, i) => { doc.fontSize(11).font('Helvetica').text((i+1) + '. ' + rx, 70, y); y += 22; });
    } else {
      for (let i = 0; i < 15; i++) { y += 25; drawDots(doc, 50, y, 480); }
    }
  },
  'bulletin-consultation': (doc, d) => {
    drawSifcaHeader(doc);
    drawPdfDate(doc, d.date);
    let y = drawPdfTitle(doc, 'BULLETIN DE CONSULTATION', 145);
    y += 10;
    y = drawPdfField(doc, 'SERVICE :', d.service || '', 50, y);
    y = drawPdfField(doc, 'NOM :', d.nom || '', 50, y);
    y = drawPdfField(doc, 'PRENOM :', d.prenom || '', 50, y);
    doc.fontSize(11).font('Helvetica-Bold').text('AGE :', 50, y);
    if (d.age) doc.font('Helvetica').text(d.age, 85, y);
    drawDots(doc, 85 + (d.age ? doc.widthOfString(d.age) + 5 : 0), y + 14, 200);
    doc.fontSize(11).font('Helvetica-Bold').text('SEXE :', 310, y);
    if (d.sexe) doc.font('Helvetica').text(d.sexe, 350, y);
    drawDots(doc, 350 + (d.sexe ? doc.widthOfString(d.sexe) + 5 : 0), y + 14, 130);
    y += 30;
    y = drawPdfField(doc, 'CONSULTATION EN :', d.consultationEn || '', 50, y);
    for (let i = 0; i < 8; i++) { y = drawDots(doc, 50, y + 5, 480); }
    y += 10;
    doc.fontSize(11).font('Helvetica-Bold').text('RENSEIGNEMENTS CLINIQUES', 50, y); y += 20;
    for (let i = 0; i < 5; i++) { y = drawDots(doc, 50, y + 5, 480); }
    y += 20;
    doc.fontSize(11).font('Helvetica-Bold').text('Signature et cachet M\u00e9decin', 300, y);
  },
};

// GET /functions/v1/rapport/types - List available report types
app.get('/functions/v1/rapport/types', (req, res) => {
  res.json({
    types: Object.keys(PDF_GENERATORS).map(key => ({
      id: key,
      label: key.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
    })),
  });
});

// POST /functions/v1/rapport/generate - Generate a PDF report
app.post('/functions/v1/rapport/generate', async (req, res) => {
  const claims = verifyAuth(req);
  if (!claims) {
    return res.status(401).json({ error: 'Authentification requise' });
  }
  try {
    const { type, patientId, data } = req.body;

    if (!type || !PDF_GENERATORS[type]) {
      return res.status(400).json({ error: 'Type de rapport invalide. Types: ' + Object.keys(PDF_GENERATORS).join(', ') });
    }

    let pdfData = data || {};

    // If patientId provided, fetch patient + consultation data
    if (patientId) {
      const [patientRes, medicRes, consRes, apptRes] = await Promise.all([
        pool.query('SELECT * FROM patients WHERE id = $1', [patientId]),
        pool.query('SELECT * FROM medics LIMIT 1'),
        pool.query('SELECT * FROM consultations WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 1', [patientId]),
        pool.query('SELECT * FROM appointments WHERE patient_id = $1 ORDER BY appointment_date DESC LIMIT 1', [patientId]),
      ]);

      const patient = patientRes.rows[0];
      const medic = medicRes.rows[0];
      const consultation = consRes.rows[0];
      const appointment = apptRes.rows[0];

      if (!patient) return res.status(404).json({ error: 'Patient non trouve' });

      const docteur = medic ? `Dr. ${medic.prenom || ''} ${medic.nom || ''}`.trim() : '';
      const today = new Date().toISOString().slice(0, 10);

      pdfData = {
        docteur,
        patient: patient.name,
        date: today,
        nom: patient.name ? patient.name.split(' ').slice(-1)[0] : '',
        prenom: patient.name ? patient.name.split(' ').slice(0, -1).join(' ') : '',
        age: patient.age ? String(patient.age) : '',
        sexe: patient.gender || '',
        service: appointment ? appointment.type_consultation : '',
        consultationEn: consultation ? consultation.diagnosis_summary : '',
        prescriptions: consultation && consultation.recommendations
          ? consultation.recommendations.split(',').map(s => s.trim())
          : [],
        tensionDroit: patient.blood_pressure || '',
        tensionGauche: '',
        ...pdfData, // Allow override from request body
      };
    }

    // Generate PDF in memory
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));

    await new Promise((resolve, reject) => {
      doc.on('end', resolve);
      doc.on('error', reject);
      PDF_GENERATORS[type](doc, pdfData);
      doc.end();
    });

    const pdfBuffer = Buffer.concat(chunks);
    const filename = patientId
      ? `${type}_${(pdfData.patient || 'patient').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
      : `${type}_template.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'Erreur generation PDF: ' + err.message });
  }
});

// ============================================================
// INBOUND EMAIL WEBHOOK (Resend sends emails here)
// ============================================================
app.post('/functions/v1/webhook/inbound-email', async (req, res) => {
  try {
    const payload = req.body;

    // Resend inbound webhook payload format
    const { from, to, subject, text, html, reply_to, headers, attachments } = payload;

    if (!from || !to) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Extract sender info
    const fromEmail = typeof from === 'string' ? from : (from.email || from);
    const fromName = typeof from === 'object' ? from.name || '' : '';
    const toEmail = Array.isArray(to) ? to[0] : to;

    await pool.query(
      `INSERT INTO received_emails (from_email, from_name, to_email, subject, text_body, html_body, reply_to, headers, attachments, received_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [
        fromEmail,
        fromName || null,
        typeof toEmail === 'string' ? toEmail : toEmail.email || '',
        subject || '(Sans objet)',
        text || null,
        html || null,
        reply_to || null,
        headers ? JSON.stringify(headers) : null,
        attachments ? JSON.stringify(attachments) : null,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('inbound-email webhook error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
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

// ============================================================
// APPOINTMENT REMINDERS CRON (runs every 30 min)
// ============================================================
async function sendAppointmentReminders() {
  if (!resend) return;

  try {
    // Find appointments in the next 24h that haven't been reminded
    const upcoming = await pool.query(`
      SELECT a.id, a.patient_name, a.patient_email, a.appointment_date, a.appointment_time,
             a.type_consultation, a.motif
      FROM appointments a
      WHERE a.appointment_date = CURRENT_DATE + INTERVAL '1 day'
        AND a.status NOT IN ('cancelled', 'annule', 'no_show')
        AND a.patient_email IS NOT NULL
        AND a.patient_email != ''
        AND NOT EXISTS (
          SELECT 1 FROM appointment_reminders ar
          WHERE ar.appointment_id = a.id AND ar.status = 'sent'
        )
    `);

    for (const appt of upcoming.rows) {
      try {
        const timeStr = appt.appointment_time
          ? new Date(`2000-01-01T${appt.appointment_time}`).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          : '';
        const dateStr = new Date(appt.appointment_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

        await resend.emails.send({
          from: EMAIL_FROM,
          to: [appt.patient_email],
          subject: `Rappel: Votre rendez-vous du ${dateStr} - MediCare Pro`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1e293b;">Rappel de rendez-vous</h2>
              <p>Bonjour <strong>${appt.patient_name}</strong>,</p>
              <p>Nous vous rappelons votre rendez-vous :</p>
              <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>Date :</strong> ${dateStr}</p>
                ${timeStr ? `<p style="margin: 4px 0;"><strong>Heure :</strong> ${timeStr}</p>` : ''}
                ${appt.type_consultation ? `<p style="margin: 4px 0;"><strong>Type :</strong> ${appt.type_consultation}</p>` : ''}
                ${appt.motif ? `<p style="margin: 4px 0;"><strong>Motif :</strong> ${appt.motif}</p>` : ''}
              </div>
              <p style="color: #64748b; font-size: 14px;">En cas d'empechement, merci de nous prevenir a l'avance.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="color: #94a3b8; font-size: 12px;">MediCare Pro - Centre Medical SIFCA</p>
            </div>
          `,
        });

        // Record successful reminder
        await pool.query(
          `INSERT INTO appointment_reminders (appointment_id, reminder_type, scheduled_for, status, sent_at)
           VALUES ($1, 'email', NOW(), 'sent', NOW())`,
          [appt.id]
        );
      } catch (emailErr) {
        console.error(`Reminder failed for appointment ${appt.id}:`, emailErr.message);
        await pool.query(
          `INSERT INTO appointment_reminders (appointment_id, reminder_type, scheduled_for, status, error_message)
           VALUES ($1, 'email', NOW(), 'failed', $2)`,
          [appt.id, emailErr.message]
        );
      }
    }

    if (upcoming.rows.length > 0) {
      console.log(`[Reminders] Sent ${upcoming.rows.length} appointment reminders`);
    }
  } catch (err) {
    console.error('[Reminders] Cron error:', err.message);
  }
}

// Run reminders every 30 minutes
setInterval(sendAppointmentReminders, 30 * 60 * 1000);
// Run once on startup after 10 seconds (let DB connect first)
setTimeout(sendAppointmentReminders, 10 * 1000);

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Medicare Functions service running on port ${PORT}`);
  console.log(`Email service: ${resend ? 'ACTIVE (Resend)' : 'DISABLED (no RESEND_API_KEY)'}`);
});
