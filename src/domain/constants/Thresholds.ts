export const PROBABILITY_THRESHOLDS = {
  SAFE: 0.85,
  MODERATE: 0.60,
  RISKY: 0.40,
  CRITICAL: 0.20,
} as const;

export const SINK_THRESHOLDS = {
  SUFFICIENT: 1.0,   // >= rune weight: full probability
  PARTIAL: 0.5,      // 50% of rune weight: partial bonus
  EMPTY: 0.0,
} as const;

export const RISK_LEVELS = {
  LOW: 'LOW',
  MODERATE: 'MODERATE',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export type RiskLevel = typeof RISK_LEVELS[keyof typeof RISK_LEVELS];

export const EXOTIC_PROBABILITIES = {
  AP: { min: 0.01, max: 0.05, estimate: 0.02 },
  MP: { min: 0.02, max: 0.08, estimate: 0.04 },
  RANGE: { min: 0.05, max: 0.15, estimate: 0.08 },
  SUMMONS: { min: 0.05, max: 0.15, estimate: 0.08 },
} as const;
