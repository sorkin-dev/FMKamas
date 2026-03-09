import { ForgeService } from '../services/ForgeService';
import { ForgeAttempt, ForgeOutcome } from '../../domain/models/Forge';

export class ApplyRune {
  constructor(private forgeService: ForgeService) {}

  execute(sessionId: string, runeId: number, outcome: ForgeOutcome, statChangesJson: string): ForgeAttempt {
    return this.forgeService.applyRune(sessionId, runeId, outcome, statChangesJson);
  }
}
