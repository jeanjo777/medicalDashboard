// ============================================
// Données de démonstration centralisées
// ============================================

// Types
export interface Patient {
  id: string;
  initials: string;
  name: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  email: string;
  phone: string;
  address: string;
  condition: string;
  status: 'Active' | 'Recovered' | 'Under Treatment' | 'Inactive';
  lastVisit: string;
  nextAppointment?: string;
  bloodType?: string;
  allergies?: string[];
  insuranceProvider?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: string[];
  notes?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientInitials: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  endTime: string;
  type: 'consultation' | 'follow-up' | 'emergency' | 'checkup' | 'surgery' | 'therapy';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  department: string;
  room?: string;
  notes?: string;
  reason: string;
  duration: number; // in minutes
  createdAt: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  prescription?: Prescription[];
  followUpDate?: string;
  notes: string;
  vitals?: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    weight: number;
    height: number;
  };
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Doctor {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  department: string;
  email: string;
  phone: string;
  availability: string[];
  rating: number;
  patientsCount: number;
  experience: number; // years
  education: string;
  certifications: string[];
}

export interface Department {
  id: string;
  name: string;
  description: string;
  headDoctor: string;
  staffCount: number;
  location: string;
  phone: string;
}

export interface AnalyticsData {
  totalPatients: number;
  newPatientsThisMonth: number;
  totalAppointments: number;
  appointmentsToday: number;
  completedConsultations: number;
  revenue: number;
  patientSatisfaction: number;
  averageWaitTime: number; // minutes
  bedOccupancy: number; // percentage
  emergencyCases: number;
}

export interface Notification {
  id: string;
  type: 'appointment' | 'alert' | 'reminder' | 'system' | 'message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'normal' | 'high';
  actionUrl?: string;
}

// ============================================
// Données de démonstration
// ============================================

export const demoPatients: Patient[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    initials: 'SJ',
    name: 'Sarah Johnson',
    firstName: 'Sarah',
    lastName: 'Johnson',
    age: 34,
    gender: 'Female',
    dateOfBirth: '1991-03-15',
    email: 'sarah.johnson@email.com',
    phone: '+33 6 12 34 56 78',
    address: '15 Rue de la Paix, 75001 Paris',
    condition: 'Hypertension',
    status: 'Active',
    lastVisit: '2025-10-25',
    nextAppointment: '2025-11-15',
    bloodType: 'A+',
    allergies: ['Pénicilline', 'Aspirine'],
    insuranceProvider: 'CPAM',
    emergencyContact: {
      name: 'Michael Johnson',
      phone: '+33 6 98 76 54 32',
      relationship: 'Époux'
    },
    medicalHistory: ['Hypertension diagnostiquée en 2020', 'Chirurgie appendice 2015'],
    notes: 'Patiente régulière, bonne observance du traitement',
    createdAt: '2020-06-12'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    initials: 'MC',
    name: 'Michael Chen',
    firstName: 'Michael',
    lastName: 'Chen',
    age: 45,
    gender: 'Male',
    dateOfBirth: '1980-07-22',
    email: 'michael.chen@email.com',
    phone: '+33 6 23 45 67 89',
    address: '28 Avenue des Champs-Élysées, 75008 Paris',
    condition: 'Diabète Type 2',
    status: 'Active',
    lastVisit: '2025-10-27',
    nextAppointment: '2025-11-10',
    bloodType: 'O+',
    allergies: [],
    insuranceProvider: 'Harmonie Mutuelle',
    emergencyContact: {
      name: 'Lisa Chen',
      phone: '+33 6 87 65 43 21',
      relationship: 'Épouse'
    },
    medicalHistory: ['Diabète Type 2 depuis 2018', 'Surpoids'],
    notes: 'Suivi régulier glycémie, régime alimentaire conseillé',
    createdAt: '2018-03-20'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    initials: 'ED',
    name: 'Emma Davis',
    firstName: 'Emma',
    lastName: 'Davis',
    age: 28,
    gender: 'Female',
    dateOfBirth: '1997-11-08',
    email: 'emma.davis@email.com',
    phone: '+33 6 34 56 78 90',
    address: '5 Rue du Faubourg Saint-Honoré, 75008 Paris',
    condition: 'Asthme',
    status: 'Recovered',
    lastVisit: '2025-10-20',
    bloodType: 'B+',
    allergies: ['Acariens', 'Pollen'],
    insuranceProvider: 'Allianz',
    medicalHistory: ['Asthme depuis l\'enfance', 'Crise asthmatique 2023'],
    notes: 'État stable, traitement de fond efficace',
    createdAt: '2019-09-15'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    initials: 'JW',
    name: 'James Wilson',
    firstName: 'James',
    lastName: 'Wilson',
    age: 52,
    gender: 'Male',
    dateOfBirth: '1973-04-30',
    email: 'james.wilson@email.com',
    phone: '+33 6 45 67 89 01',
    address: '42 Boulevard Haussmann, 75009 Paris',
    condition: 'Arthrite',
    status: 'Active',
    lastVisit: '2025-10-26',
    nextAppointment: '2025-11-20',
    bloodType: 'AB-',
    allergies: ['Ibuprofène'],
    insuranceProvider: 'AXA',
    emergencyContact: {
      name: 'Patricia Wilson',
      phone: '+33 6 76 54 32 10',
      relationship: 'Épouse'
    },
    medicalHistory: ['Arthrite rhumatoïde depuis 2019', 'Chirurgie genou 2022'],
    notes: 'Traitement biologique en cours',
    createdAt: '2019-05-10'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    initials: 'OM',
    name: 'Olivia Martinez',
    firstName: 'Olivia',
    lastName: 'Martinez',
    age: 31,
    gender: 'Female',
    dateOfBirth: '1994-09-12',
    email: 'olivia.martinez@email.com',
    phone: '+33 6 56 78 90 12',
    address: '18 Rue de Rivoli, 75004 Paris',
    condition: 'Migraine',
    status: 'Under Treatment',
    lastVisit: '2025-10-28',
    nextAppointment: '2025-11-05',
    bloodType: 'A-',
    allergies: ['Sulfamides'],
    insuranceProvider: 'MGEN',
    medicalHistory: ['Migraines chroniques depuis 2021'],
    notes: 'Traitement prophylactique initié',
    createdAt: '2021-02-28'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000006',
    initials: 'WB',
    name: 'William Brown',
    firstName: 'William',
    lastName: 'Brown',
    age: 67,
    gender: 'Male',
    dateOfBirth: '1958-01-05',
    email: 'william.brown@email.com',
    phone: '+33 6 67 89 01 23',
    address: '33 Avenue Montaigne, 75008 Paris',
    condition: 'Maladie cardiaque',
    status: 'Active',
    lastVisit: '2025-10-24',
    nextAppointment: '2025-11-08',
    bloodType: 'O-',
    allergies: ['Codéine'],
    insuranceProvider: 'Malakoff Humanis',
    emergencyContact: {
      name: 'Robert Brown',
      phone: '+33 6 65 43 21 09',
      relationship: 'Fils'
    },
    medicalHistory: ['Infarctus 2020', 'Stent coronarien', 'Hypertension'],
    notes: 'Patient à risque cardiovasculaire élevé, surveillance étroite',
    createdAt: '2020-04-15'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000007',
    initials: 'ST',
    name: 'Sophia Taylor',
    firstName: 'Sophia',
    lastName: 'Taylor',
    age: 29,
    gender: 'Female',
    dateOfBirth: '1996-06-18',
    email: 'sophia.taylor@email.com',
    phone: '+33 6 78 90 12 34',
    address: '7 Place Vendôme, 75001 Paris',
    condition: 'Allergies',
    status: 'Recovered',
    lastVisit: '2025-10-15',
    bloodType: 'B-',
    allergies: ['Noix', 'Fruits de mer', 'Latex'],
    insuranceProvider: 'Swiss Life',
    medicalHistory: ['Allergies alimentaires multiples', 'Choc anaphylactique 2022'],
    notes: 'Porte stylo d\'adrénaline',
    createdAt: '2022-01-10'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000008',
    initials: 'DA',
    name: 'Daniel Anderson',
    firstName: 'Daniel',
    lastName: 'Anderson',
    age: 41,
    gender: 'Male',
    dateOfBirth: '1984-12-03',
    email: 'daniel.anderson@email.com',
    phone: '+33 6 89 01 23 45',
    address: '22 Rue de la Pompe, 75116 Paris',
    condition: 'Lombalgie',
    status: 'Under Treatment',
    lastVisit: '2025-10-27',
    nextAppointment: '2025-11-12',
    bloodType: 'A+',
    allergies: [],
    insuranceProvider: 'Generali',
    medicalHistory: ['Hernie discale L4-L5', 'Kinésithérapie en cours'],
    notes: 'Éviter port de charges lourdes',
    createdAt: '2023-08-20'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000009',
    initials: 'LM',
    name: 'Laura Martin',
    firstName: 'Laura',
    lastName: 'Martin',
    age: 38,
    gender: 'Female',
    dateOfBirth: '1987-05-25',
    email: 'laura.martin@email.com',
    phone: '+33 6 90 12 34 56',
    address: '11 Rue de Sèvres, 75006 Paris',
    condition: 'Anxiété',
    status: 'Active',
    lastVisit: '2025-10-29',
    nextAppointment: '2025-11-18',
    bloodType: 'AB+',
    allergies: ['Benzodiazépines'],
    insuranceProvider: 'CNP Assurances',
    medicalHistory: ['Trouble anxieux généralisé', 'Thérapie cognitive comportementale'],
    notes: 'Suivi psychiatrique régulier',
    createdAt: '2022-11-05'
  },
  {
    id: 'a0000000-0000-0000-0000-000000000010',
    initials: 'TG',
    name: 'Thomas Garcia',
    firstName: 'Thomas',
    lastName: 'Garcia',
    age: 55,
    gender: 'Male',
    dateOfBirth: '1970-08-14',
    email: 'thomas.garcia@email.com',
    phone: '+33 6 01 23 45 67',
    address: '45 Rue de Passy, 75016 Paris',
    condition: 'Cholestérol',
    status: 'Active',
    lastVisit: '2025-10-22',
    nextAppointment: '2025-11-25',
    bloodType: 'O+',
    allergies: [],
    insuranceProvider: 'Aésio Mutuelle',
    emergencyContact: {
      name: 'Marie Garcia',
      phone: '+33 6 54 32 10 98',
      relationship: 'Épouse'
    },
    medicalHistory: ['Hypercholestérolémie depuis 2018', 'Stéatose hépatique'],
    notes: 'Régime pauvre en graisses saturées recommandé',
    createdAt: '2018-10-30'
  }
];

