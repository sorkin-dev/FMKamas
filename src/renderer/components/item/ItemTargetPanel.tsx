import React from 'react';
import { StatLine } from '../../../domain/models/Stat';
import { StatRange } from '../../../domain/models/Stat';
import { statTypeToFrench } from '../../../shared/utils/format';

interface ItemTargetPanelProps {
  statRanges: StatRange[];
  targetStats: StatLine[];
  onTargetChange: (type: string, value: number) => void;
}

export default function ItemTargetPanel({ statRanges, targetStats, onTargetChange }: ItemTargetPanelProps): React.ReactElement {
  return (
    <div className="rounded-lg p-4" style={{ background: '#1a1a2e', border: '1px solid #2a2a4a' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#8b5cf6' }}>🎯 Statistiques Objectif</h3>
      <div className="space-y-2">
        {statRanges.map(range => {
          const target = targetStats.find(s => s.type === range.type)?.value ?? range.max;
          return (
            <div key={range.type} className="flex items-center gap-2">
              <span className="text-xs w-28 truncate" style={{ color: '#94a3b8' }}>{statTypeToFrench(range.type)}</span>
              <input
                type="range"
                min={range.min}
                max={Math.ceil(range.max * 1.1)}
                value={target}
                onChange={e => onTargetChange(range.type, Number(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#8b5cf6' }}
              />
              <span className="text-xs w-8 text-right" style={{ color: '#e2e8f0' }}>{target}</span>
            </div>
          );
        })}
        {statRanges.length === 0 && (
          <p className="text-xs" style={{ color: '#94a3b8' }}>Sélectionnez un objet</p>
        )}
      </div>
    </div>
  );
}
