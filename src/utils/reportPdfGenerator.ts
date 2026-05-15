import { jsPDF } from 'jspdf';
import { SIFCA_LOGO_BW } from './sifcaLogoBw';
import { DOCTOR_STAMP } from './doctorStamp';
import { STAMP_KARAMA } from './stampKarama';
import { STAMP_ZAGO } from './stampZago';
import { STAMP_AHONON } from './stampAhonon';
import { STAMP_DAGBO } from './stampDagbo';
import { STAMP_SEKOU } from './stampSekou';
import { STAMP_HAMED } from './stampHamed';
import { STAMP_SELLY } from './stampSelly';
import { getUser } from './auth';

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

export interface ReportData {
  period: string;
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
  patients: { name: string; date_of_birth: string; gender: string; status: string; created_at: string; primary_pathology: string; filiale?: string; temperature?: number; poids?: number; taille?: number; tension_arterielle?: string; test_palu?: string; test_typhoide?: string; test_dengue?: string; riskScore?: number }[];
  appointments: { patient_name: string; appointment_date: string; appointment_time: string; status: string; type_consultation: string }[];
}

// ════════════════════════════════════════════════════════════════
// CONSTANTES
// ════════════════════════════════════════════════════════════════

const PAGE_W = 210;
const PAGE_H = 297;
const M = 15;
const CONTENT_W = PAGE_W - M * 2;

const C_PRIMARY: [number, number, number] = [0, 51, 102];
const C_ACCENT: [number, number, number] = [0, 128, 128];
const C_GRAY: [number, number, number] = [100, 100, 100];
const C_LIGHT: [number, number, number] = [220, 220, 220];
const C_WHITE: [number, number, number] = [255, 255, 255];
const C_BG: [number, number, number] = [245, 247, 250];
const C_GREEN: [number, number, number] = [16, 185, 129];
const C_RED: [number, number, number] = [239, 68, 68];
const C_ORANGE: [number, number, number] = [245, 158, 11];
const C_BLUE: [number, number, number] = [59, 130, 246];
const C_PURPLE: [number, number, number] = [139, 92, 246];
const C_PINK: [number, number, number] = [236, 72, 153];

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════

/** Strip accents for jsPDF Helvetica (no unicode support) */
function clean(s: string): string {
  return s
    .replace(/[éèêë]/g, 'e').replace(/[ÉÈÊË]/g, 'E')
    .replace(/[àâä]/g, 'a').replace(/[ÀÂÄ]/g, 'A')
    .replace(/[ùûü]/g, 'u').replace(/[ÙÛÜ]/g, 'U')
    .replace(/[îï]/g, 'i').replace(/[ÎÏ]/g, 'I')
    .replace(/[ôö]/g, 'o').replace(/[ÔÖ]/g, 'O')
    .replace(/[ç]/g, 'c').replace(/[Ç]/g, 'C')
    .replace(/[—–]/g, '-').replace(/[«»""]/g, '"').replace(/['']/g, "'")
    .replace(/[✓✔]/g, '*').replace(/[•●]/g, '-')
    .replace(/[^\x00-\x7F]/g, '');
}

/** Monkey-patch doc.text to auto-clean accents */
function patchDoc(doc: jsPDF): jsPDF {
  const origText = doc.text.bind(doc);
  (doc as any).text = (text: string | string[], x: number, y: number, options?: any) => {
    const cleaned = Array.isArray(text) ? text.map(clean) : clean(text);
    return origText(cleaned, x, y, options);
  };
  return doc;
}

function np(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - 30) { doc.addPage(); return 20; }
  return y;
}

function formatPeriod(period: string): string {
  const [year, month] = period.split('-');
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  return `${months[parseInt(month) - 1]} ${year}`;
}

function getTitle(type: string): string {
  const t: Record<string, string> = {
    monthly: 'Rapport Mensuel', quarterly: 'Rapport Trimestriel', annual: 'Rapport Annuel',
    performance: 'Rapport de Performance', patients: 'Rapport Patients',
    activity: "Rapport d'Activité", analytics: 'Rapport Analytique', custom: 'Rapport Personnalisé',
  };
  return t[type] || 'Rapport';
}

// ════════════════════════════════════════════════════════════════
// SECTION TITLE
// ════════════════════════════════════════════════════════════════

function sectionTitle(doc: jsPDF, title: string, y: number): number {
  y = np(doc, y, 15);
  doc.setFillColor(...C_ACCENT);
  doc.rect(M, y, 4, 8, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C_PRIMARY);
  doc.text(title, M + 8, y + 6);
  doc.setDrawColor(...C_LIGHT);
  doc.setLineWidth(0.3);
  doc.line(M + 8, y + 9, PAGE_W - M, y + 9);
  return y + 14;
}

// ════════════════════════════════════════════════════════════════
// HEADER
// ════════════════════════════════════════════════════════════════

