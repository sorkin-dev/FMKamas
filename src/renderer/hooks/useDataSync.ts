import { useState, useCallback } from 'react';

interface ProviderStatus {
  name: string;
  available: boolean;
  lastChecked: Date;
}

interface SyncResult {
  success: boolean;
  itemsSynced: number;
  provider: string;
  error?: string;
  syncedAt: Date;
}

interface ElectronAPI {
  invoke: (channel: string, data?: unknown) => Promise<unknown>;
}

function getAPI(): ElectronAPI {
  if (window.electronAPI) return window.electronAPI;
  return {
    invoke: async () => null,
  };
}

export function useDataSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<SyncResult | null>(null);
  const [providerStatuses, setProviderStatuses] = useState<ProviderStatus[]>([]);
  const api = getAPI();

  const sync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await api.invoke('data:syncAll') as SyncResult;
      setLastSync(result);
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [api]);

  const checkProviders = useCallback(async () => {
    const statuses = await api.invoke('data:getProviderStatus') as ProviderStatus[];
    setProviderStatuses(statuses ?? []);
  }, [api]);

  return { sync, checkProviders, isSyncing, lastSync, providerStatuses };
}
