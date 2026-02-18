import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Bot,
  User,
  Stethoscope,
  Pill,
  BookOpen,
  MessageSquare,
  Trash2,
  Sparkles,
  ChevronDown,
  AlertTriangle,
  Loader2,
  Plus,
  X,
  Heart,
  Image as ImageIcon,
  Download,
  ScanLine,
  Tablets,
  Search,
  FileText,
  UserCheck,
} from 'lucide-react';
import MedicalSidebarRefined from '../components/MedicalSidebarRefined';
import { useAIAssistant, type AssistantMode, type ChatMessage, type ImageAttachment, type PatientContext } from '../hooks/useAIAssistant';
import { supabase } from '../lib/supabase';

// ============================================
// MODE CONFIGURATION
// ============================================

const MODE_CONFIG: Record<AssistantMode, { label: string; icon: React.ElementType; color: string; gradient: string; description: string }> = {
  diagnostic: {
    label: 'Diagnostic',
    icon: Stethoscope,
    color: 'text-violet-400',
    gradient: 'from-violet-600 to-purple-600',
    description: 'Aide au diagnostic differentiel, red flags, examens',
  },
  treatment: {
    label: 'Traitement',
    icon: Pill,
    color: 'text-emerald-400',
    gradient: 'from-emerald-600 to-teal-600',
    description: 'Aide therapeutique, posologies, interactions',
  },
  radiology: {
    label: 'Radiologie',
    icon: ScanLine,
    color: 'text-sky-400',
    gradient: 'from-sky-600 to-blue-600',
    description: 'Analyse d\'imagerie medicale, radiographies, IRM, scanner',
  },
  pharmacology: {
    label: 'Pharmacologie',
    icon: Tablets,
    color: 'text-rose-400',
    gradient: 'from-rose-600 to-pink-600',
    description: 'Recommandations medicamenteuses, interactions, posologies',
  },
  literature: {
    label: 'Litterature',
    icon: BookOpen,
    color: 'text-blue-400',
    gradient: 'from-blue-600 to-cyan-600',
    description: 'Recherche medicale, guidelines, evidence',
  },
  general: {
    label: 'General',
    icon: MessageSquare,
    color: 'text-amber-400',
    gradient: 'from-amber-500 to-orange-600',
    description: 'Assistant medical polyvalent',
  },
};

const QUICK_PROMPTS: Record<AssistantMode, string[]> = {
  diagnostic: [
    'Diagnostic differentiel pour douleur thoracique aigue',
    'Red flags cephalees: quand orienter en urgence?',
    'Bilan biologique devant une asthenie chronique',
    'Criteres diagnostiques du diabete de type 2',
  ],
  treatment: [
    'Traitement de premiere intention HTA essentielle',
    'Antibiotherapie pneumopathie communautaire adulte',
    'Prise en charge douleur chronique non cancereuse',
    'Corticotherapie courte: schema et surveillance',
  ],
  radiology: [
    'Comment interpreter une radiographie thoracique systematiquement?',
    'Signes radiologiques d\'une pneumopathie',
    'Criteres de gravite sur un scanner cerebral',
    'Echographie abdominale: points cles a verifier',
  ],
  pharmacology: [
    'Antibiotiques pour infection urinaire: choix et posologie',
    'Interactions medicamenteuses avec les anticoagulants oraux',
    'Adaptation posologique en insuffisance renale',
    'Antalgiques palier 1 a 3: schema de prescription',
  ],
  literature: [
    'Recommandations HAS diabete type 2 - 2024',
    'Nouvelles guidelines ESC insuffisance cardiaque',
    'Evidence actuelle immunotherapie cancers solides',
    'Meta-analyses recentes sur les statines',
  ],
  general: [
    'Calcul du score CHA2DS2-VASc',
    'Interpretation ECG: criteres infarctus',
    'Schema vaccinal adulte a jour',
    'Formule de Cockcroft pour clairance creatinine',
  ],
};

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGES = 4;

