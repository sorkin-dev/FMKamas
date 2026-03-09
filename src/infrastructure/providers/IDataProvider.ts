import { ExternalItem } from '../../shared/types/api';

export interface IDataProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  searchItems(query: string): Promise<ExternalItem[]>;
  getItemById(id: number): Promise<ExternalItem | null>;
  getLastUpdateDate(): Promise<Date | null>;
}
