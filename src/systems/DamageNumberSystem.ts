import Phaser from 'phaser';
import { Pool } from '../core/Pool';
import { DamageNumber } from '../entities/DamageNumber';

const CRIT_FONT_SIZE = '28px';
const CRIT_COLOR = '#ffdd33';
const DAMAGE_FONT_SIZE = '16px';
const DAMAGE_COLOR = '#ffffff';
const RISE_DISTANCE = 40;
const DAMAGE_DURATION_MS = 500;
const CRIT_DURATION_MS = 700;

export class DamageNumberSystem {
  private readonly pool: Pool<DamageNumber>;

  constructor(private readonly scene: Phaser.Scene) {
    this.pool = new Pool<DamageNumber>(
      () => new DamageNumber(this.scene),
      (number) => number.deactivate(),
      64,
    );
  }

  playDamage(x: number, y: number, amount: number): void {
    this.play(x, y, Math.round(amount).toString(), DAMAGE_FONT_SIZE, DAMAGE_COLOR, DAMAGE_DURATION_MS);
  }

  playCrit(x: number, y: number, amount: number): void {
    this.play(x, y, `${Math.round(amount)}!`, CRIT_FONT_SIZE, CRIT_COLOR, CRIT_DURATION_MS);
  }

  private play(
    x: number,
    y: number,
    text: string,
    fontSize: string,
    color: string,
    duration: number,
  ): void {
    const number = this.pool.acquire();
    number.setText(text);
    number.setStyle({ fontSize, color, fontStyle: 'bold', stroke: '#171717', strokeThickness: 3 });
    number.setPosition(x, y);
    number.setAlpha(1);
    number.setActive(true);
    number.setVisible(true);

    this.scene.tweens.add({
      targets: number,
      y: y - RISE_DISTANCE,
      alpha: 0,
      duration,
      ease: Phaser.Math.Easing.Cubic.Out,
      onComplete: () => this.pool.release(number),
    });
  }
}
