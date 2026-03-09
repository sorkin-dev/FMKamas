export interface AppConfig {
  databasePath: string;
  dataDirectory: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  apiTimeout: number;
  cacheDirectory: string;
  defaultRunePrices: Record<string, number>;
}

export const DEFAULT_CONFIG: AppConfig = {
  databasePath: 'fmkamas.db',
  dataDirectory: 'data',
  logLevel: 'info',
  apiTimeout: 10000,
  cacheDirectory: 'cache',
  defaultRunePrices: {
    PA_VITALITY: 10,
    VITALITY: 20,
    RA_VITALITY: 50,
    PA_STRENGTH: 80,
    STRENGTH: 200,
    RA_STRENGTH: 600,
    PA_INTELLIGENCE: 80,
    INTELLIGENCE: 200,
    RA_INTELLIGENCE: 600,
    PA_CHANCE: 80,
    CHANCE: 200,
    RA_CHANCE: 600,
    PA_AGILITY: 80,
    AGILITY: 200,
    RA_AGILITY: 600,
    PA_WISDOM: 500,
    WISDOM: 1500,
    RA_WISDOM: 5000,
    PA_AP: 50000,
    AP: 150000,
    RA_AP: 500000,
    PA_MP: 30000,
    MP: 100000,
    RA_MP: 300000,
    PA_RANGE: 10000,
    RANGE: 30000,
    RA_RANGE: 100000,
  },
};
