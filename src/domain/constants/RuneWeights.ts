import { StatType } from './StatWeights';

export enum RuneTier {
  PA = 'PA',           // Petite (1 pt)
  STANDARD = 'STANDARD', // Standard (3 pts)
  RA = 'RA',           // Grande (10 pts)
  EXOTIC = 'EXOTIC',   // Exotique (1 pt, special)
}

export interface RuneDefinition {
  statType: StatType;
  tier: RuneTier;
  statValue: number;
  weight: number;
  name: string;
}

// Weight per point = STAT_WEIGHTS[stat]
// Rune weight = statValue * STAT_WEIGHTS[stat]
export const RUNE_STAT_VALUES: Record<RuneTier, number> = {
  [RuneTier.PA]: 1,
  [RuneTier.STANDARD]: 3,
  [RuneTier.RA]: 10,
  [RuneTier.EXOTIC]: 1,
};
