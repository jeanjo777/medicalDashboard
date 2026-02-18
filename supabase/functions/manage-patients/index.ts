import { createClient } from 'npm:@supabase/supabase-js@2.76.1';
import { verify } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-secret-key-change-this';

async function verifyJWT(token: string): Promise<any> {
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const payload = await verify(token, key);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = await verifyJWT(token);

    if (!payload) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return new Response(
        JSON.stringify({ error: 'Token expired' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'GET') {
      const { data: patients, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching patients:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch patients' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const patientsWithStats = await Promise.all(
        (patients || []).map(async (patient) => {
          const { data: consultations } = await supabase
            .from('consultations')
            .select('id, status')
            .eq('patient_id', patient.id);

          return {
            ...patient,
            totalConsultations: consultations?.length || 0,
            pendingConsultations: consultations?.filter(c => c.status === 'pending').length || 0,
          };
        })
      );

      return new Response(
        JSON.stringify({ patients: patientsWithStats }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'POST') {
      const { email, name, age, gender, profilePic } = await req.json();

      if (!email || !name) {
        return new Response(
          JSON.stringify({ error: 'Email and name are required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data: existing } = await supabase
        .from('patients')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        return new Response(
          JSON.stringify({ error: 'Patient with this email already exists' }),
          {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const patientId = crypto.randomUUID();

      const { data: patient, error } = await supabase
        .from('patients')
        .insert({
          id: patientId,
          email,
          name,
          age: age || null,
          gender: gender || null,
          profile_pic: profilePic || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating patient:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create patient' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, patient }),
        {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'PUT') {
      const { patientId, email, name, age, gender, profilePic } = await req.json();

      if (!patientId) {
        return new Response(
          JSON.stringify({ error: 'Patient ID is required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const updateData: any = {};
      if (email) updateData.email = email;
      if (name) updateData.name = name;
      if (age !== undefined) updateData.age = age;
      if (gender) updateData.gender = gender;
      if (profilePic !== undefined) updateData.profile_pic = profilePic;

      const { data: patient, error } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', patientId)
        .select()
        .single();

      if (error) {
        console.error('Error updating patient:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update patient' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, patient }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const patientId = url.searchParams.get('patientId');

      if (!patientId) {
        return new Response(
          JSON.stringify({ error: 'Patient ID is required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (error) {
        console.error('Error deleting patient:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to delete patient' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});