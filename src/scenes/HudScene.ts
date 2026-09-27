import Phaser from 'phaser';

export class HudScene extends Phaser.Scene {
  constructor() {
    super('Hud');
  }

  create(): void {
    this.add.text(16, 16, 'HUD (placeholder)', { fontSize: '18px' });
  }
}
