import React from 'react';
import { formatKamas } from '../../../shared/utils/format';

interface CostEstimatorProps {
  optimistic: number;
  median: number;
  pessimistic: number;
  averageAttempts?: number;
}

export default function CostEstimator({ optimistic, median, pessimistic, averageAttempts }: CostEstimatorProps): React.ReactElement {
  return (
    <div className="rounded-lg p-4" style={{ background: '#1a1a2e', border: '1px solid #2a2a4a' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#f59e0b' }}>💰 Estimation des coûts</h3>
      <div className="space-y-2">
        {[
          { label: '😊 Optimiste', value: optimistic, color: '#22c55e' },
          { label: '😐 Médian', value: median, color: '#f59e0b' },
          { label: '😰 Pessimiste', value: pessimistic, color: '#ef4444' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xs w-24" style={{ color: '#94a3b8' }}>{label}</span>
            <div className="flex-1 h-1.5 rounded-full" style={{ background: '#2a2a4a' }}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, (value / pessimistic) * 100)}%`, background: color }} />
            </div>
            <span className="text-xs w-16 text-right font-mono" style={{ color }}>{formatKamas(value)}</span>
          </div>
        ))}
        {averageAttempts !== undefined && (
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Tentatives moyennes: {averageAttempts.toFixed(1)}</p>
        )}
      </div>
    </div>
  );
}
