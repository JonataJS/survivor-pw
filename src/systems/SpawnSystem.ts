import Phaser from 'phaser';
import { Pool } from '../core/Pool';
import { createRng, pickOne, type Rng } from '../core/rng';
import { SpatialGrid } from '../core/SpatialGrid';
import { Enemy } from '../entities/Enemy';
import { enemies as enemyDefs } from '../data/enemies';
import { waves } from '../data/waves';
import type { EnemyDef, WaveDef } from '../data/types';
import { pickSpawnPoint, pickWaveForTime, type Point, type ViewRect } from './spawnLogic';

const SPAWN_MARGIN = 80;
const GRID_CELL_SIZE = 64;

export class SpawnSystem {
  readonly activeEnemies = new Set<Enemy>();
  readonly grid = new SpatialGrid<Enemy>(GRID_CELL_SIZE);

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
    for (const enemy of this.activeEnemies) {
      enemy.contactCooldown = Math.max(0, enemy.contactCooldown - deltaMs / 1000);
      this.grid.move(enemy, enemy.x, enemy.y);
    }

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
    this.grid.remove(enemy);
    this.pool.release(enemy);
  }

  // Debug helper (T016): drops `count` enemies of random types around the
  // camera view, ignoring wave gating, to stress-test pools/grid/rendering.
  spawnBurst(count: number, view: ViewRect): void {
    for (let i = 0; i < count; i++) {
      const def = pickOne(this.rng, enemyDefs);
      const point = pickSpawnPoint(this.rng, view, SPAWN_MARGIN, this.worldWidth, this.worldHeight);
      this.spawnEnemy(def, point, 1);
    }
  }

  private spawnOne(wave: WaveDef, view: ViewRect): void {
    const availableDefs = enemyDefs.filter((def) => wave.enabledEnemyIds.includes(def.id));
    if (availableDefs.length === 0) return;

    const def = pickOne(this.rng, availableDefs);
    const point = pickSpawnPoint(this.rng, view, SPAWN_MARGIN, this.worldWidth, this.worldHeight);
    this.spawnEnemy(def, point, wave.hpMultiplier);
  }

  private spawnEnemy(def: EnemyDef, point: Point, hpMultiplier: number): void {
    const enemy = this.pool.acquire();
    enemy.spawn(def, point.x, point.y, hpMultiplier);
    this.activeEnemies.add(enemy);
    this.grid.insert(enemy, point.x, point.y);
  }
}
