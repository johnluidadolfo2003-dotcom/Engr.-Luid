import React, { useState, useEffect } from 'react';
import {
  CurriculumTrack,
  CurriculumLesson,
  CurriculumStage,
} from '../types';
import {
  mathematicsStages,
  electricalStages,
  esasStages,
} from '../data/curriculumData';
import { MathRenderer } from './MathRenderer';
import { CurriculumInteractiveLab } from './CurriculumInteractiveLab';
import { InlineAIAssistant, AIContextPayload } from './InlineAIAssistant';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Zap,
  Calculator,
  Compass,
  ArrowRight,
  Award,
  Layers,
  HelpCircle,
  RotateCcw,
  Check,
  Cpu,
  Lightbulb,
  Search,
} from 'lucide-react';

interface CurriculumStudyHubProps {
  onAskMentor: (topic: string, question: string) => void;
  onOpenGrapher: (preset?: { tool: 'phasor' | 'rlc' | 'calculator'; params?: any }) => void;
  onStartDrillForTopic: (topic: string, subject: 'Mathematics' | 'EE Major' | 'ESAS') => void;
}

export const CurriculumStudyHub: React.FC<CurriculumStudyHubProps> = ({
  onAskMentor,
  onOpenGrapher,
  onStartDrillForTopic,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<CurriculumTrack>('mathematics');

  // Completed lessons set
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('ree_completed_lessons');
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set(['math-1-1']);
  });

  // Track stages for current track
  const currentStages: CurriculumStage[] =
    selectedTrack === 'mathematics'
      ? mathematicsStages
      : selectedTrack === 'electrical'
      ? electricalStages
      : esasStages;

  // Search filter for lessons
  const [searchQuery, setSearchQuery] = useState<string>('');

  // AI Assistant Drawer state (for same-page AI help)
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  const [aiContextPayload, setAiContextPayload] = useState<AIContextPayload | null>(null);

  // Selected lesson state
  const [selectedLessonId, setSelectedLessonId] = useState<string>(() => {
    return currentStages[0]?.lessons[0]?.id || 'math-1-1';
  });

  // User practice question answer state for active lesson
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, number>>({});
  const [practiceResults, setPracticeResults] = useState<Record<string, boolean>>({});

  // Sync selected lesson when track changes
  useEffect(() => {
    if (currentStages[0]?.lessons[0]) {
      setSelectedLessonId(currentStages[0].lessons[0].id);
      setPracticeAnswers({});
      setPracticeResults({});
    }
  }, [selectedTrack]);

  // Save completed lessons
  useEffect(() => {
    try {
      localStorage.setItem('ree_completed_lessons', JSON.stringify(Array.from(completedLessonIds)));
    } catch {}
  }, [completedLessonIds]);

  // Find active lesson
  const allCurrentLessons = currentStages.flatMap((s) => s.lessons);
  const activeLesson: CurriculumLesson =
    allCurrentLessons.find((l) => l.id === selectedLessonId) || allCurrentLessons[0];

  const toggleLessonCompleted = (lessonId: string) => {
    setCompletedLessonIds((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  const handlePracticeAnswer = (qId: string, choiceIdx: number, correctIdx: number) => {
    setPracticeAnswers((prev) => ({ ...prev, [qId]: choiceIdx }));
    setPracticeResults((prev) => ({ ...prev, [qId]: choiceIdx === correctIdx }));
  };

  // Calculate completion percentage for this track
  const completedCount = allCurrentLessons.filter((l) => completedLessonIds.has(l.id)).length;
  const progressPercent = Math.round((completedCount / (allCurrentLessons.length || 1)) * 100);

  const trackInfo = {
    mathematics: {
      title: 'Mathematics Track (From Zero)',
      subtitle: 'Arithmetic ➔ Algebra ➔ Trig ➔ Analytic Geom ➔ Differential & Integral Calculus',
      badge: '50% of Board Exam Math Component',
      subjectName: 'Mathematics' as const,
      color: 'amber',
    },
    electrical: {
      title: 'Electrical Engineering Major Track (From Zero)',
      subtitle: 'Electron Theory ➔ DC Circuits ➔ Magnetism ➔ AC Phasors ➔ Machines ➔ Power Systems & PEC',
      badge: 'Major Subject (50% Exam Weight)',
      subjectName: 'EE Major' as const,
      color: 'sky',
    },
    esas: {
      title: 'ESAS Track (From Zero)',
      subtitle: 'Units ➔ Statics & Dynamics ➔ Strength of Materials ➔ Thermodynamics ➔ Economy ➔ RA 7920',
      badge: 'Engineering Sciences & Allied Subjects',
      subjectName: 'ESAS' as const,
      color: 'emerald',
    },
  };

  const currentInfo = trackInfo[selectedTrack];

  return (
    <div className="space-y-6">
      {/* Top Track Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wide">
              <span>PRC Registered Electrical Engineer Comprehensive Curriculum</span>
              <span>·</span>
              <span>Start From Zero Knowledge</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Sequential Mastery Curriculum: Study from the Absolute Start
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
              No assumed prior knowledge. Step through each concept in exact progression: basic definitions, plain-English intuition, standard formulas, step-by-step arithmetic, and Casio calculator shortcuts.
            </p>
          </div>

          {/* Master Track Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-800 rounded-xl self-start lg:self-auto shrink-0">
            <button
              onClick={() => setSelectedTrack('mathematics')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                selectedTrack === 'mathematics'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>1. Mathematics (Start)</span>
            </button>

            <button
              onClick={() => setSelectedTrack('electrical')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                selectedTrack === 'electrical'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>2. Electrical Major</span>
            </button>

            <button
              onClick={() => setSelectedTrack('esas')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                selectedTrack === 'esas'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>3. ESAS</span>
            </button>
          </div>
        </div>

        {/* Track Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{currentInfo.title}</span>
            <span>·</span>
            <span>
              {completedCount} of {allCurrentLessons.length} lessons mastered ({progressPercent}%)
            </span>
          </div>
          <div className="w-full sm:w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Two-Column View: Left Stage/Lesson Navigation & Right Detailed Lesson */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Progressive Lesson Directory (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden space-y-3 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Course Syllabus Progression
              </h2>
              <p className="text-[11px] text-slate-500">
                Click any lesson to study from first principles:
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{allCurrentLessons.length} Lessons</span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search topics (e.g. PEMDAS, Ohm, Wye)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
            {currentStages
              .map((stage) => {
                const filteredLessons = stage.lessons.filter(
                  (l) =>
                    !searchQuery.trim() ||
                    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    l.summary.toLowerCase().includes(searchQuery.toLowerCase())
                );
                return { ...stage, filteredLessons };
              })
              .filter((stage) => stage.filteredLessons.length > 0)
              .map((stage) => (
                <div key={stage.stageNumber} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span>{stage.stageTitle}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {stage.lessons.filter((l) => completedLessonIds.has(l.id)).length}/{stage.lessons.length}
                    </span>
                  </div>

                  <div className="space-y-1 pl-1">
                    {stage.filteredLessons.map((lesson) => {
                      const isSelected = activeLesson?.id === lesson.id;
                      const isDone = completedLessonIds.has(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            setSelectedLessonId(lesson.id);
                            setPracticeAnswers({});
                            setPracticeResults({});
                          }}
                          className={`w-full text-left p-2.5 rounded-lg text-xs flex items-start justify-between gap-2 transition-all ${
                            isSelected
                              ? 'bg-slate-900 text-white font-semibold shadow-xs'
                              : isDone
                              ? 'bg-emerald-50/60 text-emerald-950 hover:bg-emerald-100/60 border border-emerald-200/50'
                              : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                          }`}
                        >
                        <div className="flex items-start gap-2">
                          <span
                            className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 mt-0.5 ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950'
                                : isDone
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {lesson.lessonNumber}
                          </span>
                          <span className="leading-snug text-[11px] sm:text-xs">
                            {lesson.title}
                          </span>
                        </div>

                        {isDone && (
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isSelected ? 'text-amber-400' : 'text-emerald-600'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Action Footer */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => onStartDrillForTopic(activeLesson.title, currentInfo.subjectName)}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Practice 10 Drills on This Topic</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Super Detailed Lesson Content (8 cols) */}
        {activeLesson && (
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden space-y-6">
            {/* Lesson Title Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold font-mono">
                    Lesson {activeLesson.lessonNumber}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600 font-medium">{activeLesson.stageTitle}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLessonCompleted(activeLesson.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      completedLessonIds.has(activeLesson.id)
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        completedLessonIds.has(activeLesson.id) ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    />
                    <span>
                      {completedLessonIds.has(activeLesson.id) ? 'Mastered' : 'Mark as Mastered'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setAiContextPayload({
                        topic: activeLesson.title,
                        subtopic: activeLesson.stageTitle,
                        question: activeLesson.summary,
                        formula: activeLesson.formulas[0]?.formula,
                        boardTip: activeLesson.boardExamTip,
                      });
                      setIsAIAssistantOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ask AI Tutor (On Page)</span>
                  </button>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {activeLesson.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {activeLesson.summary}
              </p>

              {/* Why It Matters Callout */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-950 flex items-start gap-2">
                <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block text-amber-900">
                    Why This Matters for the REE Board Exam:
                  </strong>
                  <span>{activeLesson.whyItMatters}</span>
                </div>
              </div>

              {/* Zero-Knowledge Plain-English Analogy (Assume No Knowledge) */}
              {activeLesson.zeroKnowledgeAnalogy && (
                <div className="p-3.5 bg-sky-50/80 border border-sky-200 rounded-lg text-xs text-sky-950 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-sky-500/10 border border-sky-300 flex items-center justify-center text-sky-700 shrink-0 mt-0.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <strong className="font-semibold block text-sky-900 text-xs">
                      Plain-English Intuition (Zero Prior Knowledge Assumed):
                    </strong>
                    <p className="leading-relaxed text-sky-950 text-xs">
                      {activeLesson.zeroKnowledgeAnalogy}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Core Theory: Step-by-Step Explanation */}
            <div className="px-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>1. Core Theory & First Principles (No Assumptions)</span>
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                {activeLesson.coreTheory.map((paragraph, pIdx) => (
                  <p key={pIdx}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Interactive Live Mini-Lab (if lesson has interactive simulator) */}
            {activeLesson.interactiveTool && (
              <div className="px-6 space-y-3">
                <CurriculumInteractiveLab
                  toolType={activeLesson.interactiveTool}
                  lessonTitle={activeLesson.title}
                  onOpenGrapher={onOpenGrapher}
                />
              </div>
            )}

            {/* Key Formulas */}
            {activeLesson.formulas.length > 0 && (
              <div className="px-6 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>2. Master Formulas & Variable Units</span>
                </h3>

                <div className="space-y-3">
                  {activeLesson.formulas.map((f, fIdx) => (
                    <div
                      key={fIdx}
                      className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>{f.name}</span>
                        <span className="text-[11px] font-mono text-slate-400 font-normal">
                          Units: {f.units}
                        </span>
                      </div>

                      <MathRenderer formula={f.formula} size="md" />

                      <p className="text-xs text-slate-600 leading-relaxed pt-1">
                        {f.explanation}
                      </p>

                      <div className="text-[11px] text-slate-500 font-mono">
                        Variables: {f.variables}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Worked Example (Step-by-Step Arithmetic) */}
            <div className="px-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-sky-600" />
                <span>3. Worked Step-by-Step Example (Full Calculation Shown)</span>
              </h3>

              <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-xl space-y-3">
                <p className="text-xs sm:text-sm font-semibold text-slate-900">
                  {activeLesson.workedExample.problem}
                </p>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-sky-900 uppercase tracking-wide">
                    Given Values:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeLesson.workedExample.given.map((g, gIdx) => (
                      <span
                        key={gIdx}
                        className="px-2.5 py-1 bg-white border border-sky-200 text-sky-950 font-mono text-xs rounded-md"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-sky-900 uppercase tracking-wide">
                    Step-by-Step Solution:
                  </span>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-800 bg-white p-3.5 rounded-lg border border-sky-200/80">
                    {activeLesson.workedExample.stepByStep.map((step, sIdx) => (
                      <li key={sIdx} className="leading-relaxed">
                        <span className="font-mono text-[11px] sm:text-xs text-slate-900">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="p-3 bg-white border border-sky-300 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Final Answer:</span>
                    <span className="text-base font-bold font-mono text-sky-950">
                      {activeLesson.workedExample.answer}
                    </span>
                  </div>

                  {activeLesson.workedExample.calculatorShortcut && (
                    <div className="text-xs text-sky-900 text-right max-w-xs">
                      <strong className="block text-[11px]">Casio fx-991ES:</strong>
                      <span className="font-mono text-[10px] text-slate-600">
                        {activeLesson.workedExample.calculatorShortcut}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Practice Comprehension Check */}
            {activeLesson.quickPractice.length > 0 && (
              <div className="px-6 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>4. Quick Practice Comprehension Check (Test Yourself Now)</span>
                </h3>

                <div className="space-y-4">
                  {activeLesson.quickPractice.map((qp, qIdx) => {
                    const answeredIdx = practiceAnswers[qp.id];
                    const isAnswered = answeredIdx !== undefined;
                    const isCorrect = practiceResults[qp.id];

                    return (
                      <div
                        key={qp.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs"
                      >
                        <p className="text-xs sm:text-sm font-medium text-slate-900">
                          {qIdx + 1}. {qp.question}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {qp.options.map((opt, optIdx) => {
                            const isSelected = answeredIdx === optIdx;
                            const isCorrectChoice = optIdx === qp.correctAnswer;

                            let btnStyle = 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100';
                            if (isAnswered) {
                              if (isCorrectChoice) {
                                btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                              } else if (isSelected && !isCorrectChoice) {
                                btnStyle = 'bg-rose-50 border-rose-500 text-rose-950';
                              } else {
                                btnStyle = 'bg-white border-slate-200 text-slate-400 opacity-60';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handlePracticeAnswer(qp.id, optIdx, qp.correctAnswer)}
                                disabled={isAnswered}
                                className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all ${btnStyle}`}
                              >
                                <span className="font-mono font-bold text-[11px] shrink-0">
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {isAnswered && (
                          <div className="pt-2 border-t border-slate-200 text-xs">
                            <span
                              className={`font-semibold block mb-1 ${
                                isCorrect ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {isCorrect ? 'Correct! Concept verified.' : 'Incorrect.'}
                            </span>
                            <p className="text-slate-600 text-[11px] leading-relaxed">
                              {qp.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Board Exam Golden Tip */}
            <div className="px-6 pb-6">
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 uppercase text-[10px]">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>PRC Board Exam Secret & Memory Rule:</span>
                </div>
                <p className="text-amber-950 leading-relaxed font-sans text-xs">
                  {activeLesson.boardExamTip}
                </p>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  const currentIdx = allCurrentLessons.findIndex((l) => l.id === activeLesson.id);
                  if (currentIdx > 0) {
                    setSelectedLessonId(allCurrentLessons[currentIdx - 1].id);
                    setPracticeAnswers({});
                    setPracticeResults({});
                  }
                }}
                disabled={allCurrentLessons.findIndex((l) => l.id === activeLesson.id) === 0}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous Lesson
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenGrapher(activeLesson.grapherPreset)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Open in Grapher</span>
                </button>

                <button
                  onClick={() => {
                    const currentIdx = allCurrentLessons.findIndex((l) => l.id === activeLesson.id);
                    if (currentIdx < allCurrentLessons.length - 1) {
                      setSelectedLessonId(allCurrentLessons[currentIdx + 1].id);
                      setPracticeAnswers({});
                      setPracticeResults({});
                    }
                  }}
                  disabled={allCurrentLessons.findIndex((l) => l.id === activeLesson.id) === allCurrentLessons.length - 1}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next Lesson
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Embedded Same-Page AI Assistant Drawer */}
      <InlineAIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        context={aiContextPayload}
      />
    </div>
  );
};
