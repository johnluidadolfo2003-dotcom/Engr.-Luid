import { extendedMath, extendedElectrical, extendedEsas } from './extendedCurriculum';
import { mathematicsStages } from './curriculum/mathStages';
import { electricalStages } from './curriculum/electricalStages';
import { esasStages } from './curriculum/esasStages';

export const fullMathematicsStages = [...mathematicsStages, ...extendedMath];
export const fullElectricalStages = [...electricalStages, ...extendedElectrical];
export const fullEsasStages = [...esasStages, ...extendedEsas];
