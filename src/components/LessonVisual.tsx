import React, { useState } from 'react';
import { CurriculumLesson } from '../types';

function chooseVisual(lesson: CurriculumLesson): NonNullable<CurriculumLesson['visual']> {
  if (lesson.visual) return lesson.visual;
  const title = lesson.title.toLowerCase();
  if (/triangle|trigon|phasor|wye|delta|power factor|impedance|quadratic/.test(title)) return 'triangle';
  if (/sinus|ac |wave|current|reactance/.test(title)) return 'wave';
  if (/circuit|ohm|voltage|resist|parallel|series/.test(title)) return 'circuit';
  if (/derivative|integral|kinematic|temperature/.test(title)) return 'graph';
  if (/ratio|percent|unit|interest/.test(title)) return 'scale';
  return 'steps';
}

const descriptions: Record<NonNullable<CurriculumLesson['visual']>, string> = {
  triangle: 'The horizontal and vertical parts combine to make the diagonal. Identify the known sides before choosing a formula.',
  wave: 'One cycle repeats. The horizontal position represents time; the vertical position represents the changing value.',
  circuit: 'Trace a complete path from the source and back. Mark each quantity and its unit before calculating.',
  graph: 'Read the horizontal axis first. The height is a value, slope is a rate, and area is a total.',
  balance: 'Both sides must balance. Keep directions and signs consistent.',
  flow: 'Follow the quantity from input through the system to output. Account for any loss or change.',
  energy: 'What enters must be stored, converted, or leave. Track the units at every step.',
  scale: 'Compare a part to its reference. Put both quantities in matching units.',
  steps: 'Start with the known values, apply the relationship, and check the result.',
};

