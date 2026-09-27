import { BaseSkill, type SkillContext } from './Skill';
import { flamingStorm } from '../data/skills';
import type { CalculatedStats } from '../systems/CombatSystem';
import type { AreaEffectSystem } from '../systems/AreaEffectSystem';

const FIRE_COLOR = 0xff5522;
// The circle texture is 12px wide; scale so its display diameter matches 2×radius.
const TEXTURE_DIAMETER = 12;

export class FlamingStormSkill extends BaseSkill {
  constructor(private readonly areaEffectSystem: AreaEffectSystem) {
    super(flamingStorm, 1);
  }

  protected fire(ctx: SkillContext, stats: CalculatedStats): void {
    const damage = stats.values.damage ?? 0;
    const radius = stats.values.radius ?? 0;

    const targets = ctx.findEnemiesInRadius(ctx.casterX, ctx.casterY, radius);
    for (const enemy of targets) {
      ctx.dealDamage(enemy, damage);
    }

    this.areaEffectSystem.play(ctx.casterX, ctx.casterY, {
      textureKey: 'projectile-fire',
      tint: FIRE_COLOR,
      maxScale: (radius * 2) / TEXTURE_DIAMETER,
      growDurationMs: 200,
      fadeDurationMs: 300,
    });
  }
}
