# 📒 GUIDE COMPLET - ALERTES, NOTIFICATIONS & QUICK ACTIONS

Système intelligent d'alertes et actions pour dashboard médical.

---

## 🎯 OBJECTIFS

✅ **Alertes Critiques** - Remonter info urgente
✅ **Notifications** - Updates non-urgentes
✅ **Quick Actions** - Raccourcis contextuels
✅ **Rappels** - Tâches à venir
✅ **Workflow UX** - Gestion intuitive

---

## 📊 PARTIE 1: TYPES D'ALERTES MÉDICALES

### 🔴 Niveau CRITIQUE (Urgent - Action Immédiate)

#### 1. Urgences Médicales
```typescript
{
  type: 'medical_emergency',
  priority: 'critical',
  title: 'Patient en urgence',
  message: 'Marie Dubois - Symptômes sévères signalés',
  actions: [
    { label: 'Voir dossier', action: 'view_patient' },
    { label: 'Appeler', action: 'call_patient' },
    { label: 'Ambulance', action: 'emergency_call' }
  ],
  autoExpire: false,
  sound: true,
  vibrate: true
}
```

**Triggers:**
- Patient signale symptômes graves
- Résultats anormaux critiques
- Alerte monitoring automatique
- Appel d'urgence reçu

**Actions Immédiates:**
- 🚨 Voir dossier complet
- 📞 Appeler patient
- 🚑 Contacter urgences
- 📋 Créer note urgente

---

#### 2. Rendez-vous Manqué (No-Show)
```typescript
{
  type: 'appointment_missed',
  priority: 'high',
  title: 'Rendez-vous manqué',
  message: 'Jean Martin - RDV 14h30 non honoré',
  actions: [
    { label: 'Recontacter', action: 'call_patient' },
    { label: 'Reprogrammer', action: 'reschedule' },
    { label: 'Marquer contacté', action: 'mark_contacted' }
  ],
  autoExpire: '24h',
  sound: false
}
```

**Triggers:**
- 15 min après heure prévue
- Patient non arrivé
- Pas de confirmation

**Actions:**
- 📞 Appel de suivi
- 📅 Reprogrammer
- 📝 Note de contact

---

#### 3. Résultats Anormaux
```typescript
{
  type: 'abnormal_results',
  priority: 'high',
  title: 'Résultats anormaux',
  message: 'Sophie Bernard - Analyses sanguines hors norme',
  data: {
    testType: 'Blood Test',
    abnormalValues: ['Glucose: 180 mg/dL (normal: 70-100)']
  },
  actions: [
    { label: 'Voir résultats', action: 'view_results' },
    { label: 'Contacter patient', action: 'call_patient' },
    { label: 'RDV urgence', action: 'schedule_urgent' }
  ],
  autoExpire: false
}
```

---

### 🟡 Niveau ÉLEVÉ (Important - Action Rapide)

#### 4. Renouvellement Ordonnance
```typescript
{
  type: 'prescription_renewal',
  priority: 'medium',
  title: 'Ordonnance à renouveler',
  message: 'Paul Durand - Traitement diabète expire dans 3 jours',
  data: {
    medication: 'Metformine 850mg',
    expiryDate: '2025-11-05',
    lastRenewal: '2025-08-05'
  },
  actions: [
    { label: 'Renouveler', action: 'renew_prescription' },
    { label: 'Consulter dossier', action: 'view_patient' },
    { label: 'Reporter', action: 'snooze_7d' }
  ],
  autoExpire: '7d'
}
```

**Triggers:**
- 7 jours avant expiration
- Patient demande renouvellement
- Fin de traitement proche

---

#### 5. Suivi Post-Consultation
```typescript
{
  type: 'followup_required',
  priority: 'medium',
  title: 'Suivi requis',
  message: 'Claire Petit - 7 jours après intervention',
  data: {
    consultationDate: '2025-10-25',
    consultationType: 'Post-opératoire',
    daysElapsed: 7
  },
  actions: [
    { label: 'Appeler', action: 'call_patient' },
    { label: 'RDV contrôle', action: 'schedule_followup' },
    { label: 'Envoyer SMS', action: 'send_sms' }
  ]
}
```

---

