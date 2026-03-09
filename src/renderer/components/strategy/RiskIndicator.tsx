import React from 'react';
import { RiskLevel } from '../../../domain/constants/Thresholds';

interface RiskIndicatorProps {
  level: RiskLevel;
}

const RISK_CONFIG = {
  LOW: { color: '#22c55e', label: 'Faible', pct: 20 },
  MODERATE: { color: '#f59e0b', label: 'Modéré', pct: 45 },
  HIGH: { color: '#f97316', label: 'Élevé', pct: 70 },
  CRITICAL: { color: '#ef4444', label: 'Critique', pct: 95 },
};

export default function RiskIndicator({ level }: RiskIndicatorProps): React.ReactElement {
  const config = RISK_CONFIG[level];
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#2a2a4a' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${config.pct}%`, background: config.color }} />
      </div>
      <span className="text-xs font-semibold w-16 text-right" style={{ color: config.color }}>
        {config.label}
      </span>
    </div>
  );
}
