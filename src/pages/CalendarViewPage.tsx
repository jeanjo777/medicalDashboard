import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CalendarDays,
  CheckCircle2,
  Activity,
  LayoutGrid,
  List,
  RefreshCw,
  Timer,
  Calendar as CalendarIcon,
  Filter,
  X,
  ChevronDown,
  User,
  MapPin,
  Stethoscope,
  AlertCircle
} from 'lucide-react';
import MedicalSidebarRefined from '../components/MedicalSidebarRefined';
import DemoModeToggle, { DemoModeBanner } from '../components/Common/DemoModeToggle';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import AddAppointmentModal from '../components/Appointments/AddAppointmentModal';
import AppointmentDetailModal from '../components/Appointments/AppointmentDetailModal';
import EditAppointmentModal from '../components/Appointments/EditAppointmentModal';
import { useToast } from '../components/Common/Toast';
import { useDemoMode } from '../hooks/useDemoMode';
import { demoAppointments as centralDemoAppointments, Appointment as DemoAppointment } from '../data/demoData';
import { supabase } from '../lib/supabase';
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday as isDateToday,
  getDay,
  addMonths,
  subMonths,
  getHours,
  getMinutes,
  isBefore,
  isAfter,
  startOfDay,
  parseISO
} from 'date-fns';
import { fr } from 'date-fns/locale/fr';

interface Appointment {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string;
  motif?: string;
  type_consultation?: string;
  notes?: string;
  status: string;
  duration?: number;
  created_at: string;
  updated_at?: string;
  cancelled_at?: string;
  cancelled_reason?: string;
  patient_id?: string;
  medic_id?: string;
}

interface DaySchedule {
  date: Date;
  dateString: string;
  dayName: string;
  appointments: Appointment[];
}

type ViewMode = 'week' | 'day' | 'month';

interface FilterState {
  status: string[];
  type: string[];
}

// Normaliser les statuts DB (anglais) vers les statuts UI (français)
const normalizeStatus = (status: string): string => {
  const map: Record<string, string> = {
    'scheduled': 'a_venir',
    'confirmed': 'a_venir',
    'completed': 'termine',
    'cancelled': 'annule',
    'no-show': 'annule',
    'no_show': 'annule',
  };
  return map[status] || status;
};

