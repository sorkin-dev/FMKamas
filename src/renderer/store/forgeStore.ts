import { create } from 'zustand';
import { ItemTemplate } from '../../domain/models/Item';
import { StatLine } from '../../domain/models/Stat';
import { ForgeAttempt, ForgeSession } from '../../domain/models/Forge';
import { Recommendation } from '../../domain/models/Strategy';
import { Rune } from '../../domain/models/Rune';

interface ForgeState {
  selectedItem: ItemTemplate | null;
  currentStats: StatLine[];
  targetStats: StatLine[];
  session: ForgeSession | null;
  attempts: ForgeAttempt[];
  recommendation: Recommendation | null;
  availableSink: number;
  availableRunes: Rune[];
  isLoading: boolean;
  error: string | null;

  setSelectedItem: (item: ItemTemplate | null) => void;
  setCurrentStats: (stats: StatLine[]) => void;
  setTargetStats: (stats: StatLine[]) => void;
  setSession: (session: ForgeSession | null) => void;
  addAttempt: (attempt: ForgeAttempt) => void;
  setRecommendation: (rec: Recommendation | null) => void;
  setAvailableSink: (sink: number) => void;
  setAvailableRunes: (runes: Rune[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useForgeStore = create<ForgeState>((set) => ({
  selectedItem: null,
  currentStats: [],
  targetStats: [],
  session: null,
  attempts: [],
  recommendation: null,
  availableSink: 0,
  availableRunes: [],
  isLoading: false,
  error: null,

  setSelectedItem: (item) => set({ selectedItem: item }),
  setCurrentStats: (stats) => set({ currentStats: stats }),
  setTargetStats: (stats) => set({ targetStats: stats }),
  setSession: (session) => set({ session }),
  addAttempt: (attempt) => set(state => ({ attempts: [...state.attempts, attempt] })),
  setRecommendation: (recommendation) => set({ recommendation }),
  setAvailableSink: (availableSink) => set({ availableSink }),
  setAvailableRunes: (availableRunes) => set({ availableRunes }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ selectedItem: null, currentStats: [], targetStats: [], session: null, attempts: [], recommendation: null, availableSink: 0 }),
}));
