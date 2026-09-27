import Phaser from 'phaser';
import { Pool } from '../core/Pool';
import { SpatialGrid } from '../core/SpatialGrid';
import { XpGem } from '../entities/XpGem';

const GRID_CELL_SIZE = 64;
// spec/plan.md §3.4: "gemas próximas se fundem numa só quando passarem de ~200 na tela".
const MERGE_THRESHOLD = 200;
const MERGE_RADIUS = 20;

export class GemSystem {
  readonly activeGems = new Set<XpGem>();
  readonly grid = new SpatialGrid<XpGem>(GRID_CELL_SIZE);

  private readonly pool: Pool<XpGem>;

  constructor(private readonly scene: Phaser.Scene) {
    this.pool = new Pool<XpGem>(
      () => new XpGem(this.scene),
      (gem) => gem.deactivate(),
    );
  }

  spawn(x: number, y: number, value: number): void {
    const gem = this.pool.acquire();
    gem.spawn(x, y, value);
    this.activeGems.add(gem);
    this.grid.insert(gem, x, y);
    this.mergeIfNeeded();
  }

  update(
    playerX: number,
    playerY: number,
    pickupRadius: number,
    collectRadius: number,
    onCollect: (value: number) => void,
  ): void {
    for (const gem of this.activeGems) {
      this.grid.move(gem, gem.x, gem.y);

      const distance = Phaser.Math.Distance.Between(gem.x, gem.y, playerX, playerY);
      if (distance <= collectRadius) {
        onCollect(gem.value);
        this.release(gem);
        continue;
      }

      if (distance <= pickupRadius) {
        gem.attractTo(playerX, playerY);
      }
    }
  }

  // Merges one close pair per spawn call — enough to gradually bring the
  // count back under the threshold without an expensive full sweep.
  private mergeIfNeeded(): void {
    if (this.activeGems.size <= MERGE_THRESHOLD) return;

    for (const gem of this.activeGems) {
      const neighbor = this.grid.findNearest(gem.x, gem.y, (other) => other !== gem);
      if (!neighbor) continue;

      const distance = Phaser.Math.Distance.Between(gem.x, gem.y, neighbor.x, neighbor.y);
      if (distance <= MERGE_RADIUS) {
        gem.value += neighbor.value;
        this.release(neighbor);
        return;
      }
    }
  }

  private release(gem: XpGem): void {
    this.activeGems.delete(gem);
    this.grid.remove(gem);
    this.pool.release(gem);
  }
}
