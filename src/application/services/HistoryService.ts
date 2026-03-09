import { HistoryRepository } from '../../infrastructure/persistence/repositories/HistoryRepository';
import { ForgeSessionDetail } from '../../shared/types/ipc';

export class HistoryService {
  private historyRepo: HistoryRepository;

  constructor(historyRepo: HistoryRepository) {
    this.historyRepo = historyRepo;
  }

  getSessions(): ForgeSessionDetail[] {
    return this.historyRepo.getSessions();
  }

  getSession(id: string): ForgeSessionDetail | null {
    return this.historyRepo.getSession(id);
  }
}
