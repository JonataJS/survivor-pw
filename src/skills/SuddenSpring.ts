import { BaseSkill, type SkillContext } from './Skill';
import { suddenSpring } from '../data/skills';
import type { CalculatedStats } from '../systems/CombatSystem';
import type { Enemy } from '../entities/Enemy';
import type { AreaEffectSystem } from '../systems/AreaEffectSystem';
import { effectColor } from './pathColors';
import { effectAnimKey, effectFrameTextureKey } from '../scenes/BootScene';

const WATER_COLOR = 0x3388ff;
// PixelLab VFX frames are 32px; maxScale picks the display diameter (was a
// 60px-diameter 12px placeholder circle, maxScale 5 — kept the same look).
const EFFECT_TEXTURE_DIAMETER = 32;
const DISPLAY_DIAMETER = 60;

export class SuddenSpringSkill extends BaseSkill {
  constructor(private readonly areaEffectSystem: AreaEffectSystem) {
    super(suddenSpring, 1);
  }

  protected fire(ctx: SkillContext, stats: CalculatedStats): void {
    const spoutCount = Math.max(1, Math.round(stats.values.spouts ?? 1));
    const damage = stats.values.damage ?? 0;
    const slowPercentage = stats.values.slowPercentage ?? 0;
    const slowDuration = stats.values.slowDuration ?? 0;
    const chosen = new Set<Enemy>();

    for (let i = 0; i < spoutCount; i++) {
      const target = ctx.findNearestVisibleEnemy(chosen);
      if (!target) break;
      chosen.add(target);

      this.areaEffectSystem.play(target.x, target.y, {
        textureKey: effectFrameTextureKey(this.def.id, 0),
        animKey: effectAnimKey(this.def.id),
        tint: effectColor(ctx.path, WATER_COLOR),
        maxScale: DISPLAY_DIAMETER / EFFECT_TEXTURE_DIAMETER,
        growDurationMs: 150,
        fadeDurationMs: 250,
      });

      ctx.dealDamage(target, damage, { critChance: stats.critChance }, this.def.id);
      if (target.active) {
        target.applySlow(slowPercentage, slowDuration);
      }
    }
  }
}
