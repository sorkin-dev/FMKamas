import { StatLine } from '../models/Stat';
import { StatType, STAT_WEIGHTS } from '../constants/StatWeights';
import { Rune } from '../models/Rune';

export class SinkEngine {
  /**
   * Calculate current sink value.
   * sink = Σ (maxNatural[stat] - current[stat]) * weight[stat] for stats where current < max
   */
  calculateSink(currentStats: StatLine[], maxStats: Record<StatType, number>): number {
    let sink = 0;
    for (const stat of currentStats) {
      const max = maxStats[stat.type] ?? 0;
      const weight = STAT_WEIGHTS[stat.type] ?? 0;
      if (stat.value < max) {
        sink += (max - stat.value) * weight;
      }
    }
    // Also account for stats in maxStats that are missing from currentStats
    for (const [statTypeStr, maxValue] of Object.entries(maxStats)) {
      const statType = statTypeStr as StatType;
      const hasStat = currentStats.some(s => s.type === statType);
      if (!hasStat && maxValue > 0) {
        const weight = STAT_WEIGHTS[statType] ?? 0;
        sink += maxValue * weight;
      }
    }
    return Math.max(0, sink);
  }

  /**
   * Calculate sink needed to safely apply a rune.
   * sinkNeeded = runeWeight * runeValue
   */
  calculateSinkNeeded(rune: Rune): number {
    return rune.weight;
  }

  /**
   * Estimate sink after applying a rune (success case).
   * On success, the stat increases, reducing the deficit and therefore the sink.
   */
  estimateSinkAfterSuccess(
    currentStats: StatLine[],
    maxStats: Record<StatType, number>,
    rune: Rune
  ): number {
    const updatedStats = currentStats.map(s => {
      if (s.type === rune.statType) {
        return { ...s, value: s.value + rune.statValue };
      }
      return s;
    });
    // If stat wasn't in list, add it
    if (!currentStats.some(s => s.type === rune.statType)) {
      updatedStats.push({ type: rune.statType, value: rune.statValue });
    }
    return this.calculateSink(updatedStats, maxStats);
  }

  /**
   * Estimate sink after applying a rune (failure case).
   * On failure, the target stat doesn't increase, but the consumed sink reduces available sink.
   * The sink is reduced by runeWeight (consumed by the failed attempt).
   */
  estimateSinkAfterFailure(
    currentStats: StatLine[],
    maxStats: Record<StatType, number>,
    rune: Rune
  ): number {
    // On failure, the reliquat (remainder) is consumed
    // Simulate by reducing another stat slightly
    const currentSink = this.calculateSink(currentStats, maxStats);
    const consumed = Math.min(rune.weight * 0.5, currentSink);
    return Math.max(0, currentSink - consumed);
  }

  /**
   * Get the percentage of sink available relative to required.
   */
  getSinkPercentage(availableSink: number, requiredSink: number): number {
    if (requiredSink <= 0) return 1;
    return Math.min(1, availableSink / requiredSink);
  }

  /**
   * Determine if sink is sufficient for a rune application.
   */
  isSinkSufficient(availableSink: number, rune: Rune): boolean {
    return availableSink >= this.calculateSinkNeeded(rune);
  }
}
