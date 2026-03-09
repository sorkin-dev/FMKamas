export function formatKamas(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}k`;
  return `${Math.round(amount)}`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatStat(type: string, value: number): string {
  const suffix = type.includes('PERCENT') ? '%' : '';
  return `${value}${suffix}`;
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function statTypeToFrench(statType: string): string {
  const map: Record<string, string> = {
    VITALITY: 'Vitalité',
    WISDOM: 'Sagesse',
    STRENGTH: 'Force',
    INTELLIGENCE: 'Intelligence',
    CHANCE: 'Chance',
    AGILITY: 'Agilité',
    AP: 'PA',
    MP: 'PM',
    RANGE: 'Portée',
    SUMMONS: 'Invocations',
    CRITICAL_HITS: 'Coups critiques',
    HEALS: 'Soins',
    INITIATIVE: 'Initiative',
    PROSPECTING: 'Prospection',
    POWER: 'Puissance',
    DODGE: 'Esquive',
    LOCK: 'Tacle',
    AP_REDUCTION: 'Retrait PA',
    MP_REDUCTION: 'Retrait PM',
    AP_RESISTANCE: 'Résistance aux Retraits PA',
    MP_RESISTANCE: 'Résistance aux Retraits PM',
    NEUTRAL_DAMAGE: 'Dommages Neutre',
    EARTH_DAMAGE: 'Dommages Terre',
    FIRE_DAMAGE: 'Dommages Feu',
    WATER_DAMAGE: 'Dommages Eau',
    AIR_DAMAGE: 'Dommages Air',
    NEUTRAL_RESISTANCE_PERCENT: '% Résistance Neutre',
    EARTH_RESISTANCE_PERCENT: '% Résistance Terre',
    FIRE_RESISTANCE_PERCENT: '% Résistance Feu',
    WATER_RESISTANCE_PERCENT: '% Résistance Eau',
    AIR_RESISTANCE_PERCENT: '% Résistance Air',
    NEUTRAL_RESISTANCE_FIXED: 'Résistance Neutre',
    EARTH_RESISTANCE_FIXED: 'Résistance Terre',
    FIRE_RESISTANCE_FIXED: 'Résistance Feu',
    WATER_RESISTANCE_FIXED: 'Résistance Eau',
    AIR_RESISTANCE_FIXED: 'Résistance Air',
    PUSH_DAMAGE: 'Dommages de poussée',
    PUSH_RESISTANCE: 'Résistance Poussée',
    CRITICAL_DAMAGE: 'Dommages Critiques',
    CRITICAL_RESISTANCE: 'Résistance Critique',
    MELEE_DAMAGE: 'Dommages Mêlée',
    RANGED_DAMAGE: 'Dommages Distance',
    WEAPON_DAMAGE: 'Dommages Armes',
    SPELL_DAMAGE: 'Dommages Sorts',
    PODS: 'Pods',
    TRAP_DAMAGE: 'Dommages Pièges',
    TRAP_POWER: 'Puissance Pièges',
  };
  return map[statType] ?? statType;
}
