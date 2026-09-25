import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Google Gen AI with fallback model strategy
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Multi-model fallback list in order of speed and quota resilience
const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

async function generateWithFallback(options: {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
  temperature?: number;
}): Promise<string> {
  if (!ai) {
    throw new Error('AI client not initialized (GEMINI_API_KEY missing)');
  }

  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: {
          systemInstruction: options.systemInstruction,
          responseMimeType: options.responseMimeType,
          temperature: options.temperature ?? 0.3,
        },
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed, trying next candidate. Error:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All AI models unavailable');
}

const REE_SYSTEM_INSTRUCTION = `You are "Engr. Lex", an expert electrical engineering mentor and tutor for the Philippine Registered Electrical Engineer (REE) Licensure Board Exam.

IMPORTANT PEDAGOGICAL DIRECTIVES:
1. START FROM THE BASICS: Assume the student is starting with fundamental knowledge. Always explain basic math (algebra, trigonometry, Pythagorean theorem, right triangles, arithmetic) and fundamental electrical concepts (Ohm's law, power, series/parallel) clearly and simply.
2. NO RAW MESSY LATEX: Do NOT output raw LaTeX code with broken backslashes like "\\frac{a}{b}" or "\\sqrt{3}" in a way that looks like raw unparsed code. Always format formulas cleanly using standard human-readable symbols:
   - Use "√3" or "sqrt(3)", "×" for multiplication, "÷" for division, "²" for square, "π" for pi, "θ" for theta, "Ω" for Ohms, "µF" for microfarads, "∠" for polar angle.
   - Example: Write "P = √3 × V_L × I_L × cos(θ)" instead of "\\sqrt{3}".
3. ZERO-JARGON INTUITION FIRST:
   - Explain what each variable means in plain English before plugging in numbers.
   - For example: "Real Power (P) in Watts is the actual usable work done, while Apparent Power (S) in VA is the total capacity."
4. STEP-BY-STEP CALCULATION:
   - Step 1: Identify given values with standard units.
   - Step 2: State the primary formula clearly.
   - Step 3: Substitute the numbers step-by-step.
   - Step 4: Show the final answer with units.
5. CASIO fx-991ES / fx-570ES SHORTCUT:
   - Provide the exact keys to press on a standard PRC-allowed scientific calculator (e.g., Mode 2 CMPLX, Pol/Rec conversions).
6. TONE: Encouraging, clear, structured, and easy to absorb without overwhelming.`;

