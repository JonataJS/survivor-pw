import Phaser from 'phaser';
import { Pool } from '../core/Pool';
import { Projectile } from '../entities/Projectile';
import type { Enemy } from '../entities/Enemy';
import type { SpawnSystem } from './SpawnSystem';
import { calculateDamage } from './CombatSystem';

export class ProjectileSystem {
  private readonly pool: Pool<Projectile>;
  private readonly active = new Set<Projectile>();

  constructor(private readonly scene: Phaser.Scene) {
    this.pool = new Pool<Projectile>(
      () => new Projectile(this.scene),
      (projectile) => projectile.deactivate(),
    );
  }

  spawn(x: number, y: number, target: Enemy, damage: number, textureKey: string): void {
    const projectile = this.pool.acquire();
    projectile.fire(x, y, target, damage, textureKey);
    this.active.add(projectile);
  }

  update(deltaMs: number, spawnSystem: SpawnSystem): void {
    for (const projectile of this.active) {
      if (!projectile.target || !projectile.target.active) {
        this.release(projectile);
        continue;
      }

      projectile.travel(deltaMs);

      const distance = Phaser.Math.Distance.Between(
        projectile.x,
        projectile.y,
        projectile.target.x,
        projectile.target.y,
      );

      if (distance <= projectile.hitRadius + projectile.target.contactRadius) {
        this.applyHit(projectile, spawnSystem);
        continue;
      }

      if (projectile.expired) {
        this.release(projectile);
      }
    }
  }

  private applyHit(projectile: Projectile, spawnSystem: SpawnSystem): void {
    const enemy = projectile.target;
    this.release(projectile);
    if (!enemy) return;

    enemy.hp -= calculateDamage(projectile.damage);
    if (enemy.hp <= 0) {
      spawnSystem.release(enemy);
    }
  }

  private release(projectile: Projectile): void {
    this.active.delete(projectile);
    this.pool.release(projectile);
  }
}
