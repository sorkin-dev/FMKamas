import { ForgeService } from '../services/ForgeService';
import { ForgeSession } from '../../domain/models/Forge';
import { StatLine } from '../../domain/models/Stat';

export class StartForgeSession {
  constructor(private forgeService: ForgeService) {}

  execute(itemId: number, targetStats: StatLine[]): ForgeSession {
    return this.forgeService.startSession(itemId, targetStats);
  }
}
