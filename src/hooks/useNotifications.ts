import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentMedicId } from '../utils/auth';
import logger from '../utils/logger';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_read: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
  read_at?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 15s + refresh on focus
    const id = setInterval(fetchNotifications, 15_000);
    const onFocus = () => fetchNotifications();
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(id); window.removeEventListener('focus', onFocus); };
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const medicId = getCurrentMedicId();
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (medicId) query = query.eq('user_id', medicId);

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Map DB column 'read' to 'is_read' for the interface
      const mapped = (data || []).map((n: any) => ({
        ...n,
        is_read: n.read ?? n.is_read ?? false,
      }));

      setNotifications(mapped);
      setUnreadCount(mapped.filter((n) => !n.is_read).length);
    } catch (err) {
      logger.error('[Notifications] Fetch error:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (updateError) throw updateError;

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      logger.error('[Notifications] Mark as read error:', err);
      throw err;
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter((n) => !n.is_read)
        .map((n) => n.id);

      if (unreadIds.length === 0) return;

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .in('id', unreadIds);

      if (updateError) throw updateError;

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
          read_at: n.is_read ? n.read_at : new Date().toISOString()
        }))
      );
      setUnreadCount(0);
    } catch (err) {
      logger.error('[Notifications] Mark all as read error:', err);
      throw err;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (deleteError) throw deleteError;

      const notification = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      if (notification && !notification.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      logger.error('[Notifications] Delete error:', err);
      throw err;
    }
  };

  const createNotification = async (notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'is_read'>) => {
    try {
      const medicId = getCurrentMedicId();
      if (!medicId) throw new Error('User not authenticated');

      const { data, error: insertError } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          user_id: medicId,
          read: false,
        })
        .select();

      if (insertError) throw insertError;

      const created = Array.isArray(data) ? data[0] : data;
      return { ...created, is_read: false } as Notification;
    } catch (err) {
      logger.error('[Notifications] Create error:', err);
      throw err;
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refetch: fetchNotifications
  };
}

export function useNotificationsByPriority(priority: 'low' | 'medium' | 'high' | 'critical') {
  const { notifications, ...rest } = useNotifications();

  const filteredNotifications = notifications.filter((n) => n.priority === priority);

  return {
    notifications: filteredNotifications,
    ...rest
  };
}

export function useUnreadNotifications() {
  const { notifications, ...rest } = useNotifications();

  const unreadNotifications = notifications.filter((n) => !n.is_read);

  return {
    notifications: unreadNotifications,
    ...rest
  };
}
