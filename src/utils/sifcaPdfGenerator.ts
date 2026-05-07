import { jsPDF } from 'jspdf';
import { SIFCA_LOGO_BW } from './sifcaLogoBw';

// ════════════════════════════════════════════════════════════════
// CONSTANTES DE DESIGN
// ════════════════════════════════════════════════════════════════

const PAGE_W = 210;
const M = 15; // marge gauche/droite
const CONTENT_W = PAGE_W - M * 2; // 180mm

// Logo dimensions (ratio 1.4:1)
const LOGO_W = 35;
const LOGO_H = 25;

// Typographie
const FONT_TITLE = 14;
const FONT_SUBTITLE = 12;
const FONT_LABEL = 11;
const FONT_BODY = 10;
const FONT_SMALL = 8;

// Espacement
const LINE_GAP = 8;
const SECTION_GAP = 12;

// ════════════════════════════════════════════════════════════════
// INTERFACES
// ════════════════════════════════════════════════════════════════

interface PatientData {
  name: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
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

// ════════════════════════════════════════════════════════════════
// UTILITAIRES
// ════════════════════════════════════════════════════════════════

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

// ════════════════════════════════════════════════════════════════
// PRIMITIVES DE DESSIN
// ════════════════════════════════════════════════════════════════

/** Ligne de séparation horizontale */
function drawSeparator(doc: jsPDF, y: number, weight = 0.4) {
  doc.setLineWidth(weight);
  doc.setDrawColor(0);
  doc.line(M, y, PAGE_W - M, y);
  doc.setLineWidth(0.2);
}

/** Ligne pointillée pour remplissage de champ */
function drawDots(doc: jsPDF, x1: number, x2: number, y: number) {
  doc.setLineWidth(0.15);
  doc.setDrawColor(150);
  for (let x = x1; x < x2; x += 1.5) {
    doc.circle(x, y + 0.3, 0.15, 'F');
  }
  doc.setDrawColor(0);
}

/** Champ: label (bold) + valeur + pointillés de remplissage */
function drawField(doc: jsPDF, label: string, value: string, y: number, maxX?: number): number {
  const endX = maxX || (PAGE_W - M);
  doc.setFontSize(FONT_LABEL);
  doc.setFont('helvetica', 'bold');
  doc.text(label, M, y);
  const lw = doc.getTextWidth(label);

  if (value) {
    doc.setFont('helvetica', 'normal');
    doc.text(value, M + lw + 3, y);
    const vw = doc.getTextWidth(value);
    drawDots(doc, M + lw + 3 + vw + 2, endX, y);
  } else {
    drawDots(doc, M + lw + 3, endX, y);
  }
  doc.setFont('helvetica', 'normal');
  return y + LINE_GAP;
}

/** Champ avec soulignement continu */
function drawFieldUnderline(doc: jsPDF, label: string, value: string, y: number): number {
  doc.setFontSize(FONT_LABEL);
  doc.setFont('helvetica', 'bold');
  doc.text(label, M, y);
  const lw = doc.getTextWidth(label);
  const lineStart = M + lw + 3;

  doc.setLineWidth(0.3);
  doc.line(lineStart, y + 1, PAGE_W - M, y + 1);
  doc.setLineWidth(0.2);

  if (value) {
    doc.setFont('helvetica', 'bold');
    doc.text(value, lineStart + 2, y);
  }
  doc.setFont('helvetica', 'normal');
  return y + LINE_GAP + 2;
}

/** Titre de document dans un cadre centré */
function drawTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(FONT_TITLE);
  doc.setFont('helvetica', 'bold');
  const tw = doc.getTextWidth(title);
  const bx = (PAGE_W - tw - 16) / 2;

  doc.setLineWidth(0.6);
  doc.rect(bx, y - 7, tw + 16, 12);
  doc.text(title, (PAGE_W - tw) / 2, y + 1.5);
  doc.setLineWidth(0.2);
  doc.setFont('helvetica', 'normal');
  return y + 20;
}

