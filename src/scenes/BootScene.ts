import Phaser from 'phaser';
import { attackSkills, activeSkills } from '../data/skills';

const SKILL_ICON_IDS = [...attackSkills, ...activeSkills].map((skill) => skill.id);

export function skillIconTextureKey(skillId: string): string {
  return `skill-icon-${skillId}`;
}

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

// Mage spritesheet layout from public/assets/player/mage/mage-spritesheet.json:
// a 4-column x 9-row uniform grid (92x92 cells). Row 0 holds the static
// rotations (unused here); rows 1-8 hold 4-frame idle/walk animations for
// south, west, east and north, in that order.
const MAGE_ANIM_FRAMES: Record<string, { start: number; end: number }> = {
  'mage-idle-south': { start: 4, end: 7 },
  'mage-idle-west': { start: 8, end: 11 },
  'mage-idle-east': { start: 12, end: 15 },
  'mage-idle-north': { start: 16, end: 19 },
  'mage-walk-south': { start: 20, end: 23 },
  'mage-walk-west': { start: 24, end: 27 },
  'mage-walk-east': { start: 28, end: 31 },
  'mage-walk-north': { start: 32, end: 35 },
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    this.load.spritesheet('mage', 'assets/player/mage/mage-spritesheet.png', {
      frameWidth: 92,
      frameHeight: 92,
    });

    for (const skillId of SKILL_ICON_IDS) {
      this.load.image(skillIconTextureKey(skillId), `assets/skills/mage/${skillId}.png`);
    }
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000000');
    this.generatePlaceholderTextures();
    this.generateMageAnimations();
    this.scene.start('Menu');
  }

  private generateMageAnimations(): void {
    for (const [key, { start, end }] of Object.entries(MAGE_ANIM_FRAMES)) {
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers('mage', { start, end }),
        frameRate: key.startsWith('mage-walk-') ? 8 : 4,
        repeat: -1,
      });
    }
  }

  private generatePlaceholderTextures(): void {
    const graphics = this.add.graphics();

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
    graphics.fillStyle(0x000000, 0.5);
    graphics.fillEllipse(9, 5, 18, 10);
    graphics.generateTexture('shadow', 18, 10);

    // Plain white circle, always tinted at runtime (setTint multiplies a
    // texture's own colors, so effects that need to switch between the
    // element color and a Cultivo path color need a neutral base).
    graphics.clear();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(6, 6, 6);
    graphics.generateTexture('effect-white', 12, 12);

    // T046: pequenos ícones de status acima do inimigo — atordoado
    // (triângulo amarelo) e paralisado (círculo ciano), formas distintas
    // além da cor para quem tem dificuldade de percepção de cor.
    graphics.clear();
    graphics.fillStyle(0xffdd33, 1);
    graphics.fillTriangle(5, 0, 10, 10, 0, 10);
    graphics.generateTexture('status-stun', 10, 10);

    graphics.clear();
    graphics.fillStyle(0x55e0ff, 1);
    graphics.fillCircle(5, 5, 5);
    graphics.generateTexture('status-paralyze', 10, 10);

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
