import { jsPDF } from 'jspdf';

interface PatientData {
  name: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  temperature?: number | null;
  poids?: number | null;
  tension_arterielle?: string | null;
  visitType?: 'consultation' | 'systematique' | 'embauche';
  filiale?: string;
  medecin?: string;
  urines_albumine?: string | null;
  urines_sucre?: string | null;
}

const calculateAge = (dob?: string): string => {
  if (!dob) return '';
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return `${age} ans`;
};

const formatDate = (): string => {
  return new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const generateSifcaPDF = (patient: PatientData): void => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = 210;
  const margin = 20;
  const rightCol = 130;

  // ─── HEADER ──────────────────────────────────────────────────────────────
  // Logo SIFCA (texte stylisé)
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SIFCA', margin, 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('CENTRE MEDICO-SOCIAL', margin, 28);

  // Date
  doc.setFontSize(10);
  doc.text('Date', rightCol, 20);
  doc.line(rightCol + 10, 20, pageW - margin, 20);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(), rightCol + 12, 19.5);

  // Médecin
  doc.setFontSize(10);
  doc.text('MEDECIN', margin, 38);
  doc.line(margin + 22, 38, pageW - margin, 38);
  if (patient.medecin) {
    doc.text(patient.medecin, margin + 24, 37.5);
  }

  doc.line(margin, 42, pageW - margin, 42); // séparateur

  // ─── TYPE DE VISITE + FILIALES ────────────────────────────────────────────
  const col1X = margin;
  const col2X = 100;
  let y = 52;

  // Colonne gauche: types de visite
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const visits = [
    { label: 'Consultation', key: 'consultation' },
    { label: 'Visite Systématique', key: 'systematique' },
    { label: "Visite d'embauche", key: 'embauche' },
  ];

  visits.forEach((v) => {
    doc.rect(col1X, y - 4, 4, 4); // checkbox
    if (patient.visitType === v.key) {
      doc.setFont('helvetica', 'bold');
      doc.text('X', col1X + 0.8, y - 0.5);
      doc.setFont('helvetica', 'normal');
    }
    doc.text(v.label, col1X + 7, y - 0.5);
    y += 10;
  });

  // Colonne droite: filiales
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('FILIALES', col2X + 20, 50);
  doc.setFont('helvetica', 'normal');

  const filiales = ['AUTRES', 'SIFCA', 'SAPH', 'PALMCI', 'SANIA', 'SUCRIVOIRE', 'SIFCOMASSUR'];
  let fy = 56;
  const checkboxX = pageW - margin - 6;

  filiales.forEach((f) => {
    doc.text(f, col2X + 10, fy);
    doc.rect(checkboxX, fy - 4, 4, 4);
    if (patient.filiale === f) {
      doc.setFont('helvetica', 'bold');
      doc.text('X', checkboxX + 0.8, fy - 0.5);
      doc.setFont('helvetica', 'normal');
    }
    fy += 8;
  });

  doc.line(margin, 122, pageW - margin, 122); // séparateur

  // ─── INFORMATIONS PATIENT ─────────────────────────────────────────────────
  const lineY = (label: string, value: string, yPos: number) => {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin, yPos);
    const lineStart = margin + doc.getTextWidth(label) + 3;
    doc.line(lineStart, yPos, pageW - margin, yPos);
    if (value) {
      doc.setFont('helvetica', 'bold');
      doc.text(value, lineStart + 2, yPos - 0.5);
      doc.setFont('helvetica', 'normal');
    }
  };

  let py = 134;
  const gap = 14;

  // Nom & Prénom
  const lastName = patient.last_name || patient.name?.split(' ').slice(1).join(' ') || '';
  const firstName = patient.first_name || patient.name?.split(' ')[0] || '';

  lineY('Nom du malade', lastName.toUpperCase(), py); py += gap;
  lineY('Prénoms', firstName, py); py += gap;
  lineY('Température', patient.temperature != null ? `${patient.temperature} °C` : '', py); py += gap;
  lineY('Age', calculateAge(patient.date_of_birth), py); py += gap;
  lineY('Poids', patient.poids != null ? `${patient.poids} kg` : '', py); py += gap;
  lineY('TA', patient.tension_arterielle || '', py); py += gap + 4;

  doc.line(margin, py, pageW - margin, py); // séparateur

  // ─── URINES ──────────────────────────────────────────────────────────────
  py += 10;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setLineWidth(0.5);
  const urinesLabel = 'URINES';
  const urinesW = doc.getTextWidth(urinesLabel);
  const urinesX = (pageW - urinesW) / 2;
  doc.text(urinesLabel, urinesX, py);
  doc.line(urinesX, py + 1, urinesX + urinesW, py + 1); // souligné
  doc.setLineWidth(0.2);

  py += 14;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const halfW = (pageW - margin * 2) / 2;
  // Albumine
  doc.text('Albumine', margin + 10, py);
  const albumineLineStart = margin + 10 + doc.getTextWidth('Albumine') + 3;
  doc.line(albumineLineStart, py, margin + halfW - 5, py);
  if (patient.urines_albumine) {
    doc.setFont('helvetica', 'bold');
    doc.text(patient.urines_albumine, albumineLineStart + 2, py - 0.5);
    doc.setFont('helvetica', 'normal');
  }

  // Sucre
  doc.text('Sucre', margin + halfW + 10, py);
  const sucreLineStart = margin + halfW + 10 + doc.getTextWidth('Sucre') + 3;
  doc.line(sucreLineStart, py, pageW - margin - 5, py);
  if (patient.urines_sucre) {
    doc.setFont('helvetica', 'bold');
    doc.text(patient.urines_sucre, sucreLineStart + 2, py - 0.5);
    doc.setFont('helvetica', 'normal');
  }

  // ─── SAVE ────────────────────────────────────────────────────────────────
  const safeName = (patient.name || 'patient').replace(/\s+/g, '_');
  doc.save(`SIFCA_${safeName}_${formatDate().replace(/\//g, '-')}.pdf`);
};
