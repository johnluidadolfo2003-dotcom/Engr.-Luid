import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Check, RotateCcw, ArrowRight, Search } from 'lucide-react';
import { termBank, TermCard } from '../data/termBank';
import { officialCoverage } from '../data/officialCoverage';
import { CurriculumTrack } from '../types';

type Score = { level:number; due:string };
const STORAGE = 'ree_terms_v1';
function localDay(d:Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function dueToday(s?:Score) { return !s || !s.due || s.due <= localDay(new Date()); }
function nextDue(days:number) { const d=new Date();d.setDate(d.getDate()+days);return localDay(d); }
function choices(card:TermCard): TermCard[] {
  const same=termBank.filter(t=>t.id!==card.id&&t.track===card.track);
  const related=same.filter(t=>t.group===card.group);
  const other=[...related,...same.filter(t=>t.group!==card.group)];
  const seed=[...card.id].reduce((a,c)=>a+c.charCodeAt(0),0);
  const distractors=other.filter((t,i,a)=>a.findIndex(x=>x.id===t.id)===i).slice(0,3);
  const list=[card,...distractors];
  return [...list.slice(seed%4),...list.slice(0,seed%4)];
}
export function TermsTrainer() {
  const [track,setTrack]=useState<CurriculumTrack|'all'>('all');
  const [mode,setMode]=useState<'drill'|'library'>('drill');
  const [scores,setScores]=useState<Record<string,Score>>(()=>{try{return JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch{return {}}});
  const [position,setPosition]=useState(0);
  const [activeId,setActiveId]=useState<string|null>(null);
  const [answer,setAnswer]=useState<string|null>(null);
  const [revealed,setRevealed]=useState(false);
  const [search,setSearch]=useState('');
  const [reviewAll,setReviewAll]=useState(false);
  const pool=useMemo(()=>termBank.filter(t=>(track==='all'||t.track===track)&&(reviewAll||dueToday(scores[t.id]))),[track,reviewAll,scores]);
  const card=(activeId && termBank.find(t=>t.id===activeId)) || pool[position%pool.length];
  const options=card?choices(card):[];
  const mastered=termBank.filter(t=>(scores[t.id]?.level||0)>=2).length;
  const subject=card?officialCoverage.find(s=>s.track===card.track):undefined;
  const topic=subject?.topics.find(t=>t.id===card?.group);
  useEffect(()=>{try{localStorage.setItem(STORAGE,JSON.stringify(scores))}catch{}},[scores]);
  const resetSelection=()=>{setAnswer(null);setRevealed(false);setActiveId(null);setPosition(0)};
  const selectTrack=(next:CurriculumTrack|'all')=>{setTrack(next);resetSelection()};
  const grade=(id:string)=>{if(!card||answer!==null)return;setActiveId(card.id);setAnswer(id);setRevealed(true);setScores(prev=>{const old=prev[card.id]?.level||0;const level=id===card.id?Math.min(3,old+1):0;return {...prev,[card.id]:{level,due:nextDue(level===0?0:level===1?1:level===2?3:7)}}});};
  const next=()=>{setAnswer(null);setRevealed(false);setActiveId(null);setPosition(i=>i+1)};
  const filtered=termBank.filter(t=>(track==='all'||t.track===track)&&`${t.term} ${t.meaning} ${t.distinguish}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="terms-page">
    <header className="terms-hero"><div><span className="review-eyebrow">VOCABULARY / ACTIVE RECALL</span><h1>Know the term.<br/><em>Recognize the difference.</em></h1><p>Short definitions and nearby concepts, organized by the PRC topic groups. These are original practice cards, not copied past exam questions.</p></div><div className="terms-stat"><strong>{mastered}<small>/{termBank.length}</small></strong><span>terms learned twice</span><div className="review-meter"><i style={{width:`${100*mastered/termBank.length}%`}}/></div></div></header>
    <div className="terms-controls"><div className="terms-tabs" role="tablist" aria-label="Study mode"><button className={mode==='drill'?'active':''} onClick={()=>setMode('drill')}>Recall drill</button><button className={mode==='library'?'active':''} onClick={()=>setMode('library')}>Term library</button></div><div className="terms-filters"><button className={track==='all'?'active':''} onClick={()=>selectTrack('all')}>All</button>{officialCoverage.map(s=><button key={s.track} className={track===s.track?'active':''} onClick={()=>selectTrack(s.track)}>{s.track==='electrical'?'Electrical':s.track==='mathematics'?'Math':'ESAS'}</button>)}</div></div>
    {mode==='drill' ? card ? <div className="terms-layout"><section className="term-visual" aria-label="Concept relation"><div className="section-label"><span>CONCEPT MAP</span><span>{topic?.title}</span></div><div className="term-concept-map"><div className="term-map-top"><small>TOPIC</small><strong>{topic?.title}</strong></div><span className="term-map-arrow">↓</span><div className="term-map-clue"><small>CLUE</small><strong>{card.meaning}</strong></div><span className="term-map-arrow">↓</span><div className="term-map-answer"><small>TERM</small><strong>{revealed ? card.term : 'Recall before revealing'}</strong></div>{revealed && <div className="term-map-contrast"><small>DO NOT CONFUSE</small><strong>{card.distinguish}</strong></div>}</div><p>Say the answer aloud before selecting. Then compare it with the related terms.</p></section>
      <section className="term-question"><div className="term-meta"><span>{card.track==='electrical'?'ELECTRICAL':card.track==='mathematics'?'MATHEMATICS':'ESAS'}</span><span>{topic?.title}</span></div><h2>Which term means this?</h2><p className="term-definition">{card.meaning}</p><div className="term-options">{options.map((option,i)=><button key={option.id} disabled={answer!==null} onClick={()=>grade(option.id)} className={answer===null?'':option.id===card.id?'correct':answer===option.id?'incorrect':'muted'}><span>{String.fromCharCode(65+i)}</span>{option.term}</button>)}</div>
        {!revealed?<button className="term-skip" onClick={()=>{setActiveId(card.id);setRevealed(true);setAnswer('skipped');setScores(prev=>({...prev,[card.id]:{level:0,due:nextDue(0)}}))}}>Show answer</button>:<div className="term-explanation"><div>{answer===card.id?<Check size={17}/>:<RotateCcw size={17}/>}<strong>{card.term}</strong></div><p>{card.distinguish}</p><button onClick={next}>Next term <ArrowRight size={15}/></button></div>}
      </section></div> : <div className="terms-empty"><BookOpen size={30}/><h2>Review queue finished.</h2><p>Correct cards return tomorrow, then after three and seven days. Open all cards to keep practicing now.</p><button onClick={()=>{setReviewAll(true);resetSelection()}}>Practice all terms</button></div>
      : <div className="term-library"><label className="review-search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search a term or definition" aria-label="Search terms"/></label><p>{filtered.length} terms · select a subject above to narrow the list</p><div>{filtered.map(t=>{const s=officialCoverage.find(x=>x.track===t.track);return <article key={t.id}><small>{s?.topics.find(x=>x.id===t.group)?.title}</small><h3>{t.term}</h3><p>{t.meaning}</p><span>{t.distinguish}</span></article>})}</div></div>}
  </div>;
}
