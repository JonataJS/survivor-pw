import Phaser from 'phaser';
import { createTextButton } from '../ui/textButton';

export class PauseScene extends Phaser.Scene {
  private resumeKeyHandler!: (event: KeyboardEvent) => void;

  constructor() {
    super('Pause');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
    this.add.text(width / 2, height / 2 - 60, 'Pausado', { fontSize: '36px' }).setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 15, 'Pressione Esc ou P para continuar', {
        fontSize: '18px',
        color: '#dddddd',
      })
      .setOrigin(0.5);

    createTextButton(this, width / 2, height / 2 + 45, 'Continuar', () => this.resumeGame());

    createTextButton(this, width / 2, height / 2 + 110, 'Sair para o menu', () => this.exitToMenu());

    this.resumeKeyHandler = (event) => {
      if (event.repeat) return;
      if (event.code === 'Escape' || event.code === 'KeyP') this.resumeGame();
    };
    this.input.keyboard?.on('keydown', this.resumeKeyHandler);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.resumeKeyHandler);
    });
  }

  private resumeGame(): void {
    this.scene.stop();
    this.scene.resume('Game');
  }

  private exitToMenu(): void {
    this.scene.stop('Game');
    this.scene.stop('Hud');
    this.scene.start('Menu');
  }
}
