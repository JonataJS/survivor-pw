import type { WaveDef } from './types';

// Curva de spawn: fica mais rápida e o HP dos inimigos escala com o tempo.
// Ajustável durante o balanceamento (T060).
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
    hpMultiplier: 1.6,
    enabledEnemyIds: ['common', 'fast', 'tank'],
  },
  {
    timeSeconds: 420,
    spawnIntervalSeconds: 0.8,
    hpMultiplier: 2.0,
    enabledEnemyIds: ['common', 'fast', 'tank'],
  },
  {
    timeSeconds: 540,
    spawnIntervalSeconds: 0.6,
    hpMultiplier: 2.4,
    enabledEnemyIds: ['common', 'fast', 'tank'],
  },
];
