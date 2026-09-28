import { describe, expect, it } from 'vitest';
import {
  BEST_RUN_STORAGE_KEY,
  isBetterRun,
  LocalScoreService,
  type ScoreStorage,
} from '../src/services/LocalScoreService';
import type { RunResult } from '../src/systems/StatsTracker';

class MemoryStorage implements ScoreStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

function createRun(survivedSeconds: number, kills: number): RunResult {
  return {
    victory: false,
    survivedSeconds,
    level: 4,
    kills,
    damageBySkill: [],
  };
}

describe('LocalScoreService', () => {
  it('keeps the longest run and uses kills to break time ties', async () => {
    const storage = new MemoryStorage();
    const service = new LocalScoreService(storage);
    const first = createRun(120, 10);

    await service.saveRun(first);
    await service.saveRun(createRun(119, 100));
    expect(await new LocalScoreService(storage).getBestRun()).toEqual(first);

    const tieBreaker = createRun(120, 11);
    await service.saveRun(tieBreaker);
    expect(await new LocalScoreService(storage).getBestRun()).toEqual(tieBreaker);
    expect(storage.getItem(BEST_RUN_STORAGE_KEY)).toContain('"kills":11');
    expect(isBetterRun(createRun(120, 11), tieBreaker)).toBe(false);
  });

  it('returns null for missing or invalid stored data', async () => {
    const storage = new MemoryStorage();
    const service = new LocalScoreService(storage);
    expect(await service.getBestRun()).toBeNull();

    storage.setItem(BEST_RUN_STORAGE_KEY, '{invalid');
    expect(await service.getBestRun()).toBeNull();

    storage.setItem(BEST_RUN_STORAGE_KEY, JSON.stringify({ survivedSeconds: -1 }));
    expect(await service.getBestRun()).toBeNull();
  });

  it('does not fail when browser storage throws', async () => {
    const unavailableStorage: ScoreStorage = {
      getItem: () => {
        throw new Error('storage disabled');
      },
      setItem: () => {
        throw new Error('storage disabled');
      },
    };
    const service = new LocalScoreService(unavailableStorage);

    await expect(service.saveRun(createRun(60, 3))).resolves.toBeUndefined();
    await expect(service.getBestRun()).resolves.toBeNull();
  });
});
