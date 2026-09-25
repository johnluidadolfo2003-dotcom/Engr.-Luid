import { CurriculumTrack } from '../types';

/** Main REE topic groups and item allocations in PRC Board Resolution 40 (2024), Annex A. */
export const PRC_2024_TOS_URL = 'https://www.prc.gov.ph/sites/default/files/2024-40%20Annex%20A.pdf';
export interface CoverageTopic { id: string; title: string; items: number; lessons: string[]; }
export interface CoverageSubject { track: CurriculumTrack; name: string; weight: number; topics: CoverageTopic[]; }
const t = (id: string, title: string, items: number, lessons: string[]): CoverageTopic => ({id,title,items,lessons});
export const officialCoverage: CoverageSubject[] = [
  { track: 'mathematics', name: 'Mathematics', weight: 25, topics: [
    t('m-algebra','Algebra and Complex Numbers',5,['math-2-1','math-2-2','math-5-4']),
    t('m-trig','Trigonometry',5,['math-5-1','math-5-2','math-5-3']),
    t('m-geometry','Analytic Geometry',5,['math-6-1','math-6-2']),
    t('m-stats','Probability and Statistics',5,['math-7-5']),
    t('m-calc1','Calculus 1',15,['math-6-3','math-6-4','math-6-5','math-4-1']),
    t('m-calc2','Calculus 2',15,['math-6-6','math-4-2']),
    t('m-data','Engineering Data Analysis',20,['math-8-1','math-8-2','math-8-3']),
    t('m-de','Differential Equations',15,['math-7-1','math-7-2']),
    t('m-numerical','Numerical Methods and Analysis',15,['math-8-4','math-8-5','math-8-6']),
  ]},
  { track: 'esas', name: 'Engineering Sciences and Allied Subjects', weight: 30, topics: [
    t('s-chem','Chemistry for Engineers',5,['esas-8-1','esas-8-2']),
    t('s-physics','Physics for Engineers',15,['esas-5-1','esas-6-1','esas-6-2']),
    t('s-computing','Computer Programming, Microprocessor Systems, Logic Circuits and Switching Theory',15,['esas-7-3','esas-8-3','esas-8-4']),
    t('s-materials','Materials Science, Environmental Science and Engineering',5,['esas-8-5','esas-8-6']),
    t('s-fluid','Fluid Mechanics',5,['esas-5-5','esas-5-6']),
    t('s-deformable','Fundamentals of Deformable Bodies',5,['esas-5-4','esas-8-7']),
    t('s-thermo','Basic Thermodynamics',5,['esas-3-1','esas-6-4','esas-6-6']),
    t('s-laws','EE Laws, Codes, Professional Ethics, BOSH, Electrical Standards and Practices',20,['esas-7-5','esas-8-8','esas-8-9']),
    t('s-econ','Engineering Economics',15,['esas-7-1','esas-7-2','esas-4-1']),
    t('s-management','Technopreneurship 101 and Management of Engineering Projects',10,['esas-8-10','esas-8-11']),
  ]},
  { track: 'electrical', name: 'Electrical Engineering Professional Subjects', weight: 45, topics: [
    t('e-em','Electromagnetism',10,['ee-5-6','ee-9-1','ee-9-2']),
    t('e-circuits1','Electric Circuits 1',10,['ee-2-1','ee-2-2','ee-5-1','ee-5-2','ee-5-3']),
    t('e-circuits2','Electric Circuits 2',10,['ee-3-1','ee-5-7','ee-6-1','ee-6-2']),
    t('e-comms','Fundamentals of Electronic Communications, Electronics 1 and 2',5,['ee-9-3','ee-9-4']),
    t('e-apparatus','Electrical Apparatus and Devices, Industrial Electronics',5,['ee-9-5','ee-9-6']),
    t('e-machines1','Electrical Machinery 1',5,['ee-7-1','ee-7-2','ee-7-3']),
    t('e-machines2','Electrical Machinery 2',10,['ee-7-4','ee-7-5','ee-7-6']),
    t('e-control','Instrumentation and Control, Feedback Control System, Research Methods',10,['ee-9-7','ee-9-8','ee-9-9']),
    t('e-illumination','Electrical Systems and Illumination Engineering Design',10,['ee-9-10','ee-9-11']),
    t('e-plant','Fundamentals of Power Plant Engineering Design, Distribution Systems and Substation Design',5,['ee-9-12','ee-9-13']),
    t('e-power','Power System Analysis',20,['ee-8-1','ee-8-2','ee-8-3','ee-8-4','ee-8-5','ee-8-6']),
  ]},
];
