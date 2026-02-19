import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface SidebarBadges {
  appointments: number;  // RDV aujourd'hui (status a_venir)
  patients: number;      // Nouveaux patients ce mois
  calendar: number;      // RDV à venir (7 prochains jours)
  'ai-alerts': number;   // Alertes IA non acquittées
  'ai-assistant': number; // Consultations en attente
  [key: string]: number;
}

const EMPTY_BADGES: SidebarBadges = {
  appointments: 0,
  patients: 0,
  calendar: 0,
  'ai-alerts': 0,
  'ai-assistant': 0,
};

export function useSidebarBadges(): SidebarBadges {
  const [badges, setBadges] = useState<SidebarBadges>(EMPTY_BADGES);

  const fetchBadges = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

      // Run all queries in parallel
      const [apptToday, newPatients, apptWeek, aiAlerts, pendingConsults] = await Promise.all([
        // 1. Appointments today with status a_venir
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('appointment_date', today)
          .in('status', ['a_venir', 'pending', 'confirmed', 'en_cours']),

        // 2. New patients this month
        supabase
          .from('patients')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startOfMonth),

        // 3. Upcoming appointments (next 7 days)
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .gte('appointment_date', today)
          .lte('appointment_date', nextWeek)
          .in('status', ['a_venir', 'pending', 'confirmed']),

        // 4. Unacknowledged AI alerts
        supabase
          .from('analytics_alerts')
          .select('id', { count: 'exact', head: true })
          .eq('is_acknowledged', false),

        // 5. Pending consultations
        supabase
          .from('consultations')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
      ]);

      setBadges({
        appointments: apptToday.count ?? 0,
        patients: newPatients.count ?? 0,
        calendar: apptWeek.count ?? 0,
        'ai-alerts': aiAlerts.count ?? 0,
        'ai-assistant': pendingConsults.count ?? 0,
      });
    } catch {
      // Silently fail - badges are non-critical
    }
  }, []);

  useEffect(() => {
    fetchBadges();

    // Poll every 60s as fallback
    const interval = setInterval(fetchBadges, 60000);

    // Real-time subscriptions
    const channel = supabase
      .channel('sidebar-badges')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, fetchBadges)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, fetchBadges)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations' }, fetchBadges)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'analytics_alerts' }, fetchBadges)
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchBadges]);

  return badges;
}
