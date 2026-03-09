import React from 'react';
import { statTypeToFrench } from '../../../shared/utils/format';

interface StatBarProps {
  statType: string;
  current: number;
  max: number;
  target?: number;
}

export default function StatBar({ statType, current, max, target }: StatBarProps): React.ReactElement {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0;
  const isOvermaged = current > max;
  const isTarget = target !== undefined && current >= target;

  let barColor = '#f59e0b';
  if (isOvermaged) barColor = '#8b5cf6';
  else if (isTarget) barColor = '#22c55e';
  else if (pct < 50) barColor = '#ef4444';

  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="text-xs w-28 truncate" style={{ color: '#94a3b8' }}>{statTypeToFrench(statType)}</span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: '#2a2a4a' }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, pct)}%`, background: barColor }} />
      </div>
      <span className="text-xs w-16 text-right font-mono" style={{ color: isOvermaged ? '#8b5cf6' : '#e2e8f0' }}>
        {current}/{max}{target !== undefined ? `→${target}` : ''}
      </span>
    </div>
  );
}
