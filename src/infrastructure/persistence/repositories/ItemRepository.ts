import { ItemTemplate } from '../../../domain/models/Item';
import { StatRange } from '../../../domain/models/Stat';
import { StatType } from '../../../domain/constants/StatWeights';
import { Logger } from '../../logging/Logger';

// Database interface to avoid importing better-sqlite3 directly in shared code
export interface Database {
  prepare(sql: string): Statement;
  exec(sql: string): void;
}

export interface Statement {
  all(...params: unknown[]): unknown[];
  get(...params: unknown[]): unknown;
  run(...params: unknown[]): { lastInsertRowid: number | bigint; changes: number };
}

export class ItemRepository {
  private db: Database;
  private logger = new Logger('ItemRepository');

  constructor(db: Database) {
    this.db = db;
  }

  search(query: string): ItemTemplate[] {
    const rows = this.db.prepare(
      `SELECT i.*, GROUP_CONCAT(s.stat_type || ':' || s.min_value || ':' || s.max_value) as stats_raw
       FROM items i
       LEFT JOIN item_stats s ON s.item_id = i.id
       WHERE i.name LIKE ?
       GROUP BY i.id
       LIMIT 20`
    ).all(`%${query}%`) as Array<Record<string, unknown>>;

    return rows.map(r => this.mapRow(r));
  }

  getById(id: number): ItemTemplate | null {
    const row = this.db.prepare(
      `SELECT i.*, GROUP_CONCAT(s.stat_type || ':' || s.min_value || ':' || s.max_value) as stats_raw
       FROM items i
       LEFT JOIN item_stats s ON s.item_id = i.id
       WHERE i.id = ?
       GROUP BY i.id`
    ).get(id) as Record<string, unknown> | undefined;

    return row ? this.mapRow(row) : null;
  }

  upsert(item: ItemTemplate): void {
    this.db.prepare(
      `INSERT OR REPLACE INTO items (id, ankama_id, name, level, type, image_url, source, synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      item.id, item.ankamaId ?? item.id, item.name, item.level,
      item.type, item.imageUrl ?? null, item.source, item.syncedAt?.toISOString() ?? null
    );

    for (const stat of item.stats) {
      this.db.prepare(
        `INSERT OR REPLACE INTO item_stats (item_id, stat_type, min_value, max_value)
         VALUES (?, ?, ?, ?)`
      ).run(item.id, stat.type, stat.min, stat.max);
    }
  }

  count(): number {
    const row = this.db.prepare('SELECT COUNT(*) as cnt FROM items').get() as { cnt: number };
    return row.cnt;
  }

  private mapRow(row: Record<string, unknown>): ItemTemplate {
    const statsRaw = (row['stats_raw'] as string) ?? '';
    const stats: StatRange[] = statsRaw
      ? statsRaw.split(',').map(s => {
          const [type, min, max] = s.split(':');
          return { type: type as StatType, min: Number(min), max: Number(max) };
        })
      : [];

    return {
      id: Number(row['id']),
      ankamaId: row['ankama_id'] ? Number(row['ankama_id']) : undefined,
      name: String(row['name']),
      level: Number(row['level']),
      type: String(row['type']) as ItemTemplate['type'],
      imageUrl: row['image_url'] ? String(row['image_url']) : undefined,
      stats,
      source: (row['source'] as 'static' | 'api') ?? 'static',
      syncedAt: row['synced_at'] ? new Date(String(row['synced_at'])) : undefined,
    };
  }
}
