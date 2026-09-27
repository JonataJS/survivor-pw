import { describe, expect, it } from 'vitest';
import { Pool } from '../src/core/Pool';

interface Dummy {
  id: number;
  active: boolean;
}

describe('Pool', () => {
  it('creates new items lazily when empty', () => {
    let nextId = 0;
    const pool = new Pool<Dummy>(
      () => ({ id: nextId++, active: true }),
      (item) => (item.active = false),
    );

    const a = pool.acquire();
    const b = pool.acquire();

    expect(a.id).toBe(0);
    expect(b.id).toBe(1);
    expect(pool.activeCount).toBe(2);
  });

  it('pre-fills with the initial size', () => {
    let created = 0;
    const pool = new Pool<Dummy>(
      () => {
        created += 1;
        return { id: created, active: true };
      },
      (item) => (item.active = false),
      3,
    );

    expect(created).toBe(3);
    expect(pool.availableCount).toBe(3);
    expect(pool.activeCount).toBe(0);
  });

  it('reuses released items instead of creating new ones', () => {
    let created = 0;
    const pool = new Pool<Dummy>(
      () => {
        created += 1;
        return { id: created, active: true };
      },
      (item) => (item.active = false),
    );

    const item = pool.acquire();
    pool.release(item);
    const reused = pool.acquire();

    expect(reused).toBe(item);
    expect(created).toBe(1);
  });

  it('resets an item on release', () => {
    const pool = new Pool<Dummy>(
      () => ({ id: 0, active: true }),
      (item) => (item.active = false),
    );

    const item = pool.acquire();
    pool.release(item);

    expect(item.active).toBe(false);
    expect(pool.activeCount).toBe(0);
    expect(pool.availableCount).toBe(1);
  });

  it('releaseAll returns every active item to the pool', () => {
    const pool = new Pool<Dummy>(
      () => ({ id: 0, active: true }),
      (item) => (item.active = false),
    );

    pool.acquire();
    pool.acquire();
    pool.acquire();
    pool.releaseAll();

    expect(pool.activeCount).toBe(0);
    expect(pool.availableCount).toBe(3);
  });

  it('ignores releasing an item that is not active', () => {
    const pool = new Pool<Dummy>(
      () => ({ id: 0, active: true }),
      (item) => (item.active = false),
    );

    const outsider: Dummy = { id: 99, active: true };
    pool.release(outsider);

    expect(pool.activeCount).toBe(0);
    expect(pool.availableCount).toBe(0);
  });
});