export const demoDoctors: Doctor[] = [
  {
    id: 'DR-001',
    name: 'Dr. Marie Dupont',
    initials: 'MD',
    specialty: 'Médecine Générale',
    department: 'Médecine Générale',
    email: 'marie.dupont@clinic.com',
    phone: '+33 1 42 56 78 90',
    availability: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
    rating: 4.8,
    patientsCount: 450,
    experience: 15,
    education: 'Université Paris Descartes',
    certifications: ['Diplôme d\'État de Docteur en Médecine', 'DU Gériatrie']
  },
  {
    id: 'DR-002',
    name: 'Dr. Pierre Lambert',
    initials: 'PL',
    specialty: 'Cardiologie',
    department: 'Cardiologie',
    email: 'pierre.lambert@clinic.com',
    phone: '+33 1 42 56 78 91',
    availability: ['Lundi', 'Mercredi', 'Vendredi'],
    rating: 4.9,
    patientsCount: 280,
    experience: 20,
    education: 'Université Claude Bernard Lyon 1',
    certifications: ['DES Cardiologie', 'DIU Cardiologie interventionnelle']
  },
  {
    id: 'DR-003',
    name: 'Dr. Sophie Bernard',
    initials: 'SB',
    specialty: 'Pneumologie',
    department: 'Pneumologie',
    email: 'sophie.bernard@clinic.com',
    phone: '+33 1 42 56 78 92',
    availability: ['Mardi', 'Jeudi', 'Vendredi'],
    rating: 4.7,
    patientsCount: 320,
    experience: 12,
    education: 'Université de Bordeaux',
    certifications: ['DES Pneumologie', 'DIU Sommeil']
  },
  {
    id: 'DR-004',
    name: 'Dr. Antoine Moreau',
    initials: 'AM',
    specialty: 'Endocrinologie',
    department: 'Endocrinologie',
    email: 'antoine.moreau@clinic.com',
    phone: '+33 1 42 56 78 93',
    availability: ['Lundi', 'Mardi', 'Jeudi'],
    rating: 4.6,
    patientsCount: 200,
    experience: 10,
    education: 'Université Paris-Saclay',
    certifications: ['DES Endocrinologie', 'DU Diabétologie']
  },
  {
    id: 'DR-005',
    name: 'Dr. Claire Rousseau',
    initials: 'CR',
    specialty: 'Neurologie',
    department: 'Neurologie',
    email: 'claire.rousseau@clinic.com',
    phone: '+33 1 42 56 78 94',
    availability: ['Mercredi', 'Jeudi', 'Vendredi'],
    rating: 4.8,
    patientsCount: 180,
    experience: 18,
    education: 'Université de Strasbourg',
    certifications: ['DES Neurologie', 'DIU Céphalées']
  },
  {
    id: 'DR-006',
    name: 'Dr. François Petit',
    initials: 'FP',
    specialty: 'Rhumatologie',
    department: 'Rhumatologie',
    email: 'francois.petit@clinic.com',
    phone: '+33 1 42 56 78 95',
    availability: ['Lundi', 'Mardi', 'Mercredi'],
    rating: 4.5,
    patientsCount: 250,
    experience: 14,
    education: 'Université de Lille',
    certifications: ['DES Rhumatologie']
  }
];

