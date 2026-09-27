import Phaser from 'phaser';
import { mage } from '../data/classes';
import { movingEarth } from '../data/skills';
import { calculateStats } from '../systems/CombatSystem';

// How long the dash's burst of movement lasts. Distance and recarga come
// from data/skills.ts (Terra Móvel); this is purely the animation timing.
const DASH_DURATION_SECONDS = 0.15;

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
  // Untouchable while dashing (Terra Móvel) — GameScene skips contact
  // damage entirely for the duration.
  invulnerable = false;
  dashCooldownRemaining = 0;
  readonly dashCooldownDuration: number = calculateStats(movingEarth, 1).values.cooldown ?? 0;

  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly wasdKeys: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private readonly dashKey: Phaser.Input.Keyboard.Key;
  private readonly dashLevel = 1;
  private dashRemainingSeconds = 0;
  private dashDirX = 0;
  private dashDirY = 0;
  private dashSpeed = 0;

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
    this.dashKey = keyboard.addKey('SPACE');
  }

  update(deltaSeconds: number): void {
    this.dashCooldownRemaining = Math.max(0, this.dashCooldownRemaining - deltaSeconds);

    if (this.dashRemainingSeconds > 0) {
      this.dashRemainingSeconds -= deltaSeconds;
      this.setVelocity(this.dashDirX * this.dashSpeed, this.dashDirY * this.dashSpeed);
      if (this.dashRemainingSeconds <= 0) this.invulnerable = false;
      return;
    }

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

    if (Phaser.Input.Keyboard.JustDown(this.dashKey) && this.dashCooldownRemaining <= 0) {
      this.startDash();
    }
  }

  private startDash(): void {
    const stats = calculateStats(movingEarth, this.dashLevel);
    const distance = stats.values.distance ?? 0;
    const cooldown = stats.values.cooldown ?? 0;
    if (distance <= 0) return;

    this.dashDirX = this.facingX;
    this.dashDirY = this.facingY;
    this.dashRemainingSeconds = DASH_DURATION_SECONDS;
    this.dashSpeed = distance / DASH_DURATION_SECONDS;
    this.invulnerable = true;
    this.dashCooldownRemaining = cooldown;
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
  }

  addXp(amount: number): void {
    this.xp += amount;
  }
}
