# Guide de Test - Correction "NaN ans"

## 🎯 Objectif
Vérifier que l'âge s'affiche correctement ("30 ans") au lieu de "NaN ans"

---

## ✅ Prérequis

### Connexion requise
```
URL      : http://localhost:5173/login
Username : testdoc
Password : password123
```

### Patient de test
```
Nom              : boni jeanne
Date de naissance: 1995-02-05
Âge attendu      : 30 ans
```

---

## 📋 Tests à effectuer

### Test 1 : Page liste Patients (EnhancedPatientsPage)

**Navigation** : Dashboard → Patients (dans la sidebar)

**Vérifications** :
- [ ] La colonne "Âge" affiche "30 ans" (pas "NaN ans")
- [ ] Si pas de date de naissance : "Non renseigné" (pas "NaN ans")
- [ ] Pas d'erreur JavaScript dans la console (F12)

**Résultat attendu** :
```
┌──────────────┬────────┬────────┐
│ Patient      │ Âge    │ Statut │
├──────────────┼────────┼────────┤
│ boni jeanne  │ 30 ans │ Active │  ✅
└──────────────┴────────┴────────┘
```

---

### Test 2 : Modal Détails Patient

**Navigation** : Page Patients → Cliquer sur un patient

**Vérifications** :
- [ ] Carte "Âge" affiche "30 ans"
- [ ] Format correct avec "ans" après le nombre
- [ ] Si pas de date : "Non renseigné"

**Résultat attendu** :
```
┌─────────────────────┐
│ Âge                 │
│ 30 ans             │  ✅
└─────────────────────┘
```

---

### Test 3 : Statistiques par âge

**Navigation** : Page Patients → Voir graphiques

**Vérifications** :
- [ ] Graphique "Répartition par âge" s'affiche
- [ ] Patient classé dans "19-35 ans"
- [ ] Pas de catégorie "NaN" ou vide

**Résultat attendu** :
```
Répartition par âge :
- 0-18 ans   : 0 patient
- 19-35 ans  : 1 patient  ✅ (boni jeanne)
- 36-50 ans  : 0 patient
- 51-65 ans  : 0 patient
- 66+ ans    : 0 patient
```

---

### Test 4 : Recherche et filtres

**Navigation** : Page Patients → Barre de recherche

**Vérifications** :
- [ ] Recherche "boni" trouve le patient
- [ ] Âge affiché : "30 ans"
- [ ] Filtre par tranche d'âge fonctionne

---

### Test 5 : Export CSV

**Navigation** : Page Patients → Bouton Export → CSV

**Vérifications** :
- [ ] CSV généré avec succès
- [ ] Colonne Âge contient "30" (pas "NaN" ou vide)
- [ ] Format cohérent

**Résultat attendu dans le CSV** :
```csv
Nom,Âge,Email,Téléphone,Statut
boni jeanne,30,boni.jeanne@email.fr,0612345678,active
```

---

### Test 6 : Console navigateur

**Navigation** : F12 → Console

**Vérifications** :
- [ ] Aucune erreur JavaScript
- [ ] Pas de "Cannot read property 'age' of undefined"
- [ ] Pas de "NaN" dans les logs

---

## 🔍 Tests complémentaires (optionnel)

### Test avec patient sans date de naissance

1. Créer un nouveau patient sans renseigner la date de naissance
2. Vérifier affichage "Non renseigné" (pas "NaN ans")

### Test avec date invalide

1. En base, insérer une date invalide (via SQL)
2. Vérifier fallback "Non renseigné"

### Test avec date future

1. Tenter de créer un patient avec date future
2. Vérifier validation ou fallback

---

## ❌ Problèmes possibles

### Si "NaN ans" apparaît encore

**Vérifier** :
1. Build réussi : `npm run build`
2. Cache vidé : Ctrl+Shift+R (ou Cmd+Shift+R)
3. Date de naissance dans la base :
   ```sql
   SELECT name, date_of_birth FROM patients;
   ```

**Solutions** :
```bash
# Vider cache Vite
rm -rf node_modules/.vite

# Rebuild complet
npm run build

# Redémarrer serveur
npm run dev
```

### Si "Non renseigné" alors qu'il y a une date

**Vérifier** :
1. Format date : YYYY-MM-DD
2. Date valide (pas future, pas invalide)
3. Console pour erreurs JS

---

## ✅ Checklist finale

- [ ] Test 1 : Liste patients affiche "30 ans"
- [ ] Test 2 : Modal détails affiche "30 ans"
- [ ] Test 3 : Statistiques par âge correctes
- [ ] Test 4 : Recherche fonctionne
- [ ] Test 5 : Export CSV correct
- [ ] Test 6 : Aucune erreur console

**Si tous les tests passent** : ✅ Correction validée !

---

## 📞 Support

Si un test échoue, vérifie :

1. **Build** : `npm run build` réussi
2. **Cache** : Vidé (Ctrl+Shift+R)
3. **Console** : Erreurs JS (F12)
4. **Base** : Date de naissance existe
5. **Documentation** : `AGE_DISPLAY_FIX.md`

---

**Date** : 2025-11-03
**Version** : 1.0.0
**Statut** : Prêt pour test
