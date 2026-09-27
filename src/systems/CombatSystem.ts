import type {
  Element,
  Modifier,
  Path,
  PassiveDef,
  SkillDef,
  SkillLevelStats,
  StatusEffect,
} from '../data/types';

export const CONTACT_DAMAGE_INTERVAL_SECONDS = 0.5;

export function calculatePhysicalDamage(rawDamage: number, defense: number): number {
  return Math.max(0, rawDamage - defense);
}

// spec.md §5.4: "Crítico: chance base 0%; acerto crítico causa 200% de dano".
const BASE_CRIT_CHANCE = 0;
export const CRIT_MULTIPLIER = 2;

export interface EquippedPassive {
  def: PassiveDef;
  level: number;
}

export interface StatusChanceEffect {
  status: StatusEffect;
  chance: number;
  duration: number;
}

export interface LifestealEffect {
  chance: number;
  percentage: number;
}

export interface HealOnHitEffect {
  chance: number;
  value: number;
  maxPerActivation: number;
}

export interface PeriodicBuffEffect {
  interval: number;
  duration: number;
  damageBonus: number;
}

export interface CalculatedStats {
  // Level stats (damage, cooldown, projectiles, radius, ...) after mastery,
  // serenity and cultivo have been folded in. Does NOT include the periodic
  // buff (Serenidade God) since that's only active part of the time — apply
  // it at hit-time via calculateDamage's periodicBuffActive option instead.
  values: SkillLevelStats;
  critChance: number;
  critMultiplier: number;
  damageTakenReduction: number;
  statusChances: StatusChanceEffect[];
  lifesteal?: LifestealEffect;
  healOnHit?: HealOnHitEffect;
  periodicBuff?: PeriodicBuffEffect;
}

interface ModifierAccumulator {
  flatDamage: number;
  cultivationElementDamageBonus: number;
  critChance: number;
  damageTakenReduction: number;
  cooldownMult: number;
  flatCooldown: number;
  slowMult: number;
  areaMult: number;
  effectDurationMult: number;
  rangeMult: number;
  defenseMult: number;
  regenMult: number;
  statusChances: StatusChanceEffect[];
  lifesteal?: LifestealEffect;
  healOnHit?: HealOnHitEffect;
  periodicBuff?: PeriodicBuffEffect;
}

function createAccumulator(): ModifierAccumulator {
  return {
    flatDamage: 0,
    cultivationElementDamageBonus: 0,
    critChance: BASE_CRIT_CHANCE,
    damageTakenReduction: 0,
    cooldownMult: 1,
    flatCooldown: 0,
    slowMult: 1,
    areaMult: 1,
    effectDurationMult: 1,
    rangeMult: 1,
    defenseMult: 1,
    regenMult: 1,
    statusChances: [],
  };
}

// `sourceElement` is the element of whatever declared these modifiers (the
// skill itself, or an equipped mastery passive). element_damage_bonus only
// applies when it matches the skill currently being calculated.
function accumulateModifiers(
  modifiers: Modifier[],
  currentElement: Element | undefined,
  sourceElement: Element | undefined,
  acc: ModifierAccumulator,
): void {
  for (const modifier of modifiers) {
    switch (modifier.type) {
      case 'flat_damage':
        acc.flatDamage += modifier.value;
        break;
      case 'element_damage_bonus':
        if (sourceElement !== undefined && sourceElement === currentElement) {
          acc.cultivationElementDamageBonus += modifier.value;
        }
        break;
      case 'crit_chance':
        acc.critChance += modifier.value;
        break;
      case 'damage_taken_reduction':
        acc.damageTakenReduction += modifier.value;
        break;
      case 'cooldown_mult':
        acc.cooldownMult *= modifier.value;
        break;
      case 'flat_cooldown':
        acc.flatCooldown += modifier.value;
        break;
      case 'slow_mult':
        acc.slowMult *= modifier.value;
        break;
      case 'area_mult':
        acc.areaMult *= modifier.value;
        break;
      case 'effect_duration_mult':
        acc.effectDurationMult *= modifier.value;
        break;
      case 'range_mult':
        acc.rangeMult *= modifier.value;
        break;
      case 'defense_mult':
        acc.defenseMult *= modifier.value;
        break;
      case 'regen_mult':
        acc.regenMult *= modifier.value;
        break;
      case 'status_chance':
        acc.statusChances.push({
          status: modifier.status,
          chance: modifier.chance,
          duration: modifier.duration,
        });
        break;
      case 'lifesteal':
        acc.lifesteal = { chance: modifier.chance, percentage: modifier.percentage };
        break;
      case 'heal_on_hit':
        acc.healOnHit = {
          chance: modifier.chance,
          value: modifier.value,
          maxPerActivation: modifier.maxPerActivation,
        };
        break;
      case 'periodic_buff':
        acc.periodicBuff = {
          interval: modifier.interval,
          duration: modifier.duration,
          damageBonus: modifier.damageBonus,
        };
        break;
    }
  }
}

