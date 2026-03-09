import React from 'react';
import ForgeSimulator from '../components/forge/ForgeSimulator';

export default function ForgePage(): React.ReactElement {
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold" style={{ color: '#f59e0b' }}>⚒️ Atelier de Forgemagie</h2>
        <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#f59e0b22', color: '#f59e0b' }}>
          Dofus 3.5
        </span>
      </div>
      <ForgeSimulator />
    </div>
  );
}
