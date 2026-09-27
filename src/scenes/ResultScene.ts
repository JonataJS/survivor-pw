import Phaser from 'phaser';
import { createTextButton } from '../ui/textButton';

interface ResultData {
  victory?: boolean;
}

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('Result');
  }

  create(data: ResultData = {}): void {
    const { width, height } = this.scale;
    const outcomeText = data.victory ? 'Vitória!' : 'Derrota';

    this.add.text(width / 2, height / 2 - 60, outcomeText, { fontSize: '36px' }).setOrigin(0.5);

    createTextButton(this, width / 2, height / 2 + 20, 'Menu', () => {
      this.scene.start('Menu');
    });
  }
}
