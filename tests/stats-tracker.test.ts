import { describe, expect, it } from 'vitest';
import { fireMark, movingEarth, suddenSpring } from '../src/data/skills';
import { StatsTracker } from '../src/systems/StatsTracker';

describe('StatsTracker', () => {
  it('tracks dealt damage per equipped attack skill and ignores active skills', () => {
    const tracker = new StatsTracker();
    tracker.registerSkill(fireMark);
    tracker.registerSkill(movingEarth);
    tracker.registerSkill(suddenSpring);

    tracker.recordDamage(fireMark.id, 12.5);
    tracker.recordDamage(fireMark.id, 7.5);
    tracker.recordDamage(suddenSpring.id, 8);
    tracker.recordDamage(movingEarth.id, 100);
    tracker.recordDamage('unknown-skill', 100);

    expect(
      tracker.createRunResult(false, 90, 4, 'god', 12).damageBySkill,
    ).toEqual([
      { skillId: fireMark.id, skillName: fireMark.name, damage: 20 },
      { skillId: suddenSpring.id, skillName: suddenSpring.name, damage: 8 },
    ]);
  });

  it('returns a fresh snapshot including equipped attacks with zero damage', () => {
    const tracker = new StatsTracker();
    tracker.registerSkill(fireMark);

    const result = tracker.createRunResult(true, 600, 20, undefined, 45);
    result.damageBySkill[0].damage = 999;

    expect(tracker.createRunResult(true, 600, 20, undefined, 45)).toEqual({
      victory: true,
      survivedSeconds: 600,
      level: 20,
      cultivationPath: undefined,
      kills: 45,
      damageBySkill: [{ skillId: fireMark.id, skillName: fireMark.name, damage: 0 }],
    });
  });
});
