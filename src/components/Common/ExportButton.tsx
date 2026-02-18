/**
 * Export Button Component
 *
 * Export data to CSV or PDF formats.
 * Features:
 * - CSV export with proper formatting
 * - PDF export (basic text format)
 * - Dropdown format selector
 * - Loading state during export
 * - Success feedback (toast)
 * - Error handling
 * - Click outside to close
 */

import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, Check, AlertCircle, Loader2, ChevronDown, FileJson, Copy } from 'lucide-react';
import { exportData, ExportFormat, ExportOptions, flattenData } from '../../utils/exportUtils';
import logger from '../../utils/logger';

interface ExportButtonProps {
  data: any[];
  filename: string;
  title?: string;
  metadata?: Record<string, any>;
  flattenBeforeExport?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename,
  title = 'Exporter',
  metadata = {},
  flattenBeforeExport = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleExport = async (format: ExportFormat) => {
    setLoading(true);
    setError(null);
    setIsOpen(false);

    try {
      if (!data || data.length === 0) {
        throw new Error('Aucune donnée à exporter');
      }

      const exportDataProcessed = flattenBeforeExport ? flattenData(data) : data;

      const options: ExportOptions = {
        filename,
        title,
        metadata: {
          ...metadata,
          recordCount: exportDataProcessed.length,
          exportedAt: new Date().toISOString()
        }
      };

      await exportData(exportDataProcessed, format, options);

      const formatNames: Record<ExportFormat, string> = {
        csv: 'CSV',
        json: 'JSON',
        txt: 'TXT',
        clipboard: 'Presse-papier'
      };

      setSuccessMessage(
        format === 'clipboard'
          ? 'Données copiées dans le presse-papier!'
          : `Fichier ${formatNames[format]} téléchargé avec succès!`
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (err: any) {
      logger.error('[ExportButton] Error:', err);
      setError(err.message || 'Erreur lors de l\'export');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const formats: { value: ExportFormat; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'csv',
      label: 'CSV',
      icon: <FileSpreadsheet size={18} className="text-green-500" />,
      description: 'Excel, Numbers, Google Sheets'
    },
    {
      value: 'json',
      label: 'JSON',
      icon: <FileJson size={18} className="text-blue-500" />,
      description: 'Format de données structurées'
    },
    {
      value: 'txt',
      label: 'TXT',
      icon: <FileText size={18} className="text-gray-400" />,
      description: 'Fichier texte lisible'
    },
    {
      value: 'clipboard',
      label: 'Presse-papier',
      icon: <Copy size={18} className="text-purple-500" />,
      description: 'Copier dans le presse-papier'
    }
  ];

  return (
    <div ref={dropdownRef} className="relative">
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || data.length === 0}
        className={`
          flex items-center gap-2 px-4 py-2.5
          rounded-lg font-medium text-sm
          transition-all duration-200
          ${loading
            ? 'bg-blue-600/50 text-white cursor-wait'
            : data.length === 0
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:scale-105'
          }
        `}
        title={data.length === 0 ? 'Aucune donnée à exporter' : title}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Export...</span>
          </>
        ) : (
          <>
            <Download size={18} />
            <span>{title}</span>
            <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 theme-bg-secondary border theme-border rounded-lg shadow-2xl z-50 py-2">
          <div className="px-4 py-2 border-b theme-border">
            <p className="theme-text-primary text-sm font-semibold">Format d'export</p>
            <p className="theme-text-muted text-xs mt-0.5">
              {data.length} {data.length > 1 ? 'entrées' : 'entrée'}
            </p>
          </div>

          {formats.map(format => (
            <button
              key={format.value}
              onClick={() => handleExport(format.value)}
              className="w-full px-4 py-3 flex items-start gap-3 hover:bg-[var(--bg-tertiary)] transition-colors text-left cursor-pointer"
            >
              <div className="mt-0.5">{format.icon}</div>
              <div className="flex-1">
                <p className="theme-text-primary text-sm font-medium">{format.label}</p>
                <p className="theme-text-muted text-xs mt-0.5">{format.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-50 animate-slide-up">
          <Check size={20} />
          <div>
            <p className="font-semibold text-sm">Export réussi!</p>
            <p className="text-xs text-green-100 mt-0.5">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-50 animate-slide-up">
          <AlertCircle size={20} />
          <div>
            <p className="font-semibold text-sm">Erreur d'export</p>
            <p className="text-xs text-red-100 mt-0.5">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
