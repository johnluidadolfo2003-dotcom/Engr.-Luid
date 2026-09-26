import React, { useState, useMemo, useEffect } from 'react';
import { BoardProblem, Subject, DrillLevel } from '../types';
import { MathRenderer } from './MathRenderer';
import { InlineAIAssistant, AIContextPayload } from './InlineAIAssistant';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Zap,
  Clock,
  RotateCcw,
  BookOpen,
  GraduationCap,
} from 'lucide-react';

interface DailyDrillProps {
  problems: BoardProblem[];
  completedToday: number;
  dailyTarget: number;
  onProblemAnswered: (problemId: string, isCorrect: boolean) => void;
  onAskAIAboutProblem: (problem: BoardProblem) => void;
  onAddCustomProblems?: (newProblems: BoardProblem[]) => void;
  onOpenPrimer?: () => void;
}

export const DailyDrill: React.FC<DailyDrillProps> = ({
  problems,
  completedToday,
  dailyTarget,
  onProblemAnswered,
  onAskAIAboutProblem,
  onAddCustomProblems,
  onOpenPrimer,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'All'>('All');
  const [selectedLevel, setSelectedLevel] = useState<DrillLevel | 'All Levels'>('All Levels');
  const [filterMode, setFilterMode] = useState<'all' | 'unanswered' | 'missed' | 'bookmarked'>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('ree_bookmarks') || '[]')); }
    catch { return new Set(); }
  });
  const [answers, setAnswers] = useState<Record<string, { choice: number; isCorrect: boolean }>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ree_daily_answers') || '{}');
      return saved.date === new Date().toDateString() ? saved.answers || {} : {};
    } catch { return {}; }
  });
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Same-Page AI Assistant state
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  const [aiContextPayload, setAiContextPayload] = useState<AIContextPayload | null>(null);

  // Timer per problem (standard REE pace: 120s per item)
  const [secondsLeft, setSecondsLeft] = useState<number>(120);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  useEffect(() => {
    try { localStorage.setItem('ree_bookmarks', JSON.stringify([...bookmarkedIds])); } catch {}
  }, [bookmarkedIds]);
  useEffect(() => {
    try { localStorage.setItem('ree_daily_answers', JSON.stringify({ date: new Date().toDateString(), answers })); } catch {}
  }, [answers]);

  // Filter problems by Subject, Level, and Mode
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      if (selectedSubject !== 'All' && p.subject !== selectedSubject) return false;
      if (selectedLevel !== 'All Levels' && p.level !== selectedLevel) return false;
      if (filterMode === 'bookmarked' && !bookmarkedIds.has(p.id)) return false;
      if (filterMode === 'unanswered' && answers[p.id] !== undefined) return false;
      if (filterMode === 'missed' && (!answers[p.id] || answers[p.id].isCorrect)) return false;
      return true;
    });
  }, [problems, selectedSubject, selectedLevel, filterMode, bookmarkedIds, answers]);

  const currentProblem = filteredProblems[currentIndex] || filteredProblems[0];

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsLeft]);

  // Reset timer on question change
  useEffect(() => {
    setSecondsLeft(120);
    setShowSolution(false);
    if (currentProblem && answers[currentProblem.id] !== undefined) {
      setSelectedOption(answers[currentProblem.id].choice);
    } else {
      setSelectedOption(null);
    }
  }, [currentIndex, currentProblem?.id]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectOption = (index: number) => {
    if (!currentProblem) return;
    if (answers[currentProblem.id] !== undefined) return;

    setSelectedOption(index);
    const isCorrect = index === currentProblem.correctAnswer;
    setAnswers((prev) => ({
      ...prev,
      [currentProblem.id]: { choice: index, isCorrect },
    }));

    onProblemAnswered(currentProblem.id, isCorrect);
    setShowSolution(true); // Automatically show clean step-by-step formula
  };

  const handleNext = () => {
    if (currentIndex < filteredProblems.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  // Generate more problems using AI with specific level guidance
  const handleGenerateMoreProblems = async () => {
    setIsGenerating(true);
    try {
      const targetSub = selectedSubject === 'All' ? 'EE Major' : selectedSubject;
      const targetLvl = selectedLevel === 'All Levels' ? 'Basic Math Foundation' : selectedLevel;

      const res = await fetch('/api/generate-problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: targetSub,
          topic: targetLvl.includes('Basic Math') ? 'Algebra, Quadratic & Trigonometry' : 'DC/AC Circuits & Machines',
          count: 3,
          difficulty: targetLvl,
        }),
      });

      const data = await res.json();
      if (data.problems && Array.isArray(data.problems) && onAddCustomProblems) {
        const formatted: BoardProblem[] = data.problems.map((p: any, idx: number) => ({
          id: `gen-${Date.now()}-${idx}`,
          subject: (p.subject as Subject) || targetSub,
          topic: p.topic || 'Review Practice',
          subtopic: 'AI Generated',
          level: (p.level as DrillLevel) || targetLvl,
          question: p.question,
          options: p.options || ['A', 'B', 'C', 'D'],
          correctAnswer: typeof p.correctAnswer === 'number' ? p.correctAnswer : 0,
          formula: p.formula || '',
          plainEnglishExplanation: p.plainEnglishExplanation || 'Step-by-step calculation.',
          solutionSteps: Array.isArray(p.solutionSteps) ? p.solutionSteps : [p.explanation || ''],
          calculatorTrick: p.calculatorTrick || 'Follow standard Casio calculation.',
          difficulty: 'Moderate',
        }));
        onAddCustomProblems(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const answeredState = currentProblem ? answers[currentProblem.id] : undefined;
  const isBookmarked = currentProblem ? bookmarkedIds.has(currentProblem.id) : false;

  const totalAnsweredCount = Object.keys(answers).length;
  const totalCorrectCount = Object.values(answers).filter((a) => a.isCorrect).length;
  const accuracyPercent = totalAnsweredCount > 0 ? Math.round((totalCorrectCount / totalAnsweredCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Target Progress Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <span>Daily practice</span>

            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Practice questions
            </h1>

          </div>

          {/* Quick Metrics & Start from Basic button */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            {onOpenPrimer && (
              <button
                onClick={onOpenPrimer}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 rounded-xl text-xs font-semibold transition-colors"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Start with basics</span>
              </button>
            )}

            <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5">
              <div>
                <div className="text-[10px] text-slate-400">Solved</div>
                <div className="text-lg font-bold text-white tabular-nums">
                  {completedToday} <span className="text-xs font-normal text-slate-400">/ {dailyTarget}</span>
                </div>
              </div>
              <div className="border-l border-slate-700 pl-3">
                <div className="text-[10px] text-slate-400">Accuracy</div>
                <div className="text-lg font-bold text-emerald-400 tabular-nums">
                  {accuracyPercent}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 100 Problems Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Daily Goal Progress: {completedToday} / {dailyTarget} solved</span>
            <span className="font-semibold text-amber-400">
              {Math.min(100, Math.round((completedToday / dailyTarget) * 100))}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (completedToday / dailyTarget) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Level Selection Bar (Start from Basic Math) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Learning Level:
            </span>
            <span className="text-[11px] text-slate-400">
              (Choose "Basic Math" if starting with zero assumptions)
            </span>
          </div>

          {/* Quick AI Generator */}
          <button
            onClick={handleGenerateMoreProblems}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 self-start sm:self-auto"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-600 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating...' : '+ Generate AI Drills'}</span>
          </button>
        </div>

        {/* Level Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(
            [
              'All Levels',
              'Foundation: Basic Math',
              'Foundation: Basic Circuits',
              'Intermediate: AC Fundamentals',
              'Advanced: Board Exam Standard',
            ] as const
          ).map((lvl) => {
            const isActive = selectedLevel === lvl;
            const isBasic = lvl.includes('Foundation');
            return (
              <button
                key={lvl}
                onClick={() => {
                  setSelectedLevel(lvl);
                  setCurrentIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : isBasic
                    ? 'bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {isBasic && <Zap className="w-3 h-3 text-amber-500" />}
                <span>{lvl}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Mode Row */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
          <button
            onClick={() => {
              setFilterMode('all');
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterMode === 'all' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
            }`}
          >
            All Questions ({filteredProblems.length})
          </button>
          <button
            onClick={() => {
              setFilterMode('missed');
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterMode === 'missed' ? 'bg-white text-rose-600 font-semibold shadow-xs' : 'text-slate-600'
            }`}
          >
            Mistakes Only
          </button>
          <button
            onClick={() => {
              setFilterMode('bookmarked');
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterMode === 'bookmarked' ? 'bg-white text-amber-600 font-semibold shadow-xs' : 'text-slate-600'
            }`}
          >
            Saved ({bookmarkedIds.size})
          </button>
        </div>

        <span className="text-slate-400 font-mono text-[11px]">
          {currentIndex + 1} of {filteredProblems.length || 1}
        </span>
      </div>

      {/* Main Question Card */}
      {filteredProblems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">No questions match this filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try switching to "All Levels" or clicking "+ Generate AI Drills" to add more questions.
          </p>
          <button
            onClick={() => {
              setSelectedSubject('All');
              setSelectedLevel('All Levels');
              setFilterMode('all');
            }}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          {/* Question Header Bar */}
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold text-[11px]">
                {currentProblem.level}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-700 font-medium">{currentProblem.topic}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">{currentProblem.subtopic}</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Pace Timer */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono text-xs ${
                  secondsLeft < 30
                    ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
                title="Recommended pace: 120 seconds per item"
              >
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className="tabular-nums">
                  {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>

              {/* Bookmark */}
              <button
                onClick={() => toggleBookmark(currentProblem.id)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isBookmarked
                    ? 'bg-amber-50 border-amber-300 text-amber-600'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark for pre-board review'}
              >
                {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-amber-500" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Question Statement */}
          <div className="p-6 space-y-6">
            <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
              {currentProblem.question}
            </p>

            {/* Multiple Choice Options (A, B, C, D) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentProblem.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isAnswered = answeredState !== undefined;
                const isCorrectChoice = idx === currentProblem.correctAnswer;

                let buttonClass = 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 text-slate-800';

                if (isAnswered) {
                  if (isCorrectChoice) {
                    buttonClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                  } else if (isSelected && !isCorrectChoice) {
                    buttonClass = 'border-rose-500 bg-rose-50 text-rose-950 ring-1 ring-rose-500';
                  } else {
                    buttonClass = 'border-slate-100 bg-slate-50/50 text-slate-400 opacity-60';
                  }
                }

                const optionLetter = String.fromCharCode(65 + idx);

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left text-sm transition-all duration-150 ${buttonClass}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                        isAnswered && isCorrectChoice
                          ? 'bg-emerald-600 text-white'
                          : isAnswered && isSelected && !isCorrectChoice
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {optionLetter}
                    </span>
                    <span className="flex-1 pt-0.5 leading-snug">{option}</span>
                    {isAnswered && isCorrectChoice && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 self-center" />
                    )}
                    {isAnswered && isSelected && !isCorrectChoice && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 self-center" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Result Banner */}
            {answeredState && (
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {answeredState.isCorrect ? (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Correct! Target locked.
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Incorrect. Added to Mistakes queue for re-testing.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAiContextPayload({
                        topic: currentProblem.topic,
                        subtopic: currentProblem.subtopic,
                        question: currentProblem.question,
                        formula: currentProblem.formula,
                        solutionSteps: currentProblem.solutionSteps,
                      });
                      setIsAIAssistantOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ask AI Tutor (On Page)</span>
                  </button>

                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    {showSolution ? 'Hide Solution' : 'View Full Solution'}
                  </button>
                </div>
              </div>
            )}

            {/* Step-by-Step Solution Breakdown with MathRenderer */}
            {showSolution && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                {/* Formatted Clean Formula */}
                {currentProblem.formula && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      Standard Formula:
                    </span>
                    <MathRenderer
                      formula={currentProblem.formula}
                      plainEnglish={currentProblem.plainEnglishExplanation}
                      size="md"
                    />
                  </div>
                )}

                {/* Step-by-Step Calculation */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Step-by-Step Arithmetic Calculation:
                  </h4>
                  <ol className="space-y-1.5 text-xs text-slate-700 list-decimal list-inside bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    {currentProblem.solutionSteps.map((step, sIdx) => (
                      <li key={sIdx} className="leading-relaxed">
                        <span className="font-medium text-slate-900">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Casio Trick */}
                {currentProblem.calculatorTrick && (
                  <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl space-y-1">
                    <span className="text-[11px] font-bold text-sky-900 uppercase tracking-wide flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                      Casio fx-991ES Plus Execution:
                    </span>
                    <p className="text-xs text-sky-900 leading-relaxed font-sans">
                      {currentProblem.calculatorTrick}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Controls Footer */}
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Item</span>
            </button>

            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {currentIndex + 1} / {filteredProblems.length}
            </span>

            <button
              onClick={handleNext}
              disabled={currentIndex === filteredProblems.length - 1}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next Item</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Same-Page Inline AI Assistant Drawer */}
      <InlineAIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        context={aiContextPayload}
      />
    </div>
  );
};
