import { ItemTemplate } from '../../domain/models/Item';
import { ForgeSession, ForgeAttempt } from '../../domain/models/Forge';
import { Recommendation } from '../../domain/models/Strategy';
import { StatLine } from '../../domain/models/Stat';

export interface SyncResult {
  success: boolean;
  itemsSynced: number;
  provider: string;
  error?: string;
  syncedAt: Date;
}

export interface ImportResult {
  success: boolean;
  itemsImported: number;
  error?: string;
}

export interface ProviderStatus {
  name: string;
  available: boolean;
  lastChecked: Date;
  itemCount?: number;
}

export interface ForgeSessionDetail extends ForgeSession {
  itemName: string;
  attemptsCount: number;
}

export interface SimulationResult {
  iterations: number;
  successRate: number;
  averageCost: number;
  averageAttempts: number;
  percentiles: { p10: number; p25: number; p50: number; p75: number; p90: number };
  costPercentiles: { p10: number; p25: number; p50: number; p75: number; p90: number };
}

export type IPCChannels = {
  'items:search': { request: { query: string }; response: ItemTemplate[] };
  'items:getById': { request: { id: number }; response: ItemTemplate | null };
  'items:sync': { request: { provider?: string }; response: SyncResult };
  'forge:startSession': { request: { itemId: number; targetStats: StatLine[] }; response: ForgeSession };
  'forge:applyRune': { request: { sessionId: string; runeId: number; result: string; statChanges: string }; response: ForgeAttempt };
  'forge:getRecommendation': { request: { sessionId: string }; response: Recommendation };
  'forge:runSimulation': { request: { sessionId: string; iterations?: number }; response: SimulationResult };
  'data:syncAll': { request: void; response: SyncResult };
  'data:getProviderStatus': { request: void; response: ProviderStatus[] };
  'data:importJson': { request: { filePath: string }; response: ImportResult };
  'settings:get': { request: { key: string }; response: string | null };
  'settings:set': { request: { key: string; value: string }; response: void };
  'history:getSessions': { request: void; response: ForgeSessionDetail[] };
  'history:getSession': { request: { id: string }; response: ForgeSessionDetail | null };
};
