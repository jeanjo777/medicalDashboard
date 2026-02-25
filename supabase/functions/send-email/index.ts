import { createClient } from 'npm:@supabase/supabase-js@2.76.1';
import { verify } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Attachment {
  filename: string;
  content: string; // base64
  type?: string;
}

interface SendEmailRequest {
  to: string;
  toName?: string;
  subject: string;
  body: string;
  templateUsed?: string;
  attachments?: Attachment[];
}

async function verifyAuthToken(req: Request): Promise<boolean> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const token = authHeader.replace('Bearer ', '');
  const jwtSecret = Deno.env.get('JWT_SECRET');

  if (!jwtSecret) {
    console.error('JWT_SECRET not configured');
    return false;
  }

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(jwtSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const payload = await verify(token, key);
    return !!payload?.sub;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Verify custom auth token
  const isAuthenticated = await verifyAuthToken(req);
  if (!isAuthenticated) {
    return new Response(
      JSON.stringify({ error: 'Non autorisé - token invalide ou expiré' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const resendApiKey = Deno.env.get('RESEND_API_KEY');

  if (!resendApiKey) {
    return new Response(
      JSON.stringify({ error: 'RESEND_API_KEY non configuré dans les secrets Supabase' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { to, toName, subject, body, templateUsed, attachments }: SendEmailRequest = await req.json();

    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ error: 'Les champs to, subject et body sont requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return new Response(
        JSON.stringify({ error: 'Adresse email destinataire invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Resend API
    const resendPayload = {
      from: 'Cabinet Médical <no-reply@simpliceake.com>',
      reply_to: 'Cabinet Médical <contact@simpliceake.com>',
      to: toName ? [{ email: to, name: toName }] : [to],
      subject,
      html: body,
      ...(attachments && attachments.length > 0 ? { attachments } : {}),
    };

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendPayload),
    });

    const resendData = await resendResponse.json();

    const status = resendResponse.ok ? 'sent' : 'failed';
    const resendId = resendData?.id ?? null;
    const errorMessage = !resendResponse.ok
      ? (resendData?.message ?? resendData?.name ?? 'Erreur Resend inconnue')
      : null;

    const { data: insertedEmail, error: dbError } = await supabase
      .from('emails')
      .insert({
        to_email: to,
        to_name: toName ?? null,
        subject,
        body,
        status,
        resend_id: resendId,
        template_used: templateUsed ?? null,
        error_message: errorMessage,
        sent_at: resendResponse.ok ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('DB insert error:', dbError);
    }

    if (!resendResponse.ok) {
      return new Response(
        JSON.stringify({ error: `Erreur lors de l'envoi: ${errorMessage}`, details: resendData }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email envoyé avec succès', emailId: insertedEmail?.id, resendId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Une erreur inattendue est survenue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