/** Bloc signature "Fait à Abidjan, le..." + "Médecin :" */
function drawSignature(doc: jsPDF, y: number): number {
  doc.setFontSize(FONT_LABEL);
  doc.setFont('helvetica', 'normal');
  doc.text('Fait \u00e0 Abidjan, le', 105, y);
  drawDots(doc, 150, PAGE_W - M, y);
  y += 16;
  doc.setFont('helvetica', 'bold');
  doc.text('Le M\u00e9decin :', 120, y);
  doc.setFont('helvetica', 'normal');
  return y;
}

// ════════════════════════════════════════════════════════════════
// EN-TÊTE SIFCA (partagé par les 6 documents)
// ════════════════════════════════════════════════════════════════

function drawSifcaHeader(doc: jsPDF): number {
  // Logo
  doc.addImage(SIFCA_LOGO_BW, 'PNG', M, 8, LOGO_W, LOGO_H);

  // Infos société sous le logo
  doc.setFontSize(FONT_SMALL);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60);
  doc.text('S.A au capital de 4 002 935 000 FCFA', M, 36);
  doc.text('01 BP 1289 ABIDJAN 01 \u2013 RC: ABIDJAN N\u00b04254', M, 40);
  doc.text('T\u00e9l: (225) 27 21 75 75 75 \u2013 Fax: (225) 27 21 75 75 99', M, 44);
  doc.setTextColor(0);

  // CENTRE MEDICO-SOCIAL (en haut à droite, à côté du logo)
  doc.setFontSize(FONT_SUBTITLE);
  doc.setFont('helvetica', 'bold');
  doc.text('CENTRE MEDICO-SOCIAL', PAGE_W - M, 18, { align: 'right' });
  doc.setFont('helvetica', 'normal');

  // Date en haut à droite
  doc.setFontSize(FONT_BODY);
  doc.text('Date : ' + formatDate(), PAGE_W - M, 26, { align: 'right' });

  // Séparateur
  drawSeparator(doc, 48, 0.5);

  return 48;
}

// ════════════════════════════════════════════════════════════════
// 1. FICHE CMS (Centre Médico-Social)
// ════════════════════════════════════════════════════════════════