// Intelligent Offline Fallback for Tutor
function getIntelligentFallbackAnswer(userQuery: string): string {
  const q = userQuery.toLowerCase();

  if (q.includes('ohm') || q.includes('v = ir') || q.includes('voltage') && q.includes('current')) {
    return `### Ohm's Law — Starting from the Absolute Basics

**What is it?**
Ohm's Law is the foundational rule of all electrical engineering. It connects three basic quantities:
1. **Voltage (V)** in Volts (V): The "electrical pressure" pushing electrons through a circuit.
2. **Current (I)** in Amperes (A): The flow rate of electrons (how much electricity is moving per second).
3. **Resistance (R)** in Ohms (Ω): The opposition or friction that resists the flow of electrons.

**The Golden Triangle Formula:**
- **V = I × R** (To find Voltage: multiply Current by Resistance)
- **I = V ÷ R** (To find Current: divide Voltage by Resistance)
- **R = V ÷ I** (To find Resistance: divide Voltage by Current)

**Basic Example:**
If a 230 V outlet is connected to a heater element with a resistance of 46 Ω:
- Current I = V ÷ R = 230 V ÷ 46 Ω = **5.0 A**

**Power Formula (Joule's Law):**
- **P = V × I = I² × R = V² ÷ R** (measured in Watts)
- Power for this heater = 230 V × 5 A = **1,150 Watts (1.15 kW)**.

**Casio 991ES Board Exam Tip:**
Always verify that units are consistent! If resistance is in kΩ (kilo-ohms), multiply by 1,000 before dividing.`;
  }

  if (q.includes('power factor') || q.includes('pf') || q.includes('capacitor') || q.includes('lagging') || q.includes('leading')) {
    return `### Power Factor (pf) & Power Factor Correction — Step-by-Step

**What is Power Factor in Plain English?**
Imagine a glass of draft beer:
- The liquid beer is **Real Power (P)** in Watts or kW: This does the actual work (turning motors, lighting lamps).
- The foam on top is **Reactive Power (Q)** in VAR or kVAR: Needed to sustain the magnetic field in coils/transformers, but does no mechanical work.
- The entire glass is **Apparent Power (S)** in VA or kVA: The total power the utility generator must supply.

**Power Factor formula:**
- **pf = cos(θ) = P ÷ S** (Ranges from 0 to 1.0)
- Ideal power factor is 1.0 (Unity), where 100% of the supplied power is converted into useful work.
- In inductive loads (motors), current lags voltage: **Lagging pf**.

**How to Size a Capacitor for Power Factor Correction:**
When a review center asks you to raise power factor from pf1 to pf2:
1. Find original angle: **θ₁ = arccos(pf₁)**
2. Find desired angle: **θ₂ = arccos(pf₂)**
3. Reactive power to eliminate: **Qc = P × (tan θ₁ - tan θ₂)** (in VAR)
4. Capacitor size: **C = Qc ÷ (2 × π × f × V²)** (multiply by 10⁶ for microfarads µF).

**Casio fx-991ES Shortcut:**
Enter: \`P × (tan(cos⁻¹(pf1)) - tan(cos⁻¹(pf2)))\` then divide by \`(2 × π × 60 × V²)\`. Done in 30 seconds!`;
  }

  if (q.includes('trig') || q.includes('soh') || q.includes('cah') || q.includes('triangle') || q.includes('pythagor')) {
    return `### Basic Right-Triangle Trigonometry (The Key to All AC Circuits)

In electrical engineering, **AC impedance and power are just right triangles!**
- Horizontal side = Resistance (R) or Real Power (P)
- Vertical side = Reactance (X) or Reactive Power (Q)
- Hypotenuse = Total Impedance (Z) or Apparent Power (S)

**The 3 Golden Ratios (SOH - CAH - TOA):**
1. **sin(θ) = Opposite ÷ Hypotenuse** (Reactive ratio: Q ÷ S or X ÷ Z)
2. **cos(θ) = Adjacent ÷ Hypotenuse** (This is the **Power Factor**: P ÷ S or R ÷ Z)
3. **tan(θ) = Opposite ÷ Adjacent** (Ratio: Q ÷ P or X ÷ R)

**Pythagorean Theorem:**
- **Z = √(R² + X²)**
- **S = √(P² + Q²)**

**Classic 3-4-5 Triangle Rule:**
If R = 3 Ω and X = 4 Ω, the hypotenuse is automatically Z = 5 Ω!
The angle is θ = arctan(4/3) = **53.13°**, and power factor = cos(53.13°) = **0.60**.`;
  }

  return `### Engr. Lex Board Exam Mentor Guide

**Query:** "${userQuery}"

**Foundation Approach:**
1. **Identify the Given Quantities**: Always extract values and convert them to standard SI units (Volts, Amperes, Ohms, Watts, Hertz).
2. **Choose the Core Formula**:
   - Single-phase AC: P = V × I × cos(θ)
   - 3-Phase AC: P = √3 × V_L × I_L × cos(θ) (where √3 ≈ 1.732)
   - Synchronous Speed: N_s = (120 × f) ÷ P
   - Ohm's Law: V = I × R
3. **Casio fx-991ES Execution**: Use Mode 2 (CMPLX) for all AC and complex number calculations so you don't make manual algebra errors.

Feel free to ask for step-by-step solutions to any specific problem or basic math concept!`;
}

// API: Chat with Engineering Mentor
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], context = '' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (!ai) {
      const fallback = getIntelligentFallbackAnswer(message);
      return res.json({ reply: fallback });
    }

    const conversationParts: any[] = [];
    if (context) {
      conversationParts.push({
        text: `[Active Exam Context / Review Topic]:\n${context}\n`,
      });
    }

    // Add recent history
    if (Array.isArray(history)) {
      history.slice(-6).forEach((h: any) => {
        conversationParts.push({
          text: `${h.role === 'user' ? 'Student' : 'Engr. Lex'}: ${h.content}\n`,
        });
      });
    }

    conversationParts.push({
      text: `Student Question: ${message}\nRemember: Explain from the absolute basics with clear arithmetic/algebra. Use clean readable math symbols (√3, ×, ÷, ², θ, Ω) rather than raw unparsed LaTeX backslashes. Include step-by-step calculation and a Casio fx-991ES calculator tip.`,
    });

    try {
      const reply = await generateWithFallback({
        contents: { parts: conversationParts },
        systemInstruction: REE_SYSTEM_INSTRUCTION,
        temperature: 0.3,
      });

      return res.json({ reply });
    } catch (aiErr: any) {
      console.warn('AI generateWithFallback encountered an error, serving intelligent fallback:', aiErr?.message);
      const fallback = getIntelligentFallbackAnswer(message);
      return res.json({ reply: fallback });
    }
  } catch (error: any) {
    console.error('Chat error:', error);
    const fallback = getIntelligentFallbackAnswer(req.body?.message || 'General Engineering');
    res.json({ reply: fallback });
  }
});

