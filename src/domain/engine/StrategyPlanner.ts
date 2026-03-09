import { StatLine } from '../models/Stat';
import { StatType, STAT_WEIGHTS } from '../constants/StatWeights';
import { Rune } from '../models/Rune';
import { RuneTier } from '../constants/RuneWeights';
import { Strategy, StrategyStep, StrategyScore } from '../models/Strategy';
import { ProbabilityEngine, ProbabilityContext } from './ProbabilityEngine';
import { SinkEngine } from './SinkEngine';
import { MonteCarloSimulator } from './MonteCarloSimulator';
import { GAME_CONSTANTS } from '../constants/GameConstants';

export interface PlanningContext {
  currentStats: StatLine[];
  targetStats: StatLine[];
  maxStats: Record<StatType, number>;
  availableRunes: Rune[];
  availableSink: number;
  runePrices: Record<number, number>;
}

export class StrategyPlanner {
  private probabilityEngine = new ProbabilityEngine();
  private sinkEngine = new SinkEngine();
  private simulator = new MonteCarloSimulator();

  generateStrategies(context: PlanningContext): Strategy[] {
    const strategies: Strategy[] = [];

    strategies.push(this.buildLightFirstStrategy(context));
    strategies.push(this.buildHeavyFirstStrategy(context));
    strategies.push(this.buildBalancedStrategy(context));
    strategies.push(this.buildAggressiveStrategy(context));
    strategies.push(this.buildConservativeStrategy(context));

    const scored = strategies.map(s => ({ ...s, score: this.scoreStrategy(s, context) }));
    scored.sort((a, b) => b.score.composite - a.score.composite);

    return scored.map((s, idx) => ({ ...s, rank: idx + 1 }));
  }

  private buildLightFirstStrategy(context: PlanningContext): Strategy {
    const neededStats = this.getNeededStats(context);
    const sorted = [...neededStats].sort((a, b) => {
      const wa = STAT_WEIGHTS[a.type] ?? 1;
      const wb = STAT_WEIGHTS[b.type] ?? 1;
      return wa - wb;
    });

    const steps = this.buildStepsForStatOrder(sorted, context, RuneTier.STANDARD);

    return {
      id: 'light-first',
      name: 'Stratégie légère en premier',
      description: 'Commence par les statistiques légères (faible poids) pour accumuler du sink, puis passe aux statistiques lourdes.',
      steps,
      score: { successProbability: 0, expectedCost: 0, riskLevel: 'MODERATE', ev: 0, robustness: 0, composite: 0 },
      rank: 0,
    };
  }

  private buildHeavyFirstStrategy(context: PlanningContext): Strategy {
    const neededStats = this.getNeededStats(context);
    const sorted = [...neededStats].sort((a, b) => {
      const wa = STAT_WEIGHTS[a.type] ?? 1;
      const wb = STAT_WEIGHTS[b.type] ?? 1;
      return wb - wa;
    });

    const steps = this.buildStepsForStatOrder(sorted, context, RuneTier.STANDARD);

    return {
      id: 'heavy-first',
      name: 'Stratégie lourde en premier',
      description: 'Commence par les statistiques les plus lourdes. Plus risqué mais peut être plus rapide.',
      steps,
      score: { successProbability: 0, expectedCost: 0, riskLevel: 'HIGH', ev: 0, robustness: 0, composite: 0 },
      rank: 0,
    };
  }

  private buildBalancedStrategy(context: PlanningContext): Strategy {
    const neededStats = this.getNeededStats(context);
    const sorted = [...neededStats].sort((a, b) => {
      const wa = STAT_WEIGHTS[a.type] ?? 1;
      const wb = STAT_WEIGHTS[b.type] ?? 1;
      return wa - wb;
    });

    // Interleave light and heavy stats
    const interleaved: typeof sorted = [];
    let left = 0;
    let right = sorted.length - 1;
    let flip = true;
    while (left <= right) {
      if (flip) interleaved.push(sorted[left++]);
      else interleaved.push(sorted[right--]);
      flip = !flip;
    }

    const steps = this.buildStepsForStatOrder(interleaved, context, RuneTier.STANDARD);

    return {
      id: 'balanced',
      name: 'Stratégie équilibrée',
      description: 'Alterne entre statistiques légères et lourdes pour maintenir un sink stable.',
      steps,
      score: { successProbability: 0, expectedCost: 0, riskLevel: 'MODERATE', ev: 0, robustness: 0, composite: 0 },
      rank: 0,
    };
  }

