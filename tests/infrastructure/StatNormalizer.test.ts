import { describe, it, expect } from 'vitest';
import { StatNormalizer } from '../../src/infrastructure/providers/normalizers/StatNormalizer';
import { StatType } from '../../src/domain/constants/StatWeights';

const normalizer = new StatNormalizer();

describe('StatNormalizer', () => {
  it('normalizes French stat names to StatType', () => {
    expect(normalizer.normalize('Vitalité')).toBe(StatType.VITALITY);
    expect(normalizer.normalize('Force')).toBe(StatType.STRENGTH);
    expect(normalizer.normalize('Intelligence')).toBe(StatType.INTELLIGENCE);
    expect(normalizer.normalize('Chance')).toBe(StatType.CHANCE);
    expect(normalizer.normalize('Agilité')).toBe(StatType.AGILITY);
    expect(normalizer.normalize('Sagesse')).toBe(StatType.WISDOM);
  });

  it('normalizes case-insensitively', () => {
    expect(normalizer.normalize('VITALITÉ')).toBe(StatType.VITALITY);
    expect(normalizer.normalize('force')).toBe(StatType.STRENGTH);
  });

  it('returns null for unknown stat names', () => {
    expect(normalizer.normalize('StatInconnue')).toBeNull();
    expect(normalizer.normalize('')).toBeNull();
  });

  it('normalizes PA/PM', () => {
    expect(normalizer.normalize('PA')).toBe(StatType.AP);
    expect(normalizer.normalize('PM')).toBe(StatType.MP);
    expect(normalizer.normalize('Portée')).toBe(StatType.RANGE);
  });

  it('normalizes alternative names', () => {
    expect(normalizer.normalize('Points de vie')).toBe(StatType.VITALITY);
    expect(normalizer.normalize("Points d'action")).toBe(StatType.AP);
  });

  it('batch normalizes names', () => {
    const results = normalizer.normalizeAll(['Force', 'Vitalité', 'Inconnu']);
    expect(results[0]).toBe(StatType.STRENGTH);
    expect(results[1]).toBe(StatType.VITALITY);
    expect(results[2]).toBeNull();
  });

  it('checks known status', () => {
    expect(normalizer.isKnown('Vitalité')).toBe(true);
    expect(normalizer.isKnown('StatInconnue')).toBe(false);
  });
});
