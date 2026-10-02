import Phaser from 'phaser';
import { mage } from '../data/classes';
import { movingEarth } from '../data/skills';
import { calculateStats, type EquippedPassive } from '../systems/CombatSystem';
import { XpSystem } from '../systems/XpSystem';
import type { Path } from '../data/types';
import { EventBus } from '../core/EventBus';

// How long the dash's burst of movement lasts. Distance and recarga come
// from data/skills.ts (Terra Móvel); this is purely the animation timing.
const DASH_DURATION_SECONDS = 0.15;

export class Player extends Phaser.Physics.Arcade.Sprite {
  maxHp: number;
  hp: number;
  readonly speed: number;
  readonly physicalDefense: number;
  readonly pickupRadius: number;
  private readonly xpSystem = new XpSystem();
  // Last non-zero movement direction (unit vector), used by directional
  // skills like Asas da Fênix. Faces down by default, before any input.
  facingX = 0;
  facingY = 1;
  // Untouchable while dashing (Terra Móvel) — GameScene skips contact
  // damage entirely for the duration.
  invulnerable = false;
  dashCooldownRemaining = 0;

  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly wasdKeys: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private readonly dashKey: Phaser.Input.Keyboard.Key;
  private dashLevel = 1;
  private dashRemainingSeconds = 0;
  private dashDirX = 0;
  private dashDirY = 0;
  private dashSpeed = 0;
  private damageFlashEvent?: Phaser.Time.TimerEvent;
  private virtualMoveX = 0;
  private virtualMoveY = 0;
  private dashRequested = false;
  private currentAnim = '';
  // Set each frame by GameScene so Terra Móvel também recebe Serenidade e
  // o aditivo de Cultivo, como qualquer outra skill (spec.md §5.1).
  private cultivationEquippedPassives: EquippedPassive[] = [];
  private cultivationPath: Path | undefined;

  constructor(scene: Phaser.Scene, x: number, y: number, classDef = mage) {
    super(scene, x, y, 'mage', 4);

    this.maxHp = classDef.maxHp;
    this.hp = classDef.maxHp;
    this.speed = classDef.speed;
    this.physicalDefense = classDef.physicalDefense;
    this.pickupRadius = classDef.pickupRadius;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Sprite source canvas is 92x92 (PixelLab padding for the staff), but
    // gameplay (collision box, pickup/contact radius reads via `.width`
    // elsewhere) expects the 32x32 footprint from docs/art/direction.md.
    // setSize (Arcade.Sprite) resizes the physics body too, so it must run
    // after physics.add.existing creates that body.
    this.setDisplaySize(32, 32);
    this.setSize(32, 32);

    this.setCollideWorldBounds(true);
    this.playAnim('mage-idle-south');

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
      this.playAnim(`mage-walk-${this.facingDirection()}`);
      if (this.dashRemainingSeconds <= 0) this.invulnerable = false;
      return;
    }

    let moveX = this.virtualMoveX;
    let moveY = this.virtualMoveY;

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
      this.playAnim(`mage-walk-${this.facingDirection()}`);
    } else {
      this.playAnim(`mage-idle-${this.facingDirection()}`);
    }

    this.setVelocity(moveX, moveY);

    const shouldDash = this.dashRequested || Phaser.Input.Keyboard.JustDown(this.dashKey);
    this.dashRequested = false;
    if (shouldDash && this.dashCooldownRemaining <= 0) {
      this.startDash();
    }
  }

  // Project art only has 4 orientations (docs/art/direction.md), so diagonal
  // movement snaps to whichever axis dominates the current facing vector.
  private facingDirection(): 'south' | 'north' | 'east' | 'west' {
    if (Math.abs(this.facingY) >= Math.abs(this.facingX)) {
      return this.facingY >= 0 ? 'south' : 'north';
    }
    return this.facingX >= 0 ? 'east' : 'west';
  }

  private playAnim(key: string): void {
    if (this.currentAnim === key) return;
    this.currentAnim = key;
    this.anims.play(key, true);
  }

  setVirtualMovement(x: number, y: number): void {
    const magnitude = Math.hypot(x, y);
    const scale = magnitude > 1 ? 1 / magnitude : 1;
    this.virtualMoveX = x * scale;
    this.virtualMoveY = y * scale;
  }

  requestDash(): void {
    this.dashRequested = true;
  }

  setCultivationContext(equippedPassives: EquippedPassive[], path: Path | undefined): void {
    this.cultivationEquippedPassives = equippedPassives;
    this.cultivationPath = path;
  }

  private startDash(): void {
    const stats = calculateStats(
      movingEarth,
      this.dashLevel,
      this.cultivationEquippedPassives,
      this.cultivationPath,
    );
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
    if (amount > 0) {
      this.setTintFill(0xff4444);
      this.damageFlashEvent?.remove(false);
      this.damageFlashEvent = this.scene.time.delayedCall(110, () => {
        this.clearTint();
        this.damageFlashEvent = undefined;
      });
    }
    this.hp = Math.max(0, this.hp - amount);
    EventBus.emit('hp-changed', this.hp, this.maxHp);
  }

  // Regen (Escudo de Fogo) e roubo de vida/cura por acerto passam por aqui,
  // então o HUD recebe 'hp-changed' independente da origem da cura.
  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    EventBus.emit('hp-changed', this.hp, this.maxHp);
  }

  addXp(amount: number): void {
    this.xpSystem.addXp(amount);
  }

  // Upgrade card "Vitalidade" (fallback quando não há mais nada a oferecer).
  increaseMaxHp(amount: number): void {
    this.maxHp += amount;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    EventBus.emit('hp-changed', this.hp, this.maxHp);
  }

  setDashLevel(level: number): void {
    this.dashLevel = level;
  }

  get dashCooldownDuration(): number {
    return (
      calculateStats(movingEarth, this.dashLevel, this.cultivationEquippedPassives, this.cultivationPath)
        .values.cooldown ?? 0
    );
  }

  get level(): number {
    return this.xpSystem.level;
  }

  get xp(): number {
    return this.xpSystem.xp;
  }
}
