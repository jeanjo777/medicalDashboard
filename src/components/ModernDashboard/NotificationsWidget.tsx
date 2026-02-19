import React, { useMemo } from 'react';
import { AlertCircle, Calendar, UserCheck, Clock, CheckCircle, Info } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DisplayNotification {
  id: string;
  icon: React.ReactNode;
  text: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'warning':
      return <AlertCircle className="h-3.5 w-3.5" />;
    case 'success':
      return <CheckCircle className="h-3.5 w-3.5" />;
    case 'error':
      return <AlertCircle className="h-3.5 w-3.5" />;
    default:
      return <Info className="h-3.5 w-3.5" />;
  }
};

const typeStyles: Record<string, string> = {
  info: 'bg-blue-500/10 text-blue-500',
  warning: 'bg-amber-500/10 text-amber-500',
  success: 'bg-emerald-500/10 text-emerald-500',
  error: 'bg-red-500/10 text-red-500',
};

const NotificationsWidget: React.FC = () => {
  const { notifications: realNotifications } = useNotifications();

  const notifications: DisplayNotification[] = useMemo(() => {
    if (!realNotifications?.length) return [];

    return realNotifications.slice(0, 5).map((n) => ({
      id: n.id,
      icon: getIconForType(n.type),
      text: n.message || n.title,
      time: formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr }),
      type: n.type,
    }));
  }, [realNotifications]);

  return (
    <div className="rounded-2xl bg-[var(--bg-secondary)] p-4 shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold theme-text-primary">Notifications</h2>
        {notifications.length > 0 && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
            <span className="text-[10px] font-bold">{notifications.length}</span>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-xs theme-text-muted text-center py-4">Aucune notification</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer group"
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0 ${typeStyles[notif.type] || typeStyles.info}`}>
                {notif.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium theme-text-secondary leading-snug group-hover:text-[var(--text-primary)] transition-colors">
                  {notif.text}
                </p>
                <p className="text-[10px] theme-text-muted mt-0.5">{notif.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsWidget;
