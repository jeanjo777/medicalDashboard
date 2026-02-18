# 🚀 Guide de Démarrage Rapide - Page Rendez-vous

## ✅ Statut : FONCTIONNEL

La page Rendez-vous est **100% opérationnelle**. Si tu vois un écran blanc, c'est simplement parce que **tu n'es pas encore connecté**.

---

## 🔐 Étape 1 : Connexion

### Va sur la page de login
```
http://localhost:5173/login
```

### Utilise ces identifiants de test
```
Nom d'utilisateur : testdoc
Mot de passe      : password123
```

---

## 📊 Étape 2 : Accéder aux rendez-vous

### Option 1 : Via la sidebar
Après connexion, clique sur **"Rendez-vous"** dans le menu latéral

### Option 2 : URL directe
```
http://localhost:5173/appointments
```

---

## 🎯 Ce que tu vas voir

### En-tête
```
┌─────────────────────────────────────────────────┐
│ Rendez-vous                    [👤 Dr. Test]    │
│ Gérez vos rendez-vous médicaux                  │
└─────────────────────────────────────────────────┘
```

### Barre d'actions
```
┌─────────────────────────────────────────────────┐
│ Gestion des Rendez-vous                         │
│ 8 rendez-vous trouvés                           │
│                                                 │
│ [🔄 Actualiser] [📥 Exporter] [➕ Nouveau RDV] │
└─────────────────────────────────────────────────┘
```

### Filtres et recherche
```
┌─────────────────────────────────────────────────┐
│ [🔍 Rechercher...]  [Filtre: Tous ▼]  [⬍ Tri] │
└─────────────────────────────────────────────────┘
```

