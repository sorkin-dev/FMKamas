import React, { useEffect } from 'react';
import { useDataSync } from '../../hooks/useDataSync';
import ProviderStatus from './ProviderStatus';
import LoadingSpinner from '../common/LoadingSpinner';

export default function DataSyncPanel(): React.ReactElement {
  const { sync, checkProviders, isSyncing, lastSync, providerStatuses } = useDataSync();

  useEffect(() => {
    checkProviders();
  }, [checkProviders]);

  return (
    <div className="rounded-lg p-4 space-y-4" style={{ background: '#1a1a2e', border: '1px solid #2a2a4a' }}>
      <ProviderStatus providers={providerStatuses} />

      <div>
        <button
          onClick={sync}
          disabled={isSyncing}
          className="w-full py-2 rounded text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: '#f59e0b', color: '#0f0f23' }}
        >
          {isSyncing ? <LoadingSpinner size="sm" /> : '🔄'}
          {isSyncing ? 'Synchronisation...' : 'Synchroniser les données'}
        </button>
      </div>

      {lastSync && (
        <div className="text-xs" style={{ color: '#94a3b8' }}>
          <div>Dernière sync: {lastSync.syncedAt.toLocaleString('fr-FR')}</div>
          <div>Provider: {lastSync.provider} — {lastSync.itemsSynced} items</div>
          {lastSync.error && <div style={{ color: '#ef4444' }}>Erreur: {lastSync.error}</div>}
        </div>
      )}
    </div>
  );
}
