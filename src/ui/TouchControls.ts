import Phaser from 'phaser';
import type { Player } from '../entities/Player';
import { calculateJoystickInput } from './joystickInput';

const JOYSTICK_RADIUS = 66;
const DASH_RADIUS = 44;

export class TouchControls {
  private readonly joystickBase: Phaser.GameObjects.Arc;
  private readonly joystickThumb: Phaser.GameObjects.Arc;
  private joystickPointerId: number | undefined;
  private joystickX = 0;
  private joystickY = 0;

  private readonly onPointerDown = (pointer: Phaser.Input.Pointer): void => {
    if (this.joystickPointerId === undefined) {
      const distance = Phaser.Math.Distance.Between(
        pointer.x,
        pointer.y,
        this.joystickX,
        this.joystickY,
      );
      if (distance <= JOYSTICK_RADIUS + 24) {
        this.joystickPointerId = pointer.id;
        this.updateJoystick(pointer);
        return;
      }
    }

    const dashX = this.scene.scale.width - 105;
    const dashY = this.scene.scale.height - 112;
    if (Phaser.Math.Distance.Between(pointer.x, pointer.y, dashX, dashY) <= DASH_RADIUS) {
      this.player.requestDash();
    }
  };

  private readonly onPointerMove = (pointer: Phaser.Input.Pointer): void => {
    if (pointer.id === this.joystickPointerId) this.updateJoystick(pointer);
  };

  private readonly onPointerUp = (pointer: Phaser.Input.Pointer): void => {
    if (pointer.id !== this.joystickPointerId) return;
    this.joystickPointerId = undefined;
    this.player.setVirtualMovement(0, 0);
    this.joystickThumb.setPosition(this.joystickX, this.joystickY);
  };

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
  ) {
    this.joystickX = 110;
    this.joystickY = scene.scale.height - 115;
    this.joystickBase = scene.add
      .circle(this.joystickX, this.joystickY, JOYSTICK_RADIUS + 18, 0xffffff, 0.18)
      .setStrokeStyle(3, 0xffffff, 0.55)
      .setScrollFactor(0)
      .setDepth(1000);
    this.joystickThumb = scene.add
      .circle(this.joystickX, this.joystickY, 25, 0xffffff, 0.65)
      .setStrokeStyle(2, 0xffffff, 0.9)
      .setScrollFactor(0)
      .setDepth(1001);

    const dashX = scene.scale.width - 105;
    const dashY = scene.scale.height - 112;
    scene.add
      .circle(dashX, dashY, DASH_RADIUS, 0x8a5a2b, 0.8)
      .setStrokeStyle(3, 0xffdd99, 0.9)
      .setScrollFactor(0)
      .setDepth(1000);
    scene.add
      .text(dashX, dashY, 'Dash', { fontSize: '18px', color: '#ffffff' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1001);

    scene.input.on('pointerdown', this.onPointerDown);
    scene.input.on('pointermove', this.onPointerMove);
    scene.input.on('pointerup', this.onPointerUp);
    scene.input.on('pointerupoutside', this.onPointerUp);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  private updateJoystick(pointer: Phaser.Input.Pointer): void {
    const input = calculateJoystickInput(
      pointer.x - this.joystickX,
      pointer.y - this.joystickY,
      JOYSTICK_RADIUS,
    );
    const thumbDistance = Math.hypot(input.x, input.y) * JOYSTICK_RADIUS;
    const angle = Math.atan2(input.y, input.x);
    this.joystickThumb.setPosition(
      this.joystickX + Math.cos(angle) * thumbDistance,
      this.joystickY + Math.sin(angle) * thumbDistance,
    );
    this.player.setVirtualMovement(input.x, input.y);
  }

  private destroy(): void {
    this.scene.input.off('pointerdown', this.onPointerDown);
    this.scene.input.off('pointermove', this.onPointerMove);
    this.scene.input.off('pointerup', this.onPointerUp);
    this.scene.input.off('pointerupoutside', this.onPointerUp);
    this.player.setVirtualMovement(0, 0);
    this.joystickBase.destroy();
    this.joystickThumb.destroy();
  }
}