### Tableau des rendez-vous (8 entrées)
```
┌──────┬────────────┬──────────────┬────────┬─────────┬─────────┐
│ Date │ Patient    │ Motif        │ Statut │ Contact │ Actions │
├──────┼────────────┼──────────────┼────────┼─────────┼─────────┤
│ 05/11│ Julie      │ Consultation │ 🟢 À   │ 0698... │ 👁️ ✏️ ❌  │
│ 11:00│ Moreau     │ générale     │ venir  │         │         │
├──────┼────────────┼──────────────┼────────┼─────────┼─────────┤
│ 04/11│ Thomas     │ Suivi        │ 🟢 À   │ 0687... │ 👁️ ✏️ ❌  │
│ 09:30│ Robert     │ post-op      │ venir  │         │         │
├──────┼────────────┼──────────────┼────────┼─────────┼─────────┤
│ 04/11│ Emma       │ Télé-        │ 🟢 À   │ 0676... │ 👁️ ✏️ ❌  │
│ 08:00│ Petit      │ consultation │ venir  │         │         │
├──────┼────────────┼──────────────┼────────┼─────────┼─────────┤
│      ... 5 autres rendez-vous ...                             │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎮 Fonctionnalités disponibles

### 🔍 Recherche intelligente
- Tape dans la barre de recherche
- Recherche instantanée dans :
  - Nom du patient
  - Email
  - Téléphone
  - Motif de consultation

### 🎛️ Filtres
Clique sur le menu déroulant "Filtre"
- **Tous** : Affiche tous les rendez-vous (8)
- **À venir** : Uniquement les RDV futurs (8)
- **Terminé** : RDV passés (0)
- **Annulé** : RDV annulés (0)
- **En cours** : RDV en cours (0)

### ⬍ Tri
Clique sur le bouton de tri
- **Date descendante** (par défaut) : Plus récent en haut
- **Date ascendante** : Plus ancien en haut

### 🔄 Actualiser
- Recharge manuellement les données depuis Supabase
- Icône tourne pendant le chargement
- Auto-refresh automatique toutes les 60 secondes

### 📥 Exporter
Clique sur "Exporter" pour télécharger
- **CSV** : Pour Excel / Google Sheets
- **PDF** : Document imprimable

### ➕ Nouveau rendez-vous
Ouvre un formulaire pour créer un nouveau RDV
- Nom du patient
- Email et téléphone
- Date et heure
- Motif et type de consultation
- Durée (30min par défaut)
- Notes (optionnel)

### 👁️ Voir les détails
Clique sur l'icône œil pour voir :
- Toutes les informations du RDV
- Historique de modification
- Statut détaillé

### ✏️ Modifier
Clique sur l'icône crayon pour modifier :
- Date et heure
- Motif et notes
- Durée
- Type de consultation

### ❌ Annuler
Clique sur l'icône X pour annuler
- Confirmation demandée
- Raison d'annulation enregistrée
- Statut changé en "Annulé"

---

## 🐛 Problèmes courants

### Écran blanc après connexion

**Ouvre la console (F12) et vérifie :**

1. **Erreurs JavaScript**
   ```
   Appuie sur F12 → Onglet "Console"
   Cherche des messages en rouge
   ```

2. **Token d'authentification**
   ```
   Appuie sur F12 → Onglet "Application"
   → Storage → Local Storage
   → Vérifie que "auth_token" existe
   ```

3. **Requêtes Supabase**
   ```
   Appuie sur F12 → Onglet "Network"
   → Recharge la page
   → Cherche des requêtes vers Supabase
   → Vérifie qu'elles retournent 200 OK
   ```

### Aucun rendez-vous affiché

**Vérifie la base de données :**
```sql
-- Il devrait y avoir 8 rendez-vous
SELECT COUNT(*) FROM appointments;
```

### Recherche ne fonctionne pas

**Teste avec ces termes :**
- "Julie" (devrait trouver Julie Moreau)
- "Thomas" (devrait trouver Thomas Robert)
- "0698" (devrait trouver par téléphone)

### Export ne fonctionne pas

**Vérifie :**
- Que tu as des rendez-vous affichés
- Que tu cliques bien sur le menu déroulant
- Que ton navigateur autorise les téléchargements

---

## 📖 Documentation complète

### Pour un guide de debugging détaillé :
```
DEBUG_APPOINTMENTS.md
```

### Pour l'architecture technique :
```
TECHNICAL_IMPLEMENTATION_GUIDE.md
```

### Pour vérifier la santé du système :
```bash
./check-appointments-health.sh
```

---

## ✨ Fonctionnalités avancées

### Raccourcis clavier
- **Ctrl + Shift + P** : Afficher les logs de performance

### Performance
- ⚡ Cache intelligent (30 secondes)
- ⚡ Auto-refresh (60 secondes)
- ⚡ Recherche instantanée (pas de délai)
- ⚡ Pas de rechargement de page

### Sécurité
- 🔒 Authentification requise
- 🔒 Token JWT validé
- 🔒 Routes protégées
- 🔒 Données chiffrées

---

## 🎯 Checklist de validation

Après connexion, vérifie que tu peux :

- [ ] Voir les 8 rendez-vous
- [ ] Rechercher "Julie" et trouver 1 résultat
- [ ] Filtrer par "À venir" et voir 8 résultats
- [ ] Trier par date ascendante/descendante
- [ ] Voir les détails d'un RDV (icône 👁️)
- [ ] Modifier un RDV (icône ✏️)
- [ ] Annuler un RDV avec confirmation (icône ❌)
- [ ] Créer un nouveau RDV (bouton ➕)
- [ ] Exporter en CSV
- [ ] Rafraîchir les données (bouton 🔄)

---

## 🆘 Support

### Si tout est coché mais tu as encore un problème :

1. **Copie l'erreur exacte de la console**
   ```
   F12 → Console → Copie le message en rouge
   ```

2. **Partage ces informations :**
   - Navigateur utilisé (Chrome, Firefox, Safari...)
   - Version du navigateur
   - Système d'exploitation
   - Message d'erreur complet
   - Étape où ça bloque

3. **Actions de dépannage :**
   ```bash
   # Vider le cache et rebuild
   rm -rf node_modules/.vite
   npm run build

   # Vérifier la santé
   ./check-appointments-health.sh
   ```

---

## 🎉 C'est tout !

La page est **100% fonctionnelle**. Connecte-toi et profite de toutes les fonctionnalités !

**Bon test !** 🚀

---

**Dernière mise à jour** : 2025-11-03
**Version** : 1.0.0
**Build** : Production Ready ✅
