import { StatType } from '../constants/StatWeights';
import { StatLine } from '../models/Stat';
import { ItemTemplate } from '../models/Item';

export const EXOTIC_STATS = [StatType.AP, StatType.MP, StatType.RANGE, StatType.SUMMONS] as const;
export type ExoticStatType = typeof EXOTIC_STATS[number];

export interface ExoticAttemptConditions {
  isEligible: boolean;
  reasons: string[];
  warnings: string[];
  recommendedSinkLevel: number;
}

export class ExoticRules {
  /**
   * Check if conditions are met for an exotic attempt.
   */
  evaluateExoticConditions(
    statType: StatType,
    item: ItemTemplate,
    currentStats: StatLine[],
    availableSink: number
  ): ExoticAttemptConditions {
    const reasons: string[] = [];
    const warnings: string[] = [];

    if (!EXOTIC_STATS.includes(statType as ExoticStatType)) {
      return {
        isEligible: false,
        reasons: [`${statType} n'est pas une statistique exotique`],
        warnings: [],
        recommendedSinkLevel: 0,
      };
    }

    // Item shouldn't already have this exotic stat naturally
    const existingStatRange = item.stats.find(s => s.type === statType);
    if (existingStatRange && existingStatRange.max > 0) {
      warnings.push(`L'objet possède déjà ${statType} en statistique naturelle`);
    }

    const recommendedSinks: Record<string, number> = {
      [StatType.AP]: 100,
      [StatType.MP]: 90,
      [StatType.RANGE]: 51,
      [StatType.SUMMONS]: 30,
    };

    const recommendedSink = recommendedSinks[statType] ?? 50;

    if (availableSink < recommendedSink * 0.5) {
      warnings.push(`Sink disponible (${availableSink.toFixed(1)}) insuffisant. Recommandé: ${recommendedSink}`);
    }

    const criticalStatsOk = currentStats.every(s => s.value >= 0);
    if (!criticalStatsOk) {
      reasons.push('Des statistiques sont négatives. Remontez-les avant d\'essayer l\'exotisme.');
    }

    const isEligible = reasons.length === 0;

    return {
      isEligible,
      reasons,
      warnings,
      recommendedSinkLevel: recommendedSink,
    };
  }

  /**
   * Check if an item can receive a specific exotic stat.
   */
  canReceiveExotic(statType: StatType, item: ItemTemplate): boolean {
    if (!EXOTIC_STATS.includes(statType as ExoticStatType)) return false;
    // Items below level 30 can't receive exotic stats
    if (item.level < 30) return false;
    return true;
  }
}
