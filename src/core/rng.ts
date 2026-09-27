export type Rng = () => number;

// mulberry32: small, fast, deterministic PRNG — good enough for gameplay
// randomness that needs to be reproducible from a seed.
export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomRange(rng: Rng, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function randomInt(rng: Rng, min: number, max: number): number {
  return Math.floor(randomRange(rng, min, max + 1));
}

export function pickOne<T>(rng: Rng, items: readonly T[]): T {
  return items[randomInt(rng, 0, items.length - 1)];
}
