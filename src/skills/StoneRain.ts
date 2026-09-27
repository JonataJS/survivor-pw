import { BaseSkill, type SkillContext } from './Skill';
import { stoneRain } from '../data/skills';
import type { CalculatedStats } from '../systems/CombatSystem';
import type { Enemy } from '../entities/Enemy';
import type { AreaEffectSystem } from '../systems/AreaEffectSystem';

const EARTH_COLOR = 0x8a5a2b;
const IMPACT_DELAY_MS = 600;

export class StoneRainSkill extends BaseSkill {
  constructor(private readonly areaEffectSystem: AreaEffectSystem) {
    super(stoneRain, 1);
  }

  protected fire(ctx: SkillContext, stats: CalculatedStats): void {
    const rockCount = Math.max(1, Math.round(stats.values.rocks ?? 1));
    const damage = stats.values.damage ?? 0;
    const chosen = new Set<Enemy>();

    for (let i = 0; i < rockCount; i++) {
      const target = ctx.findRandomVisibleEnemy(chosen);
      if (!target) break;
      chosen.add(target);

      const x = target.x;
      const y = target.y;
      this.areaEffectSystem.playWithShadow(
        x,
        y,
        {
          textureKey: 'projectile-earth',
          tint: EARTH_COLOR,
          maxScale: 6,
          growDurationMs: 150,
          fadeDurationMs: 250,
        },
        IMPACT_DELAY_MS,
        () => {
          if (target.active) ctx.dealDamage(target, damage);
        },
      );
    }
  }
}
