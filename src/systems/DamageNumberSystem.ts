import Phaser from 'phaser';
import { Pool } from '../core/Pool';
import { DamageNumber } from '../entities/DamageNumber';

const CRIT_FONT_SIZE = '28px';
const CRIT_COLOR = '#ffdd33';
const RISE_DISTANCE = 40;
const DURATION_MS = 700;

// T046: só o número de crítico existe por enquanto (maior, dourado, com
// "!"); números para todo acerto normal são o T061.
export class DamageNumberSystem {
  private readonly pool: Pool<DamageNumber>;

  constructor(private readonly scene: Phaser.Scene) {
    this.pool = new Pool<DamageNumber>(
      () => new DamageNumber(this.scene),
      (number) => number.deactivate(),
    );
  }

  playCrit(x: number, y: number, amount: number): void {
    const number = this.pool.acquire();
    number.setText(`${Math.round(amount)}!`);
    number.setStyle({ fontSize: CRIT_FONT_SIZE, color: CRIT_COLOR, fontStyle: 'bold' });
    number.setPosition(x, y);
    number.setAlpha(1);
    number.setActive(true);
    number.setVisible(true);

    this.scene.tweens.add({
      targets: number,
      y: y - RISE_DISTANCE,
      alpha: 0,
      duration: DURATION_MS,
      ease: Phaser.Math.Easing.Cubic.Out,
      onComplete: () => this.pool.release(number),
    });
  }
}
