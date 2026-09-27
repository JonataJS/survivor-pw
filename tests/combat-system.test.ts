import { describe, expect, it } from 'vitest';
import {
  calculateDamage,
  calculatePhysicalDamage,
  calculateStats,
  CONTACT_DAMAGE_INTERVAL_SECONDS,
  CRIT_MULTIPLIER,
  type EquippedPassive,
} from '../src/systems/CombatSystem';
import { fireMark, stoneRain, phoenixWings, flamingStorm, sandStorm, movingEarth } from '../src/data/skills';
import { fireMastery, waterMastery, earthShield, fireShield, serenity } from '../src/data/passives';

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

describe('calculateStats — base case', () => {
  it('passes level stats through unchanged with no passives and no path', () => {
    const stats = calculateStats(fireMark, 1);

    expect(stats.values.damage).toBe(10);
    expect(stats.values.cooldown).toBe(1.5);
    expect(stats.values.projectiles).toBe(1);
    expect(stats.critChance).toBe(0);
    expect(stats.damageTakenReduction).toBe(0);
    expect(stats.statusChances).toEqual([]);
    expect(stats.lifesteal).toBeUndefined();
    expect(stats.healOnHit).toBeUndefined();
    expect(stats.periodicBuff).toBeUndefined();
    expect(stats.critMultiplier).toBe(CRIT_MULTIPLIER);
  });
});

describe('calculateStats — mastery e serenidade (plan.md §3.2)', () => {
  it('applies matching elemental mastery to damage: finalDamage = base × (1 + mastery)', () => {
    const equipped: EquippedPassive[] = [{ def: fireMastery, level: 1 }]; // +10%
    const stats = calculateStats(fireMark, 1, equipped);

    expect(stats.values.damage).toBeCloseTo(10 * 1.1);
  });

  it('does not apply mastery of a different element', () => {
    const equipped: EquippedPassive[] = [{ def: waterMastery, level: 5 }];
    const stats = calculateStats(fireMark, 1, equipped);

    expect(stats.values.damage).toBe(10);
  });

  it('applies serenity to reduce cooldown: finalCooldown = base × (1 − serenity)', () => {
    const equipped: EquippedPassive[] = [{ def: serenity, level: 1 }]; // -6%
    const stats = calculateStats(fireMark, 1, equipped);

    expect(stats.values.cooldown).toBeCloseTo(1.5 * (1 - 0.06));
  });
});

describe('calculateStats — cultivo (plan.md §3.3)', () => {
  it('with no path chosen, cultivo modifiers never apply', () => {
    const stats = calculateStats(fireMark, 1);
    expect(stats.lifesteal).toBeUndefined();
    expect(stats.values.cooldown).toBe(1.5);
  });

  it("Marca do Fogo god: lifesteal 30% chance / 20% de cura", () => {
    const stats = calculateStats(fireMark, 1, [], 'god');
    expect(stats.lifesteal).toEqual({ chance: 0.3, percentage: 0.2 });
  });

  it('Marca do Fogo evil: −20% de espera (cooldown_mult)', () => {
    const stats = calculateStats(fireMark, 1, [], 'evil');
    expect(stats.values.cooldown).toBeCloseTo(1.5 * 0.8);
  });

  it('Chuva de Pedra god: −20% de espera', () => {
    const stats = calculateStats(stoneRain, 1, [], 'god');
    expect(stats.values.cooldown).toBeCloseTo(6.0 * 0.8);
  });

  it('Chuva de Pedra evil: 20% de chance de atordoar por 2s', () => {
    const stats = calculateStats(stoneRain, 1, [], 'evil');
    expect(stats.statusChances).toEqual([{ status: 'stun', chance: 0.2, duration: 2 }]);
  });

  it('Asas da Fênix god: −1s de espera (flat_cooldown)', () => {
    const stats = calculateStats(phoenixWings, 1, [], 'god');
    expect(stats.values.cooldown).toBeCloseTo(8.0 - 1);
  });

  it('Asas da Fênix evil: fênix 50% mais larga (area_mult não altera cooldown)', () => {
    const stats = calculateStats(phoenixWings, 1, [], 'evil');
    expect(stats.values.cooldown).toBe(8.0);
    expect(stats.values.width).toBeCloseTo(80 * 1.5);
  });

  it('Tempestade Flamejante evil: 25% de chance de curar 1 HP (máx. 5)', () => {
    const stats = calculateStats(flamingStorm, 1, [], 'evil');
    expect(stats.healOnHit).toEqual({ chance: 0.25, value: 1, maxPerActivation: 5 });
  });

  it('Tempestade de Areia god: efeito de dano reduzido dura 50% mais', () => {
    const stats = calculateStats(sandStorm, 1, [], 'god');
    expect(stats.values.debuffDuration).toBeCloseTo(3 * 1.5);
  });

  it('Tempestade de Areia evil: dano fixo extra por acerto', () => {
    const stats = calculateStats(sandStorm, 1, [], 'evil');
    expect(stats.values.damage).toBeCloseTo(18 + 6);
  });

  it('Terra Móvel god: −30% de espera', () => {
    const stats = calculateStats(movingEarth, 1, [], 'god');
    expect(stats.values.cooldown).toBeCloseTo(6.0 * 0.7);
  });

  it('Terra Móvel evil: dash 50% mais longo', () => {
    const stats = calculateStats(movingEarth, 1, [], 'evil');
    expect(stats.values.distance).toBeCloseTo(180 * 1.5);
  });
});

