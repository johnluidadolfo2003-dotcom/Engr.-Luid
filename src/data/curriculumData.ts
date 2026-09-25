import { extendedMath, extendedElectrical, extendedEsas } from './extendedCurriculum';
import { mathCoverageStage, esasCoverageStage, electricalCoverageStage } from './coverageLessons';
import { mathematicsStages } from './curriculum/mathStages';
import { electricalStages } from './curriculum/electricalStages';
import { esasStages } from './curriculum/esasStages';

export const fullMathematicsStages = [...mathematicsStages, ...extendedMath, mathCoverageStage];
export const fullElectricalStages = [...electricalStages, ...extendedElectrical, electricalCoverageStage];
export const fullEsasStages = [...esasStages, ...extendedEsas, esasCoverageStage];