function drawHeader(doc: jsPDF, data: ReportData): number {
  doc.addImage(SIFCA_LOGO_BW, 'PNG', M, 8, 45, 32);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C_GRAY);
  doc.text('S.A au capital de 4 002 935 000', M, 44);
  doc.text('01 BP 1289 ABIDJAN 01 – RC : ABIDJAN N°4254', M, 48);
  doc.text('Tél: (225) 27 21 75 75 75 – Fax: (225) 27 21 75 75 99', M, 52);

  const user = getUser();
  doc.setFontSize(9);
  const medicName = user ? `${user.prenom || ''} ${user.nom || ''}`.trim() || user.username : 'N/A';
  doc.text(`Médecin : ${medicName}`, PAGE_W - M, 12, { align: 'right' });
  doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, PAGE_W - M, 17, { align: 'right' });

  const titleY = 58;
  doc.setFillColor(...C_PRIMARY);
  doc.rect(M, titleY, CONTENT_W, 14, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C_WHITE);
  doc.text(getTitle(data.reportType).toUpperCase(), PAGE_W / 2, titleY + 9.5, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C_PRIMARY);
  doc.text(`Période : ${formatPeriod(data.period)}`, PAGE_W / 2, titleY + 22, { align: 'center' });

  doc.setDrawColor(...C_ACCENT);
  doc.setLineWidth(0.5);
  doc.line(M, titleY + 26, PAGE_W - M, titleY + 26);

  return titleY + 32;
}

// ════════════════════════════════════════════════════════════════
// STAT CARDS (8 cards in 2 rows)
// ════════════════════════════════════════════════════════════════

function drawStatCards(doc: jsPDF, data: ReportData, y: number): number {
  y = sectionTitle(doc, 'INDICATEURS CLÉS', y);
  const s = data.stats;
  const cardW = (CONTENT_W - 9) / 4;

  const drawCard = (x: number, cy: number, label: string, value: string | number, color: [number, number, number]) => {
    doc.setFillColor(...C_BG);
    doc.roundedRect(x, cy, cardW, 22, 2, 2, 'F');
    doc.setFillColor(...color);
    doc.rect(x, cy, 3, 22, 'F');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...color);
    doc.text(String(value), x + 8, cy + 10);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C_GRAY);
    doc.text(label, x + 8, cy + 17);
  };

  drawCard(M, y, 'Total Patients', s.totalPatients, C_PRIMARY);
  drawCard(M + cardW + 3, y, 'Nouveaux', s.newPatients, C_ACCENT);
  drawCard(M + (cardW + 3) * 2, y, 'En traitement', s.inTreatment, C_ORANGE);
  drawCard(M + (cardW + 3) * 3, y, 'Guéris', s.recovered, C_GREEN);
  y += 28;

  drawCard(M, y, 'RDV Total', s.totalAppointments, C_PRIMARY);
  drawCard(M + cardW + 3, y, 'Honorés', s.completedAppointments, C_GREEN);
  drawCard(M + (cardW + 3) * 2, y, 'Annulés', s.cancelledAppointments, C_RED);
  drawCard(M + (cardW + 3) * 3, y, 'Consultations', s.totalConsultations, C_PURPLE);

  return y + 30;
}

// ════════════════════════════════════════════════════════════════
// BAR CHART — Patient status distribution
// ════════════════════════════════════════════════════════════════

function drawBarChart(doc: jsPDF, data: ReportData, y: number): number {
  y = sectionTitle(doc, 'RÉPARTITION DES PATIENTS PAR STATUT', y);
  y = np(doc, y, 55);

  const s = data.stats;
  const bars = [
    { label: 'Actifs', value: s.activePatients, color: C_GREEN },
    { label: 'En traitement', value: s.inTreatment, color: C_ORANGE },
    { label: 'Guéris', value: s.recovered, color: C_BLUE },
    { label: 'Nouveaux', value: s.newPatients, color: C_ACCENT },
  ];

  const maxVal = Math.max(...bars.map(b => b.value), 1);
  const chartX = M + 30;
  const chartW = CONTENT_W - 35;
  const barH = 8;
  const gap = 4;

  bars.forEach((bar, i) => {
    const by = y + i * (barH + gap);
    // Label
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C_GRAY);
    doc.text(bar.label, M, by + 6, { align: 'left' });

    // Background bar
    doc.setFillColor(235, 235, 235);
    doc.roundedRect(chartX, by, chartW, barH, 2, 2, 'F');

    // Value bar
    const bw = Math.max(2, (bar.value / maxVal) * chartW);
    doc.setFillColor(...bar.color);
    doc.roundedRect(chartX, by, bw, barH, 2, 2, 'F');

    // Value text
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C_WHITE);
    if (bw > 15) doc.text(String(bar.value), chartX + bw - 3, by + 5.5, { align: 'right' });
    else { doc.setTextColor(...bar.color); doc.text(String(bar.value), chartX + bw + 3, by + 5.5); }
  });

  return y + bars.length * (barH + gap) + 8;
}

// ════════════════════════════════════════════════════════════════
// PIE CHART — Gender distribution
// ════════════════════════════════════════════════════════════════