// ============================================
// ENHANCED MARKDOWN RENDERER
// ============================================

const formatMessage = (text: string): React.ReactNode[] => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const processInlineFormatting = (line: string): React.ReactNode => {
    if (!line.includes('**') && !line.includes('`')) return line;

    // Split by inline code and bold
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/);
    return (
      <span>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**'))
            return <strong key={j} className="text-white font-semibold">{part.replace(/\*\*/g, '')}</strong>;
          if (part.startsWith('`') && part.endsWith('`'))
            return <code key={j} className="bg-[#334155] text-cyan-300 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
          return part;
        })}
      </span>
    );
  };

  const flushTable = (startIdx: number) => {
    if (tableRows.length < 2) return;
    const headers = tableRows[0];
    const dataRows = tableRows.slice(2); // Skip separator row

    elements.push(
      <div key={`table-${startIdx}`} className="my-3 overflow-x-auto rounded-xl border border-[#334155]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#334155]/50">
              {headers.map((h, hi) => (
                <th key={hi} className="px-3 py-2 text-left text-xs font-semibold text-gray-300 whitespace-nowrap">{h.trim()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, ri) => (
              <tr key={ri} className="border-t border-[#334155]/50">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-2 text-gray-300 whitespace-nowrap">{processInlineFormatting(cell.trim())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
  };

  lines.forEach((line, i) => {
    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="my-2 bg-[#0f172a] border border-[#334155] rounded-xl p-3 overflow-x-auto">
            <code className="text-xs font-mono text-cyan-200">{codeContent.join('\n')}</code>
          </pre>
        );
        codeContent = [];
        inCodeBlock = false;
      } else {
        if (inTable) { flushTable(i); inTable = false; }
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      return;
    }

    // Table detection
    if (line.includes('|') && line.trim().startsWith('|')) {
      const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (!inTable) inTable = true;
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable(i);
      inTable = false;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
      elements.push(<hr key={i} className="my-3 border-[#334155]" />);
      return;
    }

    // H3 headers
    if (line.startsWith('### ')) {
      elements.push(<h4 key={i} className="text-white font-bold text-sm mt-4 mb-1">{processInlineFormatting(line.slice(4))}</h4>);
      return;
    }
    if (line.startsWith('## ')) {
      elements.push(<h3 key={i} className="text-white font-bold text-base mt-4 mb-1">{processInlineFormatting(line.slice(3))}</h3>);
      return;
    }
    if (line.startsWith('# ')) {
      elements.push(<h2 key={i} className="text-white font-bold text-lg mt-4 mb-2">{processInlineFormatting(line.slice(2))}</h2>);
      return;
    }

    // Bold-only header lines
    if (line.startsWith('**') && line.endsWith('**') && !line.slice(2, -2).includes('**')) {
      elements.push(<p key={i} className="font-bold text-white mt-3 mb-1 text-sm">{line.replace(/\*\*/g, '')}</p>);
      return;
    }

    // Bullet points
    if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={i} className="ml-4 text-sm text-gray-300 leading-relaxed list-disc">
          {processInlineFormatting(line.substring(2))}
        </li>
      );
      return;
    }

    // Numbered lists
    if (/^\d+\.\s/.test(line)) {
      elements.push(
        <li key={i} className="ml-4 text-sm text-gray-300 leading-relaxed list-decimal">
          {processInlineFormatting(line.replace(/^\d+\.\s/, ''))}
        </li>
      );
      return;
    }

    // Empty lines
    if (!line.trim()) {
      elements.push(<div key={i} className="h-2" />);
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-sm text-gray-300 leading-relaxed">
        {processInlineFormatting(line)}
      </p>
    );
  });

  // Flush remaining table
  if (inTable) flushTable(lines.length);

  return elements;
};

// ============================================
// DOWNLOAD HELPERS
// ============================================