export const demoDepartments: Department[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Médecine Générale',
    description: 'Consultations générales et suivis patients',
    headDoctor: 'Dr. Marie Dupont',
    staffCount: 12,
    location: 'Bâtiment A - Rez-de-chaussée',
    phone: '+33 1 42 56 78 00'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    name: 'Cardiologie',
    description: 'Soins cardiovasculaires et prévention',
    headDoctor: 'Dr. Pierre Lambert',
    staffCount: 8,
    location: 'Bâtiment B - 1er étage',
    phone: '+33 1 42 56 78 10'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    name: 'Pneumologie',
    description: 'Maladies respiratoires et allergies',
    headDoctor: 'Dr. Sophie Bernard',
    staffCount: 6,
    location: 'Bâtiment B - 2ème étage',
    phone: '+33 1 42 56 78 20'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    name: 'Endocrinologie',
    description: 'Diabète et troubles hormonaux',
    headDoctor: 'Dr. Antoine Moreau',
    staffCount: 5,
    location: 'Bâtiment A - 1er étage',
    phone: '+33 1 42 56 78 30'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000005',
    name: 'Neurologie',
    description: 'Troubles neurologiques et céphalées',
    headDoctor: 'Dr. Claire Rousseau',
    staffCount: 7,
    location: 'Bâtiment C - Rez-de-chaussée',
    phone: '+33 1 42 56 78 40'
  },
  {
    id: 'b0000000-0000-0000-0000-000000000006',
    name: 'Rhumatologie',
    description: 'Maladies articulaires et osseuses',
    headDoctor: 'Dr. François Petit',
    staffCount: 5,
    location: 'Bâtiment A - 2ème étage',
    phone: '+33 1 42 56 78 50'
  }
];

// Génération dynamique des rendez-vous basée sur la date actuelle
const generateAppointmentsForDate = (baseDate: Date): Appointment[] => {
  const appointments: Appointment[] = [];
  const timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
  const types: Appointment['type'][] = ['consultation', 'follow-up', 'checkup', 'therapy'];
  const statuses: Appointment['status'][] = ['scheduled', 'confirmed', 'completed'];
  const priorities: Appointment['priority'][] = ['low', 'normal', 'high'];

  // Générer des rendez-vous pour les 14 prochains jours
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(currentDate.getDate() + dayOffset);

    // Skip weekends
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;

    // 4-8 rendez-vous par jour
    const appointmentsPerDay = Math.floor(Math.random() * 5) + 4;
    const usedSlots: string[] = [];

    for (let i = 0; i < appointmentsPerDay; i++) {
      let timeSlot: string;
      do {
        timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      } while (usedSlots.includes(timeSlot));
      usedSlots.push(timeSlot);

      const patient = demoPatients[Math.floor(Math.random() * demoPatients.length)];
      const doctor = demoDoctors[Math.floor(Math.random() * demoDoctors.length)];
      const duration = [15, 30, 45, 60][Math.floor(Math.random() * 4)];
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const endHours = hours + Math.floor((minutes + duration) / 60);
      const endMinutes = (minutes + duration) % 60;

      const status = dayOffset < 0 ? 'completed' :
                     dayOffset === 0 ? statuses[Math.floor(Math.random() * statuses.length)] :
                     statuses[Math.floor(Math.random() * 2)]; // scheduled or confirmed for future

      appointments.push({
        id: `APT-${String(dayOffset).padStart(2, '0')}${String(i).padStart(2, '0')}`,
        patientId: patient.id,
        patientName: patient.name,
        patientInitials: patient.initials,
        doctorId: doctor.id,
        doctorName: doctor.name,
        date: currentDate.toISOString().split('T')[0],
        time: timeSlot,
        endTime: `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`,
        type: types[Math.floor(Math.random() * types.length)],
        status: status,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        department: doctor.department,
        room: `Salle ${Math.floor(Math.random() * 10) + 1}`,
        reason: patient.condition,
        duration: duration,
        createdAt: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }

  return appointments.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });
};

// Exporter les rendez-vous générés dynamiquement
export const demoAppointments: Appointment[] = generateAppointmentsForDate(new Date());

