import type { WaveDef } from './types';

// Spawn rate and enemy health ramp through the 25-minute match (T060).
export const waves: WaveDef[] = [
  { timeSeconds: 0, spawnIntervalSeconds: 2.0, hpMultiplier: 1.0, enabledEnemyIds: ['common'] },
  { timeSeconds: 90, spawnIntervalSeconds: 1.6, hpMultiplier: 1.1, enabledEnemyIds: ['common', 'fast'] },
  {
    timeSeconds: 180,
    spawnIntervalSeconds: 1.3,
    hpMultiplier: 1.3,
    enabledEnemyIds: ['common', 'fast', 'tank'],
  },
  {
    timeSeconds: 300,
    spawnIntervalSeconds: 1.0,
    hpMultiplier: 1.5,
    enabledEnemyIds: ['common', 'fast', 'tank'],
  },
  {
    timeSeconds: 420,
    spawnIntervalSeconds: 0.8,
    hpMultiplier: 1.7,
    enabledEnemyIds: ['common', 'fast', 'tank'],
  },
  {
    timeSeconds: 540,
    spawnIntervalSeconds: 0.7,
    hpMultiplier: 2.0,
    enabledEnemyIds: ['common', 'fast', 'tank'],
  },
  {
    timeSeconds: 720,
    spawnIntervalSeconds: 0.65,
    hpMultiplier: 2.3,
    enabledEnemyIds: ['common', 'fast', 'tank'],
  },
  {
    timeSeconds: 900,
    spawnIntervalSeconds: 0.6,
    hpMultiplier: 2.7,
    enabledEnemyIds: ['common', 'fast', 'tank'],
  },
  {
    timeSeconds: 1080,
    spawnIntervalSeconds: 0.55,
    hpMultiplier: 3.1,
    enabledEnemyIds: ['common', 'fast', 'tank'],
  },
  {
    timeSeconds: 1200,
    spawnIntervalSeconds: 0.55,
    hpMultiplier: 3.5,
    enabledEnemyIds: ['common', 'fast', 'tank'],
  },
  {
    timeSeconds: 1380,
    spawnIntervalSeconds: 0.5,
    hpMultiplier: 4.0,
    enabledEnemyIds: ['common', 'fast', 'tank'],
  },
  {
    timeSeconds: 1500,
    spawnIntervalSeconds: 0.45,
    hpMultiplier: 4.5,
    enabledEnemyIds: ['common', 'fast', 'tank'],
  },
];