export function LessonVisual({ lesson }: { lesson: CurriculumLesson }) {
  const visual = chooseVisual(lesson);
  const [level, setLevel] = useState(60);
  const size = level / 100;
  const blue = '#184e68';
  const orange = '#d77a3e';
  const common = { strokeWidth: 3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  const label = (x: number, y: number, value: string) => <text x={x} y={y} fill="#475569" fontSize="13" fontFamily="system-ui">{value}</text>;

  return <div className="lesson-visual">
    <div className="lesson-visual-head"><span>SEE THE IDEA</span><span>{visual === 'wave' || visual === 'graph' || visual === 'triangle' ? 'Move the slider' : 'Visual model'}</span></div>
    <svg role="img" aria-label={`${lesson.title}: ${descriptions[visual]}`} viewBox="0 0 520 210" className="w-full h-auto max-h-56">
      {visual === 'triangle' && <>
        <path d={`M 85 170 L ${85 + 280 * size} 170 L ${85 + 280 * size} ${170 - 150 * size} Z`} {...common} stroke={blue}/>
        <path d={`M ${85 + 280 * size - 15} 170 L ${85 + 280 * size - 15} 155 L ${85 + 280 * size} 155`} {...common} stroke="#94a3b8" strokeWidth={2}/>
        {label(115, 193, 'horizontal / adjacent')}{label(90 + 280 * size, 105, 'vertical')}{label(80 + 120 * size, 94, 'resultant')}
        <circle cx="85" cy="170" r="5" fill={orange}/>
      </>}
      {visual === 'wave' && <>
        <path d="M 35 105 H 485 M 55 22 V 185" {...common} stroke="#cbd5e1" strokeWidth={2}/>
        <path d={Array.from({length: 180}, (_, i) => { const x = 55 + i * 2.3; const y = 105 - 70 * size * Math.sin(i * Math.PI / 45); return `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`; }).join(' ')} {...common} stroke={blue}/>
        {label(60, 28, 'value')}{label(445, 129, 'time →')}{label(155, 187, 'one cycle')}
        <path d="M 55 170 H 262 M 55 166 V 174 M 262 166 V 174" {...common} stroke={orange} strokeWidth={2}/>
      </>}
      {visual === 'circuit' && <>
        <path d="M 85 35 H 420 V 170 H 85 Z" {...common} stroke={blue}/>
        <circle cx="85" cy="102" r="26" fill="#f9f4eb" stroke={blue} strokeWidth="3"/>
        <path d="M 75 102 H 95 M 85 92 V 112" {...common} stroke={orange} strokeWidth="2"/>
        <rect x="215" y="25" width="95" height="20" fill="#f9f4eb" stroke={orange} strokeWidth="3"/>
        {label(55, 151, 'source')}{label(220, 72, 'element')}{label(331, 153, 'return path')}
        <path d="M 335 35 l 12 -8 l 0 16 Z" fill={blue}/>
      </>}
      {visual === 'graph' && <>
        <path d="M 60 175 H 475 M 60 175 V 20" {...common} stroke="#94a3b8" strokeWidth={2}/>
        <path d={`M 65 165 Q 205 ${175 - 145 * size} 465 45`} {...common} stroke={blue}/>
        <path d="M 305 98 L 380 72" {...common} stroke={orange} strokeWidth={2}/>
        {label(425, 195, 'input →')}{label(22, 27, 'value')}{label(337, 61, 'slope')}
      </>}
      {visual === 'balance' && <>
        <path d="M 260 43 V 167 M 175 170 H 345 M 95 72 H 425" {...common} stroke={blue}/>
        <path d="M 145 72 V 145 M 375 72 V 145 M 100 145 H 190 M 330 145 H 420" {...common} stroke={orange}/>
        {label(108, 168, 'left')}{label(350, 168, 'right')}{label(236, 36, 'Σ = 0')}
      </>}
      {visual === 'energy' && <>
        <path d="M 50 105 H 170 M 350 105 H 470" {...common} stroke={orange}/>
        <path d="M 160 95 l 12 10 l -12 10 M 460 95 l 12 10 l -12 10" {...common} stroke={orange}/>
        <rect x="175" y="48" width="170" height="110" rx="12" fill="#e5f0ef" stroke={blue} strokeWidth="2"/>
        {label(64, 89, 'input')}{label(219, 100, 'system')}{label(375, 89, 'output')}{label(205, 129, 'stored / lost')}
      </>}
      {visual === 'flow' && <>
        {[60, 215, 370].map((x,i) => <g key={x}><rect x={x} y="69" width="95" height="70" rx="10" fill={i === 1 ? '#e5f0ef' : '#f9f4eb'} stroke={blue} strokeWidth="2"/>{label(x + 17, 109, ['given','change','result'][i])}</g>)}
        <path d="M 160 105 H 205 M 315 105 H 360" {...common} stroke={orange}/><path d="M 198 98 l 8 7 l -8 7 M 353 98 l 8 7 l -8 7" {...common} stroke={orange}/>
      </>}
      {visual === 'scale' && <>
        <rect x="70" y="60" width="380" height="56" rx="9" fill="#e5f0ef"/>
        <rect x="70" y="60" width={380 * size} height="56" rx="9" fill={blue}/>
        {label(70, 46, 'part')}{label(385, 46, 'whole')}{label(178, 153, 'part ÷ whole')}
      </>}
      {visual === 'steps' && <>
        {[0,1,2].map((i) => <g key={i}><circle cx={100 + i*160} cy="93" r="31" fill={i===1 ? '#e5f0ef' : '#f9f4eb'} stroke={blue} strokeWidth="2"/><text x={100+i*160} y="100" textAnchor="middle" fill={blue} fontSize="21">{i+1}</text>{label(72+i*160, 154, ['Known','Relate','Check'][i])}</g>)}
        <path d="M 135 93 H 221 M 295 93 H 381" {...common} stroke={orange}/>
      </>}
    </svg>
    <div className="lesson-visual-foot"><p>{descriptions[visual]}</p>{['wave','graph','triangle','scale'].includes(visual) && <label>Change the view <input aria-label="Change visual scale" type="range" min="35" max="95" value={level} onChange={e => setLevel(Number(e.target.value))}/></label>}</div>
  </div>;
}
