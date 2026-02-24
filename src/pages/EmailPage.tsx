import React, { useState, useEffect, useCallback, useRef } from 'react';
import MedicalSidebarRefined from '../components/MedicalSidebarRefined';
import { supabase } from '../lib/supabase';
import {
  Mail, Send, Inbox, FileText, Trash2, Plus, X,
  User, RefreshCw, Loader2, AlertCircle,
  CheckCircle2, Clock, ChevronDown, Paperclip, Image, File
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmailRecord {
  id: string;
  to_email: string;
  to_name: string | null;
  subject: string;
  body: string;
  status: 'sent' | 'failed' | 'pending';
  resend_id: string | null;
  template_used: string | null;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

interface ReceivedEmailRecord {
  id: string;
  from_email: string;
  from_name: string | null;
  to_email: string;
  subject: string | null;
  text_body: string | null;
  html_body: string | null;
  reply_to: string | null;
  resend_id: string | null;
  is_read: boolean;
  received_at: string;
}

interface Patient {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  email?: string | null;
}

type TabId = 'composer' | 'envois' | 'modeles' | 'recus';

// ─── Templates ────────────────────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: 'compte-rendu',
    label: 'Compte-rendu de consultation',
    subject: 'Compte-rendu de votre consultation',
    body: `<p>Cher(e) patient(e),</p>
<p>Suite à votre consultation du <strong>[DATE]</strong>, veuillez trouver ci-joint votre compte-rendu médical.</p>
<p>En cas de questions, n'hésitez pas à nous contacter.</p>
<br/>
<p>Cordialement,<br/>Le service médical</p>`,
  },
  {
    id: 'resultats',
    label: "Résultats d'analyse",
    subject: "Vos résultats d'analyse sont disponibles",
    body: `<p>Cher(e) patient(e),</p>
<p>Nous vous informons que vos résultats d'analyse sont désormais disponibles.</p>
<p>Vous pouvez les récupérer directement au cabinet ou prendre rendez-vous pour en discuter avec le médecin.</p>
<br/>
<p>Cordialement,<br/>Le service médical</p>`,
  },
  {
    id: 'rappel-rdv',
    label: 'Rappel de rendez-vous',
    subject: 'Rappel de votre rendez-vous médical',
    body: `<p>Cher(e) patient(e),</p>
<p>Nous vous rappelons votre rendez-vous prévu le <strong>[DATE]</strong> à <strong>[HEURE]</strong>.</p>
<p>En cas d'empêchement, merci de nous prévenir au moins 24h à l'avance.</p>
<br/>
<p>Cordialement,<br/>Le service médical</p>`,
  },
  {
    id: 'ordonnance',
    label: 'Ordonnance / Renouvellement',
    subject: 'Votre ordonnance médicale',
    body: `<p>Cher(e) patient(e),</p>
<p>Votre ordonnance médicale a été préparée. Vous pouvez la récupérer au cabinet pendant les heures d'ouverture.</p>
<br/>
<p>Cordialement,<br/>Le service médical</p>`,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const EmailPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('composer');

  // Composer state
  const [toEmail, setToEmail] = useState('');
  const [toName, setToName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Attachments
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Patient autocomplete
  const [patientSearch, setPatientSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // Sent emails
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [emailsError, setEmailsError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Received emails
  const [receivedEmails, setReceivedEmails] = useState<ReceivedEmailRecord[]>([]);
  const [receivedLoading, setReceivedLoading] = useState(false);
  const [receivedError, setReceivedError] = useState<string | null>(null);
  const [deletingReceivedId, setDeletingReceivedId] = useState<string | null>(null);
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);
  const unreadCount = receivedEmails.filter((e) => !e.is_read).length;

  // ── Patient search ───────────────────────────────────────────────────────
  useEffect(() => {
    if (patientSearch.length < 2) {
      setPatients([]);
      setShowPatientDropdown(false);
      return;
    }
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from('patients')
        .select('id, name, first_name, last_name, email')
        .or(
          `name.ilike.%${patientSearch}%,first_name.ilike.%${patientSearch}%,last_name.ilike.%${patientSearch}%`
        )
        .not('email', 'is', null)
        .limit(8);
      setPatients(data || []);
      setShowPatientDropdown(true);
    }, 300);
    return () => clearTimeout(timeout);
  }, [patientSearch]);

  const selectPatient = (patient: Patient) => {
    setToEmail(patient.email || '');
    const displayName = patient.last_name
      ? `${patient.last_name} ${patient.first_name || ''}`.trim()
      : patient.name;
    setToName(displayName);
    setPatientSearch(displayName);
    setShowPatientDropdown(false);
  };

  // ── Template ─────────────────────────────────────────────────────────────
  const applyTemplate = (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      setSelectedTemplate('');
      return;
    }
    setSelectedTemplate(templateId);
    setSubject(template.subject);
    setBody(template.body);
  };

  // ── Attachments ──────────────────────────────────────────────────────────
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentError(null);
    const selected = Array.from(e.target.files || []);
    const oversized = selected.find((f) => f.size > MAX_FILE_SIZE);
    if (oversized) {
      setAttachmentError(`"${oversized.name}" dépasse la limite de 10 MB.`);
      e.target.value = '';
      return;
    }
    setAttachments((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      const newFiles = selected.filter((f) => !existing.has(f.name));
      const combined = [...prev, ...newFiles].slice(0, 10);
      return combined;
    });
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const fileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image size={14} className="text-blue-400 shrink-0" />;
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf'))
      return <FileText size={14} className="text-red-400 shrink-0" />;
    return <File size={14} className="text-gray-400 shrink-0" />;
  };

  // ── Send ─────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!toEmail || !subject || !body) return;
    setSending(true);
    setSendResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

      // Convert attachments to base64
      const attachmentsPayload = attachments.length > 0
        ? await Promise.all(
            attachments.map(async (f) => ({
              filename: f.name,
              content: await fileToBase64(f),
              type: f.type || 'application/octet-stream',
            }))
          )
        : undefined;

      const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY as string,
        },
        body: JSON.stringify({
          to: toEmail,
          toName: toName || undefined,
          subject,
          body,
          templateUsed: selectedTemplate || undefined,
          ...(attachmentsPayload ? { attachments: attachmentsPayload } : {}),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSendResult({ type: 'success', message: 'Email envoyé avec succès !' });
        setToEmail('');
        setToName('');
        setPatientSearch('');
        setSubject('');
        setBody('');
        setSelectedTemplate('');
        setAttachments([]);
        setAttachmentError(null);
        fetchEmails();
      } else {
        setSendResult({ type: 'error', message: result.error || "Erreur lors de l'envoi" });
      }
    } catch {
      setSendResult({ type: 'error', message: 'Erreur réseau ou serveur' });
    } finally {
      setSending(false);
    }
  };

  // ── Fetch emails ─────────────────────────────────────────────────────────
  const fetchEmails = useCallback(async () => {
    setEmailsLoading(true);
    setEmailsError(null);
    try {
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      setEmails(data || []);
    } catch (err: unknown) {
      setEmailsError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setEmailsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'envois') fetchEmails();
  }, [activeTab, fetchEmails]);

  // ── Fetch received emails ─────────────────────────────────────────────────
  const fetchReceivedEmails = useCallback(async () => {
    setReceivedLoading(true);
    setReceivedError(null);
    try {
      const { data, error } = await supabase
        .from('received_emails')
        .select('*')
        .order('received_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      setReceivedEmails(data || []);
    } catch (err: unknown) {
      setReceivedError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setReceivedLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'recus') fetchReceivedEmails();
  }, [activeTab, fetchReceivedEmails]);

  const handleDeleteReceived = async (id: string) => {
    setDeletingReceivedId(id);
    const { error } = await supabase.from('received_emails').delete().eq('id', id);
    if (!error) {
      setReceivedEmails((prev) => prev.filter((e) => e.id !== id));
      if (expandedEmailId === id) setExpandedEmailId(null);
    }
    setDeletingReceivedId(null);
  };

  const markAsRead = async (id: string) => {
    await supabase.from('received_emails').update({ is_read: true }).eq('id', id);
    setReceivedEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, is_read: true } : e))
    );
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from('emails').delete().eq('id', id);
    if (!error) setEmails((prev) => prev.filter((e) => e.id !== id));
    setDeletingId(null);
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const statusBadge = (status: EmailRecord['status']) => {
    if (status === 'sent')
      return (
        <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full whitespace-nowrap">
          <CheckCircle2 size={11} /> Envoyé
        </span>
      );
    if (status === 'failed')
      return (
        <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-red-500/15 text-red-400 rounded-full whitespace-nowrap">
          <AlertCircle size={11} /> Échoué
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-yellow-500/15 text-yellow-400 rounded-full whitespace-nowrap">
        <Clock size={11} /> En attente
      </span>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <MedicalSidebarRefined activeItem="email" onCollapsedChange={setSidebarCollapsed} />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Header */}
        <header className="bg-[#1e293b] border-b border-[#334155]/50 px-4 lg:px-8 py-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 ml-14 lg:ml-0">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Mail size={20} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white">Messagerie Email</h1>
              <p className="text-gray-400 text-sm">Composer et gérer vos emails médicaux</p>
            </div>
          </div>
        </header>

        {/* Tab bar */}
        <div className="bg-[#1e293b]/80 border-b border-[#334155]/50 px-4 lg:px-8">
          <div className="flex">
            {(
              [
                { id: 'composer', label: 'Composer', icon: <Plus size={15} /> },
                { id: 'envois', label: 'Envois', icon: <Send size={15} /> },
                { id: 'recus', label: 'Reçus', icon: <Inbox size={15} />, badge: unreadCount },
                { id: 'modeles', label: 'Modèles', icon: <FileText size={15} /> },
              ] as { id: TabId; label: string; icon: React.ReactNode; badge?: number }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.badge != null && tab.badge > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-cyan-500 text-white rounded-full leading-none">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">

            {/* ══ COMPOSER ══ */}
            {activeTab === 'composer' && (
              <div className="space-y-5">

                {/* Result banner */}
                {sendResult && (
                  <div
                    className={`flex items-start gap-3 p-4 rounded-xl border ${
                      sendResult.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}
                  >
                    {sendResult.type === 'success' ? (
                      <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    )}
                    <span className="text-sm flex-1">{sendResult.message}</span>
                    <button type="button" title="Fermer" onClick={() => setSendResult(null)}>
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Compose card */}
                <div className="bg-[#1e293b] border border-[#334155]/50 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#334155]/50 flex items-center gap-2">
                    <Mail size={18} className="text-cyan-400" />
                    <span className="text-white font-semibold">Nouveau message</span>
                  </div>

                  <div className="p-5 space-y-4">

                    {/* Template */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Modèle <span className="text-gray-500 font-normal">(optionnel)</span>
                      </label>
                      <div className="relative">
                        <select
                          value={selectedTemplate}
                          onChange={(e) => applyTemplate(e.target.value)}
                          aria-label="Sélectionner un modèle"
                          className="w-full px-3 py-2.5 pr-8 text-sm bg-[#0f172a] border border-[#334155] rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none transition cursor-pointer"
                        >
                          <option value="">— Aucun modèle (message libre) —</option>
                          {TEMPLATES.map((t) => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* To field */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Destinataire <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={patientSearch}
                          onChange={(e) => {
                            setPatientSearch(e.target.value);
                            setToEmail(e.target.value);
                            setToName('');
                          }}
                          onFocus={() => patientSearch.length >= 2 && setShowPatientDropdown(true)}
                          onBlur={() => setTimeout(() => setShowPatientDropdown(false), 150)}
                          placeholder="Nom du patient ou adresse email"
                          className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#0f172a] border border-[#334155] rounded-xl text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition"
                        />
                      </div>

                      {/* Patient dropdown */}
                      {showPatientDropdown && patients.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-[#1e293b] border border-[#334155] rounded-xl shadow-2xl overflow-hidden">
                          {patients.map((p) => {
                            const displayName = p.last_name
                              ? `${p.last_name.toUpperCase()} ${p.first_name || ''}`.trim()
                              : p.name;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onMouseDown={() => selectPatient(p)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#334155]/50 transition-colors text-left"
                              >
                                <div className="w-7 h-7 rounded-full bg-cyan-600/30 flex items-center justify-center text-cyan-400 text-xs font-bold shrink-0">
                                  {displayName.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm text-white font-medium truncate">{displayName}</p>
                                  <p className="text-xs text-gray-400 truncate">{p.email}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Show resolved email when patient selected */}
                      {toName && toEmail !== patientSearch && (
                        <p className="text-xs text-cyan-400 mt-1 ml-1 flex items-center gap-1">
                          <Mail size={11} /> {toEmail}
                        </p>
                      )}
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Objet <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Objet de l'email"
                        className="w-full px-3 py-2.5 text-sm bg-[#0f172a] border border-[#334155] rounded-xl text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition"
                      />
                    </div>

                    {/* Body */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">
                        Message <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={10}
                        placeholder="Rédigez votre message ici… (HTML accepté)"
                        className="w-full px-3 py-2.5 text-sm bg-[#0f172a] border border-[#334155] rounded-xl text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition resize-y"
                      />
                    </div>

                    {/* Attachments */}
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
                        className="hidden"
                        title="Sélectionner des pièces jointes"
                        aria-label="Sélectionner des pièces jointes"
                        onChange={handleFilesChange}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-cyan-400 border border-dashed border-[#334155] hover:border-cyan-500/50 rounded-xl transition-colors w-full justify-center"
                      >
                        <Paperclip size={15} />
                        Ajouter une pièce jointe
                        <span className="text-xs text-gray-600">(PDF, image, doc — max 10 MB)</span>
                      </button>

                      {attachmentError && (
                        <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1.5 ml-1">
                          <AlertCircle size={12} /> {attachmentError}
                        </p>
                      )}

                      {attachments.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {attachments.map((file, i) => (
                            <div
                              key={`${file.name}-${i}`}
                              className="flex items-center gap-2 px-3 py-2 bg-[#0f172a] border border-[#334155]/60 rounded-lg"
                            >
                              {fileIcon(file)}
                              <span className="text-sm text-gray-300 truncate flex-1">{file.name}</span>
                              <span className="text-xs text-gray-500 shrink-0">{formatBytes(file.size)}</span>
                              <button
                                type="button"
                                onClick={() => removeAttachment(i)}
                                className="p-0.5 text-gray-500 hover:text-red-400 transition-colors rounded"
                                title="Supprimer"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Send button */}
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={sending || !toEmail || !subject || !body}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-sm font-semibold rounded-xl hover:from-cyan-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-cyan-600/20"
                      >
                        {sending ? (
                          <><Loader2 size={16} className="animate-spin" /> Envoi en cours…</>
                        ) : (
                          <><Send size={16} /> Envoyer</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ ENVOIS ══ */}
            {activeTab === 'envois' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-semibold">Historique des envois</h2>
                  <button
                    type="button"
                    onClick={fetchEmails}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    <RefreshCw size={14} className={emailsLoading ? 'animate-spin' : ''} />
                    Actualiser
                  </button>
                </div>

                {emailsError && (
                  <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    <AlertCircle size={18} className="shrink-0" />
                    {emailsError}
                  </div>
                )}

                <div className="bg-[#1e293b] border border-[#334155]/50 rounded-2xl overflow-hidden">
                  {emailsLoading ? (
                    <div className="p-4 space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-[#0f172a] rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : emails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                      <Inbox size={36} className="mb-3 opacity-30" />
                      <p className="text-sm">Aucun email envoyé pour l'instant</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {emails.map((email) => (
                        <div
                          key={email.id}
                          className="flex items-start gap-4 px-5 py-4 hover:bg-white/5 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-full bg-cyan-600/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                            <Mail size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-white text-sm font-medium truncate">
                                {email.to_name || email.to_email}
                              </p>
                              {statusBadge(email.status)}
                              {email.template_used && (
                                <span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full">
                                  {TEMPLATES.find((t) => t.id === email.template_used)?.label || email.template_used}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-300 text-sm mt-0.5 truncate">{email.subject}</p>
                            <div className="flex items-center gap-3 mt-1">
                              {email.to_name && (
                                <>
                                  <p className="text-gray-500 text-xs">{email.to_email}</p>
                                  <span className="text-gray-600 text-xs">•</span>
                                </>
                              )}
                              <p className="text-gray-500 text-xs">{formatDate(email.created_at)}</p>
                            </div>
                            {email.error_message && (
                              <p className="text-red-400 text-xs mt-1 truncate">{email.error_message}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDelete(email.id)}
                            disabled={deletingId === email.id}
                            className="p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10 shrink-0"
                            title="Supprimer"
                          >
                            {deletingId === email.id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══ REÇUS ══ */}
            {activeTab === 'recus' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-white font-semibold">Boîte de réception</h2>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-cyan-500/20 text-cyan-400 rounded-full">
                        {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={fetchReceivedEmails}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                  >
                    <RefreshCw size={14} className={receivedLoading ? 'animate-spin' : ''} />
                    Actualiser
                  </button>
                </div>

                {receivedError && (
                  <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    <AlertCircle size={18} className="shrink-0" />
                    {receivedError}
                  </div>
                )}

                <div className="bg-[#1e293b] border border-[#334155]/50 rounded-2xl overflow-hidden">
                  {receivedLoading ? (
                    <div className="p-4 space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-[#0f172a] rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : receivedEmails.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                      <Inbox size={36} className="mb-3 opacity-30" />
                      <p className="text-sm">Aucun email reçu pour l'instant</p>
                      <p className="text-xs mt-1 text-gray-600">Les réponses de vos patients apparaîtront ici</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {receivedEmails.map((email) => {
                        const isExpanded = expandedEmailId === email.id;
                        const senderLabel = email.from_name
                          ? `${email.from_name} <${email.from_email}>`
                          : email.from_email;
                        const initials = (email.from_name || email.from_email)
                          .slice(0, 2)
                          .toUpperCase();

                        return (
                          <div key={email.id} className="group">
                            {/* Row */}
                            <div
                              onClick={() => {
                                if (!isExpanded) markAsRead(email.id);
                                setExpandedEmailId(isExpanded ? null : email.id);
                              }}
                              className={`flex items-start gap-4 px-5 py-4 hover:bg-white/5 transition-colors cursor-pointer ${
                                !email.is_read ? 'bg-cyan-500/5' : ''
                              }`}
                            >
                              {/* Avatar */}
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                                !email.is_read
                                  ? 'bg-cyan-600/30 text-cyan-400'
                                  : 'bg-[#334155]/50 text-gray-400'
                              }`}>
                                {initials}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className={`text-sm font-medium truncate ${!email.is_read ? 'text-white' : 'text-gray-300'}`}>
                                    {senderLabel}
                                  </p>
                                  {!email.is_read && (
                                    <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
                                  )}
                                </div>
                                <p className={`text-sm mt-0.5 truncate ${!email.is_read ? 'text-gray-200 font-medium' : 'text-gray-400'}`}>
                                  {email.subject || '(sans objet)'}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-gray-500 text-xs">{formatDate(email.received_at)}</p>
                                  {!isExpanded && email.text_body && (
                                    <>
                                      <span className="text-gray-600 text-xs">•</span>
                                      <p className="text-gray-600 text-xs truncate max-w-xs">
                                        {email.text_body.slice(0, 80)}
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteReceived(email.id);
                                }}
                                disabled={deletingReceivedId === email.id}
                                className="p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10 shrink-0"
                                title="Supprimer"
                              >
                                {deletingReceivedId === email.id ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : (
                                  <Trash2 size={15} />
                                )}
                              </button>
                            </div>

                            {/* Expanded content */}
                            {isExpanded && (
                              <div className="px-5 pb-5 border-t border-white/5 bg-[#0f172a]/50">
                                {/* Meta */}
                                <div className="py-3 text-xs text-gray-500 space-y-1">
                                  <p><span className="text-gray-400">De :</span> {senderLabel}</p>
                                  <p><span className="text-gray-400">À :</span> {email.to_email}</p>
                                  {email.reply_to && (
                                    <p><span className="text-gray-400">Répondre à :</span> {email.reply_to}</p>
                                  )}
                                </div>
                                {/* Body */}
                                <div className="mt-2 border border-[#334155]/50 rounded-xl overflow-hidden">
                                  {email.html_body ? (
                                    <iframe
                                      srcDoc={email.html_body}
                                      title="Email content"
                                      className="w-full min-h-48 bg-white rounded-xl border-0"
                                      sandbox="allow-same-origin"
                                      onLoad={(e) => {
                                        const iframe = e.currentTarget;
                                        const h = iframe.contentDocument?.documentElement?.scrollHeight;
                                        if (h) iframe.style.height = `${Math.min(h + 16, 600)}px`;
                                      }}
                                    />
                                  ) : (
                                    <pre className="p-4 text-sm text-gray-300 whitespace-pre-wrap font-sans">
                                      {email.text_body || '(message vide)'}
                                    </pre>
                                  )}
                                </div>
                                {/* Reply button */}
                                <div className="mt-3 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setToEmail(email.from_email);
                                      setToName(email.from_name || '');
                                      setPatientSearch(email.from_name || email.from_email);
                                      setSubject(
                                        email.subject
                                          ? (email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`)
                                          : 'Re: '
                                      );
                                      setBody('');
                                      setActiveTab('composer');
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-cyan-400 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/10 transition-colors"
                                  >
                                    <Send size={13} />
                                    Répondre
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══ MODELES ══ */}
            {activeTab === 'modeles' && (
              <div className="space-y-4">
                <h2 className="text-white font-semibold">Modèles d'emails</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className="bg-[#1e293b] border border-[#334155]/50 rounded-2xl p-5 space-y-3 hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-cyan-400 shrink-0" />
                        <h3 className="text-white text-sm font-semibold">{template.label}</h3>
                      </div>
                      <p className="text-xs text-gray-400">
                        <span className="font-medium text-gray-300">Objet : </span>
                        {template.subject}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-3">
                        {template.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          applyTemplate(template.id);
                          setActiveTab('composer');
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-cyan-400 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/10 transition-colors"
                      >
                        <Plus size={14} />
                        Utiliser ce modèle
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default EmailPage;
