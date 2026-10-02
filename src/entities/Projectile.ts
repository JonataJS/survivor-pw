import Phaser from 'phaser';
import type { Enemy } from './Enemy';
import type { DamageEffects } from '../skills/Skill';

const PROJECTILE_SPEED = 500;
const MAX_LIFETIME_MS = 3000;
// Fixed collision radius, independent of whichever texture/animation is
// currently assigned (the PixelLab VFX frames are 32px, the old placeholder
// circle was 12px) — keeps hit detection stable across art swaps.
const PROJECTILE_HIT_RADIUS = 6;

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  damage = 0;
  target?: Enemy;
  effects?: DamageEffects;
  skillId?: string;
  private targetGeneration = -1;
  private lifetimeMs = 0;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'projectile-fire');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.deactivate();
  }

  fire(
    x: number,
    y: number,
    target: Enemy,
    damage: number,
    textureKey: string,
    effects?: DamageEffects,
    tint = 0xffffff,
    skillId?: string,
    animKey?: string,
  ): void {
    this.target = target;
    this.targetGeneration = target.generation;
    this.damage = damage;
    this.effects = effects;
    this.skillId = skillId;
    this.lifetimeMs = 0;

    this.setTexture(textureKey);
    if (animKey) this.play(animKey);
    this.setTint(tint);
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
    this.anims.stop();
    this.target = undefined;
    this.effects = undefined;
    this.skillId = undefined;

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (body) body.enable = false;
  }

  // Homing: chases the live position of its target every frame, guaranteeing
  // a hit as long as the target stays alive (enemies are much slower).
  travel(deltaMs: number): void {
    this.lifetimeMs += deltaMs;
    if (!this.target) return;

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const length = Math.hypot(dx, dy);
    if (length > 0) {
      this.setVelocity((dx / length) * PROJECTILE_SPEED, (dy / length) * PROJECTILE_SPEED);
    }
  }

  // False once the target dies AND the pool recycles that same JS object
  // into a different enemy (generation mismatch) — not just active===false,
  // since a stale projectile shouldn't suddenly start chasing the new one.
  get hasLiveTarget(): boolean {
    return !!this.target && this.target.active && this.target.generation === this.targetGeneration;
  }

  get hitRadius(): number {
    return PROJECTILE_HIT_RADIUS;
  }

  get expired(): boolean {
    return this.lifetimeMs >= MAX_LIFETIME_MS;
  }
}
