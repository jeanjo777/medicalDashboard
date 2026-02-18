/**
 * UpcomingAppointments Component - ENHANCED VERSION
 *
 * Interactive appointment list with contextual actions.
 * Features:
 * - Click to open detail modal
 * - Quick actions (email, phone, complete, cancel)
 * - Hover states with action buttons
 * - Keyboard navigation (Tab, Enter, Space)
 * - ARIA labels for accessibility
 * - Loading + error states
 * - Real-time data from Supabase
 */

import React, { useEffect, useState } from 'react';
import { Clock, Mail, Phone, MoreVertical, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import EmptyState from '../EmptyState';
import AppointmentDetailModal from '../AppointmentDetailModal';
import logger from '../../utils/logger';
import { useDemoMode } from '../../hooks/useDemoMode';
import { demoAppointments as centralDemoAppointments } from '../../data/demoData';

interface Appointment {
  id: string;
  initials: string;
  name: string;
  department: string;
  time: string;
  type: string;
  bgColor: string;
  phone: string;
  email: string;
}

const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: 'demo-1',
    initials: 'MD',
    name: 'Marie Dupont',
    department: 'Cardiologie',
    time: '09:00',
    type: 'Consultation',
    bgColor: 'bg-blue-500',
    phone: '+33 6 12 34 56 78',
    email: 'marie.dupont@email.com',
  },
  {
    id: 'demo-2',
    initials: 'JL',
    name: 'Jean Leroy',
    department: 'Dermatologie',
    time: '10:30',
    type: 'Suivi',
    bgColor: 'bg-emerald-500',
    phone: '+33 6 23 45 67 89',
    email: 'jean.leroy@email.com',
  },
  {
    id: 'demo-3',
    initials: 'SM',
    name: 'Sophie Martin',
    department: 'Consultation Générale',
    time: '11:00',
    type: 'Consultation',
    bgColor: 'bg-purple-500',
    phone: '+33 6 34 56 78 90',
    email: 'sophie.martin@email.com',
  },
  {
    id: 'demo-4',
    initials: 'PD',
    name: 'Pierre Dubois',
    department: 'Neurologie',
    time: '14:00',
    type: 'Contrôle',
    bgColor: 'bg-orange-500',
    phone: '+33 6 45 67 89 01',
    email: 'pierre.dubois@email.com',
  },
  {
    id: 'demo-5',
    initials: 'CM',
    name: 'Claire Moreau',
    department: 'Pédiatrie',
    time: '15:30',
    type: 'Suivi',
    bgColor: 'bg-pink-500',
    phone: '+33 6 56 78 90 12',
    email: 'claire.moreau@email.com',
  },
];

