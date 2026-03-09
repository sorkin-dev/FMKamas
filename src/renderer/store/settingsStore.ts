import { create } from 'zustand';

interface RunePrice {
  statType: string;
  tier: string;
  price: number;
}

interface SettingsState {
  theme: 'dark';
  language: 'fr';
  defaultSimIterations: number;
  runePrices: RunePrice[];
  showAdvancedStats: boolean;

  setDefaultSimIterations: (n: number) => void;
  setRunePrice: (statType: string, tier: string, price: number) => void;
  setShowAdvancedStats: (show: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'dark',
  language: 'fr',
  defaultSimIterations: 1000,
  runePrices: [],
  showAdvancedStats: false,

  setDefaultSimIterations: (defaultSimIterations) => set({ defaultSimIterations }),
  setRunePrice: (statType, tier, price) => set(state => ({
    runePrices: [
      ...state.runePrices.filter(p => !(p.statType === statType && p.tier === tier)),
      { statType, tier, price },
    ],
  })),
  setShowAdvancedStats: (showAdvancedStats) => set({ showAdvancedStats }),
}));
