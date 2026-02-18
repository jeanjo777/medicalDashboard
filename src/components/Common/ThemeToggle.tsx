/**
 * ThemeToggle Component
 *
 * Accessible theme switcher with Light/Dark/System modes.
 * Features:
 * - Visual theme preview
 * - ARIA labels for accessibility
 * - Keyboard navigation
 * - Smooth transitions
 * - Persists to localStorage
 * - System preference detection
 */

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      value: 'light' as const,
      icon: Sun,
      label: 'Light',
      description: 'Light theme'
    },
    {
      value: 'dark' as const,
      icon: Moon,
      label: 'Dark',
      description: 'Dark theme'
    },
    {
      value: 'system' as const,
      icon: Monitor,
      label: 'System',
      description: 'Follow system preference'
    }
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Theme selection"
      className="inline-flex items-center gap-1 bg-[#1e293b] rounded-lg p-1 border border-[#334155]"
    >
      {themes.map(({ value, icon: Icon, label, description }) => (
        <button
          key={value}
          role="radio"
          aria-checked={theme === value}
          aria-label={description}
          onClick={() => setTheme(value)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1e293b]
            ${theme === value
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
              : 'text-gray-400 hover:text-white hover:bg-[#334155]'
            }
          `}
        >
          <Icon size={16} aria-hidden="true" />
          <span className="text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
