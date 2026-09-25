import { FormulaItem } from '../types';

export const formulaVault: FormulaItem[] = [
  // ==========================================
  // BASIC MATH FOUNDATIONS
  // ==========================================
  {
    id: 'f-math-0',
    subject: 'Mathematics',
    category: 'Algebra Fundamentals',
    title: 'Quadratic Formula & Discriminant',
    level: 'Foundation: Basic Math',
    formula: 'x = [-b ± √(b² - 4ac)] ÷ (2a)',
    variables: 'a = coefficient of x², b = coefficient of x, c = constant term, (b² - 4ac) = Discriminant',
    plainEnglish:
      'Finds the exact values of x where any quadratic equation ax² + bx + c = 0 crosses zero. If the discriminant is positive, there are 2 real roots; if zero, 1 root; if negative, 2 complex conjugate roots.',
    boardExamTip: 'Use Casio fx-991ES: Press [MODE] → [5:EQN] → [3:ax²+bx+c=0] to solve in 3 seconds.',
    units: 'Unitless or problem specific',
  },
  {
    id: 'f-math-0b',
    subject: 'Mathematics',
    category: 'Trigonometry Fundamentals',
    title: 'Right Triangle Ratios (SOH - CAH - TOA) & Pythagoras',
    level: 'Foundation: Basic Math',
    formula: 'c² = a² + b²  ⟹  c = √(a² + b²),   sin(θ) = Opp/Hyp,   cos(θ) = Adj/Hyp,   tan(θ) = Opp/Adj',
    variables: 'c = Hypotenuse (diagonal), a = Adjacent base, b = Opposite height, θ = Angle',
    plainEnglish:
      'The foundation of all AC electrical circuits! The horizontal side is Resistance (R) or Real Power (P), the vertical side is Reactance (X) or Reactive Power (Q), and the diagonal hypotenuse is Total Impedance (Z) or Apparent Power (S).',
    boardExamTip: 'cos(θ) in a right triangle is the exact mathematical definition of Power Factor (pf = P / S = R / Z)!',
    units: 'Sides in meters or Ohms (Ω), Angles in Degrees (°)',
  },
  {
    id: 'f-math-0c',
    subject: 'Mathematics',
    category: 'Complex Numbers',
    title: 'Rectangular to Polar Conversion',
    level: 'Foundation: Basic Math',
    formula: 'Z = a + jb  ⟹  |Z| = √(a² + b²),   θ = arctan(b ÷ a)  ⟹  Z = |Z| ∠ θ',
    variables: 'a = Real part (Resistance R), b = Imaginary part (Reactance X), j = √(-1), |Z| = Magnitude, θ = Phase Angle',
    plainEnglish:
      'In AC circuits, resistance and reactance are at 90° to each other. Rectangular form (a + jb) is used for adding circuits in series, while Polar form (|Z|∠θ) is used for multiplying and dividing voltages and currents.',
    boardExamTip: 'In Casio fx-991ES: Set Mode 2 (CMPLX). Convert instantly with [SHIFT] → [2:CMPLX] → [3:►r∠θ].',
    units: 'Ohms (Ω) or Volts (V) or Amperes (A)',
  },

  // ==========================================
  // BASIC ELECTRICAL CIRCUITS
  // ==========================================
  {
    id: 'f-ee-0a',
    subject: 'EE Major',
    category: 'DC Fundamentals',
    title: 'Ohm’s Law & Joule’s Power Law',
    level: 'Foundation: Basic Circuits',
    formula: 'V = I × R,   I = V ÷ R,   R = V ÷ I,   P = V × I = I² × R = V² ÷ R',
    variables: 'V = Voltage (Volts), I = Current (Amperes), R = Resistance (Ohms), P = Power (Watts)',
    plainEnglish:
      'Voltage is electrical pressure pushing electrons; Current is the rate of electron flow; Resistance is opposition to flow. Electrical Power in Watts represents heat or work done per second.',
    boardExamTip: 'Remember the mnemonic triangle: V on top, I and R on bottom. Cover the one you want to solve for!',
    units: 'V in Volts (V), I in Amps (A), R in Ohms (Ω), P in Watts (W)',
  },
  {
    id: 'f-ee-0b',
    subject: 'EE Major',
    category: 'DC Fundamentals',
    title: 'Series and Parallel Resistor Combinations',
    level: 'Foundation: Basic Circuits',
    formula: 'Series: R_total = R1 + R2 + ...   |   Parallel: 1/R_total = 1/R1 + 1/R2,  or  R_total = (R1 × R2) ÷ (R1 + R2)',
    variables: 'R1, R2 = individual branch resistors, R_total = total equivalent circuit resistance',
    plainEnglish:
      'In series, current has only one path, so resistances add up. In parallel, current divides across multiple paths, so total resistance is always smaller than the smallest branch resistor.',
    boardExamTip: 'For two parallel resistors, always use "Product over Sum": (R1 × R2) / (R1 + R2).',
    units: 'Resistance in Ohms (Ω)',
  },

  // ==========================================
  // INTERMEDIATE & AC CIRCUITS
  // ==========================================
  {
    id: 'f-ee-1',
    subject: 'EE Major',
    category: 'AC Circuits',
    title: '3-Phase Balanced Active Power',
    level: 'Intermediate: AC Fundamentals',
    formula: 'P = √3 × V_L × I_L × cos(θ) = 3 × V_ph × I_ph × cos(θ)',
    variables: 'V_L = Line-to-Line Voltage, I_L = Line Current, cos(θ) = Power Factor, √3 ≈ 1.73205',
    plainEnglish:
      'Total active power consumed by a balanced 3-phase load (like a 3-phase motor or factory feeder). Always use Line values with √3.',
    boardExamTip: 'In Wye (Y): Line Voltage = √3 × Phase Voltage, Line Current = Phase Current. In Delta (Δ): Line Voltage = Phase Voltage, Line Current = √3 × Phase Current.',
    units: 'P in Watts (W), S in Volt-Amps (VA), Q in VAR',
  },
  {
    id: 'f-ee-2',
    subject: 'EE Major',
    category: 'AC Circuits',
    title: 'Power Factor Correction Capacitor Size',
    level: 'Intermediate: AC Fundamentals',
    formula: 'Q_c = P × [tan(θ₁) - tan(θ₂)],   C = Q_c ÷ (2 × π × f × V²)',
    variables: 'P = Active Real Power in Watts, θ₁ = Original Lagging Angle, θ₂ = Improved Angle, f = 60 Hz in PH, V = Voltage',
    plainEnglish:
      'Calculates the exact capacitor rating needed to cancel inductive motor lagging current and bring the utility power factor up to target (usually 0.90 to 0.95), avoiding electric bill penalties.',
    boardExamTip: 'Multiply C in Farads by 1,000,000 (10⁶) to get microfarads (µF).',
    units: 'Q_c in VAR or kVAR, C in Farads (F) or microfarads (µF)',
  },
  {
    id: 'f-ee-3',
    subject: 'EE Major',
    category: 'Electrical Machines',
    title: 'Induction Motor Synchronous Speed & Slip',
    level: 'Intermediate: AC Fundamentals',
    formula: 'N_s = (120 × f) ÷ P,   s = (N_s - N_r) ÷ N_s,   f_r = s × f',
    variables: 'f = Frequency (60 Hz in Philippines), P = Number of magnetic poles, N_s = Synchronous Speed (rpm), N_r = Rotor Speed, s = Slip (0 to 1), f_r = Rotor induced frequency',
    plainEnglish:
      'The stator magnetic field rotates at synchronous speed N_s. The mechanical rotor must rotate slightly slower (slipping by fraction s) to induce voltage in the rotor bars and generate torque.',
    boardExamTip: 'At 60 Hz: 2 poles = 3,600 rpm; 4 poles = 1,800 rpm; 6 poles = 1,200 rpm; 8 poles = 900 rpm.',
    units: 'N_s, N_r in RPM; s is a decimal fraction; f_r in Hertz (Hz)',
  },
  {
    id: 'f-ee-4',
    subject: 'EE Major',
    category: 'Electrical Machines',
    title: 'Transformer Turns Ratio & Voltage Regulation',
    level: 'Intermediate: AC Fundamentals',
    formula: 'V1 ÷ V2 = N1 ÷ N2 = I2 ÷ I1,   %VR = [(V_no_load - V_full_load) ÷ V_full_load] × 100%',
    variables: 'V1, V2 = Primary and secondary voltages, N1, N2 = Number of turns, I1, I2 = Currents, %VR = Percent Voltage Regulation',
    plainEnglish:
      'Transformers change voltage levels via magnetic induction. If voltage steps down, current steps up by the exact same ratio so total power remains constant.',
    boardExamTip: 'Voltage regulation measures terminal voltage drop under load. A smaller %VR means a stiffer, better voltage supply.',
    units: 'Volts (V), Amperes (A), Turns (N), %',
  },
  {
    id: 'f-ee-5',
    subject: 'EE Major',
    category: 'Power Systems',
    title: 'Per-Unit Reactance Base Change',
    level: 'Advanced: Board Exam Standard',
    formula: 'X_pu,new = X_pu,old × (V_base,old ÷ V_base,new)² × (MVA_base,new ÷ MVA_base,old)',
    variables: 'X_pu = Per-unit reactance, V_base = Base Voltage, MVA_base = Base Mega-Volt-Amperes',
    plainEnglish:
      'Power systems connect generators, transformers, and lines at different voltages. The per-unit system standardizes all components to a common system-wide Base MVA.',
    boardExamTip: 'Notice the voltage ratio is squared: (V_old / V_new)², while MVA is directly proportional: (MVA_new / MVA_old).',
    units: 'Per-unit (pu) dimensionless',
  },
];
