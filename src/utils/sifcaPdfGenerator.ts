import { jsPDF } from 'jspdf';

interface PatientData {
  name: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  temperature?: number | null;
  poids?: number | null;
  tension_arterielle?: string | null;
  glycemie?: number | null;
  visitType?: 'consultation' | 'systematique' | 'embauche';
  filiale?: string;
  medecin?: string;
  urines_albumine?: string | null;
  urines_sucre?: string | null;
}

const formatUrines = (val?: string | null): string => {
  if (!val) return '';
  if (val === 'positif') return '+ Positif';
  if (val === 'negatif') return '- Négatif';
  return val;
};

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
  lineY('TA', patient.tension_arterielle || '', py); py += gap;
  lineY('Glycémie', patient.glycemie != null ? `${patient.glycemie} g/L` : '', py); py += gap + 4;

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
  const albumineVal = formatUrines(patient.urines_albumine);
  if (albumineVal) {
    doc.setFont('helvetica', 'bold');
    doc.text(albumineVal, albumineLineStart + 2, py - 0.5);
    doc.setFont('helvetica', 'normal');
  }

  // Sucre
  doc.text('Sucre', margin + halfW + 10, py);
  const sucreLineStart = margin + halfW + 10 + doc.getTextWidth('Sucre') + 3;
  doc.line(sucreLineStart, py, pageW - margin - 5, py);
  const sucreVal = formatUrines(patient.urines_sucre);
  if (sucreVal) {
    doc.setFont('helvetica', 'bold');
    doc.text(sucreVal, sucreLineStart + 2, py - 0.5);
    doc.setFont('helvetica', 'normal');
  }

  // ─── SAVE ────────────────────────────────────────────────────────────────
  const safeName = (patient.name || 'patient').replace(/\s+/g, '_');
  doc.save(`SIFCA_${safeName}_${formatDate().replace(/\//g, '-')}.pdf`);
};

// ============================================================
// 6 DOCUMENT TYPES (from SIFCA paper templates)
// ============================================================

export type SifcaDocType =
  | 'fiche-cms'
  | 'certificat-tension'
  | 'certificat-medical'
  | 'arret-travail'
  | 'certificat-grossesse'
  | 'ordonnance-medicale'
  | 'bulletin-consultation';

export interface SifcaDocOption {
  id: SifcaDocType;
  label: string;
  description: string;
}

export const SIFCA_DOC_TYPES: SifcaDocOption[] = [
  { id: 'fiche-cms', label: 'Fiche CMS', description: 'Fiche de consultation Centre Medico-Social' },
  { id: 'certificat-tension', label: 'Certificat de Tension', description: 'Certificat de prise de tension arterielle' },
  { id: 'certificat-medical', label: 'Certificat Medical', description: 'Attestation de bonne sante' },
  { id: 'arret-travail', label: 'Arret de Travail', description: 'Certificat d\'arret ou prolongation de travail' },
  { id: 'certificat-grossesse', label: 'Certificat de Grossesse', description: 'Attestation de grossesse en cours' },
  { id: 'ordonnance-medicale', label: 'Ordonnance Medicale', description: 'Prescription medicamenteuse' },
  { id: 'bulletin-consultation', label: 'Bulletin de Consultation', description: 'Bulletin de consultation avec renseignements cliniques' },
];

interface SifcaDocData extends PatientData {
  docType?: SifcaDocType;
  tensionDroit?: string;
  tensionGauche?: string;
  dureeGrossesse?: string;
  terme?: string;
  matricule?: string;
  arret?: string;
  prolongation?: string;
  dateComplication?: string;
  prescriptions?: string[];
  service?: string;
  consultationEn?: string;
  renseignementsCliniques?: string;
}

// ─── SIFCA Header for all 6 docs ──────────────────────────────────────
function drawSifcaHeader(doc: jsPDF, m: number) {
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SIFCA', m, 22);
  doc.setDrawColor(0);
  doc.setLineWidth(0.8);
  doc.line(m, 25, m + 30, 25);
  doc.setLineWidth(0.3);
  doc.line(m, 27, m + 30, 27);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('S.A au capital de 4 002 935 000', m, 32);
  doc.text('01 BP 1289 ABIDJAN 01 - RC: ABIDJAN N\u00b04254', m, 36);
  doc.text('Tel: (225) 27 21 75 75 75 - Fax: (225) 27 21 75 75 99', m, 40);
}

function drawDocTitle(doc: jsPDF, title: string, y: number) {
  const pageW = 210;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  const tw = doc.getTextWidth(title);
  const bx = (pageW - tw - 12) / 2;
  doc.rect(bx, y - 6, tw + 12, 10);
  doc.text(title, (pageW - tw) / 2, y + 1);
  return y + 18;
}

