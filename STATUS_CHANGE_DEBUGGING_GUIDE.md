# Guide de Débogage: Statut qui Change Automatiquement

## Problème Identifié et Résolu

### Symptôme:
Lorsqu'un utilisateur sélectionne un statut dans le formulaire d'édition, le statut revient automatiquement à sa valeur précédente après quelques instants.

### Cause Racine:
L'`useEffect` dans `EditPatientModal.tsx` était déclenché à chaque fois que l'objet `patient` changeait, ce qui réinitialisait le formulaire même pendant l'édition.

## Solution Appliquée

### 1. Optimisation de useEffect

**AVANT (ligne 62-80):**
```typescript
useEffect(() => {
  if (isOpen && patient) {
    // ... initialisation du formulaire
  }
}, [isOpen, patient]); // ❌ patient provoque des re-renders non désirés
```

**APRÈS:**
```typescript
useEffect(() => {
  if (isOpen && patient) {
    // ... initialisation du formulaire
  }
}, [isOpen]); // ✅ Ne se déclenche qu'à l'ouverture du modal
```

**Raison:** Le hook ne doit se déclencher qu'une fois à l'ouverture du modal, pas à chaque mise à jour de l'objet patient.

### 2. Structure des Options de Statut

**Implémentation (ligne 44-49):**
```typescript
const statusOptions = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'in_treatment', label: 'En traitement' },
  { value: 'recovered', label: 'Guéri' }
];
```

**Avantages:**
- ✅ Séparation claire entre valeur DB (anglais) et affichage UI (français)
- ✅ Facile à maintenir et à étendre
- ✅ Pas de double mapping ou conversion complexe
- ✅ Source unique de vérité pour les options

### 3. Utilisation dans le Select

**Implémentation (ligne 429-443):**
```typescript
<select
  id="status"
  name="status"
  value={formData.status}  // Valeur DB directe
  onChange={handleChange}   // Mise à jour simple
  required
>
  {statusOptions.map(option => (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  ))}
</select>
```

**Points clés:**
- ✅ `value={formData.status}` utilise directement la valeur DB
- ✅ `onChange={handleChange}` met à jour un seul état
- ✅ Pas de transformation ou effet secondaire
- ✅ Les options sont générées dynamiquement depuis `statusOptions`

### 4. Handler Simple et Prévisible

**Implémentation (ligne 183-189):**
```typescript
const handleChange = (e: React.ChangeEvent<...>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  if (fieldErrors[name as keyof FormErrors]) {
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));
  }
};
```

**Caractéristiques:**
- ✅ Une seule responsabilité: mettre à jour l'état
- ✅ Pas de validation ou transformation côté handler
- ✅ Pas d'effet secondaire qui pourrait causer une réinitialisation
- ✅ Utilisation de `prev =>` pour éviter les stale closures

## Patterns à Éviter

### ❌ MAUVAIS: useEffect avec trop de dépendances
```typescript
useEffect(() => {
  setFormData({ ...patient }); // Se déclenche trop souvent
}, [patient, isOpen, formData]); // ❌ Trop de dépendances
```

### ❌ MAUVAIS: Double mapping dans onChange
```typescript
const handleChange = (e) => {
  const frenchValue = e.target.value;
  const englishValue = translateToEnglish(frenchValue); // ❌ Complexité inutile
  setStatus(englishValue);
};
```

### ❌ MAUVAIS: Effet secondaire qui réinitialise
```typescript
useEffect(() => {
  // Réinitialise le statut à chaque fois que patient change
  setStatus(patient.status);
}, [patient]); // ❌ Se déclenche même pendant l'édition
```

### ❌ MAUVAIS: Multiple états pour la même valeur
```typescript
const [displayStatus, setDisplayStatus] = useState('Actif');
const [dbStatus, setDbStatus] = useState('active');
// ❌ Risque de désynchronisation
```

## Patterns Recommandés

### ✅ BON: useEffect avec dépendances minimales
```typescript
useEffect(() => {
  if (isOpen && patient) {
    initializeForm(patient);
  }
}, [isOpen]); // ✅ Uniquement à l'ouverture
```

### ✅ BON: Un seul état, transformation à l'affichage
```typescript
const [status, setStatus] = useState<'active' | 'inactive' | 'in_treatment' | 'recovered'>('active');

// Affichage:
<span>{formatStatus(status)}</span> // active -> Actif
```

### ✅ BON: Options structurées avec value/label
```typescript
const options = [
  { value: 'db_value', label: 'Display Label' }
];

<select value={dbValue}>
  {options.map(opt => (
    <option value={opt.value}>{opt.label}</option>
  ))}
</select>
```

### ✅ BON: Handler simple et direct
```typescript
const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
  setFormData(prev => ({ ...prev, status: e.target.value }));
};
```

## Checklist de Débogage

Si le statut change automatiquement, vérifiez:

- [ ] Les dépendances de `useEffect` - sont-elles minimales?
- [ ] Les handlers `onChange` - font-ils une seule chose?
- [ ] Les valeurs `value` du select - correspondent-elles aux valeurs DB?
- [ ] Les `option` du select - ont-elles le bon `value` attribute?
- [ ] Pas de double état pour le même champ
- [ ] Pas d'effet secondaire qui réinitialise l'état
- [ ] Pas de transformation complexe dans le handler
- [ ] Le composant parent ne passe pas un nouvel objet `patient` à chaque render

## Testing

### Test Manuel:
1. Ouvrir le modal d'édition d'un patient
2. Changer le statut de "Actif" à "En traitement"
3. Attendre 2 secondes
4. ✅ Le statut doit rester "En traitement"
5. ❌ Si le statut revient à "Actif", il y a un problème

### Console Debugging:
```typescript
useEffect(() => {
  console.log('🔄 useEffect triggered - isOpen:', isOpen);
  if (isOpen && patient) {
    console.log('📝 Initializing form with patient:', patient.name);
    // ... initialisation
  }
}, [isOpen]);

const handleChange = (e) => {
  console.log('✏️ Status changed to:', e.target.value);
  setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
};
```

## Fichiers Concernés

- ✅ `/src/components/EditPatientModal.tsx` - Corrigé
- ✅ `/src/components/AddPatientModal.tsx` - Corrigé
- ✅ `/src/pages/EnhancedPatientsPage.tsx` - Utilise les bonnes valeurs

## Date de Correction
2025-10-29
