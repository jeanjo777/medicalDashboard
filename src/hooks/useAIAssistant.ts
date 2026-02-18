import { useState, useCallback, useRef } from 'react';
import api from '../services/api';
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

export interface PatientContext {
  patientId?: string;
  patientName?: string;
  patientAge?: number;
  patientSex?: string;
  antecedents?: string[];
  currentMedications?: string[];
  primaryPathology?: string;
  riskScore?: number;
}

interface UseAIAssistantReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  mode: AssistantMode;
  patientContext: PatientContext | null;
  sendMessage: (message: string, images?: ImageAttachment[]) => Promise<void>;
  setMode: (mode: AssistantMode) => void;
  setPatientContext: (context: PatientContext | null) => void;
  clearChat: () => void;
  clearError: () => void;
}

export function useAIAssistant(): UseAIAssistantReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AssistantMode>('general');
  const [patientContext, setPatientContext] = useState<PatientContext | null>(null);
  const messageIdCounter = useRef(0);

  const generateId = () => {
    messageIdCounter.current += 1;
    return `msg-${Date.now()}-${messageIdCounter.current}`;
  };

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

    try {
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

      // Attach first image for API (Claude vision supports one image per message block, but we send all)
      if (images && images.length > 0) {
        body.images = images.map(img => ({
          base64: img.base64,
          mediaType: img.mediaType,
        }));
        // Also send single image for backward compat
        body.image = {
          base64: images[0].base64,
          mediaType: images[0].mediaType,
        };
      }

      const response = await api.callFunction<{
        success: boolean;
        response: string;
        mode: string;
        timestamp: string;
      }>('ai-doctor-assistant', body);

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.success) {
        const aiMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date(response.data.timestamp),
          mode: response.data.mode,
        };

        setMessages(prev => [...prev, aiMessage]);
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
  }, [messages, isLoading, mode, patientContext]);

  const clearChat = useCallback(() => {
    setMessages([]);
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
    sendMessage,
    setMode,
    setPatientContext,
    clearChat,
    clearError,
  };
}
