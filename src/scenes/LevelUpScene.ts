import Phaser from 'phaser';
import type { UpgradeOption } from '../systems/UpgradeSystem';
import { describeUpgradeOption } from '../systems/upgradeCardText';
import { skillIconTextureKey } from './BootScene';
import type { Element } from '../data/types';

export interface LevelUpSceneData {
  options: UpgradeOption[];
  onChoose: (option: UpgradeOption) => void;
}

const ELEMENT_COLORS: Record<Element, number> = {
  fire: 0xff5522,
  water: 0x3388ff,
  earth: 0x8a5a2b,
};
const NEUTRAL_COLOR = 0xcccccc;

const CARD_WIDTH = 320;
const CARD_HEIGHT = 300;
const CARD_GAP = 32;
const ICON_SIZE = 32;

export class LevelUpScene extends Phaser.Scene {
  private sceneData!: LevelUpSceneData;
  private choiceMade = false;

  constructor() {
    super('LevelUp');
  }

  create(data: LevelUpSceneData): void {
    this.sceneData = data;
    this.choiceMade = false;
    const { width, height } = this.scale;
    const options = data.options;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
    this.add
      .text(width / 2, height / 2 - CARD_HEIGHT / 2 - 60, 'Suba de nível!', { fontSize: '32px' })
      .setOrigin(0.5);

    const totalWidth = options.length * CARD_WIDTH + (options.length - 1) * CARD_GAP;
    const startX = width / 2 - totalWidth / 2 + CARD_WIDTH / 2;

    options.forEach((option, index) => {
      this.createCard(startX + index * (CARD_WIDTH + CARD_GAP), height / 2, option, index + 1);
    });

    const keyboard = this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;
    const hotkeys: Array<Phaser.Input.Keyboard.Key> = [
      keyboard.addKey('ONE'),
      keyboard.addKey('TWO'),
      keyboard.addKey('THREE'),
    ];
    hotkeys.forEach((key, index) => {
      key.on('down', () => {
        const option = options[index];
        if (option) this.selectOption(option);
      });
    });
  }

  private createCard(x: number, y: number, option: UpgradeOption, hotkeyNumber: number): void {
    const card = describeUpgradeOption(option);
    const color = card.element ? ELEMENT_COLORS[card.element] : NEUTRAL_COLOR;
    const colorCss = `#${color.toString(16).padStart(6, '0')}`;
    const iconId = option.kind === 'new-skill' || option.kind === 'improve-skill' ? option.skill.id : undefined;

    const background = this.add
      .rectangle(x, y, CARD_WIDTH, CARD_HEIGHT, 0x1a1a1a, 0.95)
      .setStrokeStyle(3, color)
      .setInteractive({ useHandCursor: true });

    background.on('pointerover', () => background.setFillStyle(0x2a2a2a, 0.95));
    background.on('pointerout', () => background.setFillStyle(0x1a1a1a, 0.95));
    background.on('pointerdown', () => this.selectOption(option));

    this.add
      .text(x, y - CARD_HEIGHT / 2 + 20, `[${hotkeyNumber}]`, { fontSize: '16px', color: '#888888' })
      .setOrigin(0.5);
    if (iconId) {
      this.add
        .image(x, y - CARD_HEIGHT / 2 + 50, skillIconTextureKey(iconId))
        .setDisplaySize(ICON_SIZE, ICON_SIZE);
    }
    this.add
      .text(x, y - CARD_HEIGHT / 2 + (iconId ? 96 : 52), card.title, {
        fontSize: '22px',
        color: colorCss,
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: CARD_WIDTH - 24 },
      })
      .setOrigin(0.5);
    if (card.levelLabel) {
      this.add
        .text(x, y - CARD_HEIGHT / 2 + (iconId ? 128 : 90), card.levelLabel, {
          fontSize: '16px',
          color: '#dddddd',
        })
        .setOrigin(0.5);
    }
    this.add
      .text(x, y - CARD_HEIGHT / 2 + (iconId ? 152 : 112), card.description, {
        fontSize: '15px',
        color: '#bbbbbb',
        align: 'center',
        wordWrap: { width: CARD_WIDTH - 24 },
      })
      .setOrigin(0.5, 0);
  }

  private selectOption(option: UpgradeOption): void {
    if (this.choiceMade) return;
    this.choiceMade = true;
    this.sceneData.onChoose(option);
    this.scene.stop();
  }
}
