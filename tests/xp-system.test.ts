import { describe, expect, it } from 'vitest';
import { applyXpGain, buildLevelUpQueue, xpToNextLevel, XpSystem } from '../src/systems/XpSystem';
import { EventBus } from '../src/core/EventBus';

describe('xpToNextLevel', () => {
  it('follows 5 + nível × 10', () => {
    expect(xpToNextLevel(1)).toBe(15);
    expect(xpToNextLevel(2)).toBe(25);
    expect(xpToNextLevel(20)).toBe(205);
  });
});

describe('applyXpGain', () => {
  it('accumulates xp without leveling up when below the threshold', () => {
    const result = applyXpGain(1, 0, 10);
    expect(result).toEqual({ level: 1, xp: 10, levelsGained: 0 });
  });

  it('levels up once when xp reaches the threshold, carrying the remainder', () => {
    const result = applyXpGain(1, 10, 10);
    expect(result).toEqual({ level: 2, xp: 5, levelsGained: 1 });
  });

  it('levels up multiple times from a single large gain (fila de level-ups)', () => {
    // level 18 → 22: needs 185+195+205+215 = 800 to hit level 22 exactly
    const result = applyXpGain(18, 0, 800);
    expect(result).toEqual({ level: 22, xp: 0, levelsGained: 4 });
  });

  it('resolving level 20 alone still yields exactly one level-up', () => {
    const result = applyXpGain(19, 0, xpToNextLevel(19));
    expect(result).toEqual({ level: 20, xp: 0, levelsGained: 1 });
  });
});

describe('buildLevelUpQueue', () => {
  it('nível 20 sozinho: Cultivo vem antes do level-up desse nível', () => {
    const queue = buildLevelUpQueue(19, 1);
    expect(queue).toEqual([
      { kind: 'cultivation-required', level: 20 },
      { kind: 'level-up', level: 20 },
    ]);
  });

  it('subindo do 18 ao 22 de uma vez: Cultivo aparece uma única vez, na posição certa', () => {
    const queue = buildLevelUpQueue(18, 4);
    expect(queue).toEqual([
      { kind: 'level-up', level: 19 },
      { kind: 'cultivation-required', level: 20 },
      { kind: 'level-up', level: 20 },
      { kind: 'level-up', level: 21 },
      { kind: 'level-up', level: 22 },
    ]);
  });

  it('não insere Cultivo quando o nível 20 não é alcançado', () => {
    const queue = buildLevelUpQueue(1, 2);
    expect(queue.some((item) => item.kind === 'cultivation-required')).toBe(false);
  });
});

describe('XpSystem', () => {
  it('emits level-up once per level gained, in ascending order', () => {
    const system = new XpSystem();
    const levelsEmitted: number[] = [];
    const onLevelUp = (level: number) => levelsEmitted.push(level);
    EventBus.on('level-up', onLevelUp);

    system.addXp(xpToNextLevel(1) + xpToNextLevel(2)); // levels 1 → 3

    EventBus.off('level-up', onLevelUp);
    expect(levelsEmitted).toEqual([2, 3]);
    expect(system.level).toBe(3);
    expect(system.xp).toBe(0);
  });

  it('emits xp-changed on every gain, even without a level-up', () => {
    const system = new XpSystem();
    const gains: Array<[number, number]> = [];
    const onXpChanged = (xp: number, toNext: number) => gains.push([xp, toNext]);
    EventBus.on('xp-changed', onXpChanged);

    system.addXp(3);

    EventBus.off('xp-changed', onXpChanged);
    expect(gains).toEqual([[3, xpToNextLevel(1)]]);
  });

  it('does not emit level-up when the gain does not cross the threshold', () => {
    const system = new XpSystem();
    const levelsEmitted: number[] = [];
    const onLevelUp = (level: number) => levelsEmitted.push(level);
    EventBus.on('level-up', onLevelUp);

    system.addXp(5);

    EventBus.off('level-up', onLevelUp);
    expect(levelsEmitted).toEqual([]);
  });

  it('emits cultivation-required right before level-up(20)', () => {
    const system = new XpSystem();
    system.level = 19;
    system.xp = 0;

    const emitted: string[] = [];
    const onCultivation = (level: number) => emitted.push(`cultivation:${level}`);
    const onLevelUp = (level: number) => emitted.push(`level-up:${level}`);
    EventBus.on('cultivation-required', onCultivation);
    EventBus.on('level-up', onLevelUp);

    system.addXp(xpToNextLevel(19));

    EventBus.off('cultivation-required', onCultivation);
    EventBus.off('level-up', onLevelUp);
    expect(emitted).toEqual(['cultivation:20', 'level-up:20']);
  });
});
