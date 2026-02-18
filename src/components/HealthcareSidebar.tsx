import React, { useState } from 'react';
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
}

interface HealthcareSidebarProps {
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}

const HealthcareSidebar: React.FC<HealthcareSidebarProps> = ({
  activeItem = 'patients',
  onItemClick
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const mainMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'patients', label: 'Patients', icon: <Users size={20} /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar size={20} /> },
    { id: 'records', label: 'Medical Records', icon: <FileText size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
  ];

  const handleItemClick = (itemId: string) => {
    onItemClick?.(itemId);
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

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 sm:w-80 lg:w-64 min-h-screen bg-[#1e293b] flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Activity size={24} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">
                MediCare Pro
              </h1>
              <p className="text-gray-400 text-xs">
                Healthcare System
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors"
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {mainMenuItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-lg
                  text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }
                `}
              >
                <span className={isActive ? 'text-white' : 'text-gray-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Settings - Bottom */}
        <div className="px-3 pb-4 mt-auto border-t border-gray-700/50 pt-4">
          <button
            type="button"
            onClick={() => handleItemClick('settings')}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-lg
              text-sm font-medium transition-all duration-200
              ${activeItem === 'settings'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }
            `}
          >
            <span className={activeItem === 'settings' ? 'text-white' : 'text-gray-400'}>
              <Settings size={20} />
            </span>
            <span>Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default HealthcareSidebar;
