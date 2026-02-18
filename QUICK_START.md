# 🚀 Quick Start Guide - Medical AI Project

**Version 5.2.0** | Dernière mise à jour: 13 Janvier 2026

---

## ⚡ Installation Rapide

### 1. Prérequis

- Node.js >= 20.x
- npm >= 10.x
- Git

### 2. Configuration

```bash
# 1. Cloner le projet (si applicable)
git clone <repository-url>
cd project

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase

# 4. Lancer le serveur de développement
npm run dev
```

Le site sera accessible sur **http://localhost:5173**

---

## 📋 Commandes Principales

### Développement

```bash
# Lancer le serveur de dev avec hot-reload
npm run dev

# Linter le code
npm run lint

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

### Utilitaires

```bash
# Remplacer les console.log (dry-run)
npm run replace-logs:dry

# Remplacer les console.log (réel)
npm run replace-logs
```

---

## 🔧 Configuration de l'Environnement

### Fichier `.env`

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**⚠️ Important:** Ne committez JAMAIS le fichier `.env` !

---

## 📝 Utilisation du Logger

### Remplacer console.log

**❌ Ancien code:**
```typescript
console.log('User data:', user);
console.error('Failed to fetch:', error);
```

**✅ Nouveau code:**
```typescript
import logger from './utils/logger';

logger.info('User data loaded', { userId: user.id });
logger.error('Failed to fetch patients', error, { endpoint: '/api/patients' });
```

### Niveaux de Log

```typescript
// Debug - Seulement en développement
logger.debug('Variable value', { value: data });

// Info - Seulement en développement
logger.info('Operation successful', { duration: '200ms' });

// Warning - Toujours logué
logger.warn('Approaching rate limit', { remaining: 10 });

// Error - Toujours logué + monitoring
logger.error('Database query failed', error, { query: 'SELECT *' });
```

### Fonctionnalités Avancées

```typescript
// Grouper des logs
logger.group('Data Processing', () => {
  logger.info('Step 1');
  logger.info('Step 2');
});

// Logger un tableau
logger.table(patients);

// Mesurer une performance
logger.time('database-query');
// ... code ...
logger.timeEnd('database-query');
```

---

## 🎯 Optimisation des Composants

### Debounce pour les Recherches

```typescript
import { useDebounce } from './utils/componentOptimizations';

const [searchQuery, setSearchQuery] = useState('');
const debouncedQuery = useDebounce(searchQuery, 300);

useEffect(() => {
  searchPatients(debouncedQuery);
}, [debouncedQuery]);
```

### Optimiser un Composant Lourd

```typescript
import { optimizeComponent } from './utils/componentOptimizations';

const PatientCard = ({ patient }) => {
  // Component logic
};

// Compare uniquement patient.id
export default optimizeComponent(PatientCard, ['patient.id']);
```

### Listes Virtualisées

Pour les listes de plus de 100 items:

```typescript
import { useVirtualList } from './utils/componentOptimizations';

const { visibleItems, totalHeight, offsetY } = useVirtualList(
  items,
  80,      // hauteur d'un item
  800,     // hauteur du container
  scrollTop
);
```

---

## 🚦 CI/CD avec GitHub Actions

### Workflows Automatiques

#### Sur chaque Push/PR

- ✅ Lint et type check
- ✅ Build de production
- ✅ Audit de sécurité
- ✅ Analyse du bundle

#### Sur Pull Request

- ✅ Vérification du code quality
- ✅ Détection des console.log
- ✅ Build preview
- ✅ Analyse des fichiers modifiés

#### Sur Push vers Main

- ✅ Déploiement automatique
- ✅ Tests de performance (Lighthouse)

### Configuration des Secrets

Dans GitHub Settings → Secrets and variables → Actions:

```
VITE_SUPABASE_URL           - URL de votre projet Supabase
VITE_SUPABASE_ANON_KEY      - Clé anonyme Supabase
VERCEL_TOKEN                - Token Vercel (optionnel)
VERCEL_ORG_ID               - Org ID Vercel (optionnel)
VERCEL_PROJECT_ID           - Project ID Vercel (optionnel)
```

---

## 🐛 Debugging

### Compter les Renders d'un Composant

```typescript
import { useRenderCount } from './utils/componentOptimizations';

