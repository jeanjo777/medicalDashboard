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
import { Clock, Mail, Phone, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getCurrentMedicId } from '../../utils/auth';
import EmptyState from '../EmptyState';
import AppointmentDetailModal from '../AppointmentDetailModal';
import logger from '../../utils/logger';

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

const UpcomingAppointments: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

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
        .eq('medic_id', getCurrentMedicId()!)
        .eq('appointment_date', todayDateStr)
        .neq('status', 'cancelled')
        .order('appointment_time', { ascending: true });

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
          department: extractDepartment(apt.motif || apt.message),
          time: apt.appointment_time || '00:00',
          type: apt.type_consultation ? capitalizeType(apt.type_consultation) : extractType(apt.motif || apt.message),
          bgColor: getColorForIndex(index)
        }));

        setAppointments(formattedAppointments);
      } else {
        logger.info('[UpcomingAppointments] No appointments found for today');
        setAppointments([]);
      }
    } catch (err: any) {
      logger.error('[UpcomingAppointments] Error:', err);
      setError('Erreur lors du chargement des rendez-vous');
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

  const normalizeAccents = (str: string): string =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const extractDepartment = (message: string | null): string => {
    if (!message) return 'Consultation Générale';
    const msgNorm = normalizeAccents(message);
    const departmentKeywords: { [key: string]: string } = {
      'cardio': 'Cardiologie',
      'coeur': 'Cardiologie',
      'thoracique': 'Cardiologie',
      'tension': 'Cardiologie',
      'derma': 'Dermatologie',
      'eczema': 'Dermatologie',
      'neuro': 'Neurologie',
      'avc': 'Neurologie',
      'epilepsie': 'Neurologie',
      'migraine': 'Neurologie',
      'ortho': 'Orthopédie',
      'pediat': 'Pédiatrie',
      'diabete': 'Diabétologie',
      'glycemie': 'Diabétologie',
      'thyroid': 'Endocrinologie',
      'grossesse': 'Gynécologie',
      'gyneco': 'Gynécologie',
      'asthme': 'Pneumologie',
      'dyspnee': 'Pneumologie',
      'pulmo': 'Pneumologie',
      'bpco': 'Pneumologie',
      'gastri': 'Gastro-entérologie',
      'hepati': 'Hépatologie',
      'renal': 'Néphrologie',
      'nephro': 'Néphrologie',
      'rhumato': 'Rhumatologie',
      'arthrite': 'Rhumatologie',
      'drepano': 'Hématologie',
      'sanguin': 'Hématologie',
      'oncol': 'Oncologie',
      'cancer': 'Oncologie',
      'prostate': 'Oncologie',
      'allergo': 'Allergologie',
      'allergie': 'Allergologie',
      'physio': 'Physiothérapie',
    };
    for (const [keyword, dept] of Object.entries(departmentKeywords)) {
      if (msgNorm.includes(keyword)) return dept;
    }
    return 'Consultation Générale';
  };

  const capitalizeType = (type: string): string => {
    if (!type) return 'Consultation';
    const map: Record<string, string> = {
      'consultation': 'Consultation',
      'suivi': 'Suivi',
      'urgence': 'Urgence',
      'controle': 'Contrôle',
      'teleconsultation': 'Téléconsultation',
    };
    return map[type.toLowerCase()] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const extractType = (message: string | null): string => {
    if (!message) return 'Consultation';
    const msgNorm = normalizeAccents(message);
    if (msgNorm.includes('suivi')) return 'Suivi';
    if (msgNorm.includes('urgence')) return 'Urgence';
    if (msgNorm.includes('controle')) return 'Contrôle';
    if (msgNorm.includes('traitement')) return 'Traitement';
    if (msgNorm.includes('bilan')) return 'Bilan';
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

  const handleAppointmentClick = (id: string) => {
    setSelectedAppointmentId(id);
    setIsModalOpen(true);
  };

  const handleEmail = (e: React.MouseEvent, appointment: Appointment) => {
    e.stopPropagation();
    if (appointment.email) {
      window.location.href = `mailto:${appointment.email}`;
    }
  };

  const handlePhone = (e: React.MouseEvent, appointment: Appointment) => {
    e.stopPropagation();
    if (appointment.phone) {
      window.location.href = `tel:${appointment.phone}`;
    }
  };

  const handleMore = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    handleAppointmentClick(id);
  };

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
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="theme-text-primary text-lg font-semibold mb-1">Rendez-vous à venir</h3>
            <p className="theme-text-muted text-sm">Planning du jour</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] animate-pulse"
            >
              <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-[var(--bg-tertiary)] rounded w-32 mb-2" />
                <div className="h-3 bg-[var(--bg-tertiary)] rounded w-24" />
              </div>
              <div className="text-right">
                <div className="h-4 bg-[var(--bg-tertiary)] rounded w-16 mb-2" />
                <div className="h-3 bg-[var(--bg-tertiary)] rounded w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="theme-text-primary text-lg font-semibold mb-1">Rendez-vous à venir</h3>
            <p className="theme-text-muted text-sm">Planning du jour</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchTodayAppointments}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
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
      <div>
        <div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-6 gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="theme-text-primary text-base sm:text-lg font-semibold mb-0.5 sm:mb-1">Rendez-vous à venir</h3>
            <p className="theme-text-muted text-xs sm:text-sm truncate">
              {hasAppointments
                ? `${appointments.length} rendez-vous aujourd'hui`
                : "Planning du jour"
              }
            </p>
          </div>
          {hasAppointments && (
            <button
              onClick={handleViewAll}
              className="text-blue-500 hover:text-blue-400 text-xs sm:text-sm font-medium transition-colors duration-200 flex-shrink-0 hover:bg-blue-500/10 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg active:scale-95 cursor-pointer"
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
                className="group relative flex items-center gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 bg-[var(--bg-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-all duration-200 border border-[var(--border-color)] hover:border-blue-500/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)]"
                aria-label={`Rendez-vous avec ${appointment.name} à ${appointment.time}`}
                title="Cliquer pour voir les détails"
              >
                {/* Avatar */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${appointment.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <span className="text-white font-semibold text-xs sm:text-sm">{appointment.initials}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="theme-text-primary font-medium text-xs sm:text-sm mb-0.5 truncate group-hover:text-blue-400 transition-colors">
                    {appointment.name}
                  </h4>
                  <p className="theme-text-muted text-xs truncate">{appointment.department}</p>
                </div>

                {/* Time + Actions */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 theme-text-secondary text-xs sm:text-sm mb-0.5 sm:mb-1">
                      <Clock size={12} className="sm:w-[14px] sm:h-[14px]" />
                      <span>{appointment.time}</span>
                    </div>
                    <span className="text-xs theme-text-muted hidden sm:block">{appointment.type}</span>
                  </div>

                  <div className={`hidden sm:flex items-center gap-1 transition-opacity duration-200 ${hoveredId === appointment.id ? 'opacity-100' : 'opacity-0'}`}>
                    {appointment.email && (
                      <button
                        onClick={(e) => handleEmail(e, appointment)}
                        className="p-2 hover:bg-blue-600 rounded-lg transition-colors theme-text-muted hover:text-white cursor-pointer"
                        aria-label={`Envoyer email à ${appointment.name}`}
                        title="Envoyer email"
                      >
                        <Mail size={16} />
                      </button>
                    )}
                    {appointment.phone && (
                      <button
                        onClick={(e) => handlePhone(e, appointment)}
                        className="p-2 hover:bg-green-600 rounded-lg transition-colors theme-text-muted hover:text-white cursor-pointer"
                        aria-label={`Appeler ${appointment.name}`}
                        title="Appeler"
                      >
                        <Phone size={16} />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleMore(e, appointment.id)}
                      className="p-2 hover:bg-purple-600 rounded-lg transition-colors theme-text-muted hover:text-white cursor-pointer"
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
