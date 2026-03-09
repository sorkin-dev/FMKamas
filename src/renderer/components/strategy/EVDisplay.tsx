import React from 'react';
import { EVAnalysis } from '../../../domain/models/Strategy';
import { formatKamas } from '../../../shared/utils/format';

interface EVDisplayProps {
  ev: EVAnalysis;
}

export default function EVDisplay({ ev }: EVDisplayProps): React.ReactElement {
  return (
    <div className="rounded-lg p-4" style={{ background: '#1a1a2e', border: '1px solid #2a2a4a' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#f59e0b' }}>📈 Espérance de Valeur</h3>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span style={{ color: '#94a3b8' }}>Optimiste (P25)</span>
          <span style={{ color: '#22c55e' }}>{formatKamas(ev.optimisticCost)}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#94a3b8' }}>Médian (P50)</span>
          <span style={{ color: '#f59e0b' }}>{formatKamas(ev.medianCost)}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#94a3b8' }}>Pessimiste (P75)</span>
          <span style={{ color: '#ef4444' }}>{formatKamas(ev.pessimisticCost)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between" style={{ borderColor: '#2a2a4a' }}>
          <span style={{ color: '#94a3b8' }}>Seuil de rentabilité</span>
          <span style={{ color: '#8b5cf6' }}>{formatKamas(ev.breakEvenPrice)}</span>
        </div>
      </div>
    </div>
  );
}
