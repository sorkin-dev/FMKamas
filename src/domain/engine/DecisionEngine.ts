import { StatLine } from '../models/Stat';
import { StatType, STAT_WEIGHTS } from '../constants/StatWeights';
import { Rune } from '../models/Rune';
import { RuneTier } from '../constants/RuneWeights';
import { Recommendation, AlternativeAction, SinkAnalysis, EVAnalysis } from '../models/Strategy';
import { RiskLevel, PROBABILITY_THRESHOLDS } from '../constants/Thresholds';
import { ProbabilityEngine, ProbabilityContext } from './ProbabilityEngine';
import { SinkEngine } from './SinkEngine';

export interface DecisionContext {
  currentStats: StatLine[];
  targetStats: StatLine[];
  maxStats: Record<StatType, number>;
  availableRunes: Rune[];
  availableSink: number;
  sessionAttempts: number;
  runePrices: Record<number, number>;
}

export class DecisionEngine {
  private probabilityEngine = new ProbabilityEngine();
  private sinkEngine = new SinkEngine();

  /**
   * Main entry point: evaluate state and produce a recommendation.
   */
  getRecommendation(context: DecisionContext): Recommendation {
    if (this.isGoalReached(context.currentStats, context.targetStats)) {
      return this.buildStopRecommendation('Objectif atteint ! Toutes les statistiques sont à leur valeur cible.', context);
    }

    if (this.hasCriticalLoss(context)) {
      return this.buildRebuildRecommendation(context);
    }

    const bestRune = this.findBestRune(context);
    if (!bestRune) {
      return this.buildStopRecommendation('Aucune rune applicable trouvée pour les statistiques cibles.', context);
    }

    const probContext: ProbabilityContext = {
      currentStats: context.currentStats,
      maxStats: context.maxStats,
      availableSink: context.availableSink,
    };

    const probability = this.probabilityEngine.calculateSuccessProbability(bestRune, probContext);
    const riskLevel = this.assessRisk(probability, context.availableSink, bestRune);

    if (riskLevel === 'CRITICAL' && this.hasUnsecuredStats(context)) {
      return this.buildSecureRecommendation(context, bestRune);
    }

    if (this.shouldAttemptExotic(context, bestRune)) {
      return this.buildExoticRecommendation(context, bestRune);
    }

    const sinkAnalysis = this.buildSinkAnalysis(context.availableSink, bestRune);
    const evAnalysis = this.buildEVAnalysis(bestRune, probability, context);
    const alternatives = this.buildAlternatives(context, bestRune);
    const reasoning = this.buildReasoning(bestRune, probability, riskLevel, context);

    return {
      action: 'APPLY_RUNE',
      rune: bestRune,
      reasoning,
      confidence: probability,
      expectedCost: evAnalysis.medianCost,
      successProbability: probability,
      riskLevel,
      alternativeActions: alternatives,
      sinkAnalysis,
      evAnalysis,
    };
  }

  private isGoalReached(current: StatLine[], target: StatLine[]): boolean {
    return target.every(t => {
      const c = current.find(s => s.type === t.type)?.value ?? 0;
      return c >= t.value;
    });
  }

  private hasCriticalLoss(context: DecisionContext): boolean {
    const criticalStats = [StatType.AP, StatType.MP];
    for (const statType of criticalStats) {
      const current = context.currentStats.find(s => s.type === statType)?.value ?? 0;
      const min = (context.maxStats[statType] ?? 0) * 0.5;
      if (current > 0 && current < min) return true;
    }
    return false;
  }

  /**
   * Find the best rune to apply.
   * Strategy: light stats first (low weight), then heavy stats, exo last.
   */
  private findBestRune(context: DecisionContext): Rune | null {
    const neededStats = context.targetStats.filter(t => {
      const current = context.currentStats.find(s => s.type === t.type)?.value ?? 0;
      return current < t.value;
    });

    if (neededStats.length === 0) return null;

    const sortedNeeded = neededStats.sort((a, b) => {
      const wa = STAT_WEIGHTS[a.type] ?? 1;
      const wb = STAT_WEIGHTS[b.type] ?? 1;
      return wa - wb;
    });

    for (const needed of sortedNeeded) {
      const deficit = (context.targetStats.find(t => t.type === needed.type)?.value ?? 0) -
                      (context.currentStats.find(s => s.type === needed.type)?.value ?? 0);

      let preferredTier = RuneTier.STANDARD;
      if (deficit >= 10) preferredTier = RuneTier.RA;
      else if (deficit <= 1) preferredTier = RuneTier.PA;

      let rune = context.availableRunes.find(r => r.statType === needed.type && r.tier === preferredTier);
      if (!rune) rune = context.availableRunes.find(r => r.statType === needed.type);
      if (rune) return rune;
    }

    return null;
  }

