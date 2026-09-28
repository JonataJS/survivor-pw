import type { RunResult } from '../systems/StatsTracker';

export interface ScoreService {
  saveRun(result: RunResult): Promise<void>;
  getBestRun(): Promise<RunResult | null>;
}
