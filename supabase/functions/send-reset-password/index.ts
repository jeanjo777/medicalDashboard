import { createClient } from 'npm:@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestBody {
  email: string;
}

const RATE_LIMIT_WINDOW = 60 * 1000;
const TOKEN_EXPIRY_MINUTES = 30;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email }: RequestBody = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Adresse email requise' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify the user exists in the medics table
    const { data: existingUser } = await supabase
      .from('medics')
      .select('id')
      .eq('username', email)
      .maybeSingle();

    if (!existingUser) {
      await supabase.from('password_reset_attempts').insert({
        email,
        ip_address: clientIp,
        user_agent: userAgent,
        success: false,
        reason: 'user_not_found',
      });

      // Return success even if user not found (security: don't reveal user existence)
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Si cette adresse est associée à un compte, un email de réinitialisation a été envoyé'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const oneMinuteAgo = new Date(Date.now() - RATE_LIMIT_WINDOW);
    const { data: recentAttempts } = await supabase
      .from('password_reset_attempts')
      .select('*')
      .eq('email', email)
      .gte('created_at', oneMinuteAgo.toISOString());

    if (recentAttempts && recentAttempts.length >= 1) {
      await supabase.from('password_reset_attempts').insert({
        email,
        ip_address: clientIp,
        user_agent: userAgent,
        success: false,
        reason: 'rate_limit_exceeded',
      });

      return new Response(
        JSON.stringify({ 
          error: 'Veuillez patienter 60 secondes avant de faire une nouvelle demande',
          retryAfter: 60 
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + TOKEN_EXPIRY_MINUTES);

    const { error: dbError } = await supabase
      .from('password_reset_tokens')
      .insert({
        email,
        token,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (dbError) {
      console.error('Database error:', dbError);
      
      await supabase.from('password_reset_attempts').insert({
        email,
        ip_address: clientIp,
        user_agent: userAgent,
        success: false,
        reason: 'database_error',
      });

      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création du token' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    await supabase.from('password_reset_attempts').insert({
      email,
      ip_address: clientIp,
      user_agent: userAgent,
      success: true,
      reason: 'token_generated',
    });

    const baseUrl = new URL(req.url).origin;
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    console.log('=== Password Reset Request ===');
    console.log('Email:', email);
    console.log('IP Address:', clientIp);
    console.log('User Agent:', userAgent);
    console.log('Token:', token);
    console.log('Reset Link:', resetLink);
    console.log('Expires At:', expiresAt.toISOString());
    console.log('==============================');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Un email de réinitialisation a été envoyé',
        expiresIn: TOKEN_EXPIRY_MINUTES,
        resetLink: resetLink,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase.from('password_reset_attempts').insert({
      email: 'unknown',
      ip_address: clientIp,
      user_agent: userAgent,
      success: false,
      reason: 'unexpected_error',
    });

    return new Response(
      JSON.stringify({ error: 'Une erreur est survenue' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});