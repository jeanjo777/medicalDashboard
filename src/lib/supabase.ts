import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AppointmentRequest {
  id?: string;
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  type_de_soin: string;
  message: string;
  date_demande: string;
  source: string;
  created_at?: string;
}
