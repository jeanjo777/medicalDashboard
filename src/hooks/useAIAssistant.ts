import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import logger from '../utils/logger';

// ============================================
// TYPES
// ============================================

export interface ImageAttachment {
  base64: string;
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
  preview: string;
  fileName: string;
}

export interface ThinkingBlock {
  text: string;
  isComplete: boolean;
}

export interface ToolExecution {
  tool: string;
  input?: Record<string, unknown>;
  result?: string;
  status: 'calling' | 'complete' | 'error';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode?: string;
  images?: ImageAttachment[];
  thinking?: ThinkingBlock;
  toolExecutions?: ToolExecution[];
  isStreaming?: boolean;
}

export type AssistantMode = 'diagnostic' | 'treatment' | 'literature' | 'general' | 'radiology' | 'pharmacology';

export interface AppointmentInfo {
  date: string;
  time: string;
  type: string;
  motif: string;
  status: string;
}

export interface PatientContext {
  patientId?: string;
  patientName?: string;
  patientAge?: number;
  patientSex?: string;
  antecedents?: string[];
  currentMedications?: string[];
  primaryPathology?: string;
  riskScore?: number;
  appointments?: AppointmentInfo[];
  medicalHistory?: string;
  allergies?: string;
  bloodType?: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  patientName?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UseAIAssistantReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  mode: AssistantMode;
  patientContext: PatientContext | null;
  currentConsultationId: string | null;
  conversations: ConversationSummary[];
  conversationsLoading: boolean;
  sendMessage: (message: string, images?: ImageAttachment[]) => Promise<void>;
  setMode: (mode: AssistantMode) => void;
  setPatientContext: (context: PatientContext | null) => void;
  clearChat: () => void;
  clearError: () => void;
  loadConversations: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  newConversation: () => void;
  cancelStream: () => void;
}

// ============================================
// HOOK
// ============================================

const SESSION_KEY_CONSULTATION = 'ai_assistant_consultation_id';
const SESSION_KEY_MODE = 'ai_assistant_mode';
const SESSION_KEY_MESSAGES = 'ai_assistant_messages';

// Helpers to persist/restore messages in localStorage
function saveMessagesToStorage(msgs: ChatMessage[]) {
  try {
    const serializable = msgs
      .filter(m => !m.isStreaming)
      .map(m => ({ id: m.id, role: m.role, content: m.content, timestamp: m.timestamp, mode: m.mode }));
    localStorage.setItem(SESSION_KEY_MESSAGES, JSON.stringify(serializable));
  } catch { /* quota exceeded or other error */ }
}

