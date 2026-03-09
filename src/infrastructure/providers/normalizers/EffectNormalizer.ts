import { StatRange } from '../../../domain/models/Stat';
import { ExternalItemEffect } from '../../../shared/types/api';
import { StatNormalizer } from './StatNormalizer';

export class EffectNormalizer {
  private statNormalizer = new StatNormalizer();

  normalizeEffect(effect: ExternalItemEffect): StatRange | null {
    const statType = this.statNormalizer.normalize(effect.type?.name ?? '');
    if (!statType) return null;

    return {
      type: statType,
      min: effect.int_minimum ?? 0,
      max: effect.int_maximum ?? 0,
    };
  }

  normalizeEffects(effects: ExternalItemEffect[]): StatRange[] {
    return effects
      .map(e => this.normalizeEffect(e))
      .filter((e): e is StatRange => e !== null);
  }
}
