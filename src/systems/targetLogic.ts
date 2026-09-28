import type { ViewRect } from './spawnLogic';

export interface PositionedTarget {
  x: number;
  y: number;
  active: boolean;
}

// Auto-aim selects visible targets. The camera rectangle is the rule here;
// nearby off-screen spawns remain alive and can become targets when they enter.
export function findNearestVisibleTarget<T extends PositionedTarget>(
  targets: Iterable<T>,
  originX: number,
  originY: number,
  view: ViewRect,
  excluded?: ReadonlySet<T>,
): T | undefined {
  let nearest: T | undefined;
  let nearestDistanceSquared = Infinity;
  const right = view.x + view.width;
  const bottom = view.y + view.height;

  for (const target of targets) {
    if (
      !target.active ||
      excluded?.has(target) ||
      target.x < view.x ||
      target.x > right ||
      target.y < view.y ||
      target.y > bottom
    ) {
      continue;
    }

    const dx = target.x - originX;
    const dy = target.y - originY;
    const distanceSquared = dx * dx + dy * dy;
    if (distanceSquared < nearestDistanceSquared) {
      nearest = target;
      nearestDistanceSquared = distanceSquared;
    }
  }

  return nearest;
}
