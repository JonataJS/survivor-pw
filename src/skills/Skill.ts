import type { Enemy } from '../entities/Enemy';
import type { Path, SkillDef } from '../data/types';
import { calculateStats, type CalculatedStats, type EquippedPassive } from '../systems/CombatSystem';

export interface SkillContext {
  casterX: number;
  casterY: number;
  // Last non-zero movement direction (unit vector), for skills that fire
  // "na direção do movimento" (Asas da Fênix) instead of at a target.
  facingX: number;
  facingY: number;
  equippedPassives: EquippedPassive[];
  path?: Path;
  findNearestEnemy: (exclude?: Set<Enemy>) => Enemy | undefined;
  findRandomVisibleEnemy: (exclude?: Set<Enemy>) => Enemy | undefined;
  // All enemies within `halfWidth` of the line from the caster out to
  // `range` along (dirX, dirY) — the "atravessa e acerta todos" hitbox.
  findEnemiesInLine: (dirX: number, dirY: number, range: number, halfWidth: number) => Enemy[];
  // All enemies within `radius` of (centerX, centerY) — area-around-a-point
  // hitbox (Tempestade Flamejante's pulses around the caster).
  findEnemiesInRadius: (centerX: number, centerY: number, radius: number) => Enemy[];
  // Shared damage → death → gem-drop pipeline (owned by GameScene), so every
  // skill that hits an enemy directly (not through a Projectile) uses the
  // exact same resolution as everything else.
  dealDamage: (enemy: Enemy, damage: number) => void;
}

export interface Skill {
  readonly def: SkillDef;
  level: number;
  update(dt: number, ctx: SkillContext): void;
}

// Handles the recarga/disparo cadence shared by every skill: counts down
// using the cooldown from calculateStats (level + mastery + serenidade +
// cultivo already folded in) and calls fire() once it reaches zero.
export abstract class BaseSkill implements Skill {
  private cooldownRemaining = 0;

  constructor(
    public readonly def: SkillDef,
    public level: number,
  ) {}

  update(dt: number, ctx: SkillContext): void {
    this.cooldownRemaining -= dt;
    if (this.cooldownRemaining > 0) return;

    const stats = calculateStats(this.def, this.level, ctx.equippedPassives, ctx.path);
    this.fire(ctx, stats);
    // += (not =) preserves any overshoot from the previous tick instead of
    // resetting the clock, so the cadence doesn't drift over time.
    this.cooldownRemaining += stats.values.cooldown ?? 0;
  }

  protected abstract fire(ctx: SkillContext, stats: CalculatedStats): void;
}
