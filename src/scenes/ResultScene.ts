import Phaser from 'phaser';
import { createTextButton } from '../ui/textButton';
import type { RunResult } from '../systems/StatsTracker';
import { scoreService } from '../services/LocalScoreService';
import { resolveRunSetup, type RunSetup } from '../systems/runSetup';

interface ResultSceneData extends RunResult {
  setup?: RunSetup;
}

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('Result');
  }

  create(data: ResultSceneData): void {
    const { width, height } = this.scale;
    const setup = resolveRunSetup(data.setup) ?? resolveRunSetup()!;
    this.cameras.main.setBackgroundColor('#101820');
    void scoreService.saveRun(data);

    this.add
      .text(width / 2, 48, data.victory ? 'Vitória!' : 'Derrota', {
        fontSize: '42px',
        color: data.victory ? '#ffd75e' : '#ff7777',
      })
      .setOrigin(0.5);

    const summary = [
      `Tempo sobrevivido: ${this.formatTime(data.survivedSeconds)}`,
      `Nível: ${data.level}`,
      `Cultivo: ${data.cultivationPath ? this.formatPath(data.cultivationPath) : 'Não escolhido'}`,
      `Inimigos derrotados: ${data.kills}`,
    ];
    summary.forEach((line, index) => {
      this.add
        .text(width / 2, 112 + index * 36, line, {
          fontSize: '22px',
          color: '#eeeeee',
        })
        .setOrigin(0.5);
    });

    this.add
      .text(width / 2, 274, 'Dano por skill', {
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const damageRows = [...data.damageBySkill].sort((a, b) => b.damage - a.damage);
    if (damageRows.length === 0) {
      this.add
        .text(width / 2, 318, 'Nenhum dano registrado', { fontSize: '18px', color: '#bbbbbb' })
        .setOrigin(0.5);
    } else {
      damageRows.forEach((skill, index) => {
        this.add
          .text(width / 2, 316 + index * 34, `${skill.skillName}: ${Math.round(skill.damage)}`, {
            fontSize: '19px',
            color: '#dddddd',
          })
          .setOrigin(0.5);
      });
    }

    createTextButton(this, width / 2, height - 54, 'Jogar de novo', () => {
      this.scene.start('Game', setup);
    });
  }

  private formatTime(totalSeconds: number): string {
    const seconds = Math.floor(Math.max(0, totalSeconds));
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  }

  private formatPath(path: 'god' | 'evil'): string {
    return path === 'god' ? 'God' : 'Evil';
  }
}