#### 6. Confirmation RDV Requise
```typescript
{
  type: 'confirmation_needed',
  priority: 'medium',
  title: 'Confirmation manquante',
  message: '3 rendez-vous de demain non confirmés',
  data: {
    count: 3,
    appointments: [
      { time: '09:00', patient: 'Marc Leroy' },
      { time: '14:00', patient: 'Anne Dubois' },
      { time: '16:30', patient: 'Luc Martin' }
    ]
  },
  actions: [
    { label: 'Confirmer tous', action: 'confirm_all' },
    { label: 'Voir détails', action: 'view_appointments' },
    { label: 'Envoyer rappels', action: 'send_reminders' }
  ]
}
```

---

### 🔵 Niveau NORMAL (Informatif - Pas d'urgence)

#### 7. Nouveau Patient
```typescript
{
  type: 'new_patient',
  priority: 'low',
  title: 'Nouveau patient enregistré',
  message: 'Emma Rousseau - Inscription complète',
  actions: [
    { label: 'Voir dossier', action: 'view_patient' },
    { label: 'Premier RDV', action: 'schedule_first' }
  ],
  autoExpire: '48h'
}
```

---

#### 8. Paiement Reçu
```typescript
{
  type: 'payment_received',
  priority: 'low',
  title: 'Paiement reçu',
  message: 'Thomas Bernard - 85€ (Consultation)',
  data: {
    amount: 85,
    method: 'Card',
    invoiceId: 'INV-2025-1234'
  },
  actions: [
    { label: 'Voir facture', action: 'view_invoice' }
  ],
  autoExpire: '24h'
}
```

---

#### 9. Rappel Tâches
```typescript
{
  type: 'task_reminder',
  priority: 'low',
  title: 'Tâches en attente',
  message: '5 tâches à compléter aujourd\'hui',
  data: {
    tasks: [
      'Vérifier résultats Marie D.',
      'Rappeler prescription Paul R.',
      'Compléter dossier nouveau patient'
    ]
  },
  actions: [
    { label: 'Voir tâches', action: 'view_tasks' }
  ]
}
```

---

## 🎨 PARTIE 2: WORKFLOW UX

### Architecture Notification System

```
Notification Bell (Header)
  │
  ├─ Badge Count (unread)
  ├─ Dropdown Panel
  │   │
  │   ├─ Filters (All, Critical, High, Medium)
  │   ├─ List (sorted by priority + time)
  │   │   │
  │   │   ├─ Notification Item
  │   │   │   ├─ Icon (by type)
  │   │   │   ├─ Title + Message
  │   │   │   ├─ Timestamp
  │   │   │   ├─ Quick Actions Buttons
  │   │   │   └─ Mark as Read
  │   │   │
  │   │   └─ ...more notifications
  │   │
  │   └─ Footer
  │       ├─ "Mark All Read"
  │       └─ "View All" (full page)
  │
  └─ Full Notifications Page
      ├─ Advanced Filters
      ├─ Bulk Actions
      └─ Archive
```

---

### Notification Bell Component

