import { StatLine } from '../models/Stat';
import { Rune } from '../models/Rune';
import { STAT_WEIGHTS, StatType } from '../constants/StatWeights';
import { GAME_CONSTANTS } from '../constants/GameConstants';
import { EXOTIC_PROBABILITIES } from '../constants/Thresholds';

export interface ProbabilityContext {
  currentStats: StatLine[];
  maxStats: Record<StatType, number>;
  availableSink: number;
}

export class ProbabilityEngine {
  /**
   * Calculate success probability for applying a rune.
   * P(success) = baseProbability * sinkFactor * runeWeightFactor
   */
  calculateSuccessProbability(rune: Rune, context: ProbabilityContext): number {
    const currentStat = context.currentStats.find(s => s.type === rune.statType);
    const currentValue = currentStat?.value ?? 0;
    const maxNatural = context.maxStats[rune.statType] ?? 0;

    let baseProbability: number;

    if (currentValue < maxNatural) {
      // Below max: high probability
      const deficit = maxNatural - currentValue;
      const totalRange = maxNatural;
      const ratio = totalRange > 0 ? deficit / totalRange : 0;
      baseProbability = GAME_CONSTANTS.BASE_SUCCESS_RATE_BELOW_MAX - (0.05 * (1 - ratio));
      baseProbability = Math.max(baseProbability, GAME_CONSTANTS.BASE_SUCCESS_RATE_BELOW_MAX - 0.05);
    } else if (currentValue === maxNatural) {
      // At max: medium probability
      baseProbability = GAME_CONSTANTS.BASE_SUCCESS_RATE_AT_MAX;
    } else {
      // Overmage: decreasing probability
      const overmageAmount = currentValue - maxNatural;
      const runeWeight = rune.weight;
      const overmageFactor = Math.exp(-overmageAmount * runeWeight * 0.01);
      baseProbability = GAME_CONSTANTS.BASE_SUCCESS_RATE_OVERMAGE * overmageFactor;
    }

    // Sink factor
    const sinkFactor = this.calculateSinkFactor(context.availableSink, rune.weight);

    const probability = baseProbability * sinkFactor;
    return Math.min(1, Math.max(0, probability));
  }

  /**
   * Calculate sink factor based on available sink vs rune weight.
   * sinkFactor = clamp(availableSink / runeWeight, 0, 1) when sink >= weight => ~1
   */
  calculateSinkFactor(availableSink: number, runeWeight: number): number {
    if (runeWeight <= 0) return 1;
    if (availableSink <= 0) return 0.6; // Base factor without sink
    const ratio = availableSink / runeWeight;
    // sigmoid-like: approaches 1 as sink >= runeWeight, minimum 0.6
    return 0.6 + 0.4 * Math.min(1, ratio);
  }

  /**
   * Probability that a specific stat will decrease on failure.
   */
  calculateLossProbability(statType: StatType, currentStats: StatLine[], maxStats: Record<StatType, number>): number {
    const current = currentStats.find(s => s.type === statType)?.value ?? 0;
    const max = maxStats[statType] ?? 0;
    const weight = STAT_WEIGHTS[statType] ?? 1;

    // Stats above their natural max are more likely to lose on failure
    if (current > max) {
      return Math.min(0.95, 0.5 + (current - max) * weight * 0.05);
    }
    // Stats at or below max have lower loss probability
    return Math.max(0.05, 0.3 - (max - current) * weight * 0.02);
  }

  /**
   * Calculate exotic (PA/PM/PO/Invoc) probability.
   * These are community estimates, clearly labeled as such.
   */
  calculateExoticProbability(statType: StatType, availableSink: number): number {
    let baseProb: number;

    switch (statType) {
      case StatType.AP:
        baseProb = EXOTIC_PROBABILITIES.AP.estimate;
        break;
      case StatType.MP:
        baseProb = EXOTIC_PROBABILITIES.MP.estimate;
        break;
      case StatType.RANGE:
        baseProb = EXOTIC_PROBABILITIES.RANGE.estimate;
        break;
      case StatType.SUMMONS:
        baseProb = EXOTIC_PROBABILITIES.SUMMONS.estimate;
        break;
      default:
        return 0;
    }

    // Sink increases exotic probability slightly
    const sinkBonus = Math.min(0.03, availableSink * 0.0001);
    return Math.min(0.20, baseProb + sinkBonus);
  }

  /**
   * Calculate the probability distribution of stat changes after a rune application.
   */
  calculateStatChangeProbabilities(
    rune: Rune,
    context: ProbabilityContext
  ): Array<{ statType: StatType; probability: number; delta: number }> {
    const results: Array<{ statType: StatType; probability: number; delta: number }> = [];

    // Success: target stat increases
    const successProb = this.calculateSuccessProbability(rune, context);
    results.push({
      statType: rune.statType,
      probability: successProb,
      delta: rune.statValue,
    });

    // Failure: target stat may not increase, other stats may decrease
    const failureProb = 1 - successProb;
    for (const stat of context.currentStats) {
      if (stat.type === rune.statType) continue;
      const lossProbability = this.calculateLossProbability(stat.type, context.currentStats, context.maxStats);
      if (lossProbability > 0.1) {
        results.push({
          statType: stat.type,
          probability: failureProb * lossProbability * 0.3,
          delta: -1,
        });
      }
    }

    return results;
  }
}
