export type Element = 'fire' | 'water' | 'earth';

export type Path = 'god' | 'evil';

export type StatusEffect = 'stun' | 'paralyze';

export type Modifier =
  | { type: 'cooldown_mult'; value: number }
  | { type: 'flat_cooldown'; value: number }
  | { type: 'flat_damage'; value: number }
  | { type: 'status_chance'; status: StatusEffect; chance: number; duration: number }
  | { type: 'lifesteal'; chance: number; percentage: number }
  | { type: 'heal_on_hit'; chance: number; value: number; maxPerActivation: number }
  | { type: 'slow_mult'; value: number }
  | { type: 'area_mult'; value: number }
  | { type: 'effect_duration_mult'; value: number }
  | { type: 'range_mult'; value: number }
  | { type: 'element_damage_bonus'; value: number }
  | { type: 'crit_chance'; value: number }
  | { type: 'damage_taken_reduction'; value: number }
  | { type: 'regen_mult'; value: number }
  | { type: 'defense_mult'; value: number }
  | { type: 'periodic_buff'; interval: number; duration: number; damageBonus: number };

export interface CultivationPathBlock {
  description: string;
  modifiers: Modifier[];
}

export interface CultivationBlock {
  god: CultivationPathBlock;
  evil: CultivationPathBlock;
}

export type SkillLevelStats = Record<string, number>;

export type SkillType = 'attack' | 'active';

export interface SkillDef {
  id: string;
  name: string;
  element: Element;
  type: SkillType;
  levels: SkillLevelStats[];
  cultivation: CultivationBlock;
}

export interface PassiveDef {
  id: string;
  name: string;
  levels: SkillLevelStats[];
  cultivation: CultivationBlock;
}

export interface EnemyDef {
  id: string;
  name: string;
  hp: number;
  speed: number;
  contactDamage: number;
  xp: number;
  spawnFromSeconds: number;
}

export interface WaveDef {
  timeSeconds: number;
  spawnIntervalSeconds: number;
  hpMultiplier: number;
  enabledEnemyIds: string[];
}

export interface PlayerClassDef {
  id: string;
  name: string;
  maxHp: number;
  speed: number;
  pickupRadius: number;
  physicalDefense: number;
  initialSkillId: string;
}
