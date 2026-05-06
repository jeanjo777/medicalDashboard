/**
 * Generateur automatise de rapports medicaux PDF - SIFCA
 *
 * Usage:
 *   node generate-rapports.cjs                     # Genere les templates vides
 *   node generate-rapports.cjs --patient "Nom"     # Genere avec donnees patient (depuis DB)
 *   node generate-rapports.cjs --all                # Genere pour tous les patients
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const https = require('https');

const RAPPORT_DIR = path.join(__dirname, 'Rapport');
const BASE_URL = 'https://medical.simpliceake.com/rest/v1';
const TOKEN_PATH = path.join(__dirname, 'tok.txt');

// ============================================================
// SIFCA Header Constants
// ============================================================
const SIFCA = {
  name: 'SIFCA',
  capital: 'S.A au capital de 4 002 935 000',
  address: '01 BP 1289 ABIDJAN 01 - RC: ABIDJAN N\u00b04254',
  tel: 'Tel: (225) 27 21 75 75 75 - Fax: (225) 27 21 75 75 99',
};

// ============================================================
// PDF Helper Functions
// ============================================================

function drawSifcaHeader(doc) {
  // SIFCA Logo text (bold, large)
  doc.fontSize(28).font('Helvetica-Bold').text('SIFCA', 50, 50);

  // Decorative line under logo
  doc.moveTo(50, 82).lineTo(130, 82).lineWidth(2).stroke();
  doc.moveTo(50, 86).lineTo(130, 86).lineWidth(1).stroke();

  // Company info
  doc.fontSize(7).font('Helvetica')
    .text(SIFCA.capital, 50, 95)
    .text(SIFCA.address, 50, 105)
    .text(SIFCA.tel, 50, 115);
}

function drawTitle(doc, title, y) {
  const titleWidth = doc.widthOfString(title) + 30;
  const x = (doc.page.width - titleWidth) / 2;
  // Border box around title
  doc.lineWidth(1.5)
    .rect(x, y, titleWidth, 28)
    .stroke();
  doc.fontSize(14).font('Helvetica-Bold')
    .text(title, 0, y + 7, { align: 'center', width: doc.page.width });
  return y + 50;
}

function drawDateHeader(doc, date) {
  const dateStr = date || '.......... / .......... / ..........';
  doc.fontSize(10).font('Helvetica')
    .text(`Date ${dateStr}`, 350, 55, { width: 200, align: 'right' });
}

function drawField(doc, label, value, x, y, lineWidth) {
  lineWidth = lineWidth || 430;
  doc.fontSize(11).font('Helvetica-Bold').text(label, x, y);
  const labelW = doc.widthOfString(label);
  const val = value || '';
  doc.font('Helvetica').text(val, x + labelW + 5, y);
  // Dotted line
  const lineY = y + 14;
  const startX = x + labelW + 5 + (val ? doc.widthOfString(val) + 5 : 0);
  const endX = x + lineWidth;
  if (startX < endX) {
    for (let dx = startX; dx < endX; dx += 4) {
      doc.circle(dx, lineY, 0.5).fill('#000');
    }
  }
  return y + 30;
}

function drawDottedLine(doc, x, y, width) {
  for (let dx = x; dx < x + width; dx += 4) {
    doc.circle(dx, y, 0.5).fill('#000');
  }
  return y + 25;
}

function drawSignature(doc, city, y) {
  city = city || 'Abidjan';
  doc.fontSize(11).font('Helvetica-Bold')
    .text(`Fait \u00e0 ${city}, le `, 250, y, { continued: false });
  drawDottedLine(doc, 370, y + 14, 150);
  y += 45;
  doc.fontSize(12).font('Helvetica-Bold')
    .text('M\u00e9decin :', 250, y);
  return y + 30;
}

// ============================================================
// Document Generators
// ============================================================

function generateCertificatTension(outputPath, data) {
  data = data || {};
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    drawSifcaHeader(doc);
    let y = drawTitle(doc, 'CERTIFICAT DE PRISE DE TENSION', 145);

    y += 15;
    y = drawField(doc, 'Je soussign\u00e9 (e), Docteur :', data.docteur || '', 50, y);
    y += 5;
    y = drawField(doc, 'Certifie que l\u2019\u00e9tat de sant\u00e9 de M/ Mme/ Mlle ', data.patient || '', 50, y);
    y = drawDottedLine(doc, 50, y, 430);
    y += 10;
    doc.fontSize(11).font('Helvetica-Bold').text('Est satisfaisant.', 50, y);
    y += 35;
    doc.fontSize(11).font('Helvetica-Bold').text('Sa tension art\u00e9rielle de ce jour est :', 50, y);
    y += 35;
    y = drawField(doc, 'Tension art\u00e9rielle bras droit :', data.tensionDroit || '', 50, y);
    y += 10;
    y = drawField(doc, 'Tension art\u00e9rielle bras gauche :', data.tensionGauche || '', 50, y);
    y += 40;
    drawSignature(doc, 'Abidjan', y);

    doc.end();
    stream.on('finish', () => resolve(outputPath));
  });
}

function generateCertificatMedical(outputPath, data) {
  data = data || {};
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    drawSifcaHeader(doc);
    drawDateHeader(doc, data.date);
    let y = drawTitle(doc, 'CERTIFICAT MEDICAL', 145);

    y += 15;
    y = drawField(doc, 'Je soussign\u00e9 Dr ', data.docteur || '', 50, y);
    y += 5;
    doc.fontSize(11).font('Helvetica-Bold').text('Certifie avoir examin\u00e9', 50, y);
    y += 25;
    y = drawField(doc, 'l\u2019enfant ', data.patient || '', 50, y);
    y = drawDottedLine(doc, 50, y, 430);

    y += 30;
    doc.fontSize(11).font('Helvetica-Bold')
      .text('Atteste qu\u2019il ou elle est en bonne sant\u00e9.', 50, y);
    y += 40;
    doc.fontSize(11).font('Helvetica')
      .text('En foi de quoi je d\u00e9livre ce certificat pour servir et valoir ce que de droit.', 100, y);
    y += 50;
    doc.fontSize(13).font('Helvetica-Bold')
      .text('LE MEDECIN', 350, y);

    doc.end();
    stream.on('finish', () => resolve(outputPath));
  });
}

function generateArretTravail(outputPath, data) {
  data = data || {};
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    drawSifcaHeader(doc);
    let y = drawTitle(doc, 'ARRET DE TRAVAIL', 145);

    y += 15;
    y = drawField(doc, 'Je soussign\u00e9 (e), Docteur :', data.docteur || '', 50, y);
    y += 5;
    y = drawField(doc, 'Certifie que l\u2019\u00e9tat de sant\u00e9 de :', data.patient || '', 50, y);
    y = drawDottedLine(doc, 50, y, 430);
    y += 10;
    y = drawField(doc, 'Matricule :', data.matricule || '', 50, y, 180);
    // Direction on same line
    doc.fontSize(11).font('Helvetica-Bold').text('Direction :', 280, y - 30);
    drawDottedLine(doc, 340, y - 30 + 14, 140);

    y += 10;
    y = drawField(doc, '1) n\u00e9cessite un arr\u00eat de travail de :', data.arret || '', 50, y);
    y += 10;
    y = drawField(doc, '2) n\u00e9cessite une prolongation de travail de :', data.prolongation || '', 50, y);
    y += 10;
    y = drawField(doc, 'Sauf complication \u00e0 dater du :', data.dateComplication || '', 50, y);
    y += 40;
    drawSignature(doc, 'Abidjan', y);

    doc.end();
    stream.on('finish', () => resolve(outputPath));
  });
}

function generateCertificatGrossesse(outputPath, data) {
  data = data || {};
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    drawSifcaHeader(doc);
    let y = drawTitle(doc, 'CERTIFICAT DE GROSSESSE', 145);

    y += 15;
    y = drawField(doc, 'Je soussign\u00e9, Docteur :', data.docteur || '', 50, y);
    y += 5;
    y = drawField(doc, 'Certifie que Madame :', data.patient || '', 50, y);
    y += 5;
    y = drawField(doc, 'Est actuellement en cours d\u2019une grossesse de :', data.dureeGrossesse || '', 50, y);
    y += 5;
    y = drawField(doc, 'Dont le terme est fix\u00e9 le :', data.terme || '', 50, y);

    y += 30;
    doc.fontSize(11).font('Helvetica-Bold')
      .text(`Fait \u00e0 Abidjan, le `, 280, y, { continued: false });
    drawDottedLine(doc, 390, y + 14, 130);
    y += 40;
    doc.fontSize(11).font('Helvetica-Bold')
      .text('Le M\u00e9decin :', 50, y);
    drawDottedLine(doc, 140, y + 14, 380);

    doc.end();
    stream.on('finish', () => resolve(outputPath));
  });
}

function generateOrdonnanceMedicale(outputPath, data) {
  data = data || {};
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    drawSifcaHeader(doc);
    drawDateHeader(doc, data.date);
    let y = drawTitle(doc, 'ORDONNANCE MEDICALE', 145);

    y += 10;
    doc.fontSize(11).font('Helvetica-Bold').text('Docteur', 50, y);
    if (data.docteur) {
      doc.font('Helvetica').text(data.docteur, 100, y);
    }
    y += 25;

    // Patient info
    if (data.patient) {
      doc.fontSize(10).font('Helvetica')
        .text(`Patient: ${data.patient}`, 50, y);
      y += 20;
    }

    // Prescriptions area (large blank space or filled)
    if (data.prescriptions && data.prescriptions.length > 0) {
      y += 10;
      data.prescriptions.forEach((rx, i) => {
        doc.fontSize(11).font('Helvetica')
          .text(`${i + 1}. ${rx}`, 70, y);
        y += 22;
      });
    } else {
      // Draw lined area for handwriting
      for (let i = 0; i < 15; i++) {
        y += 25;
        drawDottedLine(doc, 50, y, 480);
      }
    }

    doc.end();
    stream.on('finish', () => resolve(outputPath));
  });
}

function generateBulletinConsultation(outputPath, data) {
  data = data || {};
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    drawSifcaHeader(doc);
    drawDateHeader(doc, data.date);
    let y = drawTitle(doc, 'BULLETIN DE CONSULTATION', 145);

    y += 10;
    y = drawField(doc, 'SERVICE :', data.service || '', 50, y);
    y = drawField(doc, 'NOM :', data.nom || '', 50, y);
    y = drawField(doc, 'PRENOM :', data.prenom || '', 50, y);

    // Age + Sexe on same line
    doc.fontSize(11).font('Helvetica-Bold').text('AGE :', 50, y);
    if (data.age) doc.font('Helvetica').text(data.age, 85, y);
    drawDottedLine(doc, 85 + (data.age ? doc.widthOfString(data.age) + 5 : 0), y + 14, 200);

    doc.fontSize(11).font('Helvetica-Bold').text('SEXE :', 310, y);
    if (data.sexe) doc.font('Helvetica').text(data.sexe, 350, y);
    drawDottedLine(doc, 350 + (data.sexe ? doc.widthOfString(data.sexe) + 5 : 0), y + 14, 130);
    y += 30;

    y = drawField(doc, 'CONSULTATION EN :', data.consultationEn || '', 50, y);

    // Lines for notes
    for (let i = 0; i < 8; i++) {
      y = drawDottedLine(doc, 50, y + 5, 480);
    }

    y += 10;
    doc.fontSize(11).font('Helvetica-Bold').text('RENSEIGNEMENTS CLINIQUES', 50, y);
    y += 20;
    for (let i = 0; i < 5; i++) {
      y = drawDottedLine(doc, 50, y + 5, 480);
    }

    y += 20;
    doc.fontSize(11).font('Helvetica-Bold')
      .text('Signature et cachet M\u00e9decin', 300, y);

    doc.end();
    stream.on('finish', () => resolve(outputPath));
  });
}

// ============================================================
// API Helper (fetch patient data)
// ============================================================

function fetchAPI(endpoint) {
  return new Promise((resolve, reject) => {
    let token;
    try { token = fs.readFileSync(TOKEN_PATH, 'utf8').trim(); } catch(e) { token = ''; }
    const anonKey = 'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJyb2xlIjogImFub24iLCAiaXNzIjogIm1lZGljYXJlLXBybyIsICJpYXQiOiAxNzc4MDU5OTMyfQ.aA-Xvo_ea8waYw1EvSxSYgDOrINlCqdRmAiF9-J8S58';
    const url = new URL(`${BASE_URL}/${endpoint}`);
    const opts = {
      hostname: url.hostname, path: url.pathname + url.search, method: 'GET',
      headers: { 'Authorization': `Bearer ${token || anonKey}`, 'apikey': anonKey }
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { reject(new Error(d)); } });
    });
    req.on('error', reject); req.end();
  });
}

// ============================================================
// Main
// ============================================================

const GENERATORS = {
  'certificat-tension': { fn: generateCertificatTension, label: 'Certificat de Prise de Tension' },
  'certificat-medical': { fn: generateCertificatMedical, label: 'Certificat Medical' },
  'arret-travail': { fn: generateArretTravail, label: 'Arret de Travail' },
  'certificat-grossesse': { fn: generateCertificatGrossesse, label: 'Certificat de Grossesse' },
  'ordonnance-medicale': { fn: generateOrdonnanceMedicale, label: 'Ordonnance Medicale' },
  'bulletin-consultation': { fn: generateBulletinConsultation, label: 'Bulletin de Consultation' },
};

async function generateTemplates() {
  console.log('=== Generation des templates vides ===\n');
  if (!fs.existsSync(RAPPORT_DIR)) fs.mkdirSync(RAPPORT_DIR, { recursive: true });

  for (const [key, { fn, label }] of Object.entries(GENERATORS)) {
    const outputPath = path.join(RAPPORT_DIR, `${key}.pdf`);
    await fn(outputPath, {});
    console.log(`  [OK] ${label} -> ${outputPath}`);
  }
  console.log(`\n=== ${Object.keys(GENERATORS).length} PDFs generes dans ${RAPPORT_DIR} ===`);
}

async function generateForPatient(patientName) {
  console.log(`=== Generation des rapports pour: ${patientName} ===\n`);
  if (!fs.existsSync(RAPPORT_DIR)) fs.mkdirSync(RAPPORT_DIR, { recursive: true });

  // Fetch patient data
  const patients = await fetchAPI(`patients?name=ilike.*${encodeURIComponent(patientName)}*&limit=1`);
  if (!patients || patients.length === 0) {
    console.error(`Patient "${patientName}" non trouve.`);
    process.exit(1);
  }
  const p = patients[0];
  console.log(`  Patient: ${p.name} (${p.age || '?'} ans, ${p.gender || '?'})`);

  // Fetch medic
  const medics = await fetchAPI('medics?limit=1');
  const medic = medics[0] || {};
  const docteurName = `Dr. ${medic.prenom || ''} ${medic.nom || ''}`.trim();

  // Fetch consultations for this patient
  const consultations = await fetchAPI(`consultations?patient_id=eq.${p.id}&order=created_at.desc&limit=1`);
  const lastCons = consultations[0] || {};

  // Fetch appointments for this patient
  const appts = await fetchAPI(`appointments?patient_id=eq.${p.id}&order=appointment_date.desc&limit=1`);
  const lastAppt = appts[0] || {};

  const today = new Date().toISOString().slice(0, 10);
  const sanitizedName = p.name.replace(/[^a-zA-Z0-9]/g, '_');
  const patientDir = path.join(RAPPORT_DIR, sanitizedName);
  if (!fs.existsSync(patientDir)) fs.mkdirSync(patientDir, { recursive: true });

  const commonData = { docteur: docteurName, patient: p.name, date: today };

  // 1. Certificat de tension
  await generateCertificatTension(
    path.join(patientDir, 'certificat-tension.pdf'),
    { ...commonData, tensionDroit: p.blood_pressure || '', tensionGauche: '' }
  );
  console.log('  [OK] Certificat de Prise de Tension');

  // 2. Certificat medical
  await generateCertificatMedical(
    path.join(patientDir, 'certificat-medical.pdf'),
    commonData
  );
  console.log('  [OK] Certificat Medical');

  // 3. Arret de travail
  await generateArretTravail(
    path.join(patientDir, 'arret-travail.pdf'),
    commonData
  );
  console.log('  [OK] Arret de Travail');

  // 4. Certificat grossesse
  if (p.gender === 'F' || p.gender === 'Feminin') {
    await generateCertificatGrossesse(
      path.join(patientDir, 'certificat-grossesse.pdf'),
      commonData
    );
    console.log('  [OK] Certificat de Grossesse');
  }

  // 5. Ordonnance medicale
  const prescriptions = lastCons.recommendations
    ? lastCons.recommendations.split(',').map(s => s.trim())
    : [];
  await generateOrdonnanceMedicale(
    path.join(patientDir, 'ordonnance-medicale.pdf'),
    { ...commonData, prescriptions }
  );
  console.log('  [OK] Ordonnance Medicale');

  // 6. Bulletin de consultation
  await generateBulletinConsultation(
    path.join(patientDir, 'bulletin-consultation.pdf'),
    {
      ...commonData,
      nom: p.name ? p.name.split(' ').slice(-1)[0] : '',
      prenom: p.name ? p.name.split(' ').slice(0, -1).join(' ') : '',
      age: p.age ? String(p.age) : '',
      sexe: p.gender || '',
      service: lastAppt.type_consultation || '',
      consultationEn: lastCons.diagnosis_summary || '',
    }
  );
  console.log('  [OK] Bulletin de Consultation');

  console.log(`\n=== Rapports generes dans ${patientDir} ===`);
}

async function generateForAll() {
  console.log('=== Generation des rapports pour TOUS les patients ===\n');
  const patients = await fetchAPI('patients?select=name&order=name');
  console.log(`  ${patients.length} patients trouves\n`);

  for (const p of patients) {
    await generateForPatient(p.name);
    console.log('');
  }
  console.log('=== TERMINE ===');
}

// Parse CLI args
const args = process.argv.slice(2);
if (args.includes('--all')) {
  generateForAll().catch(e => { console.error(e); process.exit(1); });
} else if (args.includes('--patient')) {
  const idx = args.indexOf('--patient');
  const name = args[idx + 1];
  if (!name) { console.error('Usage: --patient "Nom du patient"'); process.exit(1); }
  generateForPatient(name).catch(e => { console.error(e); process.exit(1); });
} else {
  generateTemplates().catch(e => { console.error(e); process.exit(1); });
}
