import Phaser from 'phaser';
import { BASE_WIDTH, BASE_HEIGHT, TARGET_FPS } from './config';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { HudScene } from './scenes/HudScene';
import { PauseScene } from './scenes/PauseScene';
import { LevelUpScene } from './scenes/LevelUpScene';
import { CultivationScene } from './scenes/CultivationScene';
import { ResultScene } from './scenes/ResultScene';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: BASE_WIDTH,
  height: BASE_HEIGHT,
  backgroundColor: '#000000',
  fps: {
    target: TARGET_FPS,
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
  scene: [
    BootScene,
    MenuScene,
    GameScene,
    HudScene,
    PauseScene,
    LevelUpScene,
    CultivationScene,
    ResultScene,
  ],
});
