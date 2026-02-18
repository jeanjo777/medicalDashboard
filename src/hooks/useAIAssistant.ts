import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import logger from '../utils/logger';

export interface ImageAttachment {
  base64: string;
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
  preview: string;
  fileName: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode?: string;
  images?: ImageAttachment[];
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
  newConversation: () => void;
}

export function useAIAssistant(): UseAIAssistantReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AssistantMode>('general');
  const [patientContext, setPatientContext] = useState<PatientContext | null>(null);
  const [currentConsultationId, setCurrentConsultationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const messageIdCounter = useRef(0);

  const generateId = () => {
    messageIdCounter.current += 1;
    return `msg-${Date.now()}-${messageIdCounter.current}`;
  };

  // Load conversation list from DB
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

      // Get patient names for conversations with patient_id
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

  // Load a specific conversation from DB
  const loadConversation = useCallback(async (consultationId: string) => {
    try {
      // Load consultation details
      const { data: consultation } = await supabase
        .from('consultations')
        .select('id, patient_id, symptoms, status')
        .eq('id', consultationId)
        .single();

      // Load messages
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

        // Restore mode from last message metadata
        const lastMeta = msgData[msgData.length - 1]?.metadata;
        if (lastMeta?.mode) {
          setMode(lastMeta.mode as AssistantMode);
        }
      }

      // Restore patient context if available
      if (consultation?.patient_id) {
        const { data: patient } = await supabase
          .from('patients')
          .select('id, name, age, gender, primary_pathology, riskScore, medical_history, allergies, blood_type')
          .eq('id', consultation.patient_id)
          .single();

        if (patient) {
          // Also fetch patient appointments
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

  // Start new conversation
  const newConversation = useCallback(() => {
    setMessages([]);
    setCurrentConsultationId(null);
    setError(null);
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

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
        const { data: newConsultation, error: createErr } = await supabase
          .from('consultations')
          .insert({
            patient_id: patientContext?.patientId || null,
            symptoms: message.trim().substring(0, 500),
            status: 'pending',
            urgency_level: 'medium',
          })
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

      const body: Record<string, unknown> = {
        message: message.trim(),
        history,
        context: patientContext || undefined,
        mode,
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
      const userToken = localStorage.getItem('auth_token');
      const bearerToken = userToken || anonKey;

      const res = await fetch(`${supabaseUrl}/functions/v1/ai-doctor-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur serveur (${res.status})`);
      }

      const data = await res.json();

      if (data.success) {
        const aiMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(data.timestamp),
          mode: data.mode,
        };

        setMessages(prev => [...prev, aiMessage]);

        // Persist messages to DB
        if (consultationId) {
          // Save user message
          await supabase.from('consultation_messages').insert({
            consultation_id: consultationId,
            sender: 'user',
            message: message.trim(),
            metadata: { mode, hasImages: !!(images && images.length > 0) },
          });
          // Save AI response
          await supabase.from('consultation_messages').insert({
            consultation_id: consultationId,
            sender: 'ai',
            message: data.response,
            metadata: { mode: data.mode },
          });
          // Update consultation status
          await supabase.from('consultations').update({
            status: 'ai_analyzed',
            ai_response: data.response.substring(0, 1000),
          }).eq('id', consultationId);

          // Refresh conversation list
          loadConversations();
        }
      } else {
        throw new Error('Reponse invalide du serveur');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de communication avec l\'assistant IA';
      logger.error('AI Assistant error', err as Error);
      setError(errorMessage);

      const errorChatMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `Desole, une erreur est survenue: ${errorMessage}. Veuillez reessayer.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, mode, patientContext, currentConsultationId, loadConversations]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setCurrentConsultationId(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
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
    newConversation,
  };
}