  private buildAggressiveStrategy(context: PlanningContext): Strategy {
    const neededStats = this.getNeededStats(context);
    const sorted = [...neededStats].sort((a, b) => {
      const wa = STAT_WEIGHTS[a.type] ?? 1;
      const wb = STAT_WEIGHTS[b.type] ?? 1;
      return wa - wb;
    });

    const steps = this.buildStepsForStatOrder(sorted, context, RuneTier.RA);

    return {
      id: 'aggressive',
      name: 'Stratégie agressive (Ra)',
      description: 'Utilise des grandes runes (Ra) pour atteindre l\'objectif plus rapidement. Coût potentiellement élevé.',
      steps,
      score: { successProbability: 0, expectedCost: 0, riskLevel: 'HIGH', ev: 0, robustness: 0, composite: 0 },
      rank: 0,
    };
  }

  private buildConservativeStrategy(context: PlanningContext): Strategy {
    const neededStats = this.getNeededStats(context);
    const sorted = [...neededStats].sort((a, b) => {
      const wa = STAT_WEIGHTS[a.type] ?? 1;
      const wb = STAT_WEIGHTS[b.type] ?? 1;
      return wa - wb;
    });

    const steps = this.buildStepsForStatOrder(sorted, context, RuneTier.PA);

    return {
      id: 'conservative',
      name: 'Stratégie conservative (Pa)',
      description: 'Utilise des petites runes (Pa) pour minimiser les risques. Plus lent mais plus sûr.',
      steps,
      score: { successProbability: 0, expectedCost: 0, riskLevel: 'LOW', ev: 0, robustness: 0, composite: 0 },
      rank: 0,
    };
  }

  private getNeededStats(context: PlanningContext): StatLine[] {
    return context.targetStats.filter(t => {
      const current = context.currentStats.find(s => s.type === t.type)?.value ?? 0;
      return current < t.value;
    });
  }

  private buildStepsForStatOrder(
    stats: StatLine[],
    context: PlanningContext,
    preferredTier: RuneTier
  ): StrategyStep[] {
    const steps: StrategyStep[] = [];

    for (let i = 0; i < stats.length; i++) {
      const stat = stats[i];
      let rune = context.availableRunes.find(r => r.statType === stat.type && r.tier === preferredTier);
      if (!rune) rune = context.availableRunes.find(r => r.statType === stat.type);
      if (!rune) continue;

      const probCtx: ProbabilityContext = {
        currentStats: context.currentStats,
        maxStats: context.maxStats,
        availableSink: context.availableSink,
      };
      const prob = this.probabilityEngine.calculateSuccessProbability(rune, probCtx);
      const price = context.runePrices[rune.id] ?? rune.defaultPrice ?? 100;
      const expectedAttempts = prob > 0 ? 1 / prob : 10;

      steps.push({
        order: i + 1,
        rune,
        rationale: `Remonter ${stat.type} avec ${rune.name}`,
        expectedSuccessRate: prob,
        expectedCost: expectedAttempts * price,
      });
    }

    return steps;
  }

  private scoreStrategy(strategy: Strategy, _context: PlanningContext): StrategyScore {
    const totalSuccessRate = strategy.steps.length > 0
      ? strategy.steps.reduce((acc, s) => acc * s.expectedSuccessRate, 1)
      : 0;

    const totalCost = strategy.steps.reduce((acc, s) => acc + s.expectedCost, 0);

    const avgRisk = strategy.steps.length > 0
      ? strategy.steps.reduce((acc, s) => acc + (1 - s.expectedSuccessRate), 0) / strategy.steps.length
      : 0;

    let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (avgRisk > 0.6) riskLevel = 'CRITICAL';
    else if (avgRisk > 0.4) riskLevel = 'HIGH';
    else if (avgRisk > 0.2) riskLevel = 'MODERATE';

    const ev = -totalCost * (1 - totalSuccessRate);
    const robustness = 1 - (strategy.steps.reduce((acc, s) => acc + Math.pow(1 - s.expectedSuccessRate, 2), 0) / Math.max(1, strategy.steps.length));

    const composite = (totalSuccessRate * 0.4) + (robustness * 0.3) - (totalCost / 1000000 * 0.3);

    return {
      successProbability: totalSuccessRate,
      expectedCost: totalCost,
      riskLevel,
      ev,
      robustness,
      composite,
    };
  }
}
