import React from 'react';
import { Page } from '../../App';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps): React.ReactElement {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b" style={{ background: '#1a1a2e', borderColor: '#2a2a4a' }}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">⚒️</span>
        <div>
          <h1 className="text-lg font-bold" style={{ color: '#f59e0b' }}>FMKamas</h1>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Forgemagie Assistant — Dofus 3.5</p>
        </div>
      </div>
      <nav className="flex items-center gap-1">
        <NavButton label="⚒️ Forge" page="forge" current={currentPage} onNavigate={onNavigate} />
        <NavButton label="📦 Items" page="items" current={currentPage} onNavigate={onNavigate} />
        <NavButton label="📊 Historique" page="history" current={currentPage} onNavigate={onNavigate} />
        <NavButton label="⚙️ Paramètres" page="settings" current={currentPage} onNavigate={onNavigate} />
      </nav>
    </header>
  );
}

function NavButton({ label, page, current, onNavigate }: { label: string; page: Page; current: Page; onNavigate: (p: Page) => void }): React.ReactElement {
  const isActive = page === current;
  return (
    <button
      onClick={() => onNavigate(page)}
      className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
      style={{
        background: isActive ? '#f59e0b' : 'transparent',
        color: isActive ? '#0f0f23' : '#94a3b8',
      }}
    >
      {label}
    </button>
  );
}
