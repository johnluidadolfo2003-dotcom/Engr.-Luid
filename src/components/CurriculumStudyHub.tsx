import React, { useEffect, useRef, useState } from 'react';
import { CurriculumLesson, CurriculumStage, CurriculumTrack } from '../types';
import { fullMathematicsStages, fullElectricalStages, fullEsasStages } from '../data/curriculumData';
import { LessonVisual } from './LessonVisual';
import { formatEngineeringFormula } from './MathRenderer';
import { CurriculumInteractiveLab } from './CurriculumInteractiveLab';
import { InlineAIAssistant, AIContextPayload } from './InlineAIAssistant';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, Search, Sparkles, X } from 'lucide-react';

interface Props {
  onAskMentor: (topic: string, question: string) => void;
  onOpenGrapher: (preset?: { tool: 'phasor' | 'rlc' | 'calculator'; params?: any }) => void;
  onStartDrillForTopic: (topic: string, subject: 'Mathematics' | 'EE Major' | 'ESAS') => void;
}

const tracks: { id: CurriculumTrack; name: string; detail: string; stages: CurriculumStage[] }[] = [
  { id: 'mathematics', name: 'Mathematics', detail: 'Numbers → calculus', stages: fullMathematicsStages },
  { id: 'electrical', name: 'Electrical Engineering', detail: 'Charge → power systems', stages: fullElectricalStages },
  { id: 'esas', name: 'ESAS', detail: 'Units → professional practice', stages: fullEsasStages },
];

function compact(text: string, max = 155) {
  const first = text.split(/(?<=[.!?])\s+/)[0];
  return first.length > max ? `${first.slice(0, max).replace(/\s+\S*$/, '')}…` : first;
}