// API: Analyze Uploaded Review Center Material
app.post('/api/analyze-notes', async (req: Request, res: Response) => {
  try {
    const { textContent = '', imageBase64, mimeType = 'image/jpeg', filename = 'Review Material' } = req.body;

    const parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType,
          data: imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, ''),
        },
      });
    }

    const prompt = `Analyze this Electrical Engineering review center material (${filename}).
${textContent ? `Text content:\n${textContent}\n` : ''}

Extract and organize into clean JSON with these exact keys:
1. "summary": Array of 3-4 concise bullet points explaining the core concepts starting from fundamentals.
2. "subject": Either "Mathematics" or "EE Major" or "ESAS".
3. "keyFormulas": Array of 3-6 essential formulas formatted with clean symbols (e.g. "P = √3 × V_L × I_L × cos(θ)", "V = I × R", "N_s = 120f / P").
4. "boardExamTips": Array of 2-4 memory tricks, basic definitions, or calculator shortcuts.
5. "generatedDrills": Array of 3 multiple-choice board-exam style questions starting from clear fundamentals. Each with:
   - "question": string
   - "options": array of 4 string choices
   - "correctAnswer": 0-indexed number (0, 1, 2, or 3)
   - "explanation": step-by-step solution from basic arithmetic
   - "formula": primary clean formula used

Respond strictly in valid JSON format.`;

    parts.push({ text: prompt });

    if (ai) {
      try {
        const rawJson = await generateWithFallback({
          contents: { parts },
          systemInstruction: REE_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.2,
        });

        const parsed = JSON.parse(rawJson);
        return res.json(parsed);
      } catch (e: any) {
        console.warn('AI analysis fallback triggered:', e?.message);
      }
    }

    // High quality default analysis if AI unavailable or rate limited
    return res.json({
      summary: [
        `Summary of ${filename}: Focuses on foundational relationships between Voltage, Current, Power, and Impedance.`,
        'Every complex problem can be broken down into right-triangle geometry and Ohm’s Law fundamentals.',
        'Units must be standardized: convert kVA to VA and HP to Watts (1 HP = 746 Watts) before calculations.',
      ],
      subject: 'EE Major',
      keyFormulas: [
        'P = √3 × V_L × I_L × cos(θ) (3-Phase Active Power in Watts)',
        'V = I × R (Ohm’s Law: Voltage = Current × Resistance)',
        'Z = √(R² + (X_L - X_C)²) (Total AC Impedance Magnitude)',
        'N_s = (120 × f) ÷ P (Synchronous Speed of Motor/Generator in RPM)',
      ],
      boardExamTips: [
        'For 3-Phase systems: Line current I_L = Phase current I_ph in Wye; Line voltage V_L = Phase voltage V_ph in Delta.',
        'Never forget that 1 Horsepower (HP) = 746 Watts. Divide output Watts by efficiency to get input Watts.',
        'Casio 991ES trick: Use Mode 2 (CMPLX) to add impedances in rectangular or polar format directly.',
      ],
      generatedDrills: [
        {
          question: 'A 230 V single-phase heating element draws 10 Amperes of current. What is the electrical resistance of the heater, and how much power does it consume?',
          options: ['23 Ω and 2,300 W', '46 Ω and 1,150 W', '11.5 Ω and 4,600 W', '23 Ω and 1,150 W'],
          correctAnswer: 0,
          explanation: 'Step 1: Ohm’s Law gives R = V ÷ I = 230 V ÷ 10 A = 23 Ω. Step 2: Power P = V × I = 230 V × 10 A = 2,300 Watts.',
          formula: 'R = V ÷ I,  P = V × I',
        },
        {
          question: 'A 3-phase, 230 V induction motor delivers 10 HP at full load with an efficiency of 85% and a power factor of 0.80 lagging. Calculate the line current drawn from the supply.',
          options: ['29.3 A', '24.9 A', '34.5 A', '19.8 A'],
          correctAnswer: 0,
          explanation: 'Step 1: Output power P_out = 10 HP × 746 W/HP = 7,460 W. Step 2: Input power P_in = P_out ÷ efficiency = 7,460 ÷ 0.85 = 8,776.5 W. Step 3: For 3-Phase, P_in = √3 × V_L × I_L × pf. Therefore: I_L = 8,776.5 ÷ (1.732 × 230 × 0.80) = 29.3 Amperes.',
          formula: 'I_L = P_in ÷ (√3 × V_L × pf)',
        },
      ],
    });
  } catch (error: any) {
    console.error('Analyze notes error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze material' });
  }
});