function drawPieChart(doc: jsPDF, data: ReportData, y: number): number {
  y = sectionTitle(doc, 'RÉPARTITION PAR GENRE', y);
  y = np(doc, y, 45);

  const total = data.stats.maleCount + data.stats.femaleCount || 1;
  const mPct = data.stats.maleCount / total;
  const cx = M + 25;
  const cy = y + 18;
  const r = 15;

  // Draw pie slices using arc approximation
  // Male slice (blue)
  doc.setFillColor(...C_BLUE);
  doc.circle(cx, cy, r, 'F');

  // Female slice (pink) - overlay
  if (data.stats.femaleCount > 0) {
    const angle = mPct * 360;
    const rad = (angle * Math.PI) / 180;
    doc.setFillColor(...C_PINK);
    // Draw a triangle-based pie slice for female
    const points: [number, number][] = [[cx, cy]];
    for (let a = rad; a <= Math.PI * 2; a += 0.1) {
      points.push([cx + r * Math.cos(a - Math.PI / 2), cy + r * Math.sin(a - Math.PI / 2)]);
    }
    points.push([cx + r * Math.cos(-Math.PI / 2), cy + r * Math.sin(-Math.PI / 2)]);
    if (points.length > 2) {
      doc.setFillColor(...C_PINK);
      // Use lines to draw filled shape
      doc.triangle(points[0][0], points[0][1], points[1][0], points[1][1], points[Math.floor(points.length / 2)][0], points[Math.floor(points.length / 2)][1], 'F');
      for (let i = 1; i < points.length - 1; i++) {
        doc.triangle(cx, cy, points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], 'F');
      }
    }
  }

  // Center dot
  doc.setFillColor(...C_WHITE);
  doc.circle(cx, cy, 6, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C_PRIMARY);
  doc.text(String(total), cx, cy + 2, { align: 'center' });

  // Legend
  const lx = M + 55;
  doc.setFillColor(...C_BLUE);
  doc.rect(lx, y + 8, 8, 5, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(`Hommes : ${data.stats.maleCount} (${Math.round(mPct * 100)}%)`, lx + 12, y + 12);

  doc.setFillColor(...C_PINK);
  doc.rect(lx, y + 18, 8, 5, 'F');
  doc.text(`Femmes : ${data.stats.femaleCount} (${Math.round((1 - mPct) * 100)}%)`, lx + 12, y + 22);

  // Appointment pie on the right side
  const apptTotal = data.stats.totalAppointments || 1;
  const cx2 = M + 130;
  const honPct = data.stats.completedAppointments / apptTotal;

  doc.setFillColor(...C_GREEN);
  doc.circle(cx2, cy, r, 'F');

  if (data.stats.cancelledAppointments > 0) {
    const cancelAngle = (data.stats.completedAppointments + data.stats.pendingAppointments) / apptTotal * 360;
    const cancelRad = (cancelAngle * Math.PI) / 180;
    doc.setFillColor(...C_RED);
    for (let a = cancelRad; a <= Math.PI * 2; a += 0.1) {
      doc.triangle(cx2, cy, cx2 + r * Math.cos(a - Math.PI / 2), cy + r * Math.sin(a - Math.PI / 2),
        cx2 + r * Math.cos(a + 0.1 - Math.PI / 2), cy + r * Math.sin(a + 0.1 - Math.PI / 2), 'F');
    }
  }
  if (data.stats.pendingAppointments > 0) {
    const pendAngle = data.stats.completedAppointments / apptTotal * 360;
    const pendEnd = (data.stats.completedAppointments + data.stats.pendingAppointments) / apptTotal * 360;
    doc.setFillColor(...C_ORANGE);
    for (let a = (pendAngle * Math.PI) / 180; a <= (pendEnd * Math.PI) / 180; a += 0.1) {
      doc.triangle(cx2, cy, cx2 + r * Math.cos(a - Math.PI / 2), cy + r * Math.sin(a - Math.PI / 2),
        cx2 + r * Math.cos(a + 0.1 - Math.PI / 2), cy + r * Math.sin(a + 0.1 - Math.PI / 2), 'F');
    }
  }

  doc.setFillColor(...C_WHITE);
  doc.circle(cx2, cy, 6, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C_PRIMARY);
  doc.text(String(data.stats.totalAppointments), cx2, cy + 2, { align: 'center' });

  const lx2 = cx2 + 20;
  doc.setFillColor(...C_GREEN);
  doc.rect(lx2, y + 5, 8, 5, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(`Honorés : ${data.stats.completedAppointments} (${Math.round(honPct * 100)}%)`, lx2 + 12, y + 9);

  doc.setFillColor(...C_ORANGE);
  doc.rect(lx2, y + 14, 8, 5, 'F');
  doc.text(`En attente : ${data.stats.pendingAppointments}`, lx2 + 12, y + 18);

  doc.setFillColor(...C_RED);
  doc.rect(lx2, y + 23, 8, 5, 'F');
  doc.text(`Annulés : ${data.stats.cancelledAppointments}`, lx2 + 12, y + 27);

  return y + 40;
}

// ════════════════════════════════════════════════════════════════
// ACTIVITY CURVE — Appointments per day
// ════════════════════════════════════════════════════════════════

function drawActivityCurve(doc: jsPDF, data: ReportData, y: number): number {
  y = sectionTitle(doc, 'COURBE D\'ACTIVITÉ — RENDEZ-VOUS PAR JOUR', y);
  y = np(doc, y, 55);

  // Group appointments by day
  const dayMap: Record<string, number> = {};
  data.appointments.forEach(a => {
    const d = a.appointment_date;
    if (d) dayMap[d] = (dayMap[d] || 0) + 1;
  });

  const days = Object.keys(dayMap).sort();
  if (days.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...C_GRAY);
    doc.text('Aucune donnée disponible pour la courbe d\'activité.', M, y + 5);
    return y + 12;
  }

  const values = days.map(d => dayMap[d]);
  const maxVal = Math.max(...values, 1);
  const chartX = M + 10;
  const chartY = y;
  const chartW = CONTENT_W - 15;
  const chartH = 40;

  // Background grid
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.1);
  for (let i = 0; i <= 4; i++) {
    const gy = chartY + chartH - (i / 4) * chartH;
    doc.line(chartX, gy, chartX + chartW, gy);
    doc.setFontSize(6);
    doc.setTextColor(...C_GRAY);
    doc.text(String(Math.round((maxVal * i) / 4)), chartX - 2, gy + 1, { align: 'right' });
  }

  // Draw curve
  if (days.length > 1) {
    const step = chartW / (days.length - 1);

    // Fill area under curve
    doc.setFillColor(59, 130, 246, 0.15);

    // Draw the curve line
    doc.setDrawColor(...C_BLUE);
    doc.setLineWidth(1.2);
    for (let i = 0; i < days.length - 1; i++) {
      const x1 = chartX + i * step;
      const y1 = chartY + chartH - (values[i] / maxVal) * chartH;
      const x2 = chartX + (i + 1) * step;
      const y2 = chartY + chartH - (values[i + 1] / maxVal) * chartH;
      doc.line(x1, y1, x2, y2);
    }

    // Draw dots
    for (let i = 0; i < days.length; i++) {
      const x = chartX + i * step;
      const dotY = chartY + chartH - (values[i] / maxVal) * chartH;
      doc.setFillColor(...C_WHITE);
      doc.circle(x, dotY, 2, 'FD');
      doc.setFillColor(...C_BLUE);
      doc.circle(x, dotY, 1.2, 'F');
    }

    // X-axis labels
    doc.setFontSize(5);
    doc.setTextColor(...C_GRAY);
    const labelStep = Math.max(1, Math.floor(days.length / 10));
    for (let i = 0; i < days.length; i += labelStep) {
      const x = chartX + i * step;
      const label = days[i].substring(8, 10) + '/' + days[i].substring(5, 7);
      doc.text(label, x, chartY + chartH + 5, { align: 'center' });
    }
  } else {
    // Single point
    const x = chartX + chartW / 2;
    const dotY = chartY + chartH / 2;
    doc.setFillColor(...C_BLUE);
    doc.circle(x, dotY, 3, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...C_BLUE);
    doc.text(String(values[0]), x, dotY - 5, { align: 'center' });
  }

  return chartY + chartH + 12;
}

