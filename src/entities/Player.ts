import Phaser from 'phaser';
import { mage } from '../data/classes';

export class Player extends Phaser.Physics.Arcade.Sprite {
  readonly maxHp: number = mage.maxHp;
  hp: number = mage.maxHp;
  readonly speed: number = mage.speed;
  readonly physicalDefense: number = mage.physicalDefense;
  readonly pickupRadius: number = mage.pickupRadius;
  xp = 0;
  // Last non-zero movement direction (unit vector), used by directional
  // skills like Asas da Fênix. Faces down by default, before any input.
  facingX = 0;
  facingY = 1;

  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly wasdKeys: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);

    const keyboard = scene.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;
    this.cursors = keyboard.createCursorKeys();
    this.wasdKeys = keyboard.addKeys('W,A,S,D') as Record<
      'W' | 'A' | 'S' | 'D',
      Phaser.Input.Keyboard.Key
    >;
  }

  update(): void {
    let moveX = 0;
    let moveY = 0;

    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) moveX -= 1;
    if (this.cursors.right.isDown || this.wasdKeys.D.isDown) moveX += 1;
    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) moveY -= 1;
    if (this.cursors.down.isDown || this.wasdKeys.S.isDown) moveY += 1;

    const length = Math.hypot(moveX, moveY);
    if (length > 0) {
      this.facingX = moveX / length;
      this.facingY = moveY / length;
      moveX = this.facingX * this.speed;
      moveY = this.facingY * this.speed;
    }

    this.setVelocity(moveX, moveY);
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
  }

  addXp(amount: number): void {
    this.xp += amount;
  }
}
