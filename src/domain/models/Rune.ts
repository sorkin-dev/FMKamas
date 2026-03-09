import { StatType } from '../constants/StatWeights';
import { RuneTier } from '../constants/RuneWeights';

export interface Rune {
  id: number;
  name: string;
  statType: StatType;
  tier: RuneTier;
  statValue: number;
  weight: number;
  defaultPrice: number;
}

export interface RuneApplication {
  rune: Rune;
  timestamp: Date;
  itemStatBefore: number;
  itemStatAfter: number;
  success: boolean;
}
