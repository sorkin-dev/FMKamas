import React from 'react';
import { StatLine } from '../../../domain/models/Stat';
import { StatRange } from '../../../domain/models/Stat';
import { statTypeToFrench } from '../../../shared/utils/format';
import StatBar from '../common/StatBar';

interface ItemStatPanelProps {
  title: string;
  stats: StatLine[];
  statRanges: StatRange[];
  targetStats?: StatLine[];
  onStatChange?: (type: string, value: number) => void;
  editable?: boolean;
}

export default function ItemStatPanel({ title, stats, statRanges, targetStats, onStatChange, editable = false }: ItemStatPanelProps): React.ReactElement {
  return (
    <div className="rounded-lg p-4" style={{ background: '#1a1a2e', border: '1px solid #2a2a4a' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#f59e0b' }}>{title}</h3>
      <div className="space-y-2">
        {statRanges.map(range => {
          const current = stats.find(s => s.type === range.type)?.value ?? range.min;
          const target = targetStats?.find(s => s.type === range.type)?.value;
          return (
            <div key={range.type}>
              {editable && onStatChange ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs w-28 truncate" style={{ color: '#94a3b8' }}>{statTypeToFrench(range.type)}</span>
                  <input
                    type="number"
                    min={0}
                    max={range.max * 2}
                    value={current}
                    onChange={e => onStatChange(range.type, Number(e.target.value))}
                    className="w-16 px-1 py-0.5 text-xs rounded text-right"
                    style={{ background: '#2a2a4a', border: '1px solid #3a3a5a', color: '#e2e8f0' }}
                  />
                  <span className="text-xs" style={{ color: '#94a3b8' }}>/ {range.max}</span>
                </div>
              ) : (
                <StatBar statType={range.type} current={current} max={range.max} target={target} />
              )}
            </div>
          );
        })}
        {statRanges.length === 0 && (
          <p className="text-xs" style={{ color: '#94a3b8' }}>Aucune statistique</p>
        )}
      </div>
    </div>
  );
}
