import { describe, expect, it } from 'vitest';
import { createRng, randomInt, randomRange, pickOne } from '../src/core/rng';

describe('rng', () => {
  it('is deterministic for the same seed', () => {
    const a = createRng(42);
    const b = createRng(42);

    const sequenceA = Array.from({ length: 10 }, () => a());
    const sequenceB = Array.from({ length: 10 }, () => b());

    expect(sequenceA).toEqual(sequenceB);
  });

  it('produces different sequences for different seeds', () => {
    const a = createRng(1);
    const b = createRng(2);

    const sequenceA = Array.from({ length: 5 }, () => a());
    const sequenceB = Array.from({ length: 5 }, () => b());

    expect(sequenceA).not.toEqual(sequenceB);
  });

  it('stays within [0, 1)', () => {
    const rng = createRng(7);
    for (let i = 0; i < 1000; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('randomRange stays within the given bounds', () => {
    const rng = createRng(123);
    for (let i = 0; i < 1000; i++) {
      const value = randomRange(rng, 10, 20);
      expect(value).toBeGreaterThanOrEqual(10);
      expect(value).toBeLessThan(20);
    }
  });

  it('randomInt is inclusive on both ends', () => {
    const rng = createRng(9);
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) {
      seen.add(randomInt(rng, 1, 3));
    }
    expect([...seen].sort()).toEqual([1, 2, 3]);
  });

  it('pickOne only returns items from the given list', () => {
    const rng = createRng(55);
    const items = ['a', 'b', 'c'];
    for (let i = 0; i < 100; i++) {
      expect(items).toContain(pickOne(rng, items));
    }
  });
});
