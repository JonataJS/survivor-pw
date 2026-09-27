import Phaser from 'phaser';
import { createTextButton } from '../ui/textButton';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('Pause');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
    this.add.text(width / 2, height / 2 - 60, 'Pausado', { fontSize: '36px' }).setOrigin(0.5);

    createTextButton(this, width / 2, height / 2 + 20, 'Continuar', () => {
      this.scene.stop();
      this.scene.resume('Game');
    });

    createTextButton(this, width / 2, height / 2 + 80, 'Sair', () => {
      this.scene.stop();
      this.scene.stop('Game');
      this.scene.stop('Hud');
      this.scene.start('Menu');
    });
  }
}
