import React from 'react';
import { Bell, AlertCircle, Calendar, UserCheck, Clock } from 'lucide-react';

interface Notification {
  id: string;
  icon: React.ReactNode;
  text: string;
  time: string;
  type: 'info' | 'warning' | 'success';
}

const NotificationsWidget: React.FC = () => {
  const notifications: Notification[] = [
    {
      id: '1',
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      text: 'Résultats labo de M. Dupont disponibles',
      time: 'Il y a 12 min',
      type: 'warning',
    },
    {
      id: '2',
      icon: <Calendar className="h-3.5 w-3.5" />,
      text: 'RDV confirmé avec Mme Martin à 14h',
      time: 'Il y a 25 min',
      type: 'info',
    },
    {
      id: '3',
      icon: <UserCheck className="h-3.5 w-3.5" />,
      text: 'Nouveau patient enregistré : P. Leroy',
      time: 'Il y a 1h',
      type: 'success',
    },
    {
      id: '4',
      icon: <Clock className="h-3.5 w-3.5" />,
      text: 'Rappel : Réunion équipe à 16h30',
      time: 'Il y a 2h',
      type: 'info',
    },
  ];

  const typeStyles = {
    info: 'bg-blue-50 text-blue-500',
    warning: 'bg-amber-50 text-amber-500',
    success: 'bg-emerald-50 text-emerald-500',
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
          <span className="text-[10px] font-bold">{notifications.length}</span>
        </div>
      </div>

      <div className="space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0 ${typeStyles[notif.type]}`}>
              {notif.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 leading-snug group-hover:text-gray-900 transition-colors">
                {notif.text}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{notif.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsWidget;
