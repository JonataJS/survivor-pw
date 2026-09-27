import Phaser from 'phaser';
import { Pool } from '../core/Pool';
import { createRng, pickOne, type Rng } from '../core/rng';
import { Enemy } from '../entities/Enemy';
import { enemies as enemyDefs } from '../data/enemies';
import { waves } from '../data/waves';
import type { WaveDef } from '../data/types';
import { pickSpawnPoint, pickWaveForTime, type ViewRect } from './spawnLogic';

const SPAWN_MARGIN = 80;

export class SpawnSystem {
  readonly activeEnemies = new Set<Enemy>();

  private readonly pool: Pool<Enemy>;
  private readonly rng: Rng;
  private timeSinceLastSpawn = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly worldWidth: number,
    private readonly worldHeight: number,
    seed = Date.now(),
  ) {
    this.pool = new Pool<Enemy>(
      () => new Enemy(this.scene),
      (enemy) => enemy.deactivate(),
    );
    this.rng = createRng(seed);
  }

  update(deltaMs: number, elapsedMatchSeconds: number, view: ViewRect): void {
    const wave = pickWaveForTime(waves, elapsedMatchSeconds);
    this.timeSinceLastSpawn += deltaMs / 1000;

    if (this.timeSinceLastSpawn >= wave.spawnIntervalSeconds) {
      this.timeSinceLastSpawn = 0;
      this.spawnOne(wave, view);
    }
  }

  chaseAll(targetX: number, targetY: number): void {
    for (const enemy of this.activeEnemies) {
      enemy.chase(targetX, targetY);
    }
  }

  release(enemy: Enemy): void {
    this.activeEnemies.delete(enemy);
    this.pool.release(enemy);
  }

  private spawnOne(wave: WaveDef, view: ViewRect): void {
    const availableDefs = enemyDefs.filter((def) => wave.enabledEnemyIds.includes(def.id));
    if (availableDefs.length === 0) return;

    const def = pickOne(this.rng, availableDefs);
    const point = pickSpawnPoint(this.rng, view, SPAWN_MARGIN, this.worldWidth, this.worldHeight);

    const enemy = this.pool.acquire();
    enemy.spawn(def, point.x, point.y, wave.hpMultiplier);
    this.activeEnemies.add(enemy);
  }
}
