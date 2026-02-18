# Architecture des Formulaires: Gestion du Statut Patient

## Vue d'Ensemble

Cette documentation décrit l'architecture complète de la gestion du statut des patients à travers l'application, garantissant la cohérence entre la base de données, l'interface utilisateur et la logique métier.

## Flux de Données

```
┌─────────────────────────────────────────────────────────────────┐
│                         BASE DE DONNÉES                          │
│                    Contrainte: patients_status_check             │
│  Valeurs autorisées: 'active', 'inactive', 'in_treatment',      │
│                      'recovered'                                 │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     COUCHE APPLICATION                           │
│                   statusOptions (Source unique)                  │
│  [                                                               │
│    { value: 'active', label: 'Actif' },                        │
│    { value: 'inactive', label: 'Inactif' },                    │
│    { value: 'in_treatment', label: 'En traitement' },          │
│    { value: 'recovered', label: 'Guéri' }                      │
│  ]                                                               │
└───────────────────────┬─────────────────────────────────────────┘
                        │
           ┌────────────┼────────────┐
           ▼            ▼            ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │   Add    │  │   Edit   │  │  Display │
    │  Modal   │  │  Modal   │  │  Table   │
    └──────────┘  └──────────┘  └──────────┘
```

## Source Unique de Vérité: statusOptions

### Définition
```typescript
const statusOptions = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'in_treatment', label: 'En traitement' },
  { value: 'recovered', label: 'Guéri' }
];
```

### Localisation
- `/src/components/EditPatientModal.tsx` (ligne 44-49)
- `/src/components/AddPatientModal.tsx` (ligne 52-57)

### Principes
1. **Définition externe**: Défini en dehors du composant pour éviter les recréations
2. **Structure value/label**: Séparation entre valeur DB et affichage UI
3. **Ordre cohérent**: Même ordre partout (active → inactive → in_treatment → recovered)
4. **Réutilisable**: Peut être importé depuis un fichier partagé si nécessaire

## Composants de Formulaire

### 1. AddPatientModal

**Fichier**: `/src/components/AddPatientModal.tsx`

**État initial**:
```typescript
const [formData, setFormData] = useState({
  // ... autres champs
  status: 'active' as 'active' | 'in_treatment' | 'recovered' | 'inactive',
  // ...
});
```

**Select**:
```typescript
<select name="status" value={formData.status} onChange={handleChange}>
  {statusOptions.map(option => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ))}
</select>
```

**Validation**:
```typescript
const allowedStatuses = ['active', 'inactive', 'in_treatment', 'recovered'];
if (!allowedStatuses.includes(formData.status)) {
  // Erreur
}
```

**Soumission**:
```typescript
const { error } = await supabase
  .from('patients')
  .insert({
    // ... autres champs
    status: formData.status, // Valeur directe, pas de transformation
  });
```

### 2. EditPatientModal

**Fichier**: `/src/components/EditPatientModal.tsx`

**Initialisation** (useEffect):
```typescript
useEffect(() => {
  if (isOpen && patient) {
    setFormData({
      // ... autres champs
      status: patient.status || 'active',
      // ...
    });
  }
}, [isOpen]); // ⚠️ Important: seulement isOpen, pas patient
```

**Select**: Identique à AddPatientModal

**Mise à jour**:
```typescript
const { error } = await supabase
  .from('patients')
  .update({
    // ... autres champs
    status: formData.status, // Valeur directe
  })
  .eq('id', patient.id);
```

### 3. EnhancedPatientsPage (Affichage)

**Fichier**: `/src/pages/EnhancedPatientsPage.tsx`

**Type**:
```typescript
interface Patient {
  // ... autres champs
  status: 'active' | 'inactive' | 'in_treatment' | 'recovered';
}
```

**Formatage pour affichage**:
```typescript
const formatStatus = (status: string) => {
  switch (status) {
    case 'active':       return 'Active';
    case 'inactive':     return 'Inactive';
    case 'recovered':    return 'Recovered';
    case 'in_treatment': return 'In Treatment';
    default:             return status;
  }
};
```

**Affichage**:
```typescript
<span>{formatStatus(patient.status)}</span>
```

**Couleurs**:
```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':       return 'bg-emerald-500/10 text-emerald-500';
    case 'inactive':     return 'bg-gray-500/10 text-gray-500';
    case 'recovered':    return 'bg-blue-500/10 text-blue-500';
    case 'in_treatment': return 'bg-orange-500/10 text-orange-500';
    default:             return 'bg-gray-500/10 text-gray-500';
  }
};
```

## Gestion des États

### Pattern Utilisé: Single Source of Truth

```typescript
// ✅ UN SEUL état pour le statut
const [formData, setFormData] = useState({
  status: 'active'
});

// ❌ ÉVITER: Plusieurs états pour la même valeur
const [dbStatus, setDbStatus] = useState('active');
const [displayStatus, setDisplayStatus] = useState('Actif');
```

### Handler onChange Standard

```typescript
const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};
```

**Caractéristiques**:
- Générique (fonctionne pour tous les champs)
- Pas de transformation
- Pas d'effet secondaire
- Utilise la fonction de mise à jour avec `prev =>`

## Validation

### Validation Frontend (avant envoi)

```typescript
const allowedStatuses = ['active', 'inactive', 'in_treatment', 'recovered'];
if (!allowedStatuses.includes(formData.status)) {
  setError(`Statut invalide: "${formData.status}"`);
  return;
}
```

