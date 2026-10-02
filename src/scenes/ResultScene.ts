import Phaser from 'phaser';
import { createTextButton } from '../ui/textButton';
import type { RunResult } from '../systems/StatsTracker';
import { scoreService } from '../services/LocalScoreService';
import { resolveRunSetup, type RunSetup } from '../systems/runSetup';
import { COLORS, FONT_BODY, FONT_TITLE, drawBackdrop, drawPanel } from '../ui/theme';

interface ResultSceneData extends RunResult {
  setup?: RunSetup;
}

const PANEL_WIDTH = 460;

export class ResultScene extends Phaser.Scene {
  constructor() {
    super('Result');
  }

  create(data: ResultSceneData): void {
    const { width, height } = this.scale;
    const setup = resolveRunSetup(data.setup) ?? resolveRunSetup()!;
    void scoreService.saveRun(data);

    drawBackdrop(this, width, height);

    const damageRows = [...data.damageBySkill].sort((a, b) => b.damage - a.damage);
    const summaryLines = [
      `Tempo sobrevivido: ${this.formatTime(data.survivedSeconds)}`,
      `Nível: ${data.level}`,
      `Cultivo: ${data.cultivationPath ? this.formatPath(data.cultivationPath) : 'Não escolhido'}`,
      `Inimigos derrotados: ${data.kills}`,
    ];

    // Offsets below are measured from the panel's top edge (panelTop), matching
    // exactly where each line of text gets placed further down — so the panel
    // height just needs to reach the last line's offset plus bottom padding,
    // instead of guessing at a size and leaving empty space underneath.
    const lastSummaryOffset = 30 + (summaryLines.length - 1) * 30;
    const damageTitleOffset = 30 + summaryLines.length * 30 + 24;
    const lastContentOffset =
      damageRows.length === 0
        ? damageTitleOffset + 32
        : damageTitleOffset + 34 + (damageRows.length - 1) * 28;
    const panelHeight = Math.min(height - 180, Math.max(lastSummaryOffset, lastContentOffset) + 30);
    const panelY = 90 + panelHeight / 2;
    const panel = this.add.graphics();
    drawPanel(panel, PANEL_WIDTH, panelHeight, COLORS.panel, COLORS.borderBronze, 12);
    panel.setPosition(width / 2, panelY);

    this.add
      .text(width / 2, 48, data.victory ? 'Vitória!' : 'Derrota', {
        fontSize: '42px',
        fontFamily: FONT_TITLE,
        fontStyle: 'bold',
        color: data.victory ? COLORS.textGold : '#e05a5a',
      })
      .setOrigin(0.5)
      .setLetterSpacing(1)
      .setShadow(0, 2, '#000000', 4, true, true);

    const panelTop = panelY - panelHeight / 2;
    summaryLines.forEach((line, index) => {
      this.add
        .text(width / 2, panelTop + 30 + index * 30, line, {
          fontSize: '20px',
          fontFamily: FONT_BODY,
          color: COLORS.textCream,
        })
        .setOrigin(0.5);
    });

    const damageTitleY = panelTop + 30 + summaryLines.length * 30 + 24;
    this.add
      .text(width / 2, damageTitleY, 'Dano por skill', {
        fontSize: '22px',
        fontFamily: FONT_TITLE,
        color: COLORS.textGold,
      })
      .setOrigin(0.5);

    if (damageRows.length === 0) {
      this.add
        .text(width / 2, damageTitleY + 32, 'Nenhum dano registrado', {
          fontSize: '17px',
          fontFamily: FONT_BODY,
          color: COLORS.textMuted,
        })
        .setOrigin(0.5);
    } else {
      damageRows.forEach((skill, index) => {
        this.add
          .text(width / 2, damageTitleY + 34 + index * 28, `${skill.skillName}: ${Math.round(skill.damage)}`, {
            fontSize: '18px',
            fontFamily: FONT_BODY,
            color: COLORS.textMuted,
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
