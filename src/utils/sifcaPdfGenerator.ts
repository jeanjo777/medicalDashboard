import { jsPDF } from 'jspdf';
import { SIFCA_LOGO_BW } from './sifcaLogoBw';
import { DOCTOR_STAMP } from './doctorStamp';

// ════════════════════════════════════════════════════════════════
// CONSTANTES DE DESIGN
// ════════════════════════════════════════════════════════════════

const PAGE_W = 210;
const M = 15; // marge gauche/droite
const CONTENT_W = PAGE_W - M * 2; // 180mm

// Logo (plus grand, bien visible)
const LOGO_W = 50;
const LOGO_H = 36;

// Hierarchie typographique claire
const FONT_DOC_TITLE = 16;  // Titre du document (CERTIFICAT MEDICAL, etc.)
const FONT_SECTION = 13;    // Sections (URINES, RENSEIGNEMENTS CLINIQUES)
const FONT_VALUE = 12;      // Valeurs patient (BARRY, Aissatou, 37°C)
const FONT_LABEL = 9;       // Labels de champ (Nom du malade, Prenoms)
const FONT_BODY = 11;       // Texte courant (phrases)
const FONT_COORD = 9;       // Coordonnees societe

// Couleurs
const COLOR_LABEL = 100;    // Gris pour labels
const COLOR_VALUE = 0;      // Noir pour valeurs

// Espacement
const FIELD_GAP = 12;       // Entre champs (label+value)
const SECTION_GAP = 14;

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
  taille?: number | null;
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

const formatDateLong = (): string => {
  return new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// ════════════════════════════════════════════════════════════════
// PRIMITIVES DE DESSIN
// ════════════════════════════════════════════════════════════════

/** Ligne de separation horizontale */
function drawSeparator(doc: jsPDF, y: number, weight = 0.5) {
  doc.setLineWidth(weight);
  doc.setDrawColor(0);
  doc.line(M, y, PAGE_W - M, y);
  doc.setLineWidth(0.2);
}

/**
 * Champ medical : petit label gris en haut, grande valeur noire bold en dessous
 * Rendu professionnel type formulaire medical
 */
function drawMedicalField(doc: jsPDF, label: string, value: string, y: number): number {
  // Label petit et gris
  doc.setFontSize(FONT_LABEL);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLOR_LABEL);
  doc.text(label, M, y);

  // Valeur grande et noire bold
  doc.setFontSize(FONT_VALUE);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLOR_VALUE);
  doc.text(value || '', M, y + 5.5);

  doc.setFont('helvetica', 'normal');
  return y + FIELD_GAP;
}

/**
 * Champ inline : label (normal) + valeur (bold) sur la meme ligne
 * Pour les certificats et documents formels
 */
function drawInlineField(doc: jsPDF, label: string, value: string, y: number, fontSize?: number): number {
  const fs = fontSize || FONT_BODY;
  doc.setFontSize(fs);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLOR_VALUE);
  doc.text(label, M, y);
  const lw = doc.getTextWidth(label);

  if (value) {
    doc.setFont('helvetica', 'bold');
    doc.text(value, M + lw + 2, y);
  }
  doc.setFont('helvetica', 'normal');
  return y + 8;
}

/** Titre de document dans un cadre centre */
function drawTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(FONT_DOC_TITLE);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLOR_VALUE);
  const tw = doc.getTextWidth(title);
  const bx = (PAGE_W - tw - 20) / 2;

  doc.setLineWidth(0.8);
  doc.rect(bx, y - 8, tw + 20, 14);
  doc.text(title, (PAGE_W - tw) / 2, y + 2);
  doc.setLineWidth(0.2);
  doc.setFont('helvetica', 'normal');
  return y + 22;
}

/** Bloc signature + cachet du m\u00e9decin */
function drawSignature(doc: jsPDF, y: number): number {
  doc.setFontSize(FONT_BODY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLOR_VALUE);
  doc.text(`Fait \u00e0 Abidjan, le ${formatDateLong()}`, 95, y);
  y += 18;
  doc.setFont('helvetica', 'bold');
  doc.text('Le M\u00e9decin :', 130, y);
  y += 10;

  // Cachet du médecin (image du tampon physique)
  const stampW = 55;
  const stampH = 22;
  const stampX = 140;
  const stampY = y - 2;
  doc.addImage(DOCTOR_STAMP, 'PNG', stampX, stampY, stampW, stampH);
  return stampY + stampH;
}

