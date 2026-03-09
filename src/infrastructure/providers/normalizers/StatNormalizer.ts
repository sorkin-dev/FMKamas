import { StatType } from '../../../domain/constants/StatWeights';

const STAT_NAME_MAP: Record<string, StatType> = {
  // French names from Dofusdude API
  'vitalité': StatType.VITALITY,
  'points de vie': StatType.VITALITY,
  'pv': StatType.VITALITY,
  'sagesse': StatType.WISDOM,
  'force': StatType.STRENGTH,
  'intelligence': StatType.INTELLIGENCE,
  'chance': StatType.CHANCE,
  'agilité': StatType.AGILITY,
  'pa': StatType.AP,
  'points d\'action': StatType.AP,
  'pm': StatType.MP,
  'points de mouvement': StatType.MP,
  'portée': StatType.RANGE,
  'invocations': StatType.SUMMONS,
  'invocation': StatType.SUMMONS,
  'coups critiques': StatType.CRITICAL_HITS,
  'cc': StatType.CRITICAL_HITS,
  'soins': StatType.HEALS,
  'initiative': StatType.INITIATIVE,
  'prospection': StatType.PROSPECTING,
  'puissance': StatType.POWER,
  'esquive': StatType.DODGE,
  'tacle': StatType.LOCK,
  'retrait pa': StatType.AP_REDUCTION,
  'retrait pm': StatType.MP_REDUCTION,
  'résistance aux retraits pa': StatType.AP_RESISTANCE,
  'résistance aux retraits pm': StatType.MP_RESISTANCE,
  'dommages neutre': StatType.NEUTRAL_DAMAGE,
  'dommages terre': StatType.EARTH_DAMAGE,
  'dommages feu': StatType.FIRE_DAMAGE,
  'dommages eau': StatType.WATER_DAMAGE,
  'dommages air': StatType.AIR_DAMAGE,
  '% résistance neutre': StatType.NEUTRAL_RESISTANCE_PERCENT,
  '% résistance terre': StatType.EARTH_RESISTANCE_PERCENT,
  '% résistance feu': StatType.FIRE_RESISTANCE_PERCENT,
  '% résistance eau': StatType.WATER_RESISTANCE_PERCENT,
  '% résistance air': StatType.AIR_RESISTANCE_PERCENT,
  'résistance neutre': StatType.NEUTRAL_RESISTANCE_FIXED,
  'résistance terre': StatType.EARTH_RESISTANCE_FIXED,
  'résistance feu': StatType.FIRE_RESISTANCE_FIXED,
  'résistance eau': StatType.WATER_RESISTANCE_FIXED,
  'résistance air': StatType.AIR_RESISTANCE_FIXED,
  'dommages de poussée': StatType.PUSH_DAMAGE,
  'résistance poussée': StatType.PUSH_RESISTANCE,
  'dommages critiques': StatType.CRITICAL_DAMAGE,
  'résistance critique': StatType.CRITICAL_RESISTANCE,
  'dommages mêlée': StatType.MELEE_DAMAGE,
  'dommages distance': StatType.RANGED_DAMAGE,
  'dommages armes': StatType.WEAPON_DAMAGE,
  'dommages sorts': StatType.SPELL_DAMAGE,
  'pods': StatType.PODS,
  'dommages pièges': StatType.TRAP_DAMAGE,
  'puissance pièges': StatType.TRAP_POWER,
};

export class StatNormalizer {
  normalize(apiStatName: string): StatType | null {
    const normalized = apiStatName.toLowerCase().trim();
    return STAT_NAME_MAP[normalized] ?? null;
  }

  normalizeAll(names: string[]): Array<StatType | null> {
    return names.map(n => this.normalize(n));
  }

  isKnown(name: string): boolean {
    return this.normalize(name) !== null;
  }
}
