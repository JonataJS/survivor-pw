import Phaser from 'phaser';
import type { EnemyDef } from '../data/types';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  def!: EnemyDef;
  hp = 0;
  moveSpeed = 0;
  contactRadius = 0;
  contactCooldown = 0;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'enemy-common');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.deactivate();
  }

  spawn(def: EnemyDef, x: number, y: number, hpMultiplier: number): void {
    this.def = def;
    this.hp = def.hp * hpMultiplier;
    this.moveSpeed = def.speed;
    this.contactCooldown = 0;

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

  chase(targetX: number, targetY: number): void {
    if (!this.active) return;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const length = Math.hypot(dx, dy);

    if (length > 0) {
      this.setVelocity((dx / length) * this.moveSpeed, (dy / length) * this.moveSpeed);
    } else {
      this.setVelocity(0, 0);
    }
  }
}
