import { IDataProvider } from './IDataProvider';
import { DofusdudeProvider } from './DofusdudeProvider';
import { StaticJsonProvider } from './StaticJsonProvider';
import { Logger } from '../logging/Logger';

export class DataProviderFactory {
  private providers: IDataProvider[];
  private logger = new Logger('DataProviderFactory');

  constructor(dataDir: string) {
    this.providers = [
      new DofusdudeProvider(),
      new StaticJsonProvider(dataDir),
    ];
  }

  async getAvailableProvider(): Promise<IDataProvider> {
    for (const provider of this.providers) {
      const available = await provider.isAvailable();
      if (available) {
        this.logger.info(`Using provider: ${provider.name}`);
        return provider;
      }
    }
    // Return last provider as fallback (StaticJSON)
    this.logger.warn('No provider available, using fallback');
    return this.providers[this.providers.length - 1];
  }

  getAllProviders(): IDataProvider[] {
    return [...this.providers];
  }
}
