import { jsPDF } from 'jspdf';
import { SIFCA_LOGO_BW } from './sifcaLogoBw';
import { DOCTOR_STAMP } from './doctorStamp';
import { STAMP_KARAMA } from './stampKarama';
import { STAMP_ZAGO } from './stampZago';
import { getUser } from './auth';

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

export interface ReportData {
  period: string; // "2026-05"
  reportType: string;
  stats: {
    totalPatients: number;
    newPatients: number;
    activePatients: number;
    inTreatment: number;
    recovered: number;
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    pendingAppointments: number;
    totalConsultations: number;
    maleCount: number;
    femaleCount: number;
  };
  patients: { name: string; date_of_birth: string; gender: string; status: string; created_at: string; primary_pathology: string }[];
  appointments: { patient_name: string; appointment_date: string; appointment_time: string; status: string; type_consultation: string }[];
}

// ════════════════════════════════════════════════════════════════
// CONSTANTES
// ════════════════════════════════════════════════════════════════

const PAGE_W = 210;
const PAGE_H = 297;
const M = 15;
const CONTENT_W = PAGE_W - M * 2;

const COLOR_PRIMARY = [0, 51, 102] as const;    // Bleu foncé
const COLOR_ACCENT = [0, 128, 128] as const;     // Teal
const COLOR_GRAY = [100, 100, 100] as const;
const COLOR_LIGHT_GRAY = [220, 220, 220] as const;
const COLOR_WHITE = [255, 255, 255] as const;
const COLOR_BG_LIGHT = [245, 247, 250] as const;

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════

function checkNewPage(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - 30) {
    doc.addPage();
    return 20;
  }
  return y;
}

function formatPeriod(period: string): string {
  const [year, month] = period.split('-');
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  return `${months[parseInt(month) - 1]} ${year}`;
}

function getReportTitle(type: string): string {
  const titles: Record<string, string> = {
    monthly: 'Rapport Mensuel',
    quarterly: 'Rapport Trimestriel',
    annual: 'Rapport Annuel',
    performance: 'Rapport de Performance',
    patients: 'Rapport Patients',
    activity: "Rapport d'Activité",
    analytics: 'Rapport Analytique',
    custom: 'Rapport Personnalisé',
  };
  return titles[type] || 'Rapport';
}

// ════════════════════════════════════════════════════════════════
// DRAWING FUNCTIONS
// ════════════════════════════════════════════════════════════════

function drawHeader(doc: jsPDF, data: ReportData): number {
  // Logo
  doc.addImage(SIFCA_LOGO_BW, 'PNG', M, 8, 45, 32);

  // Company info
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_GRAY);
  doc.text('S.A au capital de 4 002 935 000', M, 44);
  doc.text('01 BP 1289 ABIDJAN 01 – RC : ABIDJAN N°4254', M, 48);
  doc.text('Tél: (225) 27 21 75 75 75 – Fax: (225) 27 21 75 75 99', M, 52);

  // Date on the right
  doc.setFontSize(9);
  doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, PAGE_W - M, 12, { align: 'right' });

  // Title bar
  const titleY = 60;
  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(M, titleY, CONTENT_W, 14, 'F');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_WHITE);
  doc.text(getReportTitle(data.reportType).toUpperCase(), PAGE_W / 2, titleY + 9.5, { align: 'center' });

  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text(`Période : ${formatPeriod(data.period)}`, PAGE_W / 2, titleY + 22, { align: 'center' });

  // Separator
  doc.setDrawColor(...COLOR_ACCENT);
  doc.setLineWidth(0.5);
  doc.line(M, titleY + 26, PAGE_W - M, titleY + 26);

  return titleY + 32;
}

function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  y = checkNewPage(doc, y, 15);
  doc.setFillColor(...COLOR_ACCENT);
  doc.rect(M, y, 4, 8, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_PRIMARY);
  doc.text(title, M + 8, y + 6);
  doc.setDrawColor(...COLOR_LIGHT_GRAY);
  doc.setLineWidth(0.3);
  doc.line(M + 8, y + 9, PAGE_W - M, y + 9);
  return y + 14;
}

function drawStatCard(doc: jsPDF, x: number, y: number, w: number, label: string, value: string | number, color: readonly [number, number, number]) {
  // Card background
  doc.setFillColor(...COLOR_BG_LIGHT);
  doc.roundedRect(x, y, w, 22, 2, 2, 'F');

  // Colored left border
  doc.setFillColor(...color);
  doc.rect(x, y, 3, 22, 'F');

  // Value
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...color);
  doc.text(String(value), x + 8, y + 10);

  // Label
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_GRAY);
  doc.text(label, x + 8, y + 17);
}

