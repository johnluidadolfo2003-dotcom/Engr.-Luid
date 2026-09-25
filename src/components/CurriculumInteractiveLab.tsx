import React, { useState } from 'react';
import { Zap, Calculator, Compass, Waves, ArrowRight, Sparkles } from 'lucide-react';

interface CurriculumInteractiveLabProps {
  toolType?: string;
  onOpenGrapher?: (preset?: { tool: 'phasor' | 'rlc' | 'calculator'; params?: any }) => void;
  lessonTitle: string;
}

export const CurriculumInteractiveLab: React.FC<CurriculumInteractiveLabProps> = ({
  toolType,
  onOpenGrapher,
  lessonTitle,
}) => {
  // Ohm's Law state
  const [ohmsVoltage, setOhmsVoltage] = useState<number>(230);
  const [ohmsResistance, setOhmsResistance] = useState<number>(23);

  // Quadratic Solver state
  const [quadA, setQuadA] = useState<number>(1);
  const [quadB, setQuadB] = useState<number>(4);
  const [quadC, setQuadC] = useState<number>(13);

  // Power Triangle state
  const [pfAngleDeg, setPfAngleDeg] = useState<number>(36.87);
  const [apparentS, setApparentS] = useState<number>(100);

  // Kinematics state
  const [kinV0, setKinV0] = useState<number>(0);
  const [kinA, setKinA] = useState<number>(1.5);
  const [kinT, setKinT] = useState<number>(20);

  // Carnot state
  const [tHotC, setTHotC] = useState<number>(250);
  const [tColdC, setTColdC] = useState<number>(40);

  if (!toolType) return null;

  return (
    <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl text-white space-y-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Interactive First-Principles Laboratory
            </h4>
            <span className="text-[11px] text-slate-400 font-sans">
              Test with real numbers to verify the equations live:
            </span>
          </div>
        </div>

        {onOpenGrapher && (
          <button
            onClick={() => {
              if (toolType === 'power_triangle') {
                onOpenGrapher({ tool: 'phasor', params: { voltage: 230, current: 25, phaseAngleDeg: pfAngleDeg, isLagging: true } });
              } else if (toolType === 'grapher_rlc') {
                onOpenGrapher({ tool: 'rlc' });
              } else {
                onOpenGrapher();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg transition-colors"
          >
            <span>Launch in Grapher Workbench</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* TOOL 1: OHM'S LAW & POWER CALCULATOR */}
      {toolType === 'ohms_law' && (() => {
        const current = ohmsResistance > 0 ? ohmsVoltage / ohmsResistance : 0;
        const power = ohmsVoltage * current;

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Voltage Source (V):</span>
                  <span className="font-mono font-bold text-amber-400">{ohmsVoltage} V</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="480"
                  step="5"
                  value={ohmsVoltage}
                  onChange={(e) => setOhmsVoltage(Number(e.target.value))}
                  className="w-full accent-amber-400 bg-slate-800 cursor-pointer h-2 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0 V</span>
                  <span>120 V</span>
                  <span>230 V (PH)</span>
                  <span>480 V</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Conductor Resistance (R):</span>
                  <span className="font-mono font-bold text-sky-400">{ohmsResistance} Ω</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={ohmsResistance}
                  onChange={(e) => setOhmsResistance(Number(e.target.value))}
                  className="w-full accent-sky-400 bg-slate-800 cursor-pointer h-2 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1 Ω</span>
                  <span>23 Ω (Water heater)</span>
                  <span>50 Ω</span>
                  <span>100 Ω</span>
                </div>
              </div>
            </div>

            {/* Calculated Values */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg text-center">
                <span className="text-[10px] text-slate-400 block font-mono">Current I = V/R</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {current.toFixed(2)} A
                </span>
              </div>

              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg text-center">
                <span className="text-[10px] text-slate-400 block font-mono">Power P = V × I</span>
                <span className="text-base font-bold font-mono text-amber-400">
                  {(power / 1000).toFixed(2)} kW
                </span>
              </div>

              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg text-center">
                <span className="text-[10px] text-slate-400 block font-mono">Joule Loss I²R</span>
                <span className="text-base font-bold font-mono text-sky-400">
                  {power.toFixed(0)} W
                </span>
              </div>

              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg text-center">
                <span className="text-[10px] text-slate-400 block font-mono">Parallel Law V²/R</span>
                <span className="text-base font-bold font-mono text-white">
                  {power.toFixed(0)} W
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* TOOL 2: QUADRATIC & CIRCUIT DAMPING */}
      {toolType === 'quadratic_solver' && (() => {
        const disc = quadB * quadB - 4 * quadA * quadC;
        let damping = 'Overdamped (Smooth return, two real roots)';
        let roots = '';

        if (disc > 0) {
          damping = 'Overdamped (Two distinct real roots)';
          const r1 = (-quadB + Math.sqrt(disc)) / (2 * quadA);
          const r2 = (-quadB - Math.sqrt(disc)) / (2 * quadA);
          roots = `x1 = ${r1.toFixed(3)},  x2 = ${r2.toFixed(3)}`;
        } else if (disc === 0) {
          damping = 'Critically Damped (Fastest return without oscillation)';
          const r = -quadB / (2 * quadA);
          roots = `x = ${r.toFixed(3)} (repeated)`;
        } else {
          damping = 'Underdamped (Oscillatory ringing AC response)';
          const real = -quadB / (2 * quadA);
          const imag = Math.sqrt(-disc) / (2 * quadA);
          roots = `${real.toFixed(3)} ± j${imag.toFixed(3)}`;
        }

        return (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block font-mono">a (x² term)</label>
                <input
                  type="number"
                  value={quadA}
                  onChange={(e) => setQuadA(Number(e.target.value) || 1)}
                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded font-mono text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block font-mono">b (x term)</label>
                <input
                  type="number"
                  value={quadB}
                  onChange={(e) => setQuadB(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded font-mono text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block font-mono">c (constant)</label>
                <input
                  type="number"
                  value={quadC}
                  onChange={(e) => setQuadC(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded font-mono text-xs text-white"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">
                  Discriminant D = b² - 4ac:
                </span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {disc.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Circuit Behavior:</span>
                <span className="font-semibold text-emerald-300">{damping}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Roots:</span>
                <span className="font-mono font-bold text-sky-400">{roots}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* TOOL 3: POWER TRIANGLE & POWER FACTOR */}
      {toolType === 'power_triangle' && (() => {
        const rad = (pfAngleDeg * Math.PI) / 180;
        const pf = Math.cos(rad);
        const P = apparentS * pf;
        const Q = apparentS * Math.sin(rad);

        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Phase Angle θ (Degrees):</span>
                  <span className="font-mono font-bold text-amber-400">{pfAngleDeg.toFixed(1)}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="75"
                  step="0.5"
                  value={pfAngleDeg}
                  onChange={(e) => setPfAngleDeg(Number(e.target.value))}
                  className="w-full accent-amber-400 bg-slate-800 cursor-pointer h-2 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0° (pf 1.0)</span>
                  <span>36.9° (pf 0.8)</span>
                  <span>53.1° (pf 0.6)</span>
                  <span>75°</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Apparent Power S (kVA):</span>
                  <span className="font-mono font-bold text-sky-400">{apparentS} kVA</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={apparentS}
                  onChange={(e) => setApparentS(Number(e.target.value))}
                  className="w-full accent-sky-400 bg-slate-800 cursor-pointer h-2 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2.5 bg-slate-800/80 border border-slate-700 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Power Factor cos(θ)</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {pf.toFixed(3)} ({pf >= 0.95 ? 'Excellent' : pf >= 0.85 ? 'Acceptable' : 'Penalty Zone'})
                </span>
              </div>
              <div className="p-2.5 bg-slate-800/80 border border-slate-700 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Real Power P (kW)</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{P.toFixed(1)} kW</span>
              </div>
              <div className="p-2.5 bg-slate-800/80 border border-slate-700 rounded-lg">
                <span className="text-[10px] text-slate-400 block">Reactive Q (kVAR)</span>
                <span className="font-mono font-bold text-sky-400 text-sm">{Q.toFixed(1)} kVAR</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* TOOL 4: KINEMATICS MOTION LAB */}
      {toolType === 'kinematics_calc' && (() => {
        const finalV = kinV0 + kinA * kinT;
        const dist = kinV0 * kinT + 0.5 * kinA * kinT * kinT;

        return (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block">Initial Velocity v0 (m/s)</label>
                <input
                  type="number"
                  value={kinV0}
                  onChange={(e) => setKinV0(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded font-mono text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block">Acceleration a (m/s²)</label>
                <input
                  type="number"
                  step="0.1"
                  value={kinA}
                  onChange={(e) => setKinA(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded font-mono text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block">Time t (seconds)</label>
                <input
                  type="number"
                  value={kinT}
                  onChange={(e) => setKinT(Number(e.target.value) || 1)}
                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded font-mono text-xs text-white"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg flex items-center justify-around text-xs">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block font-mono">Final Velocity: v = v0 + at</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {finalV.toFixed(2)} m/s ({(finalV * 3.6).toFixed(1)} km/h)
                </span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block font-mono">Displacement: s = v0t + ½at²</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {dist.toFixed(1)} meters
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* TOOL 5: CARNOT THERMAL EFFICIENCY */}
      {toolType === 'carnot_calc' && (() => {
        const kHot = tHotC + 273.15;
        const kCold = tColdC + 273.15;
        const eff = Math.max(0, 1 - kCold / kHot);

        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Hot Reservoir T_hot:</span>
                  <span className="font-mono font-bold text-rose-400">
                    {tHotC}°C ({kHot.toFixed(1)} K)
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="800"
                  step="10"
                  value={tHotC}
                  onChange={(e) => setTHotC(Number(e.target.value))}
                  className="w-full accent-rose-400 bg-slate-800 cursor-pointer h-2 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Cold Sink T_cold:</span>
                  <span className="font-mono font-bold text-sky-400">
                    {tColdC}°C ({kCold.toFixed(1)} K)
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={tColdC}
                  onChange={(e) => setTColdC(Number(e.target.value))}
                  className="w-full accent-sky-400 bg-slate-800 cursor-pointer h-2 rounded-lg"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">
                  Carnot Max Limit: η = 1 - (T_cold/T_hot)
                </span>
                <span className="font-mono font-bold text-amber-400 text-base">
                  {(eff * 100).toFixed(2)}%
                </span>
              </div>
              <div className="text-right text-[11px] text-slate-300 max-w-xs">
                <span>Both values converted to Kelvin automatically. Never use Celsius in Carnot!</span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
