import Phaser from 'phaser';

export class DamageNumber extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, '', { fontSize: '16px', color: '#ffffff', fontStyle: 'bold' });
    this.setOrigin(0.5);
    scene.add.existing(this);
    this.setActive(false);
    this.setVisible(false);
  }

  deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    this.scene.tweens.killTweensOf(this);
  }
}
