import { describe, expect, it } from 'vitest';
import { BaseSkill, type SkillContext } from '../src/skills/Skill';
import { SkillSystem } from '../src/systems/SkillSystem';
import type { SkillDef } from '../src/data/types';
import { serenity } from '../src/data/passives';
import { createRng } from '../src/core/rng';

const testSkillDef: SkillDef = {
  id: 'test-skill',
  name: 'Skill de teste',
  element: 'fire',
  type: 'attack',
  levels: [{ damage: 10, cooldown: 1 }],
  cultivation: {
    god: { description: '', modifiers: [] },
    evil: { description: '−50% de espera', modifiers: [{ type: 'cooldown_mult', value: 0.5 }] },
  },
};

class TestSkill extends BaseSkill {
  readonly fireTimestamps: number[] = [];
  private elapsed = 0;

  update(dt: number, ctx: SkillContext): void {
    this.elapsed += dt;
    super.update(dt, ctx);
  }

  protected fire(): void {
    this.fireTimestamps.push(this.elapsed);
  }
}

function baseContext(overrides: Partial<SkillContext> = {}): SkillContext {
  return {
    casterX: 0,
    casterY: 0,
    facingX: 0,
    facingY: 1,
    equippedPassives: [],
    path: undefined,
    findNearestEnemy: () => undefined,
    findRandomVisibleEnemy: () => undefined,
    findStrongestEnemyNearby: () => undefined,
    findEnemiesInLine: () => [],
    findEnemiesInRadius: () => [],
    dealDamage: () => 0,
    healPlayer: () => {},
    rng: createRng(1),
    ...overrides,
  };
}

function run(skill: TestSkill, ctx: SkillContext, totalSeconds: number, dt: number): void {
  for (let t = 0; t < totalSeconds; t += dt) {
    skill.update(dt, ctx);
  }
}

describe('BaseSkill cadence', () => {
  it('fires immediately, then again every cooldown interval', () => {
    const skill = new TestSkill(testSkillDef, 1);
    run(skill, baseContext(), 3.05, 0.1);

    // cooldown = 1s: fires at ~0, ~1, ~2, ~3
    expect(skill.fireTimestamps.length).toBe(4);
    for (let i = 1; i < skill.fireTimestamps.length; i++) {
      const interval = skill.fireTimestamps[i] - skill.fireTimestamps[i - 1];
      expect(interval).toBeCloseTo(1, 1);
    }
  });

  it('fires faster when Serenity reduces the cooldown', () => {
    const skill = new TestSkill(testSkillDef, 1);
    const ctx = baseContext({ equippedPassives: [{ def: serenity, level: 5 }] }); // -30%
    run(skill, ctx, 3.05, 0.1);

    // cooldown = 1 × (1 - 0.30) = 0.7s → fires at ~0, 0.7, 1.4, 2.1, 2.8
    expect(skill.fireTimestamps.length).toBe(5);
  });

  it('fires faster with an evil cultivo cooldown_mult', () => {
    const skill = new TestSkill(testSkillDef, 1);
    const ctx = baseContext({ path: 'evil' });
    run(skill, ctx, 3.05, 0.1);

    // cooldown = 1 × 0.5 = 0.5s → fires at ~0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0
    expect(skill.fireTimestamps.length).toBe(7);
  });

  it('does not drift: intervals stay close to the cooldown over many cycles', () => {
    const skill = new TestSkill(testSkillDef, 1);
    run(skill, baseContext(), 20, 0.1);

    expect(skill.fireTimestamps.length).toBeGreaterThanOrEqual(19);
    expect(skill.fireTimestamps.length).toBeLessThanOrEqual(21);
    for (let i = 1; i < skill.fireTimestamps.length; i++) {
      const interval = skill.fireTimestamps[i] - skill.fireTimestamps[i - 1];
      expect(interval).toBeCloseTo(1, 1);
    }
  });
});

describe('SkillSystem', () => {
  it('updates every equipped skill each frame', () => {
    const skillA = new TestSkill(testSkillDef, 1);
    const skillB = new TestSkill(testSkillDef, 1);
    const system = new SkillSystem();
    system.add(skillA);
    system.add(skillB);

    const ctx = baseContext();
    for (let t = 0; t < 2.05; t += 0.1) {
      system.update(0.1, ctx);
    }

    expect(skillA.fireTimestamps.length).toBeGreaterThan(0);
    expect(skillB.fireTimestamps.length).toBe(skillA.fireTimestamps.length);
  });

  it('stops updating a removed skill', () => {
    const skill = new TestSkill(testSkillDef, 1);
    const system = new SkillSystem();
    system.add(skill);
    system.update(0.1, baseContext());
    const countAfterFirst = skill.fireTimestamps.length;

    system.remove(skill);
    for (let i = 0; i < 20; i++) {
      system.update(0.1, baseContext());
    }

    expect(skill.fireTimestamps.length).toBe(countAfterFirst);
  });
});

describe('busca de alvo pela grade', () => {
  it('exposes findNearestEnemy so a skill can target through the context', () => {
    const fakeEnemy = { id: 'fake' } as unknown as import('../src/entities/Enemy').Enemy;

    class TargetingSkill extends BaseSkill {
      lastTarget: unknown;
      protected fire(ctx: SkillContext): void {
        this.lastTarget = ctx.findNearestEnemy();
      }
    }

    const skill = new TargetingSkill(testSkillDef, 1);
    const ctx = baseContext({ findNearestEnemy: () => fakeEnemy });
    skill.update(0, ctx);

    expect(skill.lastTarget).toBe(fakeEnemy);
  });
});
