import { CurriculumTrack } from '../types';
export interface TermCard { id:string; track:CurriculumTrack; group:string; term:string; meaning:string; distinguish:string; }
const rows: Record<CurriculumTrack,string> = {
mathematics: `m-algebra|Coefficient|The number multiplying a variable.|Constant has no variable.
m-algebra|Complex conjugate|Same real part, opposite imaginary sign.|Conjugate of a + jb is a − jb.
m-trig|Radian|An angle measured by arc length divided by radius.|π radians equals 180 degrees.
m-trig|Reference angle|The acute angle a terminal side makes with the x-axis.|Use the quadrant for the final sign.
m-geometry|Slope|Vertical change divided by horizontal change.|A vertical line has undefined slope.
m-geometry|Locus|The set of points satisfying a geometric condition.|A circle is one locus.
m-stats|Median|The middle sorted observation.|Mean is affected more by extreme values.
m-stats|Independent events|One event does not change the probability of the other.|Independent is different from mutually exclusive.
m-calc1|Derivative|Instantaneous rate of change; slope of the tangent.|Integral accumulates a total.
m-calc1|Critical point|A point where the derivative is zero or undefined.|Check whether it is max, min or neither.
m-calc2|Definite integral|Signed area or accumulated change over an interval.|Indefinite integrals include + C.
m-calc2|Integration constant|A constant lost when differentiating.|Required for an indefinite integral.
m-data|Outlier|An observation far from the rest of the data.|Do not discard without a reason.
m-data|Standard deviation|The typical spread around the mean, in original units.|Variance uses squared units.
m-data|Regression|Fitting a relationship to observed data.|Correlation alone does not prove causation.
m-de|Initial condition|A known value used to determine a particular solution.|A general solution still has constants.
m-de|Time constant|Characteristic time of exponential growth or decay.|At one τ, decay remains about 36.8%.
m-numerical|Convergence|Successive estimates approach a stable answer.|Divergence moves away or oscillates.
m-numerical|Truncation error|Error caused by approximating a mathematical procedure.|Round-off comes from limited digits.
m-numerical|Bisection|Repeatedly halves a root bracket with opposite endpoint signs.|Newton method uses a tangent slope.`,
esas: `s-chem|Oxidation|Loss of electrons in a chemical reaction.|Reduction gains electrons.
s-chem|Electrolyte|Ion-conducting substance between battery electrodes.|Electrons flow in the external circuit.
s-physics|Momentum|Mass times velocity; a vector.|Kinetic energy depends on velocity squared.
s-physics|Impulse|Force integrated over time; change in momentum.|Force alone does not state duration.
s-computing|ALU|Processor unit performing arithmetic and logical operations.|Memory stores information.
s-computing|Flip-flop|Circuit that stores one binary bit.|A combinational gate does not store state.
s-computing|AND gate|Outputs 1 only when every input is 1.|OR needs at least one 1.
s-materials|Doping|Adding impurities to control semiconductor carriers.|Do not confuse with alloying for strength.
s-materials|Life-cycle assessment|Study of impacts from extraction through disposal.|Operation is only one stage.
s-fluid|Gauge pressure|Pressure relative to ambient atmospheric pressure.|Absolute pressure includes ambient.
s-fluid|Buoyancy|Upward force equal to weight of displaced fluid.|Depends on displaced fluid volume.
s-deformable|Stress|Internal force divided by area.|Strain is relative deformation.
s-deformable|Young modulus|Elastic stress divided by elastic strain.|Stiffness is not material strength.
s-thermo|Enthalpy|Internal energy plus pressure–volume product.|Useful for flowing fluids.
s-thermo|Carnot efficiency|Ideal upper efficiency between two thermal reservoirs.|Both temperatures must be absolute.
s-laws|RA 7920|Philippine law regulating electrical engineering practice and licensure.|Installation rules are in the applicable PEC.
s-laws|Bonding|Electrical connection between metal parts to help create a fault-current path.|Grounding connects a system or equipment to earth.
s-laws|Hazard|A source with potential to cause harm.|Risk considers likelihood and severity.
s-laws|Professional ethics|Principles guiding responsible professional conduct.|Separate from numeric design rules.
s-econ|Present worth|Value today equivalent to a future amount at a stated rate.|Future worth grows forward.
s-econ|Sunk cost|Past cost that cannot be recovered.|Do not treat it as an avoidable future cost.
s-management|Critical path|Longest dependency path setting earliest completion.|Slack can exist on noncritical tasks.
s-management|Break-even point|Output where total revenue equals total cost.|Profit is zero at this point.`,
electrical: `e-em|Magnetic flux|Total magnetic field passing through a surface.|Flux density is flux per area.
e-em|Reluctance|Opposition of a magnetic path to flux.|Analogous to resistance, with different units.
e-em|Faraday law|Changing magnetic flux induces an electromotive force.|Lenz law gives the opposing direction.
e-circuits1|Node|Point at which circuit branches connect.|A loop is a closed path.
e-circuits1|Superposition|Response from each independent source added for a linear circuit.|Dependent sources remain active.
e-circuits1|Thevenin equivalent|Voltage source in series with an equivalent resistance.|Norton uses current source in parallel.
e-circuits2|Reactance|AC opposition from inductance or capacitance.|Resistance dissipates real power.
e-circuits2|Admittance|Reciprocal of impedance.|Measured in siemens.
e-circuits2|Resonance|Frequency where inductive and capacitive effects cancel in a series RLC circuit.|Impedance magnitude is minimum for ideal series RLC.
e-comms|Carrier|High-frequency signal altered to carry information.|Modulating signal carries the message.
e-comms|Amplitude modulation|Varying a carrier's amplitude with information.|FM varies carrier frequency.
e-comms|Rectifier|Circuit converting AC to pulsating DC.|An inverter converts DC to AC.
e-apparatus|Contactor|Electrically operated switch for a power circuit.|Overload relay detects prolonged overcurrent.
e-apparatus|Circuit breaker|Switching device able to interrupt rated fault current.|A disconnect may not have fault interrupting rating.
e-apparatus|PWM|Pulse-width modulation; controls average output via on-time.|Duty cycle is the on-time fraction.
e-machines1|Turns ratio|Ratio of primary to secondary transformer turns.|Ideal voltage ratio follows turns ratio.
e-machines1|Back EMF|Voltage produced by a rotating motor opposing applied voltage.|Not the same as supply voltage.
e-machines1|Core loss|Transformer loss mainly from hysteresis and eddy currents.|Copper loss varies with current squared.
e-machines2|Slip|Difference between synchronous and rotor speed divided by synchronous speed.|Induction motor has nonzero slip under load.
e-machines2|Synchronous speed|Speed of the rotating magnetic field set by frequency and poles.|Rotor speed need not equal it.
e-machines2|Excitation|Field supply establishing magnetic flux in a synchronous machine.|Different from mechanical input torque.
e-control|Accuracy|Closeness of a reading to a reference.|Precision is repeatability.
e-control|Feedback|Measured output returned for comparison with a reference.|Open-loop control lacks this correction.
e-control|Transfer function|Output/input relation in the Laplace domain with zero initial conditions.|Describes a system model, not a physical part.
e-illumination|Lumen|Unit of luminous flux, the amount of visible light output.|Lux is lumens per square metre.
e-illumination|Illuminance|Light received per unit area.|Measured in lux.
e-illumination|Demand factor|Maximum demand divided by total connected load.|Usually no greater than 1 for the same defined load set.
e-plant|Feeder|Circuit carrying power from a distribution source toward downstream loads.|Branch circuit supplies final outlets or equipment.
e-plant|Substation|Installation that transforms, switches, or controls electric power.|A power plant produces electricity.
e-plant|Generator|Converts mechanical energy into electrical energy.|A motor converts electrical to mechanical.
e-power|Per-unit value|Actual quantity divided by a chosen base quantity.|A unitless normalized value.
e-power|Positive-sequence|Balanced three-phase components with normal phase order.|Negative sequence has reverse order.
e-power|Fault current|Current flowing during an abnormal short-circuit condition.|Not the normal load current.
e-power|Voltage regulation|Change in voltage between stated operating conditions relative to a base voltage.|Always check the problem's denominator convention.
e-power|Protection coordination|Selection of devices so the intended device clears a fault selectively.|Interrupting rating is a separate check.`,
};
export const termBank: TermCard[] = (Object.keys(rows) as CurriculumTrack[]).flatMap(track=>rows[track].trim().split('\n').map((row,i)=>{const [group,term,meaning,distinguish]=row.split('|');return {id:`${track}-${i}`,track,group,term,meaning,distinguish};}));
