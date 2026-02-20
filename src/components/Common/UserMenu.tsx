import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Mail } from 'lucide-react';

interface UserMenuProps {
  userName?: string;
  userInitials?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({
  userName: propUserName,
  userInitials: propUserInitials,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Get user data from localStorage (same source as sidebar)
  const { userName, userInitials, userEmail } = useMemo(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const name = propUserName
      || (user?.prenom && user?.nom ? `${user.prenom} ${user.nom}` : null)
      || (user?.username ? user.username : null)
      || 'Médecin';
    const initials = propUserInitials
      || (user?.prenom && user?.nom ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase() : null)
      || (user?.username ? user.username.slice(0, 2).toUpperCase() : null)
      || 'MD';
    const email = user?.email || '';
    return { userName: name, userInitials: initials, userEmail: email };
  }, [propUserName, propUserInitials]);

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
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const handleProfile = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  const handleSettings = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  return (
    <div className="relative z-50" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 bg-[var(--bg-input)] rounded-lg border border-[var(--border-color)] hover:border-blue-500 hover:bg-[var(--bg-secondary)] transition-all duration-200 cursor-pointer group"
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">{userInitials}</span>
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-medium theme-text-primary group-hover:text-blue-400 transition-colors">{userName}</div>
          <div className="text-xs theme-text-muted">Médecin</div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-xl py-2 z-50">
          <div className="px-4 py-3 border-b border-[var(--border-color)]">
            <p className="theme-text-primary text-sm font-semibold">{userName}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Mail size={12} className="theme-text-muted" />
              <p className="theme-text-muted text-xs">{userEmail}</p>
            </div>
          </div>

          <div className="py-1">
            <button
              onClick={handleProfile}
              className="w-full px-4 py-2.5 text-left theme-text-secondary hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-3 cursor-pointer"
            >
              <User size={16} className="theme-text-muted" />
              <span className="text-sm">Mon Profil</span>
            </button>

            <button
              onClick={handleSettings}
              className="w-full px-4 py-2.5 text-left theme-text-secondary hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-3 cursor-pointer"
            >
              <Settings size={16} className="theme-text-muted" />
              <span className="text-sm">Paramètres</span>
            </button>
          </div>

          <div className="border-t border-[var(--border-color)] pt-1">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-left text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-3 cursor-pointer"
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