### Validation Backend (Contrainte SQL)

```sql
ALTER TABLE patients
ADD CONSTRAINT patients_status_check
CHECK (status = ANY (ARRAY[
  'active'::text,
  'inactive'::text,
  'in_treatment'::text,
  'recovered'::text
]));
```

### Gestion des Erreurs de Contrainte

```typescript
catch (err: any) {
  if (err.message?.includes('patients_status_check')) {
    errorMessage = 'Statut invalide. Valeurs autorisées: Actif, Inactif, En traitement, Guéri.';
  }
}
```

## Filtres et Recherche

### Filtre de Statut (EnhancedPatientsPage)

```typescript
<select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
  <option value="all">All Statuses</option>
  <option value="active">Active</option>
  <option value="inactive">Inactive</option>
  <option value="in_treatment">In Treatment</option>
  <option value="recovered">Recovered</option>
</select>
```

### Application du Filtre

```typescript
if (filterStatus !== 'all') {
  filtered = filtered.filter(p => p.status === filterStatus);
}
```

## Statistiques

### Calcul des Stats par Statut

```typescript
const stats = useMemo(() => {
  return {
    total: patients.length,
    active: patients.filter(p => p.status === 'active').length,
    inactive: patients.filter(p => p.status === 'inactive').length,
    recovered: patients.filter(p => p.status === 'recovered').length,
    underTreatment: patients.filter(p => p.status === 'in_treatment').length,
  };
}, [patients]);
```

## Mapping Complet

| Base de Données | TypeScript Type | Display FR | Display EN | Badge Color |
|-----------------|----------------|------------|------------|-------------|
| `active` | `'active'` | Actif | Active | Vert (emerald) |
| `inactive` | `'inactive'` | Inactif | Inactive | Gris (gray) |
| `in_treatment` | `'in_treatment'` | En traitement | In Treatment | Orange |
| `recovered` | `'recovered'` | Guéri | Recovered | Bleu (blue) |

## Points d'Attention

### ⚠️ useEffect Dependencies
```typescript
// ✅ BON
useEffect(() => {
  if (isOpen && patient) {
    initializeForm(patient);
  }
}, [isOpen]);

// ❌ MAUVAIS
useEffect(() => {
  if (isOpen && patient) {
    initializeForm(patient);
  }
}, [isOpen, patient]); // Se déclenche trop souvent
```

### ⚠️ Type Safety
```typescript
// ✅ BON
status: 'active' | 'inactive' | 'in_treatment' | 'recovered'

// ❌ MAUVAIS
status: string // Trop permissif
```

### ⚠️ Validation Avant Envoi
```typescript
// ✅ BON
const allowedStatuses = ['active', 'inactive', 'in_treatment', 'recovered'];
if (!allowedStatuses.includes(status)) {
  throw new Error('Invalid status');
}
await supabase.from('patients').insert({ status });

// ❌ MAUVAIS
await supabase.from('patients').insert({ status }); // Pas de validation
```

## Tests Recommandés

### Test 1: Sélection et Persistance
1. Ouvrir le modal d'édition
2. Changer le statut
3. Attendre 3 secondes
4. Vérifier que le statut ne change pas automatiquement

### Test 2: Validation
1. Tenter d'envoyer un statut invalide (ex: "pending")
2. Vérifier qu'une erreur est affichée

### Test 3: Affichage
1. Créer des patients avec différents statuts
2. Vérifier que les badges affichent les bonnes couleurs
3. Vérifier que les labels sont corrects

### Test 4: Filtres
1. Filtrer par statut "In Treatment"
2. Vérifier que seuls les patients avec `status = 'in_treatment'` sont affichés

## Maintenance Future

### Ajout d'un Nouveau Statut

1. **Base de données**: Modifier la contrainte SQL
```sql
ALTER TABLE patients DROP CONSTRAINT patients_status_check;
ALTER TABLE patients ADD CONSTRAINT patients_status_check
CHECK (status = ANY (ARRAY[
  'active'::text,
  'inactive'::text,
  'in_treatment'::text,
  'recovered'::text,
  'pending'::text  -- Nouveau
]));
```

2. **statusOptions**: Ajouter l'option
```typescript
const statusOptions = [
  // ... existants
  { value: 'pending', label: 'En attente' }
];
```

3. **Types**: Mettre à jour le type
```typescript
type PatientStatus = 'active' | 'inactive' | 'in_treatment' | 'recovered' | 'pending';
```

4. **Fonctions utilitaires**: Ajouter les cas
```typescript
case 'pending': return 'En attente';
case 'pending': return 'bg-yellow-500/10 text-yellow-500';
```

5. **Validation**: Ajouter à la liste
```typescript
const allowedStatuses = ['active', 'inactive', 'in_treatment', 'recovered', 'pending'];
```

## Références

- [STATUS_VALUES_REFERENCE.md](./STATUS_VALUES_REFERENCE.md) - Liste des valeurs autorisées
- [STATUS_CHANGE_DEBUGGING_GUIDE.md](./STATUS_CHANGE_DEBUGGING_GUIDE.md) - Guide de débogage
- [ENHANCED_PATIENTS_GUIDE.md](./ENHANCED_PATIENTS_GUIDE.md) - Documentation de la page patients

## Dernière Mise à Jour
2025-10-29
