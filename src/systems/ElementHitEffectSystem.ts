import Phaser from 'phaser';
import type { Element } from '../data/types';

const ELEMENT_COLORS: Record<Element, number> = {
  fire: 0xff5522,
  water: 0x3388ff,
  earth: 0x8a5a2b,
};

export class ElementHitEffectSystem {
  private readonly emitters: Record<Element, Phaser.GameObjects.Particles.ParticleEmitter>;

  constructor(scene: Phaser.Scene) {
    this.emitters = {
      fire: this.createEmitter(scene, 'fire'),
      water: this.createEmitter(scene, 'water'),
      earth: this.createEmitter(scene, 'earth'),
    };
  }

  playHit(element: Element, x: number, y: number): void {
    this.emitters[element].explode(4, x, y);
  }

  private createEmitter(
    scene: Phaser.Scene,
    element: Element,
  ): Phaser.GameObjects.Particles.ParticleEmitter {
    const emitter = scene.add.particles(0, 0, 'effect-white', {
      emitting: false,
      maxParticles: 24,
      lifespan: { min: 140, max: 260 },
      speed: { min: 24, max: 70 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.7, end: 0 },
      alpha: { start: 0.9, end: 0 },
      tint: ELEMENT_COLORS[element],
    });
    emitter.reserve(24);
    emitter.setDepth(20);
    return emitter;
  }
}