const downloadAsText = (content: string, mode: string) => {
  const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', 'h');
  const filename = `rapport_medical_${mode}_${timestamp}.txt`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const generatePDFReport = (message: ChatMessage, patientContext: PatientContext | null, mode: string) => {
  const modeLabels: Record<string, string> = {
    diagnostic: 'Rapport de Diagnostic',
    treatment: 'Plan de Traitement',
    radiology: 'Rapport de Radiologie',
    pharmacology: 'Rapport Pharmacologique',
    literature: 'Revue de Litterature',
    general: 'Rapport Medical',
  };

  const title = modeLabels[mode] || 'Rapport Medical';
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  // Convert markdown content to basic HTML
  const contentHTML = message.content
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:2px 6px;border-radius:4px;font-size:12px;">$1</code>')
    .replace(/^### (.+)$/gm, '<h4 style="color:#1e293b;margin:16px 0 8px;font-size:14px;">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="color:#1e293b;margin:16px 0 8px;font-size:16px;">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 style="color:#1e293b;margin:20px 0 10px;font-size:18px;">$1</h2>')
    .replace(/^- (.+)$/gm, '<li style="margin:4px 0;margin-left:20px;">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:4px 0;margin-left:20px;list-style-type:decimal;">$1</li>')
    .replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;">')
    .replace(/\n\n/g, '</p><p style="margin:8px 0;line-height:1.6;">')
    .replace(/\n/g, '<br>');

  const patientSection = patientContext ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
      <h3 style="color:#166534;margin:0 0 8px;font-size:14px;">Contexte Patient</h3>
      <table style="font-size:13px;color:#374151;">
        ${patientContext.patientName ? `<tr><td style="padding:2px 12px 2px 0;color:#6b7280;">Nom:</td><td><strong>${patientContext.patientName}</strong></td></tr>` : ''}
        ${patientContext.patientAge ? `<tr><td style="padding:2px 12px 2px 0;color:#6b7280;">Age:</td><td>${patientContext.patientAge} ans</td></tr>` : ''}
        ${patientContext.patientSex ? `<tr><td style="padding:2px 12px 2px 0;color:#6b7280;">Sexe:</td><td>${patientContext.patientSex === 'M' ? 'Masculin' : 'Feminin'}</td></tr>` : ''}
        ${patientContext.primaryPathology ? `<tr><td style="padding:2px 12px 2px 0;color:#6b7280;">Pathologie:</td><td>${patientContext.primaryPathology}</td></tr>` : ''}
        ${patientContext.riskScore != null ? `<tr><td style="padding:2px 12px 2px 0;color:#6b7280;">Score de risque:</td><td>${patientContext.riskScore}%</td></tr>` : ''}
        ${patientContext.antecedents?.length ? `<tr><td style="padding:2px 12px 2px 0;color:#6b7280;">Antecedents:</td><td>${patientContext.antecedents.join(', ')}</td></tr>` : ''}
        ${patientContext.currentMedications?.length ? `<tr><td style="padding:2px 12px 2px 0;color:#6b7280;">Traitements:</td><td>${patientContext.currentMedications.join(', ')}</td></tr>` : ''}
      </table>
    </div>` : '';

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${title} - Medical AI</title>
  <style>
    @media print { body { margin: 0; } .no-print { display: none; } }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { border-bottom: 3px solid #0d9488; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { color: #0d9488; font-size: 24px; margin: 0; }
    .header .subtitle { color: #64748b; font-size: 13px; margin-top: 4px; }
    .meta { display: flex; gap: 24px; color: #64748b; font-size: 12px; margin-top: 8px; }
    .content { line-height: 1.7; font-size: 14px; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; text-align: center; }
    .disclaimer { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px; margin: 24px 0; font-size: 12px; color: #92400e; }
    .btn-print { position: fixed; top: 16px; right: 16px; background: #0d9488; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; }
    .btn-print:hover { background: #0f766e; }
  </style>
</head>
<body>
  <button class="btn-print no-print" onclick="window.print()">Imprimer / PDF</button>
  <div class="header">
    <h1>${title}</h1>
    <div class="subtitle">Genere par Medical AI - Assistant IA Medical</div>
    <div class="meta">
      <span>Date: ${dateStr}</span>
      <span>Heure: ${timeStr}</span>
      <span>Mode: ${MODE_CONFIG[mode as AssistantMode]?.label || mode}</span>
    </div>
  </div>
  ${patientSection}
  <div class="content">
    <p style="margin:8px 0;line-height:1.6;">${contentHTML}</p>
  </div>
  <div class="disclaimer">
    ⚠ Ce rapport est genere par une intelligence artificielle et constitue une aide a la decision medicale.
    Il ne remplace en aucun cas le jugement clinique du medecin. Toutes les informations doivent etre
    verifiees et adaptees au contexte clinique du patient.
  </div>
  <div class="footer">
    Medical AI &mdash; Rapport genere le ${dateStr} a ${timeStr}<br>
    Ce document est confidentiel et reserve a l'usage medical professionnel.
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

// ============================================
// PATIENT SEARCH COMPONENT
// ============================================

interface PatientSearchResult {
  id: string;
  name: string;
  email: string;
  date_of_birth: string;
  gender: string;
  status: string;
  primary_pathology: string;
  riskScore: number;
  age: number;
}

const PatientSearchSelector: React.FC<{
  onSelect: (patient: PatientSearchResult) => void;
  onClose: () => void;
}> = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PatientSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchPatients = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, email, date_of_birth, gender, status, primary_pathology, riskScore, age')
        .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,primary_pathology.ilike.%${searchQuery}%`)
        .limit(8);

      if (!error && data) {
        setResults(data as PatientSearchResult[]);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchPatients(query), 300);
    return () => clearTimeout(timer);
  }, [query, searchPatients]);

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <UserCheck size={14} className="text-cyan-400" />
          Selectionner un Patient
        </h3>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Fermer la recherche patient">
          <X size={16} />
        </button>
      </div>

      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher par nom, email ou pathologie..."
          aria-label="Rechercher un patient"
          className="w-full bg-[#0f172a] border border-[#334155] rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
          autoFocus
        />
      </div>

      <div className="max-h-64 overflow-y-auto space-y-1">
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 size={16} className="text-cyan-400 animate-spin" />
            <span className="text-xs text-gray-400 ml-2">Recherche...</span>
          </div>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <p className="text-center text-gray-500 text-xs py-4">Aucun patient trouve</p>
        )}

        {!loading && query.length < 2 && (
          <p className="text-center text-gray-500 text-xs py-4">Tapez au moins 2 caracteres</p>
        )}

        {results.map(patient => (
          <button
            key={patient.id}
            type="button"
            onClick={() => onSelect(patient)}
            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#334155] transition-colors flex items-center gap-3 group"
          >
            <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {patient.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium truncate">{patient.name}</div>
              <div className="text-[10px] text-gray-500 flex items-center gap-2">
                {patient.primary_pathology && <span>{patient.primary_pathology}</span>}
                {patient.age && <span>{patient.age} ans</span>}
                {patient.riskScore != null && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
                    patient.riskScore > 60 ? 'bg-red-500/20 text-red-300' :
                    patient.riskScore > 30 ? 'bg-amber-500/20 text-amber-300' :
                    'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    Risque {patient.riskScore}%
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================
// MESSAGE BUBBLE
// ============================================

const MessageBubble: React.FC<{
  message: ChatMessage;
  modeConfig: typeof MODE_CONFIG[AssistantMode];
  patientContext: PatientContext | null;
}> = ({ message, modeConfig, patientContext }) => {
  const isUser = message.role === 'user';
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-in`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
        isUser
          ? 'bg-gradient-to-br from-cyan-500 to-teal-600 shadow-lg shadow-cyan-500/20'
          : `bg-gradient-to-br ${modeConfig.gradient} shadow-lg shadow-purple-500/20`
      }`}>
        {isUser ? <User size={15} className="text-white" /> : <Bot size={15} className="text-white" />}
      </div>

      <div className={`max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gradient-to-br from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-600/15'
            : 'bg-[#1e293b] border border-[#334155] text-gray-300 shadow-lg shadow-black/10'
        }`}>
          {/* Images */}
          {message.images && message.images.length > 0 && (
            <div className={`mb-2 ${message.images.length > 1 ? 'grid grid-cols-2 gap-2' : ''}`}>
              {message.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.preview}
                  alt={img.fileName}
                  className="max-w-full max-h-48 rounded-xl object-contain border border-white/10"
                />
              ))}
              {message.images.length === 1 && (
                <p className="text-xs text-white/60 mt-1">{message.images[0].fileName}</p>
              )}
              {message.images.length > 1 && (
                <p className="text-xs text-white/60 mt-1 col-span-2">{message.images.length} images</p>
              )}
            </div>
          )}

          {isUser ? (
            <p className="text-sm leading-relaxed">{message.content}</p>
          ) : (
            <div className="space-y-0.5">{formatMessage(message.content)}</div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 px-1">
          <span className="text-[10px] text-gray-500">
            {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!isUser && message.content && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                className="text-gray-600 hover:text-cyan-400 transition-colors"
                title="Telecharger"
              >
                <Download size={12} />
              </button>
              {showDownloadMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDownloadMenu(false)} />
                  <div className="absolute left-0 bottom-full mb-1 w-44 bg-[#1e293b] border border-[#334155] rounded-xl shadow-2xl z-50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => { downloadAsText(message.content, message.mode || 'general'); setShowDownloadMenu(false); }}
                      className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-[#334155] transition-colors flex items-center gap-2"
                    >
                      <Download size={12} />
                      Exporter en .txt
                    </button>
                    <button
                      type="button"
                      onClick={() => { generatePDFReport(message, patientContext, message.mode || 'general'); setShowDownloadMenu(false); }}
                      className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-[#334155] transition-colors flex items-center gap-2"
                    >
                      <FileText size={12} />
                      Rapport PDF Medical
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// PATIENT CONTEXT PANEL
// ============================================

const PatientContextPanel: React.FC<{
  onClose: () => void;
  onSave: (ctx: PatientContext) => void;
  initialContext?: PatientContext | null;
}> = ({ onClose, onSave, initialContext }) => {
  const [age, setAge] = useState(initialContext?.patientAge?.toString() || '');
  const [sex, setSex] = useState(initialContext?.patientSex || '');
  const [antecedents, setAntecedents] = useState(initialContext?.antecedents?.join(', ') || '');
  const [medications, setMedications] = useState(initialContext?.currentMedications?.join(', ') || '');
  const [pathology, setPathology] = useState(initialContext?.primaryPathology || '');
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState(initialContext?.patientName || '');

  const handleSelectPatient = (patient: PatientSearchResult) => {
    setSelectedPatientName(patient.name);
    if (patient.age) setAge(patient.age.toString());
    else if (patient.date_of_birth) {
      const dob = new Date(patient.date_of_birth);
      const ageDiff = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (ageDiff > 0) setAge(ageDiff.toString());
    }
    if (patient.gender) setSex(patient.gender === 'male' || patient.gender === 'M' ? 'M' : patient.gender === 'female' || patient.gender === 'F' ? 'F' : '');
    if (patient.primary_pathology) setPathology(patient.primary_pathology);
    setShowPatientSearch(false);
  };

  const handleSave = () => {
    onSave({
      patientName: selectedPatientName || undefined,
      patientAge: age ? parseInt(age) : undefined,
      patientSex: sex || undefined,
      antecedents: antecedents ? antecedents.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      currentMedications: medications ? medications.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      primaryPathology: pathology || undefined,
    });
    onClose();
  };

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-4 space-y-3 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Heart size={14} className="text-rose-400" />
          Contexte Patient
        </h3>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Fermer le contexte patient">
          <X size={16} />
        </button>
      </div>

      {/* Patient search button */}
      <button
        type="button"
        onClick={() => setShowPatientSearch(!showPatientSearch)}
        className="w-full py-2.5 bg-[#0f172a] border border-[#334155] rounded-xl text-sm text-gray-300 hover:border-cyan-500 transition-colors flex items-center justify-center gap-2"
      >
        <UserCheck size={14} className="text-cyan-400" />
        {selectedPatientName || 'Selectionner un patient de la base'}
      </button>

      {showPatientSearch && (
        <PatientSearchSelector
          onSelect={handleSelectPatient}
          onClose={() => setShowPatientSearch(false)}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Age</label>
          <input
            type="number"
            value={age}
            onChange={e => setAge(e.target.value)}
            placeholder="Ex: 45"
            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Sexe</label>
          <select
            value={sex}
            onChange={e => setSex(e.target.value)}
            aria-label="Sexe du patient"
            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none transition-colors"
          >
            <option value="">--</option>
            <option value="M">Masculin</option>
            <option value="F">Feminin</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">Pathologie principale</label>
        <input
          type="text"
          value={pathology}
          onChange={e => setPathology(e.target.value)}
          placeholder="Ex: Hypertension arterielle"
          className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">Antecedents (separes par virgule)</label>
        <input
          type="text"
          value={antecedents}
          onChange={e => setAntecedents(e.target.value)}
          placeholder="HTA, Diabete, BPCO..."
          className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">Traitements en cours (separes par virgule)</label>
        <input
          type="text"
          value={medications}
          onChange={e => setMedications(e.target.value)}
          placeholder="Metformine, Ramipril..."
          className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="w-full py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-xl text-sm font-medium hover:from-cyan-700 hover:to-teal-700 transition-all shadow-lg shadow-cyan-600/20"
      >
        Appliquer le contexte
      </button>
    </div>
  );
};

// ============================================
// MAIN PAGE
// ============================================

const AIAssistantPage: React.FC = () => {
  const {
    messages,
    isLoading,
    mode,
    patientContext,
    sendMessage,
    setMode,
    setPatientContext,
    clearChat,
  } = useAIAssistant();

  const [input, setInput] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [imageAttachments, setImageAttachments] = useState<ImageAttachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentModeConfig = MODE_CONFIG[mode];
  const CurrentModeIcon = currentModeConfig.icon;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(f => ACCEPTED_IMAGE_TYPES.includes(f.type) && f.size <= MAX_IMAGE_SIZE);
    const remaining = MAX_IMAGES - imageAttachments.length;
    const filesToProcess = validFiles.slice(0, remaining);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        setImageAttachments(prev => {
          if (prev.length >= MAX_IMAGES) return prev;
          return [...prev, {
            base64,
            mediaType: file.type as ImageAttachment['mediaType'],
            preview: dataUrl,
            fileName: file.name,
          }];
        });
      };
      reader.readAsDataURL(file);
    });

    if (mode !== 'radiology' && mode !== 'diagnostic') {
      setMode('radiology');
    }
  }, [imageAttachments.length, mode, setMode]);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = '';
  }, [processFiles]);

  const removeImage = (index: number) => {
    setImageAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if ((!input.trim() && imageAttachments.length === 0) || isLoading) return;
    const message = input.trim() || (imageAttachments.length > 0 ? 'Analysez cette image medicale.' : '');
    sendMessage(message, imageAttachments.length > 0 ? imageAttachments : undefined);
    setInput('');
    setImageAttachments([]);
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleQuickPrompt = (prompt: string) => sendMessage(prompt);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  }, [processFiles]);

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden">
      <MedicalSidebarRefined activeItem="ai-assistant" onCollapsedChange={setSidebarCollapsed} />

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Header */}
        <header className="bg-[#1e293b] border-b border-[#334155] px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 ml-12 lg:ml-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${currentModeConfig.gradient} shadow-lg`}>
                <Sparkles size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Assistant IA Medical</h1>
                <p className="text-xs text-gray-400">{currentModeConfig.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {patientContext && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <Heart size={12} className="text-rose-400" />
                  <span className="text-xs text-rose-300 font-medium truncate max-w-[120px]">
                    {patientContext.patientName || `${patientContext.patientAge || '?'}ans ${patientContext.patientSex || ''}`}
                  </span>
                  <button type="button" onClick={() => setPatientContext(null)} className="text-rose-400 hover:text-rose-300 ml-1"><X size={12} /></button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowContext(!showContext)}
                className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all flex items-center gap-1.5 ${
                  showContext || patientContext
                    ? 'bg-rose-600/20 border-rose-500/40 text-rose-300'
                    : 'bg-[#334155] border-[#475569] text-gray-300 hover:border-cyan-500'
                }`}
              >
                <Heart size={14} />
                <span className="hidden sm:inline">Contexte</span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowModeMenu(!showModeMenu)}
                  className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 bg-gradient-to-r ${currentModeConfig.gradient} border-transparent text-white shadow-lg`}
                >
                  <CurrentModeIcon size={14} />
                  <span className="hidden sm:inline">{currentModeConfig.label}</span>
                  <ChevronDown size={12} />
                </button>

                {showModeMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowModeMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-[#1e293b] border border-[#334155] rounded-xl shadow-2xl z-50 overflow-hidden">
                      {(Object.entries(MODE_CONFIG) as [AssistantMode, typeof MODE_CONFIG[AssistantMode]][]).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => { setMode(key); setShowModeMenu(false); }}
                            className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 ${mode === key ? 'bg-[#334155]' : 'hover:bg-[#334155]/50'}`}
                          >
                            <Icon size={16} className={config.color} />
                            <div>
                              <div className="text-sm text-white font-medium">{config.label}</div>
                              <div className="text-[10px] text-gray-500">{config.description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={clearChat}
                className="p-2 rounded-xl bg-[#334155] border border-[#475569] text-gray-400 hover:text-red-400 hover:border-red-500/50 transition-all"
                title="Effacer la conversation"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </header>

        {showContext && (
          <div className="px-4 md:px-6 pt-3">
            <PatientContextPanel
              onClose={() => setShowContext(false)}
              onSave={setPatientContext}
              initialContext={patientContext}
            />
          </div>
        )}

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4 py-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${currentModeConfig.gradient} shadow-2xl mb-6`}>
                <Sparkles size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Assistant IA Medical</h2>
              <p className="text-sm text-gray-400 text-center max-w-md mb-8">
                Posez vos questions medicales, envoyez des images a analyser (radiographies, IRM, scanners),
                et obtenez des recommandations basees sur l'IA. Selectionnez un patient pour personnaliser l'analyse.
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {(Object.entries(MODE_CONFIG) as [AssistantMode, typeof MODE_CONFIG[AssistantMode]][]).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMode(key)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${
                        mode === key
                          ? `bg-gradient-to-r ${config.gradient} border-transparent text-white shadow-lg`
                          : 'bg-[#1e293b] border-[#334155] text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <Icon size={14} />
                      {config.label}
                    </button>
                  );
                })}
              </div>

              <div className="w-full max-w-2xl">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 text-center">Suggestions rapides</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_PROMPTS[mode].map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuickPrompt(prompt)}
                      className="text-left px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-sm text-gray-300 hover:border-cyan-500/50 hover:bg-[#1e293b]/80 transition-all group"
                    >
                      <span className="group-hover:text-cyan-300 transition-colors">{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 px-4 py-3 bg-sky-500/5 border border-sky-500/20 rounded-xl max-w-lg">
                <ImageIcon size={14} className="text-sky-400 flex-shrink-0" />
                <p className="text-xs text-sky-300/80 leading-relaxed">
                  Glissez-deposez jusqu'a {MAX_IMAGES} images medicales ou utilisez le bouton d'upload.
                  Formats: JPEG, PNG, GIF, WebP (max 10 MB chacune).
                </p>
              </div>

              <div className="mt-4 flex items-start gap-2 max-w-lg px-4 py-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300/80 leading-relaxed">
                  Cet outil est une aide a la decision et ne remplace pas le jugement clinique.
                  Toujours verifier les informations et adapter au contexte clinique du patient.
                </p>
              </div>
            </div>
          ) : (
            <div className="px-4 md:px-6 py-4 space-y-4">
              {messages.map(message => (
                <MessageBubble key={message.id} message={message} modeConfig={currentModeConfig} patientContext={patientContext} />
              ))}

              {isLoading && (
                <div className="flex gap-3 animate-in">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br ${currentModeConfig.gradient} shadow-lg`}>
                    <Bot size={15} className="text-white" />
                  </div>
                  <div className="bg-[#1e293b] border border-[#334155] rounded-2xl px-4 py-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 size={14} className="text-violet-400 animate-spin" />
                      <span className="text-sm text-gray-400">
                        {imageAttachments.length > 0 ? 'Analyse des images en cours...' : 'Analyse en cours...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Input Area */}
        <div className="border-t border-[#334155] bg-[#1e293b] px-4 md:px-6 py-3">
          {messages.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
              <button
                type="button"
                onClick={() => setShowContext(!showContext)}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-[#334155] border border-[#475569] text-xs text-gray-400 hover:text-white hover:border-cyan-500/50 transition-all flex items-center gap-1.5"
              >
                <Plus size={12} />
                Contexte patient
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-[#334155] border border-[#475569] text-xs text-gray-400 hover:text-white hover:border-sky-500/50 transition-all flex items-center gap-1.5"
              >
                <ImageIcon size={12} />
                Images ({imageAttachments.length}/{MAX_IMAGES})
              </button>
              {QUICK_PROMPTS[mode].slice(0, 2).map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickPrompt(prompt)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-[#334155] border border-[#475569] text-xs text-gray-400 hover:text-white hover:border-cyan-500/50 transition-all truncate max-w-[200px]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Image previews */}
          {imageAttachments.length > 0 && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {imageAttachments.map((img, idx) => (
                <div key={idx} className="relative flex-shrink-0 group">
                  <img
                    src={img.preview}
                    alt={img.fileName}
                    className="w-16 h-16 rounded-lg object-cover border border-sky-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    aria-label={`Supprimer ${img.fileName}`}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} className="text-white" />
                  </button>
                  <p className="text-[8px] text-gray-500 mt-0.5 w-16 truncate text-center">{img.fileName}</p>
                </div>
              ))}
              {imageAttachments.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Ajouter une image"
                  className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-[#334155] flex items-center justify-center text-gray-500 hover:text-sky-400 hover:border-sky-500/50 transition-colors"
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
          )}

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageAttachments.length >= MAX_IMAGES}
              className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                imageAttachments.length >= MAX_IMAGES
                  ? 'bg-[#334155] text-gray-600 cursor-not-allowed'
                  : 'bg-[#334155] border border-[#475569] text-gray-400 hover:text-sky-400 hover:border-sky-500/50'
              }`}
              title={`Uploader des images (${imageAttachments.length}/${MAX_IMAGES})`}
            >
              <ImageIcon size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              onChange={handleImageSelect}
              multiple
              aria-label="Selectionner des images medicales"
              className="hidden"
            />

            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder={
                  imageAttachments.length > 0
                    ? 'Decrivez ce que vous souhaitez analyser...'
                    : `Posez votre question en mode ${currentModeConfig.label.toLowerCase()}...`
                }
                rows={1}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none"
                style={{ maxHeight: '120px' }}
                disabled={isLoading}
              />
              <div className="absolute right-2 bottom-2 text-[10px] text-gray-600">
                Shift+Enter pour retour a la ligne
              </div>
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={(!input.trim() && imageAttachments.length === 0) || isLoading}
              className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                (input.trim() || imageAttachments.length > 0) && !isLoading
                  ? `bg-gradient-to-r ${currentModeConfig.gradient} text-white shadow-lg hover:shadow-xl hover:scale-105`
                  : 'bg-[#334155] text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
