import { IpcMain, IpcMainInvokeEvent } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import Database from 'better-sqlite3';
import { ItemRepository } from '../infrastructure/persistence/repositories/ItemRepository';
import { RuneRepository } from '../infrastructure/persistence/repositories/RuneRepository';
import { HistoryRepository } from '../infrastructure/persistence/repositories/HistoryRepository';
import { SettingsRepository } from '../infrastructure/persistence/repositories/SettingsRepository';
import { DataProviderFactory } from '../infrastructure/providers/DataProviderFactory';
import { ItemService } from '../application/services/ItemService';
import { ForgeService } from '../application/services/ForgeService';
import { HistoryService } from '../application/services/HistoryService';
import { DataSyncService } from '../application/services/DataSyncService';
import { MonteCarloSimulator } from '../domain/engine/MonteCarloSimulator';
import { StatType } from '../domain/constants/StatWeights';
import { ForgeOutcome } from '../domain/models/Forge';
import { StatLine } from '../domain/models/Stat';

export function registerIPCHandlers(ipcMain: IpcMain, db: Database.Database, dataDir: string): void {
  const itemRepo = new ItemRepository(db as unknown as import('../infrastructure/persistence/repositories/ItemRepository').Database);
  const runeRepo = new RuneRepository(db as unknown as import('../infrastructure/persistence/repositories/ItemRepository').Database);
  const historyRepo = new HistoryRepository(db as unknown as import('../infrastructure/persistence/repositories/ItemRepository').Database);
  const settingsRepo = new SettingsRepository(db as unknown as import('../infrastructure/persistence/repositories/ItemRepository').Database);
  const providerFactory = new DataProviderFactory(dataDir);

  const itemService = new ItemService(itemRepo, providerFactory);
  const forgeService = new ForgeService(historyRepo, runeRepo, itemRepo);
  const historyService = new HistoryService(historyRepo);
  const dataSyncService = new DataSyncService(providerFactory);
  const simulator = new MonteCarloSimulator();

  // Items
  ipcMain.handle('items:search', (_event: IpcMainInvokeEvent, data: { query: string }) => {
    return itemService.search(data.query);
  });

  ipcMain.handle('items:getById', (_event: IpcMainInvokeEvent, data: { id: number }) => {
    return itemService.getById(data.id);
  });

  ipcMain.handle('items:sync', async (_event: IpcMainInvokeEvent, data: { provider?: string }) => {
    return itemService.syncFromProvider(data?.provider);
  });

  // Forge
  ipcMain.handle('forge:startSession', (_event: IpcMainInvokeEvent, data: { itemId: number; targetStats: StatLine[] }) => {
    return forgeService.startSession(data.itemId, data.targetStats);
  });

  ipcMain.handle('forge:applyRune', (_event: IpcMainInvokeEvent, data: { sessionId: string; runeId: number; result: string; statChanges: string }) => {
    return forgeService.applyRune(data.sessionId, data.runeId, data.result as ForgeOutcome, data.statChanges);
  });

  ipcMain.handle('forge:getRecommendation', (_event: IpcMainInvokeEvent, data: { sessionId: string }) => {
    return forgeService.getRecommendation(data.sessionId);
  });

  ipcMain.handle('forge:runSimulation', (_event: IpcMainInvokeEvent, data: { sessionId: string; iterations?: number }) => {
    const session = forgeService.getSession(data.sessionId);
    if (!session) throw new Error(`Session ${data.sessionId} not found`);

    const allRunes = runeRepo.getAll();
    const maxStats: Record<StatType, number> = {} as Record<StatType, number>;
    const item = itemRepo.getById(session.itemId);
    if (item) {
      for (const s of item.stats) maxStats[s.type] = s.max;
    }

    return simulator.simulate({
      iterations: data.iterations ?? 1000,
      targetStats: session.targetStats,
      initialStats: session.currentStats,
      maxStats,
      runeSequence: allRunes,
      runePrices: {},
    });
  });

  // Data
  ipcMain.handle('data:syncAll', async (_event: IpcMainInvokeEvent) => {
    return dataSyncService.syncAll();
  });

  ipcMain.handle('data:getProviderStatus', async (_event: IpcMainInvokeEvent) => {
    return dataSyncService.getProviderStatuses();
  });

  ipcMain.handle('data:importJson', async (_event: IpcMainInvokeEvent, data: { filePath: string }) => {
    try {
      const content = fs.readFileSync(data.filePath, 'utf-8');
      const items = JSON.parse(content) as Array<{
        id: number;
        name: string;
        level: number;
        type: string;
        stats: Array<{ type: string; min: number; max: number }>;
      }>;

      for (const item of items) {
        itemRepo.upsert({
          id: item.id,
          ankamaId: item.id,
          name: item.name,
          level: item.level,
          type: item.type as import('../domain/models/Item').ItemType,
          stats: item.stats.map(s => ({
            type: s.type as StatType,
            min: s.min,
            max: s.max,
          })),
          source: 'static',
        });
      }

      return { success: true, itemsImported: items.length };
    } catch (error) {
      return { success: false, itemsImported: 0, error: String(error) };
    }
  });

  // Settings
  ipcMain.handle('settings:get', (_event: IpcMainInvokeEvent, data: { key: string }) => {
    return settingsRepo.get(data.key);
  });

  ipcMain.handle('settings:set', (_event: IpcMainInvokeEvent, data: { key: string; value: string }) => {
    settingsRepo.set(data.key, data.value);
  });

  // History
  ipcMain.handle('history:getSessions', (_event: IpcMainInvokeEvent) => {
    return historyService.getSessions();
  });

  ipcMain.handle('history:getSession', (_event: IpcMainInvokeEvent, data: { id: string }) => {
    return historyService.getSession(data.id);
  });
}
