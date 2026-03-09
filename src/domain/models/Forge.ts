import { Rune } from './Rune';
import { StatLine } from './Stat';

export type ForgeOutcome = 'SUCCESS' | 'FAILURE' | 'CRITICAL_SUCCESS';

export interface StatChange {
  statType: string;
  before: number;
  after: number;
  delta: number;
}

export interface ForgeAttempt {
  id: number;
  sessionId: string;
  rune: Rune;
  outcome: ForgeOutcome;
  statChanges: StatChange[];
  sinkBefore: number;
  sinkAfter: number;
  timestamp: Date;
}

export interface ForgeSession {
  id: string;
  itemId: number;
  startedAt: Date;
  endedAt?: Date;
  targetStats: StatLine[];
  currentStats: StatLine[];
  attempts: ForgeAttempt[];
  status: 'active' | 'completed' | 'abandoned';
}

export interface ForgeResult {
  attempt: ForgeAttempt;
  newStats: StatLine[];
  newSink: number;
  recommendation?: unknown;
}
