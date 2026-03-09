import React from 'react';
import { Strategy } from '../../../domain/models/Strategy';
import { formatKamas, formatPercent } from '../../../shared/utils/format';
import RiskIndicator from './RiskIndicator';
import Badge from '../common/Badge';

interface StrategyPanelProps {
  strategies: Strategy[];
  onSelect?: (strategy: Strategy) => void;
  selectedId?: string;
}

export default function StrategyPanel({ strategies, onSelect, selectedId }: StrategyPanelProps): React.ReactElement {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold" style={{ color: '#f59e0b' }}>📋 Stratégies</h3>
      {strategies.length === 0 ? (
        <p className="text-xs" style={{ color: '#94a3b8' }}>Aucune stratégie disponible</p>
      ) : (
        strategies.map(strategy => (
          <div
            key={strategy.id}
            onClick={() => onSelect?.(strategy)}
            className="rounded-lg p-3 cursor-pointer transition-all"
            style={{
              background: selectedId === strategy.id ? '#f59e0b11' : '#1a1a2e',
              border: `1px solid ${selectedId === strategy.id ? '#f59e0b' : '#2a2a4a'}`,
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium" style={{ color: '#e2e8f0' }}>
                #{strategy.rank} {strategy.name}
              </span>
              <Badge
                label={`${formatPercent(strategy.score.successProbability)}`}
                variant={strategy.score.successProbability > 0.7 ? 'success' : strategy.score.successProbability > 0.4 ? 'warning' : 'danger'}
              />
            </div>
            <p className="text-xs mb-2" style={{ color: '#94a3b8' }}>{strategy.description}</p>
            <div className="flex items-center gap-4 text-xs">
              <span style={{ color: '#f59e0b' }}>Coût: {formatKamas(strategy.score.expectedCost)}</span>
              <RiskIndicator level={strategy.score.riskLevel} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