function drawStatsSection(doc: jsPDF, data: ReportData, y: number): number {
  y = drawSectionTitle(doc, 'RÉSUMÉ STATISTIQUE', y);

  const cardW = (CONTENT_W - 9) / 4;

  // Row 1
  drawStatCard(doc, M, y, cardW, 'Total Patients', data.stats.totalPatients, COLOR_PRIMARY);
  drawStatCard(doc, M + cardW + 3, y, cardW, 'Nouveaux', data.stats.newPatients, COLOR_ACCENT);
  drawStatCard(doc, M + (cardW + 3) * 2, y, cardW, 'En traitement', data.stats.inTreatment, [220, 120, 0]);
  drawStatCard(doc, M + (cardW + 3) * 3, y, cardW, 'Guéris', data.stats.recovered, [0, 150, 80]);
  y += 28;

  // Row 2
  drawStatCard(doc, M, y, cardW, 'RDV Total', data.stats.totalAppointments, COLOR_PRIMARY);
  drawStatCard(doc, M + cardW + 3, y, cardW, 'Honorés', data.stats.completedAppointments, [0, 150, 80]);
  drawStatCard(doc, M + (cardW + 3) * 2, y, cardW, 'Annulés', data.stats.cancelledAppointments, [200, 50, 50]);
  drawStatCard(doc, M + (cardW + 3) * 3, y, cardW, 'Consultations', data.stats.totalConsultations, [120, 80, 200]);
  y += 28;

  // Gender distribution
  y = checkNewPage(doc, y, 20);
  const total = data.stats.maleCount + data.stats.femaleCount || 1;
  const mPct = Math.round((data.stats.maleCount / total) * 100);
  const fPct = 100 - mPct;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_GRAY);
  doc.text('Répartition par genre', M, y + 4);

  // Bar
  const barX = M;
  const barY = y + 7;
  const barW = CONTENT_W;
  const barH = 6;
  const maleW = (barW * mPct) / 100;

  doc.setFillColor(59, 130, 246);
  doc.roundedRect(barX, barY, maleW, barH, 1, 1, 'F');
  doc.setFillColor(236, 72, 153);
  doc.roundedRect(barX + maleW, barY, barW - maleW, barH, 1, 1, 'F');

  doc.setFontSize(7);
  doc.setTextColor(59, 130, 246);
  doc.text(`Hommes: ${data.stats.maleCount} (${mPct}%)`, M, barY + barH + 6);
  doc.setTextColor(236, 72, 153);
  doc.text(`Femmes: ${data.stats.femaleCount} (${fPct}%)`, M + 60, barY + barH + 6);

  return barY + barH + 12;
}

function drawPatientsTable(doc: jsPDF, data: ReportData, y: number): number {
  y = drawSectionTitle(doc, 'LISTE DES PATIENTS', y);

  const patients = data.patients.slice(0, 25); // Max 25 in table
  if (patients.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_GRAY);
    doc.text('Aucun patient enregistré pour cette période.', M, y + 5);
    return y + 12;
  }

  // Table header
  const cols = [
    { label: 'Nom', x: M, w: 50 },
    { label: 'Âge', x: M + 50, w: 20 },
    { label: 'Genre', x: M + 70, w: 25 },
    { label: 'Pathologie', x: M + 95, w: 45 },
    { label: 'Statut', x: M + 140, w: 25 },
    { label: 'Date', x: M + 165, w: 30 },
  ];

  y = checkNewPage(doc, y, 10);
  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(M, y, CONTENT_W, 7, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_WHITE);
  cols.forEach(c => doc.text(c.label, c.x + 2, y + 5));
  y += 7;

  // Table rows
  doc.setFont('helvetica', 'normal');
  patients.forEach((p, i) => {
    y = checkNewPage(doc, y, 7);
    if (i % 2 === 0) {
      doc.setFillColor(...COLOR_BG_LIGHT);
      doc.rect(M, y, CONTENT_W, 6.5, 'F');
    }
    doc.setFontSize(7);
    doc.setTextColor(30, 30, 30);

    const age = p.date_of_birth ? `${Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / 31557600000)} ans` : '-';
    const gender = p.gender === 'male' ? 'M' : p.gender === 'female' ? 'F' : (p.gender || '-');
    const status = p.status === 'active' ? 'Actif' : p.status === 'in_treatment' ? 'Traitement' : p.status === 'recovered' ? 'Guéri' : p.status || '-';
    const date = p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '-';

    doc.text((p.name || '').substring(0, 25), cols[0].x + 2, y + 4.5);
    doc.text(age, cols[1].x + 2, y + 4.5);
    doc.text(gender, cols[2].x + 2, y + 4.5);
    doc.text((p.primary_pathology || '-').substring(0, 22), cols[3].x + 2, y + 4.5);
    doc.text(status, cols[4].x + 2, y + 4.5);
    doc.text(date, cols[5].x + 2, y + 4.5);
    y += 6.5;
  });

  if (data.patients.length > 25) {
    doc.setFontSize(7);
    doc.setTextColor(...COLOR_GRAY);
    doc.text(`... et ${data.patients.length - 25} autres patients`, M, y + 5);
    y += 8;
  }

  return y + 5;
}

