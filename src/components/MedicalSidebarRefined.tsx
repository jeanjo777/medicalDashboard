import React, { useState, useEffect, startTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logger from '../utils/logger';
import { useSidebarBadges } from '../hooks/useSidebarBadges';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Activity,
  ChevronRight,
  ChevronLeft,
  Stethoscope,
  Bell,
  Brain,
  GitBranch,
  PieChart,
  ArrowLeftRight,
  FileText,
  Sparkles
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  section?: 'main' | 'management' | 'ai' | 'analytics' | 'settings';
}

interface MedicalSidebarRefinedProps {
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const MedicalSidebarRefined: React.FC<MedicalSidebarRefinedProps> = ({
  activeItem,
  onItemClick,
  defaultCollapsed = false,
  onCollapsedChange
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : defaultCollapsed;
  });

  // User data from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user?.prenom && user?.nom ? `Dr. ${user.prenom} ${user.nom}` : 'Dr. Anderson';
  const userEmail = user?.email || 'contact@medicare.com';
  const userInitials = user?.prenom && user?.nom
    ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
    : 'DA';

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    onCollapsedChange?.(isCollapsed);
  }, [isCollapsed, onCollapsedChange]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={22} strokeWidth={2} />,
      path: '/dashboard',
      section: 'main'
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: <Users size={22} strokeWidth={2} />,
      path: '/patients-enhanced',
      section: 'main'
    },
    {
      id: 'appointments',
      label: 'Rendez-vous',
      icon: <Stethoscope size={22} strokeWidth={2} />,
      path: '/appointments',
      section: 'management'
    },
    {
      id: 'calendar',
      label: 'Calendrier',
      icon: <CalendarDays size={22} strokeWidth={2} />,
      path: '/calendar',
      section: 'management'
    },
    {
      id: 'statistics',
      label: 'Statistiques',
      icon: <BarChart3 size={22} strokeWidth={2} />,
      path: '/analytics-advanced',
      section: 'management'
    },
    {
      id: 'ai-assistant',
      label: 'Assistant IA',
      icon: <Sparkles size={22} strokeWidth={2} />,
      path: '/ai-assistant',
      section: 'ai'
    },
    {
      id: 'predictions',
      label: 'Prédictions IA',
      icon: <Brain size={22} strokeWidth={2} />,
      path: '/predictions',
      section: 'analytics'
    },
    {
      id: 'correlations',
      label: 'Corrélations',
      icon: <GitBranch size={22} strokeWidth={2} />,
      path: '/correlations',
      section: 'analytics'
    },
    {
      id: 'segmentation',
      label: 'Segmentation',
      icon: <PieChart size={22} strokeWidth={2} />,
      path: '/segmentation',
      section: 'analytics'
    },
    {
      id: 'ai-alerts',
      label: 'Alertes IA',
      icon: <Bell size={22} strokeWidth={2} />,
      path: '/ai-alerts',
      section: 'analytics'
    },
    {
      id: 'comparative',
      label: 'Comparatif',
      icon: <ArrowLeftRight size={22} strokeWidth={2} />,
      path: '/comparative',
      section: 'analytics'
    },
    {
      id: 'reports',
      label: 'Rapports',
      icon: <FileText size={22} strokeWidth={2} />,
      path: '/reports',
      section: 'analytics'
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: <Settings size={22} strokeWidth={2} />,
      path: '/settings',
      section: 'settings'
    }
  ];

  const getActiveItem = () => {
    if (activeItem) return activeItem;

    const currentPath = location.pathname;
    const matchedItem = menuItems.find(item => item.path === currentPath);
    return matchedItem?.id || 'dashboard';
  };

  const currentActive = getActiveItem();

  // Dynamic badge counts from Supabase
  const badgeCounts = useSidebarBadges();

  // Apply dynamic badges to menu items
  const menuItemsWithBadges = menuItems.map(item => ({
    ...item,
    badge: badgeCounts[item.id] || 0,
  }));

  const handleItemClick = (item: MenuItem) => {
    // Use startTransition for smoother navigation
    startTransition(() => {
      if (onItemClick) {
        onItemClick(item.id);
      }
      navigate(item.path);
    });
    setIsMobileOpen(false);
  };

  const handleLogout = () => {
    logger.info('Logging out...');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/login');
    setIsMobileOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white rounded-xl shadow-2xl hover:shadow-cyan-600/20 hover:scale-105 active:scale-95 transition-all duration-200 border border-[#334155]"
        aria-label={isMobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={isMobileOpen ? true : false}
      >
        {isMobileOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
      </button>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
          role="presentation"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-gradient-to-b from-[#1e293b] via-[#1a2332] to-[#0f172a]
          border-r border-[#334155]/50 flex flex-col z-40
          transition-all duration-300 ease-out
          ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'}
          lg:translate-x-0 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-72 sm:w-80
          shadow-2xl lg:shadow-xl
        `}
        role="navigation"
        aria-label="Navigation principale"
        aria-hidden={!isMobileOpen}
      >
        {/* Header */}
        <div className={`p-4 border-b border-[#334155]/50 ${isCollapsed ? 'px-3' : 'p-5'}`}>
          <div className="flex items-center gap-3">
            <div className={`${isCollapsed ? 'w-10 h-10' : 'w-11 h-11'} bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shrink-0 transition-all duration-300`}>
              <Activity size={isCollapsed ? 22 : 26} className="text-white" strokeWidth={2.5} />
            </div>
            <div className={`min-w-0 flex-1 transition-all duration-300 ${isCollapsed ? 'lg:hidden' : ''}`}>
              <h1 className="text-lg font-bold text-white tracking-tight leading-tight">Medical AI</h1>
              <p className="text-xs text-cyan-400 font-medium leading-tight mt-0.5">Dashboard Intelligent</p>
            </div>
          </div>
        </div>

        {/* Collapse Toggle Button - Desktop only */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-[#1e293b] border border-[#334155] rounded-full items-center justify-center text-gray-400 hover:text-white hover:bg-cyan-700 hover:border-cyan-600 transition-all duration-200 shadow-lg z-50"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={14} strokeWidth={2.5} /> : <ChevronLeft size={14} strokeWidth={2.5} />}
        </button>

        <nav className={`flex-1 py-4 overflow-y-auto custom-scrollbar ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {/* Section: Principal */}
          {!isCollapsed && (
            <p className="px-3 mb-2 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Principal</p>
          )}
          <ul className="space-y-1.5 mb-4" role="list">
            {menuItemsWithBadges.filter(item => item.section === 'main').map((item) => {
              const isActive = currentActive === item.id;
              return (
                <li key={item.id} className="relative group/item">
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleItemClick(item))}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-xl
                      transition-all duration-200 ease-out cursor-pointer
                      group relative overflow-hidden
                      ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}
                      ${isActive
                        ? 'bg-gradient-to-r from-cyan-700 to-teal-600 text-white shadow-lg shadow-cyan-600/30 scale-[1.02]'
                        : 'text-gray-300 hover:text-white hover:bg-[#334155]/80'
                      }
                      focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2 focus:ring-offset-[#1e293b]
                    `}
                    aria-current={isActive ? 'page' : undefined}
                    tabIndex={0}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {isActive && !isCollapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-white rounded-r-full" />
                    )}
                    <div className={`relative flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-all duration-200 ${isActive ? 'bg-white/20' : 'bg-[#0f172a]/40 group-hover:bg-[#0f172a]/60'}`}>
                      {item.icon}
                      {item.badge && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </div>
                    <span className={`flex-1 text-left font-medium text-sm leading-tight transition-all duration-300 ${isCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                    <ChevronRight size={16} className={`shrink-0 transition-all duration-200 ${isCollapsed ? 'lg:hidden' : ''} ${isActive ? 'text-white/90 opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} strokeWidth={2.5} />
                  </button>
                  {isCollapsed && (
                    <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white text-sm font-medium whitespace-nowrap opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 z-50 shadow-xl">
                      {item.label}
                      {item.badge && <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">{item.badge}</span>}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1e293b] border-l border-b border-[#334155] rotate-45" />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Section: Gestion */}
          {!isCollapsed && (
            <p className="px-3 mb-2 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Gestion</p>
          )}
          {isCollapsed && <div className="border-t border-[#334155]/50 my-2" />}
          <ul className="space-y-1.5 mb-4" role="list">
            {menuItemsWithBadges.filter(item => item.section === 'management').map((item) => {
              const isActive = currentActive === item.id;
              return (
                <li key={item.id} className="relative group/item">
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleItemClick(item))}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-xl
                      transition-all duration-200 ease-out cursor-pointer
                      group relative overflow-hidden
                      ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}
                      ${isActive
                        ? 'bg-gradient-to-r from-cyan-700 to-teal-600 text-white shadow-lg shadow-cyan-600/30 scale-[1.02]'
                        : 'text-gray-300 hover:text-white hover:bg-[#334155]/80'
                      }
                      focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2 focus:ring-offset-[#1e293b]
                    `}
                    aria-current={isActive ? 'page' : undefined}
                    tabIndex={0}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {isActive && !isCollapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-white rounded-r-full" />
                    )}
                    <div className={`relative flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-all duration-200 ${isActive ? 'bg-white/20' : 'bg-[#0f172a]/40 group-hover:bg-[#0f172a]/60'}`}>
                      {item.icon}
                      {item.badge && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </div>
                    <span className={`flex-1 text-left font-medium text-sm leading-tight transition-all duration-300 ${isCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                    <ChevronRight size={16} className={`shrink-0 transition-all duration-200 ${isCollapsed ? 'lg:hidden' : ''} ${isActive ? 'text-white/90 opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} strokeWidth={2.5} />
                  </button>
                  {isCollapsed && (
                    <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white text-sm font-medium whitespace-nowrap opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 z-50 shadow-xl">
                      {item.label}
                      {item.badge && <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">{item.badge}</span>}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1e293b] border-l border-b border-[#334155] rotate-45" />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Section: Assistant IA */}
          {!isCollapsed && (
            <p className="px-3 mb-2 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Assistant IA</p>
          )}
          {isCollapsed && <div className="border-t border-[#334155]/50 my-2" />}
          <ul className="space-y-1.5 mb-4" role="list">
            {menuItemsWithBadges.filter(item => item.section === 'ai').map((item) => {
              const isActive = currentActive === item.id;
              return (
                <li key={item.id} className="relative group/item">
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleItemClick(item))}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-xl
                      transition-all duration-200 ease-out cursor-pointer
                      group relative overflow-hidden
                      ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}
                      ${isActive
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 scale-[1.02]'
                        : 'text-gray-300 hover:text-white hover:bg-[#334155]/80'
                      }
                      focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-[#1e293b]
                    `}
                    aria-current={isActive ? 'page' : undefined}
                    tabIndex={0}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {isActive && !isCollapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-white rounded-r-full" />
                    )}
                    <div className={`relative flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-all duration-200 ${isActive ? 'bg-white/20' : 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 group-hover:from-amber-500/30 group-hover:to-orange-500/30'}`}>
                      {item.icon}
                      {item.badge != null && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </div>
                    <span className={`flex-1 text-left font-medium text-sm leading-tight transition-all duration-300 ${isCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                    <ChevronRight size={16} className={`shrink-0 transition-all duration-200 ${isCollapsed ? 'lg:hidden' : ''} ${isActive ? 'text-white/90 opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} strokeWidth={2.5} />
                  </button>
                  {isCollapsed && (
                    <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white text-sm font-medium whitespace-nowrap opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 z-50 shadow-xl">
                      {item.label}
                      {item.badge != null && item.badge > 0 && <span className="ml-2 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">{item.badge}</span>}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1e293b] border-l border-b border-[#334155] rotate-45" />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Section: Analyse IA */}
          {!isCollapsed && (
            <p className="px-3 mb-2 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Analyse IA</p>
          )}
          {isCollapsed && <div className="border-t border-[#334155]/50 my-2" />}
          <ul className="space-y-1.5 mb-4" role="list">
            {menuItemsWithBadges.filter(item => item.section === 'analytics').map((item) => {
              const isActive = currentActive === item.id;
              return (
                <li key={item.id} className="relative group/item">
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleItemClick(item))}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                      transition-all duration-200 ease-out cursor-pointer
                      group relative overflow-hidden
                      ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}
                      ${isActive
                        ? 'bg-gradient-to-r from-violet-700 to-purple-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]'
                        : 'text-gray-300 hover:text-white hover:bg-[#334155]/80'
                      }
                      focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:ring-offset-[#1e293b]
                    `}
                    aria-current={isActive ? 'page' : undefined}
                    tabIndex={0}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {isActive && !isCollapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 bg-white rounded-r-full" />
                    )}
                    <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-200 ${isActive ? 'bg-white/20' : 'bg-[#0f172a]/40 group-hover:bg-[#0f172a]/60'}`}>
                      {item.icon}
                      {item.badge != null && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </div>
                    <span className={`flex-1 text-left font-medium text-[13px] leading-tight transition-all duration-300 ${isCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                    <ChevronRight size={14} className={`shrink-0 transition-all duration-200 ${isCollapsed ? 'lg:hidden' : ''} ${isActive ? 'text-white/90 opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} strokeWidth={2.5} />
                  </button>
                  {isCollapsed && (
                    <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white text-sm font-medium whitespace-nowrap opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 z-50 shadow-xl">
                      {item.label}
                      {item.badge != null && item.badge > 0 && <span className="ml-2 px-1.5 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded-full">{item.badge}</span>}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1e293b] border-l border-b border-[#334155] rotate-45" />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Section: Paramètres */}
          {!isCollapsed && (
            <p className="px-3 mb-2 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Système</p>
          )}
          {isCollapsed && <div className="border-t border-[#334155]/50 my-2" />}
          <ul className="space-y-1.5" role="list">
            {menuItemsWithBadges.filter(item => item.section === 'settings').map((item) => {
              const isActive = currentActive === item.id;
              return (
                <li key={item.id} className="relative group/item">
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    onKeyDown={(e) => handleKeyDown(e, () => handleItemClick(item))}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-xl
                      transition-all duration-200 ease-out cursor-pointer
                      group relative overflow-hidden
                      ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}
                      ${isActive
                        ? 'bg-gradient-to-r from-cyan-700 to-teal-600 text-white shadow-lg shadow-cyan-600/30 scale-[1.02]'
                        : 'text-gray-300 hover:text-white hover:bg-[#334155]/80'
                      }
                      focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2 focus:ring-offset-[#1e293b]
                    `}
                    aria-current={isActive ? 'page' : undefined}
                    tabIndex={0}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {isActive && !isCollapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-white rounded-r-full" />
                    )}
                    <div className={`relative flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-all duration-200 ${isActive ? 'bg-white/20' : 'bg-[#0f172a]/40 group-hover:bg-[#0f172a]/60'}`}>
                      {item.icon}
                    </div>
                    <span className={`flex-1 text-left font-medium text-sm leading-tight transition-all duration-300 ${isCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                    <ChevronRight size={16} className={`shrink-0 transition-all duration-200 ${isCollapsed ? 'lg:hidden' : ''} ${isActive ? 'text-white/90 opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} strokeWidth={2.5} />
                  </button>
                  {isCollapsed && (
                    <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white text-sm font-medium whitespace-nowrap opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200 z-50 shadow-xl">
                      {item.label}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1e293b] border-l border-b border-[#334155] rotate-45" />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={`border-t border-[#334155]/50 ${isCollapsed ? 'p-2' : 'p-3'}`}>
          {/* Logout Button */}
          <div className="relative group/logout">
            <button
              type="button"
              onClick={handleLogout}
              onKeyDown={(e) => handleKeyDown(e, handleLogout)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer
                text-red-400 hover:text-white hover:bg-red-600/20
                transition-all duration-200 ease-out
                group border border-red-500/30 hover:border-red-500/50
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#1e293b]
                active:scale-95
                ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}
              `}
              tabIndex={0}
              aria-label="Se déconnecter de l'application"
              title={isCollapsed ? 'Déconnexion' : undefined}
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-500/15 group-hover:bg-red-500/25 transition-all duration-200 shrink-0">
                <LogOut size={20} strokeWidth={2} />
              </div>
              <span className={`flex-1 text-left font-medium text-sm leading-tight transition-all duration-300 ${isCollapsed ? 'lg:hidden' : ''}`}>
                Déconnexion
              </span>
              <ChevronRight
                size={16}
                className={`opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 shrink-0 ${isCollapsed ? 'lg:hidden' : ''}`}
                strokeWidth={2.5}
              />
            </button>

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white text-sm font-medium whitespace-nowrap opacity-0 invisible group-hover/logout:opacity-100 group-hover/logout:visible transition-all duration-200 z-50 shadow-xl">
                Déconnexion
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1e293b] border-l border-b border-[#334155] rotate-45" />
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className={`mt-3 pt-3 border-t border-[#334155]/30 ${isCollapsed ? 'lg:mt-2 lg:pt-2' : ''}`}>
            <div className={`relative group/profile flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#334155]/30 transition-colors duration-200 cursor-pointer ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}`}>
              <div className="relative shrink-0">
                <div className={`${isCollapsed ? 'lg:w-9 lg:h-9' : 'w-10 h-10'} w-10 h-10 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-lg ring-2 ring-cyan-600/20 transition-all duration-300`}>
                  {userInitials}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1e293b]" aria-label="En ligne" />
              </div>
              <div className={`flex-1 min-w-0 transition-all duration-300 ${isCollapsed ? 'lg:hidden' : ''}`}>
                <p className="text-white text-sm font-semibold leading-tight truncate">{userName}</p>
                <p className="text-gray-400 text-xs leading-tight mt-0.5 truncate">{userEmail}</p>
              </div>
              <ChevronRight
                size={14}
                className={`text-gray-500 opacity-0 group-hover/profile:opacity-100 transition-opacity duration-200 shrink-0 ${isCollapsed ? 'lg:hidden' : ''}`}
                strokeWidth={2}
              />

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white text-sm whitespace-nowrap opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-200 z-50 shadow-xl">
                  <p className="font-semibold">{userName}</p>
                  <p className="text-gray-400 text-xs">{userEmail}</p>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1e293b] border-l border-b border-[#334155] rotate-45" />
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(51, 65, 85, 0.8);
          border-radius: 3px;
          transition: background 0.2s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 1);
        }

        @media (max-width: 1023px) {
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(51, 65, 85, 0.8) transparent;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: no-preference) {
          aside {
            will-change: transform;
          }
        }
      `}</style>
    </>
  );
};

export default MedicalSidebarRefined;
