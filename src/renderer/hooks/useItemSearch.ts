import { useCallback, useEffect, useRef } from 'react';
import { useItemStore } from '../store/itemStore';
import { ItemTemplate } from '../../domain/models/Item';

interface ElectronAPI {
  invoke: (channel: string, data?: unknown) => Promise<unknown>;
}

function getAPI(): ElectronAPI {
  if (window.electronAPI) return window.electronAPI;
  return {
    invoke: async (channel: string, data?: unknown) => {
      if (channel === 'items:search') return [];
      return null;
    },
  };
}

export function useItemSearch() {
  const store = useItemStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const api = getAPI();

  const search = useCallback((query: string) => {
    store.setSearchQuery(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      store.setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      store.setIsSearching(true);
      try {
        const results = await api.invoke('items:search', { query }) as ItemTemplate[];
        store.setSearchResults(results ?? []);
      } catch {
        store.setSearchResults([]);
      } finally {
        store.setIsSearching(false);
      }
    }, 300);
  }, [store, api]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { search, results: store.searchResults, isSearching: store.isSearching, query: store.searchQuery };
}
