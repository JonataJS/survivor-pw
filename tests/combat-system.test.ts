import { describe, expect, it } from 'vitest';
import { calculatePhysicalDamage, CONTACT_DAMAGE_INTERVAL_SECONDS } from '../src/systems/CombatSystem';

describe('calculatePhysicalDamage', () => {
  it('passes damage through unchanged with no defense', () => {
    expect(calculatePhysicalDamage(5, 0)).toBe(5);
  });

  it('subtracts flat defense from the raw damage', () => {
    expect(calculatePhysicalDamage(10, 4)).toBe(6);
  });

  it('never goes below zero', () => {
    expect(calculatePhysicalDamage(5, 20)).toBe(0);
  });
});

describe('CONTACT_DAMAGE_INTERVAL_SECONDS', () => {
  it('matches the 0.5s minimum interval from the spec', () => {
    expect(CONTACT_DAMAGE_INTERVAL_SECONDS).toBe(0.5);
  });
});
