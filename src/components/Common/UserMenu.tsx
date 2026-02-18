import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, UserIcon } from 'lucide-react';
import logger from '../../utils/logger';

interface UserMenuProps {
  userName?: string;
  userInitials?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({
  userName = 'Dr. Adams',
  userInitials = 'DA',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  logger.info('[UserMenu] Rendering with:', { userName, userInitials });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logger.info('[UserMenu] Logging out...');

    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });

    logger.info('[UserMenu] Logout complete');
  };

  const handleProfile = () => {
    setIsOpen(false);
    navigate('/profile');
  };

  const handleSettings = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  logger.info('[UserMenu] About to render button');

  return (
    <div className="relative z-50" ref={menuRef}>
      <button
        onClick={() => {
          logger.info('[UserMenu] Button clicked, current isOpen:', isOpen);
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-3 px-4 py-2 bg-[#0f172a] rounded-lg border border-[#334155] hover:border-blue-500 hover:bg-[#1e293b] transition-all duration-200 cursor-pointer group"
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">{userInitials}</span>
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{userName}</div>
          <div className="text-xs text-gray-400">Médecin</div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[#1e293b] border border-[#334155] rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-[#334155]">
            <p className="text-white text-sm font-medium">{userName}</p>
            <p className="text-gray-400 text-xs mt-1">Médecin</p>
          </div>

          <div className="py-2">
            <button
              onClick={handleProfile}
              className="w-full px-4 py-2 text-left text-white hover:bg-[#334155] transition-colors flex items-center gap-3"
            >
              <User size={16} className="text-gray-400" />
              <span className="text-sm">Mon Profil</span>
            </button>

            <button
              onClick={handleSettings}
              className="w-full px-4 py-2 text-left text-white hover:bg-[#334155] transition-colors flex items-center gap-3"
            >
              <Settings size={16} className="text-gray-400" />
              <span className="text-sm">Paramètres</span>
            </button>
          </div>

          <div className="border-t border-[#334155] pt-2">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-red-400 hover:bg-[#334155] transition-colors flex items-center gap-3"
            >
              <LogOut size={16} />
              <span className="text-sm font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
