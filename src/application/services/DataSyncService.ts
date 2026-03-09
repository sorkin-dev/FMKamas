import { DataProviderFactory } from '../../infrastructure/providers/DataProviderFactory';
import { SyncResult, ProviderStatus } from '../../shared/types/ipc';
import { Logger } from '../../infrastructure/logging/Logger';

export class DataSyncService {
  private providerFactory: DataProviderFactory;
  private logger = new Logger('DataSyncService');

  constructor(providerFactory: DataProviderFactory) {
    this.providerFactory = providerFactory;
  }

  async getProviderStatuses(): Promise<ProviderStatus[]> {
    const providers = this.providerFactory.getAllProviders();
    const statuses: ProviderStatus[] = [];

    for (const provider of providers) {
      const available = await provider.isAvailable();
      statuses.push({
        name: provider.name,
        available,
        lastChecked: new Date(),
      });
    }

    return statuses;
  }

  async syncAll(): Promise<SyncResult> {
    try {
      const provider = await this.providerFactory.getAvailableProvider();
      return {
        success: true,
        itemsSynced: 0,
        provider: provider.name,
        syncedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Sync failed', error);
      return {
        success: false,
        itemsSynced: 0,
        provider: 'none',
        error: String(error),
        syncedAt: new Date(),
      };
    }
  }
}
