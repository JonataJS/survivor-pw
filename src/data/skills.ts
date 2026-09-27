import type { SkillDef } from './types';

export const fireMark: SkillDef = {
  id: 'fire-mark',
  name: 'Marca do Fogo',
  element: 'fire',
  type: 'attack',
  levels: [
    { damage: 10, cooldown: 1.5, projectiles: 1 },
    { damage: 14, cooldown: 1.5, projectiles: 1 },
    { damage: 16, cooldown: 1.4, projectiles: 2 },
    { damage: 20, cooldown: 1.3, projectiles: 2 },
    { damage: 24, cooldown: 1.2, projectiles: 3 },
  ],
  cultivation: {
    god: {
      description: '30% de chance de roubar vida: cura 20% do dano causado',
      modifiers: [{ type: 'lifesteal', chance: 0.3, percentage: 0.2 }],
    },
    evil: {
      description: '−20% de espera',
      modifiers: [{ type: 'cooldown_mult', value: 0.8 }],
    },
  },
};

export const suddenSpring: SkillDef = {
  id: 'sudden-spring',
  name: 'Fonte Repentina',
  element: 'water',
  type: 'attack',
  levels: [
    { damage: 12, cooldown: 3.0, slowPercentage: 0.4, slowDuration: 2, spouts: 1 },
    { damage: 16, cooldown: 3.0, slowPercentage: 0.4, slowDuration: 2, spouts: 1 },
    { damage: 20, cooldown: 2.9, slowPercentage: 0.4, slowDuration: 2.5, spouts: 2 },
    { damage: 24, cooldown: 2.9, slowPercentage: 0.4, slowDuration: 2.5, spouts: 2 },
    { damage: 30, cooldown: 2.8, slowPercentage: 0.4, slowDuration: 3, spouts: 3 },
  ],
  cultivation: {
    god: {
      description: 'Lentidão sobe de −40% para −70%',
      modifiers: [{ type: 'slow_mult', value: 1.75 }],
    },
    evil: {
      description: '+ dano fixo extra por acerto',
      modifiers: [{ type: 'flat_damage', value: 6 }],
    },
  },
};

export const stoneRain: SkillDef = {
  id: 'stone-rain',
  name: 'Chuva de Pedra',
  element: 'earth',
  type: 'attack',
  levels: [
    { damage: 20, cooldown: 6.0, rocks: 1 },
    { damage: 26, cooldown: 6.0, rocks: 1 },
    { damage: 30, cooldown: 6.0, rocks: 2 },
    { damage: 36, cooldown: 6.0, rocks: 2 },
    { damage: 42, cooldown: 6.0, rocks: 3 },
  ],
  cultivation: {
    god: {
      description: '−20% de espera',
      modifiers: [{ type: 'cooldown_mult', value: 0.8 }],
    },
    evil: {
      description: '20% de chance de atordoar por 2 s',
      modifiers: [{ type: 'status_chance', status: 'stun', chance: 0.2, duration: 2 }],
    },
  },
};

export const phoenixWings: SkillDef = {
  id: 'phoenix-wings',
  name: 'Asas da Fênix',
  element: 'fire',
  type: 'attack',
  levels: [
    { damage: 25, cooldown: 8.0, knockback: 80, range: 300, phoenixCount: 1, width: 80 },
    { damage: 32, cooldown: 8.0, knockback: 90, range: 340, phoenixCount: 1, width: 80 },
    { damage: 38, cooldown: 8.0, knockback: 100, range: 380, phoenixCount: 1, width: 80 },
    { damage: 45, cooldown: 8.0, knockback: 110, range: 420, phoenixCount: 1, width: 80 },
    { damage: 55, cooldown: 8.0, knockback: 130, range: 480, phoenixCount: 2, width: 80 },
  ],
  cultivation: {
    god: {
      description: '−1 s de espera',
      modifiers: [{ type: 'flat_cooldown', value: -1 }],
    },
    evil: {
      description: 'Fênix 50% mais larga (acerta mais inimigos)',
      modifiers: [{ type: 'area_mult', value: 1.5 }],
    },
  },
};

export const flamingStorm: SkillDef = {
  id: 'flaming-storm',
  name: 'Tempestade Flamejante',
  element: 'fire',
  type: 'attack',
  levels: [
    { damage: 8, cooldown: 15.0, radius: 100 },
    { damage: 10, cooldown: 14.5, radius: 110 },
    { damage: 12, cooldown: 14.0, radius: 120 },
    { damage: 14, cooldown: 13.5, radius: 130 },
    { damage: 18, cooldown: 13.0, radius: 150 },
  ],
  cultivation: {
    god: {
      description: '20% de chance por acerto de paralisar por 3 s',
      modifiers: [{ type: 'status_chance', status: 'paralyze', chance: 0.2, duration: 3 }],
    },
    evil: {
      description: '25% de chance por acerto de curar 1 HP (máx. 5 HP por pulso)',
      modifiers: [{ type: 'heal_on_hit', chance: 0.25, value: 1, maxPerActivation: 5 }],
    },
  },
};

export const sandStorm: SkillDef = {
  id: 'sand-storm',
  name: 'Tempestade de Areia',
  element: 'earth',
  type: 'attack',
  levels: [
    { damage: 18, cooldown: 6.0, damageReduction: 0.5, debuffDuration: 3 },
    { damage: 22, cooldown: 5.8, damageReduction: 0.5, debuffDuration: 3 },
    { damage: 26, cooldown: 5.6, damageReduction: 0.5, debuffDuration: 3.5 },
    { damage: 30, cooldown: 5.4, damageReduction: 0.5, debuffDuration: 3.5 },
    { damage: 36, cooldown: 5.0, damageReduction: 0.5, debuffDuration: 4 },
  ],
  cultivation: {
    god: {
      description: 'Efeito de −50% de dano dura 50% mais',
      modifiers: [{ type: 'effect_duration_mult', value: 1.5 }],
    },
    evil: {
      description: '+ dano fixo extra por acerto',
      modifiers: [{ type: 'flat_damage', value: 6 }],
    },
  },
};

export const movingEarth: SkillDef = {
  id: 'moving-earth',
  name: 'Terra Móvel',
  element: 'earth',
  type: 'active',
  levels: [
    { cooldown: 6.0, distance: 180 },
    { cooldown: 5.5, distance: 180 },
    { cooldown: 5.0, distance: 180 },
    { cooldown: 4.5, distance: 180 },
    { cooldown: 4.0, distance: 180 },
  ],
  cultivation: {
    god: {
      description: '−30% de espera',
      modifiers: [{ type: 'cooldown_mult', value: 0.7 }],
    },
    evil: {
      description: 'Dash 50% mais longo',
      modifiers: [{ type: 'range_mult', value: 1.5 }],
    },
  },
};

export const attackSkills: SkillDef[] = [
  fireMark,
  suddenSpring,
  stoneRain,
  phoenixWings,
  flamingStorm,
  sandStorm,
];

export const activeSkills: SkillDef[] = [movingEarth];

export const skills: SkillDef[] = [...attackSkills, ...activeSkills];
