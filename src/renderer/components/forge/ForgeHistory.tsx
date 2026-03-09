import React from 'react';
import { ForgeAttempt } from '../../../domain/models/Forge';
import { statTypeToFrench } from '../../../shared/utils/format';

interface ForgeHistoryProps {
  attempts: ForgeAttempt[];
}

export default function ForgeHistory({ attempts }: ForgeHistoryProps): React.ReactElement {
  return (
    <div className="rounded-lg p-4" style={{ background: '#1a1a2e', border: '1px solid #2a2a4a' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#f59e0b' }}>📜 Historique des tentatives</h3>
      {attempts.length === 0 ? (
        <p className="text-xs" style={{ color: '#94a3b8' }}>Aucune tentative enregistrée</p>
      ) : (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {[...attempts].reverse().map((attempt, idx) => {
            const isSuccess = attempt.outcome === 'SUCCESS';
            return (
              <div key={attempt.id ?? idx} className="flex items-start gap-2 py-1 text-xs">
                <span className="flex-shrink-0">
                  {isSuccess ? '✅' : '❌'}
                </span>
                <div className="flex-1">
                  <span className="font-medium" style={{ color: isSuccess ? '#22c55e' : '#ef4444' }}>
                    #{attempts.length - idx} {attempt.rune?.name ?? 'Rune'}
                  </span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {attempt.statChanges?.map((change, i) => (
                      <span key={i} className="px-1 rounded" style={{ background: '#2a2a4a', color: change.delta >= 0 ? '#22c55e' : '#ef4444' }}>
                        {change.delta >= 0 ? '+' : ''}{change.delta} {statTypeToFrench(change.statType)}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-xs" style={{ color: '#94a3b8' }}>
                  Sink: {attempt.sinkAfter?.toFixed(1) ?? '?'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
