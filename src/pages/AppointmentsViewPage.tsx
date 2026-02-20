import React, { useState, useEffect } from 'react';
import MedicalSidebarRefined from '../components/MedicalSidebarRefined';
import { Search, Bell, Moon, Plus, Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Appointment {
  id: string;
  patient_name?: string;
  patientName?: string;
  patientInitials?: string;
  appointment_date?: string;
  appointment_time?: string;
  time?: string;
  type?: string;
  appointment_type?: string;
  department?: string;
  status?: string;
  [key: string]: any;
}

const AppointmentsViewPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('appointments');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [currentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: false })
        .limit(50);

      if (fetchError) {
        console.error('Error fetching appointments:', fetchError);
        setError('Erreur lors du chargement des rendez-vous.');
      } else if (data) {
        setAppointments(data);
      }
      setLoading(false);
    };
    fetchAppointments();
  }, []);

  const getPatientName = (apt: Appointment): string => {
    return apt.patient_name || apt.patientName || 'Patient inconnu';
  };

  const getPatientInitials = (apt: Appointment): string => {
    if (apt.patientInitials) return apt.patientInitials;
    const name = getPatientName(apt);
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAppointmentTime = (apt: Appointment): string => {
    if (apt.time) return apt.time;
    if (apt.appointment_time) return apt.appointment_time;
    if (apt.appointment_date) {
      const date = new Date(apt.appointment_date);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return '--:--';
  };

  const getAppointmentType = (apt: Appointment): string => {
    return apt.type || apt.appointment_type || 'Consultation';
  };

  const getStatusLabel = (apt: Appointment): string => {
    const status = apt.status || 'scheduled';
    switch (status) {
      case 'scheduled': return 'Programmé';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      case 'confirmed': return 'Confirmé';
      default: return status;
    }
  };

  const getStatusColor = (apt: Appointment): string => {
    const status = apt.status || 'scheduled';
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Checkup':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Follow-up':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Consultation':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Treatment':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      {/* Sidebar */}
      <MedicalSidebarRefined
        activeItem={activeSection}
        onItemClick={setActiveSection}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top Header */}
        <header className="bg-[#1e293b] border-b border-[#334155] px-3 sm:px-4 lg:px-6 py-2 sm:py-3 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 lg:ml-0 ml-14">
              <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-white">Rendez-vous</h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5 truncate">Bienvenue, Dr. Anderson</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-64 pl-9 pr-4 py-2 bg-[#0f172a] border border-[#334155] rounded-xl text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-[#334155] rounded-lg transition-colors">
                <Bell size={20} className="text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* User Avatar */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#334155] rounded-lg">
                <span className="text-sm font-medium text-white">DA</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 bg-[#f5f4f0]">
          {/* Calendar Header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={24} className="text-emerald-500" />
                  <h2 className="text-lg font-semibold text-gray-800">Aperçu du Calendrier</h2>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                  <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronLeft size={16} className="text-gray-600" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 min-w-[200px] text-center">
                    {formatDate(currentDate)}
                  </span>
                  <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronRight size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-emerald-500/25">
                <Plus size={16} />
                Nouveau RDV
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total</p>
                    <p className="text-2xl font-bold text-gray-800">{appointments.length}</p>
                    <p className="text-xs text-gray-500 mt-1">rendez-vous</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CalendarIcon className="text-white" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">En cours</p>
                    <p className="text-2xl font-bold text-gray-800">{appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length}</p>
                    <p className="text-xs text-gray-500 mt-1">consultations</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="text-white" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Terminés</p>
                    <p className="text-2xl font-bold text-gray-800">{appointments.filter(a => a.status === 'completed').length}</p>
                    <p className="text-xs text-gray-500 mt-1">patients</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <User className="text-white" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Section Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
              <h2 className="text-lg font-semibold text-gray-800">Rendez-vous</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {loading ? 'Chargement...' : `${appointments.length} rendez-vous trouvés`}
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">Chargement des rendez-vous...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-sm text-red-500 mb-2">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && appointments.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <CalendarIcon size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Aucun rendez-vous trouvé.</p>
                </div>
              </div>
            )}

            {/* Appointments Table */}
            {!loading && !error && appointments.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Heure
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {appointments.map((appointment) => (
                      <tr
                        key={appointment.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">{getAppointmentTime(appointment)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {getPatientInitials(appointment)}
                            </div>
                            <span className="text-sm font-medium text-gray-800">{getPatientName(appointment)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColor(getAppointmentType(appointment))}`}>
                            {getAppointmentType(appointment)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{appointment.department || '--'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment)}`}>
                            {getStatusLabel(appointment)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button className="px-3 py-1.5 text-xs font-medium text-emerald-600 hover:text-white hover:bg-emerald-500 rounded-lg transition-colors">
                              Voir
                            </button>
                            <button className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                              Modifier
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppointmentsViewPage;
