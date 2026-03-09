import * as fs from 'fs';
import * as path from 'path';
import { IDataProvider } from './IDataProvider';
import { ExternalItem } from '../../shared/types/api';
import { Logger } from '../logging/Logger';

export class StaticJsonProvider implements IDataProvider {
  name = 'StaticJSON';
  private dataDir: string;
  private logger = new Logger('StaticJsonProvider');
  private items: ExternalItem[] = [];
  private loaded = false;

  constructor(dataDir: string) {
    this.dataDir = dataDir;
  }

  async isAvailable(): Promise<boolean> {
    const filePath = path.join(this.dataDir, 'seeds', 'items.json');
    return fs.existsSync(filePath);
  }

  async searchItems(query: string): Promise<ExternalItem[]> {
    await this.ensureLoaded();
    const lowerQuery = query.toLowerCase();
    return this.items.filter(item =>
      item.name.toLowerCase().includes(lowerQuery)
    );
  }

  async getItemById(id: number): Promise<ExternalItem | null> {
    await this.ensureLoaded();
    return this.items.find(item => item.ankama_id === id) ?? null;
  }

  async getLastUpdateDate(): Promise<Date | null> {
    const filePath = path.join(this.dataDir, 'seeds', 'items.json');
    try {
      const stat = fs.statSync(filePath);
      return stat.mtime;
    } catch {
      return null;
    }
  }

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;
    const filePath = path.join(this.dataDir, 'seeds', 'items.json');
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content) as ExternalItem[] | { items: ExternalItem[] };
      this.items = Array.isArray(data) ? data : (data as { items: ExternalItem[] }).items ?? [];
      this.loaded = true;
      this.logger.info(`Loaded ${this.items.length} items from static JSON`);
    } catch (error) {
      this.logger.error('Failed to load static items', error);
      this.items = [];
    }
  }
}
