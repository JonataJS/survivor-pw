import Phaser from 'phaser';
import type { EquippedPassiveState, EquippedSkillState } from '../systems/UpgradeSystem';
import type { Path } from '../data/types';

export interface CultivationSceneData {
  equippedSkills: EquippedSkillState[];
  equippedPassives: EquippedPassiveState[];
  onChoose: (path: Path) => void;
}

const GOD_ACCENT = 0xffd700;
const GOD_TEXT = '#ffffff';
const EVIL_ACCENT = 0x8800ff;
const EVIL_TEXT = '#ff3355';

const COLUMN_WIDTH = 460;
const COLUMN_HEIGHT = 480;
const COLUMN_GAP = 60;

export class CultivationScene extends Phaser.Scene {
  private sceneData!: CultivationSceneData;
  private choiceMade = false;

  constructor() {
    super('Cultivation');
  }

  create(data: CultivationSceneData): void {
    this.sceneData = data;
    this.choiceMade = false;
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75);
    this.add
      .text(width / 2, height / 2 - COLUMN_HEIGHT / 2 - 50, 'Cultivo — escolha seu caminho', {
        fontSize: '30px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const centerX = width / 2;
    const y = height / 2;

    this.createColumn(
      centerX - COLUMN_GAP / 2 - COLUMN_WIDTH / 2,
      y,
      'god',
      'God',
      GOD_ACCENT,
      GOD_TEXT,
      1,
    );
    this.createColumn(
      centerX + COLUMN_GAP / 2 + COLUMN_WIDTH / 2,
      y,
      'evil',
      'Evil',
      EVIL_ACCENT,
      EVIL_TEXT,
      2,
    );

    const keyboard = this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;
    keyboard.addKey('ONE').on('down', () => this.selectPath('god'));
    keyboard.addKey('TWO').on('down', () => this.selectPath('evil'));
  }

  private createColumn(
    x: number,
    y: number,
    path: Path,
    label: string,
    accentColor: number,
    textColor: string,
    hotkeyNumber: number,
  ): void {
    const background = this.add
      .rectangle(x, y, COLUMN_WIDTH, COLUMN_HEIGHT, 0x1a1a1a, 0.95)
      .setStrokeStyle(4, accentColor)
      .setInteractive({ useHandCursor: true });

    background.on('pointerover', () => background.setFillStyle(0x2a2a2a, 0.95));
    background.on('pointerout', () => background.setFillStyle(0x1a1a1a, 0.95));
    background.on('pointerdown', () => this.selectPath(path));

    this.add
      .text(x, y - COLUMN_HEIGHT / 2 + 26, `[${hotkeyNumber}] ${label}`, {
        fontSize: '26px',
        color: textColor,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const lines: string[] = [
      ...this.sceneData.equippedSkills.map(
        (equipped) => `${equipped.def.name}: ${equipped.def.cultivation[path].description}`,
      ),
      ...this.sceneData.equippedPassives.map(
        (equipped) => `${equipped.def.name}: ${equipped.def.cultivation[path].description}`,
      ),
    ];

    this.add
      .text(x, y - COLUMN_HEIGHT / 2 + 70, lines.join('\n\n'), {
        fontSize: '15px',
        color: '#dddddd',
        align: 'left',
        wordWrap: { width: COLUMN_WIDTH - 40 },
      })
      .setOrigin(0.5, 0);
  }

  private selectPath(path: Path): void {
    if (this.choiceMade) return;
    this.choiceMade = true;
    this.sceneData.onChoose(path);
    this.scene.stop();
  }
}