function drawAppointmentsTable(doc: jsPDF, data: ReportData, y: number): number {
  y = drawSectionTitle(doc, 'RENDEZ-VOUS DU MOIS', y);

  const appointments = data.appointments.slice(0, 20);
  if (appointments.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_GRAY);
    doc.text('Aucun rendez-vous pour cette période.', M, y + 5);
    return y + 12;
  }

  const cols = [
    { label: 'Patient', x: M, w: 55 },
    { label: 'Date', x: M + 55, w: 30 },
    { label: 'Heure', x: M + 85, w: 20 },
    { label: 'Type', x: M + 105, w: 40 },
    { label: 'Statut', x: M + 145, w: 35 },
  ];

  y = checkNewPage(doc, y, 10);
  doc.setFillColor(...COLOR_ACCENT);
  doc.rect(M, y, CONTENT_W, 7, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_WHITE);
  cols.forEach(c => doc.text(c.label, c.x + 2, y + 5));
  y += 7;

  doc.setFont('helvetica', 'normal');
  appointments.forEach((a, i) => {
    y = checkNewPage(doc, y, 7);
    if (i % 2 === 0) {
      doc.setFillColor(...COLOR_BG_LIGHT);
      doc.rect(M, y, CONTENT_W, 6.5, 'F');
    }
    doc.setFontSize(7);
    doc.setTextColor(30, 30, 30);

    const status = a.status === 'termine' ? 'Terminé' : a.status === 'annule' ? 'Annulé' : a.status === 'a_venir' ? 'À venir' : a.status || '-';
    const date = a.appointment_date ? new Date(a.appointment_date + 'T00:00:00').toLocaleDateString('fr-FR') : '-';
    const time = a.appointment_time ? String(a.appointment_time).substring(0, 5) : '-';

    doc.text((a.patient_name || '').substring(0, 28), cols[0].x + 2, y + 4.5);
    doc.text(date, cols[1].x + 2, y + 4.5);
    doc.text(time, cols[2].x + 2, y + 4.5);
    doc.text((a.type_consultation || 'Consultation').substring(0, 20), cols[3].x + 2, y + 4.5);
    doc.text(status, cols[4].x + 2, y + 4.5);
    y += 6.5;
  });

  return y + 5;
}

function drawFooter(doc: jsPDF, y: number) {
  y = checkNewPage(doc, y, 40);

  // Separator
  doc.setDrawColor(...COLOR_PRIMARY);
  doc.setLineWidth(0.5);
  doc.line(M, y, PAGE_W - M, y);
  y += 8;

  // Doctor stamp
  const user = getUser();
  const username = user?.username || '';
  let stampImg = DOCTOR_STAMP;
  let stampW = 55;
  let stampH = 22;

  if (username === 'pr.karama' || username.includes('karama')) {
    stampImg = STAMP_KARAMA;
    stampW = 45;
    stampH = 38;
  } else if (username === 'dr.zago' || username.includes('zago')) {
    stampImg = STAMP_ZAGO;
    stampW = 55;
    stampH = 22;
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_GRAY);
  doc.text(`Fait à Abidjan, le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`, 95, y);
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Le Médecin :', 140, y);
  y += 8;

  doc.addImage(stampImg, 'PNG', 140, y, stampW, stampH);

  // Page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLOR_GRAY);
    doc.text(`Page ${i}/${pageCount}`, PAGE_W / 2, PAGE_H - 8, { align: 'center' });
    doc.text('Centre Médico-Social SIFCA — Rapport confidentiel', PAGE_W / 2, PAGE_H - 4, { align: 'center' });
  }
}

// ════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════════════════════════════════

export function generateReportPDF(data: ReportData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  let y = drawHeader(doc, data);
  y = drawStatsSection(doc, data, y);
  y = drawPatientsTable(doc, data, y);
  y = drawAppointmentsTable(doc, data, y);
  drawFooter(doc, y);

  const periodLabel = data.period.replace('-', '_');
  doc.save(`Rapport_SIFCA_${getReportTitle(data.reportType).replace(/\s+/g, '_')}_${periodLabel}.pdf`);
}
