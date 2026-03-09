import { ForgeSession, ForgeAttempt, ForgeOutcome, StatChange } from '../../domain/models/Forge';
import { StatLine } from '../../domain/models/Stat';
import { StatType } from '../../domain/constants/StatWeights';
import { Recommendation } from '../../domain/models/Strategy';
import { HistoryRepository } from '../../infrastructure/persistence/repositories/HistoryRepository';
import { RuneRepository } from '../../infrastructure/persistence/repositories/RuneRepository';
import { ItemRepository } from '../../infrastructure/persistence/repositories/ItemRepository';
import { DecisionEngine, DecisionContext } from '../../domain/engine/DecisionEngine';
import { SinkEngine } from '../../domain/engine/SinkEngine';
import { Logger } from '../../infrastructure/logging/Logger';

function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class ForgeService {
  private historyRepo: HistoryRepository;
  private runeRepo: RuneRepository;
  private itemRepo: ItemRepository;
  private decisionEngine = new DecisionEngine();
  private sinkEngine = new SinkEngine();
  private logger = new Logger('ForgeService');
  private activeSessions = new Map<string, ForgeSession>();

  constructor(historyRepo: HistoryRepository, runeRepo: RuneRepository, itemRepo: ItemRepository) {
    this.historyRepo = historyRepo;
    this.runeRepo = runeRepo;
    this.itemRepo = itemRepo;
  }

  startSession(itemId: number, targetStats: StatLine[]): ForgeSession {
    const item = this.itemRepo.getById(itemId);
    const currentStats: StatLine[] = item
      ? item.stats.map(s => ({ type: s.type, value: s.min }))
      : [];

    const session: ForgeSession = {
      id: uuidv4(),
      itemId,
      startedAt: new Date(),
      targetStats,
      currentStats,
      attempts: [],
      status: 'active',
    };

    this.historyRepo.createSession(session);
    this.activeSessions.set(session.id, session);
    return session;
  }

  applyRune(sessionId: string, runeId: number, outcome: ForgeOutcome, statChangesJson: string): ForgeAttempt {
    const session = this.activeSessions.get(sessionId);
    const rune = this.runeRepo.getById(runeId);

    if (!rune) throw new Error(`Rune ${runeId} not found`);

    const item = session ? this.itemRepo.getById(session.itemId) : null;
    const maxStats: Record<StatType, number> = {} as Record<StatType, number>;
    if (item) {
      for (const s of item.stats) maxStats[s.type] = s.max;
    }

    const currentStats = session?.currentStats ?? [];
    const sinkBefore = this.sinkEngine.calculateSink(currentStats, maxStats);

    const statChanges: StatChange[] = JSON.parse(statChangesJson) as StatChange[];

    if (session) {
      for (const change of statChanges) {
        const idx = session.currentStats.findIndex(s => s.type === change.statType);
        if (idx >= 0) {
          session.currentStats[idx].value = change.after;
        } else {
          session.currentStats.push({ type: change.statType as StatType, value: change.after });
        }
      }
      this.historyRepo.updateSession(sessionId, { currentStats: session.currentStats });
    }

    const newStats = session?.currentStats ?? currentStats;
    const sinkAfter = this.sinkEngine.calculateSink(newStats, maxStats);

    const attempt: Omit<ForgeAttempt, 'id'> = {
      sessionId,
      rune,
      outcome,
      statChanges,
      sinkBefore,
      sinkAfter,
      timestamp: new Date(),
    };

    const id = this.historyRepo.addAttempt(attempt);
    const fullAttempt = { ...attempt, id };

    if (session) {
      session.attempts.push(fullAttempt);
    }

    return fullAttempt;
  }

  getRecommendation(sessionId: string): Recommendation {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const item = this.itemRepo.getById(session.itemId);
    const maxStats: Record<StatType, number> = {} as Record<StatType, number>;
    if (item) {
      for (const s of item.stats) maxStats[s.type] = s.max;
    }

    const allRunes = this.runeRepo.getAll();
    const availableSink = this.sinkEngine.calculateSink(session.currentStats, maxStats);

    const context: DecisionContext = {
      currentStats: session.currentStats,
      targetStats: session.targetStats,
      maxStats,
      availableRunes: allRunes,
      availableSink,
      sessionAttempts: session.attempts.length,
      runePrices: {},
    };

    return this.decisionEngine.getRecommendation(context);
  }

  getSession(id: string): ForgeSession | undefined {
    return this.activeSessions.get(id);
  }
}
