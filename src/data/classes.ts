import type { PlayerClassDef } from './types';

export const mage: PlayerClassDef = {
  id: 'mage',
  name: 'Mago',
  maxHp: 80,
  speed: 150,
  pickupRadius: 60,
  physicalDefense: 0,
  initialSkillId: 'fire-mark',
};

export const playerClasses: PlayerClassDef[] = [mage];
