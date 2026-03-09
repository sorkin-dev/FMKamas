import { ItemService } from '../services/ItemService';
import { SyncResult } from '../../shared/types/ipc';

export class SyncItemData {
  constructor(private itemService: ItemService) {}

  async execute(providerName?: string): Promise<SyncResult> {
    return this.itemService.syncFromProvider(providerName);
  }
}
