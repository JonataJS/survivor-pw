import { BaseSkill, type SkillContext } from './Skill';
import { suddenSpring } from '../data/skills';
import type { CalculatedStats } from '../systems/CombatSystem';
import type { Enemy } from '../entities/Enemy';
import type { AreaEffectSystem } from '../systems/AreaEffectSystem';
import { effectColor } from './pathColors';

const WATER_COLOR = 0x3388ff;

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
      const target = ctx.findNearestEnemy(chosen);
      if (!target) break;
      chosen.add(target);

      this.areaEffectSystem.play(target.x, target.y, {
        textureKey: 'effect-white',
        tint: effectColor(ctx.path, WATER_COLOR),
        maxScale: 5,
        growDurationMs: 150,
        fadeDurationMs: 250,
      });

      ctx.dealDamage(target, damage, { critChance: stats.critChance });
      if (target.active) {
        target.applySlow(slowPercentage, slowDuration);
      }
    }
  }
}
