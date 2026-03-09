import React, { useState } from 'react';
import { Rune } from '../../../domain/models/Rune';
import { statTypeToFrench } from '../../../shared/utils/format';
import { formatKamas } from '../../../shared/utils/format';

interface RuneSelectorProps {
  runes: Rune[];
  onSelect: (rune: Rune) => void;
  selectedRune?: Rune | null;
}

export default function RuneSelector({ runes, onSelect, selectedRune }: RuneSelectorProps): React.ReactElement {
  const [filter, setFilter] = useState('');

  const filtered = runes.filter(r =>
    r.name.toLowerCase().includes(filter.toLowerCase()) ||
    statTypeToFrench(r.statType).toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="rounded-lg p-4" style={{ background: '#1a1a2e', border: '1px solid #2a2a4a' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#f59e0b' }}>🔮 Sélection de Rune</h3>
      <input
        type="text"
        placeholder="Filtrer les runes..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="w-full px-2 py-1.5 rounded text-xs mb-3"
        style={{ background: '#2a2a4a', border: '1px solid #3a3a5a', color: '#e2e8f0' }}
      />
      <div className="max-h-48 overflow-y-auto space-y-1">
        {filtered.slice(0, 50).map(rune => (
          <button
            key={rune.id}
            onClick={() => onSelect(rune)}
            className="w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between transition-colors"
            style={{
              background: selectedRune?.id === rune.id ? '#f59e0b22' : 'transparent',
              border: selectedRune?.id === rune.id ? '1px solid #f59e0b' : '1px solid transparent',
            }}
            onMouseEnter={e => { if (selectedRune?.id !== rune.id) e.currentTarget.style.background = '#2a2a4a'; }}
            onMouseLeave={e => { if (selectedRune?.id !== rune.id) e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ color: '#e2e8f0' }}>{rune.name}</span>
            <div className="flex gap-2">
              <span style={{ color: '#94a3b8' }}>+{rune.statValue} {statTypeToFrench(rune.statType)}</span>
              <span style={{ color: '#f59e0b' }}>{formatKamas(rune.defaultPrice)}</span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-center py-2" style={{ color: '#94a3b8' }}>Aucune rune trouvée</p>
        )}
      </div>
    </div>
  );
}
