import React, { useMemo, useState } from 'react';
import { formulaVault } from '../data/formulaDatabase';
import { FormulaItem, Subject } from '../types';
import { formatEngineeringFormula } from './MathRenderer';
import { Search, Copy, Check, ChevronDown } from 'lucide-react';
interface Props { onSelectFormulaForPractice?: (formula:FormulaItem)=>void; }
export const FormulaVault:React.FC<Props> = () => {
  const [query,setQuery]=useState('');
  const [subject,setSubject]=useState<Subject|'All'>('All');
  const [copied,setCopied]=useState<string|null>(null);
  const filtered=useMemo(()=>formulaVault.filter(f=>(subject==='All'||f.subject===subject)&&`${f.title} ${f.category} ${f.formula} ${f.variables}`.toLowerCase().includes(query.toLowerCase())),[query,subject]);
  const copy=async(f:FormulaItem)=>{try{await navigator.clipboard.writeText(f.formula);setCopied(f.id);setTimeout(()=>setCopied(null),1600)}catch{setCopied(null)}};
  return <div className="formula-page"><header className="formula-hero"><span className="review-eyebrow">FORMULAS</span><h1>Formula sheet</h1></header>
    <div className="formula-tools"><label className="review-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search formula or topic" aria-label="Search formulas"/></label><div className="terms-filters">{(['All','Mathematics','EE Major','ESAS'] as const).map(s=><button key={s} className={subject===s?'active':''} onClick={()=>setSubject(s)}>{s==='EE Major'?'Electrical':s}</button>)}</div></div>
    <div className="formula-result-count">{filtered.length} formulas</div><div className="formula-grid">{filtered.map(f=><article key={f.id} className="formula-tile"><header><div><small>{f.subject} / {f.category}</small><h2>{f.title}</h2></div><button onClick={()=>copy(f)} title="Copy formula" aria-label={`Copy ${f.title}`}>{copied===f.id?<Check size={16}/>:<Copy size={16}/>}</button></header><div className="formula-display" aria-label={`Formula: ${formatEngineeringFormula(f.formula)}`}><span>FORMULA</span><strong>{formatEngineeringFormula(f.formula)}</strong></div><div className="formula-symbols"><span>SYMBOLS</span><p>{f.variables}</p><small>{f.units}</small></div><details><summary>When to use it <ChevronDown size={14}/></summary><p>{f.plainEnglish}</p><p>{f.boardExamTip}</p></details></article>)}</div>{!filtered.length&&<div className="terms-empty"><h2>No matching formulas.</h2><p>Try another search.</p></div>}</div>;
};
