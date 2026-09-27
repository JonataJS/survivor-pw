import Phaser from 'phaser';

const PLAYER_COLOR = 0x9b30ff;

const ENEMY_TEXTURES: Record<string, { size: number; color: number }> = {
  'enemy-common': { size: 20, color: 0x999999 },
  'enemy-fast': { size: 14, color: 0xf0d030 },
  'enemy-tank': { size: 32, color: 0x8a2020 },
};

const ELEMENT_COLORS: Record<string, number> = {
  fire: 0xff5522,
  water: 0x3388ff,
  earth: 0x8a5a2b,
};

const GEM_COLOR = 0x33ff88;

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000000');
    this.generatePlaceholderTextures();
    this.scene.start('Menu');
  }

  private generatePlaceholderTextures(): void {
    const graphics = this.add.graphics();

    graphics.clear();
    graphics.fillStyle(PLAYER_COLOR, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);

    for (const [key, { size, color }] of Object.entries(ENEMY_TEXTURES)) {
      graphics.clear();
      graphics.fillStyle(color, 1);
      graphics.fillRect(0, 0, size, size);
      graphics.generateTexture(key, size, size);
    }

    for (const [element, color] of Object.entries(ELEMENT_COLORS)) {
      graphics.clear();
      graphics.fillStyle(color, 1);
      graphics.fillCircle(6, 6, 6);
      graphics.generateTexture(`projectile-${element}`, 12, 12);
    }

    graphics.clear();
    graphics.fillStyle(GEM_COLOR, 1);
    graphics.fillPoints(
      [
        { x: 5, y: 0 },
        { x: 10, y: 5 },
        { x: 5, y: 10 },
        { x: 0, y: 5 },
      ],
      true,
    );
    graphics.generateTexture('gem', 10, 10);

    graphics.destroy();
  }
}
