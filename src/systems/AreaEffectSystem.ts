import Phaser from 'phaser';
import { Pool } from '../core/Pool';
import { AreaEffect } from '../entities/AreaEffect';

export interface AreaEffectConfig {
  textureKey: string;
  tint?: number;
  maxScale: number;
  growDurationMs: number;
  fadeDurationMs: number;
}

// Placeholder visuals: grow a tinted circle in, then fade it out. Used by
// every "instant hit" skill (Fonte Repentina, Chuva de Pedra, Tempestade
// Flamejante, ...) since none of them have a traveling projectile to render.
export class AreaEffectSystem {
  private readonly pool: Pool<AreaEffect>;

  constructor(private readonly scene: Phaser.Scene) {
    this.pool = new Pool<AreaEffect>(
      () => new AreaEffect(this.scene),
      (effect) => effect.deactivate(),
    );
  }

  play(x: number, y: number, config: AreaEffectConfig): void {
    const effect = this.pool.acquire();
    effect.setTexture(config.textureKey);
    effect.setPosition(x, y);
    effect.setScale(0);
    effect.setAlpha(1);
    effect.setTint(config.tint ?? 0xffffff);
    effect.setActive(true);
    effect.setVisible(true);

    this.scene.tweens.add({
      targets: effect,
      scale: config.maxScale,
      duration: config.growDurationMs,
      ease: 'Cubic.Out',
      onComplete: () => {
        this.scene.tweens.add({
          targets: effect,
          alpha: 0,
          duration: config.fadeDurationMs,
          onComplete: () => this.pool.release(effect),
        });
      },
    });
  }
}
