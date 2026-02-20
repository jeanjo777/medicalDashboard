import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import { useNavigate } from 'react-router-dom';
import MedicalSidebarRefined from '../components/MedicalSidebarRefined';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import Pagination from '../components/Common/Pagination';
import AddAppointmentModal from '../components/Appointments/AddAppointmentModal';
import AppointmentDetailModal from '../components/Appointments/AppointmentDetailModal';
import EditAppointmentModal from '../components/Appointments/EditAppointmentModal';
import ExportButton from '../components/Common/ExportButton';
import ErrorBoundary from '../components/ErrorBoundary';
import { useToast } from '../components/Common/Toast';
import { useAppointmentsQuery } from '../hooks/useAppointmentsQuery';
import { usePagination } from '../hooks/usePagination';
import { supabase } from '../lib/supabase';
import { normalizeAppointmentStatus } from '../utils/statusUtils';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Eye,
  Edit2,
  XCircle,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Timer,
  Stethoscope,
  Activity,
  CalendarX,
  PlayCircle
} from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, addDays, subDays } from 'date-fns';
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

// Stat Card Component
const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  onClick?: () => void;
  active?: boolean;
}> = ({ icon: Icon, label, value, color, onClick, active }) => {
  const colorClasses = {
    blue: { gradient: 'from-blue-500 to-blue-600', ring: 'ring-blue-500', activeBg: 'bg-blue-500/10', activeBorder: 'border-blue-500' },
    green: { gradient: 'from-emerald-500 to-emerald-600', ring: 'ring-emerald-500', activeBg: 'bg-emerald-500/10', activeBorder: 'border-emerald-500' },
    orange: { gradient: 'from-amber-500 to-orange-600', ring: 'ring-amber-500', activeBg: 'bg-amber-500/10', activeBorder: 'border-amber-500' },
    red: { gradient: 'from-red-500 to-rose-600', ring: 'ring-red-500', activeBg: 'bg-red-500/10', activeBorder: 'border-red-500' },
    purple: { gradient: 'from-purple-500 to-violet-600', ring: 'ring-purple-500', activeBg: 'bg-purple-500/10', activeBorder: 'border-purple-500' },
  };

  const classes = colorClasses[color];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full theme-bg-secondary rounded-xl border p-3 sm:p-4 transition-all duration-200 group hover:shadow-lg cursor-pointer text-left ${
        active
          ? `${classes.activeBorder} ring-2 ${classes.ring} ${classes.activeBg}`
          : 'theme-border hover:border-[var(--border-hover)]'
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${classes.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform flex-shrink-0`}>
          <Icon className="text-white w-4 h-4 sm:w-[22px] sm:h-[22px]" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs theme-text-muted uppercase tracking-wide font-medium truncate">{label}</p>
          <p className="text-lg sm:text-2xl font-bold theme-text-primary mt-0.5">{value}</p>
        </div>
      </div>
    </button>
  );
};

const AppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { appointments, loading, error, refetch, isRefetching } = useAppointmentsQuery();
  const [activeSection, setActiveSection] = useState('appointments');
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateFilterActive, setDateFilterActive] = useState(false);

  // Données à afficher - normaliser les statuts DB
  const displayedAppointments = useMemo(() => {
    return appointments.map(apt => ({ ...apt, status: normalizeAppointmentStatus(apt.status) }));
  }, [appointments]);

  // Stats calculation
  const stats = useMemo(() => {
    const data = displayedAppointments;
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    const todayAppointments = data.filter(apt => apt.appointment_date === todayStr);
    const upcomingAppointments = data.filter(apt => apt.status === 'a_venir');
    const completedAppointments = data.filter(apt => apt.status === 'termine');
    const cancelledAppointments = data.filter(apt => apt.status === 'annule');
    const inProgressAppointments = data.filter(apt => apt.status === 'en_cours');

    return {
      today: todayAppointments.length,
      upcoming: upcomingAppointments.length,
      completed: completedAppointments.length,
      cancelled: cancelledAppointments.length,
      inProgress: inProgressAppointments.length,
    };
  }, [displayedAppointments]);

  // Gestion du clic sur les stats pour filtrer
  const handleStatClick = (filter: string) => {
    if (filter === 'today') {
      setDateFilterActive(true);
      setSelectedDate(new Date());
      setStatusFilter('all');
    } else {
      setDateFilterActive(false);
      setStatusFilter(filter === statusFilter ? 'all' : filter);
    }
  };

  // Pagination
  const pagination = usePagination({
    totalItems: filteredAppointments.length,
    initialPage: 1,
    initialPageSize: 20,
  });

  // Paginated appointments
  const paginatedAppointments = useMemo(() => {
    return filteredAppointments.slice(pagination.startIndex, pagination.endIndex);
  }, [filteredAppointments, pagination.startIndex, pagination.endIndex]);

  // Reset to first page when filters change
  useEffect(() => {
    pagination.goToPage(1);
  }, [searchTerm, statusFilter, typeFilter]);


  const filterAndSortAppointments = useCallback(() => {
    const dataSource = appointments;
    let filtered = [...dataSource];

    // Filtre par date sélectionnée si activé
    if (dateFilterActive) {
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      filtered = filtered.filter(apt => apt.appointment_date === selectedDateStr);
    }

    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patient_phone.includes(searchTerm) ||
        apt.patient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.motif?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(apt => apt.type_consultation === typeFilter);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`);
      const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`);
      return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter, typeFilter, sortOrder, selectedDate, dateFilterActive]);

  useEffect(() => {
    filterAndSortAppointments();
  }, [filterAndSortAppointments]);

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowEditModal(true);
  };

  const [cancelReason, setCancelReason] = useState('');

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelReason('');
    setShowConfirmDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointment) return;

    const reason = cancelReason.trim() || 'Annulé par le médecin';
    setCancelLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          status: 'annule',
          cancelled_at: new Date().toISOString(),
          cancelled_reason: reason
        })
        .eq('id', selectedAppointment.id);

      if (updateError) {
        showToast({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible d\'annuler le rendez-vous'
        });
        return;
      }

      showToast({
        type: 'success',
        title: 'Rendez-vous annulé',
        message: `Le rendez-vous de ${selectedAppointment.patient_name} a été annulé`
      });

      setShowConfirmDialog(false);
      setSelectedAppointment(null);
      refetch();
    } catch {
      showToast({
        type: 'error',
        title: 'Erreur inattendue',
        message: 'Une erreur est survenue lors de l\'annulation'
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusBadge = (rawStatus: string) => {
    const status = normalizeAppointmentStatus(rawStatus);
    const badges: Record<string, { label: string; classes: string; icon: React.ElementType }> = {
      a_venir: {
        label: 'À venir',
        classes: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        icon: Calendar
      },
      termine: {
        label: 'Terminé',
        classes: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        icon: CheckCircle2
      },
      annule: {
        label: 'Annulé',
        classes: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
        icon: XCircle
      },
      en_cours: {
        label: 'En cours',
        classes: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        icon: PlayCircle
      }
    };

    const badge = badges[status] || {
      label: status,
      classes: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
      icon: AlertCircle
    };

    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.classes}`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  const getTypeBadge = (type?: string) => {
    const types: Record<string, { label: string; classes: string }> = {
      consultation: { label: 'Consultation', classes: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
      suivi: { label: 'Suivi', classes: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' },
      urgence: { label: 'Urgence', classes: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
      controle: { label: 'Contrôle', classes: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20' },
      teleconsultation: { label: 'Téléconsultation', classes: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' }
    };

    const typeInfo = types[type?.toLowerCase() || ''] || {
      label: type || 'Consultation',
      classes: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${typeInfo.classes}`}>
        {typeInfo.label}
      </span>
    );
  };

  const getDurationBadge = (duration?: number) => {
    const mins = duration || 30;
    return (
      <span className="inline-flex items-center gap-1 text-xs theme-text-muted">
        <Timer size={12} />
        {mins} min
      </span>
    );
  };

  const getPatientInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarGradient = (name: string) => {
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-orange-500 to-rose-600',
      'from-purple-500 to-pink-600',
      'from-cyan-500 to-blue-600',
      'from-amber-500 to-orange-600',
    ];
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return "Aujourd'hui";
      if (isTomorrow(date)) return "Demain";
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch {
      return dateString;
    }
  };

  const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));
  const handleToday = () => setSelectedDate(new Date());

  if (loading) {
    return (
      <div className="flex min-h-screen theme-bg-primary transition-colors duration-300">
        <MedicalSidebarRefined activeItem={activeSection} onItemClick={setActiveSection} onCollapsedChange={setSidebarCollapsed} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <header className="theme-bg-secondary border-b theme-border px-3 sm:px-4 lg:px-8 py-3 sm:py-4 z-30 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold theme-text-primary">Rendez-vous</h1>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-8">
            <LoadingSkeleton.Dashboard />
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen theme-bg-primary transition-colors duration-300">
        <MedicalSidebarRefined activeItem={activeSection} onItemClick={setActiveSection} onCollapsedChange={setSidebarCollapsed} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <header className="theme-bg-secondary border-b theme-border px-3 sm:px-4 lg:px-8 py-3 sm:py-4 z-30 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold theme-text-primary ml-12 lg:ml-0">Rendez-vous</h1>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-8">
            <div className="theme-bg-secondary rounded-xl border border-red-500/30 p-8 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <h3 className="theme-text-primary text-lg font-semibold mb-2">Erreur de connexion</h3>
              <p className="theme-text-secondary text-sm mb-1">{error?.message || 'Une erreur est survenue'}</p>
              <p className="theme-text-muted text-xs mb-6">Vérifiez votre connexion ou réessayez</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium cursor-pointer"
                >
                  <RefreshCw size={18} />
                  Réessayer
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen theme-bg-primary transition-colors duration-300">
      <MedicalSidebarRefined activeItem={activeSection} onItemClick={setActiveSection} onCollapsedChange={setSidebarCollapsed} />

      <ErrorBoundary>
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <header className="theme-bg-secondary border-b theme-border px-3 sm:px-4 lg:px-8 py-3 sm:py-4 sticky top-0 z-30 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 lg:ml-0 ml-14">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold theme-text-primary flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                  <CalendarDays className="text-blue-500" size={22} />
                </div>
                Rendez-vous
              </h1>
              <p className="theme-text-secondary text-xs sm:text-sm mt-0.5 sm:mt-1 truncate">
                Gérez et planifiez vos consultations médicales
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 lg:p-8 overflow-auto">
          <ErrorBoundary>

          {/* Stats Cards - Cliquables pour filtrer */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
            <StatCard
              icon={CalendarDays}
              label="Aujourd'hui"
              value={stats.today}
              color="blue"
              onClick={() => handleStatClick('today')}
              active={dateFilterActive}
            />
            <StatCard
              icon={Clock}
              label="À venir"
              value={stats.upcoming}
              color="purple"
              onClick={() => handleStatClick('a_venir')}
              active={statusFilter === 'a_venir'}
            />
            <StatCard
              icon={Activity}
              label="En cours"
              value={stats.inProgress}
              color="orange"
              onClick={() => handleStatClick('en_cours')}
              active={statusFilter === 'en_cours'}
            />
            <StatCard
              icon={CheckCircle2}
              label="Terminés"
              value={stats.completed}
              color="green"
              onClick={() => handleStatClick('termine')}
              active={statusFilter === 'termine'}
            />
            <StatCard
              icon={CalendarX}
              label="Annulés"
              value={stats.cancelled}
              color="red"
              onClick={() => handleStatClick('annule')}
              active={statusFilter === 'annule'}
            />
          </div>

          {/* Main Content Card */}
          <div className="theme-bg-secondary rounded-xl border theme-border overflow-hidden transition-colors duration-300">
            <div className="px-4 sm:px-6 py-4 border-b theme-border">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left: Title & Date Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div>
                    <h2 className="theme-text-primary text-lg font-semibold flex items-center gap-2">
                      <Stethoscope size={20} className="text-blue-400" />
                      Gestion des Rendez-vous
                    </h2>
                    <p className="theme-text-secondary text-sm mt-0.5">
                      {filteredAppointments.length} rendez-vous trouvé{filteredAppointments.length > 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Date Navigator */}
                  <div className={`flex items-center gap-1 bg-[var(--bg-input)] rounded-lg p-1 border transition-all ${dateFilterActive ? 'border-blue-500 ring-1 ring-blue-500' : 'border-[var(--border-color)]'}`}>
                    <button
                      type="button"
                      onClick={() => { setDateFilterActive(true); handlePrevDay(); }}
                      className="p-2 hover:bg-[var(--bg-tertiary)] rounded-md transition-colors cursor-pointer"
                      aria-label="Jour précédent"
                    >
                      <ChevronLeft size={16} className="theme-text-muted" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateFilterActive(!dateFilterActive)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors min-w-[120px] cursor-pointer ${dateFilterActive ? 'bg-blue-600 text-white' : 'theme-text-primary hover:bg-[var(--bg-tertiary)]'}`}
                      title={dateFilterActive ? 'Cliquez pour voir tous les RDV' : 'Cliquez pour filtrer par cette date'}
                    >
                      {format(selectedDate, 'dd MMM yyyy', { locale: fr })}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDateFilterActive(true); handleNextDay(); }}
                      className="p-2 hover:bg-[var(--bg-tertiary)] rounded-md transition-colors cursor-pointer"
                      aria-label="Jour suivant"
                    >
                      <ChevronRight size={16} className="theme-text-muted" />
                    </button>
                  </div>

                  {/* Reset Filters */}
                  {(dateFilterActive || statusFilter !== 'all' || typeFilter !== 'all' || searchTerm) && (
                    <button
                      type="button"
                      onClick={() => {
                        setDateFilterActive(false);
                        setStatusFilter('all');
                        setTypeFilter('all');
                        setSearchTerm('');
                      }}
                      className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                    >
                      Réinitialiser filtres
                    </button>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => refetch()}
                    disabled={isRefetching || loading}
                    className="flex items-center gap-2 px-3 py-2 theme-bg-tertiary hover:opacity-80 theme-text-secondary hover:theme-text-primary border theme-border rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    title="Rafraîchir les rendez-vous"
                  >
                    <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
                    <span className="hidden sm:inline">Actualiser</span>
                  </button>

                  <ExportButton
                    data={filteredAppointments.map(apt => ({
                      'Patient': apt.patient_name,
                      'Email': apt.patient_email,
                      'Téléphone': apt.patient_phone,
                      'Date': apt.appointment_date,
                      'Heure': apt.appointment_time,
                      'Motif': apt.motif || 'Non spécifié',
                      'Type': apt.type_consultation || 'Consultation',
                      'Statut': apt.status,
                      'Durée': `${apt.duration || 30} min`
                    }))}
                    filename="rendez-vous"
                    title="Exporter"
                  />

                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 cursor-pointer"
                    aria-label="Créer un nouveau rendez-vous"
                  >
                    <Plus size={18} aria-hidden="true" />
                    <span className="hidden sm:inline">Nouveau RDV</span>
                    <span className="sm:hidden">Nouveau</span>
                  </button>
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted" size={18} aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Rechercher un patient, téléphone, motif..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    aria-label="Rechercher parmi les rendez-vous"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="theme-text-muted" aria-hidden="true" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors cursor-pointer"
                      aria-label="Filtrer par statut"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="a_venir">À venir</option>
                      <option value="en_cours">En cours</option>
                      <option value="termine">Terminé</option>
                      <option value="annule">Annulé</option>
                    </select>
                  </div>

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-primary transition-colors cursor-pointer"
                    aria-label="Filtrer par type"
                  >
                    <option value="all">Tous les types</option>
                    <option value="consultation">Consultation</option>
                    <option value="suivi">Suivi</option>
                    <option value="urgence">Urgence</option>
                    <option value="controle">Contrôle</option>
                    <option value="teleconsultation">Téléconsultation</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2.5 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors border border-[var(--border-color)] bg-[var(--bg-input)] cursor-pointer"
                    title={`Trier par date ${sortOrder === 'asc' ? 'décroissante' : 'croissante'}`}
                    aria-label={`Trier par date ${sortOrder === 'asc' ? 'décroissante' : 'croissante'}`}
                  >
                    <ArrowUpDown size={16} className="theme-text-muted" />
                  </button>
                </div>
              </div>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  type="appointments"
                  title={searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? "Aucun rendez-vous trouvé"
                    : undefined}
                  message={searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? "Aucun rendez-vous ne correspond à vos critères de recherche"
                    : undefined}
                  actionLabel="Créer un rendez-vous"
                  onAction={() => setShowAddModal(true)}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="theme-table-header border-b theme-border">
                      <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold theme-text-secondary uppercase tracking-wider">
                        Date/Heure
                      </th>
                      <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold theme-text-secondary uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold theme-text-secondary uppercase tracking-wider hidden md:table-cell">
                        Type
                      </th>
                      <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold theme-text-secondary uppercase tracking-wider">
                        Motif
                      </th>
                      <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold theme-text-secondary uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-semibold theme-text-secondary uppercase tracking-wider hidden lg:table-cell">
                        Contact
                      </th>
                      <th className="px-4 sm:px-6 py-3.5 text-right text-xs font-semibold theme-text-secondary uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y theme-divide">
                    {paginatedAppointments.map((appointment) => (
                      <tr
                        key={appointment.id}
                        className="theme-row-hover transition-colors duration-150 group"
                      >
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-blue-400" />
                              <span className="text-sm font-medium theme-text-primary">
                                {formatDate(appointment.appointment_date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Clock size={14} className="theme-text-muted" />
                                <span className="text-sm theme-text-secondary">
                                  {appointment.appointment_time}
                                </span>
                              </div>
                              {getDurationBadge(appointment.duration)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 bg-gradient-to-br ${getAvatarGradient(appointment.patient_name)} rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg flex-shrink-0`}>
                              {getPatientInitials(appointment.patient_name)}
                            </div>
                            <div>
                              <span className="text-sm font-medium theme-text-primary block">
                                {appointment.patient_name}
                              </span>
                              <span className="text-xs theme-text-muted lg:hidden">
                                {appointment.patient_phone}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          {getTypeBadge(appointment.type_consultation)}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className="text-sm theme-text-secondary line-clamp-2 max-w-[200px]">
                            {appointment.motif || 'Non spécifié'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(appointment.status)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <Phone size={12} className="theme-text-muted" />
                            <span className="text-sm theme-text-secondary">
                              {appointment.patient_phone}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleViewDetails(appointment)}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-150 opacity-70 group-hover:opacity-100 cursor-pointer"
                              title="Voir les détails"
                              aria-label={`Voir les détails du rendez-vous de ${appointment.patient_name}`}
                            >
                              <Eye size={18} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditAppointment(appointment)}
                              className="p-2 theme-text-muted hover:theme-text-primary hover:bg-[var(--bg-tertiary)] rounded-lg transition-all duration-150 opacity-70 group-hover:opacity-100 cursor-pointer"
                              title="Modifier"
                              aria-label={`Modifier le rendez-vous de ${appointment.patient_name}`}
                            >
                              <Edit2 size={18} aria-hidden="true" />
                            </button>
                            {appointment.status !== 'annule' && appointment.status !== 'termine' && (
                              <button
                                type="button"
                                onClick={() => handleCancelClick(appointment)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-150 opacity-70 group-hover:opacity-100 cursor-pointer"
                                title="Annuler"
                                aria-label={`Annuler le rendez-vous de ${appointment.patient_name}`}
                              >
                                <XCircle size={18} aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {filteredAppointments.length > 0 && (
              <div className="px-6 py-4 border-t theme-border">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalItems}
                  itemsPerPage={pagination.pageSize}
                  onPageChange={pagination.goToPage}
                  onPrevious={pagination.prevPage}
                  onNext={pagination.nextPage}
                />
              </div>
            )}
          </div>
          </ErrorBoundary>
        </main>
      </div>

      {showAddModal && (
        <AddAppointmentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            showToast({
              type: 'success',
              title: 'Rendez-vous créé',
              message: 'Le nouveau rendez-vous a été ajouté avec succès'
            });
            refetch();
          }}
        />
      )}

      {showDetailModal && selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAppointment(null);
          }}
          onEdit={() => {
            setShowDetailModal(false);
            setShowEditModal(true);
          }}
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
            refetch();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setSelectedAppointment(null);
        }}
        onConfirm={handleConfirmCancel}
        title="Annuler le rendez-vous"
        message={selectedAppointment
          ? `Êtes-vous sûr de vouloir annuler le rendez-vous de ${selectedAppointment.patient_name} prévu le ${formatDate(selectedAppointment.appointment_date)} à ${selectedAppointment.appointment_time} ?`
          : 'Êtes-vous sûr de vouloir annuler ce rendez-vous ?'
        }
        confirmText="Oui, annuler"
        cancelText="Non, conserver"
        variant="danger"
        loading={cancelLoading}
      >
        <div>
          <label className="block text-sm theme-text-secondary mb-1">Raison de l'annulation (optionnel)</label>
          <input
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Ex: Patient indisponible, urgence..."
            className="w-full px-3 py-2 text-sm theme-bg-input border theme-border rounded-lg theme-text-primary focus:border-primary focus:outline-none"
          />
        </div>
      </ConfirmDialog>
      </ErrorBoundary>
    </div>
  );
};

export default AppointmentsPage;
