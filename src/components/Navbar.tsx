import React from 'react';
import { BookOpen, CalendarDays, ChartNoAxesCombined, FlaskConical, MessageCircle, Target, Layers3 } from 'lucide-react';

export type AppTab = 'curriculum' | 'terms' | 'drill' | 'grapher' | 'tutor' | 'formulas' | 'roadmap';
interface Props { activeTab: AppTab; setActiveTab: (tab: AppTab) => void; completedToday: number; dailyTarget: number; streakDays: number; onQuickStart: () => void; }
const nav = [
  { id: 'curriculum', label: 'Lessons', icon: BookOpen },
  { id: 'terms', label: 'Terms', icon: Layers3 },
  { id: 'drill', label: 'Practice', icon: Target },
  { id: 'grapher', label: 'Visual tools', icon: ChartNoAxesCombined },
  { id: 'formulas', label: 'Formulas', icon: FlaskConical },
  { id: 'tutor', label: 'Ask Lex', icon: MessageCircle },
  { id: 'roadmap', label: 'Study plan', icon: CalendarDays },
] as const;
export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab, completedToday, dailyTarget }) => <header className="review-nav">
  <div className="review-nav-inner"><button className="review-brand" onClick={() => setActiveTab('curriculum')} aria-label="REE Review Desk home"><span className="brand-mark">R<span>.</span></span><span><strong>REE Review Desk</strong><small>STUDY / PRACTICE / REPEAT</small></span></button>
    <nav aria-label="Main navigation">{nav.map(item => {const Icon = item.icon; return <button key={item.id} onClick={() => setActiveTab(item.id)} className={activeTab===item.id ? 'active' : ''}><Icon size={15}/>{item.label}</button>})}</nav>
    <button className="nav-progress" onClick={() => setActiveTab('drill')} aria-label={`${completedToday} of ${dailyTarget} practice questions answered today`}><span>Today</span><strong>{completedToday}<small>/{dailyTarget}</small></strong></button>
  </div>
  <nav className="mobile-review-nav" aria-label="Mobile navigation">{nav.map(item => {const Icon = item.icon; return <button key={item.id} onClick={() => setActiveTab(item.id)} className={activeTab===item.id ? 'active' : ''}><Icon size={16}/><span>{item.label}</span></button>})}</nav>
</header>;
