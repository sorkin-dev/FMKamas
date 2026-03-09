import React from 'react';

interface SinkDisplayProps {
  currentSink: number;
  requiredSink?: number;
}

export default function SinkDisplay({ currentSink, requiredSink }: SinkDisplayProps): React.ReactElement {
  const pct = requiredSink ? Math.min(100, (currentSink / requiredSink) * 100) : Math.min(100, currentSink / 10);
  const color = pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : pct >= 25 ? '#f97316' : '#ef4444';

  return (
    <div className="rounded-lg p-4" style={{ background: '#1a1a2e', border: '1px solid #2a2a4a' }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold" style={{ color: '#f59e0b' }}>💧 Sink / Puits</h3>
        <span className="text-xs font-mono" style={{ color }}>
          {currentSink.toFixed(1)} pts
        </span>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: '#2a2a4a' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      {requiredSink !== undefined && (
        <div className="mt-2 flex justify-between text-xs" style={{ color: '#94a3b8' }}>
          <span>Disponible: {currentSink.toFixed(1)}</span>
          <span>Requis: {requiredSink.toFixed(1)}</span>
        </div>
      )}
      {requiredSink === undefined && (
        <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
          {currentSink < 5 ? 'Sink faible — risque élevé' : currentSink < 20 ? 'Sink modéré' : 'Sink bon'}
        </p>
      )}
    </div>
  );
}
