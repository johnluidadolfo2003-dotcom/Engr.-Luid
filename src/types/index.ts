export type Subject = 'Mathematics' | 'EE Major' | 'ESAS';

export type CurriculumTrack = 'mathematics' | 'electrical' | 'esas';

export type DrillLevel =
  | 'Foundation: Basic Math'
  | 'Foundation: Basic Circuits'
  | 'Intermediate: AC Fundamentals'
  | 'Advanced: Board Exam Standard';

export interface CurriculumFormula {
  name: string;
  formula: string;
  explanation: string;
  variables: string;
  units: string;
}

export interface CurriculumExample {
  problem: string;
  given: string[];
  stepByStep: string[];
  answer: string;
  calculatorShortcut?: string;
}

export interface CurriculumPracticeQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  formula?: string;
}

export interface CurriculumLesson {
  id: string;
  track: CurriculumTrack;
  stageNumber: number;
  stageTitle: string;
  lessonNumber: string;
  title: string;
  summary: string;
  whyItMatters: string;
  prerequisites: string;
  zeroKnowledgeAnalogy?: string;
  interactiveTool?: 'ohms_law' | 'power_triangle' | 'quadratic_solver' | 'kinematics_calc' | 'carnot_calc' | 'grapher_phasor' | 'grapher_rlc';
  grapherPreset?: {
    tool: 'phasor' | 'rlc' | 'calculator';
    voltage?: number;
    current?: number;
    phaseAngleDeg?: number;
    isLagging?: boolean;
    rVal?: number;
    lValMilliH?: number;
    cValMicroF?: number;
    freq?: number;
  };
  coreTheory: string[];
  formulas: CurriculumFormula[];
  workedExample: CurriculumExample;
  quickPractice: CurriculumPracticeQuestion[];
  boardExamTip: string;
  visual?: 'steps' | 'balance' | 'triangle' | 'wave' | 'circuit' | 'flow' | 'graph' | 'energy' | 'scale';
  visualLabels?: [string, string, string];
}

export interface CurriculumStage {
  stageNumber: number;
  stageTitle: string;
  track: CurriculumTrack;
  description: string;
  lessons: CurriculumLesson[];
}

export interface BoardProblem {
  id: string;
  subject: Subject;
  topic: string;
  subtopic: string;
  level: DrillLevel;
  question: string;
  options: string[];
  correctAnswer: number; // 0, 1, 2, 3
  formula: string;
  plainEnglishExplanation: string;
  solutionSteps: string[];
  calculatorTrick?: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  isBookmarked?: boolean;
  userAnswer?: number;
  isCorrect?: boolean;
}

export interface FormulaItem {
  id: string;
  subject: Subject;
  category: string;
  title: string;
  level: DrillLevel;
  formula: string;
  variables: string;
  plainEnglish: string;
  boardExamTip: string;
  units: string;
}

export interface ReviewMaterial {
  id: string;
  title: string;
  uploadedAt: string;
  subject: Subject;
  summary: string[];
  keyFormulas: string[];
  boardExamTips: string[];
  generatedDrills: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    formula?: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedQuestions?: string[];
}

export interface DailyGoalProgress {
  target: number;
  completedToday: number;
  streakDays: number;
  totalAnswered: number;
  totalCorrect: number;
  lastActiveDate: string;
}
