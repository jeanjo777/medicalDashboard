// Centralized status normalization for appointments
export const normalizeAppointmentStatus = (status: string): string => {
  const map: Record<string, string> = {
    'scheduled': 'a_venir',
    'confirmed': 'a_venir',
    'pending': 'a_venir',
    'completed': 'termine',
    'cancelled': 'annule',
    'no-show': 'annule',
    'no_show': 'annule',
  };
  return map[status] || status;
};

// Status display labels in French
export const getAppointmentStatusLabel = (status: string): string => {
  const normalized = normalizeAppointmentStatus(status);
  const labels: Record<string, string> = {
    'a_venir': 'À venir',
    'en_cours': 'En cours',
    'termine': 'Terminé',
    'annule': 'Annulé',
  };
  return labels[normalized] || status;
};

// Status color classes
export const getAppointmentStatusColor = (status: string): string => {
  const normalized = normalizeAppointmentStatus(status);
  const colors: Record<string, string> = {
    'a_venir': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    'en_cours': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'termine': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    'annule': 'text-red-400 bg-red-500/10 border-red-500/20',
  };
  return colors[normalized] || 'text-gray-400 bg-gray-500/10 border-gray-500/20';
};

// Patient status normalization
export const normalizePatientStatus = (status: string): string => {
  const map: Record<string, string> = {
    'actif': 'active',
    'active': 'active',
    'inactif': 'inactive',
    'inactive': 'inactive',
    'in-treatment': 'in_treatment',
    'in_treatment': 'in_treatment',
    'recovered': 'recovered',
    'archived': 'archived',
  };
  return map[status] || status;
};

export const getPatientStatusLabel = (status: string): string => {
  const normalized = normalizePatientStatus(status);
  const labels: Record<string, string> = {
    'active': 'En consultation',
    'inactive': 'Sorti',
    'in_treatment': 'En traitement',
    'recovered': 'Rétabli',
    'archived': 'Archivé',
  };
  return labels[normalized] || status;
};

// Completed appointment statuses
export const COMPLETED_STATUSES = ['completed', 'termine', 'honore'];
export const CANCELLED_STATUSES = ['cancelled', 'no_show', 'annule', 'no-show'];
export const IN_TREATMENT_STATUSES = ['in_treatment', 'in-treatment'];

// Consultation revenue per consultation in FCFA
export const CONSULTATION_REVENUE_FCFA = 150;
