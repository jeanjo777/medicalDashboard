import { createClient } from 'npm:@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const payload = await req.json();

    // Extract sender info — Resend inbound sends `from` as a string or object
    const fromRaw = payload.from ?? '';
    const fromEmail = typeof fromRaw === 'object' ? (fromRaw.email ?? '') : fromRaw;
    const fromName = typeof fromRaw === 'object'
      ? (fromRaw.name ?? null)
      : (payload.sender_name ?? null);

    // `to` can be array or string
    const toRaw = payload.to;
    const toEmail = Array.isArray(toRaw)
      ? (typeof toRaw[0] === 'object' ? (toRaw[0].email ?? '') : toRaw[0])
      : (typeof toRaw === 'object' ? (toRaw.email ?? '') : (toRaw ?? ''));

    const { error: dbError } = await supabase
      .from('received_emails')
      .insert({
        from_email: fromEmail,
        from_name: fromName,
        to_email: toEmail,
        subject: payload.subject ?? '(sans objet)',
        text_body: payload.text ?? null,
        html_body: payload.html ?? null,
        reply_to: payload.reply_to ?? null,
        resend_id: payload.email_id ?? null,
        headers: payload.headers ?? null,
        attachments: payload.attachments ?? null,
      });

    if (dbError) {
      console.error('DB insert error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la sauvegarde' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
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
