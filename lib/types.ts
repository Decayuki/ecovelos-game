export interface GameState {
  themeId: string;
  budget: number;
  fleet?: number;
  employees: number;
  monthlyRevenue: number;
  monthlyCosts: MonthlyCosts;
  monthlyVA?: number;
  currentPhase: number;
  decisions: Record<string, string>;
  scores: Scores;
  utilizationRate?: number;
  customerSatisfaction?: number;
  employeeSatisfaction?: number;
  reputation?: number;
  scandals?: number;
  gameOver?: boolean;
  badEnding?: boolean;
  // Risques accumulés
  turnoverRisk?: number;
  strikeRisk?: number;
  badBuzzRisk?: number;
  // Modificateurs de scores cumulés
  socialScoreModifier?: number;
  environmentalScoreModifier?: number;
  imageModifier?: number;
}

export interface MonthlyCosts {
  salaries: number;
  materials?: number;
  maintenance?: number;
  rent?: number;
  insurance?: number;
  marketing?: number;
  vandalism?: number;
  // Champs spécifiques par thème
  certificationFees?: number;
  logistics?: number;
  packaging?: number;
  ingredients?: number;
  utilities?: number;
  licenses?: number;
  equipment?: number;
  [key: string]: number | undefined;
}

export interface Scores {
  economic: number;
  social: number;
  environmental: number;
  global: number;
}

export interface Decision {
  id: string;
  title: string;
  question: string;
  options: Option[];
}

export interface Option {
  id: string;
  label: string;
  cost?: number;
  monthlyIncrease?: number;
  newHires?: number;
  effects?: Record<string, any>;
  revenue?: number;
  productionCost?: number;
  maintenanceCost?: number;
  successRate?: number;
  ifSuccess?: any;
  ifFailure?: any;
  hidden?: string;
  consequence?: string;
  delay?: number;
}

export interface Phase {
  id: number;
  title: string;
  context: string;
  decisions: Decision[];
  currentSituation?: Record<string, any>;
  story?: {
    intro: string;
    context: string;
  };
  storyEnd?: {
    success: string;
    failure: string;
  };
}

export interface BadEnding {
  title: string;
  description: string;
  consequences: string[];
  roast?: string;
}

export interface Theme {
  id: string;
  name: string;
  icon: string;
  subtitle: string;
  description: string;
  difficulty: 1 | 2 | 3;
  badEnding: BadEnding;
}