const MyComponent = () => {
  useRenderCount('MyComponent'); // Log en dev uniquement
  // ...
};
```

### Trouver les Causes de Re-render

```typescript
import { useWhyDidYouUpdate } from './utils/componentOptimizations';

const MyComponent = (props) => {
  useWhyDidYouUpdate('MyComponent', props);
  // Affiche quelles props ont changé
  // ...
};
```

### Voir les Logs en Production

```typescript
// Dans la console du navigateur
const logs = logger.getStoredLogs();
console.table(logs);

// Nettoyer les logs
logger.clearStoredLogs();
```

---

## 📦 Structure du Projet

```
project/
├── .github/
│   └── workflows/          # CI/CD pipelines
│       ├── ci.yml          # Pipeline principale
│       ├── pr-checks.yml   # Vérifications PR
│       └── performance.yml # Tests de performance
├── scripts/
│   └── replace-console-logs.cjs  # Script de migration
├── src/
│   ├── components/         # Composants React
│   ├── pages/             # Pages de l'application
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utilitaires
│   │   ├── logger.ts      # 🆕 Logger professionnel
│   │   └── componentOptimizations.tsx  # 🆕 Outils d'optimisation
│   ├── lib/               # Bibliothèques (Supabase)
│   └── contexts/          # Contexts React
├── .env                   # ⚠️ Ne pas committer !
├── .env.example          # Template d'environnement
├── IMPROVEMENTS.md       # 🆕 Guide des améliorations
├── CHANGELOG.md          # 🆕 Historique des changements
└── QUICK_START.md        # 🆕 Ce fichier
```

---

## 🔥 Commandes Fréquentes

```bash
# Développement quotidien
npm run dev                    # Lancer le dev server

# Avant de committer
npm run lint                   # Vérifier le code
npm run build                  # Tester le build

# Migration des logs
npm run replace-logs:dry       # Prévisualiser
npm run replace-logs           # Appliquer

# Déploiement
git push origin main           # Déclenche le CI/CD
```

---

## ❓ FAQ

### Q: Le build échoue avec des erreurs TypeScript

**R:** Vérifiez que toutes les dépendances sont installées:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Q: Les logs n'apparaissent pas en production

**R:** C'est normal ! Les logs debug/info sont désactivés en production. Seuls les warnings et errors sont loggés.

### Q: Comment voir les erreurs en production?

**R:** Utilisez la console du navigateur:
```javascript
const logs = logger.getStoredLogs();
console.table(logs);
```

### Q: Le CI/CD ne se déclenche pas

**R:** Vérifiez que:
1. Les workflows sont dans `.github/workflows/`
2. Vous avez push sur `main` ou `develop`
3. Les secrets GitHub sont configurés

### Q: Comment optimiser un composant qui re-render trop?

**R:** Utilisez les outils de debug:
```typescript
import { useWhyDidYouUpdate, useRenderCount } from './utils/componentOptimizations';

const MyComponent = (props) => {
  useRenderCount('MyComponent');
  useWhyDidYouUpdate('MyComponent', props);
  // ...
};
```

---

## 📚 Documentation Complète

- [Guide des Améliorations](IMPROVEMENTS.md) - Détails techniques
- [Changelog](CHANGELOG.md) - Historique des versions
- [Logger Documentation](src/utils/logger.ts) - API du logger
- [Component Optimizations](src/utils/componentOptimizations.tsx) - API d'optimisation

---

## 🆘 Support

En cas de problème:

1. Vérifier la documentation dans les fichiers
2. Consulter les logs avec `logger.getStoredLogs()`
3. Vérifier les workflows GitHub Actions
4. Lire les commentaires inline dans le code

---

## ✅ Checklist Nouveau Développeur

- [ ] Cloner le repository
- [ ] Installer Node.js >= 20
- [ ] `npm install`
- [ ] Créer `.env` depuis `.env.example`
- [ ] Remplir les clés Supabase
- [ ] `npm run dev`
- [ ] Lire [IMPROVEMENTS.md](IMPROVEMENTS.md)
- [ ] Remplacer tous les `console.log` par `logger`
- [ ] Comprendre les workflows CI/CD
- [ ] Tester le build: `npm run build`

---

**Bienvenue dans le projet Medical AI!** 🎉

Pour toute question, consultez la documentation ou les commentaires dans le code.

**Version**: 5.2.0
**Dernière mise à jour**: 13 Janvier 2026
