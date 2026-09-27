import Phaser from 'phaser';
import { createTextButton } from '../ui/textButton';

export class LevelUpScene extends Phaser.Scene {
  constructor() {
    super('LevelUp');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
    this.add.text(width / 2, height / 2 - 60, 'Level Up (placeholder)', { fontSize: '32px' }).setOrigin(0.5);

    createTextButton(this, width / 2, height / 2 + 20, 'Escolher', () => {
      this.scene.stop();
      this.scene.resume('Game');
    });
  }
}
