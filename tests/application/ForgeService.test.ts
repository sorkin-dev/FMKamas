import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForgeService } from '../../src/application/services/ForgeService';
import { StatType } from '../../src/domain/constants/StatWeights';
import { StatLine } from '../../src/domain/models/Stat';
import { ItemTemplate } from '../../src/domain/models/Item';
import { Rune } from '../../src/domain/models/Rune';
import { RuneTier } from '../../src/domain/constants/RuneWeights';

const testItem: ItemTemplate = {
  id: 1,
  name: 'Gelano',
  level: 60,
  type: 'Anneau',
  stats: [
    { type: StatType.STRENGTH, min: 16, max: 25 },
    { type: StatType.VITALITY, min: 31, max: 50 },
  ],
  source: 'static',
};

const testRune: Rune = {
  id: 1,
  name: 'Fo',
  statType: StatType.STRENGTH,
  tier: RuneTier.STANDARD,
  statValue: 3,
  weight: 3,
  defaultPrice: 200,
};

function makeHistoryRepo() {
  return {
    createSession: vi.fn(),
    updateSession: vi.fn(),
    addAttempt: vi.fn().mockReturnValue(1),
    getSessions: vi.fn().mockReturnValue([]),
    getSession: vi.fn().mockReturnValue(null),
  };
}

function makeRuneRepo(rune: Rune | null = null) {
  return {
    getAll: vi.fn().mockReturnValue(rune ? [rune] : []),
    getByStatType: vi.fn().mockReturnValue([]),
    getById: vi.fn().mockReturnValue(rune),
    insert: vi.fn(),
    isEmpty: vi.fn().mockReturnValue(false),
  };
}

function makeItemRepo(item: ItemTemplate | null = null) {
  return {
    getById: vi.fn().mockReturnValue(item),
    search: vi.fn().mockReturnValue([]),
    upsert: vi.fn(),
    count: vi.fn().mockReturnValue(0),
  };
}

describe('ForgeService', () => {
  let service: ForgeService;

  beforeEach(() => {
    service = new ForgeService(
      makeHistoryRepo() as any,
      makeRuneRepo(testRune) as any,
      makeItemRepo(testItem) as any,
    );
  });

  it('starts a forge session', () => {
    const targetStats: StatLine[] = [{ type: StatType.STRENGTH, value: 25 }];
    const session = service.startSession(1, targetStats);

    expect(session).toBeDefined();
    expect(session.id).toBeDefined();
    expect(session.itemId).toBe(1);
    expect(session.status).toBe('active');
    expect(session.targetStats).toEqual(targetStats);
  });

  it('applies a rune to a session', () => {
    const targetStats: StatLine[] = [{ type: StatType.STRENGTH, value: 25 }];
    const session = service.startSession(1, targetStats);
    const statChanges = JSON.stringify([{ statType: 'STRENGTH', before: 16, after: 19, delta: 3 }]);

    const attempt = service.applyRune(session.id, 1, 'SUCCESS', statChanges);

    expect(attempt).toBeDefined();
    expect(attempt.outcome).toBe('SUCCESS');
    expect(attempt.rune.id).toBe(1);
  });

  it('handles applying rune to unknown session gracefully', () => {
    const statChanges = JSON.stringify([]);
    expect(() => service.applyRune('nonexistent', 1, 'SUCCESS', statChanges)).not.toThrow();
  });

  it('gets recommendation for an active session', () => {
    const targetStats: StatLine[] = [{ type: StatType.STRENGTH, value: 25 }];
    const session = service.startSession(1, targetStats);

    const rec = service.getRecommendation(session.id);
    expect(rec).toBeDefined();
    expect(rec.action).toBeDefined();
    expect(rec.reasoning).toBeDefined();
  });

  it('throws error when getting recommendation for unknown session', () => {
    expect(() => service.getRecommendation('nonexistent')).toThrow();
  });
});
