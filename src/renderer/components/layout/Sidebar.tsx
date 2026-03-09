import React from 'react';
import { Page } from '../../App';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps): React.ReactElement {
  const items: { icon: string; label: string; page: Page }[] = [
    { icon: '⚒️', label: 'Forge', page: 'forge' },
    { icon: '📦', label: 'Items', page: 'items' },
    { icon: '📊', label: 'Historique', page: 'history' },
    { icon: '⚙️', label: 'Paramètres', page: 'settings' },
  ];

  return (
    <aside className="w-16 flex flex-col items-center py-4 gap-2 border-r" style={{ background: '#1a1a2e', borderColor: '#2a2a4a' }}>
      {items.map(item => (
        <button
          key={item.page}
          onClick={() => onNavigate(item.page)}
          title={item.label}
          className="w-10 h-10 rounded flex items-center justify-center text-xl transition-all"
          style={{
            background: currentPage === item.page ? '#f59e0b22' : 'transparent',
            border: currentPage === item.page ? '1px solid #f59e0b' : '1px solid transparent',
          }}
        >
          {item.icon}
        </button>
      ))}
    </aside>
  );
}
