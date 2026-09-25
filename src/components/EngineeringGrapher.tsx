import React, { useState, useMemo } from 'react';
import { Compass, Waves, Calculator, ArrowRight, RotateCcw, Zap } from 'lucide-react';

export interface EngineeringGrapherProps {
  initialTool?: 'phasor' | 'rlc' | 'calculator';
  initialParams?: {
    voltage?: number;
    current?: number;
    phaseAngleDeg?: number;
    isLagging?: boolean;
    rVal?: number;
    lValMilliH?: number;
    cValMicroF?: number;
    freq?: number;
  };
}

export const EngineeringGrapher: React.FC<EngineeringGrapherProps> = ({
  initialTool,
  initialParams,
}) => {
  const [activeTool, setActiveTool] = useState<'phasor' | 'rlc' | 'calculator'>(
    initialTool || 'phasor'
  );

  // --- Phasor Diagram & Power Triangle State ---
  const [voltage, setVoltage] = useState<number>(initialParams?.voltage ?? 230);
  const [current, setCurrent] = useState<number>(initialParams?.current ?? 25);
  const [phaseAngleDeg, setPhaseAngleDeg] = useState<number>(
    initialParams?.phaseAngleDeg ?? 36.87
  ); // ~0.8 pf
  const [isLagging, setIsLagging] = useState<boolean>(
    initialParams?.isLagging ?? true
  );

  // Computations for Power Triangle & Phasors
  const phasorCalc = useMemo(() => {
    const angleRad = (phaseAngleDeg * Math.PI) / 180;
    const signedAngleRad = isLagging ? -angleRad : angleRad;
    const pf = Math.cos(angleRad);
    const S = (voltage * current) / 1000; // kVA
    const P = S * pf; // kW
    const Q = S * Math.sin(angleRad) * (isLagging ? 1 : -1); // kVAR (+ inductive, - capacitive)

    // Desired pf 0.95 for correction preview
    const targetAngleRad = Math.acos(0.95);
    const targetQ = P * Math.tan(targetAngleRad);
    const requiredQc = Math.max(0, Math.abs(Q) - targetQ);
    const requiredCapMicroFarads = requiredQc > 0
      ? (requiredQc * 1000) / (2 * Math.PI * 60 * Math.pow(voltage, 2)) * 1e6
      : 0;

    return {
      pf,
      signedAngleRad,
      S,
      P,
      Q,
      requiredQc,
      requiredCapMicroFarads,
    };
  }, [voltage, current, phaseAngleDeg, isLagging]);

  // --- RLC Waveform & Resonance State ---
  const [rVal, setRVal] = useState<number>(initialParams?.rVal ?? 20); // Ohms
  const [lValMilliH, setLValMilliH] = useState<number>(
    initialParams?.lValMilliH ?? 100
  ); // mH
  const [cValMicroF, setCValMicroF] = useState<number>(
    initialParams?.cValMicroF ?? 25
  ); // µF
  const [freq, setFreq] = useState<number>(initialParams?.freq ?? 60); // Hz

  const rlcCalc = useMemo(() => {
    const L = lValMilliH * 1e-3;
    const C = cValMicroF * 1e-6;
    const omega = 2 * Math.PI * freq;
    const XL = omega * L;
    const XC = 1 / (omega * C);
    const Xnet = XL - XC;
    const Z = Math.sqrt(rVal * rVal + Xnet * Xnet);
    const phaseRad = Math.atan2(Xnet, rVal);
    const phaseDeg = (phaseRad * 180) / Math.PI;

    // Resonance
    const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
    const Q0 = (1 / rVal) * Math.sqrt(L / C);

    // Current magnitude at 100V supply
    const Vsupply = 100;
    const Ipeak = (Vsupply * Math.SQRT2) / Z;

    let behavior: 'Resonant' | 'Inductive (Lagging)' | 'Capacitive (Leading)' = 'Resonant';
    if (Math.abs(XL - XC) < 0.2) behavior = 'Resonant';
    else if (XL > XC) behavior = 'Inductive (Lagging)';
    else behavior = 'Capacitive (Leading)';

    return {
      XL,
      XC,
      Xnet,
      Z,
      phaseRad,
      phaseDeg,
      f0,
      Q0,
      behavior,
      Ipeak,
    };
  }, [rVal, lValMilliH, cValMicroF, freq]);

  // --- Quick Calculator State ---
  const [calcMode, setCalcMode] = useState<'rectToPol' | 'polToRect' | 'deltaWye'>('rectToPol');
  const [realPart, setRealPart] = useState<string>('24');
  const [imagPart, setImagPart] = useState<string>('18');
  const [magPart, setMagPart] = useState<string>('30');
  const [angPart, setAngPart] = useState<string>('36.87');

  const [ra, setRa] = useState<string>('30');
  const [rb, setRb] = useState<string>('30');
  const [rc, setRc] = useState<string>('30');

  // Converter calculations
  const rectToPolResult = useMemo(() => {
    const a = parseFloat(realPart) || 0;
    const b = parseFloat(imagPart) || 0;
    const r = Math.sqrt(a * a + b * b);
    const theta = (Math.atan2(b, a) * 180) / Math.PI;
    return { r: r.toFixed(3), theta: theta.toFixed(2) };
  }, [realPart, imagPart]);

  const polToRectResult = useMemo(() => {
    const r = parseFloat(magPart) || 0;
    const thetaRad = ((parseFloat(angPart) || 0) * Math.PI) / 180;
    const a = r * Math.cos(thetaRad);
    const b = r * Math.sin(thetaRad);
    return { a: a.toFixed(3), b: b.toFixed(3), sign: b >= 0 ? '+' : '-' };
  }, [magPart, angPart]);

  const deltaWyeResult = useMemo(() => {
    const a = parseFloat(ra) || 0;
    const b = parseFloat(rb) || 0;
    const c = parseFloat(rc) || 0;
    const sum = a + b + c;
    if (sum === 0) return { r1: '0', r2: '0', r3: '0' };
    const r1 = (b * c) / sum;
    const r2 = (a * c) / sum;
    const r3 = (a * b) / sum;
    return {
      r1: r1.toFixed(3),
      r2: r2.toFixed(3),
      r3: r3.toFixed(3),
    };
  }, [ra, rb, rc]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-1">
              <span>Interactive Engineering Grapher & Solver</span>
              <span>·</span>
              <span>Direct Visual Recall</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Phasor & AC Waveform Workbench
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Visualize vectors, power triangles, and RLC resonance dynamically. Replace hours of memorizing sign conventions with intuitive interactive physics.
            </p>
          </div>

          {/* Tool Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setActiveTool('phasor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTool === 'phasor'
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Phasors & Power</span>
            </button>
            <button
              onClick={() => setActiveTool('rlc')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTool === 'rlc'
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Waves className="w-3.5 h-3.5" />
              <span>RLC Resonance</span>
            </button>
            <button
              onClick={() => setActiveTool('calculator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTool === 'calculator'
                  ? 'bg-amber-400 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Board Converter</span>
            </button>
          </div>
        </div>
      </div>

      {/* TOOL 1: PHASOR DIAGRAM & POWER TRIANGLE */}
      {activeTool === 'phasor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Deck (Left 4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">AC Parameters</h2>
              <button
                onClick={() => {
                  setVoltage(230);
                  setCurrent(25);
                  setPhaseAngleDeg(36.87);
                  setIsLagging(true);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                title="Reset to 230V standard load"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Voltage */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700">RMS Voltage (V)</span>
                <span className="font-mono text-slate-900 font-semibold tabular-nums">{voltage} V</span>
              </div>
              <input
                type="range"
                min="100"
                max="480"
                step="10"
                value={voltage}
                onChange={(e) => setVoltage(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>100V</span>
                <span>230V PH standard</span>
                <span>480V</span>
              </div>
            </div>

            {/* Current */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700">RMS Current (I)</span>
                <span className="font-mono text-slate-900 font-semibold tabular-nums">{current} A</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={current}
                onChange={(e) => setCurrent(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Phase Angle & Power Factor */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700">Phase Angle (θ)</span>
                <span className="font-mono text-slate-900 font-semibold tabular-nums">
                  {phaseAngleDeg.toFixed(1)}° (pf = {phasorCalc.pf.toFixed(2)})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="85"
                step="0.5"
                value={phaseAngleDeg}
                onChange={(e) => setPhaseAngleDeg(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />

              {/* Lagging vs Leading Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-600 font-medium">Load Nature:</span>
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md">
                  <button
                    onClick={() => setIsLagging(true)}
                    className={`px-2.5 py-1 text-xs rounded transition-colors ${
                      isLagging
                        ? 'bg-amber-500 text-white font-medium shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Lagging (Inductive)
                  </button>
                  <button
                    onClick={() => setIsLagging(false)}
                    className={`px-2.5 py-1 text-xs rounded transition-colors ${
                      !isLagging
                        ? 'bg-sky-500 text-white font-medium shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Leading (Capacitive)
                  </button>
                </div>
              </div>
            </div>

            {/* Real-time Calculated Metrics */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Live Calculation Results
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Real Power (P)</div>
                  <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
                    {phasorCalc.P.toFixed(2)} <span className="text-xs font-normal text-slate-500">kW</span>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Reactive Power (Q)</div>
                  <div className="text-base font-bold text-amber-600 font-mono tabular-nums">
                    {Math.abs(phasorCalc.Q).toFixed(2)} <span className="text-xs font-normal text-slate-500">kVAR</span>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Apparent Power (S)</div>
                  <div className="text-base font-bold text-indigo-600 font-mono tabular-nums">
                    {phasorCalc.S.toFixed(2)} <span className="text-xs font-normal text-slate-500">kVA</span>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Power Factor</div>
                  <div className="text-base font-bold text-emerald-600 font-mono tabular-nums">
                    {phasorCalc.pf.toFixed(3)}
                  </div>
                </div>
              </div>

              {/* High-yield Board Exam Tip Box */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs space-y-2">
                <div className="font-semibold text-amber-900 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Beginner Intuition & Board Formula</span>
                </div>
                <p className="text-amber-950 text-[11px] leading-relaxed">
                  <strong>The Beer Mug Analogy:</strong> Real Power P (kW) is the drinkable beer (actual work). Reactive Power Q (kVAR) is the foam on top (magnetization). Apparent Power S (kVA) is the whole mug!
                </p>
                <div className="bg-white/80 p-2 rounded border border-amber-200 text-[11px] text-amber-900 font-mono">
                  Q_c = P × [tan(θ₁) - tan(θ₂)]
                  <br />
                  C = Q_c ÷ (2 × π × f × V²)
                </div>
                <p className="text-amber-800 text-[11px]">
                  To raise pf to 0.95: install <strong className="font-mono text-amber-950">{phasorCalc.requiredCapMicroFarads.toFixed(1)} µF</strong> ({phasorCalc.requiredQc.toFixed(2)} kVAR).
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Visual Stage (Right 8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-6 text-white shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <h3 className="text-sm font-semibold tracking-wide text-slate-200">
                    Phasor Vector Space & Power Triangle Geometry
                  </h3>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Scale: Live Vector Projection
                </div>
              </div>

              {/* Dynamic SVG Diagram */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Polar Phasor Diagram */}
                <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-300 mb-2">
                    1. Phasor Diagram (V Reference at 0°)
                  </span>
                  <svg viewBox="-120 -120 240 240" className="w-full max-w-[240px] h-[220px]">
                    {/* Concentric grid circles */}
                    <circle cx="0" cy="0" r="30" stroke="#334155" strokeWidth="0.8" fill="none" strokeDasharray="2 2" />
                    <circle cx="0" cy="0" r="60" stroke="#334155" strokeWidth="0.8" fill="none" strokeDasharray="2 2" />
                    <circle cx="0" cy="0" r="90" stroke="#334155" strokeWidth="1" fill="none" />

                    {/* Coordinate Axes */}
                    <line x1="-105" y1="0" x2="105" y2="0" stroke="#475569" strokeWidth="1.2" />
                    <line x1="0" y1="-105" x2="0" y2="105" stroke="#475569" strokeWidth="1.2" />

                    {/* Axis Labels */}
                    <text x="96" y="-6" fill="#94a3b8" fontSize="9" textAnchor="end">+Re (0°)</text>
                    <text x="6" y="-96" fill="#94a3b8" fontSize="9">+j (90°)</text>
                    <text x="6" y="100" fill="#94a3b8" fontSize="9">-j (-90°)</text>

                    {/* Voltage Phasor (Red/Indigo along 0 deg) */}
                    <defs>
                      <marker id="arrow-v" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <polygon points="0 0, 6 3, 0 6" fill="#38bdf8" />
                      </marker>
                      <marker id="arrow-i" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <polygon points="0 0, 6 3, 0 6" fill="#fbbf24" />
                      </marker>
                    </defs>

                    {/* Reference Voltage V at 0° */}
                    <line x1="0" y1="0" x2="85" y2="0" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#arrow-v)" />
                    <text x="90" y="14" fill="#38bdf8" fontSize="10" fontWeight="bold">V = {voltage}V ∠0°</text>

                    {/* Current Phasor I at angle (inverted y for SVG coordinate system) */}
                    {(() => {
                      const len = 70;
                      // In SVG y is downwards, so positive angle is upwards: y = -sin(angle)
                      const ix = len * Math.cos(phasorCalc.signedAngleRad);
                      const iy = -len * Math.sin(phasorCalc.signedAngleRad);
                      return (
                        <>
                          <line x1="0" y1="0" x2={ix} y2={iy} stroke="#fbbf24" strokeWidth="2.5" markerEnd="url(#arrow-i)" />
                          <text x={ix + 8} y={iy - 2} fill="#fbbf24" fontSize="10" fontWeight="bold">
                            I = {current}A ∠{(isLagging ? -phaseAngleDeg : phaseAngleDeg).toFixed(1)}°
                          </text>

                          {/* Phase angle arc */}
                          <path
                            d={`M 25 0 A 25 25 0 0 ${isLagging ? 1 : 0} ${25 * Math.cos(phasorCalc.signedAngleRad)} ${-25 * Math.sin(phasorCalc.signedAngleRad)}`}
                            fill="none"
                            stroke="#fbbf24"
                            strokeWidth="1.2"
                            strokeDasharray="2 1"
                          />
                        </>
                      );
                    })()}
                  </svg>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {isLagging ? (
                      <span className="text-amber-300">Current lags Voltage by {phaseAngleDeg.toFixed(1)}° (Inductive load)</span>
                    ) : (
                      <span className="text-sky-300">Current leads Voltage by {phaseAngleDeg.toFixed(1)}° (Capacitive load)</span>
                    )}
                  </div>
                </div>

                {/* 2. Power Triangle Diagram */}
                <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-300 mb-2">
                    2. Power Triangle (S² = P² + Q²)
                  </span>
                  <svg viewBox="0 0 240 220" className="w-full max-w-[240px] h-[220px]">
                    <defs>
                      <marker id="arrow-p" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <polygon points="0 0, 6 3, 0 6" fill="#10b981" />
                      </marker>
                      <marker id="arrow-q" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <polygon points="0 0, 6 3, 0 6" fill="#f59e0b" />
                      </marker>
                      <marker id="arrow-s" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <polygon points="0 0, 6 3, 0 6" fill="#818cf8" />
                      </marker>
                    </defs>

                    {/* Coordinates for triangle */}
                    {(() => {
                      const originX = 25;
                      const originY = isLagging ? 50 : 170;
                      const baseLen = 140;
                      // Height proportional to tan(theta) capped for viewport
                      const pHeight = Math.min(110, baseLen * Math.tan((phaseAngleDeg * Math.PI) / 180));
                      const destY = isLagging ? originY + pHeight : originY - pHeight;

                      return (
                        <>
                          {/* Grid backdrop */}
                          <rect x="15" y="15" width="210" height="190" fill="#0f172a" rx="6" />

                          {/* Base: P (Real Power) */}
                          <line
                            x1={originX}
                            y1={originY}
                            x2={originX + baseLen}
                            y2={originY}
                            stroke="#10b981"
                            strokeWidth="3"
                            markerEnd="url(#arrow-p)"
                          />
                          <text x={originX + baseLen / 2} y={isLagging ? originY - 8 : originY + 16} fill="#34d399" fontSize="10" fontWeight="bold" textAnchor="middle">
                            P = {phasorCalc.P.toFixed(2)} kW
                          </text>

                          {/* Height: Q (Reactive Power) */}
                          <line
                            x1={originX + baseLen}
                            y1={originY}
                            x2={originX + baseLen}
                            y2={destY}
                            stroke="#f59e0b"
                            strokeWidth="3"
                            markerEnd="url(#arrow-q)"
                          />
                          <text x={originX + baseLen + 6} y={(originY + destY) / 2 + 4} fill="#fbbf24" fontSize="10" fontWeight="bold">
                            Q = {Math.abs(phasorCalc.Q).toFixed(2)} kVAR
                          </text>

                          {/* Hypotenuse: S (Apparent Power) */}
                          <line
                            x1={originX}
                            y1={originY}
                            x2={originX + baseLen}
                            y2={destY}
                            stroke="#818cf8"
                            strokeWidth="3"
                            markerEnd="url(#arrow-s)"
                          />
                          <text x={originX + baseLen / 2 - 14} y={(originY + destY) / 2 + (isLagging ? -8 : 12)} fill="#a5b4fc" fontSize="10" fontWeight="bold">
                            S = {phasorCalc.S.toFixed(2)} kVA
                          </text>

                          {/* Right angle symbol */}
                          <rect
                            x={originX + baseLen - 10}
                            y={isLagging ? originY : originY - 10}
                            width="10"
                            height="10"
                            fill="none"
                            stroke="#64748b"
                            strokeWidth="1"
                          />
                        </>
                      );
                    })()}
                  </svg>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Hypotenuse: <span className="font-mono text-indigo-300">S = P + jQ</span> · cos θ = {phasorCalc.pf.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Practice Problem directly using the grapher */}
            <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 text-xs text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-amber-900 block">Board Exam Question Pattern:</span>
                <span className="text-slate-600">
                  "A load consumes {phasorCalc.P.toFixed(1)} kW at {phasorCalc.pf.toFixed(2)} pf lagging. If a capacitor provides {phasorCalc.requiredQc.toFixed(1)} kVAR, what is the new power factor?"
                </span>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg border border-amber-300 font-mono font-bold text-amber-900 shrink-0">
                Answer: 0.95 lagging
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 2: RLC WAVEFORM & RESONANCE */}
      {activeTool === 'rlc' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Deck (Left 4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">RLC Network Components</h2>
              <button
                onClick={() => {
                  setRVal(20);
                  setLValMilliH(100);
                  setCValMicroF(25);
                  setFreq(60);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* R */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700">Resistance (R)</span>
                <span className="font-mono text-slate-900 font-semibold tabular-nums">{rVal} Ω</span>
              </div>
              <input
                type="range"
                min="2"
                max="100"
                value={rVal}
                onChange={(e) => setRVal(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* L */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700">Inductance (L)</span>
                <span className="font-mono text-slate-900 font-semibold tabular-nums">{lValMilliH} mH</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                step="5"
                value={lValMilliH}
                onChange={(e) => setLValMilliH(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* C */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700">Capacitance (C)</span>
                <span className="font-mono text-slate-900 font-semibold tabular-nums">{cValMicroF} µF</span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={cValMicroF}
                onChange={(e) => setCValMicroF(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Frequency */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700">Supply Frequency (f)</span>
                <span className="font-mono text-slate-900 font-semibold tabular-nums">{freq} Hz</span>
              </div>
              <input
                type="range"
                min="10"
                max="250"
                step="2"
                value={freq}
                onChange={(e) => setFreq(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => setFreq(Math.round(rlcCalc.f0))}
                  className="text-[11px] text-amber-700 hover:underline font-medium"
                >
                  Tune to Resonance ({rlcCalc.f0.toFixed(1)} Hz)
                </button>
              </div>
            </div>

            {/* Real-time Impedance & Resonance Results */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Operating Mode:</span>
                <span className="font-semibold text-slate-900">{rlcCalc.behavior}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Inductive Reactance (X_L):</span>
                <span className="font-mono text-slate-900 tabular-nums">{rlcCalc.XL.toFixed(2)} Ω</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Capacitive Reactance (X_C):</span>
                <span className="font-mono text-slate-900 tabular-nums">{rlcCalc.XC.toFixed(2)} Ω</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Impedance |Z|:</span>
                <span className="font-mono font-bold text-amber-600 tabular-nums">{rlcCalc.Z.toFixed(2)} Ω</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Resonant Frequency (f₀):</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">{rlcCalc.f0.toFixed(2)} Hz</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Quality Factor (Q₀):</span>
                <span className="font-mono text-slate-900 tabular-nums">{rlcCalc.Q0.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Oscilloscope Waveform Stage (Right 8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-white shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <h3 className="text-sm font-semibold tracking-wide text-slate-200">
                    Dual-Trace Oscilloscope: Voltage v(t) vs Current i(t)
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-sky-400">
                    <span className="w-2.5 h-0.5 bg-sky-400 inline-block"></span>
                    <span>v(t) Source</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="w-2.5 h-0.5 bg-amber-400 inline-block"></span>
                    <span>i(t) Current (Phase: {rlcCalc.phaseDeg.toFixed(1)}°)</span>
                  </span>
                </div>
              </div>

              {/* Dynamic Waveform Canvas */}
              <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800">
                <svg viewBox="0 0 600 240" className="w-full h-[220px]">
                  {/* Oscilloscope grid lines */}
                  {[40, 80, 120, 160, 200].map((y) => (
                    <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
                  ))}
                  {[100, 200, 300, 400, 500].map((x) => (
                    <line key={x} x1={x} y1="0" x2={x} y2="240" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="3 3" />
                  ))}

                  {/* Center Ground axis */}
                  <line x1="0" y1="120" x2="600" y2="120" stroke="#475569" strokeWidth="1.2" />

                  {/* Voltage Sinusoid: v(t) = Vm * sin(2*pi*f*t) */}
                  {(() => {
                    const pointsV: string[] = [];
                    const pointsI: string[] = [];
                    const Vampl = 70;
                    // Current amplitude scaled relative to impedance
                    const Iampl = Math.min(85, Math.max(15, (70 * 20) / rlcCalc.Z));

                    // Plot across 600 pixels (representing ~ 2 complete cycles)
                    for (let x = 0; x <= 600; x += 3) {
                      const t = (x / 600) * 4 * Math.PI; // 2 cycles
                      const yV = 120 - Vampl * Math.sin(t);
                      const yI = 120 - Iampl * Math.sin(t - rlcCalc.phaseRad);
                      pointsV.push(`${x},${yV.toFixed(1)}`);
                      pointsI.push(`${x},${yI.toFixed(1)}`);
                    }

                    return (
                      <>
                        {/* Voltage wave */}
                        <polyline
                          points={pointsV.join(' ')}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                        />
                        {/* Current wave */}
                        <polyline
                          points={pointsI.join(' ')}
                          fill="none"
                          stroke="#fbbf24"
                          strokeWidth="2.5"
                        />
                      </>
                    );
                  })()}
                </svg>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 mt-2 px-1">
                  <div>
                    <span>Phase shift: </span>
                    <strong className="text-white font-mono">{Math.abs(rlcCalc.phaseDeg).toFixed(1)}°</strong>{' '}
                    <span>{rlcCalc.phaseDeg > 0 ? '(Current lags voltage)' : '(Current leads voltage)'}</span>
                  </div>
                  <div>
                    <span>Resonant Condition: </span>
                    <strong className="text-amber-400 font-mono">X_L = X_C ({rlcCalc.f0.toFixed(1)} Hz)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Formula Explainer */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <h4 className="font-bold text-slate-900">Standard Board Exam Formulas for Series RLC:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2 bg-slate-50 rounded border border-slate-100 font-mono text-[11px]">
                  <strong>Impedance:</strong><br />Z = R + j(X_L - X_C)
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100 font-mono text-[11px]">
                  <strong>Resonant f₀:</strong><br />f₀ = 1 / (2π√(LC))
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100 font-mono text-[11px]">
                  <strong>Quality Factor Q:</strong><br />Q = (1/R) · √(L/C)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 3: BOARD CONVERTER & CALCULATOR */}
      {activeTool === 'calculator' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Sub Navigation */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg w-fit">
            <button
              onClick={() => setCalcMode('rectToPol')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                calcMode === 'rectToPol' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rectangular to Polar (a + jb → r∠θ)
            </button>
            <button
              onClick={() => setCalcMode('polToRect')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                calcMode === 'polToRect' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Polar to Rectangular (r∠θ → a + jb)
            </button>
            <button
              onClick={() => setCalcMode('deltaWye')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                calcMode === 'deltaWye' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Delta to Wye (Δ → Y)
            </button>
          </div>

          {/* Mode 1: Rect to Pol */}
          {calcMode === 'rectToPol' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Complex Number: Rectangular to Polar</h3>
                  <p className="text-xs text-slate-500">Calculate magnitude |Z| and phase angle θ quickly without manual arctan steps.</p>
                </div>
                <div className="text-xs font-mono text-slate-400">Casio shortcut: Pol(X, Y)</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Real Part (a / Resistance R)</label>
                  <input
                    type="number"
                    value={realPart}
                    onChange={(e) => setRealPart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. 24"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Imaginary Part (b / Reactance X)</label>
                  <input
                    type="number"
                    value={imagPart}
                    onChange={(e) => setImagPart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. 18"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Polar Form Result:</span>
                  <span className="text-xl font-bold font-mono text-amber-400">
                    {rectToPolResult.r} ∠ {rectToPolResult.theta}°
                  </span>
                </div>
                <div className="text-xs text-slate-400 text-right">
                  <span>|Z| = √(a² + b²)</span>
                  <br />
                  <span>θ = tan⁻¹(b / a)</span>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Pol to Rect */}
          {calcMode === 'polToRect' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Complex Number: Polar to Rectangular</h3>
                  <p className="text-xs text-slate-500">Decompose impedance magnitude and angle into Resistance R and Reactance X.</p>
                </div>
                <div className="text-xs font-mono text-slate-400">Casio shortcut: Rec(r, θ)</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Magnitude (r / |Z|)</label>
                  <input
                    type="number"
                    value={magPart}
                    onChange={(e) => setMagPart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. 30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Phase Angle (θ in degrees)</label>
                  <input
                    type="number"
                    value={angPart}
                    onChange={(e) => setAngPart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. 36.87"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Rectangular Form Result:</span>
                  <span className="text-xl font-bold font-mono text-amber-400">
                    {polToRectResult.a} {polToRectResult.sign} j{Math.abs(parseFloat(polToRectResult.b))}
                  </span>
                </div>
                <div className="text-xs text-slate-400 text-right">
                  <span>a = r · cos(θ)</span>
                  <br />
                  <span>b = r · sin(θ)</span>
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: Delta to Wye */}
          {calcMode === 'deltaWye' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delta to Wye (Δ → Y) Transformation</h3>
                <p className="text-xs text-slate-500">Common in 3-phase circuits and bridge network analysis.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Delta Branch Ra (Ω)</label>
                  <input
                    type="number"
                    value={ra}
                    onChange={(e) => setRa(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Delta Branch Rb (Ω)</label>
                  <input
                    type="number"
                    value={rb}
                    onChange={(e) => setRb(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Delta Branch Rc (Ω)</label>
                  <input
                    type="number"
                    value={rc}
                    onChange={(e) => setRc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-lg grid grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-slate-400 block">R1 (Opposite Ra):</span>
                  <span className="text-lg font-bold font-mono text-amber-400">{deltaWyeResult.r1} Ω</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">R2 (Opposite Rb):</span>
                  <span className="text-lg font-bold font-mono text-amber-400">{deltaWyeResult.r2} Ω</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">R3 (Opposite Rc):</span>
                  <span className="text-lg font-bold font-mono text-amber-400">{deltaWyeResult.r3} Ω</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
