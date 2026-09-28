import { BaseSkill, type SkillContext } from './Skill';
import { sandStorm } from '../data/skills';
import type { CalculatedStats } from '../systems/CombatSystem';
import type { AreaEffectSystem } from '../systems/AreaEffectSystem';
import { effectColor } from './pathColors';

const EARTH_COLOR = 0x8a5a2b;
const SEARCH_RADIUS = 500;
const BEAM_WIDTH = 16;
const TRAVEL_DURATION_MS = 200;

export class SandStormSkill extends BaseSkill {
  constructor(private readonly areaEffectSystem: AreaEffectSystem) {
    super(sandStorm, 1);
  }

  protected fire(ctx: SkillContext, stats: CalculatedStats): void {
    const target = ctx.findStrongestEnemyNearby(SEARCH_RADIUS);
    if (!target) return;

    const damage = stats.values.damage ?? 0;
    const damageReduction = stats.values.damageReduction ?? 0;
    const debuffDuration = stats.values.debuffDuration ?? 0;

    ctx.dealDamage(target, damage, { critChance: stats.critChance }, this.def.id);
    if (target.active) target.applyDamageDebuff(damageReduction, debuffDuration);

    const dx = target.x - ctx.casterX;
    const dy = target.y - ctx.casterY;
    const distance = Math.hypot(dx, dy);
    if (distance <= 0) return;

    this.areaEffectSystem.playBeam(ctx.casterX, ctx.casterY, Math.atan2(dy, dx), distance, {
      textureKey: 'effect-white',
      tint: effectColor(ctx.path, EARTH_COLOR),
      width: BEAM_WIDTH,
      travelDurationMs: TRAVEL_DURATION_MS,
      fadeDurationMs: 200,
    });
  }
}
