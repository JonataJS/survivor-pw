import { EventBus } from '../core/EventBus';

// spec.md §6: "XP para o próximo nível: 5 + (nível × 10)".
export function xpToNextLevel(level: number): number {
  return 5 + level * 10;
}

// spec.md §5.4/§7: nível em que o Cultivo (God/Evil) abre, antes do
// level-up normal desse mesmo nível.
export const CULTIVATION_LEVEL = 20;

export type LevelUpQueueItem =
  | { kind: 'cultivation-required'; level: number }
  | { kind: 'level-up'; level: number };

// Pura para que a ordem (Cultivo antes do level-up do nível 20) seja
// testável sem depender do EventBus. Cobre "subir vários níveis de uma vez
// passando pelo 20": o Cultivo aparece uma única vez, na posição certa.
export function buildLevelUpQueue(startingLevel: number, levelsGained: number): LevelUpQueueItem[] {
  const queue: LevelUpQueueItem[] = [];
  for (let i = 1; i <= levelsGained; i++) {
    const level = startingLevel + i;
    if (level === CULTIVATION_LEVEL) {
      queue.push({ kind: 'cultivation-required', level });
    }
    queue.push({ kind: 'level-up', level });
  }
  return queue;
}

export interface XpGainResult {
  level: number;
  xp: number;
  levelsGained: number;
}

// Pure so multi-level gains (e.g. a big XP pickup) can be resolved in one
// call instead of re-running the level-up loop imperatively; supports the
// "fila de level-ups" requirement when levelsGained > 1.
export function applyXpGain(level: number, xp: number, amount: number): XpGainResult {
  let newLevel = level;
  let newXp = xp + amount;
  let levelsGained = 0;

  while (newXp >= xpToNextLevel(newLevel)) {
    newXp -= xpToNextLevel(newLevel);
    newLevel += 1;
    levelsGained += 1;
  }

  return { level: newLevel, xp: newXp, levelsGained };
}

export class XpSystem {
  level = 1;
  xp = 0;

  addXp(amount: number): void {
    const result = applyXpGain(this.level, this.xp, amount);
    const startingLevel = this.level;
    this.level = result.level;
    this.xp = result.xp;

    EventBus.emit('xp-changed', this.xp, xpToNextLevel(this.level));
    for (const item of buildLevelUpQueue(startingLevel, result.levelsGained)) {
      EventBus.emit(item.kind, item.level);
    }
  }
}