export const generateSifcaPDF = (patient: PatientData): void => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // ─── EN-TÊTE ─────────────────────────────────────
  doc.addImage(SIFCA_LOGO_BW, 'PNG', M, 8, LOGO_W, LOGO_H);

  doc.setFontSize(FONT_SMALL);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60);
  doc.text('CENTRE MEDICO-SOCIAL', M, 36);
  doc.setTextColor(0);

  // Date (droite)
  doc.setFontSize(FONT_BODY);
  doc.text('Date :', 140, 14);
  doc.setLineWidth(0.3);
  doc.line(152, 15, PAGE_W - M, 15);
  doc.text(formatDate(), 154, 14);

  // Médecin
  doc.setFontSize(FONT_LABEL);
  doc.setFont('helvetica', 'bold');
  doc.text('MEDECIN', M, 42);
  doc.setLineWidth(0.3);
  doc.line(M + 22, 43, PAGE_W - M, 43);
  if (patient.medecin) {
    doc.setFont('helvetica', 'normal');
    doc.text(patient.medecin, M + 24, 42);
  }

  drawSeparator(doc, 47, 0.6);

  // ─── TYPES DE VISITE + FILIALES ──────────────────
  const col2X = 108;

  // Titre FILIALES
  doc.setFontSize(FONT_LABEL);
  doc.setFont('helvetica', 'bold');
  doc.text('FILIALES', col2X + 18, 53);

  // Filiales (colonne droite)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(FONT_BODY);
  const filiales = ['AUTRES', 'SIFCA', 'SAPH', 'PALMCI', 'SANIA', 'SUCRIVOIRE', 'SIFCOMASSUR'];
  const cbX = PAGE_W - M - 6;
  let fy = 59;
  filiales.forEach((f) => {
    doc.text(f, col2X + 8, fy);
    doc.rect(cbX, fy - 3.5, 3.5, 3.5);
    if (patient.filiale === f) {
      doc.setFont('helvetica', 'bold');
      doc.text('X', cbX + 0.7, fy - 0.3);
      doc.setFont('helvetica', 'normal');
    }
    fy += 7;
  });

  // Types de visite (colonne gauche)
  doc.setFontSize(FONT_BODY);
  const visits = [
    { label: 'Consultation', key: 'consultation' },
    { label: 'Visite Syst\u00e9matique', key: 'systematique' },
    { label: "Visite d'embauche", key: 'embauche' },
  ];
  let vy = 59;
  visits.forEach((v) => {
    doc.rect(M, vy - 3.5, 3.5, 3.5);
    if (patient.visitType === v.key) {
      doc.setFont('helvetica', 'bold');
      doc.text('X', M + 0.7, vy - 0.3);
      doc.setFont('helvetica', 'normal');
    }
    doc.text(v.label, M + 6, vy - 0.3);
    vy += 9;
  });

  drawSeparator(doc, 110, 0.6);

  // ─── INFORMATIONS PATIENT ────────────────────────
  let py = 118;

  const lastName = patient.last_name || patient.name?.split(' ').slice(1).join(' ') || '';
  const firstName = patient.first_name || patient.name?.split(' ')[0] || '';

  py = drawFieldUnderline(doc, 'Nom du malade', lastName.toUpperCase(), py);
  py = drawFieldUnderline(doc, 'Pr\u00e9noms', firstName, py);
  py = drawFieldUnderline(doc, 'Temp\u00e9rature', patient.temperature != null ? `${patient.temperature} \u00b0C` : '', py);
  py = drawFieldUnderline(doc, 'Age', calculateAge(patient.date_of_birth), py);
  py = drawFieldUnderline(doc, 'Poids', patient.poids != null ? `${patient.poids} kg` : '', py);
  py = drawFieldUnderline(doc, 'T.A', patient.tension_arterielle || '', py);
  py = drawFieldUnderline(doc, 'Glyc\u00e9mie', patient.glycemie != null ? `${patient.glycemie} g/L` : '', py);

  py += 4;
  drawSeparator(doc, py, 0.6);

  // ─── URINES ──────────────────────────────────────
  py += 8;
  doc.setFontSize(FONT_SUBTITLE);
  doc.setFont('helvetica', 'bold');
  const urLabel = 'URINES';
  const urW = doc.getTextWidth(urLabel);
  const urX = (PAGE_W - urW) / 2;
  doc.text(urLabel, urX, py);
  doc.setLineWidth(0.5);
  doc.line(urX - 2, py + 1.5, urX + urW + 2, py + 1.5);
  doc.setLineWidth(0.2);

  py += SECTION_GAP;
  doc.setFontSize(FONT_LABEL);
  doc.setFont('helvetica', 'normal');

  const halfW = CONTENT_W / 2;
  // Albumine
  doc.setFont('helvetica', 'bold');
  doc.text('Albumine :', M + 5, py);
  const albStart = M + 5 + doc.getTextWidth('Albumine :') + 3;
  doc.setFont('helvetica', 'normal');
  const albumineVal = formatUrines(patient.urines_albumine);
  if (albumineVal) doc.text(albumineVal, albStart, py);
  drawDots(doc, albStart + (albumineVal ? doc.getTextWidth(albumineVal) + 2 : 0), M + halfW - 5, py);

  // Sucre
  doc.setFont('helvetica', 'bold');
  doc.text('Sucre :', M + halfW + 5, py);
  const sucStart = M + halfW + 5 + doc.getTextWidth('Sucre :') + 3;
  doc.setFont('helvetica', 'normal');
  const sucreVal = formatUrines(patient.urines_sucre);
  if (sucreVal) doc.text(sucreVal, sucStart, py);
  drawDots(doc, sucStart + (sucreVal ? doc.getTextWidth(sucreVal) + 2 : 0), PAGE_W - M - 5, py);

  // ─── SAUVEGARDE ──────────────────────────────────
  const safeName = (patient.name || 'patient').replace(/\s+/g, '_');
  doc.save(`SIFCA_${safeName}_${formatDate().replace(/\//g, '-')}.pdf`);
};

