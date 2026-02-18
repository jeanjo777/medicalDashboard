# Instructions pour configurer Supabase

## Étape 1 : Redémarrer le serveur de développement

Le module `@supabase/supabase-js` a été installé mais le serveur Vite doit être redémarré pour le détecter.

**Action requise :** Arrêtez et redémarrez le serveur de développement (généralement `Ctrl+C` puis relancer).

## Étape 2 : Exécuter la migration SQL

Vous devez créer la table dans votre base de données Supabase.

1. Ouvrez votre tableau de bord Supabase : https://0ec90b57d6e95fcbda19832f.supabase.co
2. Allez dans l'éditeur SQL (SQL Editor dans le menu de gauche)
3. Copiez le contenu du fichier `supabase/migrations/001_create_appointments_table.sql`
4. Collez-le dans l'éditeur SQL et exécutez-le

## Étape 3 : Tester le formulaire

Une fois la migration exécutée et le serveur redémarré :

1. Allez sur la page d'accueil
2. Remplissez le formulaire de contact
3. Soumettez-le

Les données seront sauvegardées dans la table `appointment_requests`.

## Étape 4 : Consulter les demandes de rendez-vous

Pour voir toutes les demandes reçues :

1. Ouvrez votre tableau de bord Supabase
2. Allez dans "Table Editor"
3. Sélectionnez la table `appointment_requests`
4. Vous verrez toutes les demandes avec :
   - Prénom et nom
   - Téléphone et email
   - Type de soin demandé
   - Message
   - Date de la demande
   - Statut (nouveau, contacté, confirmé, annulé)

## Étape 5 : Configurer les notifications (optionnel)

Pour recevoir une notification à chaque nouvelle demande :

1. Dans Supabase, allez dans "Database" > "Webhooks"
2. Créez un webhook qui se déclenche sur INSERT dans `appointment_requests`
3. Configurez l'URL de votre webhook n8n : https://autoentreprise.app.n8n.cloud/webhook/5735518c-4123-4a69-b7f9-a1568339f2d5
4. Chaque nouvelle demande déclenchera automatiquement votre webhook

## Structure de la table

```sql
appointment_requests
├── id (uuid) - Identifiant unique
├── prenom (text) - Prénom du patient
├── nom (text) - Nom du patient
├── telephone (text) - Numéro de téléphone
├── email (text) - Adresse email
├── type_de_soin (text) - Type de soin demandé
├── message (text) - Message ou précisions
├── date_demande (text) - Date et heure de la demande
├── source (text) - Source de la demande
├── statut (text) - Statut (nouveau, contacté, confirmé, annulé)
└── created_at (timestamptz) - Date de création
```

## Avantages de cette solution

- ✅ **Fiable** : Les données sont sauvegardées dans une base de données sécurisée
- ✅ **Pas de perte de données** : Même si le webhook échoue, les données sont dans Supabase
- ✅ **Historique complet** : Toutes les demandes sont archivées
- ✅ **Recherche facile** : Vous pouvez rechercher par email, téléphone, statut, etc.
- ✅ **Gestion du statut** : Vous pouvez marquer les demandes comme traitées