export const demoConsultations: Consultation[] = [
  {
    id: 'CONS-001',
    patientId: 'a0000000-0000-0000-0000-000000000001',
    patientName: 'Sarah Johnson',
    doctorId: 'DR-001',
    doctorName: 'Dr. Marie Dupont',
    date: '2025-10-25',
    diagnosis: 'Hypertension artérielle grade 1',
    symptoms: ['Céphalées', 'Vertiges', 'Fatigue'],
    treatment: 'Ajustement du traitement antihypertenseur',
    prescription: [
      {
        id: 'RX-001',
        medication: 'Amlodipine 5mg',
        dosage: '1 comprimé',
        frequency: 'Une fois par jour',
        duration: '3 mois',
        instructions: 'À prendre le matin'
      }
    ],
    followUpDate: '2025-11-15',
    notes: 'Tension artérielle 150/95 mmHg. Conseils hygiéno-diététiques rappelés.',
    vitals: {
      bloodPressure: '150/95',
      heartRate: 78,
      temperature: 36.8,
      weight: 68,
      height: 165
    }
  },
  {
    id: 'CONS-002',
    patientId: 'a0000000-0000-0000-0000-000000000002',
    patientName: 'Michael Chen',
    doctorId: 'DR-004',
    doctorName: 'Dr. Antoine Moreau',
    date: '2025-10-27',
    diagnosis: 'Diabète type 2 déséquilibré',
    symptoms: ['Polyurie', 'Polydipsie', 'Fatigue'],
    treatment: 'Renforcement du traitement oral',
    prescription: [
      {
        id: 'RX-002',
        medication: 'Metformine 1000mg',
        dosage: '1 comprimé',
        frequency: 'Deux fois par jour',
        duration: '6 mois',
        instructions: 'À prendre pendant les repas'
      },
      {
        id: 'RX-003',
        medication: 'Sitagliptine 100mg',
        dosage: '1 comprimé',
        frequency: 'Une fois par jour',
        duration: '6 mois'
      }
    ],
    followUpDate: '2025-11-10',
    notes: 'HbA1c 8.2%. Objectif < 7%. Éducation thérapeutique programmée.',
    vitals: {
      bloodPressure: '135/85',
      heartRate: 82,
      temperature: 36.6,
      weight: 92,
      height: 178
    }
  },
  {
    id: 'CONS-003',
    patientId: 'a0000000-0000-0000-0000-000000000006',
    patientName: 'William Brown',
    doctorId: 'DR-002',
    doctorName: 'Dr. Pierre Lambert',
    date: '2025-10-24',
    diagnosis: 'Insuffisance cardiaque stable',
    symptoms: ['Dyspnée d\'effort', 'Œdèmes des membres inférieurs'],
    treatment: 'Maintien du traitement actuel',
    prescription: [
      {
        id: 'RX-004',
        medication: 'Bisoprolol 5mg',
        dosage: '1 comprimé',
        frequency: 'Une fois par jour',
        duration: '3 mois'
      },
      {
        id: 'RX-005',
        medication: 'Furosémide 40mg',
        dosage: '1 comprimé',
        frequency: 'Une fois par jour',
        duration: '3 mois',
        instructions: 'À prendre le matin'
      }
    ],
    followUpDate: '2025-11-08',
    notes: 'FEVG 45%. Patient stable. Poursuite surveillance cardiaque.',
    vitals: {
      bloodPressure: '125/75',
      heartRate: 68,
      temperature: 36.5,
      weight: 85,
      height: 175
    }
  }
];

export const demoAnalyticsData: AnalyticsData = {
  totalPatients: 1247,
  newPatientsThisMonth: 89,
  totalAppointments: 3420,
  appointmentsToday: 24,
  completedConsultations: 2856,
  revenue: 245780,
  patientSatisfaction: 4.6,
  averageWaitTime: 12,
  bedOccupancy: 78,
  emergencyCases: 156
};

export const demoNotifications: Notification[] = [
  {
    id: 'NOTIF-001',
    type: 'appointment',
    title: 'Nouveau rendez-vous',
    message: 'Sarah Johnson a confirmé son rendez-vous du 15 novembre à 10h00',
    timestamp: new Date().toISOString(),
    read: false,
    priority: 'normal'
  },
  {
    id: 'NOTIF-002',
    type: 'alert',
    title: 'Résultat d\'analyse urgent',
    message: 'Les résultats du patient William Brown nécessitent une attention immédiate',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
    priority: 'high'
  },
  {
    id: 'NOTIF-003',
    type: 'reminder',
    title: 'Rappel de suivi',
    message: '3 patients nécessitent un suivi téléphonique aujourd\'hui',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
    priority: 'normal'
  },
  {
    id: 'NOTIF-004',
    type: 'system',
    title: 'Mise à jour système',
    message: 'Une nouvelle version du système est disponible',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    priority: 'low'
  },
  {
    id: 'NOTIF-005',
    type: 'message',
    title: 'Message du Dr. Lambert',
    message: 'Merci de me contacter concernant le dossier de M. Brown',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: false,
    priority: 'normal'
  }
];

// Données pour les graphiques
export const demoChartData = {
  patientGrowth: [
    { month: 'Jan', patients: 980, newPatients: 45 },
    { month: 'Fév', patients: 1020, newPatients: 52 },
    { month: 'Mar', patients: 1065, newPatients: 58 },
    { month: 'Avr', patients: 1098, newPatients: 42 },
    { month: 'Mai', patients: 1145, newPatients: 61 },
    { month: 'Juin', patients: 1180, newPatients: 48 },
    { month: 'Juil', patients: 1195, newPatients: 35 },
    { month: 'Août', patients: 1210, newPatients: 28 },
    { month: 'Sep', patients: 1158, newPatients: 72 },
    { month: 'Oct', patients: 1247, newPatients: 89 }
  ],
  appointmentsByType: [
    { type: 'Consultation', count: 1245, color: '#10b981' },
    { type: 'Suivi', count: 890, color: '#3b82f6' },
    { type: 'Urgence', count: 156, color: '#ef4444' },
    { type: 'Bilan', count: 620, color: '#f59e0b' },
    { type: 'Thérapie', count: 509, color: '#8b5cf6' }
  ],
  appointmentsByDepartment: [
    { department: 'Médecine Générale', count: 1420 },
    { department: 'Cardiologie', count: 680 },
    { department: 'Pneumologie', count: 420 },
    { department: 'Endocrinologie', count: 380 },
    { department: 'Neurologie', count: 290 },
    { department: 'Rhumatologie', count: 230 }
  ],
  weeklyAppointments: [
    { day: 'Lun', appointments: 32, completed: 28 },
    { day: 'Mar', appointments: 28, completed: 25 },
    { day: 'Mer', appointments: 35, completed: 32 },
    { day: 'Jeu', appointments: 30, completed: 27 },
    { day: 'Ven', appointments: 25, completed: 22 },
    { day: 'Sam', appointments: 8, completed: 8 },
    { day: 'Dim', appointments: 0, completed: 0 }
  ],
  revenueByMonth: [
    { month: 'Jan', revenue: 21500 },
    { month: 'Fév', revenue: 23200 },
    { month: 'Mar', revenue: 25800 },
    { month: 'Avr', revenue: 22100 },
    { month: 'Mai', revenue: 26500 },
    { month: 'Juin', revenue: 24300 },
    { month: 'Juil', revenue: 21800 },
    { month: 'Août', revenue: 19500 },
    { month: 'Sep', revenue: 27200 },
    { month: 'Oct', revenue: 28880 }
  ],
  patientsByAge: [
    { range: '0-18', count: 120, percentage: 9.6 },
    { range: '19-30', count: 245, percentage: 19.6 },
    { range: '31-45', count: 380, percentage: 30.5 },
    { range: '46-60', count: 310, percentage: 24.9 },
    { range: '61+', count: 192, percentage: 15.4 }
  ],
  patientsByGender: [
    { gender: 'Homme', count: 598, percentage: 48 },
    { gender: 'Femme', count: 637, percentage: 51 },
    { gender: 'Autre', count: 12, percentage: 1 }
  ],
  sparklines: {
    patients: [
      { value: 1120 }, { value: 1145 }, { value: 1180 },
      { value: 1195 }, { value: 1158 }, { value: 1210 }, { value: 1247 }
    ],
    consultations: [
      { value: 378 }, { value: 345 }, { value: 432 },
      { value: 467 }, { value: 489 }, { value: 512 }, { value: 534 }
    ],
    satisfaction: [
      { value: 4.5 }, { value: 4.6 }, { value: 4.5 },
      { value: 4.7 }, { value: 4.6 }, { value: 4.7 }, { value: 4.8 }
    ],
    risk: [
      { value: 28 }, { value: 25 }, { value: 27 },
      { value: 23 }, { value: 25 }, { value: 24 }, { value: 23 }
    ]
  }
};

