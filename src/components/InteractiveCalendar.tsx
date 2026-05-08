import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, User } from 'lucide-react';

interface Appointment {
  id: string;
  title: string;
  patient: string;
  time: string;
  duration: number;
  type: 'checkup' | 'followup' | 'consultation' | 'treatment';
  doctor: string;
}

interface DaySchedule {
  date: string;
  dayName: string;
  appointments: Appointment[];
}

const InteractiveCalendar: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [hoveredSlot, setHoveredSlot] = useState<{ day: number; hour: number } | null>(null);

  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8);

  const getWeekDays = (startDate: Date): DaySchedule[] => {
    const days: DaySchedule[] = [];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const daySchedule: DaySchedule = {
        date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        dayName: dayNames[date.getDay()],
        appointments: generateMockAppointments(i),
      };
      days.push(daySchedule);
    }

    return days;
  };

  const generateMockAppointments = (dayIndex: number): Appointment[] => {
    const appointments: Appointment[] = [];

    if (dayIndex === 1) {
      appointments.push({
        id: '1',
        title: 'Checkup annuel',
        patient: 'Jean Dupont',
        time: '09:00',
        duration: 60,
        type: 'checkup',
        doctor: 'Dr. Martin',
      });
      appointments.push({
        id: '2',
        title: 'Consultation',
        patient: 'Marie Leblanc',
        time: '14:00',
        duration: 30,
        type: 'consultation',
        doctor: 'Dr. Martin',
      });
    }

    if (dayIndex === 2) {
      appointments.push({
        id: '3',
        title: 'Suivi diabète',
        patient: 'Pierre Moreau',
        time: '10:30',
        duration: 45,
        type: 'followup',
        doctor: 'Dr. Dubois',
      });
      appointments.push({
        id: '4',
        title: 'Traitement',
        patient: 'Sophie Bernard',
        time: '16:00',
        duration: 60,
        type: 'treatment',
        doctor: 'Dr. Martin',
      });
    }

    if (dayIndex === 3) {
      appointments.push({
        id: '5',
        title: 'Consultation urgente',
        patient: 'Luc Petit',
        time: '11:00',
        duration: 30,
        type: 'consultation',
        doctor: 'Dr. Martin',
      });
    }

    if (dayIndex === 4) {
      appointments.push({
        id: '6',
        title: 'Checkup cardiaque',
        patient: 'Anne Dubois',
        time: '09:30',
        duration: 90,
        type: 'checkup',
        doctor: 'Dr. Dubois',
      });
      appointments.push({
        id: '7',
        title: 'Suivi post-op',
        patient: 'Marc Rousseau',
        time: '15:00',
        duration: 45,
        type: 'followup',
        doctor: 'Dr. Martin',
      });
    }

    return appointments;
  };

  const weekDays = getWeekDays(currentWeekStart);

  const previousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const getAppointmentColor = (type: string) => {
    switch (type) {
      case 'checkup':
        return 'bg-blue-500 border-blue-600';
      case 'followup':
        return 'bg-green-500 border-green-600';
      case 'consultation':
        return 'bg-violet-500 border-violet-600';
      case 'treatment':
        return 'bg-amber-500 border-amber-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const getAppointmentPosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const slotIndex = hours - 8;
    const minuteOffset = (minutes / 60) * 100;
    return slotIndex * 100 + minuteOffset;
  };

  const appointmentTypes = [
    { type: 'checkup', label: 'Checkup', color: 'bg-blue-500' },
    { type: 'followup', label: 'Follow-up', color: 'bg-green-500' },
    { type: 'consultation', label: 'Consultation', color: 'bg-violet-500' },
    { type: 'treatment', label: 'Treatment', color: 'bg-amber-500' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-violet-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Calendrier hebdomadaire</h2>
            <p className="text-white/80 text-sm mt-1">Planification des rendez-vous</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={previousWeek}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-white font-medium min-w-[140px] text-center">
              Semaine du {weekDays[0].date}
            </span>
            <button
              onClick={nextWeek}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 flex-wrap">
          <span className="text-white/80 text-sm font-medium">Légende:</span>
          {appointmentTypes.map((type) => (
            <div key={type.type} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${type.color}`} />
              <span className="text-white/80 text-sm">{type.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px] sm:min-w-[900px]">
          <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
              <Clock size={20} className="text-gray-500 dark:text-gray-400 mx-auto" />
            </div>
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`p-4 text-center border-r border-gray-200 dark:border-gray-700 ${
                  index === new Date().getDay()
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div className="font-bold text-gray-900 dark:text-white">{day.dayName}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{day.date}</div>
              </div>
            ))}
          </div>

          <div className="relative">
            {timeSlots.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 text-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {hour}:00
                  </span>
                </div>

                {weekDays.map((day, dayIndex) => {
                  const dayAppointments = day.appointments.filter((apt) => {
                    const aptHour = parseInt(apt.time.split(':')[0]);
                    return aptHour === hour;
                  });

                  return (
                    <div
                      key={dayIndex}
                      className="relative border-r border-gray-200 dark:border-gray-700 h-24 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                      onMouseEnter={() => setHoveredSlot({ day: dayIndex, hour })}
                      onMouseLeave={() => setHoveredSlot(null)}
                    >
                      {dayAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className={`absolute inset-x-1 ${getAppointmentColor(
                            appointment.type
                          )} text-white rounded-lg p-2 shadow-md hover:shadow-lg transition-all cursor-pointer border-l-4 z-10`}
                          style={{
                            height: `${(appointment.duration / 60) * 96}px`,
                            top: '2px',
                          }}
                        >
                          <div className="text-xs font-bold truncate">{appointment.title}</div>
                          <div className="text-xs opacity-90 truncate flex items-center gap-1 mt-1">
                            <User size={10} />
                            {appointment.patient}
                          </div>
                          <div className="text-xs opacity-80 mt-1">
                            {appointment.time} ({appointment.duration}min)
                          </div>
                        </div>
                      ))}

                      {hoveredSlot?.day === dayIndex && hoveredSlot?.hour === hour && (
                        <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500/10">
                          <div className="bg-blue-500 text-white p-2 rounded-full shadow-lg">
                            <Plus size={20} />
                          </div>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            Total: {weekDays.reduce((sum, day) => sum + day.appointments.length, 0)} rendez-vous cette semaine
          </span>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium">
            <Plus size={16} />
            Nouveau rendez-vous
          </button>
        </div>
      </div>
    </div>
  );
};

export default InteractiveCalendar;
