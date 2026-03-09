import { StatType, STAT_WEIGHTS } from '../constants/StatWeights';
import { StatLine } from '../models/Stat';

export interface OvermageAnalysis {
  overmageStats: Array<{ type: StatType; current: number; max: number; degree: number; weight: number }>;
  totalOvermageWeight: number;
  isStable: boolean;
}

export class OvermageRules {
  /**
   * Analyze which stats are in overmage.
   */
  analyzeOvermage(currentStats: StatLine[], maxStats: Record<StatType, number>): OvermageAnalysis {
    const overmageStats = currentStats
      .filter(s => {
        const max = maxStats[s.type] ?? 0;
        return s.value > max;
      })
      .map(s => {
        const max = maxStats[s.type] ?? 0;
        const weight = STAT_WEIGHTS[s.type] ?? 0;
        return {
          type: s.type,
          current: s.value,
          max,
          degree: s.value - max,
          weight,
        };
      });

    const totalOvermageWeight = overmageStats.reduce((acc, s) => acc + s.degree * s.weight, 0);
    const isStable = overmageStats.every(s => s.degree <= 1 || s.weight < 5);

    return { overmageStats, totalOvermageWeight, isStable };
  }

  /**
   * Calculate the total overmage weight (how much the current state exceeds maximums).
   */
  calculateOvermageWeight(currentStats: StatLine[], maxStats: Record<StatType, number>): number {
    return currentStats.reduce((total, s) => {
      const max = maxStats[s.type] ?? 0;
      if (s.value > max) {
        const weight = STAT_WEIGHTS[s.type] ?? 0;
        return total + (s.value - max) * weight;
      }
      return total;
    }, 0);
  }
}
