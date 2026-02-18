import { createClient } from 'npm:@supabase/supabase-js@2.76.1';

const REGISTRATION_SECRET_CODE = 'MED2025SECRET';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RegisterRequest {
  username: string;
  password: string;
  secretCode: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { username, password, secretCode }: RegisterRequest = await req.json();

    if (!username || !password || !secretCode) {
      return new Response(
        JSON.stringify({ error: 'Tous les champs sont requis' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Le mot de passe doit contenir au moins 8 caractères' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (secretCode !== REGISTRATION_SECRET_CODE) {
      return new Response(
        JSON.stringify({ error: 'Code d\'accès invalide' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: existingMedics, error: checkError } = await supabase
      .from('medics')
      .select('id')
      .limit(1);

    if (checkError) {
      throw checkError;
    }

    if (existingMedics && existingMedics.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Un compte médecin existe déjà. Veuillez vous connecter.' }),
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: existingUsername, error: usernameCheckError } = await supabase
      .from('medics')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (usernameCheckError) {
      throw usernameCheckError;
    }

    if (existingUsername) {
      return new Response(
        JSON.stringify({ error: 'Ce nom d\'utilisateur est déjà utilisé' }),
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const { data: newMedic, error: insertError } = await supabase
      .from('medics')
      .insert({
        username: username,
        password: hashedPassword,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Enregistrement réussi ! Vous pouvez maintenant vous connecter.',
        medic: {
          id: newMedic.id,
          username: newMedic.username,
        },
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in register-medic:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur lors de l\'enregistrement' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});