interface Position {
  x: number;
  y: number;
}

export class SpatialGrid<T> {
  private readonly cells = new Map<string, Set<T>>();
  private readonly positions = new Map<T, Position>();

  // Bounding box (in cell coordinates) covering every item ever inserted.
  // Grows monotonically (never shrinks on remove) so it stays O(1) to keep
  // up to date; it only bounds the findNearest ring search, so a slightly
  // stale box just means a few extra empty rings, never a wrong result.
  private minCx = Infinity;
  private maxCx = -Infinity;
  private minCy = Infinity;
  private maxCy = -Infinity;

  constructor(readonly cellSize = 64) {}

  insert(item: T, x: number, y: number): void {
    this.cellAt(x, y).add(item);
    this.positions.set(item, { x, y });
  }

  move(item: T, x: number, y: number): void {
    const previous = this.positions.get(item);
    if (!previous) {
      this.insert(item, x, y);
      return;
    }

    if (this.cellKey(previous.x, previous.y) !== this.cellKey(x, y)) {
      this.cells.get(this.cellKey(previous.x, previous.y))?.delete(item);
      this.cellAt(x, y).add(item);
    }
    this.positions.set(item, { x, y });
  }

  remove(item: T): void {
    const previous = this.positions.get(item);
    if (!previous) return;
    this.cells.get(this.cellKey(previous.x, previous.y))?.delete(item);
    this.positions.delete(item);
  }

  queryNeighbors(x: number, y: number, radius: number): T[] {
    const result: T[] = [];
    const radiusSq = radius * radius;
    const minCx = Math.floor((x - radius) / this.cellSize);
    const maxCx = Math.floor((x + radius) / this.cellSize);
    const minCy = Math.floor((y - radius) / this.cellSize);
    const maxCy = Math.floor((y + radius) / this.cellSize);

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const cell = this.cells.get(`${cx},${cy}`);
        if (!cell) continue;
        for (const item of cell) {
          const pos = this.positions.get(item);
          if (!pos) continue;
          const dx = pos.x - x;
          const dy = pos.y - y;
          if (dx * dx + dy * dy <= radiusSq) result.push(item);
        }
      }
    }
    return result;
  }

  findNearest(x: number, y: number, predicate?: (item: T) => boolean): T | undefined {
    if (this.positions.size === 0) return undefined;

    const centerCx = Math.floor(x / this.cellSize);
    const centerCy = Math.floor(y / this.cellSize);
    const maxRing =
      Math.max(
        Math.abs(centerCx - this.minCx),
        Math.abs(centerCx - this.maxCx),
        Math.abs(centerCy - this.minCy),
        Math.abs(centerCy - this.maxCy),
      ) + 1;

    const candidates: T[] = [];
    let foundAtRing = -1;

    for (let ring = 0; ring <= maxRing; ring++) {
      for (const key of this.cellKeysAtRing(centerCx, centerCy, ring)) {
        const cell = this.cells.get(key);
        if (!cell) continue;
        for (const item of cell) {
          if (predicate && !predicate(item)) continue;
          candidates.push(item);
        }
      }

      if (candidates.length > 0 && foundAtRing === -1) {
        foundAtRing = ring;
      }
      // one extra ring beyond the first hit, since a closer item can sit
      // in an adjacent cell just across the current ring's boundary.
      if (foundAtRing !== -1 && ring >= foundAtRing + 1) break;
    }

    let nearest: T | undefined;
    let nearestDistSq = Infinity;
    for (const item of candidates) {
      const pos = this.positions.get(item);
      if (!pos) continue;
      const dx = pos.x - x;
      const dy = pos.y - y;
      const distSq = dx * dx + dy * dy;
      if (distSq < nearestDistSq) {
        nearestDistSq = distSq;
        nearest = item;
      }
    }
    return nearest;
  }

  get populatedCellCount(): number {
    let count = 0;
    for (const cell of this.cells.values()) {
      if (cell.size > 0) count += 1;
    }
    return count;
  }

  forEachPopulatedCell(callback: (cx: number, cy: number, itemCount: number) => void): void {
    for (const [key, cell] of this.cells) {
      if (cell.size === 0) continue;
      const [cx, cy] = key.split(',').map(Number);
      callback(cx, cy, cell.size);
    }
  }

  private cellKey(x: number, y: number): string {
    return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
  }

  private cellAt(x: number, y: number): Set<T> {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    this.minCx = Math.min(this.minCx, cx);
    this.maxCx = Math.max(this.maxCx, cx);
    this.minCy = Math.min(this.minCy, cy);
    this.maxCy = Math.max(this.maxCy, cy);

    const key = `${cx},${cy}`;
    let cell = this.cells.get(key);
    if (!cell) {
      cell = new Set();
      this.cells.set(key, cell);
    }
    return cell;
  }

  private cellKeysAtRing(centerCx: number, centerCy: number, ring: number): string[] {
    if (ring === 0) return [`${centerCx},${centerCy}`];

    const keys: string[] = [];
    for (let dx = -ring; dx <= ring; dx++) {
      keys.push(`${centerCx + dx},${centerCy - ring}`);
      keys.push(`${centerCx + dx},${centerCy + ring}`);
    }
    for (let dy = -ring + 1; dy <= ring - 1; dy++) {
      keys.push(`${centerCx - ring},${centerCy + dy}`);
      keys.push(`${centerCx + ring},${centerCy + dy}`);
    }
    return keys;
  }
}
