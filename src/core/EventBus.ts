// Minimal typed pub/sub for game → HUD communication (plan.md §"EventBus").
// Deliberately not Phaser.Events.EventEmitter: that class touches `window`
// at import time, which breaks importing it from Vitest's node environment.
export interface GameEvents {
  'hp-changed': [hp: number, maxHp: number];
  'xp-changed': [xp: number, xpToNextLevel: number];
  'level-up': [level: number];
  'cultivation-chosen': [path: 'god' | 'evil'];
  'enemy-killed': [count: number];
  'skill-leveled': [skillId: string, level: number];
}

type Listener<Args extends unknown[]> = (...args: Args) => void;

class EventBusImpl {
  private readonly listeners = new Map<keyof GameEvents, Set<Listener<never>>>();

  on<K extends keyof GameEvents>(event: K, listener: Listener<GameEvents[K]>): void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener as Listener<never>);
  }

  off<K extends keyof GameEvents>(event: K, listener: Listener<GameEvents[K]>): void {
    this.listeners.get(event)?.delete(listener as Listener<never>);
  }

  emit<K extends keyof GameEvents>(event: K, ...args: GameEvents[K]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const listener of set) (listener as Listener<GameEvents[K]>)(...args);
  }
}

export const EventBus = new EventBusImpl();