describe('calculateStats — passivos e seus próprios aditivos', () => {
  it('Escudo de Terra god: −15% de dano recebido, defesa do escudo intacta', () => {
    const stats = calculateStats(earthShield, 3, [], 'god');
    expect(stats.damageTakenReduction).toBeCloseTo(0.15);
    expect(stats.values.physicalDefenseBonus).toBeCloseTo(6);
  });

  it('Escudo de Terra evil: bônus de defesa do escudo +150%', () => {
    const stats = calculateStats(earthShield, 3, [], 'evil');
    expect(stats.values.physicalDefenseBonus).toBeCloseTo(6 * 2.5);
  });

  it('Escudo de Fogo evil: regeneração do escudo ×3', () => {
    const stats = calculateStats(fireShield, 3, [], 'evil');
    expect(stats.values.regenPerSecond).toBeCloseTo(1.5 * 3);
  });

  it('Maestria evil: +5% de chance de crítico', () => {
    const stats = calculateStats(fireMastery, 5, [], 'evil');
    expect(stats.critChance).toBeCloseTo(0.05);
  });

  it('Serenidade god: buff periódico de +100% de dano a cada 30s por 5s', () => {
    const stats = calculateStats(serenity, 1, [], 'god');
    expect(stats.periodicBuff).toEqual({ interval: 30, duration: 5, damageBonus: 1 });
  });
});

describe('calculateStats — cultivo de passivos equipados se propaga às skills', () => {
  it('a maestria evil equipada soma +5% de crítico ao calcular uma skill do mesmo elemento', () => {
    const equipped: EquippedPassive[] = [{ def: fireMastery, level: 1 }];
    const stats = calculateStats(fireMark, 1, equipped, 'evil');

    expect(stats.critChance).toBeCloseTo(0.05);
    // a maestria evil não dá bônus de dano do elemento — só a versão god
    expect(stats.values.damage).toBeCloseTo(10 * 1.1); // só o +10% base da maestria
  });

  it('a Serenidade equipada com o caminho god propaga o buff periódico para a skill', () => {
    const equipped: EquippedPassive[] = [{ def: serenity, level: 1 }];
    const stats = calculateStats(fireMark, 1, equipped, 'god');

    expect(stats.periodicBuff).toEqual({ interval: 30, duration: 5, damageBonus: 1 });
    expect(stats.values.cooldown).toBeCloseTo(1.5 * (1 - 0.06));
  });

  it('a Serenidade equipada com o caminho evil reduz ainda mais a espera de outra skill', () => {
    const equipped: EquippedPassive[] = [{ def: serenity, level: 1 }];
    const stats = calculateStats(stoneRain, 1, equipped, 'evil');

    // serenidade base (-6%) × serenidade evil cultivo (cooldown_mult 0.8)
    expect(stats.values.cooldown).toBeCloseTo(6.0 * (1 - 0.06) * 0.8);
  });
});

describe('calculateDamage — finalDamage (plan.md §3.3)', () => {
  it('returns the base damage unchanged with no crit, buff or reduction', () => {
    expect(calculateDamage(20)).toBe(20);
  });

  it('doubles damage on a critical hit (200%)', () => {
    expect(calculateDamage(20, { isCrit: true })).toBe(40);
  });

  it('applies the target damage reduction', () => {
    expect(calculateDamage(20, { targetReduction: 0.5 })).toBe(10);
  });

  it('applies the periodic buff bonus only while active', () => {
    expect(calculateDamage(20, { periodicBuffActive: true, periodicBuffBonus: 1 })).toBe(40);
    expect(calculateDamage(20, { periodicBuffActive: false, periodicBuffBonus: 1 })).toBe(20);
  });

  it('combines crit, buff and reduction multiplicatively', () => {
    const result = calculateDamage(20, {
      isCrit: true,
      periodicBuffActive: true,
      periodicBuffBonus: 1,
      targetReduction: 0.5,
    });
    // 20 × (1+1) × 2 × (1-0.5) = 40
    expect(result).toBe(40);
  });
});