  private assessRisk(probability: number, availableSink: number, rune: Rune): RiskLevel {
    const sinkRatio = availableSink / Math.max(1, rune.weight);

    if (probability >= PROBABILITY_THRESHOLDS.SAFE && sinkRatio >= 1) return 'LOW';
    if (probability >= PROBABILITY_THRESHOLDS.MODERATE && sinkRatio >= 0.5) return 'MODERATE';
    if (probability >= PROBABILITY_THRESHOLDS.RISKY) return 'HIGH';
    return 'CRITICAL';
  }

  private hasUnsecuredStats(context: DecisionContext): boolean {
    return context.currentStats.some(s => {
      const max = context.maxStats[s.type] ?? 0;
      return s.value > max;
    });
  }

  private shouldAttemptExotic(context: DecisionContext, rune: Rune): boolean {
    const exoticStats = [StatType.AP, StatType.MP, StatType.RANGE, StatType.SUMMONS];
    if (!exoticStats.includes(rune.statType as StatType)) return false;

    const otherStatsComplete = context.targetStats
      .filter(t => !exoticStats.includes(t.type as StatType))
      .every(t => {
        const c = context.currentStats.find(s => s.type === t.type)?.value ?? 0;
        return c >= t.value;
      });

    return otherStatsComplete && context.availableSink >= rune.weight * 2;
  }

  private buildStopRecommendation(reason: string, context: DecisionContext): Recommendation {
    return {
      action: 'STOP',
      reasoning: reason,
      confidence: 1,
      expectedCost: 0,
      successProbability: 1,
      riskLevel: 'LOW',
      alternativeActions: [],
      sinkAnalysis: { currentSink: context.availableSink, requiredSink: 0, sinkFactor: 1, isAdequate: true },
      evAnalysis: { expectedValue: 0, optimisticCost: 0, medianCost: 0, pessimisticCost: 0, breakEvenPrice: 0 },
    };
  }

  private buildRebuildRecommendation(context: DecisionContext): Recommendation {
    const reasoning = 'Des statistiques critiques (PA/PM) ont été perdues. Il est recommandé de remonter ces statistiques avant de continuer.';
    const rune = context.availableRunes.find(r => r.statType === StatType.AP || r.statType === StatType.MP);
    return {
      action: 'REBUILD_STATS',
      rune,
      reasoning,
      confidence: 0.8,
      expectedCost: 50000,
      successProbability: 0.8,
      riskLevel: 'HIGH',
      alternativeActions: [],
      sinkAnalysis: { currentSink: context.availableSink, requiredSink: rune?.weight ?? 100, sinkFactor: 0.5, isAdequate: false },
      evAnalysis: { expectedValue: -10000, optimisticCost: 20000, medianCost: 50000, pessimisticCost: 100000, breakEvenPrice: 0 },
    };
  }

  private buildSecureRecommendation(context: DecisionContext, originalRune: Rune): Recommendation {
    const reasoning = 'Le risque est critique. Il est recommandé de sécuriser les statistiques actuelles avant de tenter une rune risquée. Considérez de remonter le sink d\'abord.';
    return {
      action: 'SECURE_FIRST',
      reasoning,
      confidence: 0.7,
      expectedCost: 10000,
      successProbability: 0.7,
      riskLevel: 'HIGH',
      alternativeActions: [],
      sinkAnalysis: { currentSink: context.availableSink, requiredSink: originalRune.weight, sinkFactor: 0.3, isAdequate: false },
      evAnalysis: { expectedValue: -5000, optimisticCost: 5000, medianCost: 10000, pessimisticCost: 30000, breakEvenPrice: 0 },
    };
  }

