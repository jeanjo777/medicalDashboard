import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Activity,
  Menu,
  X
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface ModernSidebarProps {
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({
  activeItem,
  onItemClick
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const mainMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} strokeWidth={2} />, path: '/dashboard' },
    { id: 'patients', label: 'Patients', icon: <Users size={20} strokeWidth={2} />, path: '/patients-enhanced' },
    { id: 'appointments', label: 'Rendez-vous', icon: <Calendar size={20} strokeWidth={2} />, path: '/appointments' },
    { id: 'calendar', label: 'Calendrier', icon: <Calendar size={20} strokeWidth={2} />, path: '/calendar' },
    { id: 'analytics', label: 'Statistiques', icon: <BarChart3 size={20} strokeWidth={2} />, path: '/analytics' },
    { id: 'records', label: 'Dossiers', icon: <FileText size={20} strokeWidth={2} />, path: '/patients-view' },
  ];

  const getActiveItem = () => {
    if (activeItem) return activeItem;

    const currentPath = location.pathname;
    const activeMenuItem = mainMenuItems.find(item => item.path === currentPath);
    return activeMenuItem?.id || 'dashboard';
  };

  const handleItemClick = (item: MenuItem) => {
    if (onItemClick) {
      onItemClick(item.id);
    }
    navigate(item.path);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2.5 bg-[#1e293b] border border-[#334155] rounded-lg text-gray-400 hover:text-white transition-colors"
        aria-label="Ouvrir le menu"
      >
        <Menu size={22} />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 sm:w-[240px] min-h-screen bg-[#1e293b] flex flex-col border-r border-[#334155]
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Activity size={22} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-semibold text-base leading-tight truncate">
                MediCare Pro
              </h1>
              <p className="text-gray-400 text-xs leading-tight truncate">
                Healthcare System
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 hover:bg-[#334155] rounded-lg text-gray-400 hover:text-white transition-colors"
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {mainMenuItems.map((item) => {
            const currentActiveItem = getActiveItem();
            const isActive = currentActiveItem === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  text-sm font-medium transition-all duration-200
                  group relative
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-gray-400 hover:text-white hover:bg-[#334155]/50'
                  }
                `}
              >
                <span
                  className={`
                    flex-shrink-0 transition-colors duration-200
                    ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}
                  `}
                >
                  {item.icon}
                </span>
                <span className="truncate">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Settings - Bottom */}
        <div className="px-4 pb-6 mt-auto border-t border-[#334155] pt-6">
          <button
            type="button"
            onClick={() => {
              onItemClick?.('settings');
              navigate('/dashboard');
              setIsMobileOpen(false);
            }}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg
              text-sm font-medium transition-all duration-200
              group
              ${activeItem === 'settings'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-gray-400 hover:text-white hover:bg-[#334155]/50'
              }
            `}
          >
            <span className={`
              flex-shrink-0 transition-colors duration-200
              ${activeItem === 'settings' ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}
            `}>
              <Settings size={20} strokeWidth={2} />
            </span>
            <span className="truncate">Paramètres</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ModernSidebar;
