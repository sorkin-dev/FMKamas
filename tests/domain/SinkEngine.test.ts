import { describe, it, expect } from 'vitest';
import { SinkEngine } from '../../src/domain/engine/SinkEngine';
import { StatType } from '../../src/domain/constants/StatWeights';
import { StatLine } from '../../src/domain/models/Stat';

const engine = new SinkEngine();

describe('SinkEngine', () => {
  describe('calculateSink', () => {
    it('returns positive sink when stats are below max', () => {
      const currentStats: StatLine[] = [
        { type: StatType.STRENGTH, value: 30 },
        { type: StatType.VITALITY, value: 100 },
      ];
      const maxStats = {
        [StatType.STRENGTH]: 50,
        [StatType.VITALITY]: 200,
      } as Record<StatType, number>;

      const sink = engine.calculateSink(currentStats, maxStats);
      expect(sink).toBeGreaterThan(0);
      expect(sink).toBeCloseTo(45, 0);
    });

    it('returns 0 when all stats are at max', () => {
      const currentStats: StatLine[] = [
        { type: StatType.STRENGTH, value: 50 },
        { type: StatType.VITALITY, value: 200 },
      ];
      const maxStats = {
        [StatType.STRENGTH]: 50,
        [StatType.VITALITY]: 200,
      } as Record<StatType, number>;

      const sink = engine.calculateSink(currentStats, maxStats);
      expect(sink).toBe(0);
    });

    it('does not add sink for stats above max (overmage)', () => {
      const currentStats: StatLine[] = [
        { type: StatType.STRENGTH, value: 60 },
      ];
      const maxStats = {
        [StatType.STRENGTH]: 50,
      } as Record<StatType, number>;

      const sink = engine.calculateSink(currentStats, maxStats);
      expect(sink).toBe(0);
    });

    it('calculates sink for missing stats', () => {
      const currentStats: StatLine[] = [];
      const maxStats = {
        [StatType.STRENGTH]: 50,
      } as Record<StatType, number>;

      const sink = engine.calculateSink(currentStats, maxStats);
      expect(sink).toBeCloseTo(50, 0);
    });
  });

  describe('calculateSinkNeeded', () => {
    it('returns rune weight as sink needed', () => {
      const rune = { id: 1, name: 'Fo', statType: StatType.STRENGTH, tier: 'STANDARD' as const, statValue: 3, weight: 3, defaultPrice: 200 };
      const needed = engine.calculateSinkNeeded(rune);
      expect(needed).toBe(3);
    });
  });

  describe('isSinkSufficient', () => {
    it('returns true when sink >= rune weight', () => {
      const rune = { id: 1, name: 'Fo', statType: StatType.STRENGTH, tier: 'STANDARD' as const, statValue: 3, weight: 3, defaultPrice: 200 };
      expect(engine.isSinkSufficient(5, rune)).toBe(true);
    });

    it('returns false when sink < rune weight', () => {
      const rune = { id: 1, name: 'Ra Fo', statType: StatType.STRENGTH, tier: 'RA' as const, statValue: 10, weight: 10, defaultPrice: 600 };
      expect(engine.isSinkSufficient(5, rune)).toBe(false);
    });
  });

  describe('estimateSinkAfterSuccess', () => {
    it('returns lower sink after successful rune application', () => {
      const currentStats: StatLine[] = [{ type: StatType.STRENGTH, value: 40 }];
      const maxStats = { [StatType.STRENGTH]: 50 } as Record<StatType, number>;
      const rune = { id: 1, name: 'Fo', statType: StatType.STRENGTH, tier: 'STANDARD' as const, statValue: 3, weight: 3, defaultPrice: 200 };

      const before = engine.calculateSink(currentStats, maxStats);
      const after = engine.estimateSinkAfterSuccess(currentStats, maxStats, rune);

      expect(after).toBeLessThan(before);
    });
  });
});
