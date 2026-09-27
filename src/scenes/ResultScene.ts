import Phaser from 'phaser';
import { createTextButton } from '../ui/textButton';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('Result');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 60, 'Resultado (placeholder)', { fontSize: '36px' }).setOrigin(0.5);

    createTextButton(this, width / 2, height / 2 + 20, 'Menu', () => {
      this.scene.start('Menu');
    });
  }
}