// ════════════════════════════════════════════════════════════════
// ANALYSIS TEXT
// ════════════════════════════════════════════════════════════════

function drawAnalysis(doc: jsPDF, data: ReportData, y: number): number {
  y = sectionTitle(doc, 'ANALYSE ET RECOMMANDATIONS', y);
  y = np(doc, y, 60);

  const s = data.stats;
  const total = s.totalPatients || 1;
  const apptRate = s.totalAppointments > 0 ? Math.round((s.completedAppointments / s.totalAppointments) * 100) : 0;
  const recoveryRate = s.totalPatients > 0 ? Math.round((s.recovered / s.totalPatients) * 100) : 0;
  const treatmentRate = s.totalPatients > 0 ? Math.round((s.inTreatment / s.totalPatients) * 100) : 0;

  doc.setFillColor(...C_BG);
  doc.roundedRect(M, y, CONTENT_W, 50, 3, 3, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C_PRIMARY);
  doc.text('Synthèse :', M + 5, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  const lines = [
    `• Nombre total de patients suivis : ${s.totalPatients} (dont ${s.newPatients} nouveaux ce mois)`,
    `• Taux de rendez-vous honorés : ${apptRate}% (${s.completedAppointments}/${s.totalAppointments})`,
    `• Taux de guérison : ${recoveryRate}% des patients (${s.recovered}/${total})`,
    `• Patients en traitement : ${treatmentRate}% (${s.inTreatment} patients)`,
    `• Consultations IA réalisées : ${s.totalConsultations}`,
    `• Répartition genre : ${s.maleCount} hommes / ${s.femaleCount} femmes`,
  ];

  let ly = y + 15;
  doc.setFontSize(8);
  lines.forEach(line => {
    doc.text(line, M + 5, ly);
    ly += 5.5;
  });

  // Recommendations
  y = ly + 8;
  y = np(doc, y, 35);

  doc.setFillColor(255, 251, 235);
  doc.roundedRect(M, y, CONTENT_W, 28, 3, 3, 'F');
  doc.setDrawColor(...C_ORANGE);
  doc.setLineWidth(0.5);
  doc.line(M, y, M, y + 28);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C_ORANGE);
  doc.text('Recommandations :', M + 5, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 60, 20);
  doc.setFontSize(8);
  const recs: string[] = [];
  if (apptRate < 70) recs.push('• Améliorer le suivi des rendez-vous — taux d\'honoration faible (' + apptRate + '%)');
  if (s.cancelledAppointments > s.completedAppointments) recs.push('• Trop d\'annulations — investiguer les causes et rappeler les patients');
  if (s.newPatients === 0) recs.push('• Aucun nouveau patient ce mois — vérifier l\'accessibilité du centre');
  if (recoveryRate > 60) recs.push('• Bon taux de guérison — maintenir les protocoles en place');
  if (s.totalConsultations === 0) recs.push('• Aucune consultation IA ce mois — explorer l\'utilisation de l\'assistant IA');
  if (recs.length === 0) recs.push('• Activité dans les normes — continuer le suivi régulier des patients');

  let ry = y + 14;
  recs.slice(0, 3).forEach(r => {
    doc.text(r, M + 5, ry);
    ry += 5;
  });

  return ry + 8;
}

