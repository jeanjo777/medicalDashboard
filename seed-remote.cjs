const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE = 'https://medical.simpliceake.com/rest/v1';
const TOKEN = fs.readFileSync(path.join(__dirname, 'tok.txt'), 'utf8').trim();
const MEDIC_ID = '2dcac9bd-3e8d-49aa-8ae4-37abdbb10668';

function post(table, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const url = new URL(`${BASE}/${table}`);
    const opts = {
      hostname: url.hostname, path: url.pathname, method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`, 'apikey': 'x',
        'Content-Type': 'application/json', 'Prefer': 'return=representation',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(d)); } catch { resolve(d); }
        } else { reject(new Error(`${table}: ${res.statusCode} ${d.substring(0, 150)}`)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function seed() {
  // ===== PATIENTS =====
  console.log('=== Patients ===');
  const patients = [
    { first_name:'Amadou', last_name:'Diallo', name:'Amadou Diallo', date_of_birth:'1978-03-15', age:48, gender:'M', blood_type:'A+', phone:'+225 07 01 02 03', email:'amadou.diallo@email.com', address:'Cocody, Abidjan', emergency_contact:'Fatou Diallo', medical_history:'Hypertension arterielle depuis 2015', allergies:'Penicilline', primary_pathology:'Hypertension', status:'active', riskScore:75, last_visit:'2026-05-04', poids:82, taille:175, tension_arterielle:'16/10', urines_albumine:'negatif', urines_sucre:'negatif' },
    { first_name:'Fatoumata', last_name:'Kone', name:'Fatoumata Kone', date_of_birth:'1985-07-22', age:40, gender:'F', blood_type:'O+', phone:'+225 07 11 22 33', email:'fatoumata.kone@email.com', address:'Plateau, Abidjan', emergency_contact:'Ibrahim Kone', medical_history:'Diabete type 2', allergies:'Aucune', primary_pathology:'Diabete', status:'active', riskScore:82, last_visit:'2026-05-05', poids:68, taille:162, tension_arterielle:'13/8', urines_albumine:'positif', urines_sucre:'positif' },
    { first_name:'Moussa', last_name:'Traore', name:'Moussa Traore', date_of_birth:'1990-11-08', age:35, gender:'M', blood_type:'B+', phone:'+225 05 44 55 66', email:'moussa.traore@email.com', address:'Yopougon, Abidjan', emergency_contact:'Awa Traore', medical_history:'Asthme chronique', allergies:'Aspirine', primary_pathology:'Asthme', status:'active', riskScore:45, last_visit:'2026-05-03', poids:74, taille:180, tension_arterielle:'12/7', urines_albumine:'negatif', urines_sucre:'negatif' },
    { first_name:'Aminata', last_name:'Coulibaly', name:'Aminata Coulibaly', date_of_birth:'1972-01-30', age:54, gender:'F', blood_type:'AB+', phone:'+225 01 77 88 99', email:'aminata.coulibaly@email.com', address:'Marcory, Abidjan', emergency_contact:'Seydou Coulibaly', medical_history:'Insuffisance cardiaque, HTA', allergies:'Sulfamides', primary_pathology:'Cardiologie', status:'active', riskScore:91, last_visit:'2026-05-06', poids:71, taille:158, tension_arterielle:'15/9', urines_albumine:'positif', urines_sucre:'negatif' },
    { first_name:'Ibrahim', last_name:'Sangare', name:'Ibrahim Sangare', date_of_birth:'1995-05-12', age:31, gender:'M', blood_type:'O-', phone:'+225 07 22 33 44', email:'ibrahim.sangare@email.com', address:'Treichville, Abidjan', emergency_contact:'Mariam Sangare', medical_history:'RAS', allergies:'Aucune', primary_pathology:null, status:'active', riskScore:15, last_visit:'2026-04-28', poids:70, taille:172, tension_arterielle:'12/8', urines_albumine:'negatif', urines_sucre:'negatif' },
    { first_name:'Mariam', last_name:'Ouattara', name:'Mariam Ouattara', date_of_birth:'1988-09-25', age:37, gender:'F', blood_type:'A-', phone:'+225 05 55 66 77', email:'mariam.ouattara@email.com', address:'Abobo, Abidjan', emergency_contact:'Drissa Ouattara', medical_history:'Migraine chronique, anemie', allergies:'Codeine', primary_pathology:'Neurologie', status:'active', riskScore:58, last_visit:'2026-05-01', poids:55, taille:165, tension_arterielle:'11/7', urines_albumine:'negatif', urines_sucre:'negatif' },
    { first_name:'Seydou', last_name:'Bamba', name:'Seydou Bamba', date_of_birth:'1965-12-03', age:60, gender:'M', blood_type:'B-', phone:'+225 01 88 99 00', email:'seydou.bamba@email.com', address:'Adjame, Abidjan', emergency_contact:'Rokia Bamba', medical_history:'BPCO, Diabete type 2, HTA', allergies:'Aucune', primary_pathology:'Pneumologie', status:'active', riskScore:88, last_visit:'2026-05-05', poids:90, taille:170, tension_arterielle:'17/11', urines_albumine:'positif', urines_sucre:'positif' },
    { first_name:'Awa', last_name:'Toure', name:'Awa Toure', date_of_birth:'1992-04-18', age:34, gender:'F', blood_type:'O+', phone:'+225 07 33 44 55', email:'awa.toure@email.com', address:'Cocody, Abidjan', emergency_contact:'Bakary Toure', medical_history:'Grossesse 7 mois', allergies:'Aucune', primary_pathology:'Gynecologie', status:'active', riskScore:40, last_visit:'2026-05-06', poids:72, taille:168, tension_arterielle:'11/7', urines_albumine:'negatif', urines_sucre:'negatif' },
    { first_name:'Bakary', last_name:'Konate', name:'Bakary Konate', date_of_birth:'1980-08-07', age:45, gender:'M', blood_type:'A+', phone:'+225 05 66 77 88', email:'bakary.konate@email.com', address:'Koumassi, Abidjan', emergency_contact:'Fanta Konate', medical_history:'Ulcere gastrique, reflux', allergies:'AINS', primary_pathology:'Gastro-enterologie', status:'active', riskScore:52, last_visit:'2026-04-30', poids:78, taille:176, tension_arterielle:'13/8', urines_albumine:'negatif', urines_sucre:'negatif' },
    { first_name:'Kadiatou', last_name:'Sylla', name:'Kadiatou Sylla', date_of_birth:'1998-02-14', age:28, gender:'F', blood_type:'AB-', phone:'+225 01 99 00 11', email:'kadiatou.sylla@email.com', address:'Riviera, Abidjan', emergency_contact:'Mamadou Sylla', medical_history:'Eczema atopique', allergies:'Latex, Nickel', primary_pathology:'Dermatologie', status:'active', riskScore:22, last_visit:'2026-04-25', poids:58, taille:160, tension_arterielle:'11/7', urines_albumine:'negatif', urines_sucre:'negatif' },
    { first_name:'Drissa', last_name:'Camara', name:'Drissa Camara', date_of_birth:'1975-06-20', age:50, gender:'M', blood_type:'B+', phone:'+225 07 44 55 66', email:'drissa.camara@email.com', address:'Plateau, Abidjan', emergency_contact:'Sitan Camara', medical_history:'AVC ischemique 2024, HTA', allergies:'Aucune', primary_pathology:'Neurologie', status:'active', riskScore:95, last_visit:'2026-05-06', poids:85, taille:178, tension_arterielle:'15/10', urines_albumine:'positif', urines_sucre:'negatif' },
    { first_name:'Rokia', last_name:'Diakite', name:'Rokia Diakite', date_of_birth:'1983-10-11', age:42, gender:'F', blood_type:'O+', phone:'+225 05 77 88 99', email:'rokia.diakite@email.com', address:'Marcory, Abidjan', emergency_contact:'Oumar Diakite', medical_history:'Polyarthrite rhumatoide', allergies:'Methotrexate', primary_pathology:'Rhumatologie', status:'active', riskScore:63, last_visit:'2026-05-02', poids:63, taille:164, tension_arterielle:'12/8', urines_albumine:'negatif', urines_sucre:'negatif' },
    { first_name:'Oumar', last_name:'Keita', name:'Oumar Keita', date_of_birth:'1970-03-28', age:56, gender:'M', blood_type:'A+', phone:'+225 01 22 33 44', email:'oumar.keita@email.com', address:'Cocody, Abidjan', emergency_contact:'Aminata Keita', medical_history:'Insuffisance renale chronique stade 3', allergies:'Iode', primary_pathology:'Nephrologie', status:'active', riskScore:87, last_visit:'2026-05-05', poids:76, taille:174, tension_arterielle:'14/9', urines_albumine:'positif', urines_sucre:'negatif' },
    { first_name:'Sitan', last_name:'Cisse', name:'Sitan Cisse', date_of_birth:'2000-07-04', age:25, gender:'F', blood_type:'O+', phone:'+225 07 55 66 77', email:'sitan.cisse@email.com', address:'Yopougon, Abidjan', emergency_contact:'Papa Cisse', medical_history:'RAS', allergies:'Aucune', primary_pathology:null, status:'active', riskScore:10, last_visit:'2026-04-20', poids:52, taille:157, tension_arterielle:'11/7', urines_albumine:'negatif', urines_sucre:'negatif' },
    { first_name:'Mamadou', last_name:'Dembele', name:'Mamadou Dembele', date_of_birth:'1968-11-15', age:57, gender:'M', blood_type:'B+', phone:'+225 05 88 99 00', email:'mamadou.dembele@email.com', address:'Adjame, Abidjan', emergency_contact:'Oumou Dembele', medical_history:'Cancer prostate en remission, HTA', allergies:'Aucune', primary_pathology:'Oncologie', status:'active', riskScore:78, last_visit:'2026-05-04', poids:80, taille:171, tension_arterielle:'14/9', urines_albumine:'negatif', urines_sucre:'negatif' },
    { first_name:'Oumou', last_name:'Sacko', name:'Oumou Sacko', date_of_birth:'1993-01-22', age:33, gender:'F', blood_type:'A-', phone:'+225 01 44 55 66', email:'oumou.sacko@email.com', address:'Treichville, Abidjan', emergency_contact:'Adama Sacko', medical_history:'Hypothyroidie', allergies:'Aucune', primary_pathology:'Endocrinologie', status:'active', riskScore:35, last_visit:'2026-04-29', poids:60, taille:163, tension_arterielle:'12/7', urines_albumine:'negatif', urines_sucre:'negatif' },
    { first_name:'Adama', last_name:'Diabate', name:'Adama Diabate', date_of_birth:'1987-08-30', age:38, gender:'M', blood_type:'O+', phone:'+225 07 66 77 88', email:'adama.diabate@email.com', address:'Abobo, Abidjan', emergency_contact:'Fatoumata Diabate', medical_history:'Drepanocytose SS', allergies:'Aucune', primary_pathology:'Hematologie', status:'active', riskScore:72, last_visit:'2026-05-03', poids:67, taille:169, tension_arterielle:'11/7', urines_albumine:'negatif', urines_sucre:'negatif' },
    { first_name:'Fanta', last_name:'Sissoko', name:'Fanta Sissoko', date_of_birth:'1991-12-08', age:34, gender:'F', blood_type:'B+', phone:'+225 05 99 00 11', email:'fanta.sissoko@email.com', address:'Koumassi, Abidjan', emergency_contact:'Modibo Sissoko', medical_history:'Epilepsie bien controlee', allergies:'Carbamazepine', primary_pathology:'Neurologie', status:'active', riskScore:48, last_visit:'2026-05-01', poids:56, taille:161, tension_arterielle:'12/7', urines_albumine:'negatif', urines_sucre:'negatif' },
    { first_name:'Modibo', last_name:'Sidibe', name:'Modibo Sidibe', date_of_birth:'1982-04-02', age:44, gender:'M', blood_type:'AB+', phone:'+225 01 11 22 33', email:'modibo.sidibe@email.com', address:'Riviera, Abidjan', emergency_contact:'Kadiatou Sidibe', medical_history:'Hepatite B chronique', allergies:'Aucune', primary_pathology:'Hepatologie', status:'active', riskScore:65, last_visit:'2026-05-02', poids:73, taille:177, tension_arterielle:'13/8', urines_albumine:'negatif', urines_sucre:'negatif' },
    { first_name:'Aissatou', last_name:'Barry', name:'Aissatou Barry', date_of_birth:'1996-06-17', age:29, gender:'F', blood_type:'O-', phone:'+225 07 77 88 99', email:'aissatou.barry@email.com', address:'Cocody, Abidjan', emergency_contact:'Alpha Barry', medical_history:'Allergie severe aux arachides', allergies:'Arachides, fruits a coque', primary_pathology:'Allergologie', status:'active', riskScore:55, last_visit:'2026-04-27', poids:54, taille:159, tension_arterielle:'11/7', urines_albumine:'negatif', urines_sucre:'negatif' },
  ];
  const pIds = [];
  for (const p of patients) {
    try { const r = await post('patients', p); const row = Array.isArray(r)?r[0]:r; pIds.push(row.id); }
    catch (e) { console.error(`  FAIL ${p.name}: ${e.message.substring(0,80)}`); pIds.push(null); }
  }
  console.log(`  ${pIds.filter(Boolean).length}/20 patients`);

  // ===== APPOINTMENTS =====
  console.log('=== Appointments ===');
  const d = (offset) => { const dt = new Date(); dt.setDate(dt.getDate() + offset); return dt.toISOString().split('T')[0]; };
  const today = d(0);
  const appts = [
    [0,'Amadou Diallo',today,'08:30','Controle','Controle tension arterielle','confirmed',30],
    [1,'Fatoumata Kone',today,'09:00','Suivi','Suivi diabete - glycemie','confirmed',30],
    [3,'Aminata Coulibaly',today,'09:30','Urgence','Douleur thoracique','confirmed',45],
    [7,'Awa Toure',today,'10:00','Suivi','Suivi grossesse 7 mois','in_progress',30],
    [10,'Drissa Camara',today,'10:30','Controle','Controle post-AVC','pending',45],
    [12,'Oumar Keita',today,'11:00','Suivi','Bilan renal','pending',30],
    [16,'Adama Diabate',today,'14:00','Suivi','Suivi drepanocytose','pending',30],
    [6,'Seydou Bamba',today,'14:30','Urgence','Dyspnee aigue','pending',45],
    [2,'Moussa Traore',d(-1),'09:00','Suivi','Controle asthme','completed',25],
    [4,'Ibrahim Sangare',d(-1),'10:00','Consultation','Bilan annuel','completed',20],
    [8,'Bakary Konate',d(-2),'11:00','Suivi','Controle gastrique','completed',30],
    [5,'Mariam Ouattara',d(-2),'14:00','Consultation','Bilan neurologique','completed',35],
    [14,'Mamadou Dembele',d(-3),'09:30','Suivi','Suivi oncologique','completed',40],
    [11,'Rokia Diakite',d(-4),'10:00','Suivi','Controle rhumatologie','completed',30],
    [9,'Kadiatou Sylla',d(1),'09:00','Suivi','Controle dermatologie','pending',20],
    [15,'Oumou Sacko',d(1),'10:00','Suivi','Bilan thyroidien','pending',25],
    [17,'Fanta Sissoko',d(2),'09:00','Controle','Suivi epilepsie','pending',30],
    [18,'Modibo Sidibe',d(2),'10:30','Suivi','Bilan hepatique','pending',30],
    [19,'Aissatou Barry',d(3),'11:00','Consultation','Bilan allergologique','pending',25],
    [13,'Sitan Cisse',d(-17),'14:00','Consultation','Consultation generale','completed',20],
  ];
  let ac=0;
  for (const [pi,pn,d,t,tc,m,s,dur] of appts) {
    if(!pIds[pi]) continue;
    try { await post('appointments',{patient_id:pIds[pi],patient_name:pn,medic_id:MEDIC_ID,appointment_date:d,appointment_time:t,type_consultation:tc,motif:m,status:s,duration:dur}); ac++; }
    catch(e){ console.error(`  FAIL apt: ${e.message.substring(0,80)}`); }
  }
  console.log(`  ${ac}/20 appointments`);

  // ===== CONSULTATIONS =====
  console.log('=== Consultations ===');
  const cons = [
    [0,'Cephalees, vertiges, tension 16/10','Hypertension mal controlee','Augmenter Amlodipine a 10mg','completed','medium','Analyse IA: HTA grade 2','25'],
    [1,'Polyurie, polydipsie, fatigue','Diabete type 2 desequilibre','Metformine 1000mg x2','completed','medium','Analyse IA: HbA1c elevee','30'],
    [3,'Douleur thoracique, dyspnee effort','Insuffisance cardiaque decompensee','Hospitalisation, ECG, troponine','completed','high','Analyse IA: Urgence cardiologique','45'],
    [10,'Paresthesies main droite','Sequelles AVC - suivi neurologique','IRM cerebrale controle','completed','medium','Analyse IA: Recuperation neurologique','35'],
    [6,'Toux productive, dyspnee','Exacerbation BPCO','Corticoides inhales, bronchodilatateurs','completed','high','Analyse IA: BPCO stade III','30'],
    [12,'Oedemes membres inferieurs','IRC stade 3 - progression','Nephroprotection, restriction proteique','completed','medium','Analyse IA: DFG en baisse','40'],
    [2,'Toux nocturne, gene respiratoire','Asthme partiellement controle','Augmenter corticoides inhales','completed','low','Analyse IA: Asthme GINA palier 3','25'],
    [7,'Grossesse 7 mois, tension normale','Grossesse evolutive normale','Echo T3, NFS, glycemie','completed','low','Analyse IA: Grossesse normale','30'],
    [16,'Douleurs articulaires, fatigue','Crise vaso-occlusive drepanocytaire','Hydratation IV, antalgiques','completed','high','Analyse IA: CVO drepanocytaire','35'],
    [14,'Douleurs pelviennes, PSA stable','Cancer prostate en remission','PSA dans 3 mois, surveillance','completed','low','Analyse IA: Remission confirmee','25'],
  ];
  let cc=0;
  for (const [pi,sym,diag,rec,st,urg,ai,dur] of cons) {
    if(!pIds[pi]) continue;
    try { await post('consultations',{patient_id:pIds[pi],medic_id:MEDIC_ID,symptoms:sym,diagnosis_summary:diag,recommendations:rec,status:st,urgency_level:urg,ai_response:ai,duration:dur}); cc++; }
    catch(e){ console.error(`  FAIL cons: ${e.message.substring(0,80)}`); }
  }
  console.log(`  ${cc}/10 consultations`);

  // ===== ANALYTICS =====
  console.log('=== Analytics ===');
  const mois=['Jan','Fev','Mar','Avr','Mai','Jun','Jul','Aou','Sep','Oct','Nov','Dec'];
  const f25=[[45,12,5],[52,15,7],[48,14,6],[55,18,8],[60,20,9],[58,19,7],[62,22,10],[56,17,6],[65,24,11],[70,25,12],[68,23,9],[72,28,13]];
  const f26=[[75,30,14],[82,32,16],[78,28,12],[85,35,18],[90,38,20]];
  for(let i=0;i<12;i++) try{await post('analytics_flux_patients',{mois:mois[i],annee:2025,consultations:f25[i][0],suivis:f25[i][1],urgences:f25[i][2]})}catch{}
  for(let i=0;i<5;i++) try{await post('analytics_flux_patients',{mois:mois[i],annee:2026,consultations:f26[i][0],suivis:f26[i][1],urgences:f26[i][2]})}catch{}
  console.log('  17 flux_patients');

  for(const s of [
    {date:d(0),patients_consultes:90,patients_consultes_evolution:12.5,rdv_honores:85,rdv_honores_evolution:8.3,rdv_exceptionnels:15,rdv_exceptionnels_evolution:-5.2,cas_risque:8,cas_risque_evolution:2.1},
    {date:d(-7),patients_consultes:80,patients_consultes_evolution:10.2,rdv_honores:78,rdv_honores_evolution:6.5,rdv_exceptionnels:16,rdv_exceptionnels_evolution:3.1,cas_risque:7,cas_risque_evolution:-1.5},
    {date:d(-14),patients_consultes:73,patients_consultes_evolution:8.7,rdv_honores:73,rdv_honores_evolution:5.2,rdv_exceptionnels:14,rdv_exceptionnels_evolution:2.8,cas_risque:6,cas_risque_evolution:0.5},
    {date:d(-21),patients_consultes:67,patients_consultes_evolution:5.3,rdv_honores:69,rdv_honores_evolution:3.8,rdv_exceptionnels:12,rdv_exceptionnels_evolution:-2.1,cas_risque:5,cas_risque_evolution:-0.8},
  ]) try{await post('analytics_stats',s)}catch{}
  console.log('  4 stats');

  for(const p of [
    {pathologie:'Hypertension',count:45,pourcentage:22.5},{pathologie:'Diabete',count:38,pourcentage:19.0},
    {pathologie:'Paludisme',count:30,pourcentage:15.0},{pathologie:'Infections respiratoires',count:25,pourcentage:12.5},
    {pathologie:'Gastro-enterite',count:18,pourcentage:9.0},{pathologie:'Dermatoses',count:14,pourcentage:7.0},
    {pathologie:'Rhumatismes',count:10,pourcentage:5.0},{pathologie:'Anemie',count:8,pourcentage:4.0},
    {pathologie:'Asthme',count:7,pourcentage:3.5},{pathologie:'Autres',count:5,pourcentage:2.5},
  ]) try{await post('analytics_pathologies',p)}catch{}
  console.log('  10 pathologies');

  for(const d of [
    {departement:'Cardiologie',patients_count:35,croissance:12.5,date:'2026-05-06'},
    {departement:'Medecine Generale',patients_count:85,croissance:8.3,date:'2026-05-06'},
    {departement:'Pediatrie',patients_count:42,croissance:15.2,date:'2026-05-06'},
    {departement:'Gynecologie',patients_count:38,croissance:10.1,date:'2026-05-06'},
    {departement:'Neurologie',patients_count:22,croissance:5.7,date:'2026-05-06'},
    {departement:'Pneumologie',patients_count:18,croissance:7.8,date:'2026-05-06'},
    {departement:'Urgences',patients_count:28,croissance:-3.2,date:'2026-05-06'},
  ]) try{await post('analytics_departement',d)}catch{}
  console.log('  7 departements');

  for(const m of [
    {medecin_id:MEDIC_ID,medecin_name:'Dr. MediCare Admin',consultations:90,satisfaction:4.7,minutes_par_patient:28,date:'2026-05-06'},
    {medecin_id:MEDIC_ID,medecin_name:'Dr. MediCare Admin',consultations:80,satisfaction:4.6,minutes_par_patient:30,date:'2026-04-29'},
    {medecin_id:MEDIC_ID,medecin_name:'Dr. MediCare Admin',consultations:73,satisfaction:4.5,minutes_par_patient:32,date:'2026-04-22'},
  ]) try{await post('analytics_medecins',m)}catch{}
  console.log('  3 medecins');

  const weeks=['S1','S2','S3','S4','S5','S6','S7','S8','S9'];
  const tr25=[72,74,73,76,78,80,79,82,84],tr26=[83,85,84,87,88,90,89,91,92];
  for(let i=0;i<9;i++){
    try{await post('analytics_recuperation',{semaine:weeks[i],annee:2025,taux_reel:tr25[i],objectif:85})}catch{}
    try{await post('analytics_recuperation',{semaine:weeks[i],annee:2026,taux_reel:tr26[i],objectif:90})}catch{}
  }
  console.log('  18 recuperation');

  for(const s of [
    {systeme:'Cardiovasculaire',score:78,date:'2026-05-06'},{systeme:'Respiratoire',score:82,date:'2026-05-06'},
    {systeme:'Digestif',score:75,date:'2026-05-06'},{systeme:'Neurologique',score:88,date:'2026-05-06'},
    {systeme:'Endocrinien',score:71,date:'2026-05-06'},{systeme:'Musculo-squelettique',score:85,date:'2026-05-06'},
    {systeme:'Urinaire',score:79,date:'2026-05-06'},{systeme:'Immunitaire',score:90,date:'2026-05-06'},
  ]) try{await post('analytics_systemes',s)}catch{}
  console.log('  8 systemes');

  // ===== ACTIVITY LOG (with correct constraints) =====
  console.log('=== Activity Log ===');
  for(const a of [
    {user_id:MEDIC_ID,user_name:'Dr. MediCare',user_initials:'MC',action:'Consultation terminee',entity_type:'consultation',entity_name:'Amadou Diallo',user_type:'medic'},
    {user_id:MEDIC_ID,user_name:'Dr. MediCare',user_initials:'MC',action:'Nouveau patient enregistre',entity_type:'patient',entity_name:'Aissatou Barry',user_type:'medic'},
    {user_id:MEDIC_ID,user_name:'Dr. MediCare',user_initials:'MC',action:'Rendez-vous confirme',entity_type:'appointment',entity_name:'Fatoumata Kone',user_type:'medic'},
    {user_id:MEDIC_ID,user_name:'Dr. MediCare',user_initials:'MC',action:'Ordonnance emise',entity_type:'other',entity_name:'Seydou Bamba',user_type:'medic'},
    {user_id:MEDIC_ID,user_name:'Dr. MediCare',user_initials:'MC',action:'Bilan sanguin demande',entity_type:'other',entity_name:'Drissa Camara',user_type:'medic'},
    {user_id:MEDIC_ID,user_name:'Dr. MediCare',user_initials:'MC',action:'Consultation IA utilisee',entity_type:'consultation',entity_name:'Aminata Coulibaly',user_type:'medic'},
    {user_id:MEDIC_ID,user_name:'Dr. MediCare',user_initials:'MC',action:'Patient transfere',entity_type:'patient',entity_name:'Oumar Keita',user_type:'medic'},
    {user_id:MEDIC_ID,user_name:'Dr. MediCare',user_initials:'MC',action:'Rapport genere',entity_type:'other',entity_name:'Rapport hebdomadaire',user_type:'system'},
  ]) try{await post('activity_log',a)}catch(e){console.error(`  FAIL: ${e.message.substring(0,80)}`)}
  console.log('  8 activities');

  // ===== ALERTS =====
  console.log('=== Alerts ===');
  for(const a of [
    {title:'Patients a risque eleve',description:'8 patients avec un score de risque superieur a 70',alert_type:'risk',severity:'high',current_value:8,threshold_value:5,is_acknowledged:false},
    {title:'Taux de rendez-vous manques',description:'12% de rendez-vous non honores cette semaine',alert_type:'appointment',severity:'medium',current_value:12,threshold_value:15,is_acknowledged:false},
    {title:'Capacite consultations atteinte',description:'90% de la capacite de consultations utilisee',alert_type:'capacity',severity:'warning',current_value:90,threshold_value:85,is_acknowledged:false},
    {title:'Stock medicaments bas',description:'5 medicaments en rupture de stock imminente',alert_type:'inventory',severity:'high',current_value:5,threshold_value:10,is_acknowledged:false},
  ]) try{await post('analytics_alerts',a)}catch(e){console.error(`  FAIL: ${e.message.substring(0,80)}`)}
  console.log('  4 alerts');

  console.log('\n=== SEED COMPLETE ===');
}
seed().catch(e=>console.error('FATAL:',e));
