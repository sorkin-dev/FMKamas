import { IDataProvider } from './IDataProvider';
import { ExternalItem } from '../../shared/types/api';
import { CacheManager } from '../cache/CacheManager';
import { Logger } from '../logging/Logger';

const BASE_URL = 'https://api.dofusdu.de/dofus3/v1/fr';
const TIMEOUT_MS = 10000;

export class DofusdudeProvider implements IDataProvider {
  name = 'Dofusdude';
  private cache = new CacheManager(86400);
  private logger = new Logger('DofusdudeProvider');

  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${BASE_URL}/items/equipment?limit=1`, { signal: controller.signal });
      clearTimeout(timer);
      return res.ok;
    } catch {
      return false;
    }
  }

  async searchItems(query: string): Promise<ExternalItem[]> {
    const cacheKey = `search:${query}`;
    const cached = this.cache.get<ExternalItem[]>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${BASE_URL}/items/equipment/search?query=${encodeURIComponent(query)}&limit=10`;
      const result = await this.fetchWithTimeout<ExternalItem[]>(url);
      const items = Array.isArray(result) ? result : [];
      this.cache.set(cacheKey, items);
      return items;
    } catch (error) {
      this.logger.warn('Search failed', error);
      return [];
    }
  }

  async getItemById(id: number): Promise<ExternalItem | null> {
    const cacheKey = `item:${id}`;
    const cached = this.cache.get<ExternalItem>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${BASE_URL}/items/equipment/${id}`;
      const item = await this.fetchWithTimeout<ExternalItem>(url);
      if (item) this.cache.set(cacheKey, item);
      return item;
    } catch (error) {
      this.logger.warn(`Failed to get item ${id}`, error);
      return null;
    }
  }

  async getLastUpdateDate(): Promise<Date | null> {
    return null;
  }

  private async fetchWithTimeout<T>(url: string): Promise<T | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      clearTimeout(timer);
      return null;
    }
  }
}