// The single source of truth for a skill's or passive's final numbers,
// combining its own level + equipped passives (mastery, serenity) + the
// chosen cultivo path (plan.md §3.2 e §3.3).
export function calculateStats(
  def: SkillDef | PassiveDef,
  level: number,
  equippedPassives: EquippedPassive[] = [],
  path?: Path,
): CalculatedStats {
  const values: SkillLevelStats = { ...def.levels[level - 1] };
  const currentElement = def.element;

  let elementMastery = 0;
  let serenity = 0;
  for (const equipped of equippedPassives) {
    const passiveValues = equipped.def.levels[equipped.level - 1] ?? {};
    if (currentElement !== undefined && equipped.def.element === currentElement) {
      elementMastery += passiveValues.elementDamageBonus ?? 0;
    }
    serenity += passiveValues.cooldownReduction ?? 0;
  }

  const acc = createAccumulator();
  if (path) {
    accumulateModifiers(def.cultivation[path].modifiers, currentElement, currentElement, acc);
    for (const equipped of equippedPassives) {
      accumulateModifiers(
        equipped.def.cultivation[path].modifiers,
        currentElement,
        equipped.def.element,
        acc,
      );
    }
  }

  if (values.damage !== undefined) {
    const baseDamage = values.damage + acc.flatDamage;
    const multiplier = 1 + elementMastery + acc.cultivationElementDamageBonus;
    values.damage = baseDamage * multiplier;
  }
  if (values.cooldown !== undefined) {
    values.cooldown = values.cooldown * (1 - serenity) * acc.cooldownMult + acc.flatCooldown;
  }
  if (values.radius !== undefined) values.radius *= acc.areaMult;
  if (values.width !== undefined) values.width *= acc.areaMult;
  if (values.range !== undefined) values.range *= acc.rangeMult;
  if (values.distance !== undefined) values.distance *= acc.rangeMult;
  if (values.slowPercentage !== undefined) values.slowPercentage *= acc.slowMult;
  if (values.slowDuration !== undefined) values.slowDuration *= acc.effectDurationMult;
  if (values.debuffDuration !== undefined) values.debuffDuration *= acc.effectDurationMult;
  if (values.physicalDefenseBonus !== undefined) values.physicalDefenseBonus *= acc.defenseMult;
  if (values.regenPerSecond !== undefined) values.regenPerSecond *= acc.regenMult;

  return {
    values,
    critChance: acc.critChance,
    critMultiplier: CRIT_MULTIPLIER,
    damageTakenReduction: acc.damageTakenReduction,
    statusChances: acc.statusChances,
    lifesteal: acc.lifesteal,
    healOnHit: acc.healOnHit,
    periodicBuff: acc.periodicBuff,
  };
}

export interface CalculateDamageOptions {
  isCrit?: boolean;
  critMultiplier?: number;
  targetReduction?: number;
  periodicBuffActive?: boolean;
  periodicBuffBonus?: number;
}

// danoFinal = danoBase × multiplicador × buffPeriodico × (crítico ? 2 : 1) × (1 − reduçãoDoAlvo)
// `danoBase × multiplicador` is CalculatedStats.values.damage; the periodic
// buff and crit roll are resolved per hit, at call time.
export function calculateDamage(baseDamage: number, options: CalculateDamageOptions = {}): number {
  const {
    isCrit = false,
    critMultiplier = CRIT_MULTIPLIER,
    targetReduction = 0,
    periodicBuffActive = false,
    periodicBuffBonus = 0,
  } = options;

  const buffMultiplier = periodicBuffActive ? 1 + periodicBuffBonus : 1;
  return baseDamage * buffMultiplier * (isCrit ? critMultiplier : 1) * (1 - targetReduction);
}
