import { BaseSkill, type SkillContext } from './Skill';
import { phoenixWings } from '../data/skills';
import type { CalculatedStats } from '../systems/CombatSystem';
import type { AreaEffectSystem } from '../systems/AreaEffectSystem';

const FIRE_COLOR = 0xff5522;
const BEAM_HALF_WIDTH = 40;
const TRAVEL_DURATION_MS = 250;

export class PhoenixWingsSkill extends BaseSkill {
  constructor(private readonly areaEffectSystem: AreaEffectSystem) {
    super(phoenixWings, 1);
  }

  protected fire(ctx: SkillContext, stats: CalculatedStats): void {
    const phoenixCount = Math.max(1, Math.round(stats.values.phoenixCount ?? 1));
    const damage = stats.values.damage ?? 0;
    const knockback = stats.values.knockback ?? 0;
    const range = stats.values.range ?? 0;
    const dirX = ctx.facingX;
    const dirY = ctx.facingY;

    for (let i = 0; i < phoenixCount; i++) {
      const targets = ctx.findEnemiesInLine(dirX, dirY, range, BEAM_HALF_WIDTH);
      for (const enemy of targets) {
        ctx.dealDamage(enemy, damage);
        if (enemy.active) enemy.knockback(dirX, dirY, knockback);
      }

      this.areaEffectSystem.playBeam(ctx.casterX, ctx.casterY, Math.atan2(dirY, dirX), range, {
        textureKey: 'projectile-fire',
        tint: FIRE_COLOR,
        width: BEAM_HALF_WIDTH * 2,
        travelDurationMs: TRAVEL_DURATION_MS,
        fadeDurationMs: 200,
      });
    }
  }
}
