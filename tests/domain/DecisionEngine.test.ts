import { describe, it, expect } from 'vitest';
import { DecisionEngine, DecisionContext } from '../../src/domain/engine/DecisionEngine';
import { StatType } from '../../src/domain/constants/StatWeights';
import { RuneTier } from '../../src/domain/constants/RuneWeights';
import { StatLine } from '../../src/domain/models/Stat';
import { Rune } from '../../src/domain/models/Rune';

const engine = new DecisionEngine();

function makeRune(id: number, statType: StatType, tier: RuneTier, statValue: number, weight: number): Rune {
  return { id, name: `${statType}-${tier}`, statType, tier, statValue, weight, defaultPrice: 100 };
}

function makeContext(overrides: Partial<DecisionContext> = {}): DecisionContext {
  return {
    currentStats: [{ type: StatType.STRENGTH, value: 30 }],
    targetStats: [{ type: StatType.STRENGTH, value: 50 }],
    maxStats: { [StatType.STRENGTH]: 50 } as Record<StatType, number>,
    availableRunes: [
      makeRune(1, StatType.STRENGTH, RuneTier.PA, 1, 1),
      makeRune(2, StatType.STRENGTH, RuneTier.STANDARD, 3, 3),
      makeRune(3, StatType.STRENGTH, RuneTier.RA, 10, 10),
    ],
    availableSink: 20,
    sessionAttempts: 0,
    runePrices: {},
    ...overrides,
  };
}

describe('DecisionEngine', () => {
  describe('getRecommendation', () => {
    it('recommends APPLY_RUNE when stat is below target', () => {
      const rec = engine.getRecommendation(makeContext());
      expect(rec.action).toBe('APPLY_RUNE');
      expect(rec.rune).toBeDefined();
    });

    it('recommends STOP when goal is reached', () => {
      const ctx = makeContext({
        currentStats: [{ type: StatType.STRENGTH, value: 50 }],
        targetStats: [{ type: StatType.STRENGTH, value: 50 }],
      });
      const rec = engine.getRecommendation(ctx);
      expect(rec.action).toBe('STOP');
    });

    it('recommends lighter rune first when multiple stats needed', () => {
      const ctx = makeContext({
        currentStats: [
          { type: StatType.VITALITY, value: 100 },
          { type: StatType.WISDOM, value: 5 },
        ],
        targetStats: [
          { type: StatType.VITALITY, value: 200 },
          { type: StatType.WISDOM, value: 10 },
        ],
        maxStats: {
          [StatType.VITALITY]: 200,
          [StatType.WISDOM]: 10,
        } as Record<StatType, number>,
        availableRunes: [
          makeRune(1, StatType.VITALITY, RuneTier.STANDARD, 3, 0.75),
          makeRune(2, StatType.WISDOM, RuneTier.STANDARD, 3, 9),
        ],
      });
      const rec = engine.getRecommendation(ctx);
      expect(rec.action).toBe('APPLY_RUNE');
      expect(rec.rune?.statType).toBe(StatType.VITALITY);
    });

    it('includes probability between 0 and 1', () => {
      const rec = engine.getRecommendation(makeContext());
      expect(rec.successProbability).toBeGreaterThanOrEqual(0);
      expect(rec.successProbability).toBeLessThanOrEqual(1);
    });

    it('includes reasoning as non-empty string', () => {
      const rec = engine.getRecommendation(makeContext());
      expect(typeof rec.reasoning).toBe('string');
      expect(rec.reasoning.length).toBeGreaterThan(10);
    });

    it('includes risk level', () => {
      const rec = engine.getRecommendation(makeContext());
      expect(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']).toContain(rec.riskLevel);
    });

    it('includes EV analysis', () => {
      const rec = engine.getRecommendation(makeContext());
      expect(rec.evAnalysis).toBeDefined();
      expect(typeof rec.evAnalysis.medianCost).toBe('number');
    });

    it('includes sink analysis', () => {
      const rec = engine.getRecommendation(makeContext());
      expect(rec.sinkAnalysis).toBeDefined();
      expect(typeof rec.sinkAnalysis.currentSink).toBe('number');
    });

    it('recommends ATTEMPT_EXOTIC when conditions are met', () => {
      const ctx: DecisionContext = {
        currentStats: [],
        targetStats: [{ type: StatType.AP, value: 1 }],
        maxStats: {} as Record<StatType, number>,
        availableRunes: [makeRune(1, StatType.AP, RuneTier.STANDARD, 1, 100)],
        availableSink: 500,
        sessionAttempts: 0,
        runePrices: {},
      };
      const rec = engine.getRecommendation(ctx);
      expect(rec.action).toBe('ATTEMPT_EXOTIC');
    });
  });
});
