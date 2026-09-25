import React, { useState, useMemo } from 'react';
import { formulaVault } from '../data/formulaDatabase';
import { Subject, FormulaItem, DrillLevel } from '../types';
import { MathRenderer } from './MathRenderer';
import { Search, BookOpen, Copy, Check, Zap, Filter, GraduationCap } from 'lucide-react';

interface FormulaVaultProps {
  onSelectFormulaForPractice?: (formula: FormulaItem) => void;
}

export const FormulaVault: React.FC<FormulaVaultProps> = ({ onSelectFormulaForPractice }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'All'>('All');
  const [selectedLevel, setSelectedLevel] = useState<DrillLevel | 'All Levels'>('All Levels');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredFormulas = useMemo(() => {
    return formulaVault.filter((item) => {
      if (selectedSubject !== 'All' && item.subject !== selectedSubject) return false;
      if (selectedLevel !== 'All Levels' && item.level !== selectedLevel) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.formula.toLowerCase().includes(q) ||
        item.boardExamTip.toLowerCase().includes(q) ||
        item.plainEnglish.toLowerCase().includes(q) ||
        item.variables.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedSubject, selectedLevel]);

  const handleCopy = (formula: FormulaItem) => {
    navigator.clipboard.writeText(formula.formula);
    setCopiedId(formula.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-1">
              <span>Standard Engineering Formulas & Plain-English Meanings</span>
              <span>·</span>
              <span>Zero-Knowledge to Board Exam</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Formula Vault & Memory Guide
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Clean formula reference cards. Every formula explains the plain-English physical meaning of each variable, how to substitute numbers, and the Casio calculator shortcut.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any formula (e.g. 'Ohm', 'Quadratic', 'Trig', 'Power Factor', 'Resonance', 'Transformer')..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(
            [
              'All Levels',
              'Foundation: Basic Math',
              'Foundation: Basic Circuits',
              'Intermediate: AC Fundamentals',
              'Advanced: Board Exam Standard',
            ] as const
          ).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedLevel === lvl
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Formula Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFormulas.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    <span className="font-semibold text-amber-800">{item.level}</span>
                    <span>·</span>
                    <span>{item.category}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                    {item.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleCopy(item)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
                  title="Copy Formula"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Clean Math Rendering with MathRenderer */}
              <MathRenderer formula={item.formula} size="md" />

              {/* Plain English Meaning */}
              <div className="mt-3 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs space-y-1">
                <span className="font-bold text-amber-950 uppercase text-[10px] tracking-wider block">
                  Plain-English Meaning (Zero Assumptions):
                </span>
                <p className="text-amber-900 text-[11px] leading-relaxed">
                  {item.plainEnglish}
                </p>
              </div>

              {/* Variables */}
              <div className="text-xs text-slate-600 space-y-1 mt-3">
                <span className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider block">
                  Variables & Units:
                </span>
                <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                  {item.variables}
                </p>
                <div className="text-[10px] text-slate-400 font-mono">
                  Units: {item.units}
                </div>
              </div>
            </div>

            {/* Board Exam Tip */}
            <div className="p-2.5 bg-sky-50/70 border border-sky-200/80 rounded-lg text-xs space-y-0.5">
              <span className="font-bold text-sky-950 text-[10px] uppercase flex items-center gap-1">
                <Zap className="w-3 h-3 text-sky-600" />
                Casio 991ES Trick / Board Tip:
              </span>
              <p className="text-sky-900 text-[11px] leading-relaxed">
                {item.boardExamTip}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
