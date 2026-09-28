import Phaser from 'phaser';
import { createTextButton } from '../ui/textButton';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 180, 'Survivor PW', { fontSize: '48px' }).setOrigin(0.5);

    this.add
      .text(
        width / 2,
        height / 2 - 100,
        'Controles\nMover: WASD ou setas\nTerra Móvel (dash): Espaço\nPausar: Esc ou P',
        { fontSize: '22px', color: '#dddddd', align: 'center', lineSpacing: 10 },
      )
      .setOrigin(0.5);

    createTextButton(this, width / 2, height / 2 + 70, 'Jogar', () => {
      this.scene.start('Game');
    });
  }
}
