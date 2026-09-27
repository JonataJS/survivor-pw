import type { PassiveDef } from './types';

const masteryCultivation = () => ({
  god: {
    description: '+25% de dano do elemento',
    modifiers: [{ type: 'element_damage_bonus' as const, value: 0.25 }],
  },
  evil: {
    description: '+5% de chance de crítico',
    modifiers: [{ type: 'crit_chance' as const, value: 0.05 }],
  },
});

export const fireMastery: PassiveDef = {
  id: 'fire-mastery',
  name: 'Maestria de Fogo',
  levels: [
    { elementDamageBonus: 0.1 },
    { elementDamageBonus: 0.2 },
    { elementDamageBonus: 0.3 },
    { elementDamageBonus: 0.4 },
    { elementDamageBonus: 0.5 },
  ],
  cultivation: masteryCultivation(),
};

export const waterMastery: PassiveDef = {
  id: 'water-mastery',
  name: 'Maestria de Água',
  levels: [
    { elementDamageBonus: 0.1 },
    { elementDamageBonus: 0.2 },
    { elementDamageBonus: 0.3 },
    { elementDamageBonus: 0.4 },
    { elementDamageBonus: 0.5 },
  ],
  cultivation: masteryCultivation(),
};

export const earthMastery: PassiveDef = {
  id: 'earth-mastery',
  name: 'Maestria de Terra',
  levels: [
    { elementDamageBonus: 0.1 },
    { elementDamageBonus: 0.2 },
    { elementDamageBonus: 0.3 },
    { elementDamageBonus: 0.4 },
    { elementDamageBonus: 0.5 },
  ],
  cultivation: masteryCultivation(),
};

export const earthShield: PassiveDef = {
  id: 'earth-shield',
  name: 'Escudo de Terra',
  levels: [
    { physicalDefenseBonus: 0.2 },
    { physicalDefenseBonus: 0.4 },
    { physicalDefenseBonus: 0.6 },
    { physicalDefenseBonus: 0.8 },
    { physicalDefenseBonus: 1.0 },
  ],
  cultivation: {
    god: {
      description: '−15% de dano recebido',
      modifiers: [{ type: 'damage_taken_reduction', value: 0.15 }],
    },
    evil: {
      description: 'Bônus de defesa do escudo +150%',
      modifiers: [{ type: 'defense_mult', value: 2.5 }],
    },
  },
};

export const fireShield: PassiveDef = {
  id: 'fire-shield',
  name: 'Escudo de Fogo',
  levels: [
    { regenPerSecond: 0.5 },
    { regenPerSecond: 1.0 },
    { regenPerSecond: 1.5 },
    { regenPerSecond: 2.0 },
    { regenPerSecond: 2.5 },
  ],
  cultivation: {
    god: {
      description: '−15% de dano recebido',
      modifiers: [{ type: 'damage_taken_reduction', value: 0.15 }],
    },
    evil: {
      description: 'Regeneração do escudo ×3',
      modifiers: [{ type: 'regen_mult', value: 3 }],
    },
  },
};

export const serenity: PassiveDef = {
  id: 'serenity',
  name: 'Serenidade',
  levels: [
    { cooldownReduction: 0.06 },
    { cooldownReduction: 0.12 },
    { cooldownReduction: 0.18 },
    { cooldownReduction: 0.24 },
    { cooldownReduction: 0.3 },
  ],
  cultivation: {
    god: {
      description: 'A cada 30 s, +100% de dano por 5 s',
      modifiers: [{ type: 'periodic_buff', interval: 30, duration: 5, damageBonus: 1.0 }],
    },
    evil: {
      description: '−20% de espera adicional',
      modifiers: [{ type: 'cooldown_mult', value: 0.8 }],
    },
  },
};

export const passives: PassiveDef[] = [
  fireMastery,
  waterMastery,
  earthMastery,
  earthShield,
  fireShield,
  serenity,
];