function loadMessagesFromStorage(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(SESSION_KEY_MESSAGES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch { return []; }
}

export function useAIAssistant(): UseAIAssistantReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadMessagesFromStorage());
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setModeState] = useState<AssistantMode>(
    () => (localStorage.getItem(SESSION_KEY_MODE) as AssistantMode) || 'general'
  );
  const [patientContext, setPatientContext] = useState<PatientContext | null>(null);
  const [currentConsultationId, setCurrentConsultationId] = useState<string | null>(
    () => localStorage.getItem(SESSION_KEY_CONSULTATION)
  );
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const messageIdCounter = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initialLoadDone = useRef(false);

  const generateId = () => {
    messageIdCounter.current += 1;
    return `msg-${Date.now()}-${messageIdCounter.current}`;
  };

  // Persist mode to localStorage
  const setMode = useCallback((newMode: AssistantMode) => {
    setModeState(newMode);
    localStorage.setItem(SESSION_KEY_MODE, newMode);
  }, []);

  // Persist consultationId to localStorage when it changes
  useEffect(() => {
    if (currentConsultationId) {
      localStorage.setItem(SESSION_KEY_CONSULTATION, currentConsultationId);
    } else {
      localStorage.removeItem(SESSION_KEY_CONSULTATION);
    }
  }, [currentConsultationId]);

  // Persist messages to localStorage whenever they change (skip streaming messages)
  useEffect(() => {
    if (messages.length > 0 && !messages.some(m => m.isStreaming)) {
      saveMessagesToStorage(messages);
    }
  }, [messages]);

  // ============================================
  // CONVERSATION MANAGEMENT (DB)
  // ============================================

  const loadConversations = useCallback(async () => {
    setConversationsLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('consultations')
        .select('id, symptoms, status, patient_id, created_at, updated_at')
        .order('updated_at', { ascending: false })
        .limit(50);

      if (err || !data) {
        setConversationsLoading(false);
        return;
      }

      const patientIds = [...new Set(data.filter(c => c.patient_id).map(c => c.patient_id))];
      let patientMap: Record<string, string> = {};

      if (patientIds.length > 0) {
        const { data: patients } = await supabase
          .from('patients')
          .select('id, name')
          .in('id', patientIds);
        if (patients) {
          patientMap = Object.fromEntries(patients.map(p => [p.id, p.name]));
        }
      }

      setConversations(data.map(c => ({
        id: c.id,
        title: c.symptoms || 'Conversation sans titre',
        patientName: c.patient_id ? patientMap[c.patient_id] : undefined,
        status: c.status,
        createdAt: new Date(c.created_at),
        updatedAt: new Date(c.updated_at),
      })));
    } catch (err) {
      logger.error('Failed to load conversations', err as Error);
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  const loadConversation = useCallback(async (consultationId: string) => {
    try {
      const { data: consultation } = await supabase
        .from('consultations')
        .select('id, patient_id, symptoms, status')
        .eq('id', consultationId)
        .single();

      const { data: msgData, error: msgErr } = await supabase
        .from('consultation_messages')
        .select('id, sender, message, metadata, created_at')
        .eq('consultation_id', consultationId)
        .order('created_at', { ascending: true });

      if (!msgErr && msgData) {
        const loadedMessages: ChatMessage[] = msgData.map(m => ({
          id: m.id,
          role: m.sender === 'ai' ? 'assistant' as const : 'user' as const,
          content: m.message,
          timestamp: new Date(m.created_at),
          mode: m.metadata?.mode,
        }));

        setMessages(loadedMessages);
        setCurrentConsultationId(consultationId);

        const lastMeta = msgData[msgData.length - 1]?.metadata;
        if (lastMeta?.mode) {
          setMode(lastMeta.mode as AssistantMode);
        }
      }

      if (consultation?.patient_id) {
        const { data: patient } = await supabase
          .from('patients')
          .select('id, name, age, gender, primary_pathology, riskScore, medical_history, allergies, blood_type')
          .eq('id', consultation.patient_id)
          .single();

        if (patient) {
          const { data: appointments } = await supabase
            .from('appointments')
            .select('appointment_date, appointment_time, type_consultation, motif, status')
            .eq('patient_id', patient.id)
            .order('appointment_date', { ascending: false })
            .limit(10);

          setPatientContext({
            patientId: patient.id,
            patientName: patient.name,
            patientAge: patient.age,
            patientSex: patient.gender,
            primaryPathology: patient.primary_pathology,
            riskScore: patient.riskScore,
            medicalHistory: patient.medical_history || undefined,
            allergies: patient.allergies || undefined,
            bloodType: patient.blood_type || undefined,
            appointments: appointments?.map(a => ({
              date: a.appointment_date,
              time: a.appointment_time,
              type: a.type_consultation || '',
              motif: a.motif || '',
              status: a.status || '',
            })),
          });
        }
      } else {
        setPatientContext(null);
      }
    } catch (err) {
      logger.error('Failed to load conversation', err as Error);
    }
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    // Optimistic update - remove from UI immediately
    setConversations(prev => prev.filter(c => c.id !== id));

    if (currentConsultationId === id) {
      setMessages([]);
      setCurrentConsultationId(null);
      localStorage.removeItem(SESSION_KEY_CONSULTATION);
      localStorage.removeItem(SESSION_KEY_MESSAGES);
      setError(null);
    }

    try {
      // Use RPC function (SECURITY DEFINER) to bypass RLS
      const { error: err } = await supabase.rpc('delete_consultation', {
        consultation_id_param: id,
      });

      if (err) {
        logger.error('RPC delete failed:', err);
        // Resync if DB delete failed
        loadConversations();
      }
    } catch (err) {
      logger.error('Failed to delete conversation', err as Error);
      loadConversations();
    }
  }, [currentConsultationId, loadConversations]);

  const newConversation = useCallback(() => {
    setMessages([]);
    setCurrentConsultationId(null);
    localStorage.removeItem(SESSION_KEY_CONSULTATION);
    localStorage.removeItem(SESSION_KEY_MESSAGES);
    setError(null);
  }, []);

  // Load conversations + auto-restore active conversation on mount
  useEffect(() => {
    loadConversations();
    if (!initialLoadDone.current && currentConsultationId) {
      initialLoadDone.current = true;
      loadConversation(currentConsultationId);
    } else {
      initialLoadDone.current = true;
    }
  }, [loadConversations, loadConversation, currentConsultationId]);

  // ============================================
  // SSE EVENT HANDLER
  // ============================================

  const handleSSEEvent = useCallback((messageId: string, event: string, data: any) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;

      switch (event) {
        case 'thinking_start':
          return { ...m, thinking: { text: '', isComplete: false } };
        case 'thinking':
          return { ...m, thinking: { text: (m.thinking?.text || '') + data.text, isComplete: false } };
        case 'text':
          return { ...m, content: m.content + data.text };
        case 'tool_use':
          return {
            ...m,
            toolExecutions: [
              ...(m.toolExecutions || []),
              { tool: data.tool, status: 'calling' as const },
            ],
          };
        case 'tool_result':
          return {
            ...m,
            toolExecutions: (m.toolExecutions || []).map(t =>
              t.tool === data.tool && t.status === 'calling'
                ? { ...t, result: data.result, status: 'complete' as const }
                : t
            ),
          };
        case 'done':
          return {
            ...m,
            isStreaming: false,
            thinking: m.thinking ? { ...m.thinking, isComplete: true } : undefined,
          };
        case 'error':
          return {
            ...m,
            content: m.content || `Erreur: ${data.error}`,
            isStreaming: false,
          };
        default:
          return m;
      }
    }));
  }, []);

  // ============================================
  // CANCEL STREAM
  // ============================================

  const cancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
    setIsLoading(false);
    setMessages(prev => prev.map(m =>
      m.isStreaming ? { ...m, isStreaming: false } : m
    ));
  }, []);

  // ============================================
  // SEND MESSAGE (STREAMING)
  // ============================================

  const sendMessage = useCallback(async (message: string, images?: ImageAttachment[]) => {
    if ((!message.trim() && (!images || images.length === 0)) || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
      mode,
      images,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    let consultationId = currentConsultationId;

    try {
      // Create consultation on first message
      if (!consultationId) {
        const insertData: Record<string, unknown> = {
          symptoms: message.trim().substring(0, 500),
          status: 'pending',
        };
        if (patientContext?.patientId) {
          insertData.patient_id = patientContext.patientId;
        }
        const { data: newConsultation, error: createErr } = await supabase
          .from('consultations')
          .insert(insertData)
          .select('id')
          .single();

        if (!createErr && newConsultation) {
          consultationId = newConsultation.id;
          setCurrentConsultationId(consultationId);
        }
      }

      // Build API request body
      const history = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Get doctor name from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const doctorName = userData?.prenom && userData?.nom
        ? `Dr. ${userData.prenom} ${userData.nom}`
        : userData?.username ? `Dr. ${userData.username}` : 'Dr. Simplice Achi AKE';

      const body: Record<string, unknown> = {
        message: message.trim(),
        history,
        context: patientContext || undefined,
        mode,
        stream: true,
        doctorName,
      };

      if (images && images.length > 0) {
        body.images = images.map(img => ({
          base64: img.base64,
          mediaType: img.mediaType,
        }));
        body.image = {
          base64: images[0].base64,
          mediaType: images[0].mediaType,
        };
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Create abort controller for cancellation
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Create placeholder assistant message for streaming
      const assistantMessageId = generateId();
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        mode,
        isStreaming: true,
        thinking: undefined,
        toolExecutions: [],
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsStreaming(true);

      const res = await fetch(`${supabaseUrl}/functions/v1/ai-doctor-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify(body),
        signal: abortController.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur serveur (${res.status})`);
      }

      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream')) {
        // ===== STREAMING SSE RESPONSE =====
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullResponse = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          let currentEvent = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith('data: ') && currentEvent) {
              try {
                const data = JSON.parse(line.slice(6));
                handleSSEEvent(assistantMessageId, currentEvent, data);

                if (currentEvent === 'text') {
                  fullResponse += data.text;
                }
                if (currentEvent === 'done' && data.full_response) {
                  fullResponse = data.full_response;
                }
              } catch {
                // Skip invalid JSON lines
              }
              currentEvent = '';
            }
          }
        }

        // Persist to DB
        if (consultationId && fullResponse) {
          await supabase.from('consultation_messages').insert({
            consultation_id: consultationId,
            sender: 'user',
            message: message.trim(),
            metadata: { mode, hasImages: !!(images && images.length > 0) },
          });
          await supabase.from('consultation_messages').insert({
            consultation_id: consultationId,
            sender: 'ai',
            message: fullResponse,
            metadata: { mode, model: 'claude-opus-4-6', streaming: true },
          });
          await supabase.from('consultations').update({
            status: 'ai_analyzed',
            ai_response: fullResponse.substring(0, 1000),
          }).eq('id', consultationId);

          loadConversations();
        }
      } else {
        // ===== NON-STREAMING JSON FALLBACK =====
        const data = await res.json();

        if (data.success) {
          setMessages(prev => prev.map(m =>
            m.id === assistantMessageId
              ? { ...m, content: data.response, isStreaming: false }
              : m
          ));

          if (consultationId) {
            await supabase.from('consultation_messages').insert({
              consultation_id: consultationId,
              sender: 'user',
              message: message.trim(),
              metadata: { mode, hasImages: !!(images && images.length > 0) },
            });
            await supabase.from('consultation_messages').insert({
              consultation_id: consultationId,
              sender: 'ai',
              message: data.response,
              metadata: { mode: data.mode },
            });
            await supabase.from('consultations').update({
              status: 'ai_analyzed',
              ai_response: data.response.substring(0, 1000),
            }).eq('id', consultationId);

            loadConversations();
          }
        } else {
          throw new Error('Reponse invalide du serveur');
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        // User cancelled - don't show error
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Erreur de communication avec l\'assistant IA';
      logger.error('AI Assistant error', err as Error);
      setError(errorMessage);

      // Update the streaming message with error or add error message
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.isStreaming) {
          return prev.map(m =>
            m.isStreaming
              ? { ...m, content: m.content || `Desole, une erreur est survenue: ${errorMessage}. Veuillez reessayer.`, isStreaming: false }
              : m
          );
        }
        return [...prev, {
          id: generateId(),
          role: 'assistant' as const,
          content: `Desole, une erreur est survenue: ${errorMessage}. Veuillez reessayer.`,
          timestamp: new Date(),
        }];
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [messages, isLoading, mode, patientContext, currentConsultationId, loadConversations, handleSSEEvent]);

  const clearChat = useCallback(() => {
    cancelStream();
    setMessages([]);
    setCurrentConsultationId(null);
    localStorage.removeItem(SESSION_KEY_MESSAGES);
    localStorage.removeItem(SESSION_KEY_CONSULTATION);
    setError(null);
  }, [cancelStream]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    mode,
    patientContext,
    currentConsultationId,
    conversations,
    conversationsLoading,
    sendMessage,
    setMode,
    setPatientContext,
    clearChat,
    clearError,
    loadConversations,
    loadConversation,
    deleteConversation,
    newConversation,
    cancelStream,
  };
}
