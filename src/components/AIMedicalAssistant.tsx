import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Brain, TrendingUp, FileText, AlertCircle, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
}

const AIMedicalAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant médical IA. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'analyze-risk',
      label: 'Analyser cas à risque',
      icon: <AlertCircle size={16} />,
      prompt: 'Analyse les patients à risque élevé et suggère des actions prioritaires',
    },
    {
      id: 'generate-report',
      label: 'Générer rapport',
      icon: <FileText size={16} />,
      prompt: 'Génère un compte-rendu médical des activités du jour',
    },
    {
      id: 'trends',
      label: 'Tendances du jour',
      icon: <TrendingUp size={16} />,
      prompt: 'Analyse les tendances des consultations et statistiques d\'aujourd\'hui',
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('risque') || lowerMessage.includes('cas à risque')) {
      return `📊 Analyse des patients à risque détectée:\n\n✅ 3 patients nécessitent une attention immédiate:\n- Patient #1245: Score de risque 85% (hypertension non contrôlée)\n- Patient #1189: Score de risque 72% (diabète type 2, suivi irrégulier)\n- Patient #1067: Score de risque 68% (insuffisance cardiaque)\n\n💡 Recommandations:\n1. Programmer consultations de suivi cette semaine\n2. Vérifier l'observance des traitements\n3. Envisager ajustements thérapeutiques`;
    }

    if (lowerMessage.includes('rapport') || lowerMessage.includes('compte-rendu')) {
      return `📋 Compte-rendu médical généré:\n\n📅 Date: ${new Date().toLocaleDateString('fr-FR')}\n\n👥 Activité:\n- 28 consultations réalisées\n- 12 nouveaux patients enregistrés\n- 45 prescriptions émises\n\n🎯 Points clés:\n- Pic d'activité: 10h-12h (15 consultations)\n- Pathologies principales: Infections respiratoires (35%)\n- Taux de suivi: 92%\n\n✅ Recommandations: Planifier 8 consultations de suivi pour la semaine prochaine`;
    }

    if (lowerMessage.includes('tendance') || lowerMessage.includes('statistique')) {
      return `📈 Analyse des tendances:\n\n🔹 Consultations:\n- +15% vs hier\n- +22% vs semaine dernière\n- Moyenne quotidienne: 25 patients\n\n🔹 Cas urgents:\n- 4 patients vus en urgence\n- Temps d'attente moyen: 12 min\n\n🔹 Prescriptions:\n- Antibiotiques: 18%\n- Antalgiques: 25%\n- Traitements chroniques: 40%\n\n💡 Insight: Augmentation notable des infections saisonnières, prévoir stock médicaments`;
    }

    if (lowerMessage.includes('patient') && (lowerMessage.includes('1245') || lowerMessage.includes('dupont'))) {
      return `👤 Fiche patient Jean Dupont (#1245):\n\n⚠️ Alertes actives:\n- Score de risque: 85% (Critique)\n- Hypertension non contrôlée\n- 2 consultations manquées\n\n📊 Signes vitaux récents:\n- TA: 165/95 mmHg (élevée)\n- Pouls: 88 bpm\n- Poids: 92 kg (+3kg/mois)\n\n💊 Traitement actuel:\n- Ramipril 10mg/j\n- Amlodipine 5mg/j\n\n🎯 Actions recommandées:\n1. Consultation urgente cette semaine\n2. Ajustement posologie\n3. Suivi tensionnel quotidien`;
    }

    if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('hello')) {
      return `Bonjour ! 👋\n\nJe suis votre assistant médical intelligent. Je peux vous aider à:\n\n🔍 Analyser les patients à risque\n📊 Générer des rapports et statistiques\n💊 Interpréter des résultats d'examens\n📅 Optimiser la planification des consultations\n🎯 Fournir des recommandations cliniques\n\nQue souhaitez-vous que j'analyse pour vous ?`;
    }

    if (lowerMessage.includes('aide') || lowerMessage.includes('help') || lowerMessage.includes('que peux-tu faire')) {
      return `🤖 Mes capacités:\n\n✅ Analyse prédictive:\n- Identification patients à risque\n- Détection patterns anormaux\n- Alertes préventives\n\n✅ Rapports automatisés:\n- Comptes-rendus quotidiens\n- Statistiques d'activité\n- Export de données\n\n✅ Support décisionnel:\n- Suggestions thérapeutiques\n- Interprétation résultats\n- Recommandations de suivi\n\n✅ Optimisation workflow:\n- Priorisation des cas\n- Gestion des rendez-vous\n- Alertes échéances\n\nUtilisez les boutons d'action rapide ou posez-moi directement vos questions !`;
    }

    return `J'ai bien reçu votre message: "${userMessage}"\n\n🤖 Je peux vous aider avec:\n- Analyse des patients à risque\n- Génération de rapports médicaux\n- Statistiques et tendances\n- Interprétation de résultats\n- Recommandations cliniques\n\nPouvez-vous préciser votre demande ou utiliser les actions rapides ci-dessus ?`;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action: QuickAction) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: action.label,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(action.prompt),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
      >
        <Brain size={28} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
          3
        </span>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isMinimized
          ? 'bottom-6 right-6 w-80 h-16'
          : 'bottom-6 right-6 w-96 h-[600px]'
      }`}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 h-full flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-violet-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold flex items-center gap-2">
                Assistant IA Médical
                <Sparkles size={16} className="animate-pulse" />
              </h3>
              <p className="text-white/80 text-xs">En ligne</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        message.role === 'user'
                          ? 'text-blue-100'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-700 rounded-2xl p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2 mb-3">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Posez votre question..."
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIMedicalAssistant;
