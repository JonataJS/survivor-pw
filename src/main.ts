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
    // RESIZE makes the canvas match the viewport exactly, with no
    // letterboxing (FIT's black bars) and no cropping (ENVELOP's downside —
    // it filled the screen but cropped the edges on non-16:9 windows,
    // cutting off the corner-anchored HUD: HP/XP bars, skill icons, timer).
    // HudScene already reads this.scale.width/height for its right/bottom
    // anchors, so it adapts; the main camera auto-resizes with it too
    // (Phaser's CameraManager#onResize).
    mode: Phaser.Scale.RESIZE,
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
