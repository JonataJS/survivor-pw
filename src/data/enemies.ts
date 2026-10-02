import type { EnemyDef } from './types';

// contactDamage values below were lowered from their original 5/4/10 after
// the player's contact hitbox grew from 16px to 48px radius to match the
// tripled sprite (Player.ts), which roughly doubles how far away an enemy
// already counts as "touching" the player. Divided by that per-enemy
// threshold growth (~2.2x common, ~2.4x fast, ~2.0x tank) to keep the
// effective damage-per-second the mage's 80 HP, 0-defense glass cannon
// (docs/spec.md §"Mago") takes from contact roughly where it was.
export const common: EnemyDef = {
  id: 'common',
  name: 'Comum',
  hp: 10,
  speed: 60,
  contactDamage: 2.2,
  xp: 1,
  spawnFromSeconds: 0,
};

export const fast: EnemyDef = {
  id: 'fast',
  name: 'Rápido',
  hp: 6,
  speed: 120,
  contactDamage: 1.7,
  xp: 1,
  spawnFromSeconds: 90,
};

export const tank: EnemyDef = {
  id: 'tank',
  name: 'Tanque',
  hp: 60,
  speed: 40,
  contactDamage: 5,
  xp: 5,
  spawnFromSeconds: 180,
};

export const enemies: EnemyDef[] = [common, fast, tank];