// ════════════════════════════════════════════════════════════════
// TOP PATHOLOGIES BAR CHART
// ════════════════════════════════════════════════════════════════

function drawPathologiesChart(doc: jsPDF, data: ReportData, y: number): number {
  y = sectionTitle(doc, 'TOP 5 — PATHOLOGIES LES PLUS FRÉQUENTES', y);
  y = np(doc, y, 50);

  const pathMap: Record<string, number> = {};
  data.patients.forEach(p => {
    const path = p.primary_pathology || 'Non spécifié';
    pathMap[path] = (pathMap[path] || 0) + 1;
  });

  const sorted = Object.entries(pathMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (sorted.length === 0) {
    doc.setFontSize(9); doc.setTextColor(...C_GRAY);
    doc.text('Aucune pathologie enregistrée.', M, y + 5);
    return y + 12;
  }

  const maxVal = sorted[0][1] || 1;
  const colors: [number, number, number][] = [C_BLUE, C_ACCENT, C_PURPLE, C_ORANGE, C_PINK];
  const chartX = M + 40;
  const chartW = CONTENT_W - 45;

  sorted.forEach((entry, i) => {
    const by = y + i * 12;
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C_GRAY);
    doc.text(entry[0].substring(0, 20), M, by + 6);
    doc.setFillColor(235, 235, 235);
    doc.roundedRect(chartX, by + 1, chartW, 7, 2, 2, 'F');
    const bw = Math.max(3, (entry[1] / maxVal) * chartW);
    doc.setFillColor(...(colors[i] || C_BLUE));
    doc.roundedRect(chartX, by + 1, bw, 7, 2, 2, 'F');
    doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(...(colors[i] || C_BLUE));
    doc.text(`${entry[1]} (${Math.round((entry[1] / data.patients.length) * 100)}%)`, chartX + bw + 3, by + 6);
  });

  return y + sorted.length * 12 + 8;
}

// ════════════════════════════════════════════════════════════════
// AGE DISTRIBUTION
// ════════════════════════════════════════════════════════════════

function drawAgeDistribution(doc: jsPDF, data: ReportData, y: number): number {
  y = sectionTitle(doc, 'RÉPARTITION PAR TRANCHE D\'ÂGE', y);
  y = np(doc, y, 50);

  const groups = [
    { label: '0-18 ans', min: 0, max: 18, color: C_BLUE, count: 0 },
    { label: '19-35 ans', min: 19, max: 35, color: C_ACCENT, count: 0 },
    { label: '36-55 ans', min: 36, max: 55, color: C_ORANGE, count: 0 },
    { label: '56+ ans', min: 56, max: 200, color: C_RED, count: 0 },
  ];

  data.patients.forEach(p => {
    if (!p.date_of_birth) return;
    const age = Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / 31557600000);
    const g = groups.find(gr => age >= gr.min && age <= gr.max);
    if (g) g.count++;
  });

  const total = data.patients.length || 1;
  const maxVal = Math.max(...groups.map(g => g.count), 1);
  const barW = (CONTENT_W - 15) / groups.length;

  // Draw vertical bars
  const chartH = 35;
  const baseY = y + chartH;

  groups.forEach((g, i) => {
    const bx = M + 5 + i * barW;
    const bh = Math.max(2, (g.count / maxVal) * (chartH - 5));
    doc.setFillColor(...g.color);
    doc.roundedRect(bx + 5, baseY - bh, barW - 15, bh, 2, 2, 'F');

    // Value on top
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...g.color);
    doc.text(String(g.count), bx + 5 + (barW - 15) / 2, baseY - bh - 3, { align: 'center' });

    // Label below
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C_GRAY);
    doc.text(g.label, bx + 5 + (barW - 15) / 2, baseY + 5, { align: 'center' });
    doc.text(`${Math.round((g.count / total) * 100)}%`, bx + 5 + (barW - 15) / 2, baseY + 10, { align: 'center' });
  });

  return baseY + 16;
}

// ════════════════════════════════════════════════════════════════
// VITALS AVERAGE
// ════════════════════════════════════════════════════════════════

