/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, AppTab } from './components/Navbar';
import { CurriculumStudyHub } from './components/CurriculumStudyHub';
import { DailyDrill } from './components/DailyDrill';
import { EngineeringGrapher } from './components/EngineeringGrapher';
import { AITutorAndNotes } from './components/AITutorAndNotes';
import { FormulaVault } from './components/FormulaVault';
import { RoadmapView } from './components/RoadmapView';
import { initialProblems } from './data/mockProblems';
import { BoardProblem, DailyGoalProgress } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('curriculum');
  const [problems, setProblems] = useState<BoardProblem[]>(() => {
    try {
      const saved = localStorage.getItem('ree_master_problems_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialProblems;
  });

  const [activeContextProblem, setActiveContextProblem] = useState<BoardProblem | null>(null);

  // Daily goal tracking
  const [dailyGoal, setDailyGoal] = useState<DailyGoalProgress>(() => {
    const todayStr = new Date().toDateString();
    try {
      const saved = localStorage.getItem('ree_master_daily_goal');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lastActiveDate === todayStr) {
          return parsed;
        } else {
          return {
            target: 100,
            completedToday: 0,
            streakDays: parsed.streakDays ? parsed.streakDays + 1 : 1,
            totalAnswered: parsed.totalAnswered || 0,
            totalCorrect: parsed.totalCorrect || 0,
            lastActiveDate: todayStr,
          };
        }
      }
    } catch {}
    return {
      target: 100,
      completedToday: 0,
      streakDays: 1,
      totalAnswered: 0,
      totalCorrect: 0,
      lastActiveDate: todayStr,
    };
  });

  // Save daily goal changes
  useEffect(() => {
    try {
      localStorage.setItem('ree_master_daily_goal', JSON.stringify(dailyGoal));
    } catch {}
  }, [dailyGoal]);

  // Save problems changes
  useEffect(() => {
    try {
      localStorage.setItem('ree_master_problems_v3', JSON.stringify(problems));
    } catch {}
  }, [problems]);

  const handleProblemAnswered = (problemId: string, isCorrect: boolean) => {
    setDailyGoal((prev) => ({
      ...prev,
      completedToday: prev.completedToday + 1,
      totalAnswered: prev.totalAnswered + 1,
      totalCorrect: isCorrect ? prev.totalCorrect + 1 : prev.totalCorrect,
    }));
  };

  const handleAskAIAboutProblem = (problem: BoardProblem) => {
    setActiveContextProblem(problem);
    setActiveTab('tutor');
  };

  const handleAskMentorFromCurriculum = (topic: string, question: string) => {
    setActiveContextProblem({
      id: `curr-${Date.now()}`,
      subject: 'EE Major',
      topic,
      subtopic: 'Curriculum Lesson',
      level: 'Foundation: Basic Math',
      question,
      options: [],
      correctAnswer: 0,
      formula: '',
      plainEnglishExplanation: '',
      solutionSteps: [],
      difficulty: 'Easy',
    });
    setActiveTab('tutor');
  };

  const [grapherPreset, setGrapherPreset] = useState<{
    tool?: 'phasor' | 'rlc' | 'calculator';
    params?: any;
  } | null>(null);

  const handleOpenGrapher = (preset?: { tool: 'phasor' | 'rlc' | 'calculator'; params?: any }) => {
    if (preset) {
      setGrapherPreset(preset);
    }
    setActiveTab('grapher');
  };

  const handleStartDrillForTopic = (topic: string, subject: 'Mathematics' | 'EE Major' | 'ESAS') => {
    setActiveTab('drill');
  };

  const handleAddCustomProblems = (newProblems: BoardProblem[]) => {
    setProblems((prev) => [...newProblems, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-900">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        completedToday={dailyGoal.completedToday}
        dailyTarget={dailyGoal.target}
        streakDays={dailyGoal.streakDays}
        onQuickStart={() => setActiveTab('drill')}
      />

      {/* Main Viewport Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'curriculum' && (
          <CurriculumStudyHub
            onAskMentor={handleAskMentorFromCurriculum}
            onOpenGrapher={handleOpenGrapher}
            onStartDrillForTopic={handleStartDrillForTopic}
          />
        )}

        {activeTab === 'drill' && (
          <DailyDrill
            problems={problems}
            completedToday={dailyGoal.completedToday}
            dailyTarget={dailyGoal.target}
            onProblemAnswered={handleProblemAnswered}
            onAskAIAboutProblem={handleAskAIAboutProblem}
            onAddCustomProblems={handleAddCustomProblems}
            onOpenPrimer={() => setActiveTab('curriculum')}
          />
        )}

        {activeTab === 'grapher' && (
          <EngineeringGrapher
            key={JSON.stringify(grapherPreset)}
            initialTool={grapherPreset?.tool}
            initialParams={grapherPreset?.params}
          />
        )}

        {activeTab === 'tutor' && (
          <AITutorAndNotes
            activeContextProblem={activeContextProblem}
            onClearContext={() => setActiveContextProblem(null)}
            onAddProblemsToDrill={handleAddCustomProblems}
          />
        )}

        {activeTab === 'formulas' && <FormulaVault />}

        {activeTab === 'roadmap' && (
          <RoadmapView
            completedToday={dailyGoal.completedToday}
            dailyTarget={dailyGoal.target}
            totalSolved={dailyGoal.totalAnswered}
          />
        )}
      </main>

      {/* Clean Engineering Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">REE Master</span>
            <span>·</span>
            <span>Registered Electrical Engineer Licensure Examination Review</span>
          </div>
          <div>
            <span>Target Board Exam: April 27</span>
            <span className="mx-2">·</span>
            <span>Cebu 6-Month Comprehensive Review Curriculum</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
