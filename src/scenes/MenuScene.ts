import Phaser from 'phaser';
import { classCatalog } from '../data/classCatalog';
import { mapCatalog } from '../data/maps';
import { scoreService } from '../services/LocalScoreService';
import { DEFAULT_RUN_SETUP, validateRunSetup, type RunSetup } from '../systems/runSetup';
import { COLORS, FONT_BODY, FONT_TITLE, drawBackdrop, drawPanel } from '../ui/theme';

interface CardRefs {
  panel: Phaser.GameObjects.Graphics;
  width: number;
  height: number;
  available: boolean;
}

export class MenuScene extends Phaser.Scene {
  private selectedSetup: RunSetup = { ...DEFAULT_RUN_SETUP };
  private classCards: CardRefs[] = [];
  private mapCards: CardRefs[] = [];

  constructor() {
    super('Menu');
  }

  create(): void {
    const { width } = this.scale;
    this.selectedSetup = { ...DEFAULT_RUN_SETUP };
    this.classCards = [];
    this.mapCards = [];

    drawBackdrop(this, width, this.scale.height);

    this.add
      .text(width / 2, 40, 'Survivor PW', {
        fontSize: '44px',
        fontFamily: FONT_TITLE,
        fontStyle: 'bold',
        color: COLORS.textGold,
      })
      .setOrigin(0.5)
      .setLetterSpacing(2)
      .setShadow(0, 2, '#000000', 4, true, true);
    this.add
      .text(width / 2, 83, 'Mover: WASD ou setas  ·  Terra Móvel: Espaço  ·  Pausar: Esc ou P', {
        fontSize: '16px',
        fontFamily: FONT_BODY,
        color: COLORS.textMuted,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 140, 'Escolha sua classe', {
        fontSize: '24px',
        fontFamily: FONT_TITLE,
        color: COLORS.textCream,
      })
      .setOrigin(0.5);
    const classWidth = Math.min(174, (width - 48) / classCatalog.length - 8);
    const classGap = 8;
    const classStartX = width / 2 - ((classWidth + classGap) * classCatalog.length - classGap) / 2;
    classCatalog.forEach((entry, index) => {
      const x = classStartX + index * (classWidth + classGap) + classWidth / 2;
      const card = this.createCard(x, 207, classWidth, 76, entry.name, entry.available, () => {
        this.selectedSetup.classId = entry.id;
        this.refreshCardSelection();
      });
      this.classCards.push(card);
    });

    this.add
      .text(width / 2, 315, 'Escolha o mapa', {
        fontSize: '24px',
        fontFamily: FONT_TITLE,
        color: COLORS.textCream,
      })
      .setOrigin(0.5);
    const mapWidth = Math.min(350, (width - 48) / mapCatalog.length - 12);
    const mapGap = 12;
    const mapStartX = width / 2 - ((mapWidth + mapGap) * mapCatalog.length - mapGap) / 2;
    mapCatalog.forEach((entry, index) => {
      const x = mapStartX + index * (mapWidth + mapGap) + mapWidth / 2;
      const card = this.createCard(x, 397, mapWidth, 92, entry.name, entry.available, () => {
        this.selectedSetup.mapId = entry.id;
        this.refreshCardSelection();
      });
      this.mapCards.push(card);
    });

    const playContainer = this.add.container(width / 2, 535);
    const playPanel = this.add.graphics();
    drawPanel(playPanel, 180, 56, COLORS.panelSelected, COLORS.borderGold, 10);
    const playLabel = this.add
      .text(0, 0, 'Jogar', {
        fontSize: '26px',
        fontFamily: FONT_TITLE,
        fontStyle: 'bold',
        color: COLORS.textGold,
      })
      .setOrigin(0.5);
    playContainer.add([playPanel, playLabel]);
    playContainer.setSize(180, 56);
    playContainer.setInteractive({ useHandCursor: true });
    playContainer.on('pointerover', () =>
      drawPanel(playPanel, 184, 60, COLORS.panelHover, COLORS.borderGold, 10),
    );
    playContainer.on('pointerout', () =>
      drawPanel(playPanel, 180, 56, COLORS.panelSelected, COLORS.borderGold, 10),
    );
    playContainer.on('pointerdown', () => {
      const setup = validateRunSetup(this.selectedSetup);
      if (setup) this.scene.start('Game', setup);
    });
    this.refreshCardSelection();

    void scoreService.getBestRun().then((bestRun) => {
      if (!bestRun || !this.scene.isActive()) return;
      this.add
        .text(
          width / 2,
          630,
          `Recorde: ${this.formatTime(bestRun.survivedSeconds)} · ${bestRun.kills} mortes · nível ${bestRun.level}`,
          { fontSize: '18px', fontFamily: FONT_BODY, color: COLORS.textGold, align: 'center' },
        )
        .setOrigin(0.5);
    });
  }

  private createCard(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    available: boolean,
    onSelect: () => void,
  ): CardRefs {
    const panel = this.add.graphics();
    drawPanel(panel, width, height, available ? COLORS.panel : COLORS.panelDisabled, COLORS.borderBronze, 8);
    const title = this.add
      .text(0, available ? -7 : -15, label, {
        fontSize: width < 190 ? '17px' : '19px',
        fontFamily: FONT_BODY,
        color: available ? COLORS.textCream : COLORS.textDisabled,
        align: 'center',
        wordWrap: { width: width - 16 },
      })
      .setOrigin(0.5);
    const children: Phaser.GameObjects.GameObject[] = [panel, title];
    if (!available) {
      children.push(
        this.add
          .text(0, 19, 'Em breve', { fontSize: '14px', fontFamily: FONT_BODY, color: COLORS.textMuted })
          .setOrigin(0.5),
      );
    }
    const card = this.add.container(x, y, children);
    if (available) {
      card.setSize(width, height);
      card.setInteractive({ useHandCursor: true });
      card.on('pointerdown', onSelect);
    }
    return { panel, width, height, available };
  }

  private refreshCardSelection(): void {
    this.classCards.forEach((card, index) => {
      const selected = classCatalog[index]?.id === this.selectedSetup.classId;
      this.paintCard(card, selected);
    });
    this.mapCards.forEach((card, index) => {
      const selected = mapCatalog[index]?.id === this.selectedSetup.mapId;
      this.paintCard(card, selected);
    });
  }

  private paintCard(card: CardRefs, selected: boolean): void {
    const fill = !card.available ? COLORS.panelDisabled : selected ? COLORS.panelSelected : COLORS.panel;
    const border = selected ? COLORS.borderGold : COLORS.borderBronze;
    drawPanel(card.panel, card.width, card.height, fill, border, 8);
  }

  private formatTime(totalSeconds: number): string {
    const seconds = Math.floor(totalSeconds);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
}
