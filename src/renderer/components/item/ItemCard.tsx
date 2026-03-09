import React from 'react';
import { ItemTemplate } from '../../../domain/models/Item';
import { statTypeToFrench } from '../../../shared/utils/format';
import Badge from '../common/Badge';

interface ItemCardProps {
  item: ItemTemplate;
}

export default function ItemCard({ item }: ItemCardProps): React.ReactElement {
  return (
    <div className="rounded-lg p-4" style={{ background: '#1a1a2e', border: '1px solid #2a2a4a' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-base" style={{ color: '#f59e0b' }}>{item.name}</h3>
          <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Niveau {item.level} — {item.type}</p>
        </div>
        <Badge label={item.source === 'api' ? 'API' : 'Local'} variant={item.source === 'api' ? 'success' : 'default'} />
      </div>
      <div className="space-y-1">
        {item.stats.map(s => (
          <div key={s.type} className="flex items-center justify-between text-xs">
            <span style={{ color: '#94a3b8' }}>{statTypeToFrench(s.type)}</span>
            <span style={{ color: '#e2e8f0' }}>{s.min} – {s.max}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
