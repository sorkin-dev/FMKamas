import { ItemTemplate, ItemType } from '../../../domain/models/Item';
import { ExternalItem } from '../../../shared/types/api';
import { StatNormalizer } from './StatNormalizer';
import { StatRange } from '../../../domain/models/Stat';

const ITEM_TYPE_MAP: Record<string, ItemType> = {
  'anneau': 'Anneau',
  'amulette': 'Amulette',
  'ceinture': 'Ceinture',
  'bottes': 'Bottes',
  'cape': 'Cape',
  'chapeau': 'Chapeau',
  'dagues': 'Dagues',
  'épée': 'Épée',
  'baguette': 'Baguette',
  'arc': 'Arc',
  'marteau': 'Marteau',
  'pelle': 'Pelle',
  'faux': 'Faux',
  'bouclier': 'Bouclier',
  'familier': 'Familier',
};

export class ItemNormalizer {
  private statNormalizer = new StatNormalizer();

  normalize(external: ExternalItem): ItemTemplate {
    const stats = this.normalizeStats(external.effects ?? []);
    const typeName = external.type?.name?.toLowerCase() ?? '';
    const itemType: ItemType = ITEM_TYPE_MAP[typeName] ?? 'Anneau';

    return {
      id: external.ankama_id,
      ankamaId: external.ankama_id,
      name: external.name,
      level: external.level,
      type: itemType,
      imageUrl: external.image_urls?.icon,
      stats,
      source: 'api',
      syncedAt: new Date(),
    };
  }

  private normalizeStats(effects: ExternalItem['effects']): StatRange[] {
    if (!effects) return [];
    const stats: StatRange[] = [];

    for (const effect of effects) {
      if (!effect.type?.name) continue;
      const statType = this.statNormalizer.normalize(effect.type.name);
      if (!statType) continue;

      stats.push({
        type: statType,
        min: effect.int_minimum ?? 0,
        max: effect.int_maximum ?? 0,
      });
    }

    return stats;
  }
}
