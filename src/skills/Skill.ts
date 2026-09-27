import type { Enemy } from '../entities/Enemy';
import type { Path, SkillDef } from '../data/types';
import { calculateStats, type CalculatedStats, type EquippedPassive } from '../systems/CombatSystem';

export interface SkillContext {
  casterX: number;
  casterY: number;
  equippedPassives: EquippedPassive[];
  path?: Path;
  findNearestEnemy: (exclude?: Set<Enemy>) => Enemy | undefined;
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
