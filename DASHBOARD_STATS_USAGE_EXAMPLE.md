# 📊 DashboardStatsCards - Exemples d'Utilisation

## 🚀 INTÉGRATION RAPIDE

### **Exemple 1: Usage Simple**

```tsx
import React from 'react';
import DashboardStatsCards from '../components/DashboardStatsCards';

function SimpleDashboard() {
  return (
    <div className="min-h-screen bg-[#0f172a] p-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        Tableau de Bord
      </h1>

      <DashboardStatsCards />
    </div>
  );
}

export default SimpleDashboard;
```

---

### **Exemple 2: Avec Sidebar**

```tsx
import React, { useState } from 'react';
import MedicalSidebarRefined from '../components/MedicalSidebarRefined';
import DashboardStatsCards from '../components/DashboardStatsCards';

function DashboardWithSidebar() {
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <MedicalSidebarRefined
        activeItem={activeSection}
        onItemClick={setActiveSection}
      />

      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Tableau de Bord Médical
          </h1>
          <p className="text-gray-400 mt-2">
            Vue d'ensemble de votre cabinet
          </p>
        </header>

        <DashboardStatsCards />

        {/* Autres sections du dashboard */}
      </main>
    </div>
  );
}

export default DashboardWithSidebar;
```

---

### **Exemple 3: Dashboard Complet avec Header**

```tsx
import React, { useState } from 'react';
import MedicalSidebarRefined from '../components/MedicalSidebarRefined';
import DashboardStatsCards from '../components/DashboardStatsCards';
import { Search, Bell, User } from 'lucide-react';

function CompleteDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <MedicalSidebarRefined
        activeItem={activeSection}
        onItemClick={setActiveSection}
      />

      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-[#1e293b] border-b border-[#334155] px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Dashboard Overview
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Bienvenue, Dr. Admin
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Rechercher des patients..."
                  className="w-80 pl-10 pr-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Notification */}
              <button className="relative p-2.5 hover:bg-[#334155] rounded-lg transition-colors">
                <Bell size={22} className="text-gray-400" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* User Avatar */}
              <div className="flex items-center gap-3 px-4 py-2 bg-[#0f172a] rounded-lg border border-[#334155]">
                <User size={20} className="text-gray-400" />
                <span className="text-sm font-medium text-white">DA</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Stats Cards Section */}
          <section className="mb-8">
            <DashboardStatsCards />
          </section>

          {/* Other Dashboard Sections */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add your other components here */}
            <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
              <h3 className="text-lg font-semibold text-white mb-4">
                Recent Activity
              </h3>
              {/* Content */}
            </div>

            <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155]">
              <h3 className="text-lg font-semibold text-white mb-4">
                Upcoming Appointments
              </h3>
              {/* Content */}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default CompleteDashboard;
```

---

### **Exemple 4: Avec Tabs et Multiple Views**

```tsx
import React, { useState } from 'react';
import MedicalSidebarRefined from '../components/MedicalSidebarRefined';
import DashboardStatsCards from '../components/DashboardStatsCards';

function DashboardWithTabs() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'patients', label: 'Patients' },
    { id: 'appointments', label: 'Rendez-vous' },
    { id: 'reports', label: 'Rapports' }
  ];

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <MedicalSidebarRefined
        activeItem={activeSection}
        onItemClick={setActiveSection}
      />

      <main className="flex-1 p-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 border-b border-[#334155]">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-6 py-3 text-sm font-medium transition-colors
                  border-b-2 -mb-px
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-400 hover:text-white'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <DashboardStatsCards />

            {/* Other overview content */}
          </div>
        )}

        {activeTab === 'patients' && (
          <div>
            {/* Patients content */}
            <h2 className="text-2xl font-bold text-white mb-4">
              Gestion des Patients
            </h2>
          </div>
        )}

        {/* Other tabs... */}
      </main>
    </div>
  );
}

export default DashboardWithTabs;
```

---

### **Exemple 5: Avec Refresh Button**

```tsx
import React, { useState, useRef } from 'react';
import DashboardStatsCards from '../components/DashboardStatsCards';
import { RefreshCw } from 'lucide-react';

function DashboardWithRefresh() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);

    // Reset refreshing state after animation
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Tableau de Bord
          </h1>
          <p className="text-gray-400 mt-2">
            Statistiques en temps réel
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`
            flex items-center gap-2 px-4 py-2 bg-blue-600
            hover:bg-blue-700 text-white rounded-lg
            transition-all duration-300 disabled:opacity-50
          `}
        >
          <RefreshCw
            size={18}
            className={isRefreshing ? 'animate-spin' : ''}
          />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Key prop forces re-render and re-fetch */}
      <DashboardStatsCards key={refreshKey} />
    </div>
  );
}

export default DashboardWithRefresh;
```

---

### **Exemple 6: Avec Section Title et Description**