// ════════════════════════════════════════════════════════════════
// EN-TETE SIFCA (partage par les 6 documents certificats)
// ════════════════════════════════════════════════════════════════

function drawSifcaHeader(doc: jsPDF): number {
  // Logo grand et bien visible
  doc.addImage(SIFCA_LOGO_BW, 'PNG', M, 8, LOGO_W, LOGO_H);

  // Coordonnees societe sous le logo (plus grosses)
  doc.setFontSize(FONT_COORD);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60);
  doc.text('S.A au capital de 4 002 935 000 FCFA', M, 48);
  doc.text('01 BP 1289 ABIDJAN 01 \u2013 RC: ABIDJAN N\u00b04254', M, 53);
  doc.text('T\u00e9l: (225) 27 21 75 75 75 \u2013 Fax: (225) 27 21 75 75 99', M, 58);
  doc.setTextColor(0);

  // CENTRE MEDICO-SOCIAL (en haut a droite, grand)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CENTRE MEDICO-SOCIAL', PAGE_W - M, 20, { align: 'right' });

  // Date en haut a droite
  doc.setFontSize(FONT_BODY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date : ${formatDate()}`, PAGE_W - M, 30, { align: 'right' });

  // Separateur
  drawSeparator(doc, 63, 0.6);

  return 63;
}

// ════════════════════════════════════════════════════════════════
// 1. FICHE CMS (Centre Medico-Social)
// ════════════════════════════════════════════════════════════════

export const generateSifcaPDF = (patient: PatientData): void => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const VAL_X = 65; // x position where values start (aligned)

  /** Draw a form row: label ........ value (with dotted underline) */
  const drawFormRow = (label: string, value: string, y: number, opts?: { half?: 'left' | 'right' }): number => {
    const startX = opts?.half === 'right' ? PAGE_W / 2 + 5 : M;
    const endX = opts?.half === 'left' ? PAGE_W / 2 - 5 : PAGE_W - M;
    const valX = opts?.half ? startX + 40 : VAL_X;

    doc.setFontSize(FONT_BODY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLOR_VALUE);
    doc.text(label, startX, y);

    // Dotted underline from value start to end
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    const dots = [];
    for (let x = valX; x < endX; x += 1.5) {
      dots.push(x);
    }
    dots.forEach(x => doc.line(x, y + 1, x + 0.5, y + 1));
    doc.setDrawColor(0);

    if (value) {
      doc.setFont('helvetica', 'bold');
      doc.text(value, valX + 2, y);
    }
    doc.setFont('helvetica', 'normal');
    return y;
  };

  // ─── EN-TETE ─────────────────────────────────────
  doc.addImage(SIFCA_LOGO_BW, 'PNG', M, 8, LOGO_W, LOGO_H);

  // Coordonnees societe
  doc.setFontSize(FONT_COORD);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60);
  doc.text('S.A au capital de 4 002 935 000 FCFA', M, 48);
  doc.text('CENTRE MEDICO-SOCIAL', M, 53);
  doc.setTextColor(0);

  // Date (droite)
  doc.setFontSize(FONT_BODY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date : ${formatDate()}`, PAGE_W - M, 14, { align: 'right' });

  // Medecin
  drawFormRow('MEDECIN :', patient.medecin || '', 58);

  drawSeparator(doc, 63, 0.6);

  // ─── TYPES DE VISITE + FILIALES ──────────────────
  const col2X = 110;

  // Titre colonne gauche
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLOR_VALUE);
  doc.text('TYPE DE VISITE', M, 70);

  // Titre FILIALES
  doc.text('FILIALES', col2X, 70);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(FONT_BODY);

  // Types de visite (colonne gauche) — checkboxes
  const visits = [
    { label: 'Consultation', key: 'consultation' },
    { label: 'Visite Systématique', key: 'systematique' },
    { label: "Visite d'embauche", key: 'embauche' },
  ];
  let vy = 78;
  visits.forEach((v) => {
    doc.rect(M, vy - 3.2, 3.5, 3.5);
    if (patient.visitType === v.key) {
      doc.setFont('helvetica', 'bold');
      doc.text('X', M + 0.6, vy);
      doc.setFont('helvetica', 'normal');
    }
    doc.text(v.label, M + 6, vy);
    vy += 8;
  });

  // Filiales (colonne droite) — checkboxes
  const filiales = ['AUTRES', 'SIFCA', 'SAPH', 'PALMCI', 'SANIA', 'SUCRIVOIRE', 'SIFCOMASSUR'];
  let fy = 78;
  filiales.forEach((f) => {
    doc.rect(col2X, fy - 3.2, 3.5, 3.5);
    if (patient.filiale === f) {
      doc.setFont('helvetica', 'bold');
      doc.text('X', col2X + 0.6, fy);
      doc.setFont('helvetica', 'normal');
    }
    doc.text(f, col2X + 6, fy);
    fy += 7;
  });

  drawSeparator(doc, 130, 0.6);

  // ─── INFORMATIONS PATIENT ────────────────────────
  let py = 140;

  const lastName = patient.last_name || patient.name?.split(' ').slice(1).join(' ') || '';
  const firstName = patient.first_name || patient.name?.split(' ')[0] || '';

  drawFormRow('Nom du malade :', lastName.toUpperCase(), py);
  py += 10;
  drawFormRow('Prénoms :', firstName, py);
  py += 10;

  // Age + Sexe on same line (two halves)
  drawFormRow('Age :', calculateAge(patient.date_of_birth), py, { half: 'left' });
  drawFormRow('Sexe :', patient.gender === 'male' ? 'M' : patient.gender === 'female' ? 'F' : (patient.gender || ''), py, { half: 'right' });
  py += 10;

  drawFormRow('Température :', patient.temperature != null ? `${patient.temperature} °C` : '', py);
  py += 10;

  // Poids + Taille on same line
  drawFormRow('Poids :', patient.poids != null ? `${patient.poids} kg` : '', py, { half: 'left' });
  drawFormRow('Taille :', patient.taille != null ? `${patient.taille} cm` : '', py, { half: 'right' });
  py += 10;

  drawFormRow('T.A (Tension Artérielle) :', patient.tension_arterielle || '', py);
  py += 10;

  drawFormRow('Glycémie :', patient.glycemie != null ? `${patient.glycemie} g/L` : '', py);
  py += 6;

  drawSeparator(doc, py + 4, 0.6);

  // ─── URINES ──────────────────────────────────────
  py += 14;
  doc.setFontSize(FONT_SECTION);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLOR_VALUE);
  const urLabel = 'URINES';
  const urW = doc.getTextWidth(urLabel);
  doc.text(urLabel, (PAGE_W - urW) / 2, py);

  py += 10;

  const albumineVal = formatUrines(patient.urines_albumine);
  const sucreVal = formatUrines(patient.urines_sucre);

  drawFormRow('Albumine :', albumineVal, py, { half: 'left' });
  drawFormRow('Sucre :', sucreVal, py, { half: 'right' });

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
  direction?: string;
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
  let y = drawTitle(doc, 'CERTIFICAT DE PRISE DE TENSION', headerY + 12);

  y += 8;
  y = drawInlineField(doc, 'Je soussign\u00e9(e), Docteur : ', d.medecin || '', y);
  y += 6;
  y = drawInlineField(doc, 'Certifie que l\u2019\u00e9tat de sant\u00e9 de M/ Mme/ Mlle : ', d.name || '', y);
  y += 6;

  y = drawInlineField(doc, 'Poids : ', d.poids ? `${d.poids} kg` : '', y);
  y += 4;
  y = drawInlineField(doc, 'Taille : ', d.taille ? `${d.taille} cm` : '', y);
  y += 6;

  doc.setFontSize(FONT_BODY);
  doc.setFont('helvetica', 'bold');
  doc.text('Est satisfaisant.', M, y);
  y += SECTION_GAP;

  doc.setFont('helvetica', 'normal');
  doc.text('Sa tension art\u00e9rielle de ce jour est :', M, y);
  y += SECTION_GAP;

  y = drawInlineField(doc, 'Tension art\u00e9rielle bras droit : ', d.tensionDroit || d.tension_arterielle || '', y);
  y += 4;
  y = drawInlineField(doc, 'Tension art\u00e9rielle bras gauche : ', d.tensionGauche || '', y);

  y += 24;
  drawSignature(doc, y);
}