// Fonction utilitaire pour obtenir les rendez-vous d'aujourd'hui
export const getTodayAppointments = (): Appointment[] => {
  const today = new Date().toISOString().split('T')[0];
  return demoAppointments.filter(apt => apt.date === today);
};

// Fonction utilitaire pour obtenir les rendez-vous d'une semaine
export const getWeekAppointments = (startDate: Date): Appointment[] => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return demoAppointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate >= start && aptDate < end;
  });
};

// Fonction pour obtenir un patient par ID
export const getPatientById = (id: string): Patient | undefined => {
  return demoPatients.find(p => p.id === id);
};

// Fonction pour obtenir un médecin par ID
export const getDoctorById = (id: string): Doctor | undefined => {
  return demoDoctors.find(d => d.id === id);
};

// Statistiques résumées
export const getDemoStats = () => ({
  totalPatients: demoPatients.length,
  activePatients: demoPatients.filter(p => p.status === 'Active').length,
  underTreatment: demoPatients.filter(p => p.status === 'Under Treatment').length,
  recovered: demoPatients.filter(p => p.status === 'Recovered').length,
  todayAppointments: getTodayAppointments().length,
  totalDoctors: demoDoctors.length,
  totalDepartments: demoDepartments.length,
  ...demoAnalyticsData
});

// ============================================
// Données Analytics Avancées pour les composants
// ============================================

// KPI Stats pour KPICards
export const demoKPIStats = {
  patients_consultes: 1247,
  patients_consultes_evolution: 12.5,
  rdv_exceptionnels: 94,
  rdv_exceptionnels_evolution: 3.2,
  rdv_honores: 87,
  rdv_honores_evolution: 5.1,
  cas_risque: 23,
  cas_risque_evolution: -2
};

// Statistiques par département pour OverviewTab
export const demoDepartementStats = [
  { departement: 'Médecine Générale', patients_count: 485, croissance: 8.5 },
  { departement: 'Cardiologie', patients_count: 312, croissance: 12.3 },
  { departement: 'Pneumologie', patients_count: 198, croissance: -2.1 },
  { departement: 'Endocrinologie', patients_count: 156, croissance: 15.8 },
  { departement: 'Neurologie', patients_count: 134, croissance: 6.7 },
  { departement: 'Rhumatologie', patients_count: 112, croissance: 4.2 }
];

// Performance des médecins pour OverviewTab
export const demoMedecinPerformance = [
  { medecin_name: 'Dr. Marie Dupont', consultations: 245, minutes_par_patient: 18, satisfaction: 4.8 },
  { medecin_name: 'Dr. Pierre Lambert', consultations: 198, minutes_par_patient: 25, satisfaction: 4.9 },
  { medecin_name: 'Dr. Sophie Bernard', consultations: 167, minutes_par_patient: 22, satisfaction: 4.7 },
  { medecin_name: 'Dr. Antoine Moreau', consultations: 143, minutes_par_patient: 20, satisfaction: 4.6 },
  { medecin_name: 'Dr. Claire Rousseau', consultations: 132, minutes_par_patient: 28, satisfaction: 4.8 },
  { medecin_name: 'Dr. François Petit', consultations: 118, minutes_par_patient: 24, satisfaction: 4.5 }
];

// Flux de patients mensuel pour OverviewTab
export const demoFluxPatients = [
  { mois: 'Jan', consultations: 420, urgences: 45, suivis: 180 },
  { mois: 'Fév', consultations: 385, urgences: 52, suivis: 165 },
  { mois: 'Mar', consultations: 445, urgences: 48, suivis: 195 },
  { mois: 'Avr', consultations: 398, urgences: 38, suivis: 175 },
  { mois: 'Mai', consultations: 467, urgences: 55, suivis: 210 },
  { mois: 'Juin', consultations: 432, urgences: 42, suivis: 188 },
  { mois: 'Juil', consultations: 378, urgences: 35, suivis: 156 },
  { mois: 'Août', consultations: 345, urgences: 28, suivis: 142 },
  { mois: 'Sep', consultations: 489, urgences: 58, suivis: 215 },
  { mois: 'Oct', consultations: 512, urgences: 62, suivis: 228 },
  { mois: 'Nov', consultations: 534, urgences: 48, suivis: 245 },
  { mois: 'Déc', consultations: 478, urgences: 52, suivis: 198 }
];

