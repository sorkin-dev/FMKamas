import React from 'react';
import { Recommendation } from '../../../domain/models/Strategy';
import { statTypeToFrench, formatKamas, formatPercent } from '../../../shared/utils/format';
import Badge from '../common/Badge';

interface RuneRecommendationProps {
  recommendation: Recommendation | null;
  onApply?: () => void;
}

const RISK_VARIANTS: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  LOW: 'success',
  MODERATE: 'warning',
  HIGH: 'danger',
  CRITICAL: 'danger',
};

const ACTION_LABELS: Record<string, string> = {
  APPLY_RUNE: '⚒️ Appliquer Rune',
  STOP: '🛑 Arrêter',
  SECURE_FIRST: '🔒 Sécuriser d\'abord',
  REBUILD_STATS: '🔧 Remonter Stats',
  ATTEMPT_EXOTIC: '✨ Tenter Exotisme',
};

export default function RuneRecommendation({ recommendation, onApply }: RuneRecommendationProps): React.ReactElement {
  if (!recommendation) {
    return (
      <div className="rounded-lg p-4" style={{ background: '#1a1a2e', border: '1px solid #2a2a4a' }}>
        <h3 className="text-sm font-semibold mb-2" style={{ color: '#f59e0b' }}>🤖 Recommandation IA</h3>
        <p className="text-xs" style={{ color: '#94a3b8' }}>Démarrez une session pour obtenir des recommandations</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-4" style={{ background: '#1a1a2e', border: '1px solid #2a2a4a' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: '#f59e0b' }}>🤖 Recommandation IA</h3>
        <Badge label={recommendation.riskLevel} variant={RISK_VARIANTS[recommendation.riskLevel] ?? 'default'} />
      </div>

      <div className="mb-3">
        <span className="text-sm font-bold px-2 py-1 rounded" style={{ background: '#f59e0b22', color: '#f59e0b' }}>
          {ACTION_LABELS[recommendation.action] ?? recommendation.action}
          {recommendation.rune ? ` ${recommendation.rune.name}` : ''}
        </span>
      </div>

      <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>{recommendation.reasoning}</p>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="rounded p-2" style={{ background: '#2a2a4a' }}>
          <div style={{ color: '#94a3b8' }}>Probabilité</div>
          <div className="font-bold" style={{ color: '#22c55e' }}>{formatPercent(recommendation.successProbability)}</div>
        </div>
        <div className="rounded p-2" style={{ background: '#2a2a4a' }}>
          <div style={{ color: '#94a3b8' }}>Coût estimé</div>
          <div className="font-bold" style={{ color: '#f59e0b' }}>{formatKamas(recommendation.expectedCost)}</div>
        </div>
        <div className="rounded p-2" style={{ background: '#2a2a4a' }}>
          <div style={{ color: '#94a3b8' }}>Sink actuel</div>
          <div className="font-bold" style={{ color: '#8b5cf6' }}>{recommendation.sinkAnalysis.currentSink.toFixed(1)}</div>
        </div>
        <div className="rounded p-2" style={{ background: '#2a2a4a' }}>
          <div style={{ color: '#94a3b8' }}>Confiance</div>
          <div className="font-bold" style={{ color: '#e2e8f0' }}>{formatPercent(recommendation.confidence)}</div>
        </div>
      </div>

      {recommendation.rune && onApply && (
        <button
          onClick={onApply}
          className="w-full py-1.5 rounded text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: '#f59e0b', color: '#0f0f23' }}
        >
          Valider la tentative
        </button>
      )}
    </div>
  );
}