// ════════════════════════════════════════════════════════════════
// 3. CERTIFICAT MEDICAL
// ════════════════════════════════════════════════════════════════

function genCertificatMedical(doc: jsPDF, d: SifcaDocData) {
  const headerY = drawSifcaHeader(doc);
  let y = drawTitle(doc, 'CERTIFICAT MEDICAL', headerY + 12);

  y += 8;
  y = drawInlineField(doc, 'Je soussign\u00e9, Dr : ', d.medecin || '', y);
  y += 6;

  doc.setFontSize(FONT_BODY);
  doc.setFont('helvetica', 'bold');
  doc.text('Certifie avoir examin\u00e9 :', M, y);
  y += 10;

  y = drawInlineField(doc, 'M/ Mme/ Mlle : ', d.name || '', y);
  y += SECTION_GAP + 4;

  doc.setFontSize(FONT_BODY);
  doc.setFont('helvetica', 'bold');
  doc.text('Atteste qu\u2019il ou elle est en bonne sant\u00e9.', M, y);
  y += SECTION_GAP + 6;

  doc.setFontSize(FONT_BODY);
  doc.setFont('helvetica', 'normal');
  doc.text('En foi de quoi, je d\u00e9livre ce certificat pour servir et valoir ce que de droit.', M, y);

  y += 28;
  doc.setFontSize(FONT_SECTION);
  doc.setFont('helvetica', 'bold');
  doc.text('LE MEDECIN', PAGE_W - M, y, { align: 'right' });
}