function drawFieldLine(doc: jsPDF, label: string, value: string, m: number, y: number, maxX?: number) {
  const pageW = maxX || 190;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(label, m, y);
  const lw = doc.getTextWidth(label);
  if (value) {
    doc.setFont('helvetica', 'normal');
    doc.text(value, m + lw + 3, y);
  }
  const startX = m + lw + 3 + (value ? doc.getTextWidth(value) + 2 : 0);
  if (startX < pageW) {
    doc.setLineWidth(0.1);
    for (let x = startX; x < pageW; x += 2) {
      doc.circle(x, y + 0.5, 0.2, 'F');
    }
  }
  return y + 10;
}

function drawSignatureLine(doc: jsPDF, y: number) {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Fait \u00e0 Abidjan, le ', 100, y);
  for (let x = 145; x < 190; x += 2) doc.circle(x, y + 0.5, 0.2, 'F');
  y += 14;
  doc.text('M\u00e9decin :', 100, y);
  return y;
}

// ─── Individual document generators ────────────────────────────────────

function genCertificatTension(doc: jsPDF, d: SifcaDocData) {
  const m = 20;
  drawSifcaHeader(doc, m);
  let y = drawDocTitle(doc, 'CERTIFICAT DE PRISE DE TENSION', 55);
  y += 5;
  y = drawFieldLine(doc, 'Je soussign\u00e9 (e), Docteur :', d.medecin || '', m, y);
  y += 2;
  y = drawFieldLine(doc, 'Certifie que l\u2019\u00e9tat de sant\u00e9 de M/ Mme/ Mlle ', d.name || '', m, y);
  for (let x = m; x < 190; x += 2) doc.circle(x, y + 0.5, 0.2, 'F');
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.text('Est satisfaisant.', m, y);
  y += 12;
  doc.text('Sa tension art\u00e9rielle de ce jour est :', m, y);
  y += 12;
  y = drawFieldLine(doc, 'Tension art\u00e9rielle bras droit :', d.tensionDroit || d.tension_arterielle || '', m, y);
  y += 3;
  y = drawFieldLine(doc, 'Tension art\u00e9rielle bras gauche :', d.tensionGauche || '', m, y);
  y += 15;
  drawSignatureLine(doc, y);
}

function genCertificatMedical(doc: jsPDF, d: SifcaDocData) {
  const m = 20;
  drawSifcaHeader(doc, m);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Date ' + formatDate(), 140, 20);
  let y = drawDocTitle(doc, 'CERTIFICAT MEDICAL', 55);
  y += 5;
  y = drawFieldLine(doc, 'Je soussign\u00e9 Dr ', d.medecin || '', m, y);
  y += 2;
  doc.setFont('helvetica', 'bold');
  doc.text('Certifie avoir examin\u00e9', m, y);
  y += 10;
  y = drawFieldLine(doc, 'l\u2019enfant ', d.name || '', m, y);
  for (let x = m; x < 190; x += 2) doc.circle(x, y + 0.5, 0.2, 'F');
  y += 16;
  doc.setFont('helvetica', 'bold');
  doc.text('Atteste qu\u2019il ou elle est en bonne sant\u00e9.', m, y);
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.text('En foi de quoi je d\u00e9livre ce certificat pour servir et valoir ce que de droit.', m + 15, y);
  y += 18;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('LE MEDECIN', 140, y);
}

function genArretTravail(doc: jsPDF, d: SifcaDocData) {
  const m = 20;
  drawSifcaHeader(doc, m);
  let y = drawDocTitle(doc, 'ARRET DE TRAVAIL', 55);
  y += 5;
  y = drawFieldLine(doc, 'Je soussign\u00e9 (e), Docteur :', d.medecin || '', m, y);
  y += 2;
  y = drawFieldLine(doc, 'Certifie que l\u2019\u00e9tat de sant\u00e9 de :', d.name || '', m, y);
  for (let x = m; x < 190; x += 2) doc.circle(x, y + 0.5, 0.2, 'F');
  y += 10;
  y = drawFieldLine(doc, 'Matricule :', d.matricule || '', m, y, 100);
  doc.setFont('helvetica', 'bold');
  doc.text('Direction :', 105, y - 10);
  for (let x = 130; x < 190; x += 2) doc.circle(x, y - 10 + 0.5, 0.2, 'F');
  y += 5;
  y = drawFieldLine(doc, '1) n\u00e9cessite un arr\u00eat de travail de :', d.arret || '', m, y);
  y += 3;
  y = drawFieldLine(doc, '2) n\u00e9cessite une prolongation de travail de :', d.prolongation || '', m, y);
  y += 3;
  y = drawFieldLine(doc, 'Sauf complication \u00e0 dater du :', d.dateComplication || '', m, y);
  y += 15;
  drawSignatureLine(doc, y);
}

