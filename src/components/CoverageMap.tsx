import React, { useEffect, useState } from 'react';
import { CurriculumTrack } from '../types';
import { officialCoverage, PRC_2024_TOS_URL } from '../data/officialCoverage';
import { ArrowDownRight, ExternalLink } from 'lucide-react';

interface Props { active: CurriculumTrack; onChoose: (track: CurriculumTrack, lessonId: string) => void; completed: Set<string>; }
const colors: Record<CurriculumTrack,string> = {mathematics:'#af754c',esas:'#477f73',electrical:'#295b70'};
export function CoverageMap({active,onChoose,completed}:Props) {
  const [shown,setShown] = useState<CurriculumTrack>(active);
  useEffect(() => setShown(active), [active]);
  const subject = officialCoverage.find(s=>s.track===shown)!;
  const segments = subject.topics.map((topic,i)=>({topic,i}));
  return <section className="coverage-map" aria-label="Official exam coverage">
    <div className="coverage-intro"><div><span className="review-eyebrow">PRC EXAM COVERAGE</span><h2>Pick a topic.</h2></div><a href={PRC_2024_TOS_URL} target="_blank" rel="noopener noreferrer">Official PRC table <ExternalLink size={13}/></a></div>
    <div className="coverage-subjects">{officialCoverage.map(s=><button key={s.track} onClick={()=>setShown(s.track)} className={shown===s.track?'active':''} style={{'--subject':colors[s.track]} as React.CSSProperties} aria-pressed={shown===s.track}>
      <div className="coverage-weight" style={{background:`conic-gradient(${colors[s.track]} ${s.weight}%, #e8ece8 0)`}}><span>{s.weight}<small>%</small></span></div><div><strong>{s.name}</strong><small>{s.topics.length} topic groups · 100 items</small></div></button>)}</div>
    <div className="coverage-distribution"><div className="coverage-distribution-title"><strong>{subject.name}</strong><span>PRC item allocation / 100</span></div><div className="coverage-bar" aria-hidden="true">{segments.map(({topic,i})=><div key={topic.id} style={{width:`${topic.items}%`,background:i%2 ? '#d49b72' : colors[shown]}} title={`${topic.title}: ${topic.items} items`}/>)}</div>
      <div className="coverage-topic-grid">{subject.topics.map((topic,i)=>{const count=topic.lessons.filter(id=>completed.has(id)).length;return <button key={topic.id} onClick={()=>onChoose(shown,topic.lessons[0])} className="coverage-topic"><div><span className="coverage-letter">{String.fromCharCode(65+i)}</span><strong>{topic.title}</strong></div><div className="coverage-topic-foot"><span><b>{topic.items}</b> / 100 items</span><span>{count}/{topic.lessons.length} starter lessons done <ArrowDownRight size={13}/></span></div><div className="topic-meter"><i style={{width:`${count/topic.lessons.length*100}%`}}/></div></button>})}</div>
      <p className="coverage-note">PRC topic groups and item counts. Lessons are study aids.</p>
    </div>
  </section>;
}
