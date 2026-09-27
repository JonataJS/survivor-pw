import { describe, expect, it } from 'vitest';
import { createRng } from '../src/core/rng';
import { pickWaveForTime, pickSpawnPoint, type ViewRect } from '../src/systems/spawnLogic';
import { waves } from '../src/data/waves';
import type { WaveDef } from '../src/data/types';

describe('pickWaveForTime', () => {
  it('picks the first wave at time 0', () => {
    expect(pickWaveForTime(waves, 0)).toBe(waves[0]);
  });

  it('does not enable the fast enemy before 1:30', () => {
    const wave = pickWaveForTime(waves, 89);
    expect(wave.enabledEnemyIds).not.toContain('fast');
  });

  it('enables the fast enemy exactly at 1:30 (90s)', () => {
    const wave = pickWaveForTime(waves, 90);
    expect(wave.enabledEnemyIds).toContain('fast');
  });

  it('does not enable the tank enemy before 3:00', () => {
    const wave = pickWaveForTime(waves, 179);
    expect(wave.enabledEnemyIds).not.toContain('tank');
  });

  it('enables the tank enemy exactly at 3:00 (180s)', () => {
    const wave = pickWaveForTime(waves, 180);
    expect(wave.enabledEnemyIds).toContain('tank');
  });

  it('keeps returning the last wave once elapsed time passes it', () => {
    const wave = pickWaveForTime(waves, 100000);
    expect(wave).toBe(waves[waves.length - 1]);
  });

  it('spawn interval and HP multiplier grow over time', () => {
    const early = pickWaveForTime(waves, 0);
    const mid = pickWaveForTime(waves, 300);
    const late = pickWaveForTime(waves, 540);

    expect(mid.hpMultiplier).toBeGreaterThan(early.hpMultiplier);
    expect(late.hpMultiplier).toBeGreaterThan(mid.hpMultiplier);
    expect(mid.spawnIntervalSeconds).toBeLessThan(early.spawnIntervalSeconds);
    expect(late.spawnIntervalSeconds).toBeLessThan(mid.spawnIntervalSeconds);
  });
});

describe('pickSpawnPoint', () => {
  const view: ViewRect = { x: 500, y: 500, width: 1280, height: 720 };
  const worldWidth = 3000;
  const worldHeight = 3000;

  it('always lands outside the camera view', () => {
    const rng = createRng(1);
    for (let i = 0; i < 200; i++) {
      const point = pickSpawnPoint(rng, view, 80, worldWidth, worldHeight);
      const insideView =
        point.x > view.x &&
        point.x < view.x + view.width &&
        point.y > view.y &&
        point.y < view.y + view.height;
      expect(insideView).toBe(false);
    }
  });

  it('never lands outside the world bounds', () => {
    const rng = createRng(2);
    for (let i = 0; i < 200; i++) {
      const point = pickSpawnPoint(rng, view, 80, worldWidth, worldHeight);
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(worldWidth);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(worldHeight);
    }
  });

  it('is deterministic for the same seed', () => {
    const points1 = (() => {
      const rng = createRng(99);
      return Array.from({ length: 5 }, () => pickSpawnPoint(rng, view, 80, worldWidth, worldHeight));
    })();
    const points2 = (() => {
      const rng = createRng(99);
      return Array.from({ length: 5 }, () => pickSpawnPoint(rng, view, 80, worldWidth, worldHeight));
    })();

    expect(points1).toEqual(points2);
  });
});

describe('waves data sanity', () => {
  it('is sorted ascending by timeSeconds', () => {
    const times = waves.map((wave: WaveDef) => wave.timeSeconds);
    const sorted = [...times].sort((a, b) => a - b);
    expect(times).toEqual(sorted);
  });
});
