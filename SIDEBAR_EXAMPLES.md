# 🎨 Healthcare Sidebar - Advanced Usage Examples

## Example 1: Basic Implementation

```tsx
import React, { useState } from 'react';
import HealthcareSidebar from './components/HealthcareSidebar';

function App() {
  const [activeSection, setActiveSection] = useState('patients');

  return (
    <div className="flex min-h-screen">
      <HealthcareSidebar
        activeItem={activeSection}
        onItemClick={setActiveSection}
      />
      <main className="flex-1 p-8">
        <h1>Current Section: {activeSection}</h1>
      </main>
    </div>
  );
}
```

---

## Example 2: With React Router

```tsx
import { useNavigate, useLocation } from 'react-router-dom';
import HealthcareSidebar from './components/HealthcareSidebar';

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentSection = () => {
    const path = location.pathname.split('/')[1];
    return path || 'dashboard';
  };

  return (
    <div className="flex min-h-screen">
      <HealthcareSidebar
        activeItem={getCurrentSection()}
        onItemClick={(itemId) => navigate(`/${itemId}`)}
      />
      <main className="flex-1">
        <Outlet /> {/* React Router outlet */}
      </main>
    </div>
  );
}
```

---

## Example 3: With Conditional Rendering

```tsx
function Dashboard() {
  const [activeView, setActiveView] = useState('patients');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'patients':
        return <PatientsList />;
      case 'appointments':
        return <AppointmentsCalendar />;
      case 'records':
        return <MedicalRecords />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <HealthcareSidebar
        activeItem={activeView}
        onItemClick={setActiveView}
      />
      <main className="flex-1 bg-gray-50">
        {renderContent()}
      </main>
    </div>
  );
}
```

---

## Example 4: With User Context

```tsx
import { useAuth } from './contexts/AuthContext';

function AuthenticatedDashboard() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <div className="flex min-h-screen">
      <HealthcareSidebar
        activeItem={activeSection}
        onItemClick={setActiveSection}
      />
      <main className="flex-1">
        <header className="bg-white shadow p-4 flex justify-between">
          <h1 className="text-2xl font-bold">Welcome, Dr. {user.name}</h1>
          <button onClick={logout}>Logout</button>
        </header>
        <div className="p-8">
          {/* Content based on activeSection */}
        </div>
      </main>
    </div>
  );
}
```

---

## Example 5: Mobile Responsive with Hamburger

```tsx
import { Menu, X } from 'lucide-react';

function ResponsiveDashboard() {
  const [activeSection, setActiveSection] = useState('patients');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <HealthcareSidebar
          activeItem={activeSection}
          onItemClick={(item) => {
            setActiveSection(item);
            setSidebarOpen(false); // Close on mobile after selection
          }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-8">
          <h1 className="text-2xl font-bold mb-4 capitalize">
            {activeSection}
          </h1>
          {/* Your content here */}
        </div>
      </main>
    </div>
  );
}
```

---

## Example 6: With Notification Badges

```tsx
import HealthcareSidebar from './components/HealthcareSidebar';
import { Badge } from './components/ui/badge';

// Enhanced version with badges
function EnhancedSidebar() {
  const [activeSection, setActiveSection] = useState('patients');

  // Notification counts
  const notifications = {
    patients: 5,
    appointments: 12,
    records: 3,
  };

  return (
    <div className="flex min-h-screen">
      {/* You would need to modify the component to accept badges */}
      <HealthcareSidebar
        activeItem={activeSection}
        onItemClick={setActiveSection}
      />
      <main className="flex-1">
        {/* Content */}
      </main>
    </div>
  );
}
```

---

## Example 7: With Supabase Integration

```tsx
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import HealthcareSidebar from './components/HealthcareSidebar';

function SupabaseDashboard() {
  const [activeSection, setActiveSection] = useState('patients');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex min-h-screen">
      <HealthcareSidebar
        activeItem={activeSection}
        onItemClick={setActiveSection}
      />
      <main className="flex-1">
        {/* Render content based on activeSection */}
      </main>
    </div>
  );
}
```

---

## Example 8: With Animation Variants

```tsx
import { motion } from 'framer-motion';

function AnimatedDashboard() {
  const [activeSection, setActiveSection] = useState('patients');

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="flex min-h-screen">
      <HealthcareSidebar
        activeItem={activeSection}
        onItemClick={setActiveSection}
      />
      <main className="flex-1 overflow-hidden">
        <motion.div
          key={activeSection}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="h-full p-8"
        >
          <h1 className="text-3xl font-bold mb-4 capitalize">
            {activeSection}
          </h1>
          {/* Content for each section */}
        </motion.div>
      </main>
    </div>
  );
}
```

---

## Example 9: Custom Styled Variant

```tsx
// Create a custom version with different colors
import { Activity, LayoutDashboard, Users, Calendar, FileText, BarChart3, Settings } from 'lucide-react';

function CustomHealthcareSidebar({ activeItem, onItemClick }) {
  const mainMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'patients', label: 'Patients', icon: <Users size={20} /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar size={20} /> },
    { id: 'records', label: 'Medical Records', icon: <FileText size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
  ];

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 flex flex-col">
      {/* Custom gradient background */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
            <Activity size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">MediCare Pro</h1>
            <p className="text-cyan-200 text-xs">Healthcare System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {mainMenuItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-lg
                text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                  : 'text-purple-200 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4 mt-auto border-t border-white/10 pt-4">
        <button
          onClick={() => onItemClick?.('settings')}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-purple-200 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
```

---

## Example 10: With Search & Collapsible

```tsx
import { ChevronLeft, Search } from 'lucide-react';

function AdvancedSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 min-h-screen bg-[#1e293b] flex flex-col`}>
      {/* Header with collapse button */}
      <div className="p-6 border-b border-gray-700/50 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">MediCare Pro</h1>
              <p className="text-gray-400 text-xs">Healthcare System</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft
            size={20}
            className={`text-gray-400 transition-transform ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Search bar (only when expanded) */}
      {!collapsed && (
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Rest of sidebar... */}
    </aside>
  );
}
```

---

## Tips for Production Use

### 1. State Management
```tsx
// Use Context for global sidebar state
const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  return (
    <SidebarContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
```

### 2. Persist Active Section
```tsx
useEffect(() => {
  localStorage.setItem('activeSection', activeSection);
}, [activeSection]);

useEffect(() => {
  const saved = localStorage.getItem('activeSection');
  if (saved) setActiveSection(saved);
}, []);
```

### 3. Loading States
```tsx
{isLoading ? (
  <div className="flex items-center justify-center h-screen">
    <Loader className="animate-spin" />
  </div>
) : (
  <HealthcareSidebar ... />
)}
```

### 4. Error Boundaries
```tsx
<ErrorBoundary fallback={<SidebarError />}>
  <HealthcareSidebar ... />
</ErrorBoundary>
```

---

## Accessibility Enhancements

```tsx
// Add ARIA labels
<button
  aria-label={`Navigate to ${item.label}`}
  aria-current={isActive ? 'page' : undefined}
  role="menuitem"
>
  {/* ... */}
</button>

// Add keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (e) => {
    if (e.altKey) {
      switch(e.key) {
        case '1': setActiveSection('dashboard'); break;
        case '2': setActiveSection('patients'); break;
        // ... etc
      }
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

---

**Choose the example that best fits your needs and customize from there!**
