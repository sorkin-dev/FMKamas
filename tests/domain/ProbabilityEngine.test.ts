import { describe, it, expect } from 'vitest';
import { ProbabilityEngine, ProbabilityContext } from '../../src/domain/engine/ProbabilityEngine';
import { StatType } from '../../src/domain/constants/StatWeights';

const engine = new ProbabilityEngine();

function makeContext(overrides: Partial<ProbabilityContext> = {}): ProbabilityContext {
  return {
    currentStats: [{ type: StatType.STRENGTH, value: 40 }],
    maxStats: { [StatType.STRENGTH]: 50 } as Record<StatType, number>,
    availableSink: 10,
    ...overrides,
  };
}

describe('ProbabilityEngine', () => {
  describe('calculateSuccessProbability', () => {
    it('returns high probability when stat is below max', () => {
      const rune = { id: 1, name: 'Fo', statType: StatType.STRENGTH, tier: 'STANDARD' as const, statValue: 3, weight: 3, defaultPrice: 200 };
      const ctx = makeContext({
        currentStats: [{ type: StatType.STRENGTH, value: 30 }],
        maxStats: { [StatType.STRENGTH]: 50 } as Record<StatType, number>,
        availableSink: 20,
      });
      const prob = engine.calculateSuccessProbability(rune, ctx);
      expect(prob).toBeGreaterThan(0.9);
    });

    it('returns medium probability when stat is at natural max', () => {
      const rune = { id: 1, name: 'Fo', statType: StatType.STRENGTH, tier: 'STANDARD' as const, statValue: 3, weight: 3, defaultPrice: 200 };
      const ctx = makeContext({
        currentStats: [{ type: StatType.STRENGTH, value: 50 }],
        maxStats: { [StatType.STRENGTH]: 50 } as Record<StatType, number>,
        availableSink: 10,
      });
      const prob = engine.calculateSuccessProbability(rune, ctx);
      expect(prob).toBeGreaterThanOrEqual(0.5);
      expect(prob).toBeLessThanOrEqual(0.85);
    });

    it('returns decreasing probability when stat is in overmage', () => {
      const rune = { id: 1, name: 'Fo', statType: StatType.STRENGTH, tier: 'STANDARD' as const, statValue: 3, weight: 3, defaultPrice: 200 };
      const ctx = makeContext({
        currentStats: [{ type: StatType.STRENGTH, value: 60 }],
        maxStats: { [StatType.STRENGTH]: 50 } as Record<StatType, number>,
        availableSink: 5,
      });
      const prob = engine.calculateSuccessProbability(rune, ctx);
      expect(prob).toBeLessThan(0.65);
    });

    it('returns probability between 0 and 1', () => {
      const rune = { id: 1, name: 'PA', statType: StatType.AP, tier: 'STANDARD' as const, statValue: 1, weight: 100, defaultPrice: 150000 };
      const ctx = makeContext({ availableSink: 0 });
      const prob = engine.calculateSuccessProbability(rune, ctx);
      expect(prob).toBeGreaterThanOrEqual(0);
      expect(prob).toBeLessThanOrEqual(1);
    });

    it('returns very low exotic probability for AP', () => {
      const prob = engine.calculateExoticProbability(StatType.AP, 50);
      expect(prob).toBeLessThan(0.1);
      expect(prob).toBeGreaterThan(0);
    });

    it('returns low exotic probability for MP', () => {
      const prob = engine.calculateExoticProbability(StatType.MP, 50);
      expect(prob).toBeLessThan(0.12);
      expect(prob).toBeGreaterThan(0);
    });
  });

  describe('calculateSinkFactor', () => {
    it('returns full factor when sink exceeds rune weight', () => {
      const factor = engine.calculateSinkFactor(100, 3);
      expect(factor).toBeCloseTo(1, 1);
    });

    it('returns reduced factor when sink is insufficient', () => {
      const factor = engine.calculateSinkFactor(1, 100);
      expect(factor).toBeLessThan(1);
      expect(factor).toBeGreaterThan(0.6);
    });

    it('returns base factor when no sink available', () => {
      const factor = engine.calculateSinkFactor(0, 10);
      expect(factor).toBeCloseTo(0.6, 1);
    });
  });
});
