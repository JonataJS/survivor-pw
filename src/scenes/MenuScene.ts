import Phaser from 'phaser';
import { createTextButton } from '../ui/textButton';
import { scoreService } from '../services/LocalScoreService';

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

    void scoreService.getBestRun().then((bestRun) => {
      if (!bestRun || !this.scene.isActive()) return;
      this.add
        .text(
          width / 2,
          height / 2 + 145,
          `Recorde: ${this.formatTime(bestRun.survivedSeconds)} · ${bestRun.kills} mortes · nível ${bestRun.level}`,
          { fontSize: '18px', color: '#ffd75e', align: 'center' },
        )
        .setOrigin(0.5);
    });
  }

  private formatTime(totalSeconds: number): string {
    const seconds = Math.floor(totalSeconds);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
}
