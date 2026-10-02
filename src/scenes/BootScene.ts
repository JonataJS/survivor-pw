import Phaser from 'phaser';
import { attackSkills, activeSkills } from '../data/skills';
import { createRng, randomInt, randomRange } from '../core/rng';

const SKILL_ICON_IDS = [...attackSkills, ...activeSkills].map((skill) => skill.id);

export function skillIconTextureKey(skillId: string): string {
  return `skill-icon-${skillId}`;
}

// PixelLab-generated VFX frames, one subfolder per skill under
// public/assets/effects/mage/ (see its README). frame-00 is the skill's
// existing icon; frame-01..08 are the generated animation frames.
const EFFECT_ANIM_SKILL_IDS = [
  'fire-mark',
  'sudden-spring',
  'stone-rain',
  'phoenix-wings',
  'flaming-storm',
  'sand-storm',
] as const;
const EFFECT_ANIM_FRAME_COUNT = 9;

export function effectFrameTextureKey(skillId: string, frame: number): string {
  return `fx-${skillId}-${frame}`;
}

export function effectAnimKey(skillId: string): string {
  return `fx-${skillId}`;
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

export const CAVE_FLOOR_TEXTURE = 'cave-floor-tile';
const CAVE_FLOOR_TILE_SIZE = 512;
// Seed fixo: o piso da caverna deve ter sempre o mesmo visual entre partidas
// (decoração, não RNG de jogo — core/rng.ts é só para aleatoriedade que afeta
// o balanceamento).
const CAVE_FLOOR_SEED = 20261001;
const CAVE_FLOOR_BASE_COLORS = [0x2c2620, 0x332c24, 0x282320, 0x241f1b];
const CAVE_FLOOR_BLOTCH_COLORS = [0x1c1713, 0x1a1512, 0x3a3128, 0x332b22];

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

    for (const skillId of EFFECT_ANIM_SKILL_IDS) {
      for (let frame = 0; frame < EFFECT_ANIM_FRAME_COUNT; frame++) {
        this.load.image(
          effectFrameTextureKey(skillId, frame),
          `assets/effects/mage/${skillId}/frame-0${frame}.png`,
        );
      }
    }
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000000');
    this.generatePlaceholderTextures();
    this.generateCaveFloorTexture();
    this.generateMageAnimations();
    this.generateEffectAnimations();
    this.startMenuWhenFontsReady();
  }

  // Garante que Cinzel/EB Garamond (tema medieval da UI, ver src/ui/theme.ts)
  // já estejam carregadas antes do primeiro texto ser desenhado no canvas —
  // sem isso o texto nasceria com a fonte de fallback e nunca seria
  // re-renderizado quando a fonte web chegasse.
  private startMenuWhenFontsReady(): void {
    const start = (): void => {
      this.scene.start('Menu');
    };
    if (!document.fonts) {
      start();
      return;
    }
    Promise.all([
      document.fonts.load('700 32px Cinzel'),
      document.fonts.load('400 16px "EB Garamond"'),
    ])
      .then(start)
      .catch(start);
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

  private generateEffectAnimations(): void {
    for (const skillId of EFFECT_ANIM_SKILL_IDS) {
      this.anims.create({
        key: effectAnimKey(skillId),
        frames: Array.from({ length: EFFECT_ANIM_FRAME_COUNT }, (_, frame) => ({
          key: effectFrameTextureKey(skillId, frame),
        })),
        frameRate: 14,
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

  // Piso de caverna tileável (TileSprite cobre o mundo todo em GameScene) no
  // lugar da grade verde genérica: pedra mosqueada + rachaduras + cascalho.
  // Cada elemento é desenhado 9x num offset de ±CAVE_FLOOR_TILE_SIZE para que
  // o que "vaza" de um lado reapareça no lado oposto, dando uma textura sem
  // costura visível quando repetida lado a lado.
  private generateCaveFloorTexture(): void {
    const size = CAVE_FLOOR_TILE_SIZE;
    const rng = createRng(CAVE_FLOOR_SEED);
    const gfx = this.add.graphics();
    const offsets = [-size, 0, size];

    gfx.fillStyle(CAVE_FLOOR_BASE_COLORS[0], 1);
    gfx.fillRect(0, 0, size, size);

    const drawWrapped = (draw: (ox: number, oy: number) => void, x: number, y: number): void => {
      for (const ox of offsets) {
        for (const oy of offsets) draw(x + ox, y + oy);
      }
    };

    for (let i = 0; i < 56; i++) {
      const x = randomRange(rng, 0, size);
      const y = randomRange(rng, 0, size);
      const r = randomRange(rng, 24, 80);
      gfx.fillStyle(CAVE_FLOOR_BASE_COLORS[randomInt(rng, 0, CAVE_FLOOR_BASE_COLORS.length - 1)], 0.5);
      drawWrapped((ox, oy) => gfx.fillCircle(ox, oy, r), x, y);
    }

    for (let i = 0; i < 77; i++) {
      const x = randomRange(rng, 0, size);
      const y = randomRange(rng, 0, size);
      const r = randomRange(rng, 6, 20);
      gfx.fillStyle(CAVE_FLOOR_BLOTCH_COLORS[randomInt(rng, 0, CAVE_FLOOR_BLOTCH_COLORS.length - 1)], 0.45);
      drawWrapped((ox, oy) => gfx.fillCircle(ox, oy, r), x, y);
    }

    gfx.lineStyle(2, 0x100d0a, 0.55);
    for (let i = 0; i < 20; i++) {
      const startX = randomRange(rng, 0, size);
      const startY = randomRange(rng, 0, size);
      const points: Array<{ x: number; y: number }> = [{ x: startX, y: startY }];
      const segments = randomInt(rng, 2, 5);
      for (let s = 0; s < segments; s++) {
        const previous = points[points.length - 1];
        const angle = randomRange(rng, 0, Math.PI * 2);
        const length = randomRange(rng, 14, 44);
        points.push({
          x: previous.x + Math.cos(angle) * length,
          y: previous.y + Math.sin(angle) * length,
        });
      }
      drawWrapped((ox, oy) => {
        gfx.beginPath();
        gfx.moveTo(points[0].x + ox, points[0].y + oy);
        for (const point of points.slice(1)) gfx.lineTo(point.x + ox, point.y + oy);
        gfx.strokePath();
      }, 0, 0);
    }

    for (let i = 0; i < 102; i++) {
      const x = randomRange(rng, 0, size);
      const y = randomRange(rng, 0, size);
      const r = randomRange(rng, 1, 2.5);
      gfx.fillStyle(0x120f0c, 0.7);
      drawWrapped((ox, oy) => gfx.fillCircle(ox, oy, r), x, y);
    }

    gfx.generateTexture(CAVE_FLOOR_TEXTURE, size, size);
    gfx.destroy();
  }
}
