import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import logger from '../utils/logger';

export interface ActivityItem {
  id: string;
  user_name: string;
  user_initials: string;
  action: string;
  entity_type: 'patient' | 'appointment' | 'consultation' | 'other';
  entity_id: string | null;
  entity_name: string | null;
  created_at: string;
  metadata?: Record<string, any>;
}

const DEMO_ACTIVITIES: ActivityItem[] = [
  {
    id: 'demo-1',
    user_name: 'Dr. Martin',
    user_initials: 'DM',
    action: 'Nouveau patient enregistré',
    entity_type: 'patient',
    entity_id: 'demo-patient-1',
    entity_name: 'Marie Dupont',
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-2',
    user_name: 'Dr. Bernard',
    user_initials: 'DB',
    action: 'Consultation terminée',
    entity_type: 'consultation',
    entity_id: 'demo-consult-1',
    entity_name: 'Jean Leroy',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-3',
    user_name: 'Dr. Martin',
    user_initials: 'DM',
    action: 'Rendez-vous confirmé',
    entity_type: 'appointment',
    entity_id: 'demo-apt-1',
    entity_name: 'Sophie Martin',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-4',
    user_name: 'Dr. Petit',
    user_initials: 'DP',
    action: 'Ordonnance créée',
    entity_type: 'consultation',
    entity_id: 'demo-consult-2',
    entity_name: 'Pierre Dubois',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-5',
    user_name: 'Dr. Bernard',
    user_initials: 'DB',
    action: 'Dossier médical mis à jour',
    entity_type: 'patient',
    entity_id: 'demo-patient-2',
    entity_name: 'Claire Moreau',
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-6',
    user_name: 'Dr. Martin',
    user_initials: 'DM',
    action: 'Résultats d\'analyse ajoutés',
    entity_type: 'patient',
    entity_id: 'demo-patient-3',
    entity_name: 'Luc Fontaine',
    created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
];

interface UseActivityLogOptions {
  limit?: number;
  entityType?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseActivityLogResult {
  activities: ActivityItem[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  logActivity: (activity: Omit<ActivityItem, 'id' | 'created_at'>) => Promise<void>;
}

export const useActivityLog = (
  options: UseActivityLogOptions = {}
): UseActivityLogResult => {
  const {
    limit = 10,
    entityType,
    autoRefresh = false,
    refreshInterval = 30000,
  } = options;

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (entityType) {
        query = query.eq('entity_type', entityType);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setActivities(data || []);
    } catch (err) {
      logger.error('Error fetching activities:', err);
      logger.info('Using demo activity data as fallback');
      setActivities(DEMO_ACTIVITIES.slice(0, limit));
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (
    activity: Omit<ActivityItem, 'id' | 'created_at'>
  ) => {
    try {
      const { error: insertError } = await supabase
        .from('activity_log')
        .insert({
          user_name: activity.user_name,
          user_initials: activity.user_initials,
          action: activity.action,
          entity_type: activity.entity_type,
          entity_id: activity.entity_id,
          entity_name: activity.entity_name,
          metadata: activity.metadata || {},
        });

      if (insertError) throw insertError;

      await fetchActivities();
    } catch (err) {
      logger.error('Error logging activity:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchActivities();

    if (autoRefresh) {
      const interval = setInterval(fetchActivities, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [limit, entityType, autoRefresh, refreshInterval]);

  useEffect(() => {
    const channel = supabase
      .channel('activity_log_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log',
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit, entityType]);

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities,
    logActivity,
  };
};
