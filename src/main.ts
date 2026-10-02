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

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: BASE_WIDTH,
  height: BASE_HEIGHT,
  backgroundColor: '#000000',
  fps: {
    target: TARGET_FPS,
  },
  scale: {
    // ENVELOP fills the viewport completely (cropping overflow) instead of
    // FIT's letterboxing, which is what showed up as black bars on the
    // sides on wider/narrower-than-16:9 screens.
    mode: Phaser.Scale.ENVELOP,
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

if (import.meta.env.DEV) {
  (window as unknown as { game: Phaser.Game }).game = game;
}