// Distribution des pathologies pour OverviewTab
export const demoPathologiesDistribution = [
  { pathologie: 'Cardiovasculaire', pourcentage: 28 },
  { pathologie: 'Respiratoire', pourcentage: 18 },
  { pathologie: 'Métabolique', pourcentage: 22 },
  { pathologie: 'Neurologique', pourcentage: 12 },
  { pathologie: 'Rhumatologique', pourcentage: 10 },
  { pathologie: 'Autre', pourcentage: 10 }
];

// Taux de récupération pour OverviewTab
export const demoTauxRecuperation = [
  { semaine: 1, objectif: 78, taux_reel: 72 },
  { semaine: 2, objectif: 78, taux_reel: 75 },
  { semaine: 3, objectif: 78, taux_reel: 79 },
  { semaine: 4, objectif: 78, taux_reel: 77 },
  { semaine: 5, objectif: 80, taux_reel: 82 },
  { semaine: 6, objectif: 80, taux_reel: 84 },
  { semaine: 7, objectif: 80, taux_reel: 81 },
  { semaine: 8, objectif: 82, taux_reel: 85 }
];

// Systèmes de santé pour OverviewTab
export const demoSystemesSante = [
  { systeme: 'Prévention', score: 85 },
  { systeme: 'Diagnostic', score: 92 },
  { systeme: 'Traitement', score: 88 },
  { systeme: 'Suivi', score: 78 },
  { systeme: 'Urgences', score: 94 },
  { systeme: 'Satisfaction', score: 87 }
];

// Données de prédictions pour PredictionsTab
export const demoPredictions = {
  forecast: [
    { month: 'Oct', actual: 512, predicted: 510, upper: 540, lower: 480 },
    { month: 'Nov', actual: 534, predicted: 528, upper: 560, lower: 496 },
    { month: 'Déc', actual: 478, predicted: 485, upper: 520, lower: 450 },
    { month: 'Jan', actual: null, predicted: 545, upper: 590, lower: 500 },
    { month: 'Fév', actual: null, predicted: 568, upper: 620, lower: 516 },
    { month: 'Mar', actual: null, predicted: 592, upper: 650, lower: 534 }
  ],
  confidence: 87,
  insights: [
    'Tendance haussière attendue au T1 avec +15% de consultations prévues',
    'Pic d\'activité prévu en mars lié aux pathologies saisonnières',
    'Recommandation: renforcer l\'équipe cardiologie en février'
  ],
  alerts: [
    { type: 'warning', message: 'Capacité maximale atteinte prévue en mars - planifier des ressources supplémentaires' },
    { type: 'success', message: 'Taux de satisfaction prévu stable à 4.7/5 sur le trimestre' },
    { type: 'info', message: 'Nouvelle période de vaccination grippe à prévoir en janvier' }
  ],
  trends: {
    direction: 'increasing' as const,
    description: 'Croissance constante de 8-12% attendue sur les 3 prochains mois, principalement tirée par les consultations en cardiologie et endocrinologie.'
  },
  model: {
    type: 'ARIMA + Random Forest Ensemble',
    lastTrainedAt: new Date().toISOString(),
    accuracy: 0.87
  }
};

// Alertes IA dynamiques pour AIAlertsTab
export interface AIAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'capacity' | 'performance' | 'patient' | 'resource' | 'quality';
  timestamp: string;
  isRead: boolean;
  actionRequired: boolean;
  metrics?: {
    current: number;
    threshold: number;
    trend: 'up' | 'down' | 'stable';
  };
  recommendations?: string[];
  affectedDepartments?: string[];
}

// Générateur d'alertes IA dynamiques basées sur les données
export const generateDemoAIAlerts = (): AIAlert[] => {
  const now = new Date();
  const alerts: AIAlert[] = [
    {
      id: 'ALERT-001',
      title: 'Capacité hospitalière critique',
      description: 'Le taux d\'occupation prévu dépasse 90% pour la semaine prochaine en cardiologie',
      severity: 'critical',
      category: 'capacity',
      timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      isRead: false,
      actionRequired: true,
      metrics: { current: 87, threshold: 85, trend: 'up' },
      recommendations: [
        'Activer le protocole de débordement',
        'Reporter les consultations non-urgentes',
        'Contacter les médecins de garde supplémentaires'
      ],
      affectedDepartments: ['Cardiologie']
    },
    {
      id: 'ALERT-002',
      title: 'Pic de consultations détecté',
      description: 'Augmentation inhabituelle de 35% des consultations en pneumologie',
      severity: 'high',
      category: 'performance',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      actionRequired: true,
      metrics: { current: 135, threshold: 100, trend: 'up' },
      recommendations: [
        'Ouvrir des créneaux supplémentaires',
        'Mobiliser Dr. Bernard pour consultations urgentes'
      ],
      affectedDepartments: ['Pneumologie']
    },
    {
      id: 'ALERT-003',
      title: 'Temps d\'attente élevé',
      description: 'Temps d\'attente moyen de 45 minutes au service des urgences',
      severity: 'medium',
      category: 'quality',
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      actionRequired: true,
      metrics: { current: 45, threshold: 30, trend: 'stable' },
      recommendations: ['Revoir le tri des patients', 'Renforcer l\'équipe d\'accueil'],
      affectedDepartments: ['Urgences']
    },
    {
      id: 'ALERT-004',
      title: 'Patient à haut risque identifié',
      description: 'William Brown présente des indicateurs cardiovasculaires préoccupants',
      severity: 'high',
      category: 'patient',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      actionRequired: true,
      recommendations: [
        'Planifier consultation cardiologie urgente',
        'Vérifier le suivi médicamenteux',
        'Contacter le patient pour rendez-vous'
      ]
    },
    {
      id: 'ALERT-005',
      title: 'Stock médicaments bas',
      description: 'Stock d\'Amlodipine 5mg inférieur au seuil minimum',
      severity: 'medium',
      category: 'resource',
      timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      actionRequired: false,
      metrics: { current: 15, threshold: 50, trend: 'down' },
      recommendations: ['Commander réapprovisionnement urgent']
    },
    {
      id: 'ALERT-006',
      title: 'Satisfaction en baisse',
      description: 'Note de satisfaction en baisse de 0.3 points ce mois en neurologie',
      severity: 'low',
      category: 'quality',
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      actionRequired: false,
      metrics: { current: 4.3, threshold: 4.5, trend: 'down' },
      recommendations: ['Analyser les retours patients récents', 'Organiser réunion d\'équipe'],
      affectedDepartments: ['Neurologie']
    },
    {
      id: 'ALERT-007',
      title: 'Tendance positive détectée',
      description: 'Taux de récupération en hausse constante depuis 4 semaines',
      severity: 'info',
      category: 'performance',
      timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      actionRequired: false,
      metrics: { current: 85, threshold: 80, trend: 'up' }
    }
  ];
  return alerts;
};

