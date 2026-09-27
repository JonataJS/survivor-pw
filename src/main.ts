import Phaser from 'phaser';
import { LARGURA_BASE, ALTURA_BASE, FPS_ALVO } from './config';
import { BootScene } from './scenes/BootScene';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: LARGURA_BASE,
  height: ALTURA_BASE,
  backgroundColor: '#000000',
  fps: {
    target: FPS_ALVO,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
    },
  },
  scene: [BootScene],
});
