import { Rune } from './Rune';
import { RiskLevel } from '../constants/Thresholds';

export interface StrategyStep {
  order: number;
  rune: Rune;
  rationale: string;
  expectedSuccessRate: number;
  expectedCost: number;
}

export interface StrategyScore {
  successProbability: number;
  expectedCost: number;
  riskLevel: RiskLevel;
  ev: number;
  robustness: number;
  composite: number;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  steps: StrategyStep[];
  score: StrategyScore;
  rank: number;
}

export interface AlternativeAction {
  action: string;
  description: string;
  rune?: Rune;
  probability: number;
  cost: number;
  riskLevel: RiskLevel;
}

export interface SinkAnalysis {
  currentSink: number;
  requiredSink: number;
  sinkFactor: number;
  isAdequate: boolean;
}

export interface EVAnalysis {
  expectedValue: number;
  optimisticCost: number;
  medianCost: number;
  pessimisticCost: number;
  breakEvenPrice: number;
}

export interface Recommendation {
  action: 'APPLY_RUNE' | 'STOP' | 'SECURE_FIRST' | 'REBUILD_STATS' | 'ATTEMPT_EXOTIC';
  rune?: Rune;
  reasoning: string;
  confidence: number;
  expectedCost: number;
  successProbability: number;
  riskLevel: RiskLevel;
  alternativeActions: AlternativeAction[];
  sinkAnalysis: SinkAnalysis;
  evAnalysis: EVAnalysis;
}
