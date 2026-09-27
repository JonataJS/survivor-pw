import Phaser from 'phaser';
import { createTextButton } from '../ui/textButton';

export class CultivationScene extends Phaser.Scene {
  constructor() {
    super('Cultivation');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
    this.add.text(width / 2, height / 2 - 60, 'Cultivo (placeholder)', { fontSize: '32px' }).setOrigin(0.5);

    createTextButton(this, width / 2 - 100, height / 2 + 20, 'God', () => {
      this.scene.stop();
      this.scene.resume('Game');
    });

    createTextButton(this, width / 2 + 100, height / 2 + 20, 'Evil', () => {
      this.scene.stop();
      this.scene.resume('Game');
    });
  }
}