export const demoAIAlerts = generateDemoAIAlerts();

// Données de corrélation pour CorrelationsTab
export const demoCorrelations = {
  scatterData: [
    { x: 312, y: 92, name: 'Cardiologie', satisfaction: 4.9 },
    { x: 485, y: 88, name: 'Médecine Générale', satisfaction: 4.8 },
    { x: 198, y: 85, name: 'Pneumologie', satisfaction: 4.7 },
    { x: 156, y: 82, name: 'Endocrinologie', satisfaction: 4.6 },
    { x: 134, y: 87, name: 'Neurologie', satisfaction: 4.8 },
    { x: 112, y: 78, name: 'Rhumatologie', satisfaction: 4.5 }
  ],
  correlationPairs: [
    {
      metric1: 'Temps de consultation',
      metric2: 'Satisfaction patient',
      coefficient: 0.78,
      type: 'positive' as const,
      description: 'Plus le temps de consultation est élevé, plus la satisfaction augmente',
      insight: 'Recommandation: Maintenir des consultations de 30+ minutes'
    },
    {
      metric1: 'Nombre de suivis',
      metric2: 'Taux de récupération',
      coefficient: 0.85,
      type: 'positive' as const,
      description: 'Les suivis réguliers améliorent significativement la récupération',
      insight: 'Recommandation: Planifier des suivis tous les 15 jours'
    },
    {
      metric1: 'Délai d\'attente',
      metric2: 'Taux d\'annulation',
      coefficient: -0.72,
      type: 'negative' as const,
      description: 'Un délai d\'attente élevé augmente les annulations',
      insight: 'Recommandation: Réduire le délai moyen à moins de 7 jours'
    },
    {
      metric1: 'Nombre de médecins',
      metric2: 'Temps d\'attente moyen',
      coefficient: -0.68,
      type: 'negative' as const,
      description: 'Plus de médecins disponibles réduit le temps d\'attente',
      insight: 'Recommandation: Évaluer le recrutement pour les périodes de pointe'
    }
  ],
  insights: [
    { value: '+12%', description: 'Amélioration potentielle de la satisfaction en optimisant le temps de consultation', type: 'positive' as const },
    { value: '-25%', description: 'Réduction des annulations possible en diminuant les délais d\'attente', type: 'negative' as const },
    { value: '+18%', description: 'Augmentation du taux de récupération avec plus de suivis réguliers', type: 'positive' as const }
  ]
};

// Données de segmentation pour SegmentationTab
export const demoSegmentation = {
  ageGroups: [
    { range: '0-18', patients: 156, percentage: 12.5, growth: '+8.2%' },
    { range: '19-35', patients: 312, percentage: 25.0, growth: '+15.3%' },
    { range: '36-50', patients: 398, percentage: 31.9, growth: '+6.1%' },
    { range: '51-65', patients: 256, percentage: 20.5, growth: '-2.4%' },
    { range: '65+', patients: 125, percentage: 10.0, growth: '+4.8%' }
  ],
  genderDistribution: [
    { name: 'Femmes', count: 723, value: 58 },
    { name: 'Hommes', count: 499, value: 40 },
    { name: 'Autre', count: 25, value: 2 }
  ],
  riskLevels: [
    { level: 'Faible', patients: 834, percentage: 67 },
    { level: 'Modéré', patients: 312, percentage: 25 },
    { level: 'Élevé', patients: 101, percentage: 8 }
  ],
  pathologySegments: [
    { pathology: 'Maladies chroniques', patients: 445, priority: 'Haute', trend: 'stable' },
    { pathology: 'Conditions aiguës', patients: 312, priority: 'Moyenne', trend: 'up' },
    { pathology: 'Prévention', patients: 289, priority: 'Basse', trend: 'up' },
    { pathology: 'Suivi post-op', patients: 201, priority: 'Haute', trend: 'down' }
  ],
  totalPatients: 1247,
  monthlyGrowth: 7.1
};