function drawVitalsAverage(doc: jsPDF, data: ReportData, y: number): number {
  y = sectionTitle(doc, 'SIGNES VITAUX MOYENS', y);
  y = np(doc, y, 30);

  const patients = data.patients.filter(p => p.temperature || p.poids || p.taille);
  if (patients.length === 0) {
    doc.setFontSize(9); doc.setTextColor(...C_GRAY);
    doc.text('Aucune donnée de signes vitaux disponible.', M, y + 5);
    return y + 12;
  }

  const avg = (arr: number[]) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 'N/A';
  const temps = patients.filter(p => p.temperature).map(p => p.temperature!);
  const poids = patients.filter(p => p.poids).map(p => p.poids!);
  const tailles = patients.filter(p => p.taille).map(p => p.taille!);

  const vitals = [
    { label: 'Température moy.', value: `${avg(temps)} °C`, icon: '🌡', color: C_RED },
    { label: 'Poids moyen', value: `${avg(poids)} kg`, icon: '⚖', color: C_BLUE },
    { label: 'Taille moyenne', value: `${avg(tailles)} cm`, icon: '📏', color: C_ACCENT },
    { label: 'Patients mesurés', value: `${patients.length}`, icon: '👥', color: C_PURPLE },
  ];

  const cardW = (CONTENT_W - 9) / 4;
  vitals.forEach((v, i) => {
    const cx = M + i * (cardW + 3);
    doc.setFillColor(...C_BG);
    doc.roundedRect(cx, y, cardW, 18, 2, 2, 'F');
    doc.setFillColor(...v.color);
    doc.rect(cx, y, 3, 18, 'F');
    doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(...v.color);
    doc.text(v.value, cx + 8, y + 8);
    doc.setFontSize(6); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C_GRAY);
    doc.text(v.label, cx + 8, y + 14);
  });

  return y + 24;
}

// ════════════════════════════════════════════════════════════════
// TEST RESULTS (Palu, Typhoide, Dengue)
// ════════════════════════════════════════════════════════════════

function drawTestResults(doc: jsPDF, data: ReportData, y: number): number {
  y = sectionTitle(doc, 'RÉSULTATS D\'ANALYSES — TAUX DE POSITIFS', y);
  y = np(doc, y, 35);

  const tests = [
    { label: 'Test Paludisme', field: 'test_palu' as const, color: C_RED },
    { label: 'Test Typhoïde', field: 'test_typhoide' as const, color: C_ORANGE },
    { label: 'Test Dengue', field: 'test_dengue' as const, color: C_PURPLE },
  ];

  tests.forEach((t, i) => {
    const tested = data.patients.filter(p => (p as any)[t.field]);
    const positive = tested.filter(p => (p as any)[t.field] === 'positif' || (p as any)[t.field] === 'Positif');
    const total = tested.length || 1;
    const pct = Math.round((positive.length / total) * 100);
    const barY = y + i * 14;

    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C_GRAY);
    doc.text(t.label, M, barY + 5);

    // Background bar
    const barX = M + 40;
    const barW = CONTENT_W - 85;
    doc.setFillColor(235, 235, 235);
    doc.roundedRect(barX, barY + 1, barW, 7, 2, 2, 'F');

    // Positive bar
    const pw = Math.max(1, (pct / 100) * barW);
    doc.setFillColor(...t.color);
    doc.roundedRect(barX, barY + 1, pw, 7, 2, 2, 'F');

    // Stats
    doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(...t.color);
    doc.text(`${positive.length}/${tested.length} positifs (${pct}%)`, barX + barW + 3, barY + 6);
  });

  return y + tests.length * 14 + 8;
}

// ════════════════════════════════════════════════════════════════
// FILIALES DISTRIBUTION
// ════════════════════════════════════════════════════════════════

function drawFilialesChart(doc: jsPDF, data: ReportData, y: number): number {
  y = sectionTitle(doc, 'RÉPARTITION PAR FILIALE', y);
  y = np(doc, y, 50);

  const filMap: Record<string, number> = {};
  data.patients.forEach(p => {
    const f = p.filiale || 'Non spécifié';
    filMap[f] = (filMap[f] || 0) + 1;
  });

  const sorted = Object.entries(filMap).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) {
    doc.setFontSize(9); doc.setTextColor(...C_GRAY);
    doc.text('Aucune donnée de filiale.', M, y + 5);
    return y + 12;
  }

  const total = data.patients.length || 1;
  const colors: [number, number, number][] = [C_BLUE, C_ACCENT, C_GREEN, C_ORANGE, C_PURPLE, C_PINK, C_RED];
  const maxVal = sorted[0][1] || 1;
  const chartX = M + 35;
  const chartW = CONTENT_W - 40;

  sorted.slice(0, 7).forEach((entry, i) => {
    const by = y + i * 10;
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C_GRAY);
    doc.text(entry[0].substring(0, 18), M, by + 5);
    doc.setFillColor(235, 235, 235);
    doc.roundedRect(chartX, by + 1, chartW, 6, 2, 2, 'F');
    const bw = Math.max(3, (entry[1] / maxVal) * chartW);
    doc.setFillColor(...(colors[i % colors.length]));
    doc.roundedRect(chartX, by + 1, bw, 6, 2, 2, 'F');
    doc.setFontSize(6); doc.setFont('helvetica', 'bold'); doc.setTextColor(...(colors[i % colors.length]));
    doc.text(`${entry[1]} (${Math.round((entry[1] / total) * 100)}%)`, chartX + bw + 2, by + 5.5);
  });

  return y + Math.min(sorted.length, 7) * 10 + 8;
}

