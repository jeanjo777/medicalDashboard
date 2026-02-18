import { createClient } from 'npm:@supabase/supabase-js@2.76.1';
import { create } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface LoginRequest {
  username: string;
  password: string;
}

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-secret-key-change-this';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;

async function generateJWT(userId: string, username: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const payload = {
    sub: userId,
    username,
    role: 'doctor',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
  };

  return await create({ alg: 'HS256', typ: 'JWT' }, payload, key);
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

    const { username, password }: LoginRequest = await req.json();
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Identifiant ou mot de passe incorrect' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const fifteenMinutesAgo = new Date(Date.now() - LOCKOUT_DURATION);
    const { data: recentAttempts } = await supabase
      .from('login_attempts')
      .select('*')
      .eq('email', username)
      .eq('success', false)
      .gte('created_at', fifteenMinutesAgo.toISOString());

    if (recentAttempts && recentAttempts.length >= MAX_ATTEMPTS) {
      await supabase.from('login_attempts').insert({
        email: username,
        ip_address: clientIp,
        success: false,
      });

      return new Response(
        JSON.stringify({ error: 'Trop de tentatives. Veuillez réessayer dans 15 minutes' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: user } = await supabase
      .from('medics')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (!user) {
      await supabase.from('login_attempts').insert({
        email: username,
        ip_address: clientIp,
        success: false,
      });

      return new Response(
        JSON.stringify({ error: 'Identifiant ou mot de passe incorrect' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const isValidPassword = hashedPassword === user.password;

    if (!isValidPassword) {
      await supabase.from('login_attempts').insert({
        email: username,
        ip_address: clientIp,
        success: false,
      });

      return new Response(
        JSON.stringify({ error: 'Identifiant ou mot de passe incorrect' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    await supabase.from('login_attempts').insert({
      email: username,
      ip_address: clientIp,
      success: true,
    });

    await supabase
      .from('medics')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    const token = await generateJWT(user.id, user.username);

    return new Response(
      JSON.stringify({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          role: 'doctor',
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Authentication error:', error);
    return new Response(
      JSON.stringify({ error: 'Identifiant ou mot de passe incorrect' }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});