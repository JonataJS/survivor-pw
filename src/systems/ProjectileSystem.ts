import Phaser from 'phaser';
import { Pool } from '../core/Pool';
import { Projectile } from '../entities/Projectile';
import type { Enemy } from '../entities/Enemy';

export type DealDamage = (enemy: Enemy, damage: number) => void;

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

  update(deltaMs: number, dealDamage: DealDamage): void {
    for (const projectile of this.active) {
      if (!projectile.hasLiveTarget) {
        this.release(projectile);
        continue;
      }

      const target = projectile.target as Enemy;
      projectile.travel(deltaMs);

      const distance = Phaser.Math.Distance.Between(projectile.x, projectile.y, target.x, target.y);

      if (distance <= projectile.hitRadius + target.contactRadius) {
        dealDamage(target, projectile.damage);
        this.release(projectile);
        continue;
      }

      if (projectile.expired) {
        this.release(projectile);
      }
    }
  }

  private release(projectile: Projectile): void {
    this.active.delete(projectile);
    this.pool.release(projectile);
  }
}