```tsx
/**
 * NotificationBell.tsx - Header notification icon
 */
import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, AlertCircle, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  type: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  data?: any;
  actions: Action[];
  read: boolean;
  createdAt: string;
}

interface Action {
  label: string;
  action: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();

    // Real-time subscription
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, handleNewNotification)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    }
  };

  const handleNewNotification = (payload: any) => {
    const newNotif = payload.new as Notification;

    // Play sound for critical notifications
    if (newNotif.priority === 'critical') {
      playNotificationSound();
    }

    // Show browser notification (if permitted)
    if (Notification.permission === 'granted') {
      new Notification(newNotif.title, {
        body: newNotif.message,
        icon: '/notification-icon.png',
        badge: '/badge-icon.png'
      });
    }

    // Update state
    setNotifications(prev => [newNotif, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleAction = async (notification: Notification, actionKey: string) => {
    // Execute action based on key
    switch (actionKey) {
      case 'view_patient':
        // Navigate to patient page
        break;
      case 'call_patient':
        // Open phone dialer
        break;
      case 'reschedule':
        // Open reschedule modal
        break;
      // ... more actions
    }

    // Mark notification as read after action
    markAsRead(notification.id);
    setIsOpen(false);
  };

  const playNotificationSound = () => {
    const audio = new Audio('/notification-sound.mp3');
    audio.play().catch(() => {
      // Ignore if sound fails
    });
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="text-red-500" size={20} />;
      case 'high':
        return <AlertCircle className="text-orange-500" size={20} />;
      case 'medium':
        return <Info className="text-blue-500" size={20} />;
      default:
        return <Info className="text-gray-500" size={20} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-500/10';
      case 'high':
        return 'border-orange-500 bg-orange-500/10';
      case 'medium':
        return 'border-blue-500 bg-blue-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.priority === filter;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white hover:bg-[#334155] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell size={20} />

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-[#1e293b] border border-[#334155] rounded-xl shadow-2xl z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#334155]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-lg">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              {['all', 'critical', 'high', 'medium'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#334155] text-gray-400 hover:text-white'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Bell size={48} className="mb-3 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-[#334155]">
                {filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-[#0f172a] transition-colors ${
                      !notification.read ? 'bg-blue-500/5' : ''
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-2">
                      {getPriorityIcon(notification.priority)}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-sm mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-gray-400 text-xs">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-white"
                          aria-label="Mark as read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                    </div>

                    {/* Quick Actions */}
                    {notification.actions && notification.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {notification.actions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAction(notification, action.action)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                              action.variant === 'danger'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : action.variant === 'primary'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-[#334155] text-gray-300 hover:bg-[#475569] hover:text-white'
                            }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className="text-gray-500 text-xs mt-2">
                      {new Date(notification.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-[#334155] bg-[#0f172a]">
              <div className="flex gap-2">
                <button
                  onClick={markAllAsRead}
                  className="flex-1 px-3 py-2 bg-[#334155] text-gray-300 rounded-lg text-sm font-medium hover:bg-[#475569] hover:text-white transition-colors"
                >
                  Mark All Read
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to full page
                  }}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  View All
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
```

---

## 💾 PARTIE 3: DATABASE SCHEMA

### Notifications Table

```sql
/*
  # Notifications System

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `type` (text) - notification type
      - `priority` (text) - critical/high/medium/low
      - `title` (text)
      - `message` (text)
      - `data` (jsonb) - additional data
      - `actions` (jsonb) - quick actions
      - `read` (boolean)
      - `read_at` (timestamptz)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Users can only see their own notifications
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  actions jsonb DEFAULT '[]',
  read boolean DEFAULT false,
  read_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to auto-delete expired notifications
CREATE OR REPLACE FUNCTION delete_expired_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM notifications
  WHERE expires_at IS NOT NULL
    AND expires_at < now();
END;
$$;

-- Schedule cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-notifications', '0 * * * *', 'SELECT delete_expired_notifications()');
```

---

## 🎯 PARTIE 4: QUICK ACTIONS CONTEXTUELLES

### Actions par Type de Notification

```typescript
// Action Registry
export const notificationActions = {
  // Patient Actions
  view_patient: {
    handler: (data: any) => navigate(`/patients/${data.patientId}`),
    icon: User,
    label: 'View Patient'
  },
  call_patient: {
    handler: (data: any) => window.location.href = `tel:${data.phone}`,
    icon: Phone,
    label: 'Call Patient'
  },
  email_patient: {
    handler: (data: any) => window.location.href = `mailto:${data.email}`,
    icon: Mail,
    label: 'Email Patient'
  },

  // Appointment Actions
  reschedule: {
    handler: (data: any) => openRescheduleModal(data.appointmentId),
    icon: Calendar,
    label: 'Reschedule'
  },
  cancel_appointment: {
    handler: (data: any) => cancelAppointment(data.appointmentId),
    icon: X,
    label: 'Cancel'
  },
  confirm_appointment: {
    handler: (data: any) => confirmAppointment(data.appointmentId),
    icon: Check,
    label: 'Confirm'
  },

  // Prescription Actions
  renew_prescription: {
    handler: (data: any) => openRenewModal(data.prescriptionId),
    icon: FileText,
    label: 'Renew'
  },

  // Emergency Actions
  emergency_call: {
    handler: () => window.location.href = 'tel:112',
    icon: AlertCircle,
    label: '112',
    variant: 'danger'
  }
};
```

---

## 📱 PARTIE 5: NOTIFICATION TRIGGERS

### Auto-Generation Rules

