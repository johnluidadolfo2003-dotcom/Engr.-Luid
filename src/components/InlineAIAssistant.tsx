import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Calculator,
  Zap,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  RefreshCcw,
} from 'lucide-react';
import { MathRenderer } from './MathRenderer';

export interface AIContextPayload {
  topic?: string;
  subtopic?: string;
  question?: string;
  formula?: string;
  solutionSteps?: string[];
  boardTip?: string;
}

interface InlineAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  context: AIContextPayload | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const InlineAIAssistant: React.FC<InlineAIAssistantProps> = ({
  isOpen,
  onClose,
  context,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation when context changes or opens
  useEffect(() => {
    if (isOpen && context) {
      const topicStr = context.topic || 'Engineering Subject';
      const questionStr = context.question || '';
      
      const welcomeText = `Hello! I'm **Engr. Lex**, your REE Board Exam AI Mentor.
I see you're studying **${topicStr}**${context.subtopic ? ` (${context.subtopic})` : ''}.

${questionStr ? `**Target Problem / Question:**\n${questionStr}\n\n` : ''}How can I help you master this concept? Select a quick action below or ask me anything!`;

      setMessages([
        {
          id: 'welcome-1',
          sender: 'ai',
          text: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [isOpen, context]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const fullPrompt = context
        ? `[Context Topic: ${context.topic || 'EE Topic'}]
[Question/Problem: ${context.question || 'N/A'}]
[Formula: ${context.formula || 'N/A'}]

User Student Request: ${query}`
        : query;

      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: fullPrompt }),
      });

      const data = await response.json();
      const replyText = data.reply || 'Apologies, I could not generate a response. Please try again.';

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `### Step-by-Step Explanation for "${context?.topic || 'this topic'}"\n\n1. **Core Concept**: Let's break this down into first principles without complicated jargon.\n2. **Formula**: ${context?.formula || 'V = I × R'}\n3. **Casio fx-991ES Trick**: Use CMPLX mode for AC phasors, or EQN mode for systems.\n\nAsk me if you'd like a specific calculation step!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const quickPrompts = [
    'Explain step-by-step with zero jargon',
    'Show Casio fx-991ES calculator key shortcut',
    'What is the plain English intuition?',
    'Give me a practice problem on this topic',
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Click overlay to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-Over Drawer Container */}
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 text-white flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white">Engr. Lex AI Tutor</h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Active On-Page
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {context?.topic ? `Studying: ${context.topic}` : 'In-Context Engineering Mentor'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Context Summary Card */}
        {context?.question && (
          <div className="p-3 bg-slate-800/80 border-b border-slate-700/60 text-xs text-slate-300 space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              Active Context:
            </span>
            <p className="text-slate-200 text-xs line-clamp-2">{context.question}</p>
          </div>
        )}

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs sm:text-sm ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-3.5 space-y-2 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-amber-400 text-slate-950 font-medium rounded-tr-xs'
                    : 'bg-slate-800 border border-slate-700/80 text-slate-100 rounded-tl-xs shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
                  {msg.text.split('\n').map((line, lIdx) => {
                    if (line.startsWith('### ')) {
                      return (
                        <h4 key={lIdx} className="font-bold text-amber-400 text-sm mt-2 mb-1">
                          {line.replace('### ', '')}
                        </h4>
                      );
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <strong key={lIdx} className="block font-bold text-white mt-1">
                          {line.replace(/\*\*/g, '')}
                        </strong>
                      );
                    }
                    return <p key={lIdx} className="my-0.5">{line}</p>;
                  })}
                </div>

                <div
                  className={`text-[10px] font-mono text-right ${
                    msg.sender === 'user' ? 'text-slate-900/70' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-amber-400 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 w-fit animate-pulse">
              <Bot className="w-4 h-4 animate-spin text-amber-400" />
              <span>Engr. Lex is analyzing and calculating step-by-step...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-slate-900 border-t border-slate-800 space-y-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block px-1">
            Quick Prompts:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-[11px] text-slate-300 hover:text-white transition-colors disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Engr. Lex a question about this lesson or problem..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2 bg-amber-400 text-slate-950 hover:bg-amber-300 disabled:opacity-40 font-bold rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