// ════════════════════════════════════════════════════════════════
// 4. ARRET DE TRAVAIL
// ════════════════════════════════════════════════════════════════

function genArretTravail(doc: jsPDF, d: SifcaDocData) {
  const headerY = drawSifcaHeader(doc);
  let y = drawTitle(doc, 'ARRET DE TRAVAIL', headerY + 12);

  y += 8;
  y = drawInlineField(doc, 'Je soussign\u00e9(e), Docteur : ', d.medecin || '', y);
  y += 6;
  y = drawInlineField(doc, 'Certifie que l\u2019\u00e9tat de sant\u00e9 de : ', d.name || '', y);
  y += 6;

  // Matricule + Direction sur meme ligne
  doc.setFontSize(FONT_BODY);
  doc.setFont('helvetica', 'normal');
  doc.text('Matricule :', M, y);
  const matW = doc.getTextWidth('Matricule :');
  if (d.matricule) {
    doc.setFont('helvetica', 'bold');
    doc.text(d.matricule, M + matW + 3, y);
  }

  doc.setFont('helvetica', 'normal');
  doc.text('Direction :', 105, y);
  const dirW = doc.getTextWidth('Direction :');
  if (d.direction) {
    doc.setFont('helvetica', 'bold');
    doc.text(d.direction, 105 + dirW + 3, y);
  }
  y += 12;

  y = drawInlineField(doc, '1) N\u00e9cessite un arr\u00eat de travail de : ', d.arret || '', y);
  y += 4;
  y = drawInlineField(doc, '2) N\u00e9cessite une prolongation de : ', d.prolongation || '', y);
  y += 4;
  y = drawInlineField(doc, 'Sauf complication, \u00e0 dater du : ', d.dateComplication || '', y);

  y += 24;
  drawSignature(doc, y);
}

// ════════════════════════════════════════════════════════════════
// 5. CERTIFICAT DE GROSSESSE
// ════════════════════════════════════════════════════════════════

