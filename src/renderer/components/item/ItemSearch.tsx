import React, { useRef } from 'react';
import { useItemSearch } from '../../hooks/useItemSearch';
import { ItemTemplate } from '../../../domain/models/Item';
import LoadingSpinner from '../common/LoadingSpinner';

interface ItemSearchProps {
  onSelect: (item: ItemTemplate) => void;
}

export default function ItemSearch({ onSelect }: ItemSearchProps): React.ReactElement {
  const { search, results, isSearching, query } = useItemSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#2a2a4a' }}>
        <span style={{ color: '#94a3b8' }}>🔍</span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Rechercher un objet... (Ctrl+F)"
          value={query}
          onChange={e => search(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: '#e2e8f0' }}
        />
        {isSearching && <LoadingSpinner size="sm" />}
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg z-10 max-h-48 overflow-y-auto shadow-xl"
          style={{ background: '#1a1a2e', border: '1px solid #2a2a4a' }}>
          {results.map(item => (
            <button
              key={item.id}
              onClick={() => { onSelect(item); search(''); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-opacity-50 flex items-center justify-between"
              style={{ borderBottom: '1px solid #2a2a4a' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#2a2a4a')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ color: '#e2e8f0' }}>{item.name}</span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#f59e0b22', color: '#f59e0b' }}>
                Niv. {item.level} — {item.type}
              </span>
            </button>
          ))}
        </div>
      )}

      {query && results.length === 0 && !isSearching && (
        <div className="absolute top-full left-0 right-0 mt-1 px-3 py-2 rounded-lg text-sm" style={{ background: '#1a1a2e', border: '1px solid #2a2a4a', color: '#94a3b8' }}>
          Aucun objet trouvé
        </div>
      )}
    </div>
  );
}
