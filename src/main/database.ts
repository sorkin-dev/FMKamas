import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { INITIAL_MIGRATION } from '../infrastructure/persistence/migrations/001_initial';
import { STAT_WEIGHTS, StatType } from '../domain/constants/StatWeights';
import { RuneTier, RUNE_STAT_VALUES } from '../domain/constants/RuneWeights';

export function setupDatabase(dataDir: string): Database.Database {
  const dbPath = path.join(dataDir, 'fmkamas.db');
  // Ensure data dir exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Run migrations
  db.exec(INITIAL_MIGRATION);

  // Seed runes if empty
  const runeCount = (db.prepare('SELECT COUNT(*) as cnt FROM runes').get() as { cnt: number }).cnt;
  if (runeCount === 0) {
    seedRunes(db);
  }

  // Seed items if empty
  const itemCount = (db.prepare('SELECT COUNT(*) as cnt FROM items').get() as { cnt: number }).cnt;
  if (itemCount === 0) {
    seedItems(db, dataDir);
  }

  return db;
}

function seedRunes(db: Database.Database): void {
  const insert = db.prepare(
    'INSERT INTO runes (name, stat_type, tier, stat_value, weight, default_price) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const insertMany = db.transaction(() => {
    for (const [statTypeStr, baseWeight] of Object.entries(STAT_WEIGHTS)) {
      const statType = statTypeStr as StatType;

      // Exotic stats only get EXOTIC tier runes
      if ([StatType.AP, StatType.MP, StatType.RANGE, StatType.SUMMONS].includes(statType)) {
        // Also include standard tiers for normal use
        for (const tier of [RuneTier.PA, RuneTier.STANDARD, RuneTier.RA]) {
          const statValue = RUNE_STAT_VALUES[tier];
          const weight = statValue * baseWeight;
          const name = buildRuneName(statType, tier);
          const price = estimatePrice(statType, tier);
          insert.run(name, statType, tier, statValue, weight, price);
        }
      } else {
        for (const tier of [RuneTier.PA, RuneTier.STANDARD, RuneTier.RA]) {
          const statValue = RUNE_STAT_VALUES[tier];
          const weight = statValue * baseWeight;
          const name = buildRuneName(statType, tier);
          const price = estimatePrice(statType, tier);
          insert.run(name, statType, tier, statValue, weight, price);
        }
      }
    }
  });

  insertMany();
}

