import { createClient } from 'npm:@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Appointment {
  id?: string;
  patient_id?: string;
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
  medic_id?: string;
  appointment_date: string;
  appointment_time: string;
  motif?: string;
  type_consultation?: string;
  duration?: number;
  notes?: string;
  status?: string;
}

interface ConflictResult {
  hasConflict: boolean;
  conflictingAppointment?: Appointment;
  message?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);

    // GET: List appointments with filters
    if (req.method === 'GET') {
      return handleGetAppointments(supabase, url);
    }

    // POST: Create appointment
    if (req.method === 'POST') {
      const body = await req.json();
      return handleCreateAppointment(supabase, body);
    }

    // PUT: Update appointment
    if (req.method === 'PUT') {
      const body = await req.json();
      return handleUpdateAppointment(supabase, body);
    }

    // DELETE: Cancel appointment
    if (req.method === 'DELETE') {
      return handleDeleteAppointment(supabase, url);
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleGetAppointments(supabase: any, url: URL): Promise<Response> {
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');
  const medicId = url.searchParams.get('medicId');
  const status = url.searchParams.get('status');
  const patientId = url.searchParams.get('patientId');

  let query = supabase
    .from('appointments')
    .select('*')
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  if (startDate) {
    query = query.gte('appointment_date', startDate);
  }
  if (endDate) {
    query = query.lte('appointment_date', endDate);
  }
  if (medicId) {
    query = query.eq('medic_id', medicId);
  }
  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  if (patientId) {
    query = query.eq('patient_id', patientId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching appointments:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch appointments' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ appointments: data }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleCreateAppointment(supabase: any, body: any): Promise<Response> {
  const {
    patient_id,
    patient_name,
    patient_email,
    patient_phone,
    medic_id,
    appointment_date,
    appointment_time,
    motif,
    type_consultation,
    duration = 30,
    notes,
  } = body;

  // Validate required fields
  if (!appointment_date || !appointment_time) {
    return new Response(
      JSON.stringify({ error: 'appointment_date and appointment_time are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!patient_name && !patient_id) {
    return new Response(
      JSON.stringify({ error: 'patient_name or patient_id is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Check for conflicts
  const conflict = await checkConflict(supabase, medic_id, appointment_date, appointment_time, duration);

  if (conflict.hasConflict) {
    return new Response(
      JSON.stringify({
        error: 'Conflict detected',
        conflict: conflict.conflictingAppointment,
        message: conflict.message
      }),
      { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Create appointment
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: patient_id || null,
      patient_name,
      patient_email,
      patient_phone,
      medic_id: medic_id || null,
      appointment_date,
      appointment_time,
      motif,
      type_consultation,
      duration,
      notes,
      status: 'a_venir',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating appointment:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create appointment' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Create reminder notification for patient (if patient_id exists)
  if (patient_id) {
    await createAppointmentNotification(supabase, patient_id, data, 'created');
  }

  return new Response(
    JSON.stringify({ success: true, appointment: data }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleUpdateAppointment(supabase: any, body: any): Promise<Response> {
  const { id, ...updateData } = body;

  if (!id) {
    return new Response(
      JSON.stringify({ error: 'Appointment id is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get existing appointment
  const { data: existing, error: fetchError } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return new Response(
      JSON.stringify({ error: 'Appointment not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Check for conflicts if date/time changed
  const dateChanged = updateData.appointment_date && updateData.appointment_date !== existing.appointment_date;
  const timeChanged = updateData.appointment_time && updateData.appointment_time !== existing.appointment_time;

  if (dateChanged || timeChanged) {
    const conflict = await checkConflict(
      supabase,
      updateData.medic_id || existing.medic_id,
      updateData.appointment_date || existing.appointment_date,
      updateData.appointment_time || existing.appointment_time,
      updateData.duration || existing.duration || 30,
      id // Exclude current appointment from conflict check
    );

    if (conflict.hasConflict) {
      return new Response(
        JSON.stringify({
          error: 'Conflict detected',
          conflict: conflict.conflictingAppointment,
          message: conflict.message
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Update appointment
  const { data, error } = await supabase
    .from('appointments')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating appointment:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update appointment' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Notify patient if date/time changed
  if ((dateChanged || timeChanged) && existing.patient_id) {
    await createAppointmentNotification(supabase, existing.patient_id, data, 'rescheduled');
  }

  return new Response(
    JSON.stringify({ success: true, appointment: data }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleDeleteAppointment(supabase: any, url: URL): Promise<Response> {
  const appointmentId = url.searchParams.get('id');
  const reason = url.searchParams.get('reason') || 'Annule par le medecin';

  if (!appointmentId) {
    return new Response(
      JSON.stringify({ error: 'Appointment id is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get appointment for notification
  const { data: existing } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .single();

  // Soft delete: update status to 'annule'
  const { data, error } = await supabase
    .from('appointments')
    .update({
      status: 'annule',
      cancelled_at: new Date().toISOString(),
      cancelled_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', appointmentId)
    .select()
    .single();

  if (error) {
    console.error('Error cancelling appointment:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to cancel appointment' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Notify patient
  if (existing?.patient_id) {
    await createAppointmentNotification(supabase, existing.patient_id, data, 'cancelled');
  }

  return new Response(
    JSON.stringify({ success: true, appointment: data }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function checkConflict(
  supabase: any,
  medicId: string | null,
  date: string,
  time: string,
  duration: number,
  excludeAppointmentId?: string
): Promise<ConflictResult> {
  // If no medic specified, no conflict check needed
  if (!medicId) {
    return { hasConflict: false };
  }

  // Parse time
  const [hours, minutes] = time.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + duration;

  // Query appointments for the same medic on the same day
  let query = supabase
    .from('appointments')
    .select('*')
    .eq('medic_id', medicId)
    .eq('appointment_date', date)
    .neq('status', 'annule');

  if (excludeAppointmentId) {
    query = query.neq('id', excludeAppointmentId);
  }

  const { data: appointments, error } = await query;

  if (error) {
    console.error('Error checking conflicts:', error);
    return { hasConflict: false }; // Fail open
  }

  // Check for time overlap
  for (const apt of appointments || []) {
    const [aptHours, aptMinutes] = apt.appointment_time.split(':').map(Number);
    const aptStart = aptHours * 60 + aptMinutes;
    const aptEnd = aptStart + (apt.duration || 30);

    // Overlap condition: NOT (end1 <= start2 OR start1 >= end2)
    const hasOverlap = !(endMinutes <= aptStart || startMinutes >= aptEnd);

    if (hasOverlap) {
      return {
        hasConflict: true,
        conflictingAppointment: apt,
        message: `Conflit avec un rendez-vous existant a ${apt.appointment_time} (${apt.patient_name || 'Patient'})`,
      };
    }
  }

  return { hasConflict: false };
}

async function createAppointmentNotification(
  supabase: any,
  patientId: string,
  appointment: any,
  type: 'created' | 'rescheduled' | 'cancelled'
): Promise<void> {
  const titles = {
    created: 'Nouveau rendez-vous confirme',
    rescheduled: 'Rendez-vous modifie',
    cancelled: 'Rendez-vous annule',
  };

  const messages = {
    created: `Votre rendez-vous du ${appointment.appointment_date} a ${appointment.appointment_time} a ete confirme.`,
    rescheduled: `Votre rendez-vous a ete deplace au ${appointment.appointment_date} a ${appointment.appointment_time}.`,
    cancelled: `Votre rendez-vous du ${appointment.appointment_date} a ete annule. ${appointment.cancelled_reason ? `Raison: ${appointment.cancelled_reason}` : ''}`,
  };

  const priorities = {
    created: 'medium',
    rescheduled: 'high',
    cancelled: 'high',
  };

  try {
    await supabase.from('notifications').insert({
      user_id: patientId,
      type: `appointment_${type}`,
      priority: priorities[type],
      title: titles[type],
      message: messages[type],
      data: { appointmentId: appointment.id },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    // Don't fail the main operation for notification errors
  }
}