// ════════════════════════════════════════════════════════════════
// 6 TYPES DE DOCUMENTS
// ════════════════════════════════════════════════════════════════

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
  { id: 'certificat-tension', label: 'Certificat de Tension', description: 'Certificat de prise de tension art\u00e9rielle' },
  { id: 'certificat-medical', label: 'Certificat M\u00e9dical', description: 'Attestation de bonne sant\u00e9' },
  { id: 'arret-travail', label: 'Arr\u00eat de Travail', description: "Certificat d'arr\u00eat ou prolongation de travail" },
  { id: 'certificat-grossesse', label: 'Certificat de Grossesse', description: 'Attestation de grossesse en cours' },
  { id: 'ordonnance-medicale', label: 'Ordonnance M\u00e9dicale', description: 'Prescription m\u00e9dicamenteuse' },
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

// ════════════════════════════════════════════════════════════════
// 2. CERTIFICAT DE PRISE DE TENSION
// ════════════════════════════════════════════════════════════════

function genCertificatTension(doc: jsPDF, d: SifcaDocData) {
  const headerY = drawSifcaHeader(doc);
  let y = drawTitle(doc, 'CERTIFICAT DE PRISE DE TENSION', headerY + 10);

  y += 6;
  y = drawField(doc, 'Je soussign\u00e9(e), Docteur :', d.medecin || '', y);
  y += 4;
  y = drawField(doc, 'Certifie que l\u2019\u00e9tat de sant\u00e9 de M/ Mme/ Mlle :', d.name || '', y);
  drawDots(doc, M, PAGE_W - M, y);
  y += SECTION_GAP;

  doc.setFontSize(FONT_LABEL);
  doc.setFont('helvetica', 'bold');
  doc.text('Est satisfaisant.', M, y);
  y += SECTION_GAP;

  doc.setFont('helvetica', 'normal');
  doc.text('Sa tension art\u00e9rielle de ce jour est :', M, y);
  y += SECTION_GAP;

  y = drawField(doc, 'Tension art\u00e9rielle bras droit :', d.tensionDroit || d.tension_arterielle || '', y);
  y += 2;
  y = drawField(doc, 'Tension art\u00e9rielle bras gauche :', d.tensionGauche || '', y);

  y += 20;
  drawSignature(doc, y);
}

// ════════════════════════════════════════════════════════════════
// 3. CERTIFICAT MÉDICAL
// ════════════════════════════════════════════════════════════════

function genCertificatMedical(doc: jsPDF, d: SifcaDocData) {
  const headerY = drawSifcaHeader(doc);
  let y = drawTitle(doc, 'CERTIFICAT MEDICAL', headerY + 10);

  y += 6;
  y = drawField(doc, 'Je soussign\u00e9, Dr :', d.medecin || '', y);
  y += 4;

  doc.setFontSize(FONT_LABEL);
  doc.setFont('helvetica', 'bold');
  doc.text('Certifie avoir examin\u00e9 :', M, y);
  y += LINE_GAP;

  y = drawField(doc, 'M/ Mme/ Mlle :', d.name || '', y);
  drawDots(doc, M, PAGE_W - M, y);
  y += SECTION_GAP + 4;

  doc.setFontSize(FONT_LABEL);
  doc.setFont('helvetica', 'bold');
  doc.text('Atteste qu\u2019il ou elle est en bonne sant\u00e9.', M, y);
  y += SECTION_GAP + 4;

  doc.setFontSize(FONT_BODY);
  doc.setFont('helvetica', 'normal');
  doc.text('En foi de quoi, je d\u00e9livre ce certificat pour servir et valoir ce que de droit.', M, y);

  y += 24;
  doc.setFontSize(FONT_SUBTITLE);
  doc.setFont('helvetica', 'bold');
  doc.text('LE MEDECIN', PAGE_W - M, y, { align: 'right' });
}

