/**
 * Development Mock Server
 *
 * Simulates Supabase Edge Functions for local development
 * Run with: node dev-server.js
 */

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
const PORT = 54321;

// Middleware
app.use(cors());
app.use(express.json());

// Mock users database
const mockUsers = [
  {
    id: '1',
    username: 'medecin',
    password: 'password123', // En production, utilisez bcrypt
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'medecin@example.com',
    role: 'doctor',
  },
  {
    id: '2',
    username: 'admin',
    password: 'admin123',
    nom: 'Admin',
    prenom: 'System',
    email: 'admin@example.com',
    role: 'admin',
  }
];

// Simple JWT generation (for development only)
function generateJWT(userId, username) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: userId,
    username,
    role: 'doctor',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
  })).toString('base64url');

  const secret = 'dev-secret-key';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

// Mock login endpoint
app.post('/functions/v1/auth-login', (req, res) => {
  const { username, password } = req.body;

  console.log('[DEV-SERVER] Login attempt:', { username });

  if (!username || !password) {
    return res.status(401).json({
      error: 'Identifiant ou mot de passe incorrect',
      success: false,
    });
  }

  // Find user
  const user = mockUsers.find(u => u.username === username && u.password === password);

  if (!user) {
    console.log('[DEV-SERVER] Invalid credentials');
    return res.status(401).json({
      error: 'Identifiant ou mot de passe incorrect',
      success: false,
    });
  }

  // Generate token
  const token = generateJWT(user.id, user.username);

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  console.log('[DEV-SERVER] Login successful:', user.username);

  res.json({
    success: true,
    token,
    user: userWithoutPassword,
  });
});

// Mock verify-token endpoint
app.post('/functions/v1/verify-token', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false });
  }

  // In development, accept any token
  res.json({ valid: true });
});

// Mock manage-patients endpoint
app.get('/functions/v1/manage-patients', (req, res) => {
  // Return mock patients data
  res.json({
    success: true,
    data: [
      {
        id: '1',
        nom: 'Martin',
        prenom: 'Sophie',
        date_naissance: '1985-03-15',
        email: 'sophie.martin@example.com',
        telephone: '0612345678',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        nom: 'Durand',
        prenom: 'Pierre',
        date_naissance: '1990-07-22',
        email: 'pierre.durand@example.com',
        telephone: '0687654321',
        created_at: new Date().toISOString(),
      }
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dev server running' });
});

app.listen(PORT, () => {
  console.log('\n🚀 Development Mock Server running!');
  console.log(`   http://localhost:${PORT}`);
  console.log('\n📝 Mock Users:');
  mockUsers.forEach(u => {
    console.log(`   - Username: ${u.username} | Password: ${u.password}`);
  });
  console.log('\n💡 Update VITE_SUPABASE_URL in .env to: http://localhost:${PORT}\n');
});
