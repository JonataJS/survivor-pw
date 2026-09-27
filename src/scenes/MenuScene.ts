import Phaser from 'phaser';
import { createTextButton } from '../ui/textButton';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 120, 'Survivor PW', { fontSize: '48px' }).setOrigin(0.5);

    createTextButton(this, width / 2, height / 2, 'Jogar', () => {
      this.scene.start('Game');
      this.scene.launch('Hud');
    });
  }
}
