import { describe, expect, it } from 'vitest';
import { enemies } from '../src/data/enemies';
import { XP_REQUIRED_BY_LEVEL } from '../src/data/progression';
import { waves } from '../src/data/waves';

function estimateAvailableXp(durationSeconds: number): number {
  return waves.reduce((total, wave, index) => {
    if (wave.timeSeconds >= durationSeconds) return total;

    const nextWaveStart = waves[index + 1]?.timeSeconds ?? durationSeconds;
    const segmentEnd = Math.min(nextWaveStart, durationSeconds);
    const spawnCount = (segmentEnd - wave.timeSeconds) / wave.spawnIntervalSeconds;
    const enabledEnemies = enemies.filter((enemy) => wave.enabledEnemyIds.includes(enemy.id));
    const averageXp =
      enabledEnemies.reduce((sum, enemy) => sum + enemy.xp, 0) / enabledEnemies.length;
    return total + spawnCount * averageXp;
  }, 0);
}

describe('long-run balance data', () => {
  it('estimates level 20 near the 20-minute target with a 75% kill and pickup rate', () => {
    const xpRequiredForLevel20 = XP_REQUIRED_BY_LEVEL.reduce((sum, xp) => sum + xp, 0);
    const estimatedCollectedXp = estimateAvailableXp(20 * 60) * 0.75;

    expect(estimatedCollectedXp).toBeGreaterThanOrEqual(xpRequiredForLevel20);
    expect(estimatedCollectedXp).toBeLessThan(xpRequiredForLevel20 * 1.05);
  });

  it('increases enemy durability and spawn pressure toward the 25-minute finish', () => {
    const lateWaves = waves.filter((wave) => wave.timeSeconds >= 540);

    expect(lateWaves.length).toBeGreaterThanOrEqual(5);
    for (let index = 1; index < lateWaves.length; index += 1) {
      expect(lateWaves[index].hpMultiplier).toBeGreaterThan(lateWaves[index - 1].hpMultiplier);
      expect(lateWaves[index].spawnIntervalSeconds).toBeLessThanOrEqual(
        lateWaves[index - 1].spawnIntervalSeconds,
      );
    }
  });
});
