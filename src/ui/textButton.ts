import Phaser from 'phaser';

export function createTextButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  onClick: () => void,
): Phaser.GameObjects.Text {
  const button = scene.add
    .text(x, y, text, {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 16, y: 8 },
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

  button.on('pointerover', () => button.setBackgroundColor('#555555'));
  button.on('pointerout', () => button.setBackgroundColor('#333333'));
  button.on('pointerdown', onClick);

  return button;
}