// ════════════════════════════════════════════════════════════════
// 4. ARRÊT DE TRAVAIL
// ════════════════════════════════════════════════════════════════

function genArretTravail(doc: jsPDF, d: SifcaDocData) {
  const headerY = drawSifcaHeader(doc);
  let y = drawTitle(doc, 'ARRET DE TRAVAIL', headerY + 10);

  y += 6;
  y = drawField(doc, 'Je soussign\u00e9(e), Docteur :', d.medecin || '', y);
  y += 4;
  y = drawField(doc, 'Certifie que l\u2019\u00e9tat de sant\u00e9 de :', d.name || '', y);
  drawDots(doc, M, PAGE_W - M, y);
  y += LINE_GAP;

  // Matricule + Direction sur même ligne
  doc.setFontSize(FONT_LABEL);
  doc.setFont('helvetica', 'bold');
  doc.text('Matricule :', M, y);
  const matW = doc.getTextWidth('Matricule :');
  if (d.matricule) {
    doc.setFont('helvetica', 'normal');
    doc.text(d.matricule, M + matW + 3, y);
  }
  drawDots(doc, M + matW + 3 + (d.matricule ? doc.getTextWidth(d.matricule) + 2 : 0), 100, y);

  doc.setFont('helvetica', 'bold');
  doc.text('Direction :', 105, y);
  drawDots(doc, 130, PAGE_W - M, y);
  y += LINE_GAP + 4;

  y = drawField(doc, '1) N\u00e9cessite un arr\u00eat de travail de :', d.arret || '', y);
  y += 2;
  y = drawField(doc, '2) N\u00e9cessite une prolongation de :', d.prolongation || '', y);
  y += 2;
  y = drawField(doc, 'Sauf complication, \u00e0 dater du :', d.dateComplication || '', y);

  y += 20;
  drawSignature(doc, y);
}

// ════════════════════════════════════════════════════════════════
// 5. CERTIFICAT DE GROSSESSE
// ════════════════════════════════════════════════════════════════

function genCertificatGrossesse(doc: jsPDF, d: SifcaDocData) {
  const headerY = drawSifcaHeader(doc);
  let y = drawTitle(doc, 'CERTIFICAT DE GROSSESSE', headerY + 10);

  y += 6;
  y = drawField(doc, 'Je soussign\u00e9, Docteur :', d.medecin || '', y);
  y += 4;
  y = drawField(doc, 'Certifie que Madame :', d.name || '', y);
  y += 4;
  y = drawField(doc, 'Est actuellement en cours d\u2019une grossesse de :', d.dureeGrossesse || '', y);
  y += 4;
  y = drawField(doc, 'Dont le terme est fix\u00e9 le :', d.terme || '', y);

  y += 20;
  drawSignature(doc, y);
}

// ════════════════════════════════════════════════════════════════
// 6. ORDONNANCE MÉDICALE
// ════════════════════════════════════════════════════════════════

