import { describe, it, expect } from 'vitest';
import { ForgeRules } from '../../src/domain/rules/ForgeRules';
import { StatType } from '../../src/domain/constants/StatWeights';
import { RuneTier } from '../../src/domain/constants/RuneWeights';
import { ItemTemplate } from '../../src/domain/models/Item';
import { StatLine } from '../../src/domain/models/Stat';
import { Rune } from '../../src/domain/models/Rune';

const rules = new ForgeRules();

function makeItem(): ItemTemplate {
  return {
    id: 1,
    name: 'Test Item',
    level: 60,
    type: 'Anneau',
    stats: [
      { type: StatType.STRENGTH, min: 10, max: 50 },
      { type: StatType.VITALITY, min: 30, max: 100 },
    ],
    source: 'static',
  };
}

function makeRune(statType: StatType, tier: RuneTier, statValue: number): Rune {
  return { id: 1, name: `${statType}`, statType, tier, statValue, weight: statValue, defaultPrice: 100 };
}

describe('ForgeRules', () => {
  describe('validateRuneApplication', () => {
    it('validates successfully when item has the stat', () => {
      const item = makeItem();
      const rune = makeRune(StatType.STRENGTH, RuneTier.STANDARD, 3);
      const currentStats: StatLine[] = [{ type: StatType.STRENGTH, value: 30 }];

      const result = rules.validateRuneApplication(rune, item, currentStats);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails validation when item does not have the stat', () => {
      const item = makeItem();
      const rune = makeRune(StatType.AP, RuneTier.STANDARD, 1);
      const currentStats: StatLine[] = [];

      const result = rules.validateRuneApplication(rune, item, currentStats);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('warns when stat is already in overmage', () => {
      const item = makeItem();
      const rune = makeRune(StatType.STRENGTH, RuneTier.STANDARD, 3);
      const currentStats: StatLine[] = [{ type: StatType.STRENGTH, value: 55 }];

      const result = rules.validateRuneApplication(rune, item, currentStats);
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('isOvermaged', () => {
    it('returns false when stat is at or below max', () => {
      expect(rules.isOvermaged(StatType.STRENGTH, 50, 50)).toBe(false);
      expect(rules.isOvermaged(StatType.STRENGTH, 40, 50)).toBe(false);
    });

    it('returns true when stat is above max', () => {
      expect(rules.isOvermaged(StatType.STRENGTH, 51, 50)).toBe(true);
    });
  });

  describe('getApplicableRunes', () => {
    it('returns only runes matching the stat type', () => {
      const allRunes: Rune[] = [
        makeRune(StatType.STRENGTH, RuneTier.PA, 1),
        makeRune(StatType.STRENGTH, RuneTier.STANDARD, 3),
        makeRune(StatType.VITALITY, RuneTier.STANDARD, 3),
      ];
      const applicable = rules.getApplicableRunes(StatType.STRENGTH, allRunes);
      expect(applicable).toHaveLength(2);
      expect(applicable.every(r => r.statType === StatType.STRENGTH)).toBe(true);
    });
  });

  describe('canAddOvermage', () => {
    it('allows overmage for light stats within limits', () => {
      expect(rules.canAddOvermage(StatType.VITALITY, 201, 200)).toBe(true);
    });

    it('restricts overmage for heavy stats', () => {
      expect(rules.canAddOvermage(StatType.AP, 2, 1)).toBe(false);
    });
  });
});
