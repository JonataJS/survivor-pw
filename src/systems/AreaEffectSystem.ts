import Phaser from 'phaser';
import { Pool } from '../core/Pool';
import { AreaEffect } from '../entities/AreaEffect';

export interface AreaEffectConfig {
  textureKey: string;
  // Looping VFX animation (see BootScene.effectAnimKey) to play instead of
  // the static textureKey frame. Optional so a skill can still fall back to
  // a plain tinted texture with no animation.
  animKey?: string;
  tint?: number;
  maxScale: number;
  growDurationMs: number;
  fadeDurationMs: number;
}

export interface BeamEffectConfig {
  textureKey: string;
  animKey?: string;
  tint?: number;
  width: number;
  travelDurationMs: number;
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

  // Meteor-style impact (Chuva de Pedra): a shadow marks the ground first,
  // then after `delayMs` the shadow is replaced by the usual grow/fade
  // circle and `onImpact` (the damage) resolves.
  playWithShadow(
    x: number,
    y: number,
    config: AreaEffectConfig,
    delayMs: number,
    onImpact: () => void,
  ): void {
    const shadow = this.pool.acquire();
    shadow.setTexture('shadow');
    shadow.setOrigin(0.5, 0.5);
    shadow.setPosition(x, y);
    shadow.setScale(1);
    shadow.setAlpha(1);
    shadow.setTint(0xffffff);
    shadow.setActive(true);
    shadow.setVisible(true);

    this.scene.time.delayedCall(delayMs, () => {
      this.pool.release(shadow);
      onImpact();
      this.play(x, y, config);
    });
  }

  play(x: number, y: number, config: AreaEffectConfig): void {
    const effect = this.pool.acquire();
    effect.setTexture(config.textureKey);
    if (config.animKey) effect.play(config.animKey);
    effect.setOrigin(0.5, 0.5);
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

  // Asas da Fênix: a beam that shoots out from (x, y) along `angle`,
  // stretching from 0 to `length`, then fades. `setOrigin(0, 0.5)` anchors
  // the sprite at its tail so growing displayWidth reads as "traveling
  // forward" rather than expanding from the center.
  playBeam(x: number, y: number, angle: number, length: number, config: BeamEffectConfig): void {
    const effect = this.pool.acquire();
    effect.setTexture(config.textureKey);
    if (config.animKey) effect.play(config.animKey);
    effect.setOrigin(0, 0.5);
    effect.setPosition(x, y);
    effect.setRotation(angle);
    effect.setDisplaySize(0, config.width);
    effect.setAlpha(1);
    effect.setTint(config.tint ?? 0xffffff);
    effect.setActive(true);
    effect.setVisible(true);

    this.scene.tweens.add({
      targets: effect,
      displayWidth: length,
      duration: config.travelDurationMs,
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
