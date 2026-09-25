import React, { useState, useRef, useEffect } from 'react';
import { BoardProblem, ChatMessage, ReviewMaterial, Subject } from '../types';
import {
  Send,
  Upload,
  FileText,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Trash2,
  Plus,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface AITutorAndNotesProps {
  activeContextProblem?: BoardProblem | null;
  onClearContext?: () => void;
  onAddProblemsToDrill?: (problems: BoardProblem[]) => void;
}

export const AITutorAndNotes: React.FC<AITutorAndNotesProps> = ({
  activeContextProblem,
  onClearContext,
  onAddProblemsToDrill,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'materials'>('chat');

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Kumusta, Engineer! I am Engr. Lex, your REE Board Exam AI Mentor. I keep explanations direct, concise, and focused on formulas and calculator shortcuts. Ask me anything on Mathematics, Circuits, Machinery, Power Systems, or upload your Cebu review center handouts!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Review Material Upload state
  const [materials, setMaterials] = useState<ReviewMaterial[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // If a context problem was passed from Daily Drill, prefill or prompt
  useEffect(() => {
    if (activeContextProblem) {
      setActiveTab('chat');
      const questionPrompt = `Please explain the concept and quickest solving method for this REE Board problem:\n"${activeContextProblem.question}"\nTopic: ${activeContextProblem.topic}`;
      setInputMessage(questionPrompt);
    }
  }, [activeContextProblem]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const contextPayload = activeContextProblem
        ? `Problem: ${activeContextProblem.question}\nCorrect formula: ${activeContextProblem.formula}`
        : '';

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          context: contextPayload,
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'Engr. Lex could not generate an answer at this moment.';

      const botMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: 'Error reaching mentor service. Please ensure server is running.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Upload handler for review center materials
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      let textContent = '';
      let imageBase64 = '';
      const isImage = file.type.startsWith('image/');

      if (isImage) {
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else {
        textContent = await file.text();
      }

      const res = await fetch('/api/analyze-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          textContent: textContent.slice(0, 10000), // pass text snippet
          imageBase64: imageBase64 || undefined,
          mimeType: file.type || 'text/plain',
        }),
      });

      if (!res.ok) {
        throw new Error('Server failed to process material');
      }

      const parsed = await res.json();

      const newMaterial: ReviewMaterial = {
        id: `mat-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        subject: (parsed.subject as Subject) || 'EE Major',
        summary: Array.isArray(parsed.summary) ? parsed.summary : [parsed.summary || 'Summary generated.'],
        keyFormulas: parsed.keyFormulas || [],
        boardExamTips: parsed.boardExamTips || [],
        generatedDrills: parsed.generatedDrills || [],
      };

      setMaterials((prev) => [newMaterial, ...prev]);

      // Automatically notify user in chat
      setMessages((prev) => [
        ...prev,
        {
          id: `note-notif-${Date.now()}`,
          role: 'assistant',
          content: `I've analyzed your review material "${file.name}". Extracted ${newMaterial.keyFormulas.length} key formulas and generated ${newMaterial.generatedDrills.length} practice problems. You can review them in the "Uploaded Review Notes" tab!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Could not upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddDrillsToBank = (mat: ReviewMaterial) => {
    if (!onAddProblemsToDrill || !mat.generatedDrills.length) return;

    const formattedProblems: BoardProblem[] = mat.generatedDrills.map((d, idx) => ({
      id: `drill-mat-${mat.id}-${idx}`,
      subject: mat.subject,
      topic: mat.title,
      subtopic: 'Review Center Handout',
      level: 'Intermediate: AC Fundamentals',
      question: d.question,
      options: d.options,
      correctAnswer: d.correctAnswer,
      formula: d.formula || '',
      plainEnglishExplanation: d.explanation || 'Step-by-step review center solution.',
      solutionSteps: [d.explanation],
      calculatorTrick: 'Follow standard Casio CMPLX evaluation.',
      difficulty: 'Moderate',
    }));

    onAddProblemsToDrill(formattedProblems);
    alert(`Added ${formattedProblems.length} questions from "${mat.title}" to your Daily 100 Drill Bank!`);
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-1">
              <span>Engr. Lex AI Mentor</span>
              <span>·</span>
              <span>Zero-Fluff Board Exam Tutor</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              AI Tutor & Cebu Review Center Material Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Ask tricky questions for instant step-by-step clarity. Upload your review center notes, formulas, or mock exams to auto-extract cheat sheets and generate practice drills.
            </p>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'chat'
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Engr. Lex</span>
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'materials'
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Uploaded Notes ({materials.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Problem Context Banner */}
      {activeContextProblem && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900">
            <Zap className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Active Problem Discussion:</strong> {activeContextProblem.question.slice(0, 80)}...
            </span>
          </div>
          {onClearContext && (
            <button
              onClick={onClearContext}
              className="text-xs text-amber-800 hover:text-amber-950 font-medium underline shrink-0"
            >
              Clear Focus
            </button>
          )}
        </div>
      )}

      {/* TAB 1: CHAT WITH ENGR. LEX */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Quick Shortcuts & Prompt Library (Left 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Prompt Library (From Basic to Board)
                </h3>
                <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  AI Online
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Click any prompt to get zero-jargon explanations and step-by-step arithmetic:
              </p>

              {/* Basic Math Foundations Category */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block pt-1">
                  1. Start from Basic Math & Circuits:
                </span>
                {[
                  'Explain Ohm’s Law (V = I × R) and Power (P = V × I) from zero knowledge.',
                  'How to solve quadratic equations with Casio fx-991ES Plus step-by-step?',
                  'Why is SOH-CAH-TOA right triangle trigonometry the secret to AC power factor?',
                  'What is j = √(-1) in electrical engineering and how to use Mode 2 CMPLX?',
                  'Explain Resistors in Series vs Parallel with clear numerical examples.',
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="w-full text-left p-2 rounded-lg border border-amber-100 hover:border-amber-300 hover:bg-amber-50/60 text-xs text-amber-950 transition-colors flex items-start gap-2 group"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-amber-500 group-hover:text-amber-700 shrink-0 mt-0.5" />
                    <span className="leading-snug">{prompt}</span>
                  </button>
                ))}
              </div>

              {/* Advanced Board Exam Topics */}
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  2. EE Major & Board Exam Topics:
                </span>
                {[
                  'Explain Transformer Turns Ratio (V1/V2 = N1/N2 = I2/I1) and Voltage Regulation.',
                  'How to calculate 3-Phase line current: P = √3 × V_L × I_L × pf.',
                  'Explain Induction Motor Synchronous Speed (120f/P) and Rotor Slip.',
                  'How to calculate capacitor rating for power factor correction (Qc = P(tan θ1 - tan θ2)).',
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="w-full text-left p-2 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-xs text-slate-700 transition-colors flex items-start gap-2 group"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0 mt-0.5" />
                    <span className="leading-snug">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cebu Review Center Tip Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <BookOpen className="w-4 h-4" />
                <span>6-Month Cebu Review Strategy</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Do not attempt to read 500-page textbooks word-for-word. Solve 50 to 100 problems daily. When stuck, ask Engr. Lex for the exact formula and calculator step. Active recall yields 4x higher retention than passive reading.
              </p>
            </div>
          </div>

          {/* Chat Window (Right 8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col h-[580px] overflow-hidden">
            {/* Chat Messages Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-slate-900 text-white rounded-br-xs'
                        : 'bg-slate-50 text-slate-900 border border-slate-200/80 rounded-bl-xs'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[11px] mb-1.5 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Engr. Lex</span>
                      </div>
                    )}
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}
              {isSending && (
                <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 w-fit">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                  <span>Engr. Lex is deriving solution...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask a board exam question, formula, or calculator step..."
                disabled={isSending}
                className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: UPLOADED REVIEW CENTER NOTES */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          {/* Upload Dropzone */}
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 sm:p-8 text-center space-y-3 hover:border-amber-400 transition-colors">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.pdf,.png,.jpg,.jpeg"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Upload Cebu Review Center Materials
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-0.5">
                Upload lecture notes, formula handouts, syllabus sheets, or photo diagrams (.txt, .pdf, .jpg, .png).
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {isUploading ? 'Analyzing Material...' : 'Choose File to Upload'}
            </button>
            {uploadError && (
              <p className="text-xs text-rose-600 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{uploadError}</span>
              </p>
            )}
          </div>

          {/* List of Uploaded & Parsed Materials */}
          {materials.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-700">No review center materials uploaded yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once you start your Cebu review center in October, upload your module handouts here to extract concise formula sheets and generate customized practice questions!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{mat.title}</span>
                        <span className="text-[11px] text-slate-400">·</span>
                        <span className="text-xs text-amber-700 font-medium">{mat.subject}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Uploaded {mat.uploadedAt}</span>
                    </div>

                    <button
                      onClick={() => handleAddDrillsToBank(mat)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-xs transition-colors self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add {mat.generatedDrills.length} Questions to Daily Drill</span>
                    </button>
                  </div>

                  {/* Summary */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                      High-Yield Summary:
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                      {mat.summary.map((sum, sIdx) => (
                        <li key={sIdx}>{sum}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Key Formulas */}
                  {mat.keyFormulas.length > 0 && (
                    <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-1">
                      <span className="text-[11px] font-bold text-amber-900 uppercase">
                        Extracted Board Formulas:
                      </span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {mat.keyFormulas.map((f, fIdx) => (
                          <span
                            key={fIdx}
                            className="font-mono text-xs bg-white px-2.5 py-1 rounded border border-amber-200 text-amber-950 font-bold"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Board Exam Traps */}
                  {mat.boardExamTips.length > 0 && (
                    <div className="p-3 bg-sky-50/60 border border-sky-200 rounded-lg space-y-1 text-xs text-sky-950">
                      <span className="text-[11px] font-bold text-sky-900 uppercase">
                        Common Board Exam Traps / Memory Tips:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-sky-900 text-xs">
                        {mat.boardExamTips.map((tip, tIdx) => (
                          <li key={tIdx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