// API: Generate Custom Practice Problems
app.post('/api/generate-problems', async (req: Request, res: Response) => {
  try {
    const { subject = 'EE Major', topic = 'AC Circuits', count = 4, difficulty = 'Basic Foundation' } = req.body;

    const prompt = `Generate ${count} Philippine Registered Electrical Engineer (REE) Licensure Exam practice problems.
Subject: "${subject}", Topic: "${topic}", Level: "${difficulty}".
IMPORTANT:
- Ensure questions start from clear fundamentals and progress logically.
- Format all formulas cleanly with standard readable math symbols (e.g. √3, ×, ÷, ², π, θ, Ω) and avoid raw unparsed LaTeX backslashes.
- Provide step-by-step arithmetic explanations that a beginner can follow without confusion.
- Provide a Casio fx-991ES calculator execution trick.

Respond in JSON with a "problems" array where each item has:
- id: string
- subject: "${subject}"
- topic: "${topic}"
- level: "${difficulty}"
- question: string
- options: array of 4 strings
- correctAnswer: number (0 to 3)
- formula: string (clean formatted string)
- solutionSteps: array of 3-4 clear calculation steps
- calculatorTrick: 1-line calculator instruction`;

    if (ai) {
      try {
        const rawJson = await generateWithFallback({
          contents: prompt,
          systemInstruction: REE_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.3,
        });

        const parsed = JSON.parse(rawJson);
        if (parsed.problems && Array.isArray(parsed.problems)) {
          return res.json(parsed);
        }
      } catch (err: any) {
        console.warn('AI problem generation error, using fallback questions:', err?.message);
      }
    }

    // High quality structured fallback problems starting from basics
    const fallbackProblems = [
      {
        id: `fb-basic-math-${Date.now()}-1`,
        subject: 'Mathematics',
        topic: 'Algebra & Quadratic Equations',
        level: 'Basic Math Foundation',
        question: 'Solve for x in the quadratic equation: 2x² - 7x + 3 = 0. What are the roots?',
        options: ['x = 3 and x = 0.5', 'x = -3 and x = -0.5', 'x = 2 and x = 1.5', 'x = 3 and x = -0.5'],
        correctAnswer: 0,
        formula: 'x = [-b ± √(b² - 4ac)] ÷ 2a',
        solutionSteps: [
          'Identify coefficients: a = 2, b = -7, c = 3',
          'Calculate discriminant: b² - 4ac = (-7)² - 4(2)(3) = 49 - 24 = 25',
          'Take square root: √25 = 5',
          'Apply quadratic formula: x = [-(-7) ± 5] ÷ (2 × 2) = (7 ± 5) ÷ 4',
          'Root 1: (7 + 5) ÷ 4 = 12 ÷ 4 = 3; Root 2: (7 - 5) ÷ 4 = 2 ÷ 4 = 0.5',
        ],
        calculatorTrick: 'Casio fx-991ES: Press [MODE] → [5:EQN] → [3:ax²+bx+c=0]. Enter 2, -7, 3. Press [=] to get X1=3, X2=1/2 instantly.',
      },
      {
        id: `fb-basic-circuit-${Date.now()}-2`,
        subject: 'EE Major',
        topic: 'Ohm’s Law & Resistor Networks',
        level: 'Basic Circuits',
        question: 'Two resistors of 10 Ω and 40 Ω are connected in parallel across a 20 V DC power supply. What is the total current supplied by the source?',
        options: ['2.5 A', '2.0 A', '0.4 A', '3.0 A'],
        correctAnswer: 0,
        formula: '1/R_eq = 1/R1 + 1/R2,  or R_eq = (R1 × R2) ÷ (R1 + R2);  I_total = V ÷ R_eq',
        solutionSteps: [
          'Find equivalent parallel resistance: R_eq = (10 × 40) ÷ (10 + 40) = 400 ÷ 50 = 8.0 Ω',
          'Apply Ohm’s Law: I_total = V ÷ R_eq = 20 V ÷ 8.0 Ω = 2.5 Amperes',
          'Double check branch currents: I1 = 20 ÷ 10 = 2.0 A; I2 = 20 ÷ 40 = 0.5 A. Sum = 2.0 + 0.5 = 2.5 A.',
        ],
        calculatorTrick: 'In Casio fx-991ES: Enter 20 ÷ (10⁻¹ + 40⁻¹) = 2.5 directly using the [x⁻¹] key.',
      },
    ];

    res.json({ problems: fallbackProblems });
  } catch (error: any) {
    console.error('Generate problems error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate problems' });
  }
});

// Development vs Production serving
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`REE Board Exam Review Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
