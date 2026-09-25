import React, { useState, useEffect } from 'react';
import { Calendar, Target, CheckCircle2, Clock, Award, Compass, Zap, ArrowRight } from 'lucide-react';

interface RoadmapViewProps {
  completedToday: number;
  dailyTarget: number;
  totalSolved: number;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  completedToday,
  dailyTarget,
  totalSolved,
}) => {
  // Target: April 27th Board Exam
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Current date calculation towards April 27
    const calculateCountdown = () => {
      const now = new Date();
      let targetYear = now.getFullYear();
      // If now is past April 27 in current year, target next year's April 27
      let examDate = new Date(targetYear, 3, 27, 8, 0, 0); // April is month index 3
      if (now > examDate) {
        examDate = new Date(targetYear + 1, 3, 27, 8, 0, 0);
      }

      const diff = examDate.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set([0]));

  const togglePhase = (index: number) => {
    setCompletedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const reviewPhases = [
    {
      month: 'Month 1 (October · Cebu Kickoff)',
      title: 'Foundation Mathematics & DC Circuit Theorems',
      focus: ['Advanced Algebra, Trigonometry, Analytic Geometry', 'Differential Calculus: Maxima/Minima, Tangents', 'DC Circuits: Thevenin, Norton, Nodal Analysis, Max Power'],
      targetProblems: 1500,
      status: 'In Progress',
    },
    {
      month: 'Month 2 (November)',
      title: 'Integral Calculus, Differential Equations & AC Circuits',
      focus: ['Integral Calculus: Area, Volume, Centroids, Work', 'First & Second Order Linear DE, Laplace Transforms', 'Single-Phase & 3-Phase AC Circuits, Phasor Diagrams, Power Factor'],
      targetProblems: 3000,
      status: 'Upcoming',
    },
    {
      month: 'Month 3 (December)',
      title: 'Electrical Machines: Transformers & DC Machinery',
      focus: ['Transformers: Open/Short circuit tests, Voltage Regulation, Auto-transformers', 'DC Generators & Motors: EMF equation, Torque, Speed Control, Armature Reaction'],
      targetProblems: 4500,
      status: 'Upcoming',
    },
    {
      month: 'Month 4 (January)',
      title: 'AC Machinery & Philippine Electrical Code (PEC)',
      focus: ['3-Phase Induction Motors: Slip, Torque-Speed characteristics, Rotor frequency', 'Synchronous Alternators: Synchronous Reactance, Power Angle, V-Curves', 'PEC 1: Wire ampacity, Motor branch circuit overcurrent protection, Grounding'],
      targetProblems: 6000,
      status: 'Upcoming',
    },
    {
      month: 'Month 5 (February)',
      title: 'Power Systems, Symmetrical Components & Fault Analysis',
      focus: ['Transmission Lines: ABCD parameters, Surge Impedance, Ferranti Effect', 'Symmetrical Components: Positive, Negative, Zero sequence networks', 'Fault Calculations: 3-Phase Symmetrical & Single Line-to-Ground (SLG) Faults'],
      targetProblems: 7500,
      status: 'Upcoming',
    },
    {
      month: 'Month 6 (March – April 26 · Final Push)',
      title: 'ESAS Mastery & Full 100-Problem Speed Pre-Boards',
      focus: ['ESAS: Thermodynamics, Engineering Mechanics, Economy, EE Laws & Ethics', 'Daily 100-Problem Speed Drills under exact PRC Board time constraints', 'Pre-board mock exams review & elimination of mistake notebook questions'],
      targetProblems: 9000,
      status: 'Final Stretch',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Target Countdown Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold tracking-wide uppercase">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Target: Registered Electrical Engineer (REE) Licensure</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Countdown to April 27th Board Exam
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Cebu 6-Month Intensive Review Program. Consistent 100-problem daily sprints ensure complete mastery of Mathematics and EE Major subjects before exam day.
            </p>
          </div>

          {/* Countdown timer blocks */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
            <div className="bg-slate-800/90 border border-slate-700/60 p-3 sm:p-4 rounded-xl min-w-[70px]">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-400 tabular-nums block">
                {timeLeft.days}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Days</span>
            </div>
            <div className="bg-slate-800/90 border border-slate-700/60 p-3 sm:p-4 rounded-xl min-w-[70px]">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums block">
                {timeLeft.hours.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Hours</span>
            </div>
            <div className="bg-slate-800/90 border border-slate-700/60 p-3 sm:p-4 rounded-xl min-w-[70px]">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums block">
                {timeLeft.minutes.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Mins</span>
            </div>
            <div className="bg-slate-800/90 border border-slate-700/60 p-3 sm:p-4 rounded-xl min-w-[70px]">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-400 tabular-nums block">
                {timeLeft.seconds.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Secs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pace & Study Strategy Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">
          <div className="text-[11px] text-slate-500 uppercase font-semibold">Daily Solved vs Target</div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {completedToday} <span className="text-sm font-normal text-slate-400">/ {dailyTarget} items</span>
          </div>
          <p className="text-xs text-slate-500 pt-1">
            Hitting 100/day creates automatic intuition and calculator muscle memory for the board exam.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">
          <div className="text-[11px] text-slate-500 uppercase font-semibold">Total Solved in Review</div>
          <div className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
            {totalSolved} <span className="text-sm font-normal text-slate-400">problems</span>
          </div>
          <p className="text-xs text-slate-500 pt-1">
            Top REE board exam passers typically solve between 5,000 to 10,000 problems throughout their 6-month review.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">
          <div className="text-[11px] text-slate-500 uppercase font-semibold">Cebu Review Strategy</div>
          <div className="text-base font-bold text-slate-900">
            High Yield · Zero Fluff
          </div>
          <p className="text-xs text-slate-500 pt-1">
            Minimize passive reading time. Maximize step-by-step problem drill speed and Casio 991ES execution.
          </p>
        </div>
      </div>

      {/* 6-Month Timeline Milestones */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            6-Month Cebu Review Syllabus & Progression Timeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Check off phases as your review center progresses through the official PRC Board Examination curriculum.
          </p>
        </div>

        <div className="space-y-4">
          {reviewPhases.map((phase, idx) => {
            const isDone = completedPhases.has(idx);
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-colors ${
                  isDone
                    ? 'bg-slate-50/80 border-slate-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-amber-700">{phase.month}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        Target Milestone: ~{phase.targetProblems.toLocaleString()} problems
                      </span>
                    </div>

                    <h3 className={`text-sm sm:text-base font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {phase.title}
                    </h3>

                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pt-1">
                      {phase.focus.map((topic, tIdx) => (
                        <li key={tIdx}>{topic}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => togglePhase(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shrink-0 ${
                      isDone
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${isDone ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{isDone ? 'Completed' : 'Mark Done'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
