import { ForgeService } from '../services/ForgeService';
import { Recommendation } from '../../domain/models/Strategy';

export class GetRecommendation {
  constructor(private forgeService: ForgeService) {}

  execute(sessionId: string): Recommendation {
    return this.forgeService.getRecommendation(sessionId);
  }
}
