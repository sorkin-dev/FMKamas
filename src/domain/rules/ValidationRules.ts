import { ItemTemplate } from '../models/Item';
import { StatLine } from '../models/Stat';
import { StatType } from '../constants/StatWeights';

export interface ItemValidationResult {
  valid: boolean;
  errors: string[];
}

export class ValidationRules {
  validateItemInstance(item: ItemTemplate, currentStats: StatLine[]): ItemValidationResult {
    const errors: string[] = [];

    if (!item.name || item.name.trim() === '') {
      errors.push('Le nom de l\'objet est requis');
    }

    if (item.level < 1 || item.level > 200) {
      errors.push('Le niveau doit être entre 1 et 200');
    }

    for (const stat of currentStats) {
      if (stat.value < 0) {
        errors.push(`La valeur de ${stat.type} ne peut pas être négative`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  validateStatValue(statType: StatType, value: number, min: number, max: number): boolean {
    return value >= min && value <= max * 1.5; // Allow up to 50% overmage
  }

  validateTargetStats(targetStats: StatLine[], itemStats: Array<{ type: StatType; min: number; max: number }>): ItemValidationResult {
    const errors: string[] = [];

    for (const target of targetStats) {
      const range = itemStats.find(s => s.type === target.type);
      if (!range) {
        errors.push(`L'objet n'a pas la statistique ${target.type}`);
        continue;
      }
      if (target.value < range.min) {
        errors.push(`L'objectif pour ${target.type} (${target.value}) est inférieur au minimum (${range.min})`);
      }
      if (target.value > range.max * 1.5) {
        errors.push(`L'objectif pour ${target.type} (${target.value}) dépasse le maximum autorisé`);
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