// ════════════════════════════════════════════════════════════════
// WEEKDAY DISTRIBUTION
// ════════════════════════════════════════════════════════════════

function drawWeekdayChart(doc: jsPDF, data: ReportData, y: number): number {
  y = sectionTitle(doc, 'TAUX D\'OCCUPATION PAR JOUR DE LA SEMAINE', y);
  y = np(doc, y, 50);

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];

  data.appointments.forEach(a => {
    if (!a.appointment_date) return;
    const d = new Date(a.appointment_date + 'T00:00:00').getDay();
    dayCounts[d]++;
  });

  const maxVal = Math.max(...dayCounts, 1);
  const barW = (CONTENT_W - 10) / 7;
  const chartH = 35;
  const baseY = y + chartH;

  const dayColors: [number, number, number][] = [C_GRAY, C_BLUE, C_ACCENT, C_GREEN, C_ORANGE, C_PURPLE, C_GRAY];

  dayCounts.forEach((count, i) => {
    const bx = M + 3 + i * barW;
    const bh = Math.max(2, (count / maxVal) * (chartH - 5));
    doc.setFillColor(...dayColors[i]);
    doc.roundedRect(bx + 3, baseY - bh, barW - 8, bh, 2, 2, 'F');

    // Value on top
    if (count > 0) {
      doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(...dayColors[i]);
      doc.text(String(count), bx + 3 + (barW - 8) / 2, baseY - bh - 2, { align: 'center' });
    }

    // Day label
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C_GRAY);
    doc.text(dayNames[i], bx + 3 + (barW - 8) / 2, baseY + 5, { align: 'center' });
  });

  return baseY + 12;
}

// ════════════════════════════════════════════════════════════════
// HIGH RISK PATIENTS
// ════════════════════════════════════════════════════════════════

function drawHighRiskPatients(doc: jsPDF, data: ReportData, y: number): number {
  y = sectionTitle(doc, 'PATIENTS À RISQUE ÉLEVÉ', y);
  y = np(doc, y, 30);

  const highRisk = data.patients.filter(p => (p.riskScore || 0) > 50).sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));

  if (highRisk.length === 0) {
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(M, y, CONTENT_W, 12, 2, 2, 'F');
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C_GREEN);
    doc.text('Aucun patient a risque eleve - situation favorable.', M + 5, y + 8);
    return y + 18;
  }

  // Table
  doc.setFillColor(...C_RED);
  doc.rect(M, y, CONTENT_W, 7, 'F');
  doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C_WHITE);
  doc.text('Patient', M + 2, y + 5);
  doc.text('Risque', M + 60, y + 5);
  doc.text('Pathologie', M + 85, y + 5);
  doc.text('Statut', M + 140, y + 5);
  y += 7;

  highRisk.slice(0, 10).forEach((p, i) => {
    y = np(doc, y, 7);
    if (i % 2 === 0) { doc.setFillColor(254, 242, 242); doc.rect(M, y, CONTENT_W, 6.5, 'F'); }
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
    doc.text((p.name || '').substring(0, 30), M + 2, y + 4.5);

    // Risk badge
    const risk = p.riskScore || 0;
    const rColor: [number, number, number] = risk > 80 ? C_RED : C_ORANGE;
    doc.setFillColor(...rColor);
    doc.roundedRect(M + 60, y + 0.5, 18, 5, 1, 1, 'F');
    doc.setFontSize(6); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C_WHITE);
    doc.text(`${risk}%`, M + 69, y + 4, { align: 'center' });

    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
    doc.text((p.primary_pathology || '-').substring(0, 25), M + 85, y + 4.5);
    doc.text(p.status === 'in_treatment' ? 'Traitement' : p.status || '-', M + 140, y + 4.5);
    y += 6.5;
  });

  return y + 5;
}

// ════════════════════════════════════════════════════════════════
// PATIENTS TABLE
// ════════════════════════════════════════════════════════════════

function drawPatientsTable(doc: jsPDF, data: ReportData, y: number): number {
  y = sectionTitle(doc, 'LISTE DES PATIENTS', y);
  const patients = data.patients.slice(0, 25);
  if (patients.length === 0) {
    doc.setFontSize(9); doc.setTextColor(...C_GRAY);
    doc.text('Aucun patient enregistré pour cette période.', M, y + 5);
    return y + 12;
  }

  const cols = [
    { label: 'Nom', x: M, w: 50 }, { label: 'Âge', x: M + 50, w: 20 }, { label: 'Genre', x: M + 70, w: 25 },
    { label: 'Pathologie', x: M + 95, w: 45 }, { label: 'Statut', x: M + 140, w: 25 }, { label: 'Date', x: M + 165, w: 30 },
  ];

  y = np(doc, y, 10);
  doc.setFillColor(...C_PRIMARY);
  doc.rect(M, y, CONTENT_W, 7, 'F');
  doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C_WHITE);
  cols.forEach(c => doc.text(c.label, c.x + 2, y + 5));
  y += 7;

  doc.setFont('helvetica', 'normal');
  patients.forEach((p, i) => {
    y = np(doc, y, 7);
    if (i % 2 === 0) { doc.setFillColor(...C_BG); doc.rect(M, y, CONTENT_W, 6.5, 'F'); }
    doc.setFontSize(7); doc.setTextColor(30, 30, 30);
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
    doc.setFontSize(7); doc.setTextColor(...C_GRAY);
    doc.text(`... et ${data.patients.length - 25} autres patients`, M, y + 5);
    y += 8;
  }
  return y + 5;
}

