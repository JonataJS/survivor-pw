import Phaser from 'phaser';
import { classCatalog } from '../data/classCatalog';
import { mapCatalog } from '../data/maps';
import { scoreService } from '../services/LocalScoreService';
import { DEFAULT_RUN_SETUP, validateRunSetup, type RunSetup } from '../systems/runSetup';

export class MenuScene extends Phaser.Scene {
  private selectedSetup: RunSetup = { ...DEFAULT_RUN_SETUP };
  private classCards: Phaser.GameObjects.Container[] = [];
  private mapCards: Phaser.GameObjects.Container[] = [];

  constructor() {
    super('Menu');
  }

  create(): void {
    const { width } = this.scale;
    this.selectedSetup = { ...DEFAULT_RUN_SETUP };
    this.classCards = [];
    this.mapCards = [];
    this.cameras.main.setBackgroundColor('#101820');

    this.add.text(width / 2, 36, 'Survivor PW', { fontSize: '42px', color: '#f5e6c8' }).setOrigin(0.5);
    this.add
      .text(width / 2, 83, 'Mover: WASD ou setas  ·  Terra Móvel: Espaço  ·  Pausar: Esc ou P', {
        fontSize: '16px',
        color: '#cccccc',
      })
      .setOrigin(0.5);

    this.add.text(width / 2, 140, 'Escolha sua classe', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
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

    this.add.text(width / 2, 315, 'Escolha o mapa', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
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

    const play = this.add
      .text(width / 2, 535, 'Jogar', {
        fontSize: '30px',
        color: '#ffffff',
        backgroundColor: '#6b4d1f',
        padding: { x: 26, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    play.on('pointerover', () => play.setBackgroundColor('#8a672b'));
    play.on('pointerout', () => play.setBackgroundColor('#6b4d1f'));
    play.on('pointerdown', () => {
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
          { fontSize: '18px', color: '#ffd75e', align: 'center' },
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
  ): Phaser.GameObjects.Container {
    const background = this.add.rectangle(0, 0, width, height, 0x263238, 1);
    background.setStrokeStyle(2, available ? 0x718096 : 0x42484c);
    const title = this.add
      .text(0, available ? -7 : -15, label, {
        fontSize: width < 190 ? '17px' : '19px',
        color: available ? '#eeeeee' : '#858b8e',
        align: 'center',
        wordWrap: { width: width - 16 },
      })
      .setOrigin(0.5);
    const children: Phaser.GameObjects.GameObject[] = [background, title];
    if (!available) {
      children.push(
        this.add.text(0, 19, 'Em breve', { fontSize: '14px', color: '#b5a47e' }).setOrigin(0.5),
      );
    }
    const card = this.add.container(x, y, children);
    if (available) {
      background.setInteractive({ useHandCursor: true });
      background.on('pointerdown', onSelect);
    }
    return card;
  }

  private refreshCardSelection(): void {
    this.classCards.forEach((card, index) => {
      const selected = classCatalog[index]?.id === this.selectedSetup.classId;
      (card.list[0] as Phaser.GameObjects.Rectangle).setStrokeStyle(3, selected ? 0xffd75e : 0x718096);
      if (selected) (card.list[0] as Phaser.GameObjects.Rectangle).setFillStyle(0x453a23);
      else (card.list[0] as Phaser.GameObjects.Rectangle).setFillStyle(0x263238);
    });
    this.mapCards.forEach((card, index) => {
      const selected = mapCatalog[index]?.id === this.selectedSetup.mapId;
      (card.list[0] as Phaser.GameObjects.Rectangle).setStrokeStyle(3, selected ? 0xffd75e : 0x718096);
      if (selected) (card.list[0] as Phaser.GameObjects.Rectangle).setFillStyle(0x453a23);
      else (card.list[0] as Phaser.GameObjects.Rectangle).setFillStyle(0x263238);
    });
  }

  private formatTime(totalSeconds: number): string {
    const seconds = Math.floor(totalSeconds);
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
}
