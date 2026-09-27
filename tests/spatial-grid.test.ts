import { describe, expect, it } from 'vitest';
import { SpatialGrid } from '../src/core/SpatialGrid';

describe('SpatialGrid', () => {
  it('reports the number of populated cells for the debug overlay', () => {
    const grid = new SpatialGrid<string>(64);
    expect(grid.populatedCellCount).toBe(0);

    grid.insert('a', 0, 0);
    grid.insert('b', 5, 5); // same cell as 'a'
    grid.insert('c', 1000, 1000);
    expect(grid.populatedCellCount).toBe(2);

    grid.remove('a');
    grid.remove('b');
    expect(grid.populatedCellCount).toBe(1);
  });

  it('iterates every populated cell with its item count', () => {
    const grid = new SpatialGrid<string>(64);
    grid.insert('a', 0, 0);
    grid.insert('b', 5, 5);
    grid.insert('c', 1000, 1000);

    const seen: Record<string, number> = {};
    grid.forEachPopulatedCell((cx, cy, itemCount) => {
      seen[`${cx},${cy}`] = itemCount;
    });

    expect(seen['0,0']).toBe(2);
    expect(seen['15,15']).toBe(1);
  });

  it('finds neighbors within a radius', () => {
    const grid = new SpatialGrid<string>(64);
    grid.insert('close', 10, 10);
    grid.insert('far', 500, 500);

    const neighbors = grid.queryNeighbors(0, 0, 50);

    expect(neighbors).toContain('close');
    expect(neighbors).not.toContain('far');
  });

  it('finds neighbors spread across multiple cells', () => {
    const grid = new SpatialGrid<string>(64);
    grid.insert('a', 0, 0);
    grid.insert('b', 63, 0);
    grid.insert('c', 64, 0);

    const neighbors = grid.queryNeighbors(32, 0, 40);

    expect(neighbors.sort()).toEqual(['a', 'b', 'c']);
  });

  it('updates the cell an item belongs to when it moves', () => {
    const grid = new SpatialGrid<string>(64);
    grid.insert('item', 10, 10);

    grid.move('item', 1000, 1000);

    expect(grid.queryNeighbors(10, 10, 20)).not.toContain('item');
    expect(grid.queryNeighbors(1000, 1000, 20)).toContain('item');
  });

  it('inserts on move when the item was not tracked yet', () => {
    const grid = new SpatialGrid<string>(64);

    grid.move('item', 5, 5);

    expect(grid.queryNeighbors(0, 0, 20)).toContain('item');
  });

  it('stops tracking a removed item', () => {
    const grid = new SpatialGrid<string>(64);
    grid.insert('item', 10, 10);

    grid.remove('item');

    expect(grid.queryNeighbors(10, 10, 20)).not.toContain('item');
    expect(grid.findNearest(10, 10)).toBeUndefined();
  });

  it('finds the nearest item among several candidates', () => {
    const grid = new SpatialGrid<string>(64);
    grid.insert('near', 20, 0);
    grid.insert('mid', 100, 0);
    grid.insert('farAway', 500, 0);

    expect(grid.findNearest(0, 0)).toBe('near');
  });

  it('finds the nearest item even across a cell boundary', () => {
    const grid = new SpatialGrid<string>(64);
    // 'edge' sits just across the cell boundary from the query point but is
    // still closer than 'sameCell', which shares the query's own cell.
    grid.insert('sameCell', 60, 0);
    grid.insert('edge', 65, 0);

    expect(grid.findNearest(63, 0)).toBe('edge');
  });

  it('respects the predicate when searching for the nearest item', () => {
    const grid = new SpatialGrid<{ id: string; alive: boolean }>(64);
    const dead = { id: 'dead', alive: false };
    const alive = { id: 'alive', alive: true };
    grid.insert(dead, 10, 0);
    grid.insert(alive, 200, 0);

    const nearest = grid.findNearest(0, 0, (item) => item.alive);

    expect(nearest).toBe(alive);
  });

  it('returns undefined when the grid is empty', () => {
    const grid = new SpatialGrid<string>(64);

    expect(grid.findNearest(0, 0)).toBeUndefined();
  });
});
