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
      setActivities([]);
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
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

  // Realtime removed — autoRefresh polling above covers live updates

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities,
    logActivity,
  };
};
