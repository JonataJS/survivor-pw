import Phaser from 'phaser';

const ATTRACT_SPEED = 350;

export class XpGem extends Phaser.Physics.Arcade.Sprite {
  value = 0;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'gem');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.deactivate();
  }

  spawn(x: number, y: number, value: number): void {
    this.value = value;
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

  attractTo(targetX: number, targetY: number): void {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const length = Math.hypot(dx, dy);
    if (length > 0) {
      this.setVelocity((dx / length) * ATTRACT_SPEED, (dy / length) * ATTRACT_SPEED);
    }
  }
}
