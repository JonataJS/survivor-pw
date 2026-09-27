import { describe, expect, it } from 'vitest';
import { createRng } from '../src/core/rng';
import {
  ATTACK_SKILL_SLOTS,
  FALLBACK_HP_BONUS,
  MAX_LEVEL,
  rollUpgradeOptions,
  type EquippedPassiveState,
  type EquippedSkillState,
  type UpgradeOption,
} from '../src/systems/UpgradeSystem';
import type { PassiveDef, SkillDef } from '../src/data/types';

const emptyCultivation = {
  god: { description: '', modifiers: [] },
  evil: { description: '', modifiers: [] },
};

function makeSkill(id: string, type: SkillDef['type'] = 'attack'): SkillDef {
  return {
    id,
    name: id,
    element: 'fire',
    type,
    levels: [{}, {}, {}, {}, {}],
    cultivation: emptyCultivation,
  };
}

function makePassive(id: string): PassiveDef {
  return { id, name: id, levels: [{}, {}, {}, {}, {}], cultivation: emptyCultivation };
}

const skillA = makeSkill('skill-a');
const skillB = makeSkill('skill-b');
const skillC = makeSkill('skill-c');
const dash = makeSkill('moving-earth', 'active');
const passiveA = makePassive('passive-a');
const passiveB = makePassive('passive-b');

function optionKey(option: UpgradeOption): string {
  switch (option.kind) {
    case 'new-skill':
      return `new-skill:${option.skill.id}`;
    case 'improve-skill':
      return `improve-skill:${option.skill.id}`;
    case 'new-passive':
      return `new-passive:${option.passive.id}`;
    case 'improve-passive':
      return `improve-passive:${option.passive.id}`;
    case 'flat-hp':
      return 'flat-hp';
  }
}

describe('rollUpgradeOptions', () => {
  it('sempre retorna 3 opções', () => {
    const rng = createRng(1);
    const options = rollUpgradeOptions(rng, [], [], [skillA, skillB, skillC], [passiveA, passiveB]);
    expect(options).toHaveLength(3);
  });

  it('não repete a mesma opção quando há candidatos suficientes', () => {
    const rng = createRng(42);
    const equippedSkills: EquippedSkillState[] = [{ def: skillA, level: 2 }];
    const options = rollUpgradeOptions(
      rng,
      equippedSkills,
      [],
      [skillA, skillB, skillC],
      [passiveA, passiveB],
    );
    const keys = options.map(optionKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('não oferece skill nova quando os 6 slots de ataque estão cheios', () => {
    const sixSkills = Array.from({ length: ATTACK_SKILL_SLOTS }, (_, i) => makeSkill(`atk-${i}`));
    const equippedSkills: EquippedSkillState[] = sixSkills.map((def) => ({ def, level: 2 }));
    const rng = createRng(7);

    const options = rollUpgradeOptions(rng, equippedSkills, [], sixSkills, []);

    expect(options.some((o) => o.kind === 'new-skill')).toBe(false);
    expect(options.every((o) => o.kind === 'improve-skill' || o.kind === 'flat-hp')).toBe(true);
  });

  it('não oferece melhoria para skill/passivo no nível máximo', () => {
    const equippedSkills: EquippedSkillState[] = [
      { def: skillA, level: MAX_LEVEL },
      { def: skillB, level: 3 },
    ];
    const rng = createRng(99);

    const options = rollUpgradeOptions(rng, equippedSkills, [], [skillA, skillB], []);

    const improvesSkillA = options.some(
      (o) => o.kind === 'improve-skill' && o.skill.id === skillA.id,
    );
    expect(improvesSkillA).toBe(false);
  });

  it('dá +20 HP nas 3 opções quando não há nada para oferecer', () => {
    const equippedSkills: EquippedSkillState[] = [{ def: skillA, level: MAX_LEVEL }];
    const equippedPassives: EquippedPassiveState[] = [{ def: passiveA, level: MAX_LEVEL }];
    const rng = createRng(13);

    const options = rollUpgradeOptions(rng, equippedSkills, equippedPassives, [skillA], [passiveA]);

    expect(options).toEqual([
      { kind: 'flat-hp', amount: FALLBACK_HP_BONUS },
      { kind: 'flat-hp', amount: FALLBACK_HP_BONUS },
      { kind: 'flat-hp', amount: FALLBACK_HP_BONUS },
    ]);
  });

  it('completa com +20 HP só os slots que sobram quando o pool é menor que 3', () => {
    const equippedSkills: EquippedSkillState[] = [
      { def: skillA, level: MAX_LEVEL },
      { def: skillB, level: 3 },
    ];
    const rng = createRng(21);

    const options = rollUpgradeOptions(rng, equippedSkills, [], [skillA, skillB], []);

    const improveB = options.filter(
      (o) => o.kind === 'improve-skill' && o.skill.id === skillB.id,
    );
    const fallbacks = options.filter((o) => o.kind === 'flat-hp');
    expect(improveB).toHaveLength(1);
    expect(fallbacks).toHaveLength(2);
  });

  it('Terra Móvel (active) entra no pool de melhoria mas não conta para o slot de ataque', () => {
    const equippedSkills: EquippedSkillState[] = [{ def: dash, level: 1 }];
    const rng = createRng(5);

    const options = rollUpgradeOptions(rng, equippedSkills, [], [skillA], []);

    // slot de ataque livre (0/6) → skillA nova deve poder aparecer
    const hasNewSkillA = options.some((o) => o.kind === 'new-skill' && o.skill.id === skillA.id);
    const hasImproveDash = options.some(
      (o) => o.kind === 'improve-skill' && o.skill.id === dash.id,
    );
    expect(hasNewSkillA || hasImproveDash).toBe(true);
  });

  it('é determinístico para a mesma semente e o mesmo estado', () => {
    const equippedSkills: EquippedSkillState[] = [{ def: skillA, level: 2 }];
    const run = () =>
      rollUpgradeOptions(createRng(2024), equippedSkills, [], [skillA, skillB, skillC], [passiveA]);

    expect(run()).toEqual(run());
  });
});