```typescript
/**
 * Notification Triggers
 */

// 1. Appointment No-Show (15 min after scheduled time)
async function checkNoShowAppointments() {
  const now = new Date();
  const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60000);

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('status', 'confirmed')
    .lte('appointment_time', fifteenMinutesAgo.toTimeString())
    .eq('appointment_date', now.toISOString().split('T')[0]);

  for (const apt of appointments || []) {
    await createNotification({
      type: 'appointment_missed',
      priority: 'high',
      title: 'Rendez-vous manqué',
      message: `${apt.patient_name} - RDV ${apt.appointment_time} non honoré`,
      data: { appointmentId: apt.id, patientId: apt.patient_id },
      actions: [
        { label: 'Recontacter', action: 'call_patient' },
        { label: 'Reprogrammer', action: 'reschedule' }
      ]
    });
  }
}

// 2. Prescription Expiry (7 days before)
async function checkExpiringPrescriptions() {
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select('*, patients(*)')
    .lte('expiry_date', sevenDaysFromNow.toISOString())
    .eq('renewed', false);

  for (const rx of prescriptions || []) {
    await createNotification({
      type: 'prescription_renewal',
      priority: 'medium',
      title: 'Ordonnance à renouveler',
      message: `${rx.patients.name} - ${rx.medication} expire bientôt`,
      data: { prescriptionId: rx.id, patientId: rx.patient_id },
      actions: [
        { label: 'Renouveler', action: 'renew_prescription' },
        { label: 'Consulter', action: 'view_patient' }
      ],
      expires_at: rx.expiry_date
    });
  }
}

// 3. Unconfirmed Appointments (24h before)
async function checkUnconfirmedAppointments() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('appointment_date', tomorrow.toISOString().split('T')[0])
    .eq('status', 'pending');

  if (appointments && appointments.length > 0) {
    await createNotification({
      type: 'confirmation_needed',
      priority: 'medium',
      title: 'Confirmations manquantes',
      message: `${appointments.length} rendez-vous de demain non confirmés`,
      data: { appointments },
      actions: [
        { label: 'Confirmer tous', action: 'confirm_all' },
        { label: 'Envoyer rappels', action: 'send_reminders' }
      ]
    });
  }
}

// Run checks periodically
setInterval(checkNoShowAppointments, 15 * 60000); // Every 15 min
setInterval(checkExpiringPrescriptions, 24 * 60 * 60000); // Daily
setInterval(checkUnconfirmedAppointments, 24 * 60 * 60000); // Daily
```

---

## 🎨 UX BEST PRACTICES

### 1. Priorité Visuelle

```css
/* Critical */
.notification-critical {
  border-left: 4px solid #ef4444;
  background: rgba(239, 68, 68, 0.1);
  animation: pulse 2s infinite;
}

/* High */
.notification-high {
  border-left: 4px solid #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

/* Medium */
.notification-medium {
  border-left: 4px solid #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

/* Low */
.notification-low {
  border-left: 4px solid #6b7280;
  background: rgba(107, 114, 128, 0.05);
}
```

### 2. Sons & Vibrations

```typescript
// Critical alerts
const playCriticalSound = () => {
  const audio = new Audio('/sounds/critical.mp3');
  audio.volume = 1.0;
  audio.play();

  // Vibrate (mobile)
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200]);
  }
};

// Regular notifications
const playNotificationSound = () => {
  const audio = new Audio('/sounds/notification.mp3');
  audio.volume = 0.5;
  audio.play();
};
```

### 3. Groupement Intelligent

```typescript
// Group similar notifications
const groupNotifications = (notifications: Notification[]) => {
  const groups: Record<string, Notification[]> = {};

  notifications.forEach(n => {
    const key = `${n.type}_${n.priority}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });

  return Object.entries(groups).map(([key, items]) => {
    if (items.length === 1) return items[0];

    // Create grouped notification
    return {
      ...items[0],
      title: `${items.length} ${items[0].title}`,
      message: `${items.length} notifications similaires`,
      grouped: true,
      items
    };
  });
};
```

---

## ✅ RÉSUMÉ

**Types d'alertes:** 9 catégories
- 🔴 Critiques: 3 (emergency, no-show, abnormal)
- 🟡 Élevées: 3 (renewal, followup, confirmation)
- 🔵 Normales: 3 (new patient, payment, tasks)

**Components:** NotificationBell (complet)
**Database:** Migration SQL ready
**Actions:** 10+ quick actions
**Triggers:** 3 auto-checks

**Le système de notifications est prêt à implémenter!** 📒🔔
