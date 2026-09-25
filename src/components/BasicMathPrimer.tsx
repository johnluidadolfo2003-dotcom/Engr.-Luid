import React, { useState } from 'react';
import { MathRenderer } from './MathRenderer';
import {
  BookOpen,
  HelpCircle,
  Calculator,
  Compass,
  Zap,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface BasicMathPrimerProps {
  onStartBasicDrill: () => void;
  onAskMentor: (topic: string) => void;
}

export const BasicMathPrimer: React.FC<BasicMathPrimerProps> = ({
  onStartBasicDrill,
  onAskMentor,
}) => {
  const [activeModule, setActiveModule] = useState<number>(0);

  const modules = [
    {
      id: 'algebra',
      title: '1. Basic Algebra & Isolating Variables',
      subtitle: 'The golden rule: Whatever you do to one side, do to the other side',
      icon: Calculator,
      content: {
        intro:
          'In engineering exams, you never need to memorize 50 different versions of a formula. You only need to know how to isolate the variable you want.',
        goldenTriangle: {
          concept: 'Ohm’s Law Rearrangement:',
          formula: 'V = I × R   ⟹   I = V ÷ R   ⟹   R = V ÷ I',
          explanation:
            'If you want Current (I), divide both sides by R. If you want Resistance (R), divide both sides by I.',
        },
        keyRules: [
          'Addition undoes Subtraction: If a number is added (+), subtract it from both sides.',
          'Multiplication undoes Division: If a variable is in the denominator, multiply both sides by it first.',
          'Squares undo Square Roots: If a variable is inside √( ... ), square both sides: (√x)² = x.',
          'Quadratic Formula: For ax² + bx + c = 0, roots are x = [-b ± √(b² - 4ac)] ÷ 2a.',
        ],
        tryIt: {
          question: 'Solve for Current I if Voltage V = 230 V and Power P = 4,600 W (Formula: P = V × I):',
          steps: ['Divide both sides by V: I = P ÷ V', 'Substitute numbers: I = 4,600 ÷ 230', 'Answer: I = 20 Amperes (A)'],
        },
      },
    },
    {
      id: 'trig',
      title: '2. Right Triangle Trigonometry (SOH-CAH-TOA)',
      subtitle: 'Every AC circuit and Power Triangle is secretly a right triangle!',
      icon: Compass,
      content: {
        intro:
          'In electrical engineering, Alternating Current (AC) produces two kinds of effects at 90° to each other: Real Resistance (horizontal) and Reactive Inductance/Capacitance (vertical). The total is the Hypotenuse (diagonal)!',
        goldenTriangle: {
          concept: 'The 3 Golden Ratios (SOH - CAH - TOA):',
          formula: 'sin(θ) = Opposite ÷ Hypotenuse,   cos(θ) = Adjacent ÷ Hypotenuse,   tan(θ) = Opposite ÷ Adjacent',
          explanation:
            'Notice that cos(θ) = Adjacent / Hypotenuse. In power systems, Adjacent is Real Power (kW) and Hypotenuse is Apparent Power (kVA). That is why Power Factor is literally cos(θ)!',
        },
        keyRules: [
          'Pythagorean Theorem: Hypotenuse² = Base² + Height²  ⟹  c = √(a² + b²).',
          'Power Triangle: S = √(P² + Q²), where S is kVA, P is kW, Q is kVAR.',
          'Impedance Triangle: Z = √(R² + X²), where Z is total Ohms, R is resistance, X is reactance.',
          'The 3-4-5 Triangle: If Base = 3 and Height = 4, Hypotenuse is always 5. Angle = 53.13°, and cos(53.13°) = 0.60.',
        ],
        tryIt: {
          question: 'A motor draws 3 kW of real power and 4 kVAR of reactive power. What is total apparent power S and power factor?',
          steps: [
            'Hypotenuse S = √(3² + 4²) = √(9 + 16) = √25 = 5 kVA',
            'Power factor pf = cos(θ) = Base ÷ Hypotenuse = 3 ÷ 5 = 0.60 lagging',
          ],
        },
      },
    },
    {
      id: 'complex',
      title: '3. Complex Numbers & The Imaginary Unit j',
      subtitle: 'What is j and why do electrical engineers use it instead of i?',
      icon: Zap,
      content: {
        intro:
          'In pure math, √(-1) is written as "i". But in electrical engineering, "i" is already reserved for electrical Current! So engineers use "j" to represent √(-1). It simply indicates a 90° counter-clockwise rotation on a graph.',
        goldenTriangle: {
          concept: 'Impedance Representation:',
          formula: 'Z = R + jX   ⟹   Polar form: |Z| ∠ θ',
          explanation:
            'R is pure resistance (in phase). +jX_L is inductive reactance (coils/motors). -jX_C is capacitive reactance (capacitors).',
        },
        keyRules: [
          'Rectangular form: Z = a + jb (used when adding series components: (2+j3) + (4+j1) = 6+j4).',
          'Polar form: Z = |Z| ∠ θ (used when multiplying or dividing voltages: V = I × Z).',
          'Converting Rectangular to Polar: |Z| = √(a² + b²), θ = arctan(b ÷ a).',
          'Casio Mode 2 CMPLX handles all complex math automatically without manual algebra!',
        ],
        tryIt: {
          question: 'Convert the circuit impedance Z = 12 + j16 Ω into Polar form (|Z| ∠ θ):',
          steps: [
            'Magnitude |Z| = √(12² + 16²) = √(144 + 256) = √400 = 20 Ω',
            'Angle θ = arctan(16 ÷ 12) = arctan(1.333) = 53.13°',
            'Polar result: 20 Ω ∠ 53.13°',
          ],
        },
      },
    },
    {
      id: 'circuits',
      title: '4. Basic DC Circuits & Ohm’s Law',
      subtitle: 'The 3 building blocks: Voltage, Current, and Resistance',
      icon: BookOpen,
      content: {
        intro:
          'Electricity is like water flowing through pipes: Voltage is water pressure (pump), Current is the water flow rate (gallons per second), and Resistance is a pipe restriction (narrow valve).',
        goldenTriangle: {
          concept: 'Ohm’s Law & Electric Power:',
          formula: 'V = I × R,   P = V × I = I² × R = V² ÷ R',
          explanation:
            'Volts = Amperes × Ohms. Watts = Volts × Amperes. All electrical work comes from these two relationships.',
        },
        keyRules: [
          'Series Circuits: Current is identical through all components. Resistances add directly: R_total = R1 + R2 + ...',
          'Parallel Circuits: Voltage is identical across all parallel branches. Total resistance is smaller than any individual branch: R_eq = (R1 × R2) ÷ (R1 + R2).',
          'Kirchhoff’s Current Law (KCL): Total current entering a junction equals total current leaving.',
          'Kirchhoff’s Voltage Law (KVL): The sum of all voltage drops around any closed loop equals the source voltage.',
        ],
        tryIt: {
          question: 'Two resistors of 30 Ω and 60 Ω are connected in parallel. What is their combined resistance?',
          steps: [
            'Use Product over Sum: (R1 × R2) ÷ (R1 + R2)',
            'Product = 30 × 60 = 1,800',
            'Sum = 30 + 60 = 90',
            'R_eq = 1,800 ÷ 90 = 20 Ω',
          ],
        },
      },
    },
    {
      id: 'calculator',
      title: '5. Casio fx-991ES / fx-570ES Calculator Setup',
      subtitle: 'The secret weapon for passing the Philippine Board Exam in half the time',
      icon: Calculator,
      content: {
        intro:
          'The PRC allows non-programmable scientific calculators like Casio fx-991ES Plus and fx-570ES Plus. Mastering their built-in functions eliminates 80% of manual calculation errors.',
        goldenTriangle: {
          concept: 'Essential PRC Board Exam Calculator Modes:',
          formula: '[MODE] → [2: CMPLX] for AC Circuits | [MODE] → [5: EQN] for Algebra',
          explanation:
            'In CMPLX mode, you can type complex numbers directly using the [ENG] key for "i" (which represents j in electrical circuits).',
        },
        keyRules: [
          'Mode 2 (CMPLX): Press [SHIFT] → [2] to convert between Rectangular (a+bi) and Polar (r∠θ).',
          'Degree vs Radian: Ensure the screen shows "D" (Degrees). Press [SHIFT] → [MODE:SETUP] → [3: Deg].',
          'Equation Solver: Mode 5 EQN: Option 1 for 2 equations with 2 unknowns (KCL node equations); Option 3 for quadratic equations ax²+bx+c=0.',
          'Parallel Resistors: Use the [x⁻¹] key. For 20 Ω || 30 Ω, type: (20⁻¹ + 30⁻¹)⁻¹ = 12 Ω.',
        ],
        tryIt: {
          question: 'How to calculate 230∠0° ÷ (3 + j4) directly in Casio Mode 2 CMPLX:',
          steps: [
            'Step 1: Set calculator to [MODE] → [2: CMPLX]',
            'Step 2: Type 230 ÷ (3 + 4[ENG])',
            'Step 3: Press [SHIFT] → [2: CMPLX] → [3: ►r∠θ] → [=]',
            'Step 4: Screen displays 46 ∠ -53.13° Amperes in 3 seconds!',
          ],
        },
      },
    },
  ];

  const currentMod = modules[activeModule];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-1">
              <span>Foundation Primer · Zero-Knowledge Mode</span>
              <span>·</span>
              <span>Start from Basic Math</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Essential Math & Electrical Fundamentals
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Don't worry if your math background feels rusty. Every advanced REE board exam problem is built directly on these 5 simple building blocks.
            </p>
          </div>

          <button
            onClick={onStartBasicDrill}
            className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto shrink-0"
          >
            <span>Practice Basic Drills</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Module Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {modules.map((m, idx) => {
          const Icon = m.icon;
          const isActive = activeModule === idx;
          return (
            <button
              key={m.id}
              onClick={() => setActiveModule(idx)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{m.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Module Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Module Title Deck */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {currentMod.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{currentMod.subtitle}</p>
          </div>

          <button
            onClick={() => onAskMentor(currentMod.title)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg text-xs font-medium transition-colors self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Ask Engr. Lex to Explain More</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Introduction paragraph */}
          <p className="text-sm text-slate-700 leading-relaxed">
            {currentMod.content.intro}
          </p>

          {/* Golden Triangle / Core Formula */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Core Concept & Master Formula:
            </span>
            <MathRenderer
              formula={currentMod.content.goldenTriangle.formula}
              plainEnglish={currentMod.content.goldenTriangle.explanation}
              size="lg"
            />
          </div>

          {/* Key Rules list */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Essential Rules to Keep in Mind:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentMod.content.keyRules.map((rule, rIdx) => (
                <div
                  key={rIdx}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Worked Example */}
          <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-950 uppercase tracking-wide">
              <Zap className="w-4 h-4 text-sky-600" />
              <span>Worked Step-by-Step Example (Zero Jargon):</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-900">
              {currentMod.content.tryIt.question}
            </p>
            <ol className="space-y-1.5 text-xs text-sky-950 list-decimal list-inside bg-white p-3 rounded-lg border border-sky-200/70">
              {currentMod.content.tryIt.steps.map((st, sIdx) => (
                <li key={sIdx} className="font-mono text-[11px] sm:text-xs">
                  {st}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setActiveModule((prev) => Math.max(0, prev - 1))}
            disabled={activeModule === 0}
            className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous Module
          </button>

          <span className="text-xs text-slate-500 font-mono">
            Module {activeModule + 1} of {modules.length}
          </span>

          <button
            onClick={() => setActiveModule((prev) => Math.min(modules.length - 1, prev + 1))}
            disabled={activeModule === modules.length - 1}
            className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next Module
          </button>
        </div>
      </div>
    </div>
  );
};
