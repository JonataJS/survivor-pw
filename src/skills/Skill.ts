import type { Enemy } from '../entities/Enemy';
import type { Path, SkillDef } from '../data/types';
import {
  calculateStats,
  type CalculatedStats,
  type EquippedPassive,
  type LifestealEffect,
  type StatusChanceEffect,
} from '../systems/CombatSystem';
import type { Rng } from '../core/rng';

// Extra per-hit effects a skill's own cultivo aditivo may carry (crítico,
// roubo de vida, atordoar/paralisar) — resolved centrally at hit-time by
// GameScene's dealDamage, since the roll needs the shared seeded RNG and,
// for lifesteal, direct access to the player.
export interface DamageEffects {
  critChance?: number;
  lifesteal?: LifestealEffect;
  statusChances?: StatusChanceEffect[];
}

export interface SkillContext {
  casterX: number;
  casterY: number;
  // Last non-zero movement direction (unit vector), for skills that fire
  // "na direção do movimento" (Asas da Fênix) instead of at a target.
  facingX: number;
  facingY: number;
  equippedPassives: EquippedPassive[];
  path?: Path;
  findNearestVisibleEnemy: (exclude?: Set<Enemy>) => Enemy | undefined;
  findRandomVisibleEnemy: (exclude?: Set<Enemy>) => Enemy | undefined;
  // Highest-HP enemy within `radius` of the caster — the "inimigo mais
  // forte por perto" target for Tempestade de Areia.
  findStrongestEnemyNearby: (radius: number, exclude?: Set<Enemy>) => Enemy | undefined;
  // All enemies within `halfWidth` of the line from the caster out to
  // `range` along (dirX, dirY) — the "atravessa e acerta todos" hitbox.
  findEnemiesInLine: (dirX: number, dirY: number, range: number, halfWidth: number) => Enemy[];
  // All enemies within `radius` of (centerX, centerY) — area-around-a-point
  // hitbox (Tempestade Flamejante's pulses around the caster).
  findEnemiesInRadius: (centerX: number, centerY: number, radius: number) => Enemy[];
  // Shared damage → death → gem-drop pipeline (owned by GameScene), so every
  // skill that hits an enemy directly (not through a Projectile) uses the
  // exact same resolution as everything else. Returns the final damage
  // actually dealt (post-crítico/buff periódico), for skills that need it
  // (e.g. lifesteal healing based on the resolved amount).
  dealDamage: (enemy: Enemy, damage: number, effects?: DamageEffects, skillId?: string) => number;
  // Serenidade evil / Tempestade Flamejante evil (cura ao acertar) — heals
  // the player directly; skills track their own per-activation caps.
  healPlayer: (amount: number) => void;
  // Shared seeded RNG for aditivo chance rolls (roubo de vida, atordoar,
  // paralisar, cura ao acertar) that live inside a skill's own fire().
  rng: Rng;
}

export interface Skill {
  readonly def: SkillDef;
  level: number;
  update(dt: number, ctx: SkillContext): void;
  // Exposed for the HUD's per-skill cooldown wipe (HudScene reads these
  // every frame instead of listening to an event, same pattern as the
  // dash's dashCooldownRemaining/dashCooldownDuration on Player).
  readonly cooldownRemaining: number;
  readonly cooldownDuration: number;
}

// Handles the recarga/disparo cadence shared by every skill: counts down
// using the cooldown from calculateStats (level + mastery + serenidade +
// cultivo already folded in) and calls fire() once it reaches zero.
export abstract class BaseSkill implements Skill {
  private remainingCooldown = 0;
  private lastCooldownDuration = 0;

  constructor(
    public readonly def: SkillDef,
    public level: number,
  ) {}

  get cooldownRemaining(): number {
    return this.remainingCooldown;
  }

  get cooldownDuration(): number {
    return this.lastCooldownDuration;
  }

  update(dt: number, ctx: SkillContext): void {
    this.remainingCooldown -= dt;
    if (this.remainingCooldown > 0) return;

    const stats = calculateStats(this.def, this.level, ctx.equippedPassives, ctx.path);
    this.fire(ctx, stats);
    this.lastCooldownDuration = stats.values.cooldown ?? 0;
    // += (not =) preserves any overshoot from the previous tick instead of
    // resetting the clock, so the cadence doesn't drift over time.
    this.remainingCooldown += this.lastCooldownDuration;
  }

  protected abstract fire(ctx: SkillContext, stats: CalculatedStats): void;
}
