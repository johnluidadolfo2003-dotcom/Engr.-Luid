import React from 'react';

const superscript: Record<string, string> = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻','+':'⁺','n':'ⁿ','x':'ˣ' };
export function formatEngineeringFormula(input: string): string {
  return input
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^{}]+)\}/g, '√($1)')
    .replace(/\\(times|cdot)/g, '×')
    .replace(/\\pi/g, 'π').replace(/\\theta/g, 'θ').replace(/\\Omega/g, 'Ω')
    .replace(/\\pm/g, '±').replace(/\\angle/g, '∠')
    .replace(/\^\(?([0-9nx+-]+)\)?/g, (_, exp: string) => [...exp].map(c => superscript[c] || c).join(''));
}

interface MathRendererProps {
  formula: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showExplanation?: boolean;
  plainEnglish?: string;
}

/**
 * Cleanly formats mathematical expressions and board exam formulas
 * into readable, professional typography without raw unparsed LaTeX backslashes.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  formula,
  className = '',
  size = 'md',
  showExplanation = false,
  plainEnglish,
}) => {
  // Convert LaTeX remnants and common formatting into clean math symbols
  const formatMathString = (str: string): string => {
    if (!str) return '';
    return str
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
      .replace(/\\sqrt/g, '√')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 ÷ $2)')
      .replace(/\\times/g, ' × ')
      .replace(/\\cdot/g, ' · ')
      .replace(/\\pm/g, ' ± ')
      .replace(/\\pi/g, 'π')
      .replace(/\\theta/g, 'θ')
      .replace(/\\omega/g, 'ω')
      .replace(/\\Omega/g, 'Ω')
      .replace(/\\mu/g, 'µ')
      .replace(/\\angle/g, '∠')
      .replace(/\\degree/g, '°')
      .replace(/\\quad/g, '   ')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\left\(/g, '(')
      .replace(/\\right\)/g, ')')
      .replace(/\\left\[/g, '[')
      .replace(/\\right\]/g, ']')
      .replace(/\\int_\{([^}]+)\}\^\{([^}]+)\}/g, '∫[$1 to $2]')
      .replace(/\\int/g, '∫')
      .replace(/\\approx/g, '≈')
      .replace(/\\le/g, '≤')
      .replace(/\\ge/g, '≥')
      .replace(/\\implies/g, ' ⟹ ')
      .replace(/\\%/g, '%')
      .replace(/\\/g, ''); // strip any lingering backslashes
  };

  const cleaned = formatEngineeringFormula(formatMathString(formula));

  const sizeClasses = {
    sm: 'text-xs py-1 px-2',
    md: 'text-xs sm:text-sm py-2 px-3',
    lg: 'text-sm sm:text-base py-3 px-4',
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Formatted Formula Badge / Container */}
      <div
        className={`font-mono font-bold tracking-wide rounded-lg bg-slate-900 text-amber-400 border border-slate-800 overflow-x-auto whitespace-pre-wrap select-all shadow-xs ${sizeClasses[size]}`}
      >
        {cleaned}
      </div>

      {/* Optional plain English breakdown for beginners starting from zero */}
      {(showExplanation || plainEnglish) && (
        <div className="text-[11px] text-slate-600 bg-amber-50/60 border border-amber-200/80 rounded-md p-2 space-y-0.5">
          <span className="font-semibold text-amber-900 block uppercase text-[10px] tracking-wider">
            In Plain English (Foundation):
          </span>
          <p className="leading-relaxed text-amber-950 font-sans">
            {plainEnglish ||
              'Remember: extract your given numbers with standard units, substitute them step-by-step into the formula, and verify with your calculator.'}
          </p>
        </div>
      )}
    </div>
  );
};
