import Phaser from 'phaser';

export class AreaEffect extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'projectile-water');
    scene.add.existing(this);
    this.setActive(false);
    this.setVisible(false);
  }

  deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    this.scene.tweens.killTweensOf(this);
    this.anims.stop();
  }
}