// ════════════════════════════════════════════════════════════════
// APPOINTMENTS TABLE
// ════════════════════════════════════════════════════════════════

function drawAppointmentsTable(doc: jsPDF, data: ReportData, y: number): number {
  y = sectionTitle(doc, 'RENDEZ-VOUS DU MOIS', y);
  const appts = data.appointments.slice(0, 20);
  if (appts.length === 0) {
    doc.setFontSize(9); doc.setTextColor(...C_GRAY);
    doc.text('Aucun rendez-vous pour cette période.', M, y + 5);
    return y + 12;
  }

  const cols = [
    { label: 'Patient', x: M, w: 55 }, { label: 'Date', x: M + 55, w: 30 }, { label: 'Heure', x: M + 85, w: 20 },
    { label: 'Type', x: M + 105, w: 40 }, { label: 'Statut', x: M + 145, w: 35 },
  ];

  y = np(doc, y, 10);
  doc.setFillColor(...C_ACCENT);
  doc.rect(M, y, CONTENT_W, 7, 'F');
  doc.setFontSize(7); doc.setFont('helvetica', 'bold'); doc.setTextColor(...C_WHITE);
  cols.forEach(c => doc.text(c.label, c.x + 2, y + 5));
  y += 7;

  doc.setFont('helvetica', 'normal');
  appts.forEach((a, i) => {
    y = np(doc, y, 7);
    if (i % 2 === 0) { doc.setFillColor(...C_BG); doc.rect(M, y, CONTENT_W, 6.5, 'F'); }
    doc.setFontSize(7); doc.setTextColor(30, 30, 30);
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

// ════════════════════════════════════════════════════════════════
// FOOTER — Stamp + page numbers
// ════════════════════════════════════════════════════════════════

function drawFooter(doc: jsPDF, y: number) {
  y = np(doc, y, 50);
  doc.setDrawColor(...C_PRIMARY);
  doc.setLineWidth(0.5);
  doc.line(M, y, PAGE_W - M, y);
  y += 8;

  const user = getUser();
  const username = user?.username || '';
  let stampImg = DOCTOR_STAMP;
  let stampW = 55, stampH = 22;

  const stampMap: Record<string, { img: string; w: number; h: number }> = {
    'pr.karama': { img: STAMP_KARAMA, w: 45, h: 38 },
    'dr.zago': { img: STAMP_ZAGO, w: 55, h: 22 },
    'dr.ahonon': { img: STAMP_AHONON, w: 55, h: 24 },
    'dr.dagbo': { img: STAMP_DAGBO, w: 55, h: 22 },
    'dr.sekou': { img: STAMP_SEKOU, w: 55, h: 24 },
    'dr.hamed': { img: STAMP_HAMED, w: 55, h: 22 },
    'dr.selly': { img: STAMP_SELLY, w: 55, h: 25 },
  };
  const match = stampMap[username];
  if (match) { stampImg = match.img; stampW = match.w; stampH = match.h; }

  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C_GRAY);
  doc.text(`Fait à Abidjan, le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`, 95, y);
  y += 12;
  doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 0, 0);
  doc.text('Le Médecin :', 140, y);
  y += 8;
  doc.addImage(stampImg, 'PNG', 140, y, stampW, stampH);

  // Page numbers
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(...C_GRAY);
    doc.text(`Page ${i}/${pages}`, PAGE_W / 2, PAGE_H - 8, { align: 'center' });
    doc.text('Centre Médico-Social SIFCA — Rapport confidentiel', PAGE_W / 2, PAGE_H - 4, { align: 'center' });
  }
}

// ════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════════════════════════════════

export function generateReportPDF(data: ReportData): void {
  const doc = patchDoc(new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' }));

  let y = drawHeader(doc, data);
  y = drawStatCards(doc, data, y);
  y = drawBarChart(doc, data, y);
  y = drawPieChart(doc, data, y);
  y = drawActivityCurve(doc, data, y);
  y = drawAnalysis(doc, data, y);

  // Page 2 — Pathologies + Age + Vitals
  doc.addPage();
  y = 20;
  y = drawPathologiesChart(doc, data, y);
  y = drawAgeDistribution(doc, data, y);
  y = drawVitalsAverage(doc, data, y);
  y = drawTestResults(doc, data, y);

  // Page 3 — Filiales + Weekday + Risk patients + Tables
  doc.addPage();
  y = 20;
  y = drawFilialesChart(doc, data, y);
  y = drawWeekdayChart(doc, data, y);
  y = drawHighRiskPatients(doc, data, y);

  // Page 4 — Tables
  doc.addPage();
  y = 20;
  y = drawPatientsTable(doc, data, y);
  y = drawAppointmentsTable(doc, data, y);
  drawFooter(doc, y);

  const periodLabel = data.period.replace('-', '_');
  doc.save(`Rapport_SIFCA_${getTitle(data.reportType).replace(/\s+/g, '_')}_${periodLabel}.pdf`);
}
