-- ============================================================
-- MediCare Pro - Donnees de demonstration
-- ============================================================

-- Variable: medic admin ID (will be set dynamically)
DO $$
DECLARE
  admin_id uuid;
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid;
  p6 uuid; p7 uuid; p8 uuid; p9 uuid; p10 uuid;
  p11 uuid; p12 uuid; p13 uuid; p14 uuid; p15 uuid;
  p16 uuid; p17 uuid; p18 uuid; p19 uuid; p20 uuid;
  p21 uuid; p22 uuid; p23 uuid; p24 uuid; p25 uuid;
BEGIN
  SELECT id INTO admin_id FROM medics WHERE username = 'medecin' LIMIT 1;

  -- ============================================================
  -- PATIENTS (25 patients realistes)
  -- ============================================================

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, allergies, medical_history, primary_pathology, status, "riskScore", risk_score, address, created_at, registered_at)
  VALUES
    (gen_random_uuid(), 'amadou.diallo@email.com', 'Amadou Diallo', 'Amadou', 'Diallo', 45, 'male', '+225 07 12 34 56', 'A+', 'Penicilline', 'Hypertension depuis 2019, diabete type 2', 'Hypertension arterielle', 'in_treatment', 82, 82, 'Abidjan, Cocody', NOW() - interval '4 months')
  RETURNING id INTO p1;

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, allergies, medical_history, primary_pathology, status, "riskScore", risk_score, address, created_at, registered_at)
  VALUES
    (gen_random_uuid(), 'fatou.kone@email.com', 'Fatou Kone', 'Fatou', 'Kone', 32, 'female', '+225 05 98 76 54', 'O+', NULL, 'Grossesse en cours (7 mois), anemie legere', 'Suivi grossesse', 'in_treatment', 45, 45, 'Abidjan, Yopougon', NOW() - interval '3 months')
  RETURNING id INTO p2;

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, allergies, medical_history, primary_pathology, status, "riskScore", risk_score, address, created_at, registered_at)
  VALUES
    (gen_random_uuid(), 'moussa.traore@email.com', 'Moussa Traore', 'Moussa', 'Traore', 58, 'male', '+225 01 23 45 67', 'B+', 'Aspirine', 'Diabete type 2, retinopathie diabetique, neuropathie', 'Diabete type 2', 'in_treatment', 91, 91, 'Bouake', NOW() - interval '6 months')
  RETURNING id INTO p3;

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, allergies, medical_history, primary_pathology, status, "riskScore", risk_score, address, created_at, registered_at)
  VALUES
    (gen_random_uuid(), 'aissatou.bamba@email.com', 'Aissatou Bamba', 'Aissatou', 'Bamba', 28, 'female', '+225 07 65 43 21', 'AB+', NULL, 'Asthme depuis enfance, bien controle', 'Asthme', 'active', 30, 30, 'Abidjan, Marcory', NOW() - interval '2 months')
  RETURNING id INTO p4;

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, allergies, medical_history, primary_pathology, status, "riskScore", risk_score, address, created_at, registered_at)
  VALUES
    (gen_random_uuid(), 'ibrahim.coulibaly@email.com', 'Ibrahim Coulibaly', 'Ibrahim', 'Coulibaly', 67, 'male', '+225 05 11 22 33', 'O-', 'Sulfamides', 'Insuffisance cardiaque, HTA, BPCO', 'Insuffisance cardiaque', 'in_treatment', 95, 95, 'Abidjan, Plateau', NOW() - interval '8 months')
  RETURNING id INTO p5;

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, allergies, medical_history, primary_pathology, status, "riskScore", risk_score, address, created_at, registered_at)
  VALUES
    (gen_random_uuid(), 'mariam.ouattara@email.com', 'Mariam Ouattara', 'Mariam', 'Ouattara', 41, 'female', '+225 01 44 55 66', 'A-', NULL, 'Migraine chronique, hypothyroidie', 'Hypothyroidie', 'in_treatment', 35, 35, 'San Pedro', NOW() - interval '5 months')
  RETURNING id INTO p6;

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, allergies, medical_history, primary_pathology, status, "riskScore", risk_score, address, created_at, registered_at)
  VALUES
    (gen_random_uuid(), 'sekou.camara@email.com', 'Sekou Camara', 'Sekou', 'Camara', 52, 'male', '+225 07 77 88 99', 'B-', 'Codeine', 'Paludisme recurrent, drepanocytose AS', 'Drepanocytose', 'in_treatment', 73, 73, 'Korhogo', NOW() - interval '7 months')
  RETURNING id INTO p7;

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, allergies, medical_history, primary_pathology, status, "riskScore", risk_score, address, created_at, registered_at)
  VALUES
    (gen_random_uuid(), 'aminata.sylla@email.com', 'Aminata Sylla', 'Aminata', 'Sylla', 35, 'female', '+225 05 33 22 11', 'O+', NULL, 'RAS', NULL, 'active', 10, 10, 'Abidjan, Treichville', NOW() - interval '1 month')
  RETURNING id INTO p8;

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, allergies, medical_history, primary_pathology, status, "riskScore", risk_score, address, created_at, registered_at)
  VALUES
    (gen_random_uuid(), 'oumar.sow@email.com', 'Oumar Sow', 'Oumar', 'Sow', 73, 'male', '+225 01 99 88 77', 'A+', 'Metformine', 'AVC ischemique 2023, hemiplegie droite, HTA', 'Sequelles AVC', 'in_treatment', 88, 88, 'Yamoussoukro', NOW() - interval '10 months')
  RETURNING id INTO p9;

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, allergies, medical_history, primary_pathology, status, "riskScore", risk_score, address, created_at, registered_at)
  VALUES
    (gen_random_uuid(), 'djamila.toure@email.com', 'Djamila Toure', 'Djamila', 'Toure', 24, 'female', '+225 07 55 66 77', 'AB-', NULL, 'Anemie ferriprive traitee', 'Anemie', 'recovered', 15, 15, 'Abidjan, Abobo', NOW() - interval '3 months')
  RETURNING id INTO p10;

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, allergies, medical_history, primary_pathology, status, "riskScore", risk_score, address, created_at, registered_at)
  VALUES
    (gen_random_uuid(), 'bakary.keita@email.com', 'Bakary Keita', 'Bakary', 'Keita', 49, 'male', '+225 05 12 34 56', 'B+', NULL, 'Ulcere gastrique traite, reflux', 'Reflux gastro-oesophagien', 'active', 25, 25, 'Daloa', NOW() - interval '2 months')
  RETURNING id INTO p11;

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, allergies, medical_history, primary_pathology, status, "riskScore", risk_score, address, created_at, registered_at)
  VALUES
    (gen_random_uuid(), 'kadiatou.barry@email.com', 'Kadiatou Barry', 'Kadiatou', 'Barry', 55, 'female', '+225 01 65 43 21', 'O+', 'Iode', 'Diabete type 2, obesite, gonarthrose bilaterale', 'Diabete type 2', 'in_treatment', 78, 78, 'Abidjan, Cocody', NOW() - interval '9 months')
  RETURNING id INTO p12;

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, allergies, medical_history, primary_pathology, status, "riskScore", risk_score, address, created_at, registered_at)
  VALUES
    (gen_random_uuid(), 'abdoulaye.diop@email.com', 'Abdoulaye Diop', 'Abdoulaye', 'Diop', 38, 'male', '+225 07 21 43 65', 'A+', NULL, 'Lombalgie chronique', 'Lombalgie', 'active', 20, 20, 'Abidjan, Riviera', NOW() - interval '1 month')
  RETURNING id INTO p13;

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, allergies, medical_history, primary_pathology, status, "riskScore", risk_score, address, created_at, registered_at)
  VALUES
    (gen_random_uuid(), 'fatoumata.sangare@email.com', 'Fatoumata Sangare', 'Fatoumata', 'Sangare', 62, 'female', '+225 05 87 65 43', 'B+', 'Latex', 'Arthrose, HTA, cataracte operee', 'Arthrose', 'in_treatment', 60, 60, 'Bouake', NOW() - interval '11 months')
  RETURNING id INTO p14;

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, allergies, medical_history, primary_pathology, status, "riskScore", risk_score, address, created_at, registered_at)
  VALUES
    (gen_random_uuid(), 'mamadou.cisse@email.com', 'Mamadou Cisse', 'Mamadou', 'Cisse', 43, 'male', '+225 01 34 56 78', 'O+', NULL, 'Hepatite B chronique sous traitement', 'Hepatite B', 'in_treatment', 70, 70, 'Man', NOW() - interval '6 months')
  RETURNING id INTO p15;

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, allergies, medical_history, primary_pathology, status, "riskScore", risk_score, address, created_at, registered_at)
  VALUES
    (gen_random_uuid(), 'awa.diabate@email.com', 'Awa Diabate', 'Awa', 'Diabate', 29, 'female', '+225 07 43 21 09', 'A+', NULL, 'Infection urinaire recidivante', NULL, 'active', 18, 18, 'Abidjan, Bingerville', NOW() - interval '2 weeks')
  RETURNING id INTO p16;

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, allergies, medical_history, primary_pathology, status, "riskScore", risk_score, address, created_at, registered_at)
  VALUES
    (gen_random_uuid(), 'youssouf.konate@email.com', 'Youssouf Konate', 'Youssouf', 'Konate', 56, 'male', '+225 05 67 89 01', 'AB+', 'AINS', 'Insuffisance renale chronique stade 3, HTA', 'Insuffisance renale', 'in_treatment', 85, 85, 'Abidjan, Adjame', NOW() - interval '5 months')
  RETURNING id INTO p17;

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, allergies, medical_history, primary_pathology, status, "riskScore", risk_score, address, created_at, registered_at)
  VALUES
    (gen_random_uuid(), 'rokia.dembele@email.com', 'Rokia Dembele', 'Rokia', 'Dembele', 33, 'female', '+225 01 11 22 33', 'O+', NULL, 'Depression traitee, en remission', 'Depression', 'recovered', 22, 22, 'Abidjan, Cocody', NOW() - interval '4 months')
  RETURNING id INTO p18;

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, allergies, medical_history, primary_pathology, status, "riskScore", risk_score, address, created_at, registered_at)
  VALUES
    (gen_random_uuid(), 'souleymane.toure@email.com', 'Souleymane Toure', 'Souleymane', 'Toure', 61, 'male', '+225 07 88 77 66', 'B-', NULL, 'Cancer prostate en remission, suivi PSA', 'Cancer prostate', 'in_treatment', 75, 75, 'Abidjan, Plateau', NOW() - interval '12 months')
  RETURNING id INTO p19;

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, allergies, medical_history, primary_pathology, status, "riskScore", risk_score, address, created_at, registered_at)
  VALUES
    (gen_random_uuid(), 'hawa.kaba@email.com', 'Hawa Kaba', 'Hawa', 'Kaba', 27, 'female', '+225 05 44 33 22', 'A-', NULL, 'RAS, bilan annuel', NULL, 'active', 5, 5, 'Abidjan, Marcory', NOW() - interval '1 week')
  RETURNING id INTO p20;

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, primary_pathology, status, "riskScore", risk_score, created_at, registered_at)
  VALUES (gen_random_uuid(), 'lamine.sidibe@email.com', 'Lamine Sidibe', 'Lamine', 'Sidibe', 47, 'male', '+225 01 55 66 77', 'O+', 'Paludisme', 'active', 40, 40, NOW() - interval '3 weeks', NOW() - interval '3 weeks');

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, primary_pathology, status, "riskScore", risk_score, created_at, registered_at)
  VALUES (gen_random_uuid(), 'safiatou.conde@email.com', 'Safiatou Conde', 'Safiatou', 'Conde', 39, 'female', '+225 07 22 33 44', 'B+', 'Fibromes uterins', 'in_treatment', 50, 50, NOW() - interval '2 months', NOW() - interval '2 months');

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, primary_pathology, status, "riskScore", risk_score, created_at, registered_at)
  VALUES (gen_random_uuid(), 'boubacar.bah@email.com', 'Boubacar Bah', 'Boubacar', 'Bah', 71, 'male', '+225 05 99 88 77', 'A+', 'BPCO', 'in_treatment', 80, 80, NOW() - interval '7 months', NOW() - interval '7 months');

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, primary_pathology, status, "riskScore", risk_score, created_at, registered_at)
  VALUES (gen_random_uuid(), 'nene.diallo@email.com', 'Nene Diallo', 'Nene', 'Diallo', 22, 'female', '+225 01 33 44 55', NULL, NULL, 'active', 8, 8, NOW() - interval '5 days', NOW() - interval '5 days');

  INSERT INTO patients (id, email, name, first_name, last_name, age, gender, phone, blood_type, primary_pathology, status, "riskScore", risk_score, created_at, registered_at)
  VALUES (gen_random_uuid(), 'cheick.sacko@email.com', 'Cheick Sacko', 'Cheick', 'Sacko', 54, 'male', '+225 07 66 55 44', NULL, 'Epilepsie', 'in_treatment', 65, 65, NOW() - interval '4 months', NOW() - interval '4 months');

  -- ============================================================
  -- APPOINTMENTS (rendez-vous - incluant aujourd'hui)
  -- ============================================================

  INSERT INTO appointments (patient_name, patient_email, patient_phone, appointment_date, appointment_time, status, patient_id, medic_id, motif, type_consultation, duration) VALUES
    ('Amadou Diallo', 'amadou.diallo@email.com', '+225 07 12 34 56', CURRENT_DATE, '08:30', 'a_venir', p1, admin_id, 'Controle tension arterielle', 'Suivi', 30),
    ('Fatou Kone', 'fatou.kone@email.com', '+225 05 98 76 54', CURRENT_DATE, '09:00', 'a_venir', p2, admin_id, 'Suivi grossesse 7eme mois', 'Suivi', 45),
    ('Moussa Traore', 'moussa.traore@email.com', '+225 01 23 45 67', CURRENT_DATE, '09:45', 'a_venir', p3, admin_id, 'Controle glycemie et fond oeil', 'Consultation', 30),
    ('Ibrahim Coulibaly', 'ibrahim.coulibaly@email.com', '+225 05 11 22 33', CURRENT_DATE, '10:30', 'a_venir', p5, admin_id, 'Echocardiographie de controle', 'Examen', 60),
    ('Aissatou Bamba', 'aissatou.bamba@email.com', '+225 07 65 43 21', CURRENT_DATE, '11:30', 'a_venir', p4, admin_id, 'Renouvellement ordonnance', 'Consultation', 15),
    ('Kadiatou Barry', 'kadiatou.barry@email.com', '+225 01 65 43 21', CURRENT_DATE, '14:00', 'a_venir', p12, admin_id, 'Bilan diabetique trimestriel', 'Suivi', 30),
    ('Youssouf Konate', 'youssouf.konate@email.com', '+225 05 67 89 01', CURRENT_DATE, '14:45', 'a_venir', p17, admin_id, 'Resultats analyses renales', 'Consultation', 30),
    ('Oumar Sow', 'oumar.sow@email.com', '+225 01 99 88 77', CURRENT_DATE, '15:30', 'a_venir', p9, admin_id, 'Reeducation post-AVC suivi', 'Suivi', 45),

    -- RDV passes cette semaine
    ('Sekou Camara', 'sekou.camara@email.com', '+225 07 77 88 99', CURRENT_DATE - 1, '09:00', 'honore', p7, admin_id, 'Controle NFS drepanocytose', 'Suivi', 30),
    ('Aminata Sylla', 'aminata.sylla@email.com', '+225 05 33 22 11', CURRENT_DATE - 1, '10:00', 'honore', p8, admin_id, 'Bilan de sante annuel', 'Consultation', 30),
    ('Mamadou Cisse', 'mamadou.cisse@email.com', '+225 01 34 56 78', CURRENT_DATE - 2, '08:30', 'honore', p15, admin_id, 'Charge virale hepatite B', 'Suivi', 30),
    ('Fatoumata Sangare', 'fatoumata.sangare@email.com', '+225 05 87 65 43', CURRENT_DATE - 2, '14:00', 'honore', p14, admin_id, 'Infiltration genou', 'Examen', 45),
    ('Souleymane Toure', 'souleymane.toure@email.com', '+225 07 88 77 66', CURRENT_DATE - 3, '09:30', 'honore', p19, admin_id, 'PSA de controle', 'Suivi', 30),
    ('Mariam Ouattara', 'mariam.ouattara@email.com', '+225 01 44 55 66', CURRENT_DATE - 3, '11:00', 'annule', p6, admin_id, 'Controle thyroide', 'Suivi', 30),

    -- RDV semaines precedentes
    ('Amadou Diallo', 'amadou.diallo@email.com', '+225 07 12 34 56', CURRENT_DATE - 7, '09:00', 'honore', p1, admin_id, 'Ajustement traitement HTA', 'Consultation', 30),
    ('Moussa Traore', 'moussa.traore@email.com', '+225 01 23 45 67', CURRENT_DATE - 10, '10:00', 'honore', p3, admin_id, 'HbA1c trimestrielle', 'Suivi', 30),
    ('Ibrahim Coulibaly', 'ibrahim.coulibaly@email.com', '+225 05 11 22 33', CURRENT_DATE - 14, '08:30', 'honore', p5, admin_id, 'Consultation cardiologie', 'Consultation', 45),
    ('Bakary Keita', 'bakary.keita@email.com', '+225 05 12 34 56', CURRENT_DATE - 14, '14:00', 'no_show', p11, admin_id, 'Controle endoscopie', 'Examen', 30),
    ('Djamila Toure', 'djamila.toure@email.com', '+225 07 55 66 77', CURRENT_DATE - 21, '09:00', 'honore', p10, admin_id, 'Bilan ferritine', 'Suivi', 15),
    ('Rokia Dembele', 'rokia.dembele@email.com', '+225 01 11 22 33', CURRENT_DATE - 28, '10:30', 'honore', p18, admin_id, 'Suivi psychiatrique', 'Suivi', 45);

  -- ============================================================
  -- CONSULTATIONS
  -- ============================================================

  INSERT INTO consultations (patient_id, medic_id, symptoms, status, ai_response, diagnosis_summary, urgency_level, created_at) VALUES
    (p1, admin_id, 'Cephalees matinales, tension 16/10 malgre traitement', 'completed', 'Recommandation: ajuster le traitement antihypertenseur. Ajouter un inhibiteur calcique.', 'HTA mal equilibree', 'medium', NOW() - interval '7 days'),
    (p3, admin_id, 'Paresthesies pieds, vision floue intermittente', 'completed', 'Signes de neuropathie et retinopathie diabetique. Fond oeil urgent recommande.', 'Complications diabetiques', 'high', NOW() - interval '10 days'),
    (p5, admin_id, 'Dyspnee effort, oedemes membres inferieurs', 'completed', 'Signes de decompensation cardiaque. Ajuster diuretiques et surveillance poids quotidien.', 'Decompensation cardiaque', 'critical', NOW() - interval '14 days'),
    (p7, admin_id, 'Douleurs osseuses, fatigue intense', 'ai_analyzed', 'Possible crise vaso-occlusive. NFS et bilan hemolytique recommandes.', 'Crise drepanocytaire suspectee', 'high', NOW() - interval '3 days'),
    (p9, admin_id, 'Difficulte mobilisation bras droit, troubles elocution', 'completed', 'Suivi post-AVC satisfaisant. Poursuivre reeducation. Controle IRM dans 3 mois.', 'Suivi post-AVC', 'medium', NOW() - interval '5 days'),
    (p12, admin_id, 'Polyurie, soif excessive, prise de poids', 'completed', 'HbA1c a 8.2%. Ajuster traitement. Regime et activite physique a renforcer.', 'Diabete desequilibre', 'medium', NOW() - interval '2 days'),
    (p15, admin_id, 'Fatigue, douleur hypochondre droit', 'ai_analyzed', 'Charge virale en hausse. Revoir observance du traitement antiviral.', 'Hepatite B reactivation', 'high', NOW() - interval '4 days'),
    (p17, admin_id, 'Nausees, crampes musculaires, oligurie', 'completed', 'Creatinine en hausse. Adapter posologies nephrotoxiques. Hydratation.', 'Aggravation insuffisance renale', 'critical', NOW() - interval '6 days'),
    (p2, admin_id, 'Contractions irregulieres, douleurs lombaires', 'completed', 'Grossesse 7 mois. Monitoring fetal normal. Repos recommande.', 'Suivi grossesse normal', 'low', NOW() - interval '1 day'),
    (p14, admin_id, 'Douleur genou bilateral, raideur matinale', 'completed', 'Gonarthrose bilaterale confirmee. Infiltration acide hyaluronique proposee.', 'Gonarthrose', 'low', NOW() - interval '8 days');

  -- ============================================================
  -- ANALYTICS - Flux patients (12 mois)
  -- ============================================================

  INSERT INTO analytics_flux_patients (mois, consultations, suivis, urgences, annee) VALUES
    ('Jan', 145, 89, 12, 2026),
    ('Fev', 162, 95, 15, 2026),
    ('Mar', 178, 102, 18, 2026),
    ('Avr', 156, 88, 14, 2026),
    ('Mai', 185, 110, 20, 2026),
    ('Jun', 0, 0, 0, 2026),
    ('Jul', 0, 0, 0, 2026),
    ('Aou', 0, 0, 0, 2026),
    ('Sep', 0, 0, 0, 2026),
    ('Oct', 0, 0, 0, 2026),
    ('Nov', 0, 0, 0, 2026),
    ('Dec', 0, 0, 0, 2026),
    ('Jan', 120, 72, 8, 2025),
    ('Fev', 135, 80, 10, 2025),
    ('Mar', 142, 85, 11, 2025),
    ('Avr', 138, 82, 9, 2025),
    ('Mai', 155, 90, 13, 2025),
    ('Jun', 148, 87, 12, 2025),
    ('Jul', 130, 78, 7, 2025),
    ('Aou', 125, 75, 6, 2025),
    ('Sep', 140, 84, 10, 2025),
    ('Oct', 152, 91, 14, 2025),
    ('Nov', 160, 96, 16, 2025),
    ('Dec', 138, 83, 11, 2025);

  -- ============================================================
  -- ANALYTICS - Stats globales
  -- ============================================================

  INSERT INTO analytics_stats (date, patients_consultes, patients_consultes_evolution, rdv_honores, rdv_honores_evolution, rdv_exceptionnels, rdv_exceptionnels_evolution, cas_risque, cas_risque_evolution) VALUES
    (CURRENT_DATE, 185, 12.5, 92, 3.2, 8, -5.0, 7, 2.1),
    (CURRENT_DATE - 7, 178, 8.3, 89, 2.8, 10, 5.0, 6, -1.5),
    (CURRENT_DATE - 14, 165, 5.1, 87, 1.5, 7, 0.0, 5, 0.0),
    (CURRENT_DATE - 21, 170, 6.2, 90, 2.0, 9, 3.0, 5, 1.0);

  -- ============================================================
  -- ANALYTICS - Pathologies
  -- ============================================================

  INSERT INTO analytics_pathologies (pathologie, pourcentage, count) VALUES
    ('Hypertension', 22.5, 42),
    ('Diabete', 18.3, 34),
    ('Paludisme', 15.1, 28),
    ('Infections respiratoires', 12.4, 23),
    ('Drepanocytose', 8.6, 16),
    ('Arthrose', 7.0, 13),
    ('Grossesse/Suivi', 6.5, 12),
    ('Hepatite B', 4.3, 8),
    ('Insuffisance renale', 3.2, 6),
    ('Autres', 2.1, 4);

  -- ============================================================
  -- ANALYTICS - Departements
  -- ============================================================

  INSERT INTO analytics_departement (departement, patients_count, croissance, date) VALUES
    ('Medecine Generale', 85, 8.5, CURRENT_DATE),
    ('Cardiologie', 42, 12.3, CURRENT_DATE),
    ('Diabetologie', 38, 15.7, CURRENT_DATE),
    ('Gynecologie', 28, 6.2, CURRENT_DATE),
    ('Pediatrie', 25, 4.8, CURRENT_DATE),
    ('Neurologie', 18, 9.1, CURRENT_DATE),
    ('Chirurgie', 15, -2.3, CURRENT_DATE);

  -- ============================================================
  -- ANALYTICS - Performance medecins
  -- ============================================================

  INSERT INTO analytics_medecins (medecin_id, medecin_name, consultations, minutes_par_patient, satisfaction, date) VALUES
    (admin_id, 'Dr. MediCare Admin', 185, 22, 94.5, CURRENT_DATE),
    (admin_id, 'Dr. MediCare Admin', 178, 24, 93.2, CURRENT_DATE - 7),
    (admin_id, 'Dr. MediCare Admin', 165, 23, 92.8, CURRENT_DATE - 14);

  -- ============================================================
  -- ANALYTICS - Taux de recuperation
  -- ============================================================

  INSERT INTO analytics_recuperation (semaine, taux_reel, objectif, annee) VALUES
    ('S1', 78, 80, 2026),
    ('S2', 80, 80, 2026),
    ('S3', 82, 80, 2026),
    ('S4', 79, 80, 2026),
    ('S5', 83, 82, 2026),
    ('S6', 85, 82, 2026),
    ('S7', 81, 82, 2026),
    ('S8', 84, 82, 2026),
    ('S9', 86, 84, 2026),
    ('S10', 83, 84, 2026),
    ('S11', 87, 84, 2026),
    ('S12', 85, 84, 2026),
    ('S13', 88, 85, 2026),
    ('S14', 86, 85, 2026),
    ('S15', 89, 85, 2026),
    ('S16', 87, 85, 2026),
    ('S17', 90, 86, 2026),
    ('S18', 88, 86, 2026);

  -- ============================================================
  -- ANALYTICS - Systemes de sante
  -- ============================================================

  INSERT INTO analytics_systemes (systeme, score, date) VALUES
    ('Cardiovasculaire', 87, CURRENT_DATE),
    ('Endocrinien', 72, CURRENT_DATE),
    ('Respiratoire', 91, CURRENT_DATE),
    ('Digestif', 85, CURRENT_DATE),
    ('Neurologique', 78, CURRENT_DATE),
    ('Musculo-squelettique', 82, CURRENT_DATE),
    ('Renal', 68, CURRENT_DATE),
    ('Hematologique', 75, CURRENT_DATE);

  -- ============================================================
  -- ACTIVITY LOG
  -- ============================================================

  INSERT INTO activity_log (user_id, user_type, user_name, user_initials, action, entity_type, entity_name, created_at) VALUES
    (admin_id, 'medic', 'Dr. MediCare', 'MC', 'Consultation terminee', 'consultation', 'Amadou Diallo - HTA', NOW() - interval '2 hours'),
    (admin_id, 'medic', 'Dr. MediCare', 'MC', 'Ordonnance emise', 'patient', 'Moussa Traore', NOW() - interval '3 hours'),
    (admin_id, 'medic', 'Dr. MediCare', 'MC', 'Rendez-vous cree', 'appointment', 'Fatou Kone - Suivi grossesse', NOW() - interval '4 hours'),
    (admin_id, 'medic', 'Dr. MediCare', 'MC', 'Resultats analyses recus', 'patient', 'Ibrahim Coulibaly', NOW() - interval '5 hours'),
    (admin_id, 'medic', 'Dr. MediCare', 'MC', 'Patient enregistre', 'patient', 'Hawa Kaba', NOW() - interval '6 hours'),
    (admin_id, 'medic', 'Dr. MediCare', 'MC', 'Consultation IA terminee', 'consultation', 'Sekou Camara - Crise drepanocytaire', NOW() - interval '1 day'),
    (admin_id, 'medic', 'Dr. MediCare', 'MC', 'Rendez-vous annule', 'appointment', 'Mariam Ouattara - Controle thyroide', NOW() - interval '1 day'),
    (admin_id, 'medic', 'Dr. MediCare', 'MC', 'Bilan prescrit', 'patient', 'Youssouf Konate - Bilan renal', NOW() - interval '2 days');

  -- ============================================================
  -- ANALYTICS ALERTS
  -- ============================================================

  INSERT INTO analytics_alerts (alert_type, severity, title, description, threshold_value, current_value, is_acknowledged) VALUES
    ('risk_score', 'critical', 'Patient a risque critique', 'Ibrahim Coulibaly - Score de risque 95/100. Insuffisance cardiaque decompensee.', 80, 95, false),
    ('risk_score', 'high', 'Patient a risque eleve', 'Moussa Traore - Score de risque 91/100. Complications diabetiques multiples.', 80, 91, false),
    ('missed_appointment', 'medium', 'Rendez-vous manque', 'Bakary Keita n''a pas honore son rendez-vous du controle endoscopie.', 0, 1, false),
    ('lab_results', 'high', 'Resultats anormaux', 'Youssouf Konate - Creatinine en hausse significative. Revoir traitement.', 120, 185, false);

END $$;

SELECT 'Demo data seeded successfully' AS status;
