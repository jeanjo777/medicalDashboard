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
// AI DOCTOR ASSISTANT (stub)
// ============================================================
app.post('/functions/v1/ai-doctor-assistant', async (req, res) => {
  const claims = verifyAuth(req);
  if (!claims) return res.status(401).json({ error: 'Non autorise' });
  res.json({
    response: 'L\'assistant IA n\'est pas configure en mode self-hosted. Configurez VITE_N8N_WEBHOOK_URL pour activer cette fonctionnalite.',
  });
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
