import Phaser from 'phaser';
import { createTextButton } from '../ui/textButton';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create(): void {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#0a2a12');
    this.add.text(width / 2, 40, 'Game (placeholder)', { fontSize: '24px' }).setOrigin(0.5);

    createTextButton(this, width / 2 - 220, height - 100, 'Pausar', () => {
      this.scene.pause();
      this.scene.launch('Pause');
    });

    createTextButton(this, width / 2 - 70, height - 100, 'Level Up', () => {
      this.scene.pause();
      this.scene.launch('LevelUp');
    });

    createTextButton(this, width / 2 + 100, height - 100, 'Cultivo', () => {
      this.scene.pause();
      this.scene.launch('Cultivation');
    });

    createTextButton(this, width / 2, height - 40, 'Terminar partida', () => {
      this.scene.stop('Hud');
      this.scene.start('Result');
    });
  }
}