function genOrdonnanceMedicale(doc: jsPDF, d: SifcaDocData) {
  const headerY = drawSifcaHeader(doc);
  let y = drawTitle(doc, 'ORDONNANCE MEDICALE', headerY + 10);

  y += 6;
  doc.setFontSize(FONT_LABEL);
  doc.setFont('helvetica', 'bold');
  doc.text('Docteur :', M, y);
  if (d.medecin) {
    doc.setFont('helvetica', 'normal');
    doc.text(d.medecin, M + doc.getTextWidth('Docteur :') + 3, y);
  }
  y += LINE_GAP;

  if (d.name) {
    doc.setFont('helvetica', 'bold');
    doc.text('Patient :', M, y);
    doc.setFont('helvetica', 'normal');
    doc.text(d.name, M + doc.getTextWidth('Patient :') + 3, y);
    y += LINE_GAP;
  }

  y += 4;
  drawSeparator(doc, y, 0.3);
  y += 8;

  if (d.prescriptions && d.prescriptions.length > 0) {
    doc.setFontSize(FONT_LABEL);
    d.prescriptions.forEach((rx, i) => {
      doc.setFont('helvetica', 'normal');
      doc.text(`${i + 1}.`, M + 5, y);
      doc.text(rx, M + 14, y);
      y += LINE_GAP + 2;
    });
  } else {
    // Lignes vides pour prescription manuscrite
    doc.setFontSize(FONT_BODY);
    for (let i = 0; i < 12; i++) {
      doc.setLineWidth(0.15);
      doc.setDrawColor(180);
      doc.line(M, y, PAGE_W - M, y);
      y += 10;
    }
    doc.setDrawColor(0);
  }
}

// ════════════════════════════════════════════════════════════════
// 7. BULLETIN DE CONSULTATION
// ════════════════════════════════════════════════════════════════

function genBulletinConsultation(doc: jsPDF, d: SifcaDocData) {
  const headerY = drawSifcaHeader(doc);
  let y = drawTitle(doc, 'BULLETIN DE CONSULTATION', headerY + 10);

  y += 6;
  y = drawField(doc, 'SERVICE :', d.service || '', y);

  const lastName = d.last_name || d.name?.split(' ').slice(-1)[0] || '';
  const firstName = d.first_name || d.name?.split(' ').slice(0, -1).join(' ') || '';

  y = drawField(doc, 'NOM :', lastName.toUpperCase(), y);
  y = drawField(doc, 'PRENOM :', firstName, y);

  // AGE + SEXE sur même ligne
  doc.setFontSize(FONT_LABEL);
  doc.setFont('helvetica', 'bold');
  doc.text('AGE :', M, y);
  const age = calculateAge(d.date_of_birth);
  if (age) { doc.setFont('helvetica', 'normal'); doc.text(age, M + 15, y); }
  drawDots(doc, M + 15 + (age ? doc.getTextWidth(age) + 2 : 0), 95, y);

  doc.setFont('helvetica', 'bold');
  doc.text('SEXE :', 100, y);
  const sexe = d.gender || '';
  if (sexe) { doc.setFont('helvetica', 'normal'); doc.text(sexe, 118, y); }
  drawDots(doc, 118 + (sexe ? doc.getTextWidth(sexe) + 2 : 0), PAGE_W - M, y);
  y += LINE_GAP;

  y = drawField(doc, 'CONSULTATION EN :', d.consultationEn || '', y);

  y += 4;
  // Lignes pour notes
  for (let i = 0; i < 6; i++) {
    doc.setLineWidth(0.15);
    doc.setDrawColor(180);
    doc.line(M, y, PAGE_W - M, y);
    doc.setDrawColor(0);
    y += 8;
  }

  y += 4;
  doc.setFontSize(FONT_SUBTITLE);
  doc.setFont('helvetica', 'bold');
  doc.text('RENSEIGNEMENTS CLINIQUES', M, y);
  y += LINE_GAP;

  if (d.renseignementsCliniques) {
    doc.setFontSize(FONT_BODY);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(d.renseignementsCliniques, CONTENT_W);
    doc.text(lines, M, y);
    y += lines.length * 5;
  }

  // Lignes pour notes cliniques
  for (let i = 0; i < 4; i++) {
    doc.setLineWidth(0.15);
    doc.setDrawColor(180);
    doc.line(M, y, PAGE_W - M, y);
    doc.setDrawColor(0);
    y += 8;
  }

  y += 10;
  doc.setFontSize(FONT_LABEL);
  doc.setFont('helvetica', 'bold');
  doc.text('Signature et cachet du M\u00e9decin', PAGE_W - M, y, { align: 'right' });
}

// ════════════════════════════════════════════════════════════════
// DISPATCH PRINCIPAL
// ════════════════════════════════════════════════════════════════

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
