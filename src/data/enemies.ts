import type { EnemyDef } from './types';

export const common: EnemyDef = {
  id: 'common',
  name: 'Comum',
  hp: 10,
  speed: 60,
  contactDamage: 5,
  xp: 1,
  spawnFromSeconds: 0,
};

export const fast: EnemyDef = {
  id: 'fast',
  name: 'Rápido',
  hp: 6,
  speed: 120,
  contactDamage: 4,
  xp: 1,
  spawnFromSeconds: 90,
};

export const tank: EnemyDef = {
  id: 'tank',
  name: 'Tanque',
  hp: 60,
  speed: 40,
  contactDamage: 10,
  xp: 5,
  spawnFromSeconds: 180,
};

export const enemies: EnemyDef[] = [common, fast, tank];