// Données comparatives pour ComparativeTab
export const demoComparativeByType: Record<string, {
  periods: { current: string; previous: string };
  kpiComparison: { metric: string; current: number; previous: number; change: number; unit: string; trend: 'up' | 'down' | 'stable' }[];
  timeSeriesComparison: { month: string; current: number; previous: number; target: number }[];
  departmentComparison: { department: string; current: number; previous: number; diff: number }[];
  insights: { positive: string[]; stable: string[]; attention: string[] };
}> = {
  month: {
    periods: { current: 'Novembre 2025', previous: 'Octobre 2025' },
    kpiComparison: [
      { metric: 'Croissance Patients', current: 1247, previous: 1158, change: 7.7, unit: '', trend: 'up' as const },
      { metric: 'Temps Consultation', current: 22, previous: 24, change: -8.3, unit: 'min', trend: 'down' as const },
      { metric: 'Satisfaction', current: 4.7, previous: 4.6, change: 2.2, unit: '/5', trend: 'up' as const },
      { metric: 'RDV Honorés', current: 87, previous: 82, change: 6.1, unit: '%', trend: 'up' as const }
    ],
    timeSeriesComparison: [
      { month: 'Sem 1', current: 125, previous: 118, target: 130 },
      { month: 'Sem 2', current: 142, previous: 128, target: 130 },
      { month: 'Sem 3', current: 138, previous: 135, target: 130 },
      { month: 'Sem 4', current: 156, previous: 142, target: 130 }
    ],
    departmentComparison: [
      { department: 'Médecine Générale', current: 485, previous: 452, diff: 33 },
      { department: 'Cardiologie', current: 312, previous: 278, diff: 34 },
      { department: 'Pneumologie', current: 198, previous: 210, diff: -12 },
      { department: 'Endocrinologie', current: 156, previous: 132, diff: 24 },
      { department: 'Neurologie', current: 134, previous: 126, diff: 8 },
      { department: 'Rhumatologie', current: 112, previous: 108, diff: 4 }
    ],
    insights: {
      positive: ['Croissance de 7.7% du nombre de patients', 'Amélioration de la satisfaction de 0.1 point', 'Cardiologie: +12.2% de consultations'],
      stable: ['Temps moyen de consultation maintenu sous 25min', 'Taux de récupération stable à 85%'],
      attention: ['Pneumologie: baisse de 5.7% à surveiller', 'Pic d\'activité prévu en décembre']
    }
  },
  quarter: {
    periods: { current: 'T4 2025', previous: 'T3 2025' },
    kpiComparison: [
      { metric: 'Croissance Patients', current: 3680, previous: 3412, change: 7.9, unit: '', trend: 'up' as const },
      { metric: 'Temps Consultation', current: 21, previous: 23, change: -8.7, unit: 'min', trend: 'down' as const },
      { metric: 'Satisfaction', current: 4.7, previous: 4.5, change: 4.4, unit: '/5', trend: 'up' as const },
      { metric: 'RDV Honorés', current: 89, previous: 84, change: 6.0, unit: '%', trend: 'up' as const }
    ],
    timeSeriesComparison: [
      { month: 'Mois 1', current: 1158, previous: 1095, target: 1150 },
      { month: 'Mois 2', current: 1275, previous: 1142, target: 1150 },
      { month: 'Mois 3', current: 1247, previous: 1175, target: 1150 }
    ],
    departmentComparison: [
      { department: 'Médecine Générale', current: 1420, previous: 1310, diff: 110 },
      { department: 'Cardiologie', current: 895, previous: 812, diff: 83 },
      { department: 'Pneumologie', current: 578, previous: 615, diff: -37 },
      { department: 'Endocrinologie', current: 442, previous: 395, diff: 47 },
      { department: 'Neurologie', current: 398, previous: 372, diff: 26 },
      { department: 'Rhumatologie', current: 327, previous: 308, diff: 19 }
    ],
    insights: {
      positive: ['Croissance trimestrielle de 7.9%', 'Satisfaction en hausse constante sur 3 mois', 'Cardiologie: +10.2% sur le trimestre'],
      stable: ['Temps de consultation en amélioration continue', 'Objectifs atteints 2 mois sur 3'],
      attention: ['Pneumologie: tendance baissière persistante (-6%)', 'Charge de travail élevée en fin de trimestre']
    }
  },
  year: {
    periods: { current: '2025', previous: '2024' },
    kpiComparison: [
      { metric: 'Croissance Patients', current: 14250, previous: 12680, change: 12.4, unit: '', trend: 'up' as const },
      { metric: 'Temps Consultation', current: 21, previous: 25, change: -16.0, unit: 'min', trend: 'down' as const },
      { metric: 'Satisfaction', current: 4.7, previous: 4.4, change: 6.8, unit: '/5', trend: 'up' as const },
      { metric: 'RDV Honorés', current: 89, previous: 80, change: 11.3, unit: '%', trend: 'up' as const }
    ],
    timeSeriesComparison: [
      { month: 'T1', current: 3250, previous: 2980, target: 3100 },
      { month: 'T2', current: 3520, previous: 3150, target: 3200 },
      { month: 'T3', current: 3800, previous: 3340, target: 3400 },
      { month: 'T4', current: 3680, previous: 3210, target: 3500 }
    ],
    departmentComparison: [
      { department: 'Médecine Générale', current: 5520, previous: 4890, diff: 630 },
      { department: 'Cardiologie', current: 3480, previous: 3050, diff: 430 },
      { department: 'Pneumologie', current: 2210, previous: 2340, diff: -130 },
      { department: 'Endocrinologie', current: 1720, previous: 1480, diff: 240 },
      { department: 'Neurologie', current: 1540, previous: 1380, diff: 160 },
      { department: 'Rhumatologie', current: 1280, previous: 1140, diff: 140 }
    ],
    insights: {
      positive: ['Croissance annuelle de 12.4%', 'Satisfaction patient en hausse de 0.3 points', 'Temps de consultation réduit de 4 minutes en moyenne'],
      stable: ['Objectifs annuels dépassés pour 4 départements sur 6', 'Taux de RDV honorés au plus haut historique'],
      attention: ['Pneumologie: seul département en recul (-5.6%)', 'Besoin de recrutement estimé pour 2026']
    }
  }
};

// Backward-compatible default export
export const demoComparative = demoComparativeByType.month;

// Données pour les rapports (ReportsTab)
export const demoReports = {
  templates: [
    { id: 'c0000000-0000-0000-0000-000000000001', name: 'Rapport de Performance', type: 'performance', icon: 'chart', color: '#10b981' },
    { id: 'c0000000-0000-0000-0000-000000000002', name: 'Rapport Patients', type: 'patients', icon: 'users', color: '#3b82f6' },
    { id: 'c0000000-0000-0000-0000-000000000003', name: 'Rapport Activité', type: 'activity', icon: 'activity', color: '#8b5cf6' },
    { id: 'c0000000-0000-0000-0000-000000000004', name: 'Rapport Analytique IA', type: 'analytics', icon: 'brain', color: '#f59e0b' }
  ],
  recentReports: [
    { id: 'GEN-001', name: 'Performance Mensuelle - Octobre 2025', type: 'performance', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), size: '2.4 MB', format: 'PDF', status: 'completed' as const },
    { id: 'GEN-002', name: 'Statistiques Patients Q3 2025', type: 'patients', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), size: '1.8 MB', format: 'PDF', status: 'completed' as const },
    { id: 'GEN-003', name: 'Analyse Prédictive Décembre', type: 'analytics', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), size: '3.1 MB', format: 'PDF', status: 'completed' as const }
  ],
  scheduledReports: [
    { id: 'SCH-001', name: 'Rapport Hebdomadaire', frequency: 'weekly', nextRun: 'Lundi 9h00', recipients: 5 },
    { id: 'SCH-002', name: 'Synthèse Mensuelle', frequency: 'monthly', nextRun: '1er du mois', recipients: 12 },
    { id: 'SCH-003', name: 'Alertes Quotidiennes', frequency: 'daily', nextRun: 'Demain 7h00', recipients: 3 }
  ],
  stats: { generatedThisMonth: 24, totalDownloads: 156, activeScheduled: 3 }
};
