import { Rune } from '../models/Rune';
import { ItemTemplate } from '../models/Item';
import { StatLine } from '../models/Stat';
import { StatType, STAT_WEIGHTS } from '../constants/StatWeights';
import { RuneTier } from '../constants/RuneWeights';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class ForgeRules {
  /**
   * Validate if a rune can be applied to an item with current stats.
   */
  validateRuneApplication(rune: Rune, item: ItemTemplate, currentStats: StatLine[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const itemStat = item.stats.find(s => s.type === rune.statType);
    if (!itemStat) {
      errors.push(`L'objet n'a pas la statistique ${rune.statType}`);
    }

    if (itemStat) {
      const current = currentStats.find(s => s.type === rune.statType)?.value ?? 0;
      const maxNatural = itemStat.max;
      const overmageLimit = Math.floor(maxNatural * 1.01 + 1);

      if (current > overmageLimit + rune.statValue * 5) {
        warnings.push(`La statistique ${rune.statType} est très au-dessus du maximum (overmage excessif)`);
      }

      if (current > maxNatural) {
        warnings.push(`La statistique ${rune.statType} est déjà en overmage (${current} > ${maxNatural})`);
      }
    }

    if (!Object.values(RuneTier).includes(rune.tier)) {
      errors.push(`Tier de rune invalide: ${rune.tier}`);
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Get list of applicable runes for a stat.
   */
  getApplicableRunes(statType: StatType, allRunes: Rune[]): Rune[] {
    return allRunes.filter(r => r.statType === statType);
  }

  /**
   * Check if a stat is in overmage territory.
   */
  isOvermaged(statType: StatType, currentValue: number, maxNatural: number): boolean {
    return currentValue > maxNatural;
  }

  /**
   * Calculate the overmage degree (how much above max).
   */
  getOvermageDegree(statType: StatType, currentValue: number, maxNatural: number): number {
    return Math.max(0, currentValue - maxNatural);
  }

  /**
   * Determine if a stat can receive more overmage safely.
   */
  canAddOvermage(statType: StatType, currentValue: number, maxNatural: number): boolean {
    const weight = STAT_WEIGHTS[statType] ?? 1;
    const overmageDegree = this.getOvermageDegree(statType, currentValue, maxNatural);
    // More conservative for heavy stats
    const maxOvermage = weight > 10 ? 1 : weight > 1 ? 3 : 10;
    return overmageDegree < maxOvermage;
  }
}
