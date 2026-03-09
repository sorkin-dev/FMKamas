import { StatRange, StatLine } from './Stat';

export type ItemType =
  | 'Anneau' | 'Amulette' | 'Ceinture' | 'Bottes' | 'Cape'
  | 'Chapeau' | 'Dagues' | 'Épée' | 'Baguette' | 'Arc'
  | 'Marteau' | 'Pelle' | 'Faux' | 'Bouclier' | 'Familier';

export interface ItemTemplate {
  id: number;
  ankamaId?: number;
  name: string;
  level: number;
  type: ItemType;
  imageUrl?: string;
  stats: StatRange[];
  source: 'static' | 'api';
  syncedAt?: Date;
}

export interface ItemInstance {
  templateId: number;
  template: ItemTemplate;
  currentStats: StatLine[];
  sessionId?: string;
}
