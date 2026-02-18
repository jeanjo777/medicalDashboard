import React, { useState } from 'react';
import MedicalSidebarRefined from '../components/MedicalSidebarRefined';
import { Search, Bell, Moon, Plus, Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';

interface Appointment {
  id: string;
  patientInitials: string;
  patientName: string;
  time: string;
  type: 'Checkup' | 'Follow-up' | 'Consultation' | 'Treatment';
  department: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const AppointmentsViewPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('appointments');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [currentDate] = useState(new Date(2025, 9, 28));

  const appointments: Appointment[] = [
    {
      id: '1',
      patientInitials: 'SJ',
      patientName: 'Sarah Johnson',
      time: '09:00 AM',
      type: 'Checkup',
      department: 'Cardiology',
      status: 'scheduled'
    },
    {
      id: '2',
      patientInitials: 'MC',
      patientName: 'Michael Chen',
      time: '10:30 AM',
      type: 'Follow-up',
      department: 'Diabetes Care',
      status: 'scheduled'
    },
    {
      id: '3',
      patientInitials: 'ED',
      patientName: 'Emma Davis',
      time: '11:15 AM',
      type: 'Consultation',
      department: 'Physiotherapy',
      status: 'scheduled'
    },
    {
      id: '4',
      patientInitials: 'JW',
      patientName: 'James Wilson',
      time: '02:00 PM',
      type: 'Treatment',
      department: 'Orthopedics',
      status: 'scheduled'
    },
    {
      id: '5',
      patientInitials: 'OM',
      patientName: 'Olivia Martinez',
      time: '03:30 PM',
      type: 'Checkup',
      department: 'Neurology',
      status: 'scheduled'
    },
    {
      id: '6',
      patientInitials: 'WB',
      patientName: 'William Brown',
      time: '04:15 PM',
      type: 'Follow-up',
      department: 'Cardiology',
      status: 'scheduled'
    }
  ];

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
                    <p className="text-xs text-gray-500 mb-1">Aujourd'hui</p>
                    <p className="text-2xl font-bold text-gray-800">42</p>
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
                    <p className="text-2xl font-bold text-gray-800">8</p>
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
                    <p className="text-2xl font-bold text-gray-800">34</p>
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
              <h2 className="text-lg font-semibold text-gray-800">Rendez-vous du jour</h2>
              <p className="text-sm text-gray-500 mt-0.5">{appointments.length} rendez-vous programmés</p>
            </div>

            {/* Appointments Table */}
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
                          <span className="text-sm font-medium text-gray-700">{appointment.time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {appointment.patientInitials}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{appointment.patientName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColor(appointment.type)}`}>
                          {appointment.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{appointment.department}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                          Programmé
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppointmentsViewPage;
