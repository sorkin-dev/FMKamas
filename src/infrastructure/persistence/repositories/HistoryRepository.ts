import { ForgeSession, ForgeAttempt, ForgeOutcome, StatChange } from '../../../domain/models/Forge';
import { StatLine } from '../../../domain/models/Stat';
import { StatType } from '../../../domain/constants/StatWeights';
import { Database } from './ItemRepository';
import { RuneRepository } from './RuneRepository';
import { ForgeSessionDetail } from '../../../shared/types/ipc';
import { Logger } from '../../logging/Logger';

export class HistoryRepository {
  private db: Database;
  private runeRepo: RuneRepository;
  private logger = new Logger('HistoryRepository');

  constructor(db: Database) {
    this.db = db;
    this.runeRepo = new RuneRepository(db);
  }

  createSession(session: Omit<ForgeSession, 'attempts'>): void {
    this.db.prepare(
      `INSERT INTO forge_sessions (id, item_id, started_at, ended_at, target_stats, current_stats, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      session.id, session.itemId, session.startedAt.toISOString(),
      session.endedAt?.toISOString() ?? null,
      JSON.stringify(session.targetStats), JSON.stringify(session.currentStats), session.status
    );
  }

  updateSession(id: string, updates: Partial<ForgeSession>): void {
    if (updates.status !== undefined) {
      this.db.prepare('UPDATE forge_sessions SET status = ?, ended_at = ? WHERE id = ?')
        .run(updates.status, updates.endedAt?.toISOString() ?? null, id);
    }
    if (updates.currentStats !== undefined) {
      this.db.prepare('UPDATE forge_sessions SET current_stats = ? WHERE id = ?')
        .run(JSON.stringify(updates.currentStats), id);
    }
  }

  addAttempt(attempt: Omit<ForgeAttempt, 'id'>): number {
    const result = this.db.prepare(
      `INSERT INTO forge_attempts (session_id, rune_id, success, stat_changes, sink_before, sink_after, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      attempt.sessionId, attempt.rune.id, attempt.outcome === 'SUCCESS' ? 1 : 0,
      JSON.stringify(attempt.statChanges), attempt.sinkBefore, attempt.sinkAfter,
      attempt.timestamp.toISOString()
    );
    return Number(result.lastInsertRowid);
  }

  getSessions(): ForgeSessionDetail[] {
    const rows = this.db.prepare(
      `SELECT fs.*, i.name as item_name,
              (SELECT COUNT(*) FROM forge_attempts fa WHERE fa.session_id = fs.id) as attempts_count
       FROM forge_sessions fs
       LEFT JOIN items i ON i.id = fs.item_id
       ORDER BY fs.started_at DESC`
    ).all() as Array<Record<string, unknown>>;

    return rows.map(r => ({
      id: String(r['id']),
      itemId: Number(r['item_id']),
      startedAt: new Date(String(r['started_at'])),
      endedAt: r['ended_at'] ? new Date(String(r['ended_at'])) : undefined,
      targetStats: JSON.parse(String(r['target_stats'] ?? '[]')) as StatLine[],
      currentStats: JSON.parse(String(r['current_stats'] ?? '[]')) as StatLine[],
      attempts: [],
      status: String(r['status']) as ForgeSession['status'],
      itemName: String(r['item_name'] ?? 'Inconnu'),
      attemptsCount: Number(r['attempts_count']),
    }));
  }

  getSession(id: string): ForgeSessionDetail | null {
    const row = this.db.prepare(
      `SELECT fs.*, i.name as item_name FROM forge_sessions fs
       LEFT JOIN items i ON i.id = fs.item_id WHERE fs.id = ?`
    ).get(id) as Record<string, unknown> | undefined;

    if (!row) return null;

    const attemptRows = this.db.prepare(
      'SELECT * FROM forge_attempts WHERE session_id = ? ORDER BY created_at ASC'
    ).all(id) as Array<Record<string, unknown>>;

    const attempts: ForgeAttempt[] = attemptRows.flatMap(a => {
      const rune = this.runeRepo.getById(Number(a['rune_id']));
      if (!rune) return [];
      return [{
        id: Number(a['id']),
        sessionId: String(a['session_id']),
        rune,
        outcome: (Number(a['success']) === 1 ? 'SUCCESS' : 'FAILURE') as ForgeOutcome,
        statChanges: JSON.parse(String(a['stat_changes'] ?? '[]')) as StatChange[],
        sinkBefore: Number(a['sink_before']),
        sinkAfter: Number(a['sink_after']),
        timestamp: new Date(String(a['created_at'])),
      }];
    });

    return {
      id: String(row['id']),
      itemId: Number(row['item_id']),
      startedAt: new Date(String(row['started_at'])),
      endedAt: row['ended_at'] ? new Date(String(row['ended_at'])) : undefined,
      targetStats: JSON.parse(String(row['target_stats'] ?? '[]')) as StatLine[],
      currentStats: JSON.parse(String(row['current_stats'] ?? '[]')) as StatLine[],
      attempts,
      status: String(row['status']) as ForgeSession['status'],
      itemName: String(row['item_name'] ?? 'Inconnu'),
      attemptsCount: attempts.length,
    };
  }
}