export const CurriculumStudyHub: React.FC<Props> = ({ onAskMentor, onOpenGrapher }) => {
  const [track, setTrack] = useState<CurriculumTrack>('mathematics');
  const [selectedId, setSelectedId] = useState('math-1-1');
  const [search, setSearch] = useState('');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('ree_completed_lessons') || '[]')); } catch { return new Set(); }
  });
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [context, setContext] = useState<AIContextPayload | null>(null);
  const practiceRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const currentTrack = tracks.find(t => t.id === track)!;
  const lessons = currentTrack.stages.flatMap(s => s.lessons);
  const selected = lessons.find(l => l.id === selectedId) || lessons[0];
  const index = lessons.findIndex(l => l.id === selected.id);
  const done = lessons.filter(l => completed.has(l.id)).length;
  const questions = selected.quickPractice.slice(0, 2);
  const allCorrect = questions.length > 0 && questions.every(q => answers[q.id] === q.correctAnswer);

  useEffect(() => { try { localStorage.setItem('ree_completed_lessons', JSON.stringify([...completed])); } catch {} }, [completed]);
  const select = (lesson: CurriculumLesson) => {
    setSelectedId(lesson.id); setAnswers({}); setRevealed(false);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const selectTrack = (id: CurriculumTrack) => {
    setTrack(id); setSelectedId(tracks.find(t => t.id === id)!.stages[0].lessons[0].id);
    setAnswers({}); setRevealed(false); setSearch('');
  };
  const markDone = () => setCompleted(prev => {
    const next = new Set(prev); if (next.has(selected.id)) next.delete(selected.id); else next.add(selected.id); return next;
  });
  const ask = () => {
    setContext({ topic: selected.title, subtopic: selected.stageTitle, question: selected.summary, formula: selected.formulas[0]?.formula, boardTip: selected.boardExamTip });
    setAssistantOpen(true);
  };

  return <div ref={topRef} className="review-page">
    <section className="review-hero">
      <div><div className="review-eyebrow">THE REVIEW DESK / REE</div><h1>Understand it.<br/><em>Then remember it.</em></h1><p>One idea, one visual, one worked example. Move from the basics through the three review subjects at your own pace.</p></div>
      <div className="review-progress"><span>YOUR COURSE</span><strong>{done}<small> / {lessons.length}</small></strong><div className="review-meter"><i style={{width: `${100 * done / lessons.length}%`}}/></div><span>lessons completed in {currentTrack.name}</span></div>
    </section>
    <div className="review-tracks" role="tablist" aria-label="Review subjects">
      {tracks.map((t, i) => <button key={t.id} role="tab" aria-selected={track === t.id} onClick={() => selectTrack(t.id)} className={track === t.id ? 'active' : ''}><span className="track-number">0{i+1}</span><span><strong>{t.name}</strong><small>{t.detail}</small></span><span className="track-count">{t.stages.reduce((n,s) => n+s.lessons.length,0)} lessons</span></button>)}
    </div>
    <div className="review-layout">
      <aside className="review-sidebar" aria-label="Lesson directory">
        <div className="sidebar-heading"><span>COURSE INDEX</span><strong>{lessons.length} lessons</strong></div>
        <label className="review-search"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a lesson" aria-label="Find a lesson"/>{search && <button aria-label="Clear search" onClick={() => setSearch('')}><X size={14}/></button>}</label>
        <div className="review-stage-list">
          {currentTrack.stages.map(stage => {
            const filtered = stage.lessons.filter(l => `${l.title} ${l.summary}`.toLowerCase().includes(search.toLowerCase()));
            if (!filtered.length) return null;
            return <section key={stage.stageNumber} className="review-stage"><h2>{stage.stageTitle.replace(/^Stage /, '').replace(/^\d+: /, '')}<small>{stage.lessons.filter(l => completed.has(l.id)).length}/{stage.lessons.length}</small></h2>
              {filtered.map(l => <button key={l.id} className={`review-lesson-link ${selected.id === l.id ? 'active' : ''}`} onClick={() => select(l)}><span>{l.lessonNumber}</span><strong>{l.title}</strong>{completed.has(l.id) && <Check size={15} aria-label="Complete"/>}</button>)}
            </section>;
          })}
        </div>
      </aside>
      <article className="review-article" key={selected.id}>
        <div className="lesson-header"><div className="lesson-kicker"><span>LESSON {selected.lessonNumber}</span><span>·</span><span>{selected.stageTitle.replace(/^Stage \d+: /, '').replace(/^\d+\. /, '')}</span></div><h2>{selected.title}</h2><p>{compact(selected.summary, 210)}</p><div className="lesson-actions"><button onClick={markDone} className={completed.has(selected.id) ? 'completed' : ''}><Check size={16}/>{completed.has(selected.id) ? 'Completed' : 'Mark complete'}</button><button onClick={ask}><Sparkles size={16}/> Ask a question</button></div></div>
        <div className="lesson-content">
          <LessonVisual lesson={selected}/>
          <section className="lesson-section"><div className="section-label"><span>01 / THE IDEA</span><span>Read → picture it</span></div><div className="idea-grid"><div className="idea-main"><h3>What’s happening?</h3><p>{compact(selected.coreTheory[0] || selected.summary, 260)}</p></div><div className="idea-memory"><span>REMEMBER THIS</span><strong>{compact(selected.boardExamTip, 125)}</strong></div></div>{selected.coreTheory.length > 1 && <details className="more-detail"><summary>More detail <ChevronDown size={15}/></summary><ul>{selected.coreTheory.slice(1).map((line,i)=><li key={i}>{line}</li>)}</ul></details>}</section>
          {selected.interactiveTool && <section className="lesson-section"><div className="section-label"><span>TRY IT / LIVE MODEL</span></div><CurriculumInteractiveLab toolType={selected.interactiveTool} lessonTitle={selected.title} onOpenGrapher={onOpenGrapher}/></section>}
          <section className="lesson-section"><div className="section-label"><span>02 / THE RELATIONSHIP</span><span>Know what each symbol means</span></div><div className="formula-stack">{selected.formulas.map((f,i)=><div className="formula-card" key={i}><div><span>{f.name}</span><small>{f.variables}</small></div><strong className="math-expression">{formatEngineeringFormula(f.formula)}</strong></div>)}</div></section>
          <section className="lesson-section"><div className="section-label"><span>03 / WORK ONE OUT</span><span>Follow the numbers</span></div><div className="worked-card"><h3>{compact(selected.workedExample.problem, 260)}</h3><div className="given-row">{selected.workedExample.given.map((g,i)=><span key={i}>{g}</span>)}</div><ol>{selected.workedExample.stepByStep.map((s,i)=><li key={i}><span>{String(i+1).padStart(2,'0')}</span><p>{s.replace(/^Step \d+\s*(\([^)]*\))?\s*:\s*/, '')}</p></li>)}</ol><div className="worked-answer"><span>RESULT</span><strong>{selected.workedExample.answer}</strong></div></div></section>
          <section ref={practiceRef} className="lesson-section"><div className="section-label"><span>04 / RECALL</span><span>Try before revealing</span></div>{questions.map(q => <div className="recall-card" key={q.id}><h3>{q.question}</h3><div className="recall-options">{q.options.map((option,i)=><button key={i} disabled={answers[q.id] !== undefined} onClick={() => setAnswers(prev => ({...prev,[q.id]:i}))} className={answers[q.id] === undefined ? '' : i === q.correctAnswer ? 'correct' : answers[q.id] === i ? 'incorrect' : 'muted'}><span>{String.fromCharCode(65+i)}</span>{option}</button>)}</div>{answers[q.id] !== undefined && <div className="recall-feedback"><strong>{answers[q.id] === q.correctAnswer ? 'Exactly right.' : 'Try the relationship again.'}</strong><p>{compact(q.explanation, 250)}</p></div>}</div>)}{!questions.length && <p>Review the example, then explain the relationship aloud in one sentence.</p>}{allCorrect && !completed.has(selected.id) && <button className="review-primary" onClick={markDone}><Check size={16}/> Save as completed</button>}</section>
        </div>
        <footer className="lesson-footer"><button disabled={index===0} onClick={() => select(lessons[index-1])}><ArrowLeft size={16}/> Previous</button><span>{index+1} / {lessons.length}</span><button disabled={index===lessons.length-1} onClick={() => select(lessons[index+1])}>Next lesson <ArrowRight size={16}/></button></footer>
      </article>
    </div>
    <InlineAIAssistant isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} context={context}/>
  </div>;
};