  private buildExoticRecommendation(context: DecisionContext, rune: Rune): Recommendation {
    const exoProb = this.probabilityEngine.calculateExoticProbability(rune.statType as StatType, context.availableSink);
    const avgCost = (rune.defaultPrice ?? 1000) / exoProb;
    const reasoning = `Toutes les statistiques normales sont sécurisées et le sink est suffisant. C'est le bon moment pour tenter l'exotisme ${rune.statType}. Probabilité estimée : ${(exoProb * 100).toFixed(1)}% (estimation communautaire).`;

    return {
      action: 'ATTEMPT_EXOTIC',
      rune,
      reasoning,
      confidence: exoProb,
      expectedCost: avgCost,
      successProbability: exoProb,
      riskLevel: exoProb < 0.03 ? 'CRITICAL' : 'HIGH',
      alternativeActions: [],
      sinkAnalysis: this.buildSinkAnalysis(context.availableSink, rune),
      evAnalysis: this.buildEVAnalysis(rune, exoProb, context),
    };
  }

  private buildSinkAnalysis(availableSink: number, rune: Rune): SinkAnalysis {
    const requiredSink = this.sinkEngine.calculateSinkNeeded(rune);
    const sinkFactor = this.probabilityEngine.calculateSinkFactor(availableSink, rune.weight);
    return {
      currentSink: availableSink,
      requiredSink,
      sinkFactor,
      isAdequate: availableSink >= requiredSink,
    };
  }

  private buildEVAnalysis(rune: Rune, probability: number, context: DecisionContext): EVAnalysis {
    const price = context.runePrices[rune.id] ?? rune.defaultPrice ?? 100;
    const avgAttempts = probability > 0 ? 1 / probability : 100;
    const medianCost = avgAttempts * price;
    return {
      expectedValue: -medianCost * 0.8,
      optimisticCost: medianCost * 0.4,
      medianCost,
      pessimisticCost: medianCost * 2.5,
      breakEvenPrice: medianCost * 1.5,
    };
  }

  private buildAlternatives(context: DecisionContext, currentRune: Rune): AlternativeAction[] {
    const alternatives: AlternativeAction[] = [];

    const otherTiers = context.availableRunes.filter(r =>
      r.statType === currentRune.statType && r.id !== currentRune.id
    );

    for (const altRune of otherTiers.slice(0, 2)) {
      const probCtx: ProbabilityContext = {
        currentStats: context.currentStats,
        maxStats: context.maxStats,
        availableSink: context.availableSink,
      };
      const prob = this.probabilityEngine.calculateSuccessProbability(altRune, probCtx);
      const price = context.runePrices[altRune.id] ?? altRune.defaultPrice ?? 100;
      alternatives.push({
        action: 'APPLY_RUNE',
        description: `Utiliser ${altRune.name} (${altRune.tier}) — ${altRune.statValue} point(s)`,
        rune: altRune,
        probability: prob,
        cost: price,
        riskLevel: this.assessRisk(prob, context.availableSink, altRune),
      });
    }

    alternatives.push({
      action: 'STOP',
      description: 'Arrêter et conserver les statistiques actuelles',
      probability: 1,
      cost: 0,
      riskLevel: 'LOW',
    });

    return alternatives;
  }

  private buildReasoning(rune: Rune, probability: number, riskLevel: RiskLevel, context: DecisionContext): string {
    const deficit = (context.targetStats.find(t => t.type === rune.statType)?.value ?? 0) -
                    (context.currentStats.find(s => s.type === rune.statType)?.value ?? 0);
    const sinkStatus = context.availableSink >= rune.weight ? 'suffisant' : 'insuffisant';

    return `La statistique ${rune.statType} est à ${deficit} point(s) de l'objectif. ` +
      `Application de la rune ${rune.name} recommandée. ` +
      `Probabilité de succès : ${(probability * 100).toFixed(0)}%. ` +
      `Sink ${sinkStatus} (disponible: ${context.availableSink.toFixed(1)}, requis: ${rune.weight.toFixed(1)}). ` +
      `Niveau de risque : ${riskLevel}.`;
  }
}