function genCertificatGrossesse(doc: jsPDF, d: SifcaDocData) {
  const headerY = drawSifcaHeader(doc);
  let y = drawTitle(doc, 'CERTIFICAT DE GROSSESSE', headerY + 12);

  y += 8;
  y = drawInlineField(doc, 'Je soussign\u00e9, Docteur : ', d.medecin || '', y);
  y += 6;
  y = drawInlineField(doc, 'Certifie que Madame : ', d.name || '', y);
  y += 6;
  y = drawInlineField(doc, 'Est actuellement en cours d\u2019une grossesse de : ', d.dureeGrossesse || '', y);
  y += 6;
  const termeDisplay = d.terme ? new Date(d.terme + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  y = drawInlineField(doc, 'Dont le terme est fixé le : ', termeDisplay, y);

  y += 24;
  drawSignature(doc, y);
}

// ════════════════════════════════════════════════════════════════
// 6. ORDONNANCE MEDICALE
// ════════════════════════════════════════════════════════════════

function genOrdonnanceMedicale(doc: jsPDF, d: SifcaDocData) {
  const headerY = drawSifcaHeader(doc);
  let y = drawTitle(doc, 'ORDONNANCE MEDICALE', headerY + 12);

  y += 8;
  // Docteur
  doc.setFontSize(FONT_LABEL);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLOR_LABEL);
  doc.text('Docteur', M, y);
  doc.setFontSize(FONT_VALUE);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLOR_VALUE);
  doc.text(d.medecin || '', M, y + 5.5);
  y += FIELD_GAP;

  // Patient
  if (d.name) {
    doc.setFontSize(FONT_LABEL);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLOR_LABEL);
    doc.text('Patient', M, y);
    doc.setFontSize(FONT_VALUE);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLOR_VALUE);
    doc.text(d.name, M, y + 5.5);
    y += FIELD_GAP;
  }

  y += 4;
  drawSeparator(doc, y, 0.3);
  y += 10;

  if (d.prescriptions && d.prescriptions.length > 0) {
    doc.setFontSize(FONT_BODY);
    d.prescriptions.forEach((rx, i) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLOR_VALUE);
      doc.text(`${i + 1}.`, M + 5, y);
      doc.setFont('helvetica', 'normal');
      doc.text(rx, M + 14, y);
      y += 10;
    });
  }

  y += 24;
  drawSignature(doc, y);
}

// ════════════════════════════════════════════════════════════════
// 7. BULLETIN DE CONSULTATION
// ════════════════════════════════════════════════════════════════

function genBulletinConsultation(doc: jsPDF, d: SifcaDocData) {
  const headerY = drawSifcaHeader(doc);
  let y = drawTitle(doc, 'BULLETIN DE CONSULTATION', headerY + 12);

  y += 6;
  y = drawMedicalField(doc, 'SERVICE', d.service || '', y);

  const lastName = d.last_name || d.name?.split(' ').slice(-1)[0] || '';
  const firstName = d.first_name || d.name?.split(' ').slice(0, -1).join(' ') || '';

  y = drawMedicalField(doc, 'NOM', lastName.toUpperCase(), y);
  y = drawMedicalField(doc, 'PRENOM', firstName, y);

  // AGE + SEXE cote a cote
  doc.setFontSize(FONT_LABEL);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLOR_LABEL);
  doc.text('AGE', M, y);
  doc.text('SEXE', 100, y);

  doc.setFontSize(FONT_VALUE);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLOR_VALUE);
  doc.text(calculateAge(d.date_of_birth) || '', M, y + 5.5);
  const sexLabel = d.gender === 'male' ? 'Masculin' : d.gender === 'female' ? 'Féminin' : (d.gender || '');
  doc.text(sexLabel, 100, y + 5.5);
  y += FIELD_GAP;

  y = drawMedicalField(doc, 'CONSULTATION EN', d.consultationEn || '', y);

  y += 8;
  doc.setFontSize(FONT_SECTION);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLOR_VALUE);
  doc.text('RENSEIGNEMENTS CLINIQUES', M, y);
  y += 10;

  if (d.renseignementsCliniques) {
    doc.setFontSize(FONT_BODY);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(d.renseignementsCliniques, CONTENT_W);
    doc.text(lines, M, y);
    y += lines.length * 6;
  }

  y += 16;
  drawSignature(doc, y);
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
