import Phaser from 'phaser';

// Paleta medieval/Perfect World: madeira escura, bronze e ouro no lugar do
// cinza-azulado neutro anterior. Usado por MenuScene, LevelUpScene e pela
// barra de vida do HudScene para manter a mesma identidade visual.
export const COLORS = {
  backgroundTop: 0x120b06,
  backgroundBottom: 0x241708,
  panel: 0x2b1d12,
  panelHover: 0x3c2817,
  panelSelected: 0x4a3418,
  panelDisabled: 0x1d140d,
  borderBronze: 0x8a6a2f,
  borderGold: 0xe8c468,
  borderDim: 0x4a3c28,
  textCream: '#f3e3c3',
  textGold: '#e8c468',
  textMuted: '#b9a37a',
  textDisabled: '#6e6253',
  hpFill: 0x9b1c1c,
  hpFillLow: 0xff5a3c,
  hpTrack: 0x200a0a,
  xpFill: 0x5a4aa8,
  xpTrack: 0x160f28,
} as const;

export const FONT_TITLE = "'Cinzel', Georgia, 'Times New Roman', serif";
export const FONT_BODY = "'EB Garamond', Georgia, serif";

/**
 * Painel de pergaminho/madeira com moldura dupla (bronze por fora, linha
 * escura por dentro), desenhado centrado em (0,0) do Graphics recebido.
 */
export function drawPanel(
  gfx: Phaser.GameObjects.Graphics,
  w: number,
  h: number,
  fill: number,
  border: number,
  radius = 8,
): void {
  gfx.clear();
  gfx.fillStyle(fill, 1);
  gfx.fillRoundedRect(-w / 2, -h / 2, w, h, radius);
  gfx.lineStyle(3, border, 1);
  gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, radius);
  gfx.lineStyle(1, 0x000000, 0.6);
  gfx.strokeRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, Math.max(radius - 3, 1));
}

export function drawBackdrop(scene: Phaser.Scene, width: number, height: number): void {
  const gfx = scene.add.graphics();
  gfx.fillGradientStyle(
    COLORS.backgroundTop,
    COLORS.backgroundTop,
    COLORS.backgroundBottom,
    COLORS.backgroundBottom,
    1,
  );
  gfx.fillRect(0, 0, width, height);
}
