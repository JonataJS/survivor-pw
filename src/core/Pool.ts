export class Pool<T> {
  private readonly available: T[] = [];
  private readonly active = new Set<T>();

  constructor(
    private readonly factory: () => T,
    private readonly reset: (item: T) => void,
    initialSize = 0,
  ) {
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }
  }

  acquire(): T {
    const item = this.available.pop() ?? this.factory();
    this.active.add(item);
    return item;
  }

  release(item: T): void {
    if (!this.active.has(item)) return;
    this.active.delete(item);
    this.reset(item);
    this.available.push(item);
  }

  releaseAll(): void {
    for (const item of this.active) {
      this.reset(item);
      this.available.push(item);
    }
    this.active.clear();
  }

  get activeCount(): number {
    return this.active.size;
  }

  get availableCount(): number {
    return this.available.length;
  }
}
