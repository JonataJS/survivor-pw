import { randomInt, type Rng } from '../core/rng';
import type { PassiveDef, SkillDef } from '../data/types';

// spec.md §2/§5.1: 6 skills de ataque e 6 passivos; toda skill/passivo vai
// do nível 1 ao 5. Terra Móvel (type 'active') não ocupa slot de ataque,
// mas ainda entra no pool de "melhorar" como qualquer outra skill equipada.
export const MAX_LEVEL = 5;
export const ATTACK_SKILL_SLOTS = 6;
export const PASSIVE_SLOTS = 6;
export const FALLBACK_HP_BONUS = 20;

export interface EquippedSkillState {
  def: SkillDef;
  level: number;
}

export interface EquippedPassiveState {
  def: PassiveDef;
  level: number;
}

export type UpgradeOption =
  | { kind: 'new-skill'; skill: SkillDef }
  | { kind: 'improve-skill'; skill: SkillDef; fromLevel: number; toLevel: number }
  | { kind: 'new-passive'; passive: PassiveDef }
  | { kind: 'improve-passive'; passive: PassiveDef; fromLevel: number; toLevel: number }
  | { kind: 'flat-hp'; amount: number };

// spec.md §7: 3 opções por level-up — sem skills no nível máximo, sem skill
// nova se os slots estiverem cheios, e +20 HP quando não há nada a oferecer.
export function rollUpgradeOptions(
  rng: Rng,
  equippedSkills: EquippedSkillState[],
  equippedPassives: EquippedPassiveState[],
  allAttackSkills: SkillDef[],
  allPassives: PassiveDef[],
): UpgradeOption[] {
  const equippedSkillIds = new Set(equippedSkills.map((s) => s.def.id));
  const equippedPassiveIds = new Set(equippedPassives.map((p) => p.def.id));
  const equippedAttackSkillCount = equippedSkills.filter((s) => s.def.type === 'attack').length;

  const pool: UpgradeOption[] = [];

  if (equippedAttackSkillCount < ATTACK_SKILL_SLOTS) {
    for (const skill of allAttackSkills) {
      if (!equippedSkillIds.has(skill.id)) pool.push({ kind: 'new-skill', skill });
    }
  }
  for (const equipped of equippedSkills) {
    if (equipped.level < MAX_LEVEL) {
      pool.push({
        kind: 'improve-skill',
        skill: equipped.def,
        fromLevel: equipped.level,
        toLevel: equipped.level + 1,
      });
    }
  }
  if (equippedPassives.length < PASSIVE_SLOTS) {
    for (const passive of allPassives) {
      if (!equippedPassiveIds.has(passive.id)) pool.push({ kind: 'new-passive', passive });
    }
  }
  for (const equipped of equippedPassives) {
    if (equipped.level < MAX_LEVEL) {
      pool.push({
        kind: 'improve-passive',
        passive: equipped.def,
        fromLevel: equipped.level,
        toLevel: equipped.level + 1,
      });
    }
  }

  const options: UpgradeOption[] = [];
  while (options.length < 3) {
    if (pool.length === 0) {
      options.push({ kind: 'flat-hp', amount: FALLBACK_HP_BONUS });
      continue;
    }
    const index = randomInt(rng, 0, pool.length - 1);
    options.push(pool[index]);
    pool.splice(index, 1);
  }
  return options;
}
