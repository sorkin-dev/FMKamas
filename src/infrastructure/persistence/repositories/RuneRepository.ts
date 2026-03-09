import { Rune } from '../../../domain/models/Rune';
import { StatType } from '../../../domain/constants/StatWeights';
import { RuneTier } from '../../../domain/constants/RuneWeights';
import { Database } from './ItemRepository';
import { Logger } from '../../logging/Logger';

export class RuneRepository {
  private db: Database;
  private logger = new Logger('RuneRepository');

  constructor(db: Database) {
    this.db = db;
  }

  getAll(): Rune[] {
    const rows = this.db.prepare('SELECT * FROM runes ORDER BY stat_type, tier').all() as Array<Record<string, unknown>>;
    return rows.map(r => this.mapRow(r));
  }

  getByStatType(statType: StatType): Rune[] {
    const rows = this.db.prepare('SELECT * FROM runes WHERE stat_type = ?').all(statType) as Array<Record<string, unknown>>;
    return rows.map(r => this.mapRow(r));
  }

  getById(id: number): Rune | null {
    const row = this.db.prepare('SELECT * FROM runes WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    return row ? this.mapRow(row) : null;
  }

  insert(rune: Omit<Rune, 'id'>): Rune {
    const result = this.db.prepare(
      'INSERT INTO runes (name, stat_type, tier, stat_value, weight, default_price) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(rune.name, rune.statType, rune.tier, rune.statValue, rune.weight, rune.defaultPrice ?? 0);
    return { ...rune, id: Number(result.lastInsertRowid) };
  }

  isEmpty(): boolean {
    const row = this.db.prepare('SELECT COUNT(*) as cnt FROM runes').get() as { cnt: number };
    return row.cnt === 0;
  }

  private mapRow(row: Record<string, unknown>): Rune {
    return {
      id: Number(row['id']),
      name: String(row['name']),
      statType: String(row['stat_type']) as StatType,
      tier: String(row['tier']) as RuneTier,
      statValue: Number(row['stat_value']),
      weight: Number(row['weight']),
      defaultPrice: Number(row['default_price']),
    };
  }
}
