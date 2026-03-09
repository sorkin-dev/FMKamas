import { ItemTemplate } from '../../domain/models/Item';
import { ItemRepository } from '../../infrastructure/persistence/repositories/ItemRepository';
import { DataProviderFactory } from '../../infrastructure/providers/DataProviderFactory';
import { ItemNormalizer } from '../../infrastructure/providers/normalizers/ItemNormalizer';
import { SyncResult } from '../../shared/types/ipc';
import { Logger } from '../../infrastructure/logging/Logger';

export class ItemService {
  private itemRepo: ItemRepository;
  private providerFactory: DataProviderFactory;
  private normalizer = new ItemNormalizer();
  private logger = new Logger('ItemService');

  constructor(itemRepo: ItemRepository, providerFactory: DataProviderFactory) {
    this.itemRepo = itemRepo;
    this.providerFactory = providerFactory;
  }

  search(query: string): ItemTemplate[] {
    if (!query.trim()) return [];
    return this.itemRepo.search(query);
  }

  getById(id: number): ItemTemplate | null {
    return this.itemRepo.getById(id);
  }

  async syncFromProvider(providerName?: string): Promise<SyncResult> {
    const provider = providerName
      ? this.providerFactory.getAllProviders().find(p => p.name === providerName)
      : await this.providerFactory.getAvailableProvider();

    if (!provider) {
      return { success: false, itemsSynced: 0, provider: 'none', error: 'Provider not found', syncedAt: new Date() };
    }

    try {
      this.logger.info(`Starting sync from ${provider.name}`);
      const available = await provider.isAvailable();
      if (!available) {
        return { success: false, itemsSynced: 0, provider: provider.name, error: 'Provider unavailable', syncedAt: new Date() };
      }

      const queries = ['anneau', 'cape', 'chapeau', 'bottes', 'ceinture', 'amulette'];
      let synced = 0;

      for (const q of queries) {
        const externalItems = await provider.searchItems(q);
        for (const ext of externalItems.slice(0, 5)) {
          const item = this.normalizer.normalize(ext);
          this.itemRepo.upsert(item);
          synced++;
        }
      }

      return { success: true, itemsSynced: synced, provider: provider.name, syncedAt: new Date() };
    } catch (error) {
      this.logger.error('Sync failed', error);
      return { success: false, itemsSynced: 0, provider: provider.name, error: String(error), syncedAt: new Date() };
    }
  }
}
