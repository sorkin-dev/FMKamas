import { useCallback } from 'react';
import { useForgeStore } from '../store/forgeStore';
import { SinkEngine } from '../../domain/engine/SinkEngine';
import { StatType } from '../../domain/constants/StatWeights';
import { ItemTemplate } from '../../domain/models/Item';
import { StatLine } from '../../domain/models/Stat';

const sinkEngine = new SinkEngine();

interface ElectronAPI {
  invoke: (channel: string, data?: unknown) => Promise<unknown>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

function getAPI(): ElectronAPI {
  if (window.electronAPI) return window.electronAPI;
  // Fallback for browser development
  return {
    invoke: async (channel: string, data?: unknown): Promise<unknown> => {
      console.log(`[Mock IPC] ${channel}`, data);
      if (channel === 'items:search') return [];
      if (channel === 'forge:startSession') return { id: 'mock-session', itemId: 0, startedAt: new Date(), targetStats: [], currentStats: [], attempts: [], status: 'active' };
      if (channel === 'forge:getRecommendation') return null;
      return null;
    },
  };
}

export function useForgeEngine() {
  const store = useForgeStore();
  const api = getAPI();

  const startSession = useCallback(async (item: ItemTemplate, targetStats: StatLine[]) => {
    store.setLoading(true);
    try {
      const session = await api.invoke('forge:startSession', { itemId: item.id, targetStats }) as typeof store.session;
      store.setSession(session);
      store.setSelectedItem(item);
      store.setTargetStats(targetStats);
      const initialStats = item.stats.map(s => ({ type: s.type, value: s.min }));
      store.setCurrentStats(initialStats);
      return session;
    } catch (e) {
      store.setError(String(e));
    } finally {
      store.setLoading(false);
    }
  }, [store, api]);

  const getRecommendation = useCallback(async () => {
    if (!store.session) return;
    store.setLoading(true);
    try {
      const rec = await api.invoke('forge:getRecommendation', { sessionId: store.session.id });
      store.setRecommendation(rec as typeof store.recommendation);
      return rec;
    } catch (e) {
      store.setError(String(e));
    } finally {
      store.setLoading(false);
    }
  }, [store, api]);

  const recalculateSink = useCallback(() => {
    const item = store.selectedItem;
    if (!item) return;
    const maxStats: Record<StatType, number> = {} as Record<StatType, number>;
    for (const s of item.stats) maxStats[s.type] = s.max;
    const sink = sinkEngine.calculateSink(store.currentStats, maxStats);
    store.setAvailableSink(sink);
  }, [store]);

  return { startSession, getRecommendation, recalculateSink };
}