function buildRuneName(statType: StatType, tier: RuneTier): string {
  const shortNames: Partial<Record<StatType, string>> = {
    [StatType.VITALITY]: 'Vita',
    [StatType.WISDOM]: 'Sag',
    [StatType.STRENGTH]: 'Fo',
    [StatType.INTELLIGENCE]: 'Int',
    [StatType.CHANCE]: 'Cha',
    [StatType.AGILITY]: 'Agi',
    [StatType.AP]: 'PA',
    [StatType.MP]: 'PM',
    [StatType.RANGE]: 'Po',
    [StatType.SUMMONS]: 'Invoc',
    [StatType.CRITICAL_HITS]: 'CC',
    [StatType.HEALS]: 'Soin',
    [StatType.INITIATIVE]: 'Init',
    [StatType.PROSPECTING]: 'Prosp',
    [StatType.POWER]: 'Puiss',
    [StatType.DODGE]: 'Esq',
    [StatType.LOCK]: 'Tac',
    [StatType.AP_REDUCTION]: 'RetPA',
    [StatType.MP_REDUCTION]: 'RetPM',
    [StatType.AP_RESISTANCE]: 'RésRetPA',
    [StatType.MP_RESISTANCE]: 'RésRetPM',
    [StatType.NEUTRAL_DAMAGE]: 'DomNe',
    [StatType.EARTH_DAMAGE]: 'DomTe',
    [StatType.FIRE_DAMAGE]: 'DomFe',
    [StatType.WATER_DAMAGE]: 'DomEa',
    [StatType.AIR_DAMAGE]: 'DomAi',
    [StatType.NEUTRAL_RESISTANCE_PERCENT]: '%RésNe',
    [StatType.EARTH_RESISTANCE_PERCENT]: '%RésTe',
    [StatType.FIRE_RESISTANCE_PERCENT]: '%RésFe',
    [StatType.WATER_RESISTANCE_PERCENT]: '%RésEa',
    [StatType.AIR_RESISTANCE_PERCENT]: '%RésAi',
    [StatType.NEUTRAL_RESISTANCE_FIXED]: 'RésNe',
    [StatType.EARTH_RESISTANCE_FIXED]: 'RésTe',
    [StatType.FIRE_RESISTANCE_FIXED]: 'RésFe',
    [StatType.WATER_RESISTANCE_FIXED]: 'RésEa',
    [StatType.AIR_RESISTANCE_FIXED]: 'RésAi',
    [StatType.PUSH_DAMAGE]: 'DomPo',
    [StatType.PUSH_RESISTANCE]: 'RésPo',
    [StatType.CRITICAL_DAMAGE]: 'DomCC',
    [StatType.CRITICAL_RESISTANCE]: 'RésCC',
    [StatType.MELEE_DAMAGE]: 'DomMê',
    [StatType.RANGED_DAMAGE]: 'DomDi',
    [StatType.WEAPON_DAMAGE]: 'DomArm',
    [StatType.SPELL_DAMAGE]: 'DomSo',
    [StatType.PODS]: 'Pods',
    [StatType.TRAP_DAMAGE]: 'DomPi',
    [StatType.TRAP_POWER]: 'PuissP',
  };

  const short = shortNames[statType] ?? statType.substring(0, 4);
  switch (tier) {
    case RuneTier.PA: return `Pa ${short}`;
    case RuneTier.STANDARD: return short;
    case RuneTier.RA: return `Ra ${short}`;
    default: return short;
  }
}

function estimatePrice(statType: StatType, tier: RuneTier): number {
  const basePrice: Partial<Record<StatType, number>> = {
    [StatType.VITALITY]: 10,
    [StatType.WISDOM]: 500,
    [StatType.STRENGTH]: 80,
    [StatType.INTELLIGENCE]: 80,
    [StatType.CHANCE]: 80,
    [StatType.AGILITY]: 80,
    [StatType.AP]: 50000,
    [StatType.MP]: 30000,
    [StatType.RANGE]: 10000,
    [StatType.SUMMONS]: 5000,
    [StatType.CRITICAL_HITS]: 1000,
    [StatType.HEALS]: 500,
    [StatType.INITIATIVE]: 10,
    [StatType.PROSPECTING]: 300,
    [StatType.POWER]: 200,
    [StatType.DODGE]: 400,
    [StatType.LOCK]: 400,
  };

  const base = basePrice[statType] ?? 100;
  switch (tier) {
    case RuneTier.PA: return base;
    case RuneTier.STANDARD: return base * 3;
    case RuneTier.RA: return base * 10;
    default: return base;
  }
}

function seedItems(db: Database.Database, dataDir: string): void {
  const seedPath = path.join(dataDir, 'seeds', 'items.json');
  if (!fs.existsSync(seedPath)) return;

  try {
    const content = fs.readFileSync(seedPath, 'utf-8');
    const items = JSON.parse(content) as Array<{
      id: number;
      name: string;
      level: number;
      type: string;
      stats: Array<{ type: string; min: number; max: number }>;
    }>;

    const insertItem = db.prepare(
      'INSERT OR IGNORE INTO items (id, ankama_id, name, level, type, source) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const insertStat = db.prepare(
      'INSERT OR IGNORE INTO item_stats (item_id, stat_type, min_value, max_value) VALUES (?, ?, ?, ?)'
    );

    const insertAll = db.transaction(() => {
      for (const item of items) {
        insertItem.run(item.id, item.id, item.name, item.level, item.type, 'static');
        for (const stat of item.stats) {
          insertStat.run(item.id, stat.type, stat.min, stat.max);
        }
      }
    });

    insertAll();
  } catch (error) {
    console.error('Failed to seed items:', error);
  }
}