```tsx
import React from 'react';
import DashboardStatsCards from '../components/DashboardStatsCards';
import { BarChart3 } from 'lucide-react';

function DashboardWithSection() {
  return (
    <div className="min-h-screen bg-[#0f172a] p-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        Dashboard Médical
      </h1>

      {/* Stats Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center">
            <BarChart3 size={22} className="text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              Statistiques Clés
            </h2>
            <p className="text-sm text-gray-400">
              Vue d'ensemble de votre activité médicale
            </p>
          </div>
        </div>

        <DashboardStatsCards />
      </section>

      {/* Other sections */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">
          Activité Récente
        </h2>
        {/* Content */}
      </section>
    </div>
  );
}

export default DashboardWithSection;
```

---

### **Exemple 7: Intégration dans ModernDashboardPage**

```tsx
// Ajouter cet import en haut de ModernDashboardPage.tsx
import DashboardStatsCards from '../components/DashboardStatsCards';

// Puis remplacer la section des StatCards existante par:

<main className="flex-1 p-8 overflow-y-auto">
  {/* Stats Cards - NEW COMPONENT */}
  <section className="mb-8">
    <DashboardStatsCards />
  </section>

  {/* Charts Section */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <PatientGrowthChart />
    <AppointmentDistributionChart />
  </div>

  {/* Activity Section */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <RecentActivity />
    <UpcomingAppointments />
  </div>
</main>
```

---

## 🎨 PERSONNALISATION

### **Changer les Couleurs**

Modifier dans `DashboardStatsCards.tsx`:

```tsx
const getColorClasses = (color: string) => {
  const colors = {
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-500',
      border: 'border-blue-500/20',
      line: '#3b82f6'
    },
    // Ajouter vos propres couleurs ici
    cyan: {
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-500',
      border: 'border-cyan-500/20',
      line: '#06b6d4'
    }
  };
  return colors[color] || colors.blue;
};
```

---

### **Ajouter Plus de Cartes**

```tsx
// Dans fetchStats(), ajouter:
{
  id: 'satisfaction-rate',
  title: 'Taux de Satisfaction',
  value: '94%',
  change: 2.1,
  icon: <Star size={24} strokeWidth={2} />,
  color: 'yellow',
  sparklineData: [88, 89, 91, 92, 93, 93, 94]
}
```

Puis mettre à jour la grille:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
```

---

## 🔧 TIPS & TRICKS

### **1. Auto-Refresh toutes les 5 minutes**

```tsx
useEffect(() => {
  const interval = setInterval(() => {
    fetchStats();
  }, 5 * 60 * 1000); // 5 minutes

  return () => clearInterval(interval);
}, []);
```

### **2. Ajouter un Loader Individuel**

```tsx
const [loadingCard, setLoadingCard] = useState<string | null>(null);

const refreshCard = async (cardId: string) => {
  setLoadingCard(cardId);
  await fetchStats();
  setLoadingCard(null);
};
```

### **3. Ajouter Click Event**

```tsx
<div
  onClick={() => {
    console.log('Card clicked:', stat.id);
    // Navigate to detailed view
    navigate(`/stats/${stat.id}`);
  }}
  className="..."
>
```

---

## 📊 RÉSULTAT VISUEL

```
┌──────────────────────────────────────────────────────────────┐
│                     TABLEAU DE BORD                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────┐│
│  │ 👥          │ │ 📅          │ │ ⚡          │ │ 📈     ││
│  │ Patients    │ │ RDV Auj.    │ │ Traitement  │ │ Évol.  ││
│  │ 502         │ │ 18          │ │ 72%         │ │ 63     ││
│  │             │ │             │ │             │ │        ││
│  │ ↗ 12.5%     │ │ ↗ 8.3%      │ │ ↗ 5.7%      │ │ ↘ -3.2%││
│  │ ▁▃▅▇█       │ │ ▃▅▆▇▆       │ │ ▅▆▇▇▇       │ │ ▅▆▇█▇  ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────┘│
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST D'INTÉGRATION

- [ ] Importer `DashboardStatsCards`
- [ ] Ajouter dans votre page dashboard
- [ ] Vérifier que Supabase est configuré (`.env`)
- [ ] Tester en mode développement
- [ ] Vérifier le responsive (mobile/tablet/desktop)
- [ ] Tester le chargement des données
- [ ] Vérifier les sparklines
- [ ] Valider les calculs de pourcentage
- [ ] Tester le fallback (mock data)
- [ ] Build en production

---

## 🚀 DÉMARRAGE RAPIDE

```bash
# 1. Créer une nouvelle page ou modifier existante
touch src/pages/NewDashboard.tsx

# 2. Copier l'Exemple 3 (Dashboard Complet)

# 3. Ajouter la route dans main.tsx
<Route path="/new-dashboard" element={<NewDashboard />} />

# 4. Démarrer le serveur
npm run dev

# 5. Naviguer vers la page
http://localhost:5173/new-dashboard
```

---

**Tous ces exemples sont prêts à l'emploi! Choisissez celui qui correspond le mieux à votre besoin et commencez à l'utiliser.** 📊✨
