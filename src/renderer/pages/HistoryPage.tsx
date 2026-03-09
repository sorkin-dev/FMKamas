import React, { useState, useEffect } from 'react';
import { ForgeSessionDetail } from '../../shared/types/ipc';

export default function HistoryPage(): React.ReactElement {
  const [sessions, setSessions] = useState<ForgeSessionDetail[]>([]);

  useEffect(() => {
    const api = window.electronAPI;
    if (api) {
      api.invoke('history:getSessions').then(s => {
        setSessions((s as ForgeSessionDetail[]) ?? []);
      }).catch(console.error);
    }
  }, []);

  return (
    <div className="h-full flex flex-col gap-4">
      <h2 className="text-xl font-bold" style={{ color: '#f59e0b' }}>📊 Historique des Sessions</h2>
      {sessions.length === 0 ? (
        <div className="text-center py-12" style={{ color: '#94a3b8' }}>
          <p className="text-4xl mb-3">📂</p>
          <p>Aucune session enregistrée. Commencez à forger !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => (
            <div key={session.id} className="rounded-lg p-4" style={{ background: '#1a1a2e', border: '1px solid #2a2a4a' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold" style={{ color: '#f59e0b' }}>{session.itemName}</span>
                <span className="text-xs px-2 py-0.5 rounded" style={{
                  background: session.status === 'completed' ? '#22c55e22' : '#f59e0b22',
                  color: session.status === 'completed' ? '#22c55e' : '#f59e0b',
                }}>
                  {session.status === 'completed' ? 'Terminé' : session.status === 'active' ? 'En cours' : 'Abandonné'}
                </span>
              </div>
              <div className="text-xs" style={{ color: '#94a3b8' }}>
                <div>Débuté: {new Date(session.startedAt).toLocaleString('fr-FR')}</div>
                <div>Tentatives: {session.attemptsCount}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
