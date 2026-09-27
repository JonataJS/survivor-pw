import { BaseSkill, type SkillContext } from './Skill';
import { fireMark } from '../data/skills';
import type { CalculatedStats } from '../systems/CombatSystem';
import type { Enemy } from '../entities/Enemy';
import type { ProjectileSystem } from '../systems/ProjectileSystem';

export class FireMarkSkill extends BaseSkill {
  constructor(private readonly projectileSystem: ProjectileSystem) {
    super(fireMark, 1);
  }

  protected fire(ctx: SkillContext, stats: CalculatedStats): void {
    const projectileCount = Math.max(1, Math.round(stats.values.projectiles ?? 1));
    const damage = stats.values.damage ?? 0;
    const chosen = new Set<Enemy>();

    for (let i = 0; i < projectileCount; i++) {
      const target = ctx.findNearestEnemy(chosen);
      if (!target) break;

      chosen.add(target);
      this.projectileSystem.spawn(ctx.casterX, ctx.casterY, target, damage, 'projectile-fire', {
        critChance: stats.critChance,
        lifesteal: stats.lifesteal,
      });
    }
  }
}
