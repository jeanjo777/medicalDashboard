/**
 * Global Search Component
 *
 * Search across patients, appointments, and consultations.
 * Features:
 * - Real-time search with debouncing
 * - Dropdown results with categories
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Click outside to close
 * - Loading states
 * - Empty states
 * - Navigation to result details
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Calendar, FileText, Loader2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import logger from '../../utils/logger';
import { getCurrentMedicId } from '../../utils/auth';

interface SearchResult {
  id: string;
  type: 'patient' | 'appointment' | 'consultation';
  title: string;
  subtitle: string;
  date?: string;
  icon: React.ReactNode;
  path: string;
}

export const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Perform search across all tables
   */
  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setIsOpen(true);

    try {
      const searchTerm = `%${searchQuery.toLowerCase()}%`;

      // Search patients
      const { data: patients } = await supabase
        .from('patients')
        .select('id, name, email, phone, created_at')
        .eq('medic_id', getCurrentMedicId()!)
        .or(`name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`)
        .limit(5);

      // Search appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id, patient_name, appointment_date, appointment_time, message')
        .or(`patient_name.ilike.${searchTerm},message.ilike.${searchTerm}`)
        .limit(5);

      // Format results
      const formattedResults: SearchResult[] = [];

      // Add patients
      patients?.forEach(patient => {
        formattedResults.push({
          id: patient.id,
          type: 'patient',
          title: patient.name,
          subtitle: patient.email || patient.phone || 'Aucun contact',
          date: new Date(patient.created_at).toLocaleDateString('fr-FR'),
          icon: <User size={18} className="text-blue-500" />,
          path: `/patients-enhanced`
        });
      });

      // Add appointments
      appointments?.forEach(apt => {
        formattedResults.push({
          id: apt.id,
          type: 'appointment',
          title: apt.patient_name,
          subtitle: apt.message || 'Rendez-vous',
          date: `${apt.appointment_date} ${apt.appointment_time}`,
          icon: <Calendar size={18} className="text-purple-500" />,
          path: `/appointments`
        });
      });

      setResults(formattedResults);
      setSelectedIndex(0);

    } catch (error) {
      logger.error('[GlobalSearch] Error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  /**
   * Handle result selection
   */
  const handleSelectResult = (result: SearchResult) => {
    navigate(result.path);
    setQuery('');
    setIsOpen(false);
    setResults([]);
  };

  /**
   * Clear search
   */
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  /**
   * Group results by type
   */
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const typeLabels = {
    patient: 'Patients',
    appointment: 'Rendez-vous',
    consultation: 'Consultations'
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
          size={18}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Rechercher patients, rendez-vous..."
          className="w-80 pl-10 pr-10 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-sm theme-text-secondary placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
        />

        {/* Loading Spinner */}
        {loading && (
          <Loader2
            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin"
            size={18}
          />
        )}

        {/* Clear Button */}
        {query && !loading && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50">
          {results.length === 0 && !loading && query.length >= 2 && (
            <div className="p-6 text-center">
              <Search size={48} className="mx-auto theme-text-secondary mb-3" />
              <p className="theme-text-muted text-sm">
                Aucun résultat pour "{query}"
              </p>
              <p className="theme-text-muted text-xs mt-1">
                Essayez un autre terme de recherche
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="py-2">
              {Object.entries(groupedResults).map(([type, items]) => (
                <div key={type} className="mb-2 last:mb-0">
                  {/* Category Header */}
                  <div className="px-4 py-2 text-xs font-semibold theme-text-muted uppercase">
                    {typeLabels[type as keyof typeof typeLabels]} ({items.length})
                  </div>

                  {/* Results */}
                  {items.map((result, index) => {
                    const globalIndex = results.indexOf(result);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={result.id}
                        onClick={() => handleSelectResult(result)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`
                          w-full px-4 py-3 flex items-start gap-3
                          transition-colors text-left
                          ${isSelected
                            ? 'bg-blue-600/20 border-l-2 border-blue-500'
                            : 'hover:bg-[var(--bg-tertiary)] border-l-2 border-transparent'
                          }
                        `}
                      >
                        {/* Icon */}
                        <div className="mt-0.5">
                          {result.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium theme-text-primary truncate">
                            {result.title}
                          </p>
                          <p className="text-xs theme-text-muted truncate mt-0.5">
                            {result.subtitle}
                          </p>
                          {result.date && (
                            <p className="text-xs theme-text-muted mt-1">
                              {result.date}
                            </p>
                          )}
                        </div>

                        {/* Keyboard hint */}
                        {isSelected && (
                          <div className="text-xs text-blue-400 font-medium">
                            ↵
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* Footer */}
              <div className="px-4 py-2 border-t border-[var(--border-color)] text-xs theme-text-muted flex items-center justify-between">
                <span>↑↓ Navigation • ↵ Sélection • Esc Fermer</span>
                <span className="theme-text-secondary">{results.length} résultats</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