// Convertir les données démo centralisées au format local
const convertDemoAppointments = (demoApts: DemoAppointment[]): Appointment[] => {
  const statusMap: Record<string, string> = {
    'scheduled': 'a_venir',
    'confirmed': 'a_venir',
    'completed': 'termine',
    'cancelled': 'annule',
    'no-show': 'annule'
  };

  return demoApts.map(apt => ({
    id: apt.id,
    patient_name: apt.patientName,
    patient_email: '',
    patient_phone: '',
    appointment_date: apt.date,
    appointment_time: apt.time,
    motif: apt.reason,
    type_consultation: apt.type,
    notes: apt.notes,
    status: statusMap[apt.status] || 'a_venir',
    duration: apt.duration,
    created_at: apt.createdAt,
    patient_id: apt.patientId,
    medic_id: apt.doctorId
  }));
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string; border: string; gradient: string }> = {
  a_venir: { label: 'À venir', color: 'text-blue-500', bg: 'bg-blue-500/10', dot: 'bg-blue-500', border: 'border-blue-500/20', gradient: 'from-blue-500 to-blue-600' },
  en_cours: { label: 'En cours', color: 'text-amber-500', bg: 'bg-amber-500/10', dot: 'bg-amber-500', border: 'border-amber-500/20', gradient: 'from-amber-500 to-orange-500' },
  termine: { label: 'Terminé', color: 'text-emerald-500', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500', border: 'border-emerald-500/20', gradient: 'from-emerald-500 to-green-600' },
  annule: { label: 'Annulé', color: 'text-red-500', bg: 'bg-red-500/10', dot: 'bg-red-500', border: 'border-red-500/20', gradient: 'from-red-500 to-rose-600' },
};

const getPatientInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Current Time Indicator
const CurrentTimeIndicator: React.FC<{ startHour: number }> = ({ startHour }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const hours = getHours(currentTime);
  const minutes = getMinutes(currentTime);

  if (hours < startHour || hours >= startHour + 12) return null;

  const topPosition = ((hours - startHour) * 80) + (minutes / 60 * 80);

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${topPosition}px` }}
    >
      <div className="flex items-center">
        <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/40 ring-4 ring-red-500/20" />
        <div className="flex-1 h-[2px] bg-gradient-to-r from-red-500 to-red-500/0" />
      </div>
    </div>
  );
};

// Stat Card
const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  onClick?: () => void;
  active?: boolean;
}> = React.memo(({ icon: Icon, label, value, color, onClick, active }) => {
  const styles = {
    blue: { icon: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10 hover:bg-blue-500/15', ring: 'ring-blue-400/50', text: 'text-blue-500' },
    green: { icon: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10 hover:bg-emerald-500/15', ring: 'ring-emerald-400/50', text: 'text-emerald-500' },
    orange: { icon: 'from-amber-500 to-orange-600', bg: 'bg-amber-500/10 hover:bg-amber-500/15', ring: 'ring-amber-400/50', text: 'text-amber-500' },
    red: { icon: 'from-red-500 to-rose-600', bg: 'bg-red-500/10 hover:bg-red-500/15', ring: 'ring-red-400/50', text: 'text-red-500' },
    purple: { icon: 'from-purple-500 to-violet-600', bg: 'bg-purple-500/10 hover:bg-purple-500/15', ring: 'ring-purple-400/50', text: 'text-purple-500' },
  };

  const s = styles[color];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${s.bg} rounded-xl p-3 transition-all duration-200 border theme-border cursor-pointer w-full text-left group ${active ? `ring-2 ${s.ring} border-transparent` : 'hover:border-[var(--border-hover)]'}`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.icon} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200`}>
          <Icon size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] theme-text-secondary uppercase tracking-wider font-semibold">{label}</p>
          <p className={`text-lg font-bold ${s.text}`}>{value}</p>
        </div>
      </div>
    </button>
  );
});

StatCard.displayName = 'StatCard';

// Upcoming Appointments
const UpcomingAppointments: React.FC<{
  appointments: Appointment[];
  onAppointmentClick: (apt: Appointment) => void;
}> = React.memo(({ appointments, onAppointmentClick }) => {
  const upcoming = useMemo(() => {
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');
    const nowTime = format(now, 'HH:mm');

    return appointments
      .filter(apt => {
        if (apt.status === 'annule' || apt.status === 'termine') return false;
        if (apt.appointment_date > todayStr) return true;
        if (apt.appointment_date === todayStr && apt.appointment_time >= nowTime) return true;
        return false;
      })
      .sort((a, b) => {
        const dateCompare = a.appointment_date.localeCompare(b.appointment_date);
        if (dateCompare !== 0) return dateCompare;
        return a.appointment_time.localeCompare(b.appointment_time);
      })
      .slice(0, 4);
  }, [appointments]);

  if (upcoming.length === 0) {
    return (
      <div className="theme-bg-secondary rounded-xl border theme-border p-4">
        <h3 className="text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-3">Prochains RDV</h3>
        <div className="text-center py-4">
          <CalendarDays size={28} className="mx-auto theme-text-muted mb-2" />
          <p className="text-xs theme-text-muted">Aucun RDV à venir</p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-bg-secondary rounded-xl border theme-border p-4">
      <h3 className="text-xs font-semibold theme-text-secondary uppercase tracking-wider mb-3">Prochains RDV</h3>
      <div className="space-y-2">
        {upcoming.map((apt) => {
          const status = STATUS_CONFIG[apt.status] || STATUS_CONFIG.a_venir;
          const isToday = apt.appointment_date === format(new Date(), 'yyyy-MM-dd');

          return (
            <button
              key={apt.id}
              type="button"
              onClick={() => onAppointmentClick(apt)}
              className={`w-full text-left p-2.5 rounded-lg border ${status.border} ${status.bg} hover:shadow-sm transition-all duration-200 group`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${status.gradient} flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm`}>
                  {getPatientInitials(apt.patient_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold theme-text-primary truncate">{apt.patient_name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock size={10} className="theme-text-muted shrink-0" />
                    <span className="text-[10px] theme-text-secondary">
                      {isToday ? "Aujourd'hui" : format(parseISO(apt.appointment_date), 'dd MMM', { locale: fr })} · {apt.appointment_time}
                    </span>
                  </div>
                </div>
                <ChevronRight size={12} className="theme-text-muted group-hover:theme-text-secondary transition-colors shrink-0" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

UpcomingAppointments.displayName = 'UpcomingAppointments';

// Mini Calendar
const MiniCalendar: React.FC<{
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  appointments: Appointment[];
}> = React.memo(({ selectedDate, onDateSelect, appointments }) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    const startDayOfWeek = getDay(start);
    const prefixDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const previousMonthDays = Array.from({ length: prefixDays }, (_, i) =>
      addDays(start, -(prefixDays - i))
    );

    return [...previousMonthDays, ...days];
  }, [currentMonth]);

  const appointmentDates = useMemo(() => {
    const dates = new Map<string, number>();
    appointments.forEach(apt => {
      const d = apt.appointment_date;
      dates.set(d, (dates.get(d) || 0) + 1);
    });
    return dates;
  }, [appointments]);

  const getCount = useCallback((date: Date) => {
    return appointmentDates.get(format(date, 'yyyy-MM-dd')) || 0;
  }, [appointmentDates]);

  return (
    <div className="theme-bg-secondary rounded-xl border theme-border p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
          aria-label="Mois précédent"
        >
          <ChevronLeft size={15} className="theme-text-secondary" />
        </button>
        <span className="text-sm font-bold theme-text-primary capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
          aria-label="Mois suivant"
        >
          <ChevronRight size={15} className="theme-text-secondary" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1.5">
        {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map(day => (
          <div key={day} className="text-[10px] theme-text-muted text-center font-semibold py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {monthDays.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isDateToday(day);
          const count = getCount(day);

          return (
            <button
              key={index}
              type="button"
              onClick={() => onDateSelect(day)}
              className={`
                relative w-8 h-8 text-xs rounded-lg transition-all duration-150 font-medium
                ${!isCurrentMonth ? 'theme-text-muted' : 'theme-text-primary hover:bg-[var(--bg-tertiary)]'}
                ${isSelected ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 hover:bg-cyan-700' : ''}
                ${isToday && !isSelected ? 'bg-cyan-500/10 text-cyan-600 font-bold ring-1 ring-cyan-500/30' : ''}
              `}
            >
              {format(day, 'd')}
              {count > 0 && !isSelected && (
                <span className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex gap-px`}>
                  {count <= 3 ? (
                    Array.from({ length: count }).map((_, i) => (
                      <span key={i} className="w-1 h-1 bg-cyan-500 rounded-full" />
                    ))
                  ) : (
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});

MiniCalendar.displayName = 'MiniCalendar';

// Filter Dropdown
const FilterDropdown: React.FC<{
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}> = ({ filters, onFiltersChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
    value,
    label: config.label,
    dot: config.dot,
  }));

  const hasActiveFilters = filters.status.length > 0 || filters.type.length > 0;

  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: newStatus });
  };

  const clearFilters = () => {
    onFiltersChange({ status: [], type: [] });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm font-medium ${
          hasActiveFilters
            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-500'
            : 'bg-[var(--bg-secondary)] border-[var(--border-color)] theme-text-secondary hover:border-[var(--border-color)]'
        }`}
      >
        <Filter size={14} />
        <span className="hidden sm:inline">Filtres</span>
        {hasActiveFilters && (
          <span className="w-5 h-5 bg-cyan-600 text-white rounded-full text-xs flex items-center justify-center font-bold">
            {filters.status.length + filters.type.length}
          </span>
        )}
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] shadow-xl z-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold theme-text-primary">Filtrer par statut</span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  Réinitialiser
                </button>
              )}
            </div>
            <div className="space-y-1">
              {statusOptions.map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-input)] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.status.includes(option.value)}
                    onChange={() => toggleStatus(option.value)}
                    className="w-4 h-4 rounded border-[var(--border-color)] text-cyan-600 focus:ring-cyan-500"
                  />
                  <div className={`w-2.5 h-2.5 rounded-full ${option.dot}`} />
                  <span className="text-sm theme-text-primary font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Monthly View
const MonthlyView: React.FC<{
  currentMonth: Date;
  appointments: Appointment[];
  onDateClick: (date: Date) => void;
  onAppointmentClick: (apt: Appointment) => void;
}> = React.memo(({ currentMonth, appointments, onDateClick, onAppointmentClick }) => {
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    const startDayOfWeek = getDay(start);
    const prefixDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    const previousMonthDays = Array.from({ length: prefixDays }, (_, i) =>
      addDays(start, -(prefixDays - i))
    );

    const totalDays = [...previousMonthDays, ...days];
    const remainingDays = 42 - totalDays.length;
    const nextMonthDays = Array.from({ length: remainingDays }, (_, i) =>
      addDays(end, i + 1)
    );

    return [...totalDays, ...nextMonthDays];
  }, [currentMonth]);

  const getAppointmentsForDate = useCallback((date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.appointment_date === dateStr);
  }, [appointments]);

  return (
    <div className="theme-bg-secondary rounded-2xl border theme-border overflow-hidden shadow-sm">
      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-[var(--border-color)]">
        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => (
          <div key={day} className="p-3 text-center text-xs font-bold theme-text-secondary uppercase tracking-wider bg-[var(--bg-input)] border-r border-[var(--border-color)] last:border-r-0">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.slice(0, 3)}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {monthDays.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isDateToday(day);
          const dayAppointments = getAppointmentsForDate(day);

          return (
            <div
              key={index}
              onClick={() => onDateClick(day)}
              className={`
                min-h-[80px] sm:min-h-[110px] p-1.5 sm:p-2 border-r border-b border-[var(--border-color)]/50 last:border-r-0 cursor-pointer transition-all duration-150
                ${!isCurrentMonth ? 'bg-[var(--bg-input)]/30' : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]/50'}
                ${isToday ? 'bg-cyan-500/5' : ''}
              `}
            >
              <div className={`
                w-7 h-7 flex items-center justify-center rounded-full mb-1.5 text-xs font-semibold transition-colors
                ${isToday ? 'bg-cyan-600 text-white shadow-sm' : isCurrentMonth ? 'theme-text-primary' : 'theme-text-muted'}
              `}>
                {format(day, 'd')}
              </div>

              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map(apt => {
                  const status = STATUS_CONFIG[apt.status] || STATUS_CONFIG.a_venir;
                  return (
                    <div
                      key={apt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(apt);
                      }}
                      className={`bg-gradient-to-r ${status.gradient} text-white text-[10px] px-2 py-0.5 rounded-md truncate cursor-pointer hover:shadow-md transition-shadow font-medium`}
                    >
                      {apt.appointment_time} {apt.patient_name.split(' ')[0]}
                    </div>
                  );
                })}
                {dayAppointments.length > 3 && (
                  <div className="text-[10px] text-cyan-600 font-bold px-1">
                    +{dayAppointments.length - 3} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

MonthlyView.displayName = 'MonthlyView';

// Day View
const DayView: React.FC<{
  selectedDate: Date;
  appointments: Appointment[];
  onSlotClick: (hour: number) => void;
  onAppointmentClick: (apt: Appointment) => void;
}> = React.memo(({ selectedDate, appointments, onSlotClick, onAppointmentClick }) => {
  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8);

  const dayAppointments = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.appointment_date === dateStr);
  }, [appointments, selectedDate]);

  return (
    <div className="theme-bg-secondary rounded-2xl border theme-border overflow-hidden shadow-sm">
      {/* Day Header */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-emerald-500/10 border-b border-[var(--border-color)] p-3 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold theme-text-primary capitalize">
              {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </h3>
            <p className="text-sm theme-text-secondary mt-0.5 flex items-center gap-1.5">
              <Stethoscope size={14} />
              {dayAppointments.length} rendez-vous programmé{dayAppointments.length > 1 ? 's' : ''}
            </p>
          </div>
          {isDateToday(selectedDate) && (
            <span className="px-3 py-1 bg-cyan-600 text-white text-xs font-bold rounded-full shadow-sm">
              Aujourd'hui
            </span>
          )}
        </div>
      </div>

      {/* Time Slots */}
      <div className="relative">
        <CurrentTimeIndicator startHour={8} />

        {timeSlots.map((hour) => {
          const hourAppointments = dayAppointments.filter((apt) => {
            const aptHour = parseInt(apt.appointment_time.split(':')[0]);
            return aptHour === hour;
          });

          return (
            <div
              key={hour}
              className="flex border-b border-[var(--border-color)]/50 min-h-[80px] group/slot"
            >
              <div className="w-20 flex-shrink-0 p-3 text-right border-r border-[var(--border-color)] bg-[var(--bg-input)]/50">
                <span className="text-xs font-semibold theme-text-muted">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>

              <div
                className="flex-1 p-2 relative cursor-pointer hover:bg-[var(--bg-tertiary)]/50 transition-colors"
                onClick={() => onSlotClick(hour)}
              >
                {hourAppointments.map((appointment) => {
                  const status = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.a_venir;
                  return (
                    <div
                      key={appointment.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(appointment);
                      }}
                      className={`bg-gradient-to-r ${status.gradient} text-white rounded-xl p-3.5 shadow-lg hover:shadow-xl transition-all cursor-pointer border-l-4 border-l-white/30 mb-2`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)]/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                          <span className="text-sm font-bold">{getPatientInitials(appointment.patient_name)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm truncate">{appointment.patient_name}</div>
                          <div className="text-xs opacity-80 truncate mt-0.5">{appointment.motif || 'Consultation générale'}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 text-xs font-semibold">
                            <Clock size={12} />
                            <span>{appointment.appointment_time}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs opacity-80 mt-0.5">
                            <Timer size={12} />
                            <span>{appointment.duration || 30} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {hourAppointments.length === 0 && (
                  <div className="h-full flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-opacity duration-200">
                    <div className="flex items-center gap-2 theme-text-muted text-xs font-medium bg-[var(--bg-secondary)]/80 px-3 py-1.5 rounded-full border border-dashed border-[var(--border-color)]">
                      <Plus size={12} />
                      <span>Ajouter</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

DayView.displayName = 'DayView';

// Appointment Card for Week View
const AppointmentCard: React.FC<{
  appointment: Appointment;
  onClick: () => void;
  index: number;
}> = React.memo(({ appointment, onClick, index }) => {
  const status = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.a_venir;
  const height = Math.min(Math.max((appointment.duration || 30) / 60 * 76, 38), 150);

  return (
    <div
      className={`absolute inset-x-0.5 bg-gradient-to-r ${status.gradient} text-white rounded-lg p-1.5 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer border-l-[3px] border-l-white/40 z-10 overflow-hidden`}
      style={{
        height: `${height}px`,
        top: `${index * 2 + 2}px`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <div className="flex items-start gap-1.5">
        <div className="w-5 h-5 rounded-md bg-[var(--bg-secondary)]/20 flex items-center justify-center flex-shrink-0">
          <span className="text-[8px] font-bold">{getPatientInitials(appointment.patient_name)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold truncate leading-tight">{appointment.patient_name}</div>
          <div className="text-[9px] opacity-75 truncate">{appointment.appointment_time} · {appointment.duration || 30}min</div>
        </div>
      </div>
    </div>
  );
});

AppointmentCard.displayName = 'AppointmentCard';

// Main Calendar Component
const CalendarViewPage: React.FC = () => {
  const { showToast } = useToast();
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const [activeSection, setActiveSection] = useState('calendar');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<{ day: number; hour: number } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [filters, setFilters] = useState<FilterState>({ status: [], type: [] });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>();
  const [prefilledTime, setPrefilledTime] = useState<string | undefined>();

  const timeSlots = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 8), []);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    if (filters.status.length === 0 && filters.type.length === 0) {
      return appointments;
    }
    return appointments.filter(apt => {
      const statusMatch = filters.status.length === 0 || filters.status.includes(apt.status);
      const typeMatch = filters.type.length === 0 || filters.type.includes(apt.type_consultation || '');
      return statusMatch && typeMatch;
    });
  }, [appointments, filters]);

  // Stats
  const stats = useMemo(() => {
    const data = filteredAppointments;
    const upcoming = data.filter(apt => apt.status === 'a_venir').length;
    const inProgress = data.filter(apt => apt.status === 'en_cours').length;
    const completed = data.filter(apt => apt.status === 'termine').length;
    const cancelled = data.filter(apt => apt.status === 'annule').length;

    return { upcoming, inProgress, completed, cancelled, total: data.length };
  }, [filteredAppointments]);

  const fetchAppointments = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      let startDate: string;
      let endDate: string;

      if (viewMode === 'month') {
        startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      } else {
        const weekEnd = addDays(currentWeekStart, 6);
        startDate = format(currentWeekStart, 'yyyy-MM-dd');
        endDate = format(weekEnd, 'yyyy-MM-dd');
      }

      if (isDemoMode) {
        const demoData = convertDemoAppointments(centralDemoAppointments);
        const filteredData = demoData.filter(apt =>
          apt.appointment_date >= startDate && apt.appointment_date <= endDate
        );
        setAppointments(filteredData);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .gte('appointment_date', startDate)
        .lte('appointment_date', endDate)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (fetchError) throw fetchError;

      setAppointments((data || []).map(apt => ({ ...apt, status: normalizeStatus(apt.status) })));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentWeekStart, currentMonth, viewMode, isDemoMode]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const getWeekDays = useCallback((): DaySchedule[] => {
    const days: DaySchedule[] = [];

    for (let i = 0; i < 7; i++) {
      const date = addDays(currentWeekStart, i);
      const dateString = format(date, 'yyyy-MM-dd');

      const dayAppointments = filteredAppointments.filter(apt =>
        apt.appointment_date === dateString
      );

      days.push({
        date,
        dateString,
        dayName: format(date, 'EEE', { locale: fr }),
        appointments: dayAppointments,
      });
    }

    return days;
  }, [currentWeekStart, filteredAppointments]);

  const weekDays = useMemo(() => getWeekDays(), [getWeekDays]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
    setCurrentMonth(startOfMonth(today));
    setSelectedDay(today);
  }, []);

  const previousPeriod = useCallback(() => {
    if (viewMode === 'month') {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else {
      setCurrentWeekStart(addDays(currentWeekStart, -7));
    }
  }, [viewMode, currentMonth, currentWeekStart]);

  const nextPeriod = useCallback(() => {
    if (viewMode === 'month') {
      setCurrentMonth(addMonths(currentMonth, 1));
    } else {
      setCurrentWeekStart(addDays(currentWeekStart, 7));
    }
  }, [viewMode, currentMonth, currentWeekStart]);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDay(date);
    setCurrentWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
    setCurrentMonth(startOfMonth(date));
    if (viewMode === 'month') {
      setViewMode('day');
    }
  }, [viewMode]);

  const handleSlotClick = useCallback((day: DaySchedule | Date, hour: number) => {
    const date = day instanceof Date ? day : day.date;
    setPrefilledDate(format(date, 'yyyy-MM-dd'));
    setPrefilledTime(`${hour.toString().padStart(2, '0')}:00`);
    setShowAddModal(true);
  }, []);

  const handleAppointmentClick = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  }, []);

  const handleEditAppointment = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowEditModal(true);
    setShowDetailModal(false);
  }, []);

  const handleStatClick = useCallback((status: string) => {
    if (status === 'total') {
      setFilters({ status: [], type: [] });
    } else {
      setFilters(prev => ({
        ...prev,
        status: prev.status.includes(status)
          ? prev.status.filter(s => s !== status)
          : [status]
      }));
    }
  }, []);

  const getPeriodLabel = () => {
    if (viewMode === 'month') {
      return format(currentMonth, 'MMMM yyyy', { locale: fr });
    } else if (viewMode === 'day') {
      return format(selectedDay, 'EEEE d MMMM yyyy', { locale: fr });
    }
    return `${format(currentWeekStart, 'dd MMM', { locale: fr })} — ${format(addDays(currentWeekStart, 6), 'dd MMM yyyy', { locale: fr })}`;
  };

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-screen theme-bg-primary transition-colors duration-300">
        <MedicalSidebarRefined activeItem={activeSection} onItemClick={setActiveSection} onCollapsedChange={setSidebarCollapsed} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <header className="theme-bg-secondary border-b theme-border px-3 sm:px-4 lg:px-8 py-3 sm:py-4 z-30">
            <div className="flex items-center justify-between">
              <div className="ml-12 lg:ml-0">
                <h1 className="text-xl font-bold theme-text-primary">Calendrier</h1>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-8 bg-[var(--bg-primary)]">
            <LoadingSkeleton.Calendar />
          </main>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex min-h-screen theme-bg-primary transition-colors duration-300">
        <MedicalSidebarRefined activeItem={activeSection} onItemClick={setActiveSection} onCollapsedChange={setSidebarCollapsed} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <header className="theme-bg-secondary border-b theme-border px-3 sm:px-4 lg:px-8 py-3 sm:py-4 z-30">
            <div className="flex items-center justify-between">
              <div className="ml-12 lg:ml-0">
                <h1 className="text-xl font-bold theme-text-primary">Calendrier</h1>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-8 bg-[var(--bg-primary)]">
            <ErrorState message={error} onRetry={fetchAppointments} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen theme-bg-primary transition-colors duration-300">
      <MedicalSidebarRefined activeItem={activeSection} onItemClick={setActiveSection} onCollapsedChange={setSidebarCollapsed} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="theme-bg-secondary border-b theme-border px-3 sm:px-4 lg:px-8 py-3 sm:py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 ml-12 lg:ml-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold theme-text-primary flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <CalendarDays size={18} className="text-white" strokeWidth={2.5} />
                </div>
                Calendrier
              </h1>
              <p className="theme-text-secondary text-xs sm:text-sm mt-1 truncate capitalize">
                {viewMode === 'week' ? 'Vue hebdomadaire' : viewMode === 'day' ? 'Vue journalière' : 'Vue mensuelle'} · {getPeriodLabel()}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <DemoModeToggle isDemoMode={isDemoMode} onToggle={toggleDemoMode} size="sm" />
            </div>
          </div>
        </header>

        <DemoModeBanner isDemoMode={isDemoMode} onDisable={toggleDemoMode} />

        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto bg-[var(--bg-primary)]">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
            {/* Sidebar */}
            <div className="lg:w-[260px] flex-shrink-0 space-y-3">
              <MiniCalendar
                selectedDate={selectedDay}
                onDateSelect={handleDateSelect}
                appointments={appointments}
              />

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                <StatCard
                  icon={CalendarDays}
                  label="Total"
                  value={stats.total}
                  color="blue"
                  onClick={() => handleStatClick('total')}
                  active={filters.status.length === 0}
                />
                <StatCard
                  icon={Clock}
                  label="À venir"
                  value={stats.upcoming}
                  color="purple"
                  onClick={() => handleStatClick('a_venir')}
                  active={filters.status.includes('a_venir')}
                />
                <StatCard
                  icon={Activity}
                  label="En cours"
                  value={stats.inProgress}
                  color="orange"
                  onClick={() => handleStatClick('en_cours')}
                  active={filters.status.includes('en_cours')}
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Terminés"
                  value={stats.completed}
                  color="green"
                  onClick={() => handleStatClick('termine')}
                  active={filters.status.includes('termine')}
                />
              </div>

              {/* Upcoming Appointments */}
              <UpcomingAppointments
                appointments={appointments}
                onAppointmentClick={handleAppointmentClick}
              />

              {/* Quick Add */}
              <button
                type="button"
                onClick={() => {
                  setPrefilledDate(undefined);
                  setPrefilledTime(undefined);
                  setShowAddModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-cyan-600/25 hover:shadow-cyan-600/40 active:scale-[0.98]"
              >
                <Plus size={18} strokeWidth={2.5} />
                Nouveau RDV
              </button>
            </div>

            {/* Main Calendar */}
            <div className="flex-1 min-w-0">
              {/* Calendar Header */}
              <div className="theme-bg-secondary rounded-xl border theme-border p-3 sm:p-4 mb-4 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* View Toggle */}
                    <div className="flex items-center bg-[var(--bg-tertiary)] rounded-lg p-0.5">
                      {[
                        { mode: 'day' as ViewMode, icon: List, label: 'Jour' },
                        { mode: 'week' as ViewMode, icon: LayoutGrid, label: 'Semaine' },
                        { mode: 'month' as ViewMode, icon: CalendarIcon, label: 'Mois' },
                      ].map(({ mode, icon: Icon, label }) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setViewMode(mode)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all text-xs font-semibold ${
                            viewMode === mode
                              ? 'bg-[var(--bg-secondary)] theme-text-primary shadow-sm'
                              : 'theme-text-secondary hover:theme-text-primary'
                          }`}
                        >
                          <Icon size={14} />
                          <span className="hidden sm:inline">{label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={previousPeriod}
                        className="p-1.5 hover:bg-[var(--bg-input)] rounded-md transition-colors"
                        aria-label="Période précédente"
                      >
                        <ChevronLeft size={16} className="theme-text-secondary" />
                      </button>
                      <button
                        type="button"
                        onClick={goToToday}
                        className="px-2 sm:px-3 py-1.5 text-xs font-semibold theme-text-primary hover:bg-[var(--bg-input)] rounded-md transition-colors"
                      >
                        Aujourd'hui
                      </button>
                      <button
                        type="button"
                        onClick={nextPeriod}
                        className="p-1.5 hover:bg-[var(--bg-input)] rounded-md transition-colors"
                        aria-label="Période suivante"
                      >
                        <ChevronRight size={16} className="theme-text-secondary" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FilterDropdown filters={filters} onFiltersChange={setFilters} />
                    <button
                      type="button"
                      onClick={() => fetchAppointments(true)}
                      disabled={refreshing}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-input)] theme-text-secondary hover:theme-text-primary rounded-lg transition-all text-xs font-semibold disabled:opacity-50"
                    >
                      <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                      <span className="hidden sm:inline">Actualiser</span>
                    </button>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border-color)] flex-wrap">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                      <span className="theme-text-secondary text-[11px] font-medium">{config.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar Content */}
              {viewMode === 'month' ? (
                <MonthlyView
                  currentMonth={currentMonth}
                  appointments={filteredAppointments}
                  onDateClick={handleDateSelect}
                  onAppointmentClick={handleAppointmentClick}
                />
              ) : viewMode === 'day' ? (
                <DayView
                  selectedDate={selectedDay}
                  appointments={filteredAppointments}
                  onSlotClick={(hour) => handleSlotClick(selectedDay, hour)}
                  onAppointmentClick={handleAppointmentClick}
                />
              ) : (
                /* Week View */
                <div className="theme-bg-secondary rounded-2xl border theme-border overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                      {/* Day Headers */}
                      <div className="grid grid-cols-8 border-b border-[var(--border-color)]">
                        <div className="p-3 bg-[var(--bg-input)] border-r border-[var(--border-color)] flex items-center justify-center">
                          <Clock size={16} className="theme-text-muted" />
                        </div>
                        {weekDays.map((day, index) => {
                          const isToday = isSameDay(day.date, new Date());
                          const isSelected = isSameDay(day.date, selectedDay);
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setSelectedDay(day.date);
                                setViewMode('day');
                              }}
                              className={`p-2 sm:p-3 text-center border-r border-[var(--border-color)] transition-all duration-150 ${
                                isToday ? 'bg-cyan-500/10' : isSelected ? 'bg-[var(--bg-tertiary)]' : 'bg-[var(--bg-input)]/50 hover:bg-[var(--bg-input)]'
                              }`}
                            >
                              <div className="text-[10px] font-bold theme-text-muted uppercase tracking-wider">{day.dayName}</div>
                              <div className={`text-lg font-bold mt-0.5 ${isToday ? 'text-cyan-600' : 'theme-text-primary'}`}>
                                {format(day.date, 'dd')}
                              </div>
                              {day.appointments.length > 0 && (
                                <div className={`text-[10px] font-bold mt-0.5 ${isToday ? 'text-cyan-500' : 'theme-text-muted'}`}>
                                  {day.appointments.length} RDV
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Time Grid */}
                      <div className="relative">
                        <CurrentTimeIndicator startHour={8} />

                        {timeSlots.map((hour) => (
                          <div key={hour} className="grid grid-cols-8 border-b border-[var(--border-color)]/50">
                            <div className="p-2 bg-[var(--bg-input)]/50 border-r border-[var(--border-color)] text-center sticky left-0">
                              <span className="text-[11px] font-semibold theme-text-muted">
                                {hour.toString().padStart(2, '0')}:00
                              </span>
                            </div>

                            {weekDays.map((day, dayIndex) => {
                              const hourAppointments = day.appointments.filter((apt) => {
                                const aptHour = parseInt(apt.appointment_time.split(':')[0]);
                                return aptHour === hour;
                              });

                              const isSelected = isSameDay(day.date, selectedDay);
                              const isToday = isSameDay(day.date, new Date());

                              return (
                                <div
                                  key={dayIndex}
                                  className={`relative border-r border-[var(--border-color)]/50 h-20 transition-colors group cursor-pointer ${
                                    isToday ? 'bg-cyan-500/5' : isSelected ? 'bg-[var(--bg-input)]/50' : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-input)]/50'
                                  }`}
                                  onMouseEnter={() => setHoveredSlot({ day: dayIndex, hour })}
                                  onMouseLeave={() => setHoveredSlot(null)}
                                  onClick={() => handleSlotClick(day, hour)}
                                >
                                  {hourAppointments.map((appointment, aptIndex) => (
                                    <AppointmentCard
                                      key={appointment.id}
                                      appointment={appointment}
                                      onClick={() => handleAppointmentClick(appointment)}
                                      index={aptIndex}
                                    />
                                  ))}

                                  {hoveredSlot?.day === dayIndex && hoveredSlot?.hour === hour && hourAppointments.length === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                      <div className="bg-cyan-500 text-white p-1.5 rounded-full shadow-lg shadow-cyan-500/30 hover:scale-110 transition-transform">
                                        <Plus size={12} strokeWidth={3} />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddAppointmentModal
          onClose={() => {
            setShowAddModal(false);
            setPrefilledDate(undefined);
            setPrefilledTime(undefined);
          }}
          onSuccess={() => {
            setShowAddModal(false);
            setPrefilledDate(undefined);
            setPrefilledTime(undefined);
            showToast({
              type: 'success',
              title: 'Rendez-vous créé',
              message: 'Le nouveau rendez-vous a été ajouté au calendrier'
            });
            fetchAppointments();
          }}
          prefilledDate={prefilledDate}
          prefilledTime={prefilledTime}
        />
      )}

      {showDetailModal && selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAppointment(null);
          }}
          onEdit={() => handleEditAppointment(selectedAppointment)}
        />
      )}

      {showEditModal && selectedAppointment && (
        <EditAppointmentModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAppointment(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedAppointment(null);
            showToast({
              type: 'success',
              title: 'Rendez-vous modifié',
              message: 'Les modifications ont été enregistrées'
            });
            fetchAppointments();
          }}
        />
      )}
    </div>
  );
};

export default CalendarViewPage;
