import Phaser from 'phaser';
import type { EnemyDef } from '../data/types';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  def!: EnemyDef;
  hp = 0;
  moveSpeed = 0;
  contactRadius = 0;
  contactCooldown = 0;
  slowMultiplier = 1;
  private slowRemaining = 0;
  // Bumped on every spawn() so stale external references (e.g. a Projectile
  // still in flight) can detect that the pool recycled this instance into a
  // different logical enemy, even though the JS object is the same.
  generation = 0;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'enemy-common');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.deactivate();
  }

  spawn(def: EnemyDef, x: number, y: number, hpMultiplier: number): void {
    this.generation += 1;
    this.def = def;
    this.hp = def.hp * hpMultiplier;
    this.moveSpeed = def.speed;
    this.contactCooldown = 0;
    this.slowMultiplier = 1;
    this.slowRemaining = 0;

    this.setTexture(`enemy-${def.id}`);
    this.contactRadius = this.width / 2;
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.reset(x, y);
  }

  deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0, 0);

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (body) body.enable = false;
  }

  // Keeps the stronger/longer slow instead of letting a weaker one shorten it.
  applySlow(percentage: number, durationSeconds: number): void {
    this.slowMultiplier = Math.min(this.slowMultiplier, 1 - percentage);
    this.slowRemaining = Math.max(this.slowRemaining, durationSeconds);
  }

  tickStatus(deltaSeconds: number): void {
    if (this.slowRemaining <= 0) return;

    this.slowRemaining -= deltaSeconds;
    if (this.slowRemaining <= 0) {
      this.slowRemaining = 0;
      this.slowMultiplier = 1;
    }
  }

  // Instant displacement (Asas da Fênix). Uses body.reset so the physics
  // body and the sprite transform move together, same as spawn().
  knockback(dirX: number, dirY: number, distance: number): void {
    if (!this.active || distance <= 0) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.reset(this.x + dirX * distance, this.y + dirY * distance);
  }

  chase(targetX: number, targetY: number): void {
    if (!this.active) return;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const length = Math.hypot(dx, dy);

    if (length > 0) {
      const speed = this.moveSpeed * this.slowMultiplier;
      this.setVelocity((dx / length) * speed, (dy / length) * speed);
    } else {
      this.setVelocity(0, 0);
    }
  }
}
