import type { RunResult, SkillDamageResult } from '../systems/StatsTracker';
import type { ScoreService } from './ScoreService';

export const BEST_RUN_STORAGE_KEY = 'survivor-pw:best-run:v1';

export interface ScoreStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function isBetterRun(candidate: RunResult, current: RunResult | null): boolean {
  if (!current) return true;
  if (candidate.survivedSeconds !== current.survivedSeconds) {
    return candidate.survivedSeconds > current.survivedSeconds;
  }
  return candidate.kills > current.kills;
}

export class LocalScoreService implements ScoreService {
  constructor(private readonly storage?: ScoreStorage) {}

  async saveRun(result: RunResult): Promise<void> {
    try {
      const current = this.readBestRun();
      if (isBetterRun(result, current)) {
        this.storageProvider.setItem(BEST_RUN_STORAGE_KEY, JSON.stringify(result));
      }
    } catch {
      // Storage can be disabled or full; keeping the result screen available is more important.
    }
  }

  async getBestRun(): Promise<RunResult | null> {
    try {
      return this.readBestRun();
    } catch {
      return null;
    }
  }

  private readBestRun(): RunResult | null {
    const stored = this.storageProvider.getItem(BEST_RUN_STORAGE_KEY);
    if (!stored) return null;

    try {
      const parsed: unknown = JSON.parse(stored);
      return isRunResult(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private get storageProvider(): ScoreStorage {
    return this.storage ?? window.localStorage;
  }
}

function isRunResult(value: unknown): value is RunResult {
  if (typeof value !== 'object' || value === null) return false;
  const result = value as Partial<RunResult>;
  return (
    typeof result.victory === 'boolean' &&
    isNonNegativeNumber(result.survivedSeconds) &&
    Number.isInteger(result.level) &&
    (result.level ?? 0) >= 1 &&
    (result.cultivationPath === undefined ||
      result.cultivationPath === 'god' ||
      result.cultivationPath === 'evil') &&
    Number.isInteger(result.kills) &&
    (result.kills ?? -1) >= 0 &&
    Array.isArray(result.damageBySkill) &&
    result.damageBySkill.every(isSkillDamageResult)
  );
}

function isSkillDamageResult(value: unknown): value is SkillDamageResult {
  if (typeof value !== 'object' || value === null) return false;
  const result = value as Partial<SkillDamageResult>;
  return (
    typeof result.skillId === 'string' &&
    typeof result.skillName === 'string' &&
    isNonNegativeNumber(result.damage)
  );
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export const scoreService: ScoreService = new LocalScoreService();
