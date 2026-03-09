import { Rune } from '../models/Rune';
import { Strategy } from '../models/Strategy';
import { MonteCarloSimulator, SimulationConfig } from './MonteCarloSimulator';
import { StatLine } from '../models/Stat';
import { StatType } from '../constants/StatWeights';
import { GAME_CONSTANTS } from '../constants/GameConstants';

export interface CostEstimate {
  optimistic: number;   // P25
  median: number;       // P50
  pessimistic: number;  // P75
  averageAttempts: number;
  runeBreakdown: Array<{ rune: Rune; estimatedUses: number; cost: number }>;
}

export interface ProfitabilityAnalysis {
  targetItemPrice: number;
  baseCraftCost: number;
  fmCostMedian: number;
  breakEvenFMCost: number;
  isProfitable: boolean;
  roi: number;
}

export class CostEstimator {
  private simulator = new MonteCarloSimulator();

  /**
   * Estimate cost of applying a single rune.
   */
  estimateSingleRuneCost(rune: Rune, successProbability: number, price?: number): CostEstimate {
    const runePrice = price ?? rune.defaultPrice ?? 100;
    const avgAttempts = successProbability > 0 ? 1 / successProbability : 20;
    const medianCost = avgAttempts * runePrice;

    return {
      optimistic: medianCost * 0.4,
      median: medianCost,
      pessimistic: medianCost * 2.5,
      averageAttempts: avgAttempts,
      runeBreakdown: [{ rune, estimatedUses: avgAttempts, cost: medianCost }],
    };
  }

  /**
   * Estimate total cost of a strategy using Monte Carlo simulation.
   */
  estimateStrategyCost(
    strategy: Strategy,
    currentStats: StatLine[],
    maxStats: Record<StatType, number>,
    runePrices: Record<number, number>,
    iterations: number = GAME_CONSTANTS.MONTE_CARLO_DEFAULT_ITERATIONS / 10
  ): CostEstimate {
    if (strategy.steps.length === 0) {
      return { optimistic: 0, median: 0, pessimistic: 0, averageAttempts: 0, runeBreakdown: [] };
    }

    const targetStats: StatLine[] = strategy.steps.map(s => ({
      type: s.rune.statType,
      value: (currentStats.find(c => c.type === s.rune.statType)?.value ?? 0) + s.rune.statValue * 3,
    }));

    const config: SimulationConfig = {
      iterations,
      targetStats,
      initialStats: currentStats,
      maxStats,
      runeSequence: strategy.steps.map(s => s.rune),
      runePrices,
    };

    const result = this.simulator.simulate(config);

    return {
      optimistic: result.costPercentiles.p25,
      median: result.costPercentiles.p50,
      pessimistic: result.costPercentiles.p75,
      averageAttempts: result.averageAttempts,
      runeBreakdown: strategy.steps.map(step => ({
        rune: step.rune,
        estimatedUses: step.expectedSuccessRate > 0 ? 1 / step.expectedSuccessRate : 10,
        cost: step.expectedCost,
      })),
    };
  }

  /**
   * Analyze profitability: is it worth FM-ing vs. buying the item?
   */
  analyzeProfitability(
    targetItemPrice: number,
    baseCraftCost: number,
    fmCostMedian: number
  ): ProfitabilityAnalysis {
    const totalFMCost = baseCraftCost + fmCostMedian;
    const isProfitable = totalFMCost < targetItemPrice;
    const roi = targetItemPrice > 0 ? (targetItemPrice - totalFMCost) / targetItemPrice : 0;
    const breakEvenFMCost = targetItemPrice - baseCraftCost;

    return {
      targetItemPrice,
      baseCraftCost,
      fmCostMedian,
      breakEvenFMCost,
      isProfitable,
      roi,
    };
  }
}
