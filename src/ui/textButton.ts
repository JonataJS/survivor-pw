import Phaser from 'phaser';
import { COLORS, FONT_TITLE, drawPanel } from './theme';

const PADDING_X = 28;
const PADDING_Y = 14;

export function createTextButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  onClick: () => void,
): Phaser.GameObjects.Container {
  const label = scene.add
    .text(0, 0, text, {
      fontSize: '24px',
      fontFamily: FONT_TITLE,
      fontStyle: 'bold',
      color: COLORS.textGold,
    })
    .setOrigin(0.5);

  const width = label.width + PADDING_X * 2;
  const height = label.height + PADDING_Y * 2;
  const panel = scene.add.graphics();
  drawPanel(panel, width, height, COLORS.panel, COLORS.borderBronze, 8);

  const container = scene.add.container(x, y, [panel, label]);
  container.setSize(width, height);
  container.setInteractive({ useHandCursor: true });
  container.on('pointerover', () => drawPanel(panel, width, height, COLORS.panelHover, COLORS.borderGold, 8));
  container.on('pointerout', () => drawPanel(panel, width, height, COLORS.panel, COLORS.borderBronze, 8));
  container.on('pointerdown', onClick);

  return container;
}
