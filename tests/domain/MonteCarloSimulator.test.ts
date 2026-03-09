import { describe, it, expect } from 'vitest';
import { MonteCarloSimulator, SimulationConfig } from '../../src/domain/engine/MonteCarloSimulator';
import { StatType } from '../../src/domain/constants/StatWeights';
import { RuneTier } from '../../src/domain/constants/RuneWeights';

const simulator = new MonteCarloSimulator();

function makeRune(statType: StatType, tier: RuneTier, statValue: number, weight: number) {
  return { id: 1, name: `${statType}-${tier}`, statType, tier, statValue, weight, defaultPrice: 100 };
}

function makeConfig(overrides: Partial<SimulationConfig> = {}): SimulationConfig {
  return {
    iterations: 500,
    targetStats: [{ type: StatType.STRENGTH, value: 50 }],
    initialStats: [{ type: StatType.STRENGTH, value: 40 }],
    maxStats: { [StatType.STRENGTH]: 50 } as Record<StatType, number>,
    runeSequence: [makeRune(StatType.STRENGTH, RuneTier.STANDARD, 3, 3)],
    runePrices: {},
    ...overrides,
  };
}

describe('MonteCarloSimulator', () => {
  it('returns valid result structure', () => {
    const result = simulator.simulate(makeConfig());
    expect(result.iterations).toBe(500);
    expect(result.successRate).toBeGreaterThanOrEqual(0);
    expect(result.successRate).toBeLessThanOrEqual(1);
    expect(result.averageCost).toBeGreaterThanOrEqual(0);
    expect(result.averageAttempts).toBeGreaterThan(0);
  });

  it('has valid percentiles', () => {
    const result = simulator.simulate(makeConfig());
    expect(result.percentiles.p10).toBeLessThanOrEqual(result.percentiles.p50);
    expect(result.percentiles.p50).toBeLessThanOrEqual(result.percentiles.p90);
    expect(result.costPercentiles.p25).toBeLessThanOrEqual(result.costPercentiles.p75);
  });

  it('converges with more iterations', () => {
    const result1 = simulator.simulate(makeConfig({ iterations: 200 }));
    const result2 = simulator.simulate(makeConfig({ iterations: 1000 }));
    expect(result1.successRate).toBeGreaterThan(0.3);
    expect(result2.successRate).toBeGreaterThan(0.3);
  });

  it('returns 0 success rate when no runes match target', () => {
    const result = simulator.simulate(makeConfig({ runeSequence: [], iterations: 100 }));
    expect(result.successRate).toBe(0);
  });

  it('achieves goal quickly when starting at target', () => {
    const result = simulator.simulate(makeConfig({
      initialStats: [{ type: StatType.STRENGTH, value: 50 }],
      iterations: 100,
    }));
    expect(result.successRate).toBe(1);
    expect(result.averageAttempts).toBe(0);
  });
});
