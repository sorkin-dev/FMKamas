import { StatLine } from '../models/Stat';
import { StatType } from '../constants/StatWeights';
import { Rune } from '../models/Rune';
import { ProbabilityEngine, ProbabilityContext } from './ProbabilityEngine';
import { SinkEngine } from './SinkEngine';
import { GAME_CONSTANTS } from '../constants/GameConstants';

export interface SimulationConfig {
  iterations: number;
  targetStats: StatLine[];
  initialStats: StatLine[];
  maxStats: Record<StatType, number>;
  runeSequence: Rune[];
  runePrices: Record<number, number>;
}

export interface SimulationResult {
  iterations: number;
  successRate: number;
  averageCost: number;
  averageAttempts: number;
  percentiles: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  costPercentiles: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  attemptsDistribution: number[];
}

export class MonteCarloSimulator {
  private probabilityEngine = new ProbabilityEngine();
  private sinkEngine = new SinkEngine();

  simulate(config: SimulationConfig): SimulationResult {
    const iterations = config.iterations || GAME_CONSTANTS.MONTE_CARLO_DEFAULT_ITERATIONS;
    const costs: number[] = [];
    const attemptsList: number[] = [];
    let successes = 0;

    for (let i = 0; i < iterations; i++) {
      const result = this.simulateSingleRun(config);
      costs.push(result.totalCost);
      attemptsList.push(result.attempts);
      if (result.goalReached) successes++;
    }

    costs.sort((a, b) => a - b);
    attemptsList.sort((a, b) => a - b);

    return {
      iterations,
      successRate: successes / iterations,
      averageCost: costs.reduce((a, b) => a + b, 0) / costs.length,
      averageAttempts: attemptsList.reduce((a, b) => a + b, 0) / attemptsList.length,
      percentiles: {
        p10: this.percentile(attemptsList, 0.10),
        p25: this.percentile(attemptsList, 0.25),
        p50: this.percentile(attemptsList, 0.50),
        p75: this.percentile(attemptsList, 0.75),
        p90: this.percentile(attemptsList, 0.90),
      },
      costPercentiles: {
        p10: this.percentile(costs, 0.10),
        p25: this.percentile(costs, 0.25),
        p50: this.percentile(costs, 0.50),
        p75: this.percentile(costs, 0.75),
        p90: this.percentile(costs, 0.90),
      },
      attemptsDistribution: attemptsList,
    };
  }

  private simulateSingleRun(config: SimulationConfig): { totalCost: number; attempts: number; goalReached: boolean } {
    let currentStats = [...config.initialStats];
    let currentSink = this.sinkEngine.calculateSink(currentStats, config.maxStats);
    let totalCost = 0;
    let attempts = 0;
    const maxAttempts = 500;

    while (attempts < maxAttempts) {
      const nextRune = this.findNextRune(config.runeSequence, currentStats, config.targetStats);
      if (!nextRune) break;

      const context: ProbabilityContext = {
        currentStats,
        maxStats: config.maxStats,
        availableSink: currentSink,
      };

      const successProb = this.probabilityEngine.calculateSuccessProbability(nextRune, context);
      const roll = Math.random();

      if (roll < successProb) {
        currentStats = currentStats.map(s => {
          if (s.type === nextRune.statType) {
            return { ...s, value: s.value + nextRune.statValue };
          }
          return s;
        });
        if (!currentStats.some(s => s.type === nextRune.statType)) {
          currentStats.push({ type: nextRune.statType, value: nextRune.statValue });
        }
        currentSink = this.sinkEngine.estimateSinkAfterSuccess(currentStats, config.maxStats, nextRune);
      } else {
        currentStats = this.applyFailurePenalties(currentStats, config.maxStats, nextRune);
        currentSink = this.sinkEngine.estimateSinkAfterFailure(currentStats, config.maxStats, nextRune);
      }

      const price = config.runePrices[nextRune.id] ?? nextRune.defaultPrice ?? 100;
      totalCost += price;
      attempts++;

      if (this.isGoalReached(currentStats, config.targetStats)) {
        return { totalCost, attempts, goalReached: true };
      }
    }

    return {
      totalCost,
      attempts,
      goalReached: this.isGoalReached(currentStats, config.targetStats),
    };
  }

  private findNextRune(sequence: Rune[], currentStats: StatLine[], targetStats: StatLine[]): Rune | null {
    for (const rune of sequence) {
      const current = currentStats.find(s => s.type === rune.statType)?.value ?? 0;
      const target = targetStats.find(s => s.type === rune.statType)?.value ?? 0;
      if (current < target) return rune;
    }
    return null;
  }

  private applyFailurePenalties(
    currentStats: StatLine[],
    maxStats: Record<StatType, number>,
    _rune: Rune
  ): StatLine[] {
    // On failure, there's a small chance of losing 1 point from a random overmaged stat
    const overmagedStats = currentStats.filter(s => {
      const max = maxStats[s.type] ?? 0;
      return s.value > max;
    });

    if (overmagedStats.length === 0 || Math.random() > 0.3) {
      return currentStats;
    }

    const targetIdx = Math.floor(Math.random() * overmagedStats.length);
    const targetStat = overmagedStats[targetIdx];

    return currentStats.map(s => {
      if (s.type === targetStat.type) {
        return { ...s, value: Math.max(0, s.value - 1) };
      }
      return s;
    });
  }

  private isGoalReached(currentStats: StatLine[], targetStats: StatLine[]): boolean {
    return targetStats.every(target => {
      const current = currentStats.find(s => s.type === target.type)?.value ?? 0;
      return current >= target.value;
    });
  }

  private percentile(sortedArr: number[], p: number): number {
    if (sortedArr.length === 0) return 0;
    const index = Math.floor(sortedArr.length * p);
    return sortedArr[Math.min(index, sortedArr.length - 1)];
  }
}
