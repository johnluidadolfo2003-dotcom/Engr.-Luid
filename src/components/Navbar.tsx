import React from 'react';
import { Target, Cpu, MessageSquareText, BookOpen, Calendar, Zap, GraduationCap, Layers } from 'lucide-react';

export type AppTab = 'curriculum' | 'drill' | 'grapher' | 'tutor' | 'formulas' | 'roadmap';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  completedToday: number;
  dailyTarget: number;
  streakDays: number;
  onQuickStart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  completedToday,
  dailyTarget,
  streakDays,
  onQuickStart,
}) => {
  const navItems = [
    { id: 'curriculum', label: 'Curriculum (Start Here)', icon: GraduationCap, highlight: true },
    { id: 'drill', label: 'Daily 100 Drill', icon: Target },
    { id: 'grapher', label: 'Grapher Workbench', icon: Cpu },
    { id: 'tutor', label: 'AI Tutor & Notes', icon: MessageSquareText },
    { id: 'formulas', label: 'Formula Vault', icon: BookOpen },
    { id: 'roadmap', label: '6-Month Roadmap', icon: Calendar },
  ] as const;

  const progressPercent = Math.min(100, Math.round((completedToday / dailyTarget) * 100));

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('curriculum')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-colors">
              <Zap className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white block leading-tight">
                REE Master
              </span>
              <span className="text-[11px] text-slate-400 block font-normal leading-none mt-0.5">
                April 27 Board Exam Prep
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isCurriculum = item.id === 'curriculum';
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-amber-400 shadow-sm'
                    : isCurriculum
                    ? 'text-amber-300 hover:text-amber-200 hover:bg-slate-800/80 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-amber-400' : isCurriculum ? 'text-amber-400' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Daily Goal Counter */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg text-xs">
            <div className="flex flex-col">
              <div className="flex items-center justify-between text-[11px] text-slate-400 gap-2">
                <span>Drill Today:</span>
                <span className="font-semibold text-white tabular-nums">
                  {completedToday}/{dailyTarget}
                </span>
              </div>
              <div className="w-20 bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="border-l border-slate-700 pl-2.5 flex items-center gap-1 text-amber-400 font-medium">
              <span className="text-xs">🔥</span>
              <span className="tabular-nums">{streakDays}d</span>
            </div>
          </div>

          <button
            onClick={onQuickStart}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm whitespace-nowrap"
          >
            Start Drill
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Nav row */}
      <div className="lg:hidden border-t border-slate-800 bg-slate-900/95 overflow-x-auto px-2 py-1.5 flex gap-1 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
