import { StatType } from '../constants/StatWeights';

export interface StatRange {
  type: StatType;
  min: number;
  max: number;
  perfect?: number;
}

export interface StatLine {
  type: StatType;
  value: number;
}

export interface StatSnapshot {
  stats: StatLine[];
  timestamp: Date;
}