function genCertificatGrossesse(doc: jsPDF, d: SifcaDocData) {
  const m = 20;
  drawSifcaHeader(doc, m);
  let y = drawDocTitle(doc, 'CERTIFICAT DE GROSSESSE', 55);
  y += 5;
  y = drawFieldLine(doc, 'Je soussign\u00e9, Docteur :', d.medecin || '', m, y);
  y += 2;
  y = drawFieldLine(doc, 'Certifie que Madame :', d.name || '', m, y);
  y += 2;
  y = drawFieldLine(doc, 'Est actuellement en cours d\u2019une grossesse de :', d.dureeGrossesse || '', m, y);
  y += 2;
  y = drawFieldLine(doc, 'Dont le terme est fix\u00e9 le :', d.terme || '', m, y);
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.text('Fait \u00e0 Abidjan, le ', 110, y);
  for (let x = 155; x < 190; x += 2) doc.circle(x, y + 0.5, 0.2, 'F');
  y += 14;
  y = drawFieldLine(doc, 'Le M\u00e9decin :', '', m, y);
}

function genOrdonnanceMedicale(doc: jsPDF, d: SifcaDocData) {
  const m = 20;
  drawSifcaHeader(doc, m);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Date ' + formatDate(), 140, 20);
  let y = drawDocTitle(doc, 'ORDONNANCE MEDICALE', 55);
  y += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Docteur', m, y);
  if (d.medecin) { doc.setFont('helvetica', 'normal'); doc.text(d.medecin, m + 20, y); }
  y += 10;
  if (d.name) { doc.setFont('helvetica', 'normal'); doc.text('Patient: ' + d.name, m, y); y += 8; }
  if (d.prescriptions && d.prescriptions.length > 0) {
    y += 5;
    d.prescriptions.forEach((rx, i) => {
      doc.setFont('helvetica', 'normal');
      doc.text(`${i + 1}. ${rx}`, m + 10, y);
      y += 8;
    });
  } else {
    for (let i = 0; i < 15; i++) {
      y += 9;
      for (let x = m; x < 190; x += 2) doc.circle(x, y + 0.5, 0.2, 'F');
    }
  }
}

function genBulletinConsultation(doc: jsPDF, d: SifcaDocData) {
  const m = 20;
  drawSifcaHeader(doc, m);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Date ' + formatDate(), 140, 20);
  let y = drawDocTitle(doc, 'BULLETIN DE CONSULTATION', 55);
  y += 5;
  y = drawFieldLine(doc, 'SERVICE :', d.service || '', m, y);
  const lastName = d.last_name || d.name?.split(' ').slice(-1)[0] || '';
  const firstName = d.first_name || d.name?.split(' ').slice(0, -1).join(' ') || '';
  y = drawFieldLine(doc, 'NOM :', lastName.toUpperCase(), m, y);
  y = drawFieldLine(doc, 'PRENOM :', firstName, m, y);
  doc.setFont('helvetica', 'bold');
  doc.text('AGE :', m, y);
  const age = calculateAge(d.date_of_birth);
  if (age) { doc.setFont('helvetica', 'normal'); doc.text(age, m + 14, y); }
  for (let x = m + 14 + (age ? doc.getTextWidth(age) + 2 : 0); x < 100; x += 2) doc.circle(x, y + 0.5, 0.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('SEXE :', 110, y);
  const sexe = d.gender || '';
  if (sexe) { doc.setFont('helvetica', 'normal'); doc.text(sexe, 125, y); }
  for (let x = 125 + (sexe ? doc.getTextWidth(sexe) + 2 : 0); x < 190; x += 2) doc.circle(x, y + 0.5, 0.2, 'F');
  y += 10;
  y = drawFieldLine(doc, 'CONSULTATION EN :', d.consultationEn || '', m, y);
  for (let i = 0; i < 8; i++) { y += 2; for (let x = m; x < 190; x += 2) doc.circle(x, y + 0.5, 0.2, 'F'); y += 6; }
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('RENSEIGNEMENTS CLINIQUES', m, y);
  y += 8;
  if (d.renseignementsCliniques) {
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(d.renseignementsCliniques, 170);
    doc.text(lines, m, y);
    y += lines.length * 5;
  }
  for (let i = 0; i < 5; i++) { y += 2; for (let x = m; x < 190; x += 2) doc.circle(x, y + 0.5, 0.2, 'F'); y += 6; }
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Signature et cachet M\u00e9decin', 120, y);
}

// ─── Main dispatch function ────────────────────────────────────────────

export const generateSifcaDocument = (docType: SifcaDocType, data: SifcaDocData): void => {
  if (docType === 'fiche-cms') {
    generateSifcaPDF(data);
    return;
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const generators: Record<string, (d: jsPDF, data: SifcaDocData) => void> = {
    'certificat-tension': genCertificatTension,
    'certificat-medical': genCertificatMedical,
    'arret-travail': genArretTravail,
    'certificat-grossesse': genCertificatGrossesse,
    'ordonnance-medicale': genOrdonnanceMedicale,
    'bulletin-consultation': genBulletinConsultation,
  };

  const gen = generators[docType];
  if (!gen) return;

  gen(doc, data);

  const safeName = (data.name || 'patient').replace(/\s+/g, '_');
  const typeLabel = docType.replace(/-/g, '_');
  doc.save(`SIFCA_${typeLabel}_${safeName}_${formatDate().replace(/\//g, '-')}.pdf`);
};
