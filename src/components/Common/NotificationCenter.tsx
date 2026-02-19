import React, { useState } from 'react';
import { Bell, Check, X, AlertCircle, Info, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import logger from '../../utils/logger';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const getIcon = (type: string, priority: string) => {
    if (priority === 'critical') {
      return <AlertCircle size={20} className="text-red-400" />;
    }

    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-emerald-400" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-orange-400" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-400" />;
      default:
        return <Info size={20} className="text-blue-400" />;
    }
  };

  const getTypeStyles = (type: string, priority: string) => {
    if (priority === 'critical') {
      return 'bg-red-500/10 border-red-500/30';
    }

    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/30';
      case 'warning':
        return 'bg-orange-500/10 border-orange-500/30';
      case 'error':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-gray-500 text-white'
    };

    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[priority as keyof typeof styles]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const handleNotificationClick = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await markAsRead(notificationId);
      } catch (err) {
        logger.error('Failed to mark as read:', err);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
    } catch (err) {
      logger.error('Failed to delete notification:', err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
      >
        <Bell size={20} className="theme-text-muted" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-2xl z-50 max-h-[600px] flex flex-col">
            <div className="p-4 border-b border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold theme-text-primary">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-[var(--bg-tertiary)] rounded transition-colors"
                >
                  <X size={18} className="theme-text-muted" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex bg-[var(--bg-input)] rounded-lg p-1">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      filter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'theme-text-muted hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Toutes ({notifications.length})
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      filter === 'unread'
                        ? 'bg-blue-600 text-white'
                        : 'theme-text-muted hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Non lues ({unreadCount})
                  </button>
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Tout marquer lu
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
                  <p className="theme-text-muted text-sm mt-3">Chargement...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={48} className="theme-text-muted mx-auto mb-3 opacity-40" />
                  <p className="theme-text-muted text-sm">
                    {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#334155]">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id, notification.is_read)}
                      className={`p-4 hover:bg-[var(--bg-input)] transition-colors cursor-pointer ${
                        !notification.is_read ? 'bg-blue-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg border ${getTypeStyles(notification.type, notification.priority)}`}>
                          {getIcon(notification.type, notification.priority)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="theme-text-primary font-medium text-sm">{notification.title}</h4>
                            <div className="flex items-center gap-2">
                              {getPriorityBadge(notification.priority)}
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                          </div>

                          <p className="theme-text-muted text-sm mb-2">{notification.message}</p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs theme-text-muted">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: fr
                              })}
                            </span>

                            <div className="flex items-center gap-1">
                              {!notification.is_read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationClick(notification.id, false);
                                  }}
                                  className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded transition-colors text-emerald-400"
                                  title="Marquer comme lu"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                              <button
                                onClick={(e) => handleDelete(e, notification.id)}
                                className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded transition-colors text-red-400"
                                title="Supprimer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {filteredNotifications.length > 0 && (
              <div className="p-3 border-t border-[var(--border-color)] text-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Voir toutes les notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
