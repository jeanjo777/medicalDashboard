import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { Clock, User } from 'lucide-react';

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
}

interface MonthViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onDateClick: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onDropAppointment?: (appointment: Appointment, newDate: string) => void;
}

const statusColors: Record<string, string> = {
  a_venir: 'bg-blue-100 border-blue-300 text-blue-800',
  en_cours: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  termine: 'bg-green-100 border-green-300 text-green-800',
  completed: 'bg-green-100 border-green-300 text-green-800',
  annule: 'bg-red-100 border-red-300 text-red-800',
  absent: 'bg-gray-100 border-gray-300 text-gray-800',
};

const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  appointments,
  onDateClick,
  onAppointmentClick,
  onDropAppointment,
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const getAppointmentsForDate = (date: Date): Appointment[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.appointment_date === dateStr);
  };

  const handleDragStart = (e: React.DragEvent, appointment: Appointment) => {
    e.dataTransfer.setData('appointment', JSON.stringify(appointment));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const appointmentData = e.dataTransfer.getData('appointment');
    if (appointmentData && onDropAppointment) {
      const appointment = JSON.parse(appointmentData) as Appointment;
      const newDate = format(date, 'yyyy-MM-dd');
      if (appointment.appointment_date !== newDate) {
        onDropAppointment(appointment, newDate);
      }
    }
  };

  const renderDays = () => {
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      const currentDay = day;
      const dayAppointments = getAppointmentsForDate(currentDay);
      const isToday = isSameDay(currentDay, new Date());
      const isCurrentMonth = isSameMonth(currentDay, monthStart);

      days.push(
        <div
          key={currentDay.toISOString()}
          className={`min-h-[120px] border border-gray-100 p-2 transition-colors duration-200 ${
            isCurrentMonth ? 'bg-white' : 'bg-gray-50'
          } ${isToday ? 'ring-2 ring-primary ring-inset' : ''} hover:bg-blue-50/30`}
          onClick={() => onDateClick(currentDay)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, currentDay)}
        >
          <div className={`text-sm font-semibold mb-1 ${
            isToday ? 'text-primary' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
          }`}>
            {format(currentDay, 'd')}
          </div>
          <div className="space-y-1 overflow-y-auto max-h-[80px]">
            {dayAppointments.slice(0, 3).map((apt) => (
              <div
                key={apt.id}
                draggable
                onDragStart={(e) => handleDragStart(e, apt)}
                onClick={(e) => {
                  e.stopPropagation();
                  onAppointmentClick(apt);
                }}
                className={`text-xs p-1.5 rounded border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  statusColors[apt.status] || statusColors.a_venir
                }`}
              >
                <div className="flex items-center gap-1 truncate">
                  <Clock size={10} />
                  <span className="font-medium">{apt.appointment_time?.slice(0, 5)}</span>
                </div>
                <div className="flex items-center gap-1 truncate">
                  <User size={10} />
                  <span className="truncate">{apt.patient_name}</span>
                </div>
              </div>
            ))}
            {dayAppointments.length > 3 && (
              <div className="text-xs text-gray-500 text-center font-medium">
                +{dayAppointments.length - 3} autres
              </div>
            )}
          </div>
        </div>
      );

      day = addDays(day, 1);
    }

    return days;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with weekday names */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {weekDays.map((dayName) => (
          <div
            key={dayName}
            className="py-3 text-center text-sm font-semibold text-gray-700"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {renderDays()}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 p-3 bg-gray-50 border-t border-gray-200 text-xs">
        <span className="font-medium text-gray-600">Legende:</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300"></div>
          <span>A venir</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
          <span>Termine</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-100 border border-red-300"></div>
          <span>Annule</span>
        </div>
        <span className="ml-auto text-gray-500">Glissez-deposez pour deplacer un RDV</span>
      </div>
    </div>
  );
};

export default MonthView;
