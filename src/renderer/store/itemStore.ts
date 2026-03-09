import { create } from 'zustand';
import { ItemTemplate } from '../../domain/models/Item';

interface ItemState {
  searchQuery: string;
  searchResults: ItemTemplate[];
  isSearching: boolean;
  recentItems: ItemTemplate[];

  setSearchQuery: (q: string) => void;
  setSearchResults: (items: ItemTemplate[]) => void;
  setIsSearching: (searching: boolean) => void;
  addRecentItem: (item: ItemTemplate) => void;
}

export const useItemStore = create<ItemState>((set) => ({
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  recentItems: [],

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setIsSearching: (isSearching) => set({ isSearching }),
  addRecentItem: (item) => set(state => ({
    recentItems: [item, ...state.recentItems.filter(i => i.id !== item.id)].slice(0, 5),
  })),
}));