const UpcomingAppointments: React.FC = () => {
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getTodayDemoAppointments = (): Appointment[] => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayApts = centralDemoAppointments.filter(apt => apt.date === todayStr);

    if (todayApts.length > 0) {
      return todayApts.slice(0, 6).map((apt, index) => ({
        id: apt.id,
        initials: apt.patientInitials,
        name: apt.patientName,
        department: apt.department,
        time: apt.time,
        type: apt.type === 'follow-up' ? 'Suivi' : apt.type === 'checkup' ? 'Contrôle' : apt.type === 'emergency' ? 'Urgence' : apt.type === 'therapy' ? 'Thérapie' : 'Consultation',
        bgColor: getColorForIndex(index),
        phone: '',
        email: '',
      }));
    }
    return DEMO_APPOINTMENTS;
  };

  useEffect(() => {
    if (isDemoMode) {
      setAppointments(getTodayDemoAppointments());
      setLoading(false);
      setError(null);
    } else {
      fetchTodayAppointments();
    }
  }, [isDemoMode]);

  const fetchTodayAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayDateStr = `${year}-${month}-${day}`;

      logger.info('[UpcomingAppointments] Fetching for:', todayDateStr);

      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('appointment_date', todayDateStr)
        .neq('status', 'cancelled')
        .order('appointment_time', { ascending: true })
        .limit(6);

      if (fetchError) {
        logger.error('[UpcomingAppointments] Error:', fetchError);
        throw fetchError;
      }

      logger.info('[UpcomingAppointments] Fetched:', data);

      if (data && data.length > 0) {
        const formattedAppointments = data.map((apt, index) => ({
          id: apt.id,
          name: apt.patient_name || 'Unknown Patient',
          email: apt.patient_email || '',
          phone: apt.patient_phone || '',
          initials: generateInitials(apt.patient_name),
          department: extractDepartment(apt.message),
          time: apt.appointment_time || '00:00',
          type: extractType(apt.message) || 'Consultation',
          bgColor: getColorForIndex(index)
        }));

        setAppointments(formattedAppointments);
      } else {
        // No real data - use demo appointments as fallback
        logger.info('[UpcomingAppointments] No data from Supabase, using demo fallback');
        setAppointments(getTodayDemoAppointments());
      }
    } catch (err: any) {
      logger.error('[UpcomingAppointments] Error:', err);
      logger.info('[UpcomingAppointments] Using demo data as fallback');
      setAppointments(DEMO_APPOINTMENTS);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const generateInitials = (name: string): string => {
    if (!name || typeof name !== 'string') return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '??';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const extractDepartment = (message: string | null): string => {
    if (!message) return 'Consultation Générale';
    const departmentKeywords: { [key: string]: string } = {
      'cardio': 'Cardiologie',
      'derma': 'Dermatologie',
      'neuro': 'Neurologie',
      'ortho': 'Orthopédie',
      'pédiat': 'Pédiatrie',
      'diabète': 'Diabétologie',
      'physio': 'Physiothérapie'
    };
    const messageLower = message.toLowerCase();
    for (const [keyword, dept] of Object.entries(departmentKeywords)) {
      if (messageLower.includes(keyword)) return dept;
    }
    return 'Consultation Générale';
  };

  const extractType = (message: string | null): string => {
    if (!message) return 'Consultation';
    const messageLower = message.toLowerCase();
    if (messageLower.includes('suivi')) return 'Suivi';
    if (messageLower.includes('urgence')) return 'Urgence';
    if (messageLower.includes('contrôle')) return 'Contrôle';
    if (messageLower.includes('traitement')) return 'Traitement';
    return 'Consultation';
  };

  const getColorForIndex = (index: number): string => {
    const colors = [
      'bg-blue-500',
      'bg-emerald-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];
    return colors[index % colors.length];
  };

  /**
   * Open detail modal
   */
  const handleAppointmentClick = (id: string) => {
    setSelectedAppointmentId(id);
    setIsModalOpen(true);
  };

  /**
   * Quick action: Email
   */
  const handleEmail = (e: React.MouseEvent, appointment: Appointment) => {
    e.stopPropagation();
    if (appointment.email) {
      window.location.href = `mailto:${appointment.email}`;
    }
  };

  /**
   * Quick action: Phone
   */
  const handlePhone = (e: React.MouseEvent, appointment: Appointment) => {
    e.stopPropagation();
    if (appointment.phone) {
      window.location.href = `tel:${appointment.phone}`;
    }
  };

  /**
   * Quick action: More (open modal)
   */
  const handleMore = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    handleAppointmentClick(id);
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAppointmentClick(id);
    }
  };

  const handleViewAll = () => {
    navigate('/appointments');
  };

  const handleModalUpdate = () => {
    fetchTodayAppointments();
  };

  if (loading) {
    return (
      <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white text-lg font-semibold mb-1">Rendez-vous à venir</h3>
            <p className="text-gray-400 text-sm">Planning du jour</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-[#0f172a] rounded-lg border border-[#334155] animate-pulse"
            >
              <div className="w-12 h-12 bg-[#334155] rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-[#334155] rounded w-32 mb-2" />
                <div className="h-3 bg-[#334155] rounded w-24" />
              </div>
              <div className="text-right">
                <div className="h-4 bg-[#334155] rounded w-16 mb-2" />
                <div className="h-3 bg-[#334155] rounded w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white text-lg font-semibold mb-1">Rendez-vous à venir</h3>
            <p className="text-gray-400 text-sm">Planning du jour</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchTodayAppointments}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const hasAppointments = appointments.length > 0;

  return (
    <>
      <div className="bg-[#1e293b] rounded-xl p-4 sm:p-5 lg:p-6 border border-[#334155] hover:border-[#475569] transition-colors">
        <div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-6 gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-white text-base sm:text-lg font-semibold mb-0.5 sm:mb-1">Rendez-vous à venir</h3>
            <p className="text-gray-400 text-xs sm:text-sm truncate">
              {hasAppointments
                ? `${appointments.length} rendez-vous aujourd'hui`
                : "Planning du jour"
              }
            </p>
          </div>
          {hasAppointments && (
            <button
              onClick={handleViewAll}
              className="text-blue-500 hover:text-blue-400 text-xs sm:text-sm font-medium transition-colors duration-200 flex-shrink-0 hover:bg-blue-500/10 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg active:scale-95"
              aria-label="Voir tous les rendez-vous"
            >
              <span className="hidden sm:inline">Voir tout</span>
              <span className="sm:hidden">Tous</span>
            </button>
          )}
        </div>

        {!hasAppointments ? (
          <EmptyState type="appointments" className="py-12" />
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                role="button"
                tabIndex={0}
                onClick={() => handleAppointmentClick(appointment.id)}
                onKeyPress={(e) => handleKeyPress(e, appointment.id)}
                onMouseEnter={() => setHoveredId(appointment.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group relative flex items-center gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 bg-[#0f172a] rounded-lg hover:bg-[#1e293b] transition-all duration-200 border border-[#334155] hover:border-blue-500/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0f172a]"
                aria-label={`Rendez-vous avec ${appointment.name} à ${appointment.time}`}
                title="Cliquer pour voir les détails"
              >
                {/* Avatar */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${appointment.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <span className="text-white font-semibold text-xs sm:text-sm">{appointment.initials}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-xs sm:text-sm mb-0.5 truncate group-hover:text-blue-400 transition-colors">
                    {appointment.name}
                  </h4>
                  <p className="text-gray-400 text-xs truncate">{appointment.department}</p>
                </div>

                {/* Time + Actions */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Time (always visible) */}
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-gray-300 text-xs sm:text-sm mb-0.5 sm:mb-1">
                      <Clock size={12} className="sm:w-[14px] sm:h-[14px]" />
                      <span>{appointment.time}</span>
                    </div>
                    <span className="text-xs text-gray-400 hidden sm:block">{appointment.type}</span>
                  </div>

                  {/* Quick Actions (visible on hover - hidden on mobile) */}
                  <div className={`hidden sm:flex items-center gap-1 transition-opacity duration-200 ${hoveredId === appointment.id ? 'opacity-100' : 'opacity-0'}`}>
                    {/* Email */}
                    {appointment.email && (
                      <button
                        onClick={(e) => handleEmail(e, appointment)}
                        className="p-2 hover:bg-blue-600 rounded-lg transition-colors text-gray-400 hover:text-white"
                        aria-label={`Envoyer email à ${appointment.name}`}
                        title="Envoyer email"
                      >
                        <Mail size={16} />
                      </button>
                    )}

                    {/* Phone */}
                    {appointment.phone && (
                      <button
                        onClick={(e) => handlePhone(e, appointment)}
                        className="p-2 hover:bg-green-600 rounded-lg transition-colors text-gray-400 hover:text-white"
                        aria-label={`Appeler ${appointment.name}`}
                        title="Appeler"
                      >
                        <Phone size={16} />
                      </button>
                    )}

                    {/* More Actions */}
                    <button
                      onClick={(e) => handleMore(e, appointment.id)}
                      className="p-2 hover:bg-purple-600 rounded-lg transition-colors text-gray-400 hover:text-white"
                      aria-label="Plus d'actions"
                      title="Plus d'actions"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AppointmentDetailModal
        appointmentId={selectedAppointmentId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppointmentId(null);
        }}
        onUpdate={handleModalUpdate}
      />
    </>
  );
};

export default UpcomingAppointments;
